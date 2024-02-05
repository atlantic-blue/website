import React from "react"
import { Helmet } from "react-helmet";

const HomePage: React.FC = () => {
    return (
        <div>
            <Helmet>
                <html lang="en" />
                <title>Home Page</title>
                <body className="root home" />
            </Helmet>
            I am a home page
        </div>
    )
}

export default HomePage