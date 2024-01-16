import React from "react"
import { Atlantic } from "../../Icons/atlantic"

import * as styles from "./Footer.module.scss"

const Footer = () => {
    return (
        <div className={styles.footer}>
            <div className={styles.footerGrid}>
                <div className={styles.footerGridColumn}>
                    <a href="/" aria-label="Atlantic Blue Solutions" className={styles.footerLogo}>
                        <Atlantic className={styles.footerLogoIcon} />
                    </a>
                </div>
                <div className={styles.footerCopyright}>
                    © {new Date().getFullYear()} London, UK
                </div>

                <div>
                </div>
            </div>
        </div>
    )
}

export { Footer }
