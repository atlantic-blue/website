import { LambdaFunctionURLEvent, APIGatewayProxyResultV2 } from "aws-lambda";

import render from "./render";

const createBody = async (event: LambdaFunctionURLEvent) => {
    const assets = (await import("../../dist/stats.json")).default
    return render(event, assets)
}

const lambdaHandler = async (
    event: LambdaFunctionURLEvent,
): Promise<APIGatewayProxyResultV2> => {
    try {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html",
            },
            body: await createBody(event),
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

export {
    createBody,
    lambdaHandler as default
}
