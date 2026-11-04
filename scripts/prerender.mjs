// بعد `vite build`: يحقن HTML الصفحات المرسومة مسبقًا وبيانات schema.org في dist/
// الرئيسية → dist/index.html، كل خدمة → dist/services/<slug>/index.html، الخصوصية → dist/privacy/، كل باقة → dist/packages/<id>/، ثم sitemap.xml
// ويكتب dist/admin/pages/defaults.json (القيم الافتراضية لمحرّر الباقات والخصوصية)
// المحتوى: الافتراضي من src/content.js، أو ملف لوحة التحكم إن مُرِّر مساره في CONTENT_JSON
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const SITE = 'https://nbarmej.com'
const dist = resolve(import.meta.dirname, '../dist')
const ssr = resolve(import.meta.dirname, '../dist-ssr')
const { render } = await import(pathToFileURL(resolve(ssr, 'entry-server.js')).href)

let saved = null
if (process.env.CONTENT_JSON && existsSync(process.env.CONTENT_JSON)) {
  try {
    const j = JSON.parse(readFileSync(process.env.CONTENT_JSON, 'utf8'))
    if (j && typeof j === 'object' && !j.error) saved = j
  } catch (e) { console.warn(`CONTENT_JSON ignored: ${e.message}`) }
}
const { site, services, packages, privacy, defaults, html, fillSchema } = render(saved)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const ld = (o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2).replace(/</g, '\\u003c')}\n</script>`

const template = readFileSync(resolve(dist, 'index.html'), 'utf8')
if (!template.includes('<!--app-html-->')) throw new Error('index.html: missing <!--app-html--> placeholder')

function page(path, { title, desc, extraLd = [], schema = true } = {}) {
  let p = template.replace('<!--app-html-->', () => html(path))
  // المحتوى الذي رُسمت به الصفحة: يبدأ به المتصفح حتى يتطابق الـhydration مع الـHTML
  if (saved) p = p.replace('</head>', () => `<script type="application/json" id="site-data">${JSON.stringify(saved).replace(/</g, '\\u003c')}</script>
  </head>`)
  p = p.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (m, a, json, b) =>
    !schema ? '' : json.includes('ProfessionalService') ? `${a}\n${JSON.stringify(fillSchema(JSON.parse(json)), null, 2).replace(/</g, '\\u003c')}\n${b}` : m)
  if (title) {
    const url = SITE + path
    p = p
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
      .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
      .replace('</head>', `${extraLd.map(ld).join('\n')}\n  </head>`)
  }
  return p
}

writeFileSync(resolve(dist, 'index.html'), page('/'))

for (const s of services) {
  const path = `/services/${s.slug}/`
  const title = `${s.seoTitle || s.title} | ${site.brand.name}`
  const desc = s.seoDesc || s.text
  const extraLd = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: desc, serviceType: s.title, url: SITE + path,
      ...(s.img ? { image: SITE + s.img.split('?')[0] } : {}),
      provider: { '@type': 'ProfessionalService', name: site.brand.name, url: SITE + '/' },
      areaServed: { '@type': 'Country', name: 'المملكة العربية السعودية' },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'خدماتنا', item: SITE + '/#services' },
        { '@type': 'ListItem', position: 3, name: s.title, item: SITE + path },
      ],
    },
  ]
  mkdirSync(resolve(dist, `services/${s.slug}`), { recursive: true })
  writeFileSync(resolve(dist, `services/${s.slug}/index.html`), page(path, { title, desc, extraLd }))
}

const writePage = (dir, html) => { mkdirSync(resolve(dist, dir), { recursive: true }); writeFileSync(resolve(dist, dir, 'index.html'), html) }

writePage('privacy', page('/privacy', { title: 'سياسة الخصوصية | ' + site.brand.name, desc: privacy.intro, schema: false }))
for (const k of packages) {
  writePage(`packages/${k.id}`, page(`/packages/${k.id}`, { title: k.seoTitle, desc: k.seoDescription, schema: false }))
}

mkdirSync(resolve(dist, 'admin/pages'), { recursive: true })
writeFileSync(resolve(dist, 'admin/pages/defaults.json'), JSON.stringify({ pkCopy: defaults.pkCopy, packages: defaults.packages, privacy: defaults.privacy }))

const urls = [['/', '1.0'], ...services.map((s) => [`/services/${s.slug}/`, '0.8']), ['/privacy', '0.5'], ...packages.map((k) => [`/packages/${k.id}`, '0.8'])]
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${SITE}${u}</loc><changefreq>monthly</changefreq><priority>${p}</priority></url>`).join('\n')}
</urlset>
`)

rmSync(ssr, { recursive: true, force: true })
console.log(`prerendered /, ${services.length} service pages, privacy, ${packages.length} packages${saved ? ' (from CONTENT_JSON)' : ''}`)
