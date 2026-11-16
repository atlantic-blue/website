import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

// Terraform cannot print its configuration as data without a plan, and a plan needs
// credentials and the build output on disk. So read the source, the way
// public-routing.test.ts reads the CloudFront patterns.
//
// Every read below happens inside a test. A file read while the module loads stops the
// file from collecting, and a suite that collects nothing reports no failure at all.
const read = (file: string): string => {
    const path = fileURLToPath(new URL(`../../../infra/site/${file}`, import.meta.url))
    const source = readFileSync(path, "utf8")
    if (source.trim() === "") {
        throw new Error(`${path} is empty, so nothing below was checked`)
    }
    return source
}

const closingBrace = (source: string, from: number): number => {
    let depth = 0
    for (let at = from; at < source.length; at += 1) {
        if (source[at] === "{") {
            depth += 1
        }
        if (source[at] === "}") {
            depth -= 1
            if (depth === 0) {
                return at
            }
        }
    }
    throw new Error(`${source.slice(from, from + 60)} is never closed`)
}

const blockOf = (source: string, header: string): string => {
    const start = source.indexOf(header)
    if (start === -1) {
        throw new Error(`the configuration holds no ${header}`)
    }
    return source.slice(start, closingBrace(source, start) + 1)
}

const blocksOf = (source: string, keyword: string): string[] => {
    const found: string[] = []
    const header = `${keyword} {`
    let at = source.indexOf(header)
    while (at !== -1) {
        const end = closingBrace(source, at)
        found.push(source.slice(at, end + 1))
        at = source.indexOf(header, end)
    }
    return found
}

const settingsOf = (block: string): string[] => {
    const body = block.slice(block.indexOf("{") + 1, block.lastIndexOf("}"))
    const lines: string[] = []
    let depth = 0
    for (const line of body.split("\n")) {
        if (depth === 0) {
            lines.push(line)
        }
        depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
    }
    return lines
}

const valueOf = (block: string, name: string): string => {
    const line = settingsOf(block).find((candidate) =>
        new RegExp(`^\\s*${name}\\s*=`).test(candidate),
    )
    if (line === undefined) {
        throw new Error(`no ${name} in ${block.slice(0, 60)}`)
    }
    return line.slice(line.indexOf("=") + 1).trim()
}

const has = (block: string, name: string): boolean =>
    settingsOf(block).some((candidate) => new RegExp(`^\\s*${name}\\s*=`).test(candidate))

const listOf = (block: string, name: string): string[] => {
    const list = new RegExp(`${name}\\s*=\\s*\\[([^\\]]*)\\]`, "s").exec(block)?.[1]
    if (list === undefined) {
        throw new Error(`no ${name} list in ${block.slice(0, 60)}`)
    }
    return list
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry !== "")
}

const unquoted = (value: string): string => value.replace(/^"/, "").replace(/"$/, "")

// Every name in the configuration is built from the stage and the root domain, so read
// those two the way Terraform does and work out what each name becomes.
const forStage = (value: string, stage: string): string =>
    unquoted(value)
        .replaceAll(
            "${local.prefix}",
            unquoted(valueOf(blockOf(read("main.tf"), "locals {"), "prefix")),
        )
        .replaceAll("${var.stage}", stage)
        .replaceAll(
            "${var.root_domain}",
            unquoted(valueOf(blockOf(read("variables.tf"), 'variable "root_domain"'), "default")),
        )
        .replaceAll("${data.aws_caller_identity.current.account_id}", "<account>")

const tableOf = (name: string): string =>
    blockOf(read("dynamodb.tf"), `resource "aws_dynamodb_table" "${name}"`)

const keyTypeOf = (table: string, key: string): string =>
    unquoted(
        valueOf(
            blocksOf(table, "attribute").filter(
                (attribute) => unquoted(valueOf(attribute, "name")) === key,
            )[0] ?? "",
            "type",
        ),
    )

const serverFunction = (): string =>
    blockOf(read("lambda.tf"), 'resource "aws_lambda_function" "server"')

const imageFunction = (): string =>
    blockOf(read("lambda.tf"), 'resource "aws_lambda_function" "image"')

const serverGrants = (): string =>
    blockOf(read("lambda.tf"), 'data "aws_iam_policy_document" "server"')

const imageGrants = (): string =>
    blockOf(read("lambda.tf"), 'data "aws_iam_policy_document" "lambda"')

const environmentOf = (fn: string): Map<string, string> =>
    new Map(
        settingsOf(blockOf(fn, "variables = {"))
            .filter((line) => line.includes("="))
            .map((line) => [
                line.slice(0, line.indexOf("=")).trim(),
                line.slice(line.indexOf("=") + 1).trim(),
            ]),
    )

const statementFor = (grants: string, action: string): string => {
    const found = blocksOf(grants, "statement").filter((statement) =>
        listOf(statement, "actions").some((allowed) => unquoted(allowed) === action),
    )
    if (found[0] === undefined) {
        throw new Error(`nothing allows ${action}`)
    }
    return found[0]
}

