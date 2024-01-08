import React from "react"
import { RouteObject, createBrowserRouter } from "react-router-dom";

import { ResourceStringLanguage } from "../ResourceStrings/types";

import { PageHome } from "./Home/Home";

const languages = (Object.keys(ResourceStringLanguage) as Array<keyof typeof ResourceStringLanguage>);
const languageRoutes: RouteObject[] = languages.map((key) => {
    return (
        {
            path: `/${ResourceStringLanguage[key]}`,
            element: <PageHome language={ResourceStringLanguage[key]} />,
        }
    )
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <PageHome language={ResourceStringLanguage.ENGLISH} />,
        errorElement: <PageHome language={ResourceStringLanguage.ENGLISH} />,
    },
    ...languageRoutes,
]);

export default router
