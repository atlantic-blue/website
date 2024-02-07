import React from "react"

import { ResourceStringLanguage } from "../../resourceStrings/types"
import { resourceStrings } from "../../resourceStrings"
import { Header } from "../../components/Header/Header"
import { Footer } from "../../components/Footer/Footer"
import HelmetBase from "../../components/Helmet/Helmet";

import { Body } from "./Body/Body"

interface PageHomeProps {
    language: ResourceStringLanguage
}

const PageHome: React.FC<PageHomeProps> = (props) => {
    const resourceStringsBody = resourceStrings[props.language]

    return (
        <>
            <HelmetBase>
                <html lang={props.language} />
                <title>Atlantic Blue - Software Development Solutions</title>
            </HelmetBase>

            <Header />
            <Body resourceStrings={resourceStringsBody.home} />
            <Footer />
        </>
    )
}

export { PageHome }
