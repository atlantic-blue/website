import React from "react"
import { Helmet } from "react-helmet";

interface HelmetBaseProps {
    children: React.ReactNode
}

const HelmetBase: React.FC<HelmetBaseProps> = (props) => {
    return (
        <Helmet>
            <html lang="en" />
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <link rel="icon" type="image/x-icon" href="/assets/logo.png" />
            <title>Atlantic Blue - Software Development Solutions</title>
            <meta name="author" content="Atlantic Blue UK" />

            <link rel="canonical" href="https://atlanticblue.solutions" />
            {props.children}
        </Helmet>
    )
}

export default HelmetBase