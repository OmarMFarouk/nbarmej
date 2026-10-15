// بعد `vite build`: يحقن HTML الصفحة المرسوم مسبقًا وبيانات schema.org في dist/index.html
// المحتوى: الافتراضي من src/content.js، أو ملف لوحة التحكم إن مُرِّر مساره في CONTENT_JSON
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve(import.meta.dirname, '../dist')
const ssr = resolve(import.meta.dirname, '../dist-ssr')
const { render } = await import(pathToFileURL(resolve(ssr, 'entry-server.js')).href)

const saved = process.env.CONTENT_JSON ? JSON.parse(readFileSync(process.env.CONTENT_JSON, 'utf8')) : null
const { html, fillSchema } = render(saved)

const file = resolve(dist, 'index.html')
let page = readFileSync(file, 'utf8')
if (!page.includes('<!--app-html-->')) throw new Error('index.html: missing <!--app-html--> placeholder')
page = page.replace('<!--app-html-->', () => html)
page = page.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (m, a, json, b) => {
  if (!json.includes('ProfessionalService')) return m
  return `${a}\n${JSON.stringify(fillSchema(JSON.parse(json)), null, 2).replace(/</g, '\\u003c')}\n${b}`
})
writeFileSync(file, page)
rmSync(ssr, { recursive: true, force: true })
console.log(`prerendered dist/index.html (${(html.length / 1024).toFixed(1)} KB of markup)`)
