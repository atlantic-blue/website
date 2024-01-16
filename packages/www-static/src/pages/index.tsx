import * as React from "react"
import { type PageProps } from "gatsby"

import { TemplateHome } from "../templates/Home/Home"
import { ResourceStringLanguage } from "../resourceStrings/types"

const PageIndex: React.FC<PageProps> = () => {
    return (
        <TemplateHome language={ResourceStringLanguage.ENGLISH} />
    )
}

export default PageIndex
