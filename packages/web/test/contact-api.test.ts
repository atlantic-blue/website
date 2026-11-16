import { type AttributeValue, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb"
import { SendEmailCommand } from "@aws-sdk/client-sesv2"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { POST } from "../src/app/api/v1/contact/route"

interface SendOptions {
    readonly abortSignal?: AbortSignal
}

const { dynamoSend, sesSend } = vi.hoisted(() => ({
    dynamoSend: vi.fn<(command: unknown, options?: SendOptions) => Promise<unknown>>(),
    sesSend: vi.fn<(command: unknown, options?: SendOptions) => Promise<unknown>>(),
}))

vi.mock("@aws-sdk/client-dynamodb", async (importOriginal) => {
    const real = await importOriginal<typeof import("@aws-sdk/client-dynamodb")>()
    return {
        ...real,
        DynamoDBClient: class {
            readonly send = dynamoSend
        },
    }
})

vi.mock("@aws-sdk/client-sesv2", async (importOriginal) => {
    const real = await importOriginal<typeof import("@aws-sdk/client-sesv2")>()
    return {
        ...real,
        SESv2Client: class {
            readonly send = sesSend
        },
    }
})

const enquiriesTable = "abs-test-enquiries"
const rateLimitsTable = "abs-test-rate-limits"
const mailAddress = "hello@atlanticblue.solutions"

const messageId = "0100019a5f3c0b2e-000000"

/** The address CloudFront appends to X-Forwarded-For, which is the one the limit counts. */
const viewer = "203.0.113.9"

const counts = new Map<string, number>()

const refusedCondition = (): Error => {
    const error = new Error("The conditional request failed")
    error.name = "ConditionalCheckFailedException"
    return error
}

const numberOf = (values: Record<string, AttributeValue> | undefined, name: string): number =>
    Number(values?.[name]?.N ?? "0")

/**
 * The limit the double applies is read from the command, not written here, so a
 * condition the handler stops sending stops being enforced in the test as well.
 */
const answerDynamo = async (command: unknown): Promise<unknown> => {
    if (command instanceof UpdateItemCommand && command.input.TableName === rateLimitsTable) {
        const key = command.input.Key?.key?.S ?? ""
        const limit = numberOf(command.input.ExpressionAttributeValues, ":limit")
        const held = counts.get(key) ?? 0
        if (command.input.ConditionExpression !== undefined && held >= limit) {
            throw refusedCondition()
        }
        counts.set(key, held + numberOf(command.input.ExpressionAttributeValues, ":one"))
        return {}
    }
    return {}
}

const commands = (calls: [unknown, (SendOptions | undefined)?][]): unknown[] =>
    calls.map(([command]) => command)

const puts = (): PutItemCommand[] =>
    commands(dynamoSend.mock.calls).filter(
        (command): command is PutItemCommand => command instanceof PutItemCommand,
    )

const updatesOf = (table: string): UpdateItemCommand[] =>
    commands(dynamoSend.mock.calls).filter(
        (command): command is UpdateItemCommand =>
            command instanceof UpdateItemCommand && command.input.TableName === table,
    )

const mails = (): SendEmailCommand[] =>
    commands(sesSend.mock.calls).filter(
        (command): command is SendEmailCommand => command instanceof SendEmailCommand,
    )

const rateLimitKeys = (): string[] =>
    updatesOf(rateLimitsTable).map((command) => command.input.Key?.key?.S ?? "")

const enquiry = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    message: "We need a streaming platform review before the next season starts.",
    pagePath: "/contact",
}

const post = async (
    body: unknown,
    headers: Record<string, string> = { "x-forwarded-for": viewer },
): Promise<Response> =>
    POST(
        new Request("https://atlanticblue.solutions/api/v1/contact", {
            method: "POST",
            headers: { "content-type": "application/json", ...headers },
            body: JSON.stringify(body),
        }),
    )

interface Envelope {
    readonly data?: { readonly id?: string }
    readonly error?: { readonly code?: string; readonly fields?: Record<string, string> }
    readonly meta?: Record<string, unknown>
}

const bodyOf = async (answer: Response): Promise<Envelope> => (await answer.json()) as Envelope

