export type ErrorCode = "invalid_request" | "rate_limited" | "server_error"

export interface EnquiryError {
    readonly code: ErrorCode
    readonly fields?: Record<string, string>
}

const sent = (status: number, body: Record<string, unknown>): Response =>
    new Response(JSON.stringify({ ...body, meta: {} }), {
        status,
        headers: { "content-type": "application/json" },
    })

export const accepted = (id: string): Response => sent(201, { data: { id } })

export const refused = (status: number, error: EnquiryError): Response => sent(status, { error })
