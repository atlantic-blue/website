import React from 'react'

import {
    RouterProvider,
} from "react-router-dom";
import router from './Pages/router';

import "./App.scss"

const App: React.FC = () => (

    <RouterProvider router={router} />

)

export { App }
