import React from "react"
import { Atlantic } from "../../Icons/atlantic"
import { useNavigate, useLocation } from "react-router-dom";

import { Dropdown } from "../Dropdown/Dropdown"
import { ResourceStringLanguage } from "../../ResourceStrings/types"
import { IconGreatBritain } from "../../Icons/greatBritain";
import { IconPortugal } from "../../Icons/portugal";
import { IconSpain } from "../../Icons/spain";
import { IconRussia } from "../../Icons/russia";

import * as styles from "./Header.scss"
import { IconFrance } from "../../Icons/france";

const countryImages = {
    [ResourceStringLanguage.ENGLISH]: <IconGreatBritain />,
    [ResourceStringLanguage.FRENCH]: <IconFrance />,
    [ResourceStringLanguage.PORTUGUESE]: <IconPortugal />,
    [ResourceStringLanguage.RUSSIAN]: <IconRussia />,
    [ResourceStringLanguage.SPANISH]: <IconSpain />,
}

const getOption = (key: string) => {
    if (!key || key === "" || key === "undefined") {
        return {
            img: <IconGreatBritain />,
            key: "ENGLISH",
            value: ResourceStringLanguage.ENGLISH,
        }
    }

    return {
        key,
        img: countryImages[Object(ResourceStringLanguage)[key] as ResourceStringLanguage],
        value: Object(ResourceStringLanguage)[key] as ResourceStringLanguage,
    }
}

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const langPath = location.pathname.split("/")[1]
    const currentLanguage = Object.keys(ResourceStringLanguage)
        .find(key => ResourceStringLanguage[key] === langPath) || "ENGLISH"

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
                        onSelect={(selected) => {
                            navigate(`/${Object(ResourceStringLanguage)[selected.key as ResourceStringLanguage]}`)
                        }}
                        default={getOption(currentLanguage)}
                        options={
                            Object
                                .keys(ResourceStringLanguage)
                                .map(getOption)
                        }
                    />

                </div>

                <div></div>
            </div>
        </header>
    )
}

export { Header }
