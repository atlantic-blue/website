import React from "react"
import { RouteObject, createBrowserRouter } from "react-router-dom";

import { ResourceStringLanguage } from "../ResourceStrings/types";

import { PageHome } from "./Home/Home";

const languages: RouteObject[] = (Object.keys(ResourceStringLanguage) as Array<keyof typeof ResourceStringLanguage>).map((key) => {
    return (
        {
            path: `/${ResourceStringLanguage[key]}`,
            element: <PageHome language={ResourceStringLanguage[key]} />,
        }
    )
})

const router = createBrowserRouter([
    {
        path: "/",
        element: <PageHome language={ResourceStringLanguage.ENGLISH} />,
        errorElement: <PageHome language={ResourceStringLanguage.ENGLISH} />,
    },
    ...languages,
]);

export default router
