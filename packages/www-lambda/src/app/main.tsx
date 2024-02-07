import React from "react";
import {
    Routes, Route
} from "react-router-dom";

import { useConfig } from "../components/ConfigContext";
import { ResourceStringLanguage } from "../resourceStrings/types";

import HelpPage from "../pages/Help";
import { PageHome } from "../pages/Home/Home";

import '../analytics/mixpanel';

import "./App.scss"

const languages = (Object.keys(ResourceStringLanguage) as Array<keyof typeof ResourceStringLanguage>);

const App: React.FC = () => {
    const config = useConfig();

    return (
        <Routes>
            <Route path="/help" element={<HelpPage />} />
            {languages.map((key) => {
                return (
                    <Route
                        key={key}
                        path={`/${ResourceStringLanguage[key]}`}
                        element={<PageHome language={ResourceStringLanguage[key]} />}
                    />
                )
            })}
            <Route path="*" element={<PageHome language={ResourceStringLanguage.ENGLISH} />} />
        </Routes>
    );
}

export default App
