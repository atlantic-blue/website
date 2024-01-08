import React from "react"

import { ResourceStringLanguage } from "../../ResourceStrings/types"
import { resourceStrings } from "../../ResourceStrings"

import { Body } from "./Body/Body"
import { Header } from "../../Components/Header/Header"
import { Footer } from "../../Components/Footer/Footer"

interface PageHomeProps {
    language: ResourceStringLanguage
}

const PageHome: React.FC<PageHomeProps> = (props) => {
    const resourceStringsBody = resourceStrings[props.language]

    return (
        <>
            <Header></Header>
            <Body resourceStrings={resourceStringsBody.home} />
            <Footer></Footer>
        </>
    )
}

export { PageHome }
