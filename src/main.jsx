import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import './pages.css'
import { App } from './App.jsx'
import { DEFAULTS, merge } from './content'
import { captureAttribution } from './tracking'

captureAttribution()
const root = document.getElementById('root')
// المحتوى المحقون وقت البناء (prerender)؛ إن غاب نبدأ بالافتراضي
let initial
try { initial = merge(DEFAULTS, JSON.parse(document.getElementById('site-data').textContent)) } catch {}
const app = <StrictMode><App initial={initial} /></StrictMode>
// في البناء يُولَّد HTML الصفحة مسبقًا (scripts/prerender.mjs) فنكمل عليه؛ في التطوير يكون فارغًا
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
