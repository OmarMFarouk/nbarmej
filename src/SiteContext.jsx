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
export function fillSchema(e, t) {
  let n = {
    ...e,
  }
  ;(t.contact.phone ? (n.telephone = t.contact.phone) : delete n.telephone,
    t.contact.email ? (n.email = t.contact.email) : delete n.email,
    (n.sameAs = t.socials.map((e) => safeUrl(e.url)).filter(Boolean)),
    (n.address = {
      ...n.address,
      ...(t.contact.address
        ? {
            streetAddress: t.contact.address,
          }
        : {}),
    }),
    n.address.addressLocality || delete n.address.addressLocality)
  let r = schemaHours(t.hours)
  return (r && (n.openingHours = r), n)
}
export function syncSchema(e) {
  let t = [...document.querySelectorAll('script[type="application/ld+json"]')].find((e) =>
    e.textContent.includes('ProfessionalService'),
  )
  if (t)
    try {
      let n = JSON.parse(t.dataset.base || t.textContent)
      ;((t.dataset.base = JSON.stringify(n)), (t.textContent = JSON.stringify(fillSchema(n, e))))
    } catch {}
}
export const LISTS = ['socials', 'services', 'projects', 'process', 'faq', 'start', 'points']
export const active = (e) => {
  let t = {
    ...e,
  }
  for (let n of LISTS) t[n] = (e[n] || []).filter((e) => !e.off)
  return ((t.services = withPages(t.services)), t)
}
export function SiteProvider({ initial: e = DEFAULTS, children: t }) {
  let [i, a] = useState(e),
    o = useMemo(() => active(i), [i])
  ;(useEffect(() => {
    let e = false
    try {
      localStorage[CACHE] && a(fromCache())
    } catch {}
    return (
      fetch('/api/?a=content', {
        cache: 'no-store',
      })
        .then((e) => (e.ok ? e.json() : null))
        .then((t) => {
          if (!e && t && typeof t == 'object') {
            try {
              localStorage[CACHE] = JSON.stringify(t)
            } catch {}
            a(merge(DEFAULTS, t))
          }
        })
        .catch(() => {}),
      () => {
        e = true
      }
    )
  }, []),
    useEffect(() => syncSchema(o), [o]))
  let s = (e) => `https://wa.me/${o.contact.whatsapp}?text=${encodeURIComponent(e)}`
  return (
    <SiteCtx.Provider
      value={{
        ...o,
        wa: s,
        hoursText: formatHours(o.hours),
      }}
    >
      {t}
    </SiteCtx.Provider>
  )
}
