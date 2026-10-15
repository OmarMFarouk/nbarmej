import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULTS, merge, formatHours, schemaHours, safeUrl } from './content'

const Ctx = createContext(DEFAULTS)
export const useSite = () => useContext(Ctx)

const CACHE = 'siteContent'
const API = import.meta.env.BASE_URL + 'api/'

const fromCache = () => {
  try { return merge(DEFAULTS, JSON.parse(localStorage[CACHE])) } catch { return DEFAULTS }
}

// يملأ بيانات schema.org (الهاتف/البريد/الروابط/ساعات العمل) من محتوى لوحة التحكم — يُستخدم في المتصفح ووقت البناء
export function fillSchema(base, c) {
  const j = { ...base }
  if (c.contact.phone) j.telephone = c.contact.phone
  else delete j.telephone
  if (c.contact.email) j.email = c.contact.email
  else delete j.email
  j.sameAs = c.socials.map((s) => safeUrl(s.url)).filter(Boolean)
  j.address = { ...j.address, ...(c.contact.address ? { streetAddress: c.contact.address } : {}) }
  if (!j.address.addressLocality) delete j.address.addressLocality
  const oh = schemaHours(c.hours)
  if (oh) j.openingHours = oh
  return j
}

function syncSchema(c) {
  const el = [...document.querySelectorAll('script[type="application/ld+json"]')].find((s) => s.textContent.includes('ProfessionalService'))
  if (!el) return
  try {
    const j = JSON.parse(el.dataset.base || el.textContent)
    el.dataset.base = JSON.stringify(j)
    el.textContent = JSON.stringify(fillSchema(j, c))
  } catch {}
}

const LISTS = ['stats', 'socials', 'services', 'projects', 'process', 'faq', 'start', 'points', 'pricing']
// العناصر المعطّلة من لوحة التحكم (off) لا تصل للموقع
export const active = (c) => { const o = { ...c }; for (const k of LISTS) o[k] = (c[k] || []).filter((x) => !x.off); return o }

// initial: محتوى مُمرَّر وقت البناء (prerender). البداية دائمًا بنفس ما رُسم في HTML حتى يتطابق الـhydration، ثم الكاش ثم الـAPI
export function SiteProvider({ initial = DEFAULTS, children }) {
  const [raw, setC] = useState(initial)
  const c = useMemo(() => active(raw), [raw])

  useEffect(() => {
    let off = false
    try { if (localStorage[CACHE]) setC(fromCache()) } catch {}
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
