import React from "react"
import { Helmet } from "react-helmet";

import { ResourceStringLanguage } from "../../resourceStrings/types"
import { resourceStrings } from "../../resourceStrings"

import { Body } from "./Body/Body"
import { Header } from "../../components/Header/Header"
import { Footer } from "../../components/Footer/Footer"

interface PageHomeProps {
    language: ResourceStringLanguage
}

const PageHome: React.FC<PageHomeProps> = (props) => {
    const resourceStringsBody = resourceStrings[props.language]

    return (
        <>
            <Helmet>
                <html lang={props.language} />
                <title>Atlantic Blue - Software Development Solutions</title>
            </Helmet>

            <Header></Header>
            <Body resourceStrings={resourceStringsBody.home} />
            <Footer></Footer>
        </>
    )
}

export { PageHome }
