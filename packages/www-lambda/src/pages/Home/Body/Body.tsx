import React from "react"

import { Card } from "../../../components/Card/Card"
import { Dazn } from "../../../icons/dazn"
import { Peacock } from "../../../icons/peacock"
import { resourceStrings } from "../../../resourceStrings"
import { ResourceStringLanguage, ResourceStrings } from "../../../resourceStrings/types"

import * as styles from "./Body.scss"

const SectionHero = ({ resourceStrings }: { resourceStrings: ResourceStrings['home']['section']['hero'] }) => {
    return (
        <section className={styles.sectionCta}>
            <div>
                <div>
                    <div className={styles.sectionCtaBackground} />
                    <img
                        className={styles.sectionCtaBackgroundImg}
                        src="/assets/screen.jpg" alt="screen" />
                </div>

                <div className={styles.sectionCtaContent}>
                    <h2 className={styles.sectionCtaContentTitle}>
                        {resourceStrings.title}
                    </h2>
                    <p className={styles.sectionCtaContentDescription}>
                        {resourceStrings.description}
                    </p>
                    <div className={styles.sectionCtaContentLinkContainer}>
                        <a href="#about"
                            className={styles.sectionCtaContentLink}>
                            {resourceStrings.cta}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

const SectionIntro = ({ resourceStrings }: { resourceStrings: ResourceStrings['home']['section']['intro'] }) => {
    return (
        <section className={styles.sectionIntro}>
            <div className={styles.sectionIntroContainer}>
                <p className={styles.sectionIntroContent}>
                    {resourceStrings.content}
                </p>
            </div>
        </section>
    )
}


const SectionProducts = ({ resourceStrings }: { resourceStrings: ResourceStrings['home']['section']['products'] }) => {
    return (
        <section className={styles.sectionProducts}>
            <div className={styles.sectionProductsContainer}>
                <Card
                    img={{ src: "/assets/custom-software.jpg", alt: resourceStrings.solutions.imgAlt }}
                    title={resourceStrings.solutions.title}
                    description={resourceStrings.solutions.description}
                />

                <Card
                    img={{ src: "/assets/agile-methodology.jpg", alt: resourceStrings.methodology.imgAlt }}
                    title={resourceStrings.methodology.title}
                    description={resourceStrings.methodology.description}
                />

                <Card
                    img={{ src: "/assets/tech-support.jpg", alt: resourceStrings.support.imgAlt }}
                    title={resourceStrings.support.title}
                    description={resourceStrings.support.description}
                />
            </div>
        </section>
    )
}

const SectionClients = ({ resourceStrings }: { resourceStrings: ResourceStrings['home']['section']['clients'] }) => {
    return (
        <section className={styles.sectionClients}>
            <div className={styles.sectionClientsContainer}>
                <h2 className={styles.sectionClientsTitle}>
                    {resourceStrings.title}
                </h2>
                <div className={styles.sectionClientsIcons}>
                    <Peacock className={styles.sectionClientsIconsGeneric} />
                    <Dazn className={styles.sectionClientsIconsGeneric} />
                    <div className={styles.sectionClientsIconsSky}></div>
                </div>
            </div>
        </section>
    )
}

const SectionAbout = ({ resourceStrings }: { resourceStrings: ResourceStrings['home']['section']['about'] }) => {
    return (
        <section className={styles.sectionAbout}>
            <div className={styles.sectionAboutContainer}>
                <div>
                    <h2 className={styles.sectionAboutTitle}>
                        <a name="about">{resourceStrings.title}</a>
                    </h2>

                    <p className={styles.sectionAboutDescription}>
                        {resourceStrings.description}
                    </p>
                </div>

                <div
                    className={styles.sectionAboutBackground}
                >
                    <img
                        className={styles.sectionAboutBackgroundImg}
                        src="/assets/setup.jpg" alt={resourceStrings.imgAlt} />
                </div>
            </div>
        </section>
    )
}

const Body = ({ resourceStrings }: { resourceStrings: ResourceStrings['home'] }) => {
    return (
        <div className={styles.body}>
            <SectionHero resourceStrings={resourceStrings.section.hero} />
            <SectionIntro resourceStrings={resourceStrings.section.intro} />
            <SectionProducts resourceStrings={resourceStrings.section.products} />
            <SectionClients resourceStrings={resourceStrings.section.clients} />
            <SectionAbout resourceStrings={resourceStrings.section.about} />
        </div>
    )
}

export { Body }
