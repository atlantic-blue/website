import { randomUUID } from "node:crypto"

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { SESv2Client } from "@aws-sdk/client-sesv2"

import { accepted, refused } from "@/lib/contact/envelope"
import { sendEnquiry } from "@/lib/contact/mail"
import { claimSubmission } from "@/lib/contact/rate-limit"
import { type Enquiry, readEnquiry } from "@/lib/contact/request"
import { keepEnquiry, recordMailResult } from "@/lib/contact/store"
import { viewerAddress } from "@/lib/contact/viewer"

const storeTimeoutMs = 5_000
const mailTimeoutMs = 10_000

// Amazon Simple Email Service is verified for this domain in us-east-1, and the
// role allows a send in that region only. The tables follow the function.
const mailRegion = "us-east-1"

let store: DynamoDBClient | undefined
let mailer: SESv2Client | undefined

const theStore = (): DynamoDBClient => (store ??= new DynamoDBClient({}))
const theMailer = (): SESv2Client => (mailer ??= new SESv2Client({ region: mailRegion }))

const required = (name: string): string => {
    const value = process.env[name]
    if (value === undefined || value === "") {
        throw new Error(`${name} is not set`)
    }
    return value
}

const readBody = async (request: Request): Promise<unknown> => {
    try {
        return await request.json()
    } catch {
        return undefined
    }
}

export const POST = async (request: Request): Promise<Response> => {
    const id = randomUUID()

    try {
        const reading = readEnquiry(await readBody(request))
        if ("reasons" in reading) {
            return refused(400, { code: "invalid_request", fields: reading.reasons })
        }

        // A bot that filled the hidden field learns nothing from the answer.
        if (reading.enquiry.honeypot) {
            return accepted(id)
        }

        const at = new Date()
        const claimed = await claimSubmission({
            client: theStore(),
            table: required("RATE_LIMITS_TABLE"),
            address: viewerAddress(request.headers),
            at,
            timeoutMs: storeTimeoutMs,
        })
        if (!claimed) {
            return refused(429, { code: "rate_limited" })
        }

        const enquiries = required("ENQUIRIES_TABLE")
        await keepEnquiry(
            theStore(),
            enquiries,
            { id, at, enquiry: reading.enquiry },
            storeTimeoutMs,
        )

        return await mail(id, enquiries, reading.enquiry)
    } catch (error) {
        report("contact_failed", id, error)
        return refused(500, { code: "server_error" })
    }
}

const mail = async (id: string, enquiries: string, enquiry: Enquiry): Promise<Response> => {
    const address = required("CONTACT_MAIL_ADDRESS")

    let messageId: string | undefined
    try {
        messageId = await sendEnquiry({
            client: theMailer(),
            address,
            enquiry,
            id,
            timeoutMs: mailTimeoutMs,
        })
    } catch (error) {
        report("mail_failed", id, error)
        await recordMailResult(theStore(), enquiries, id, "failed", undefined, storeTimeoutMs)
        return refused(500, { code: "server_error" })
    }

    try {
        await recordMailResult(theStore(), enquiries, id, "sent", messageId, storeTimeoutMs)
    } catch (error) {
        // The mail is in the mailbox, so a visitor told to try again would send it
        // twice. The record stays pending and the log carries the id.
        report("mail_status_not_recorded", id, error)
    }
    return accepted(id)
}

/** The name of the fault and the id only. A log line never holds what a visitor wrote. */
const report = (code: string, id: string, error: unknown): void => {
    const kind = error instanceof Error ? error.name : "unknown"
    console.error(`contact: ${code} id=${id} error=${kind}`)
}
