import React from "react"
import { Atlantic } from "../../Icons/atlantic"
import { useNavigate } from "react-router-dom";

import { Dropdown } from "../Dropdown/Dropdown"
import { ResourceStringLanguage } from "../../ResourceStrings/types"
import { capitalise } from "../../Utils/capitalise";
import { IconGreatBritain } from "../../Icons/greatBritain";
import { IconPortugal } from "../../Icons/portugal";
import { IconSpain } from "../../Icons/spain";
import { IconRussia } from "../../Icons/russia";

import * as styles from "./Header.scss"

const countryImages = {
    [ResourceStringLanguage.ENGLISH]: <IconGreatBritain />,
    [ResourceStringLanguage.PORTUGUESE]: <IconPortugal />,
    [ResourceStringLanguage.RUSSIAN]: <IconRussia />,
    [ResourceStringLanguage.SPANISH]: <IconSpain />,
}

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
                        default={{
                            img: <IconGreatBritain />,
                            key: capitalise(ResourceStringLanguage["ENGLISH"].toLocaleLowerCase()),
                            value: ResourceStringLanguage["ENGLISH"]
                        }}
                        options={
                            Object
                                .keys(ResourceStringLanguage)
                                .map(key => {
                                    console.log({ key }, countryImages[ResourceStringLanguage[key as ResourceStringLanguage]])
                                    return {
                                        key,
                                        value: capitalise(key.toLocaleLowerCase()),
                                        img: countryImages[ResourceStringLanguage[key as ResourceStringLanguage]]
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