const textOf = (mail: SendEmailCommand): string =>
    mail.input.Content?.Simple?.Body?.Text?.Data ?? ""

const stored = (put: PutItemCommand, name: string): string | undefined => put.input.Item?.[name]?.S

describe("an enquiry is stored and mailed", () => {
    beforeEach(() => {
        counts.clear()
        dynamoSend.mockReset()
        sesSend.mockReset()
        dynamoSend.mockImplementation(answerDynamo)
        sesSend.mockResolvedValue({ MessageId: messageId })
        vi.stubEnv("ENQUIRIES_TABLE", enquiriesTable)
        vi.stubEnv("RATE_LIMITS_TABLE", rateLimitsTable)
        vi.stubEnv("CONTACT_MAIL_ADDRESS", mailAddress)
    })

    afterEach(() => {
        vi.unstubAllEnvs()
        vi.restoreAllMocks()
    })

    it("keeps the enquiry, mails it to the business, and records the message id", async () => {
        const answer = await post(enquiry)
        const body = await bodyOf(answer)

        expect(answer.status).toBe(201)
        expect(body.meta).toEqual({})
        expect(body.error).toBeUndefined()
        const id = body.data?.id ?? ""
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)

        expect(puts()).toHaveLength(1)
        const put = puts()[0]
        expect(put?.input.TableName).toBe(enquiriesTable)
        expect(stored(put as PutItemCommand, "id")).toBe(id)
        expect(stored(put as PutItemCommand, "name")).toBe(enquiry.name)
        expect(stored(put as PutItemCommand, "email")).toBe(enquiry.email)
        expect(stored(put as PutItemCommand, "company")).toBe(enquiry.company)
        expect(stored(put as PutItemCommand, "message")).toBe(enquiry.message)
        expect(stored(put as PutItemCommand, "pagePath")).toBe(enquiry.pagePath)
        expect(stored(put as PutItemCommand, "mailStatus")).toBe("pending")
        const createdAt = Date.parse(stored(put as PutItemCommand, "createdAt") ?? "")
        expect(Number.isNaN(createdAt)).toBe(false)
        const expiresAt = numberOf(put?.input.Item, "expiresAt")
        expect(expiresAt).toBe(Math.floor(createdAt / 1000) + 730 * 24 * 60 * 60)

        expect(mails()).toHaveLength(1)
        const mail = mails()[0] as SendEmailCommand
        expect(mail.input.FromEmailAddress).toBe(`Atlantic Blue website <${mailAddress}>`)
        expect(mail.input.Destination?.ToAddresses).toEqual([mailAddress])
        expect(mail.input.ReplyToAddresses).toEqual([enquiry.email])
        expect(mail.input.Content?.Simple?.Subject?.Data).toBe(
            `Enquiry from ${enquiry.name} at ${enquiry.company}`,
        )
        const text = textOf(mail)
        expect(text).toContain(enquiry.email)
        expect(text).toContain(enquiry.message)
        expect(text).toContain(enquiry.pagePath)
        expect(text).toContain(id)

        const kept = updatesOf(enquiriesTable)
        expect(kept).toHaveLength(1)
        const update = kept[0] as UpdateItemCommand
        expect(update.input.Key?.id?.S).toBe(id)
        expect(update.input.ExpressionAttributeValues?.[":mailStatus"]?.S).toBe("sent")
        expect(update.input.ExpressionAttributeValues?.[":mailMessageId"]?.S).toBe(messageId)
    })

    it("drops the company from the subject when the visitor sends none", async () => {
        const answer = await post({
            name: enquiry.name,
            email: enquiry.email,
            message: enquiry.message,
            pagePath: enquiry.pagePath,
        })

        expect(answer.status).toBe(201)
        const mail = mails()[0] as SendEmailCommand
        expect(mail.input.Content?.Simple?.Subject?.Data).toBe(`Enquiry from ${enquiry.name}`)
        expect(puts()[0]?.input.Item?.company).toBeUndefined()
    })

    it("keeps the landing source on the record and in the mail", async () => {
        const attribution = {
            utmSource: "google",
            utmMedium: "cpc",
            utmCampaign: "streaming-review",
            gclid: "EAIaIQobChMI",
            referrerHost: "www.google.com",
        }
        const answer = await post({ ...enquiry, attribution })

        expect(answer.status).toBe(201)
        const put = puts()[0] as PutItemCommand
        expect(stored(put, "utmSource")).toBe(attribution.utmSource)
        expect(stored(put, "utmMedium")).toBe(attribution.utmMedium)
        expect(stored(put, "utmCampaign")).toBe(attribution.utmCampaign)
        expect(stored(put, "gclid")).toBe(attribution.gclid)
        expect(stored(put, "referrerHost")).toBe(attribution.referrerHost)
        expect(put.input.Item?.utmTerm).toBeUndefined()
        expect(textOf(mails()[0] as SendEmailCommand)).toContain("google")
    })

    it("gives every call to amazon a deadline", async () => {
        await post(enquiry)

        const calls = [...dynamoSend.mock.calls, ...sesSend.mock.calls]
        // A loop over no call passes, and no call is what a handler that does
        // nothing makes. Count them first.
        expect(calls).toHaveLength(4)
        for (const [, options] of calls) {
            expect(options?.abortSignal).toBeInstanceOf(AbortSignal)
        }
    })

    interface Refusal {
        readonly reason: string
        readonly body: unknown
        readonly field: string
    }

    const refusals: readonly Refusal[] = [
        { reason: "an empty name", body: { ...enquiry, name: "   " }, field: "name" },
        {
            reason: "a name over 100 characters",
            body: { ...enquiry, name: "a".repeat(101) },
            field: "name",
        },
        { reason: "a name that is not a string", body: { ...enquiry, name: 7 }, field: "name" },
        {
            reason: "an address with no at sign",
            body: { ...enquiry, email: "ada.example.com" },
            field: "email",
        },
        {
            reason: "an address over 254 characters",
            body: { ...enquiry, email: `${"a".repeat(250)}@b.co` },
            field: "email",
        },
        {
            reason: "a company over 100 characters",
            body: { ...enquiry, company: "a".repeat(101) },
            field: "company",
        },
        {
            reason: "a message under 10 characters",
            body: { ...enquiry, message: "too short" },
            field: "message",
        },
        {
            reason: "a message over 5000 characters",
            body: { ...enquiry, message: "a".repeat(5001) },
            field: "message",
        },
        {
            reason: "a missing page path",
            body: { ...enquiry, pagePath: undefined },
            field: "pagePath",
        },
        {
            reason: "a page path over 200 characters",
            body: { ...enquiry, pagePath: `/${"a".repeat(200)}` },
            field: "pagePath",
        },
        {
            reason: "a landing source value over its cap",
            body: { ...enquiry, attribution: { utmSource: "a".repeat(101) } },
            field: "attribution.utmSource",
        },
        {
            reason: "a click id over 200 characters",
            body: { ...enquiry, attribution: { gclid: "a".repeat(201) } },
            field: "attribution.gclid",
        },
        {
            reason: "a landing source that is not an object",
            body: { ...enquiry, attribution: "google" },
            field: "attribution",
        },
        {
            reason: "a field the request does not hold",
            body: { ...enquiry, budget: "10000" },
            field: "budget",
        },
    ]

    it.each(refusals)("refuses $reason and names $field", async ({ body, field }) => {
        const answer = await post(body)
        const envelope = await bodyOf(answer)

        expect(answer.status).toBe(400)
        expect(envelope.error?.code).toBe("invalid_request")
        expect(Object.keys(envelope.error?.fields ?? {})).toContain(field)
        expect(envelope.meta).toEqual({})
        expect(puts()).toHaveLength(0)
        expect(mails()).toHaveLength(0)
    })

    it("refuses a body that is not an object", async () => {
        const answer = await post("hello")

        expect(answer.status).toBe(400)
        expect((await bodyOf(answer)).error?.code).toBe("invalid_request")
        expect(puts()).toHaveLength(0)
    })

    it("answers a filled honeypot with 201, and keeps and sends nothing", async () => {
        const answer = await post({ ...enquiry, website: "https://spam.example" })
        const body = await bodyOf(answer)

        expect(answer.status).toBe(201)
        expect(body.data?.id).toBeTruthy()
        expect(dynamoSend).not.toHaveBeenCalled()
        expect(sesSend).not.toHaveBeenCalled()
    })

    it("takes an empty honeypot as a visitor", async () => {
        const answer = await post({ ...enquiry, website: "" })

        expect(answer.status).toBe(201)
        expect(puts()).toHaveLength(1)
    })

    it("refuses the sixth enquiry from one address in one hour", async () => {
        for (let sent = 0; sent < 5; sent += 1) {
            expect((await post(enquiry)).status).toBe(201)
        }

        const answer = await post(enquiry)
        const body = await bodyOf(answer)

        expect(answer.status).toBe(429)
        expect(body.error?.code).toBe("rate_limited")
        expect(body.meta).toEqual({})
        expect(puts()).toHaveLength(5)
        expect(mails()).toHaveLength(5)
    })

    it("counts one viewer once, whatever the client writes in x-forwarded-for", async () => {
        for (let sent = 0; sent < 5; sent += 1) {
            const answer = await post(enquiry, {
                "x-forwarded-for": `198.51.100.${sent}, ${viewer}`,
            })
            expect(answer.status).toBe(201)
        }

        const answer = await post(enquiry, { "x-forwarded-for": `198.51.100.9, ${viewer}` })

        expect(answer.status).toBe(429)
        expect(new Set(rateLimitKeys()).size).toBe(1)
    })

    it("holds no address of a viewer in the key it writes", async () => {
        await post(enquiry)

        expect(rateLimitKeys()[0]).toMatch(/^contact#[0-9a-f]{64}$/)
        expect(rateLimitKeys()[0]).not.toContain(viewer)
    })

    it("counts one viewer once, whatever the client writes in cloudfront-viewer-address", async () => {
        // The origin request policy forwards every viewer header and asks for no
        // header of its own, so a client writes this one as freely as any other.
        for (let sent = 0; sent < 5; sent += 1) {
            const answer = await post(enquiry, {
                "x-forwarded-for": viewer,
                "cloudfront-viewer-address": `192.0.2.${sent}:50354`,
            })
            expect(answer.status).toBe(201)
        }

        const answer = await post(enquiry, {
            "x-forwarded-for": viewer,
            "cloudfront-viewer-address": "192.0.2.9:50354",
        })

        expect(answer.status).toBe(429)
        expect(new Set(rateLimitKeys()).size).toBe(1)
    })

    it("answers 500 and leaves the record failed when the mail does not go", async () => {
        sesSend.mockRejectedValue(new Error("Email address is not verified"))

        const answer = await post(enquiry)
        const body = await bodyOf(answer)

        expect(answer.status).toBe(500)
        expect(body.error?.code).toBe("server_error")
        expect(body.meta).toEqual({})
        expect(puts()).toHaveLength(1)
        const update = updatesOf(enquiriesTable)[0] as UpdateItemCommand
        expect(update.input.ExpressionAttributeValues?.[":mailStatus"]?.S).toBe("failed")
        expect(update.input.ExpressionAttributeValues?.[":mailMessageId"]).toBeUndefined()
    })

    it("counts a submission whose mail failed against the limit", async () => {
        sesSend.mockRejectedValue(new Error("Email address is not verified"))

        for (let sent = 0; sent < 5; sent += 1) {
            expect((await post(enquiry)).status).toBe(500)
        }

        expect((await post(enquiry)).status).toBe(429)
    })

    it("keeps the name, the address and the message out of the log", async () => {
        const written: string[] = []
        vi.spyOn(console, "error").mockImplementation((...parts: unknown[]) => {
            written.push(parts.map((part) => String(part)).join(" "))
        })
        sesSend.mockRejectedValue(new Error("Email address is not verified"))

        await post(enquiry)
        const id = stored(puts()[0] as PutItemCommand, "id") ?? ""
        const log = written.join("\n")

        expect(id).not.toBe("")

        expect(log).toContain(id)
        expect(log).not.toContain(enquiry.name)
        expect(log).not.toContain(enquiry.email)
        expect(log).not.toContain(enquiry.message)
    })
})
