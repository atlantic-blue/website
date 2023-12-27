import React from "react"
import * as styles from "./Body.scss"
import { Card } from "../Card/Card"
import { Peacock } from "../../Icons/peacock"
import { Dazn } from "../../Icons/dazn"

const Body = () => {
    return (
        <div className={styles.body}>
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
                            Elevate Your Business with Tailored Software Solutions
                        </h2>
                        <p className={styles.sectionCtaContentDescription}>
                            Transform Your Business with Innovative Software Development Solutions.
                        </p>
                        <div className={styles.sectionCtaContentLinkContainer}>
                            <a href="/"
                                className={styles.sectionCtaContentLink}>Learn More</a>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.sectionIntro}>
                <div className={styles.sectionIntroContainer}>
                    <p className={styles.sectionIntroContent}>
                        Are you seeking exceptional software development services? Look no further than Atlantic. Our dedicated team of skilled developers and engineers specializes in delivering high-quality, customized software solutions designed to meet your specific business needs. With a focus on innovation and efficiency, Atlantic is the partner you need to bring your software ideas to life.Whether you're a startup or an established company, Atlantic is committed to providing tailored software development services to help you stay ahead in the competitive tech industry. Contact us today to learn more about how we can help elevate your business with our expertise in software development.
                    </p>
                </div>
            </section>

            <section className={styles.sectionProducts}>
                <div className={styles.sectionProductsContainer}>
                    <Card
                        img={{ src: "/assets/custom-software.jpg", alt: "Customized Software Solutions" }}
                        title="Tailored Solutions for Your Business"
                        description="We understand the unique requirements of your business and offer personalized software solutions ensuring seamless integration and heightened efficiency."
                    />

                    <Card
                        img={{ src: "/assets/agile-methodology.jpg", alt: "Agile Development Methodology" }}
                        title="Agile Development Methodology"
                        description="Using agile methodologies, we deliver superior software solutions faster, guaranteeing adaptability and swift responses to market changes."
                    />

                    <Card
                        img={{ src: "/assets/tech-support.jpg", alt: "Expert Technical Support" }}
                        title="Expert Technical Support"
                        description="Our technical experts provide dedicated support throughout the software development lifecycle, ensuring smooth implementation and continuous maintenance."
                    />
                </div>
            </section>

            <section className={styles.sectionClients}>
                <div className={styles.sectionClientsContainer}>
                    <h2 className={styles.sectionClientsTitle}>
                        Our Clients
                    </h2>
                    <div className={styles.sectionClientsIcons}>
                        <Peacock className={styles.sectionClientsIconsGeneric} />
                        <Dazn className={styles.sectionClientsIconsGeneric} />
                        <div className={styles.sectionClientsIconsSky}></div>
                    </div>
                </div>
            </section>

            <section className={styles.sectionAbout}>
                <div className={styles.sectionAboutContainer}>
                    <div>
                        <h2 className={styles.sectionAboutTitle}>
                            Atlantic, Your Partner in Software Innovation
                        </h2>

                        <p className={styles.sectionAboutDescription}>
                            Welcome to Atlantic, a leading software development company in London, UK. We're committed to transforming ideas into reality with our extensive expertise and innovative solutions.
                            <br></br>
                            <br></br>
                            At Atlantic, we're passionate about crafting cutting-edge software that meets our clients' unique needs. Our collaborative team of skilled developers, designers, and strategists ensures exceptional results, driving business growth and success. Trust us to deliver reliable, scalable, and user-friendly tailored software solutions.
                            <br></br>
                            <br></br>
                        </p>
                    </div>

                    <div
                        className={styles.sectionAboutBackground}
                    >
                        <img
                            className={styles.sectionAboutBackgroundImg}
                            src="/assets/setup.jpg" alt="screen" />
                    </div>
                </div>
            </section>
        </div>
    )
}

export { Body }
