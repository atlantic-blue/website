import { createHash } from "node:crypto"

import { type DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb"

export const submissionsAnHour = 5

const anHour = 60 * 60

/** The address is hashed with the hour, so the table never holds an address. */
export const limitKey = (address: string, at: Date): string => {
    const hour = at.toISOString().slice(0, 13)
    const print = createHash("sha256").update(`${address}#${hour}`).digest("hex")
    return `contact#${print}`
}

const endOfTheHour = (at: Date): number => Math.floor(at.getTime() / 1000 / anHour + 1) * anHour

export interface Claim {
    readonly client: DynamoDBClient
    readonly table: string
    readonly address: string
    readonly at: Date
    readonly timeoutMs: number
}

/**
 * Raises the count for this address and this hour, and refuses once the count
 * reaches the limit. One conditional write does both, so two requests at the
 * same moment cannot both pass the fifth.
 */
export const claimSubmission = async (claim: Claim): Promise<boolean> => {
    const command = new UpdateItemCommand({
        TableName: claim.table,
        Key: { key: { S: limitKey(claim.address, claim.at) } },
        UpdateExpression: "SET expiresAt = :expiresAt ADD #count :one",
        ConditionExpression: "attribute_not_exists(#count) OR #count < :limit",
        ExpressionAttributeNames: { "#count": "count" },
        ExpressionAttributeValues: {
            ":one": { N: "1" },
            ":limit": { N: String(submissionsAnHour) },
            ":expiresAt": { N: String(endOfTheHour(claim.at) + anHour) },
        },
    })

    try {
        await claim.client.send(command, { abortSignal: AbortSignal.timeout(claim.timeoutMs) })
        return true
    } catch (error) {
        if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
            return false
        }
        throw error
    }
}
