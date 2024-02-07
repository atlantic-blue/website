import { LambdaFunctionURLEvent, APIGatewayProxyResultV2 } from "aws-lambda";

const handler = async (
    event: LambdaFunctionURLEvent,
): Promise<APIGatewayProxyResultV2> => {
    const lambdaHandler = (await import("./server/lambdaHandler")).default
    try {
        return lambdaHandler(event)
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

export {
    handler,
}
