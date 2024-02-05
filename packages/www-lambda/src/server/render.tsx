import React from "react"
import { LambdaFunctionURLEvent } from "aws-lambda";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Helmet } from "react-helmet";

import Html from "./html";
import App from "../app/main";

const render = async (event: LambdaFunctionURLEvent) => {
    const body = renderToString(
        <StaticRouter location={event.rawPath}>
            <App />
        </StaticRouter>
    )

    const helmet = Helmet.renderStatic();

    const head = `
        <meta charset="utf-8">
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
    `

    return Html({
        head,
        body,
        htmlAttributes: helmet.htmlAttributes.toString(),
        bodyAttributes: helmet.bodyAttributes.toString(),
    })
}

export default render
