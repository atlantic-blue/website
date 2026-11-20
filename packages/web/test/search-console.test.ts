import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

// Terraform cannot print its configuration as data without a plan, and a plan needs
// credentials and the build output on disk. So read the source and work out the TXT
// values the apex ends up with, the way enquiry-infrastructure.test.ts reads infra/site.
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
    const header = new RegExp(`^[ \\t]*${keyword}\\b[^\\n]*\\{`, "gm")
    return [...source.matchAll(header)].map((match) =>
        source.slice(match.index, closingBrace(source, match.index) + 1),
    )
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

// What the zone receives depends on the stage and on the two variables, so work the
// expressions out for a given set of them rather than matching the text that holds them.
interface Zone {
    readonly stage: string
    readonly token?: string
    readonly others?: readonly string[]
}

type Value = string | string[]

const asText = (value: Value): string => {
    if (typeof value !== "string") {
        throw new Error(`${value.join(", ")} is a list where one value is needed`)
    }
    return value
}

const asList = (value: Value): string[] => (typeof value === "string" ? [value] : value)

const unquoted = (value: string): string => value.replace(/^"/, "").replace(/"$/, "")

const atTopLevel = (expression: string, operator: string): number => {
    let depth = 0
    let quoted = false
    for (let at = 0; at < expression.length; at += 1) {
        const character = expression[at]
        if (character === '"') {
            quoted = !quoted
        }
        if (quoted) {
            continue
        }
        if (character === "(" || character === "[" || character === "{") {
            depth += 1
        }
        if (character === ")" || character === "]" || character === "}") {
            depth -= 1
        }
        if (depth === 0 && expression.startsWith(operator, at)) {
            return at
        }
    }
    return -1
}

const splitTopLevel = (expression: string): string[] => {
    const parts: string[] = []
    let rest = expression
    for (let comma = atTopLevel(rest, ","); comma !== -1; comma = atTopLevel(rest, ",")) {
        parts.push(rest.slice(0, comma))
        rest = rest.slice(comma + 1)
    }
    parts.push(rest)
    return parts.map((part) => part.trim()).filter((part) => part !== "")
}

const variableDefault = (name: string): string =>
    valueOf(blockOf(read("variables.tf"), `variable "${name}"`), "default")

const named = (reference: string, zone: Zone): Value => {
    if (reference === "var.stage") {
        return zone.stage
    }
    if (reference === "var.search_console_token" && zone.token !== undefined) {
        return zone.token
    }
    if (reference === "var.apex_txt_records" && zone.others !== undefined) {
        return [...zone.others]
    }
    if (reference.startsWith("var.")) {
        return resolve(variableDefault(reference.slice("var.".length)), zone)
    }
    if (reference.startsWith("local.")) {
        return resolve(valueOf(blockOf(read("main.tf"), "locals {"), reference.slice(6)), zone)
    }
    throw new Error(`the test cannot work out ${reference}`)
}

const truth = (expression: string, zone: Zone): boolean => {
    const value = asText(resolve(expression, zone))
    if (value !== "true" && value !== "false") {
        throw new Error(`${expression} is not a condition, it reads ${value}`)
    }
    return value === "true"
}

