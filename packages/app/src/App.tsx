import * as React from 'react'

import { Header } from './Components/Header/Header';
import { Body } from './Components/Body/Body';
import { Footer } from './Components/Footer/Footer';

import * as styles from "./App.scss"

const App: React.FC = () => (
    <div className={styles.app}>
        <Header></Header>
        <Body></Body>
        <Footer></Footer>
    </div>
)

export { App }
