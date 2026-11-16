export const POST = async (request: Request): Promise<Response> => {
    await request.text()
    return new Response(null, { status: 501 })
}
