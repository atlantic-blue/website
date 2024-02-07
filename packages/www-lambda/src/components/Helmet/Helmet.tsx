import React from "react"
import { Helmet } from "react-helmet";

interface HelmetBaseProps {
    children: React.ReactNode
}

const HelmetBase: React.FC<HelmetBaseProps> = (props) => {
    return (
        <Helmet>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <link rel="icon" type="image/x-icon" href="/assets/logo.png" />
            <title>Atlantic Blue - Software Development Solutions</title>
            <meta name="author" content="Atlantic UK" />
            <meta name="description"
                content="Atlantic offers tailored software development solutions in London, UK. Our agile methodologies and expert technical support ensure high-quality software solutions for your business needs." />
            <meta name="keywords"
                content="software development, London, UK, tailored solutions, agile methodology, technical support" />

            <link rel="canonical" href="https://atlanticblue.solutions" />
            {props.children}
        </Helmet>
    )
}

export default HelmetBase