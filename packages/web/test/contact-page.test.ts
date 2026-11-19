// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createElement } from "react"
import { afterEach, beforeAll, describe, expect, inject, it, vi } from "vitest"

import { ContactForm } from "../src/components/contact-form"
import { company } from "../src/lib/site"

const baseUrl = inject("baseUrl")
const path = "/contact"

const get = async (from: string) => {
    const response = await fetch(`${baseUrl}${from}`)
    return { status: response.status, body: await response.text() }
}

const countOf = (markup: string, pattern: RegExp): number => (markup.match(pattern) ?? []).length

const readableText = (markup: string): string =>
    markup
        .replace(/<[^>]+>/g, " ")
        .replace(/&#x27;/g, "'")
        .replace(/\s+/g, " ")

const answer = (status: number, body: unknown): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    })

interface Sent {
    readonly name: string
    readonly email: string
    readonly company: string
    readonly message: string
    readonly website: string
    readonly pagePath: string
}

const enquiry = {
    name: "Priya Raman",
    email: "priya@example.com",
    company: "Northgate Media",
    message: "Our player drops frames on 2019 smart televisions during live football.",
}

/** The form, rendered from a .ts file, so the markup is built by hand. */
const theForm = (): void => {
    render(createElement(ContactForm, { pagePath: path }))
}

const fill = (): void => {
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: enquiry.name } })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: enquiry.email } })
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: enquiry.company } })
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: enquiry.message } })
}

const press = (name: string): void => {
    fireEvent.click(screen.getByRole("button", { name }))
}

const valueOf = (field: string): string =>
    (screen.getByLabelText(field) as HTMLInputElement | HTMLTextAreaElement).value

/**
 * The sentence a screen reader reads out for a field, which is also the one
 * drawn next to it. A field with no refusal describes nothing, or describes
 * only its hint.
 */
const refusalBeside = (field: string): string => {
    const input = screen.getByLabelText(field)
    const described = (input.getAttribute("aria-describedby") ?? "")
        .split(" ")
        .filter((id) => id.endsWith("-error"))
    const texts = described.map((id) => document.getElementById(id)?.textContent ?? "")
    return texts.join(" ").trim()
}

const noticeText = (): string => screen.getByRole("alert").textContent ?? ""

const bodyOf = (call: unknown[]): Sent => JSON.parse(String((call[1] as RequestInit).body)) as Sent

