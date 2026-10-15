import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = <StrictMode><App /></StrictMode>
// في البناء يُولَّد HTML الصفحة مسبقًا (scripts/prerender.mjs) فنكمل عليه؛ في التطوير يكون فارغًا
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
