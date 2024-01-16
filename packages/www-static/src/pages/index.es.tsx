import * as React from "react"
import type { PageProps } from "gatsby"

import { PageHome } from "../templates/Home/Home"
import { ResourceStringLanguage } from "../resourceStrings/types"

const IndexPage: React.FC<PageProps> = () => {
    return (
        <PageHome language={ResourceStringLanguage.SPANISH} />
    )
}

export default IndexPage
