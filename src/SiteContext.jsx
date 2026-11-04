import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULTS, formatHours, merge, safeUrl, schemaHours, withPages } from './content'

export const SiteCtx = createContext(DEFAULTS)
export const useSite = () => useContext(SiteCtx)

export const CACHE = 'siteContent'
export const fromCache = () => {
  try {
    return merge(DEFAULTS, JSON.parse(localStorage[CACHE]))
  } catch {
    return DEFAULTS
  }
}

// يملأ بيانات schema.org (الهاتف/البريد/الروابط/العنوان/ساعات العمل) من محتوى لوحة التحكم — في المتصفح ووقت البناء
export function fillSchema(base, c) {
  const j = { ...base }
  if (c.contact.phone) j.telephone = c.contact.phone
  else delete j.telephone
  if (c.contact.email) j.email = c.contact.email
  else delete j.email
  j.sameAs = c.socials.map((s) => safeUrl(s.url)).filter(Boolean)
  j.address = { ...j.address, ...(c.contact.address ? { streetAddress: c.contact.address } : {}) }
  if (!j.address.addressLocality) delete j.address.addressLocality
  const hours = schemaHours(c.hours)
  if (hours) j.openingHours = hours
  return j
}

export function syncSchema(c) {
  const el = [...document.querySelectorAll('script[type="application/ld+json"]')].find((s) => s.textContent.includes('ProfessionalService'))
  if (!el) return
  try {
    const j = JSON.parse(el.dataset.base || el.textContent)
    el.dataset.base = JSON.stringify(j)
    el.textContent = JSON.stringify(fillSchema(j, c))
  } catch {
    /* JSON غير صالح: نترك الوسم كما هو */
  }
}

// العناصر المعطّلة من لوحة التحكم (off) لا تصل للموقع
export const LISTS = ['socials', 'services', 'projects', 'process', 'faq', 'start', 'points']
export const active = (c) => {
  const o = { ...c }
  for (const k of LISTS) o[k] = (c[k] || []).filter((x) => !x.off)
  o.services = withPages(o.services)
  return o
}

// initial: المحتوى الذي رُسمت به الصفحة (prerender) حتى يتطابق الـhydration، ثم الكاش المحلي، ثم الـAPI
export function SiteProvider({ initial = DEFAULTS, children }) {
  const [raw, setRaw] = useState(initial)
  const c = useMemo(() => active(raw), [raw])

  useEffect(() => {
    let cancelled = false
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- الكاش يُقرأ بعد الرسم الأول كي لا يختلف عن HTML المُولَّد
      if (localStorage[CACHE]) setRaw(fromCache())
    } catch {
      /* التخزين المحلي غير متاح */
    }
    fetch('/api/?a=content', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j || typeof j !== 'object') return
        try {
          localStorage[CACHE] = JSON.stringify(j)
        } catch {
          /* التخزين المحلي غير متاح */
        }
        setRaw(merge(DEFAULTS, j))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => syncSchema(c), [c])

  const wa = (text) => `https://wa.me/${c.contact.whatsapp}?text=${encodeURIComponent(text)}`
  return <SiteCtx.Provider value={{ ...c, wa, hoursText: formatHours(c.hours) }}>{children}</SiteCtx.Provider>
}
