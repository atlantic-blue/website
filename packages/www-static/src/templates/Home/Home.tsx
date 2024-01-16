import React from "react"

import { ResourceStringLanguage } from "../../resourceStrings/types"
import { homeResourceStrings } from "../../resourceStrings/home"
import { Body } from "./Body/Body"

import "../App.module.scss"
import { Page } from "../../components/Page/Page"

interface TemplateHomeProps {
    language: ResourceStringLanguage
}

const TemplateHome: React.FC<TemplateHomeProps> = (props) => {
    const resourceStringsBody = homeResourceStrings[props.language]

    return (
        <Page>
            <Body resourceStrings={resourceStringsBody.home} />
        </Page>
    )
}

export { TemplateHome }
