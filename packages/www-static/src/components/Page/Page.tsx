import React from "react"
import { Header } from "../Header/Header"
import { Footer } from "../Footer/Footer"

import * as styles from "./Page.module.scss"

interface PageProps {
    children: React.ReactNode
}

const Page: React.FC<PageProps> = ({ children }) => {
    return (
        <>
            <Header />
            <main className={styles.main}>
                {children}
            </main>
            <Footer />
        </>
    )
}

export { Page }
