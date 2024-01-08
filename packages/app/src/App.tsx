import React from 'react'

import {
    RouterProvider,
} from "react-router-dom";
import router from './Pages/router';

import "./App.scss"

const App: React.FC = () => (
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)

export { App }
