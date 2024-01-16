import * as React from "react"
import { HeadFC, PageProps } from "gatsby"

import { TemplateNotFound } from "../../templates/NotFound/Notfound"

const PageNotFound: React.FC<PageProps> = () => {
    return (
        <TemplateNotFound />
    )
}

export default PageNotFound

export const Head: HeadFC = () => <title>Not found</title>
