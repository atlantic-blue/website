import React from "react"
import { Atlantic } from "../../Icons/atlantic"

import * as styles from "./Footer.scss"

const Footer = () => {
    return (
        <div className={styles.footer}>
            <div className={styles.footerGrid}>
                <div className={styles.footerGridColumn}>
                    <a href="/" className={styles.footerLogo}>
                        <Atlantic className={styles.footerLogoIcon} />
                    </a>
                </div>
                <div className={styles.footerCopyright}>
                    © {new Date().getFullYear()} Atlantic UK
                </div>

                <div>
                </div>
            </div>
        </div>
    )
}

export { Footer }
