import React from "react"
import { Atlantic } from "../../Icons/atlantic"
import { useNavigate } from "react-router-dom";

import * as styles from "./Header.scss"
import { Dropdown } from "../Dropdown/Dropdown"
import { ResourceStringLanguage } from "../../ResourceStrings/types"
import { capitalise } from "../../Utils/capitalise";

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className={styles.header}>
            <div className={styles.headerGrid}>
                <div className={styles.headerGridColumn}>
                    <a href="/" aria-label="Atlantic Blue Solutions" className={styles.headerLogo}>
                        <Atlantic className={styles.headerLogoIcon} />
                    </a>
                </div>
                <div>

                    <Dropdown
                        button="Lang"
                        onSelect={(selected) => {
                            navigate(`/${ResourceStringLanguage[selected as ResourceStringLanguage]}`)
                        }}
                        options={
                            Object
                                .keys(ResourceStringLanguage)
                                .map(key => {
                                    return {
                                        key,
                                        value: capitalise(key.toLocaleLowerCase())
                                    }
                                })
                        }

                    />
                </div>

                <div></div>
            </div>
        </header>
    )
}

export { Header }