describe("the enquiry tables exist with their keys and time to live", () => {
    it("checks a configuration that was actually read", () => {
        expect(blocksOf(read("dynamodb.tf"), "resource").length).toBe(2)
        expect(blocksOf(serverGrants(), "statement").length).toBe(4)
    })

    it("keeps each enquiry under its own id, and each stage in its own table", () => {
        const enquiries = tableOf("enquiries")
        expect(forStage(valueOf(enquiries, "name"), "production")).toBe("abs-production-enquiries")
        expect(forStage(valueOf(enquiries, "name"), "staging")).toBe("abs-staging-enquiries")
        expect(unquoted(valueOf(enquiries, "hash_key"))).toBe("id")
        expect(keyTypeOf(enquiries, "id")).toBe("S")
        expect(has(enquiries, "range_key")).toBe(false)
    })

    it("counts the enquiries from one address under one key", () => {
        const rateLimits = tableOf("rate_limits")
        expect(forStage(valueOf(rateLimits, "name"), "production")).toBe(
            "abs-production-rate-limits",
        )
        expect(unquoted(valueOf(rateLimits, "hash_key"))).toBe("key")
        expect(keyTypeOf(rateLimits, "key")).toBe("S")
    })

    it("charges for the enquiries it takes and for nothing while the site is quiet", () => {
        expect(unquoted(valueOf(tableOf("enquiries"), "billing_mode"))).toBe("PAY_PER_REQUEST")
        expect(unquoted(valueOf(tableOf("rate_limits"), "billing_mode"))).toBe("PAY_PER_REQUEST")
    })

    it("deletes an enquiry and a counter when their own time comes", () => {
        for (const table of [tableOf("enquiries"), tableOf("rate_limits")]) {
            const ttl = blockOf(table, "ttl {")
            expect(unquoted(valueOf(ttl, "attribute_name"))).toBe("expiresAt")
            expect(valueOf(ttl, "enabled")).toBe("true")
        }
    })

    it("can bring the enquiries back to an earlier moment", () => {
        const recovery = blockOf(tableOf("enquiries"), "point_in_time_recovery {")
        expect(valueOf(recovery, "enabled")).toBe("true")
    })

    it("tells the server function where to keep an enquiry and where to send it", () => {
        const environment = environmentOf(serverFunction())
        expect(environment.get("ENQUIRIES_TABLE")).toBe("aws_dynamodb_table.enquiries.name")
        expect(environment.get("RATE_LIMITS_TABLE")).toBe("aws_dynamodb_table.rate_limits.name")
        expect(unquoted(environment.get("CONTACT_MAIL_ADDRESS") ?? "")).toBe(
            "hello@atlanticblue.solutions",
        )
    })

    it("gives the grants to the role the server function runs as", () => {
        expect(valueOf(serverFunction(), "role")).toBe("aws_iam_role.server.arn")

        const attachment = blockOf(read("lambda.tf"), 'resource "aws_iam_role_policy" "server"')
        expect(valueOf(attachment, "role")).toBe("aws_iam_role.server.id")
        expect(valueOf(attachment, "policy")).toBe("data.aws_iam_policy_document.server.json")

        const role = blockOf(read("lambda.tf"), 'resource "aws_iam_role" "server"')
        expect(forStage(valueOf(role, "name"), "production")).toBe("abs-production-server")
    })

    it("lets the server function write an enquiry and change a counter, and nothing else", () => {
        const statement = statementFor(serverGrants(), "dynamodb:PutItem")
        expect(listOf(statement, "actions").map(unquoted)).toEqual([
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
        ])
        expect(listOf(statement, "resources")).toEqual([
            "aws_dynamodb_table.enquiries.arn",
            "aws_dynamodb_table.rate_limits.arn",
        ])

        const tables = [...serverGrants().matchAll(/aws_dynamodb_table\.(\w+)\./g)].map(
            (reference) => reference[1],
        )
        expect([...new Set(tables)].sort()).toEqual(["enquiries", "rate_limits"])
    })

    it("lets the server function send mail from the site address and from no other", () => {
        const statement = statementFor(serverGrants(), "ses:SendEmail")
        expect(listOf(statement, "actions").map(unquoted)).toEqual(["ses:SendEmail"])
        expect(
            listOf(statement, "resources").map((value) => forStage(value, "production")),
        ).toEqual(["arn:aws:ses:us-east-1:<account>:identity/atlanticblue.solutions"])
    })

    it("leaves the server function able to log and to reach its cache", () => {
        expect(() => statementFor(serverGrants(), "logs:PutLogEvents")).not.toThrow()

        const bucket = statementFor(serverGrants(), "s3:PutObject")
        expect(listOf(bucket, "resources")[0]).toBe("aws_s3_bucket.assets.arn")
    })

    it("lets the image function send no mail and write no enquiry", () => {
        expect(valueOf(imageFunction(), "role")).toBe("aws_iam_role.lambda.arn")
        expect(imageGrants()).not.toMatch(/dynamodb/)
        expect(imageGrants()).not.toMatch(/ses:/)
        expect(imageGrants()).not.toMatch(/:identity\//)
    })
})
