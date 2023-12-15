import React from "react"
import * as styles from "./Body.scss"
import { Card } from "../Card/Card"

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
                            Transform your business
                        </h2>
                        <p className={styles.sectionCtaContentDescription}>
                            Unlock the full potential of your business with our innovative software development solutions.
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
                        Are you looking for top-notch software development services in London, UK? Look no further than Atlantic. Our team of skilled developers and engineers are dedicated to delivering high-quality, custom software solutions to meet your business needs. With a focus on innovation and efficiency, Atlantic is the partner you need to bring your software ideas to life.Whether you're a startup or an established company, Atlantic is committed to providing tailored software development services to help you stay ahead in the competitive tech industry. Contact us today to learn more about how we can help elevate your business with our expertise in software development.
                    </p>
                </div>
            </section>

            <section className={styles.sectionProducts}>
                <div className={styles.sectionProductsContainer}>
                    <Card
                        img={{ src: "/assets/custom-software.jpg", alt: "Customized Software Solutions" }}
                        title="Customized Software Solutions"
                        description="We offer tailored software solutions to meet the unique needs of your business, ensuring seamless integration and enhanced efficiency."
                    />

                    <Card
                        img={{ src: "/assets/agile-methodology.jpg", alt: "Agile Development Methodology" }}
                        title="Agile Development Methodology"
                        description="Using agile methodologies, we deliver high-quality software solutions faster, ensuring adaptability and quick response to market changes."
                    />

                    <Card
                        img={{ src: "/assets/tech-support.jpg", alt: "Expert Technical Support" }}
                        title="Expert Technical Support"
                        description="Our team of technical experts provides dedicated support throughout the software development lifecycle, ensuring smooth implementation and ongoing maintenance."
                    />
                </div>
            </section>

            <section></section>

            <section></section>

            <section></section>

            <section></section>
        </div>
    )
}

export { Body }