const resolve = (raw: string, zone: Zone): Value => {
    const expression = raw.trim()

    const question = atTopLevel(expression, "?")
    if (question !== -1) {
        const rest = expression.slice(question + 1)
        const colon = atTopLevel(rest, ":")
        const branch = truth(expression.slice(0, question), zone)
            ? rest.slice(0, colon)
            : rest.slice(colon + 1)
        return resolve(branch, zone)
    }

    const and = atTopLevel(expression, "&&")
    if (and !== -1) {
        return String(
            truth(expression.slice(0, and), zone) && truth(expression.slice(and + 2), zone),
        )
    }

    for (const comparison of ["!=", "=="]) {
        const at = atTopLevel(expression, comparison)
        if (at !== -1) {
            const left = asText(resolve(expression.slice(0, at), zone))
            const right = asText(resolve(expression.slice(at + 2), zone))
            return String(comparison === "==" ? left === right : left !== right)
        }
    }

    if (expression === "true" || expression === "false" || /^[0-9]+$/.test(expression)) {
        return expression
    }

    if (expression.startsWith("concat(")) {
        return splitTopLevel(expression.slice("concat(".length, -1)).flatMap((argument) =>
            asList(resolve(argument, zone)),
        )
    }

    if (expression.startsWith("[")) {
        return splitTopLevel(expression.slice(1, -1)).flatMap((entry) =>
            asList(resolve(entry, zone)),
        )
    }

    const index = /^(.+)\[(\d+)\]$/.exec(expression)
    if (index?.[1] !== undefined && index[2] !== undefined) {
        const entry = asList(resolve(index[1], zone))[Number(index[2])]
        if (entry === undefined) {
            throw new Error(`${expression} reads past the end of the list`)
        }
        return entry
    }

    if (expression.startsWith('"')) {
        return expression
            .slice(1, -1)
            .replaceAll(/\$\{([^}]*)\}/g, (_, reference: string) =>
                asText(resolve(reference, zone)),
            )
    }

    return named(expression, zone)
}

interface RecordSet {
    readonly name: string
    readonly values: string[]
    readonly ttl: string
    readonly replacesWhatItFinds: boolean
}

const txtRecords = (): string[] =>
    blocksOf(read("dns.tf"), "resource").filter(
        (block) =>
            block.startsWith('resource "aws_route53_record"') &&
            has(block, "type") &&
            unquoted(valueOf(block, "type")) === "TXT",
    )

// Route 53 answers for one name with one TXT record set, so the apex either gets one
// record set or it gets nothing.
const apexTxt = (zone: Zone): RecordSet | undefined => {
    const apex = asText(resolve("local.primary_domain", { ...zone, stage: "production" }))
    const sets = txtRecords()
        .filter(
            (block) =>
                !has(block, "count") || asText(resolve(valueOf(block, "count"), zone)) !== "0",
        )
        .filter((block) => asText(resolve(valueOf(block, "name"), zone)) === apex)
        .map((block) => ({
            name: asText(resolve(valueOf(block, "name"), zone)),
            values: asList(resolve(valueOf(block, "records"), zone)),
            ttl: valueOf(block, "ttl"),
            replacesWhatItFinds: has(block, "allow_overwrite"),
        }))
    if (sets.length > 1) {
        throw new Error(`${sets.length} TXT record sets claim ${apex}, and Route 53 keeps one`)
    }
    return sets[0]
}

const token = "google-site-verification=JjU81S68bTtpRhN5k9Tul7L1L19hmhhJEkOH0lRqMs8"

describe("the search console token is published", () => {
    it("reads a configuration that is really there", () => {
        expect(txtRecords().length).toBe(1)
    })

    it("answers atlanticblue.solutions with the token", () => {
        const published = apexTxt({ stage: "production" })
        expect(published?.name).toBe("atlanticblue.solutions")
        expect(published?.values).toEqual([token])
        expect(published?.ttl).toBe("600")
    })

    it("keeps every other TXT value the apex carries", () => {
        const published = apexTxt({ stage: "production", others: ["v=spf1 -all"] })
        expect(published?.values).toEqual([token, "v=spf1 -all"])
    })

    it("answers nothing rather than an empty TXT value when there is no token", () => {
        expect(apexTxt({ stage: "production", token: "" })).toBeUndefined()
    })

    it("leaves the apex alone from a stage that does not own it", () => {
        expect(apexTxt({ stage: "tf" })).toBeUndefined()
        expect(apexTxt({ stage: "staging" })).toBeUndefined()
    })

    it("never replaces a TXT value it does not know about", () => {
        expect(apexTxt({ stage: "production" })?.replacesWhatItFinds).toBe(false)
    })
})
