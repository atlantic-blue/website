"use client"

import { type FormEvent, useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { company } from "@/lib/site"

export interface ContactFormProps {
    readonly pagePath: string
}

interface Values {
    readonly name: string
    readonly email: string
    readonly company: string
    readonly message: string
    readonly website: string
}

const blank: Values = { name: "", email: "", company: "", message: "", website: "" }

type Status = "empty" | "sending" | "sent"

// docs/design/contact.html draws one sentence for each field a visitor fills.
// A refusal that names any other field has no sentence on the board, so it
// reaches the notice with the words the server sent.
const sentences: Record<string, string> = {
    name: "Write your name.",
    email: "Write a complete email address.",
    message: "Write at least 10 characters.",
}

type Notice =
    | { readonly kind: "none" }
    | { readonly kind: "mail"; readonly before: string; readonly after: string }
    | { readonly kind: "reasons"; readonly reasons: readonly string[] }

const quiet: Notice = { kind: "none" }

const rateLimited: Notice = {
    kind: "mail",
    before: "You sent five enquiries in the last hour. Try again after the hour, or email ",
    after: ".",
}

const brokenServer: Notice = {
    kind: "mail",
    before: "The message did not send. Email ",
    after: " and we read it there.",
}

interface Refusal {
    readonly error?: { readonly fields?: Record<string, string> }
}

const fieldsOf = async (answer: Response): Promise<Record<string, string>> => {
    try {
        const body = (await answer.json()) as Refusal
        return body.error?.fields ?? {}
    } catch {
        return {}
    }
}

const label = "font-mono text-xs uppercase tracking-[0.12em] text-dim"
const box =
    "w-full min-h-11 border border-line bg-surface px-3 py-2.5 text-ink " +
    "focus:outline focus:outline-2 focus:outline-accent focus:outline-offset-2 " +
    "disabled:text-dim"
const wrongBox = "border-accent"
const anchor = "text-accent underline decoration-line underline-offset-4 hover:decoration-accent"

export const ContactForm = ({ pagePath }: ContactFormProps) => {
    const group = useId()
    const [values, setValues] = useState<Values>(blank)
    const [status, setStatus] = useState<Status>("empty")
    const [wrong, setWrong] = useState<Record<string, string>>({})
    const [notice, setNotice] = useState<Notice>(quiet)
    const [sentTo, setSentTo] = useState("")

    const write = (field: keyof Values, text: string): void =>
        setValues((held) => ({ ...held, [field]: text }))

    const refuse = async (answer: Response): Promise<void> => {
        const reasons = await fieldsOf(answer)
        const drawn: Record<string, string> = {}
        const rest: string[] = []
        for (const [field, reason] of Object.entries(reasons)) {
            const sentence = sentences[field]
            if (sentence === undefined) {
                rest.push(reason)
                continue
            }
            drawn[field] = sentence
        }
        setWrong(drawn)
        setNotice(rest.length > 0 ? { kind: "reasons", reasons: rest } : quiet)
    }

    const send = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        if (status === "sending") {
            return
        }

        setStatus("sending")
        setWrong({})
        setNotice(quiet)

        let answer: Response
        try {
            answer = await fetch("/api/v1/contact", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ ...values, pagePath }),
            })
        } catch {
            setStatus("empty")
            setNotice(brokenServer)
            return
        }

        if (answer.status === 201) {
            setSentTo(values.email)
            setStatus("sent")
            return
        }

        setStatus("empty")
        if (answer.status === 400) {
            await refuse(answer)
            return
        }
        setNotice(answer.status === 429 ? rateLimited : brokenServer)
    }

    if (status === "sent") {
        return (
            <div className="border border-line bg-surface p-6">
                <p className={label}>Sent</p>
                <h2 className="mt-4 text-[clamp(1.5rem,4.5vw,2.4rem)] leading-[1.12] tracking-[-0.02em]">
                    Your enquiry is with us
                </h2>
                <p className="mt-4 text-dim">We reply to {sentTo}.</p>
                <div className="mt-6">
                    <Button
                        type="button"
                        variant="quiet"
                        onClick={() => {
                            setValues(blank)
                            setSentTo("")
                            setStatus("empty")
                        }}
                    >
                        Send another
                    </Button>
                </div>
            </div>
        )
    }

    const waiting = status === "sending"

    return (
        <form onSubmit={send} noValidate={false}>
            {notice.kind !== "none" && (
                <div
                    role="alert"
                    className="mb-6 border border-line border-l-2 border-l-accent p-4"
                >
                    {notice.kind === "mail" ? (
                        <p className="text-[0.9375rem] text-ink">
                            {notice.before}
                            <a href={`mailto:${company.email}`} className={anchor}>
                                {company.email}
                            </a>
                            {notice.after}
                        </p>
                    ) : (
                        notice.reasons.map((reason) => (
                            <p key={reason} className="text-[0.9375rem] text-ink">
                                {reason}
                            </p>
                        ))
                    )}
                </div>
            )}

            <div className="mt-6 flex flex-col gap-2 first:mt-0">
                <label className={label} htmlFor={`${group}-name`}>
                    Name
                </label>
                <input
                    id={`${group}-name`}
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                    disabled={waiting}
                    value={values.name}
                    onChange={(event) => write("name", event.target.value)}
                    aria-invalid={wrong.name !== undefined}
                    aria-describedby={wrong.name === undefined ? undefined : `${group}-name-error`}
                    className={`${box} ${wrong.name === undefined ? "" : wrongBox}`}
                />
                {wrong.name !== undefined && (
                    <p id={`${group}-name-error`} className="text-sm text-ink">
                        {wrong.name}
                    </p>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <label className={label} htmlFor={`${group}-email`}>
                    Email
                </label>
                <input
                    id={`${group}-email`}
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    disabled={waiting}
                    value={values.email}
                    onChange={(event) => write("email", event.target.value)}
                    aria-invalid={wrong.email !== undefined}
                    aria-describedby={
                        wrong.email === undefined ? undefined : `${group}-email-error`
                    }
                    className={`${box} ${wrong.email === undefined ? "" : wrongBox}`}
                />
                {wrong.email !== undefined && (
                    <p id={`${group}-email-error`} className="text-sm text-ink">
                        {wrong.email}
                    </p>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <label className={label} htmlFor={`${group}-company`}>
                    Company
                </label>
                <input
                    id={`${group}-company`}
                    name="company"
                    maxLength={100}
                    autoComplete="organization"
                    disabled={waiting}
                    value={values.company}
                    onChange={(event) => write("company", event.target.value)}
                    aria-describedby={`${group}-company-hint`}
                    className={box}
                />
                <p id={`${group}-company-hint`} className="text-sm text-dim">
                    Optional
                </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <label className={label} htmlFor={`${group}-message`}>
                    Message
                </label>
                <textarea
                    id={`${group}-message`}
                    name="message"
                    rows={6}
                    required
                    minLength={10}
                    maxLength={5000}
                    disabled={waiting}
                    value={values.message}
                    onChange={(event) => write("message", event.target.value)}
                    aria-invalid={wrong.message !== undefined}
                    aria-describedby={
                        wrong.message === undefined ? undefined : `${group}-message-error`
                    }
                    className={`${box} min-h-42 resize-none ${wrong.message === undefined ? "" : wrongBox}`}
                />
                {wrong.message !== undefined && (
                    <p id={`${group}-message-error`} className="text-sm text-ink">
                        {wrong.message}
                    </p>
                )}
            </div>

            {/* A bot fills every field it is given. A visitor never sees this one,
                and the server accepts and discards an enquiry that carries it. */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor={`${group}-website`}>Website</label>
                <input
                    id={`${group}-website`}
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.website}
                    onChange={(event) => write("website", event.target.value)}
                />
            </div>

            <div className="mt-6">
                <Button type="submit" disabled={waiting} className={waiting ? "opacity-60" : ""}>
                    {waiting ? "Sending" : "Send enquiry"}
                </Button>
            </div>
        </form>
    )
}
