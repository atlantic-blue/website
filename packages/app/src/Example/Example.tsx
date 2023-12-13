import React from 'react'

import * as styles from './example.scss'
import { Banner } from '../Icons/banner'

const Example: React.FC = () => (
    <div className={styles.main} aria-label="example">
        <Banner />
        <div>Atlantic Blue</div>
        <div>Crafting Your Digital Future</div>
    </div>
)

export default Example
