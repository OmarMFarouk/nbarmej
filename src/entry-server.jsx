// يُستخدم وقت البناء فقط: يرسم الصفحات إلى HTML حتى تراها محركات البحث بدون JavaScript
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { DEFAULTS, merge, servicePath } from './content'
import { active, fillSchema } from './SiteContext'

export function render(saved) {
  const c = saved ? merge(DEFAULTS, saved) : DEFAULTS
  const site = active(c)
  return {
    site,
    services: site.services.filter((s) => servicePath(s)),
    html: (path = '/') => renderToString(<App initial={c} path={path} />),
    fillSchema: (base) => fillSchema(base, site),
  }
}
