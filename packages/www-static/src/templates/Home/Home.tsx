import React from "react"

import { Header } from "../../components/Header/Header"
import { Footer } from "../../components/Footer/Footer"
import { ResourceStringLanguage } from "../../resourceStrings/types"
import { resourceStrings } from "../../resourceStrings/home"
import { Body } from "./Body/Body"

import "../App.module.scss"

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
