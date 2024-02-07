import React from "react"
import { Helmet } from "react-helmet";

import HelmetBase from "../components/Helmet/Helmet";

const HelpPage: React.FC = () => {
    return (
        <div>
            <HelmetBase>
                <html lang="es" />
                <body className="root help" />
            </HelmetBase>
            I am a help page
        </div>
    )
}

export default HelpPage