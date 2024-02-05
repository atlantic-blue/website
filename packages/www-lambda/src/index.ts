import { Context, LambdaFunctionURLEvent, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (
    event: LambdaFunctionURLEvent,
): Promise<APIGatewayProxyResultV2> => {
    try {
        const serverRenderHtml = (await import("./server/render")).default
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html",
            },
            body: await serverRenderHtml(event),
        }
    } catch (error) {
        // Custom error handling for server-side errors
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "text/html",
            },
            body: `<html><body>${error?.toString()}</body></html>`,
        };
    }
}
