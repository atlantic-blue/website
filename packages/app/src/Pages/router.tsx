import React from "react"
import { createBrowserRouter } from "react-router-dom";

import { ResourceStringLanguage } from "../ResourceStrings/types";

import { PageHome } from "./Home/Home";

const router = createBrowserRouter([
    {
        path: "/",
        element: <PageHome language={ResourceStringLanguage.ENGLISH} />,
        errorElement: <PageHome language={ResourceStringLanguage.ENGLISH} />,
    },
    {
        path: "/en",
        element: <PageHome language={ResourceStringLanguage.ENGLISH} />,
    },
    {
        path: "/es",
        element: <PageHome language={ResourceStringLanguage.SPANISH} />,
    },
    {
        path: "/pt",
        element: <PageHome language={ResourceStringLanguage.PORTUGUESE} />,
    },
    {
        path: "/ru",
        element: <PageHome language={ResourceStringLanguage.RUSSIAN} />,
    },
]);

export default router
