import React from "react"
import { Image } from "../Image/Image"

import * as styles from "./Card.module.scss"

interface CardProps {
    img: {
        src: string
        alt: string
    }
    title: string
    description: string
}

const Card: React.FC<CardProps> = (props) => {
    return (
        <div className={styles.card}>
            <div className={styles.cardBackground}>
                <Image
                    {...props.img}
                    className={styles.cardBackgroundImg} />
            </div>
            <div>
                <p className={styles.cardTitle}>{props.title}</p>
                <p className={styles.cardDescription}>{props.description}</p>
            </div>
        </div>
    )
}

export { Card }