// A visitor whose system is breaking has one page to say so. The page has to
// take the enquiry, say it arrived, and take a second one without a reload. A
// refusal that says nothing is a lost client, so every refusal names the field,
// or the hour to wait, or the address to write to instead.
describe("a visitor sends an enquiry and can send another", () => {
    describe("the page", () => {
        let status: number
        let body: string

        beforeAll(async () => {
            ;({ status, body } = await get(path))
        })

        it("answers 200", () => {
            expect(status).toBe(200)
        })

        it("carries one h1, and it is the title on the board", () => {
            expect(countOf(body, /<h1[\s>]/g)).toBe(1)
            expect(body).toMatch(/<h1[^>]*>Tell us what is breaking<\/h1>/)
        })

        it("says what to write", () => {
            expect(readableText(body)).toContain(
                "Write what the system does now, and what it must do instead.",
            )
        })

        it("titles, describes and points its canonical at itself", () => {
            expect(body).toContain("<title>Contact | Atlantic Blue</title>")
            expect(body).toMatch(/<meta name="description" content="[^"]+"/)
            expect(body).toContain(`rel="canonical" href="${company.origin}${path}"`)
        })

        it("offers the address beside the form", () => {
            const main = body.match(/<main[\s\S]*?<\/main>/)?.[0] ?? ""
            expect(main).toContain("Or email us")
            expect(main).toContain(`href="mailto:${company.email}"`)
        })

        it("serves the four fields and the send button", () => {
            for (const field of ["name", "email", "company", "message"]) {
                expect(body, `${field} is not on the page`).toContain(`name="${field}"`)
            }
            expect(body).toContain("Send enquiry")
        })
    })

    describe("every page offers the way to it", () => {
        it.each(["/", "/services", "/work", path])("from the header of %s", async (from) => {
            const { body } = await get(from)
            const header = body.match(/<header[\s\S]*?<\/header>/)?.[0] ?? ""
            expect(header).toContain(`href="${path}"`)
            expect(header).toContain("Contact us")
        })

        it.each(["/", "/services", "/work", path])("from the footer of %s", async (from) => {
            const { body } = await get(from)
            const footer = body.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? ""
            expect(footer).toContain(`href="${path}"`)
            expect(footer).toMatch(/>Contact</)
        })

        it("and the sitemap lists it", async () => {
            const { body } = await get("/sitemap.xml")
            expect(body).toContain(`<loc>${company.origin}${path}</loc>`)
        })
    })

    describe("the form", () => {
        afterEach(() => {
            cleanup()
            vi.unstubAllGlobals()
        })

        it("posts every field once, then says the enquiry arrived", async () => {
            const post = vi.fn().mockResolvedValue(answer(201, { data: { id: "an-id" } }))
            vi.stubGlobal("fetch", post)

            theForm()
            fill()
            press("Send enquiry")

            await screen.findByText("Your enquiry is with us")
            expect(post).toHaveBeenCalledTimes(1)
            expect(post.mock.calls[0]?.[0]).toBe("/api/v1/contact")
            expect(bodyOf(post.mock.calls[0] ?? [])).toEqual({
                ...enquiry,
                website: "",
                pagePath: path,
            })
            expect(screen.getByText(`We reply to ${enquiry.email}.`)).toBeTruthy()
        })

        it("then gives an empty form back when the visitor sends another", async () => {
            vi.stubGlobal("fetch", vi.fn().mockResolvedValue(answer(201, { data: { id: "id" } })))

            theForm()
            fill()
            press("Send enquiry")
            await screen.findByText("Your enquiry is with us")

            press("Send another")

            await screen.findByRole("button", { name: "Send enquiry" })
            for (const field of ["Name", "Email", "Company", "Message"]) {
                expect(valueOf(field), `${field} kept its old value`).toBe("")
            }
        })

        it("draws the sentence for each refused field beside that field", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue(
                    answer(400, {
                        error: {
                            code: "invalid_request",
                            fields: {
                                name: "give a name of 1 to 100 characters",
                                message: "give a message of 10 to 5000 characters",
                            },
                        },
                    }),
                ),
            )

            theForm()
            fill()
            press("Send enquiry")

            await waitFor(() => expect(refusalBeside("Name")).toBe("Write your name."))
            expect(refusalBeside("Message")).toBe("Write at least 10 characters.")
            expect(refusalBeside("Email")).toBe("")
            expect(valueOf("Name")).toBe(enquiry.name)
            expect(valueOf("Message")).toBe(enquiry.message)
        })

        it("draws the email sentence when the address is refused", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue(
                    answer(400, {
                        error: {
                            code: "invalid_request",
                            fields: { email: "give an email address of at most 254 characters" },
                        },
                    }),
                ),
            )

            theForm()
            fill()
            press("Send enquiry")

            await waitFor(() =>
                expect(refusalBeside("Email")).toBe("Write a complete email address."),
            )
        })

        // The board draws no sentence for a field a visitor never fills, and a
        // refusal nobody can see is a form that does nothing when pressed.
        it("reads out the server reason for a field the board does not draw", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue(
                    answer(400, {
                        error: {
                            code: "invalid_request",
                            fields: { pagePath: "give the page path, at most 200 characters" },
                        },
                    }),
                ),
            )

            theForm()
            fill()
            press("Send enquiry")

            await waitFor(() =>
                expect(noticeText()).toContain("give the page path, at most 200 characters"),
            )
        })

        it("says when to try again after too many enquiries", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue(answer(429, { error: { code: "rate_limited" } })),
            )

            theForm()
            fill()
            press("Send enquiry")

            await waitFor(() =>
                expect(noticeText()).toBe(
                    "You sent five enquiries in the last hour. Try again after the hour, " +
                        `or email ${company.email}.`,
                ),
            )
            expect(valueOf("Message")).toBe(enquiry.message)
        })

        it("gives the address to write to when the server breaks", async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn().mockResolvedValue(answer(500, { error: { code: "server_error" } })),
            )

            theForm()
            fill()
            press("Send enquiry")

            await waitFor(() =>
                expect(noticeText()).toBe(
                    `The message did not send. Email ${company.email} and we read it there.`,
                ),
            )
            expect(valueOf("Email")).toBe(enquiry.email)
        })

        it("gives the same address when the request itself fails", async () => {
            vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))

            theForm()
            fill()
            press("Send enquiry")

            await waitFor(() =>
                expect(noticeText()).toBe(
                    `The message did not send. Email ${company.email} and we read it there.`,
                ),
            )
        })

        it("sends nothing on a second press while the first is in flight", async () => {
            let release: (value: Response) => void = () => {}
            const held = new Promise<Response>((resolve) => {
                release = resolve
            })
            const post = vi.fn().mockReturnValue(held)
            vi.stubGlobal("fetch", post)

            theForm()
            fill()
            press("Send enquiry")

            await screen.findByRole("button", { name: "Sending" })
            expect((screen.getByLabelText("Name") as HTMLInputElement).disabled).toBe(true)

            press("Sending")
            expect(post).toHaveBeenCalledTimes(1)

            release(answer(201, { data: { id: "an-id" } }))
            await screen.findByText("Your enquiry is with us")
        })
    })
})
