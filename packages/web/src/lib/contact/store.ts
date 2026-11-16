import {
    type AttributeValue,
    type DynamoDBClient,
    PutItemCommand,
    UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"

import type { Enquiry } from "./request"

const keptForDays = 730

export type MailStatus = "pending" | "sent" | "failed"

export interface EnquiryRecord {
    readonly id: string
    readonly at: Date
    readonly enquiry: Enquiry
}

const text = (value: string): AttributeValue => ({ S: value })

const item = (kept: EnquiryRecord): Record<string, AttributeValue> => {
    const createdAt = kept.at.toISOString()
    const held: Record<string, AttributeValue> = {
        id: text(kept.id),
        createdAt: text(createdAt),
        updatedAt: text(createdAt),
        name: text(kept.enquiry.name),
        email: text(kept.enquiry.email),
        message: text(kept.enquiry.message),
        pagePath: text(kept.enquiry.pagePath),
        mailStatus: text("pending"),
        expiresAt: {
            N: String(Math.floor(kept.at.getTime() / 1000) + keptForDays * 24 * 60 * 60),
        },
    }
    if (kept.enquiry.company !== undefined) {
        held.company = text(kept.enquiry.company)
    }
    for (const [field, value] of Object.entries(kept.enquiry.attribution)) {
        held[field] = text(value)
    }
    return held
}

export const keepEnquiry = async (
    client: DynamoDBClient,
    table: string,
    kept: EnquiryRecord,
    timeoutMs: number,
): Promise<void> => {
    const command = new PutItemCommand({ TableName: table, Item: item(kept) })
    await client.send(command, { abortSignal: AbortSignal.timeout(timeoutMs) })
}

export const recordMailResult = async (
    client: DynamoDBClient,
    table: string,
    id: string,
    status: MailStatus,
    messageId: string | undefined,
    timeoutMs: number,
): Promise<void> => {
    const values: Record<string, AttributeValue> = {
        ":mailStatus": text(status),
        ":updatedAt": text(new Date().toISOString()),
    }
    let expression = "SET mailStatus = :mailStatus, updatedAt = :updatedAt"
    if (messageId !== undefined) {
        values[":mailMessageId"] = text(messageId)
        expression = `${expression}, mailMessageId = :mailMessageId`
    }

    const command = new UpdateItemCommand({
        TableName: table,
        Key: { id: text(id) },
        UpdateExpression: expression,
        ExpressionAttributeValues: values,
    })
    await client.send(command, { abortSignal: AbortSignal.timeout(timeoutMs) })
}
