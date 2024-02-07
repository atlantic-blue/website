import React from "react"
import { hydrateRoot } from 'react-dom/client';

import App from "../app/main";

const container = document.getElementById('main') as HTMLElement

hydrateRoot(container, <App />);
