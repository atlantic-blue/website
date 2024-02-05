import { Context, APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResultV2> => {
    console.log('Event: ', JSON.stringify(event));

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/html",
        },
        body: `Hello world! ${new Date().toISOString()}`,
    }
}
