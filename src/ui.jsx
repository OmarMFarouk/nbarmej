import { useEffect, useState } from 'react'

export const countLabel = (e) => (e === 0 ? '' : e === 1 ? 'خدمة واحدة' : e === 2 ? 'خدمتان' : `${e} خدمات`)
export const Icon = {
  wa: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.7-.6c-3-1.3-5-4.4-5.1-4.6-.2-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.3Z"
      />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"
      />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" d="M3 5h18v14H3zM3 6l9 7 9-7" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"
      />
      <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  ),
  registration: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      />
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M14 3v6h5M9 13h6M9 17h6" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
      />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M5 2h11l3 3v17l-2.3-1.6L14.4 22l-2.4-1.6L9.6 22l-2.3-1.6L5 22z"
      />
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  ),
  zoom: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16 16l5 5M10.5 7.500v6M7.500 10.500h6"
      />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M5 5l14 14M19 5L5 19" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2.2" d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  ),
}
export const REVEAL = '.sec-head, .card, .work-item, .points li, .quote, .final, .faq-item, .why-section, .footer-in'
// ظهور العناصر تدريجيًا عند التمرير (يُهمَل مع تفضيل تقليل الحركة)
export function useReveal() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          io.unobserve(e.target)
          e.target.classList.add('in')
          setTimeout(() => e.target.classList.remove('rv', 'in'), 1400)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    const below = [...document.querySelectorAll(REVEAL)].filter((el) => el.getBoundingClientRect().top > innerHeight * 0.9)
    for (const el of below) {
      const sibs = [...el.parentElement.children].filter((c) => c.matches(REVEAL))
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 0.09 + 's')
      el.classList.add('rv')
      io.observe(el)
    }
    return () => io.disconnect()
  }, [])
}
export const asset = (e) => '/'.replace(/\/$/, '') + e
export function Img({ src: e, alt: t, label: n, eager: r, className: i }) {
  let [a, o] = useState(true)
  return a ? (
    <img
      className={i}
      src={asset(e)}
      alt={t}
      loading={r ? 'eager' : 'lazy'}
      fetchPriority={r ? 'high' : undefined}
      decoding="async"
      onError={() => o(false)}
    />
  ) : (
    <div className={`img-ph ${i || ''}`} role="img" aria-label={t}>
      <span>{n}</span>
    </div>
  )
}
export function SectionHead({ tag: e, title: t, text: n }) {
  return (
    <div className="sec-head">
      <p className="tag">{e}</p>
      <h2>{t}</h2>
      {n && <p className="muted">{n}</p>}
    </div>
  )
}
