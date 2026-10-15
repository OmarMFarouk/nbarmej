// يُستخدم وقت البناء فقط: يرسم الصفحة إلى HTML حتى تراها محركات البحث بدون JavaScript
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { DEFAULTS, merge } from './content'
import { active, fillSchema } from './SiteContext'

export function render(saved) {
  const c = saved ? merge(DEFAULTS, saved) : DEFAULTS
  return { html: renderToString(<App initial={c} />), fillSchema: (base) => fillSchema(base, active(c)) }
}
