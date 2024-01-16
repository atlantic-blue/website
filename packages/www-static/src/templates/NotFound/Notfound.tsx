import * as React from "react"
import { Link } from "gatsby"

import { Page } from "../../components/Page/Page"

import * as styles from "./NotFound.module.scss"

const TemplateNotFound: React.FC = () => {
    return (
        <Page >
            <div className={styles.content}>
            <h1 className={styles.title}>Page not found</h1>
            <div>
                <p>
                    Sorry 😔, we couldn’t find what you were looking for.
                    <br />
                    <br />
                    <Link to="/">Go home 🏠 </Link>.
                </p>
            </div>
            </div>
        </Page >
    )
}

export { TemplateNotFound }
