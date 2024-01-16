import React from "react"
import { navigate } from "gatsby"

import { Atlantic } from "../../Icons/atlantic"
import { Dropdown } from "../Dropdown/Dropdown"
import { IconGreatBritain } from "../../Icons/greatBritain";
import { IconPortugal } from "../../Icons/portugal";
import { IconSpain } from "../../Icons/spain";
import { IconRussia } from "../../Icons/russia";

import { IconFrance } from "../../Icons/france";
import { ResourceStringLanguage } from "../../resourceStrings/types";

import * as styles from "./Header.module.scss"

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

const isBrowser = () => typeof window !== "undefined"

const Header = () => {
    const langPath = isBrowser() && window.location.pathname.split("/")[1]
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
                            const lang = selected.value
                            const pathnames = isBrowser() ? window.location.pathname.split("/") : []
                            if (lang === ResourceStringLanguage.ENGLISH) {
                                pathnames.splice(1, 1)
                            } else {
                                pathnames.splice(1, 1, lang)
                            }
                            const navigateTo = pathnames.join("/")
                            navigate(navigateTo)
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
