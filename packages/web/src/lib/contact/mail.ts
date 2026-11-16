import { type SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"

import type { Enquiry } from "./request"

export const subjectOf = (enquiry: Enquiry): string =>
    enquiry.company === undefined
        ? `Enquiry from ${enquiry.name}`
        : `Enquiry from ${enquiry.name} at ${enquiry.company}`

export const bodyOf = (enquiry: Enquiry, id: string): string => {
    const source = Object.entries(enquiry.attribution)
        .map(([field, value]) => `${field}: ${value}`)
        .join("\n")

    return [
        `Name: ${enquiry.name}`,
        `Email: ${enquiry.email}`,
        `Company: ${enquiry.company ?? "none"}`,
        `Page: ${enquiry.pagePath}`,
        "",
        "Message:",
        enquiry.message,
        "",
        "Landing source:",
        source === "" ? "none" : source,
        "",
        `Enquiry id: ${id}`,
        "",
    ].join("\n")
}

export interface Sending {
    readonly client: SESv2Client
    readonly address: string
    readonly enquiry: Enquiry
    readonly id: string
    readonly timeoutMs: number
}

/** The visitor is the reply address, so a reply from the mailbox reaches them. */
export const sendEnquiry = async (sending: Sending): Promise<string | undefined> => {
    const command = new SendEmailCommand({
        FromEmailAddress: `Atlantic Blue website <${sending.address}>`,
        Destination: { ToAddresses: [sending.address] },
        ReplyToAddresses: [sending.enquiry.email],
        Content: {
            Simple: {
                Subject: { Data: subjectOf(sending.enquiry), Charset: "UTF-8" },
                Body: { Text: { Data: bodyOf(sending.enquiry, sending.id), Charset: "UTF-8" } },
            },
        },
    })

    const answer = await sending.client.send(command, {
        abortSignal: AbortSignal.timeout(sending.timeoutMs),
    })
    return answer.MessageId
}
