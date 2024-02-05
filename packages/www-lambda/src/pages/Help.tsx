import React from "react"
import { Helmet } from "react-helmet";

const HelpPage: React.FC = () => {
    return (
        <div>
            <Helmet>
                <html lang="es" />
                <title>Help Page</title>
                <body className="root help" />
            </Helmet>
            I am a help page
        </div>
    )
}

export default HelpPage