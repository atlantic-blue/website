import React from "react"
import { Banner } from "../../Icons/banner"

import * as styles from "./Header.scss"

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.headerGrid}>
                <div className={styles.headerGridColumn}>
                    <a href="/" className={styles.headerLogo}>
                        <Banner className={styles.headerLogoIcon} />
                    </a>
                </div>
                <div>

                </div>

                <div>
                </div>
            </div>
        </header>
    )
}

export { Header }
