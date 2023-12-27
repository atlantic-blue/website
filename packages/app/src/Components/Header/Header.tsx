import React from "react"
import { Atlantic } from "../../Icons/atlantic"

import * as styles from "./Header.scss"

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.headerGrid}>
                <div className={styles.headerGridColumn}>
                    <a href="/" aria-label="Atlantic Blue Solutions" className={styles.headerLogo}>
                        <Atlantic className={styles.headerLogoIcon} />
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
