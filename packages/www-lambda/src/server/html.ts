interface HtmlProps {
    head: string;
    body: string;
    htmlAttributes: string
    bodyAttributes: string
}

const Html = ({
    htmlAttributes,
    bodyAttributes,
    head,
    body,
}: HtmlProps) => {
    return (
        `
        <!DOCTYPE html>
        <html ${htmlAttributes}>

        <head>
            ${head}
        </head>

        <body ${bodyAttributes} id="main">
            ${body}
        </body>

        </html >
    `
    )
}

export {
    Html as default
}
