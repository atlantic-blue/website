import React from "react";
import {
    Routes, Route,
} from "react-router-dom";

import { useConfig } from "../components/ConfigContext";
import HelpPage from "../pages/Help";
import HomePage from "../pages/Home";

const App: React.FC = () => {
    const config = useConfig();
    return (
        <Routes>
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
}

export default App
