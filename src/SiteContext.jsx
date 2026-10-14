import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULTS, merge, formatHours, schemaHours, safeUrl } from './content'

const Ctx = createContext(DEFAULTS)
export const useSite = () => useContext(Ctx)

const CACHE = 'siteContent'
const API = import.meta.env.BASE_URL + 'api/'

const fromCache = () => {
  try { return merge(DEFAULTS, JSON.parse(localStorage[CACHE])) } catch { return DEFAULTS }
}

// يحدّث بيانات schema.org في الصفحة (الهاتف/البريد/الروابط/ساعات العمل) من لوحة التحكم
function syncSchema(c) {
  const el = [...document.querySelectorAll('script[type="application/ld+json"]')].find((s) => s.textContent.includes('ProfessionalService'))
  if (!el) return
  try {
    const j = JSON.parse(el.dataset.base || el.textContent)
    el.dataset.base = JSON.stringify(j)
    j.telephone = c.contact.phone
    j.email = c.contact.email
    j.sameAs = c.socials.map((s) => safeUrl(s.url)).filter(Boolean)
    j.address = { ...j.address, streetAddress: c.contact.address }
    const oh = schemaHours(c.hours)
    if (oh) j.openingHours = oh
    el.textContent = JSON.stringify(j)
  } catch {}
}

const LISTS = ['stats', 'socials', 'services', 'projects', 'process', 'faq', 'start', 'points', 'pricing']
// العناصر المعطّلة من لوحة التحكم (off) لا تصل للموقع
const active = (c) => { const o = { ...c }; for (const k of LISTS) o[k] = (c[k] || []).filter((x) => !x.off); return o }

export function SiteProvider({ children }) {
  const [raw, setC] = useState(fromCache)
  const c = useMemo(() => active(raw), [raw])

  useEffect(() => {
    let off = false
    fetch(API + '?a=content', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (off || !j || typeof j !== 'object') return
        try { localStorage[CACHE] = JSON.stringify(j) } catch {}
        setC(merge(DEFAULTS, j))
      })
      .catch(() => {})
    return () => { off = true }
  }, [])

  useEffect(() => syncSchema(c), [c])

  const wa = (text) => `https://wa.me/${c.contact.whatsapp}?text=${encodeURIComponent(text)}`
  return <Ctx.Provider value={{ ...c, wa, hoursText: formatHours(c.hours) }}>{children}</Ctx.Provider>
}
