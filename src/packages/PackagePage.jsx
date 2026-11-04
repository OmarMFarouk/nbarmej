import { useEffect, useRef, useState } from 'react'
import { Link } from '../router'
import { useSite } from '../SiteContext'

// حركة ظهور العناصر عند التمرير + إظهار الشريط السفلي حين يغيب الـhero وقسم الطلب عن الشاشة
export function usePackageMotion(rootRef, heroRef, orderRef) {
  const [showBar, setShowBar] = useState(false)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const hasIO = 'IntersectionObserver' in window
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

    let reveal
    if (!reduced && hasIO) {
      root.classList.add('pd-motion-ready')
      reveal = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            e.target.classList.add('pd-visible')
            reveal.unobserve(e.target)
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
      )
      root.querySelectorAll('[data-reveal]').forEach((el) => {
        const idx = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')).indexOf(el)
        el.style.setProperty('--pd-delay', `${Math.min(idx, 5) * 80}ms`)
        const r = el.getBoundingClientRect()
        if (r.top < innerHeight && r.bottom > 0) el.classList.add('pd-visible')
        else reveal.observe(el)
      })
    }

    let heroVisible = true
    let orderVisible = false
    const update = () => setShowBar(!heroVisible && !orderVisible)
    const measure = () => {
      heroVisible = heroRef.current?.getBoundingClientRect().bottom > 0
      const o = orderRef.current?.getBoundingClientRect()
      orderVisible = !!(o && o.top < innerHeight && o.bottom > 0)
      update()
    }

    let watch
    if (hasIO) {
      watch = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.target === heroRef.current) heroVisible = e.isIntersecting
            if (e.target === orderRef.current) orderVisible = e.isIntersecting
          }
          update()
        },
        { threshold: 0.05 },
      )
      if (heroRef.current) watch.observe(heroRef.current)
      if (orderRef.current) watch.observe(orderRef.current)
    } else {
      window.addEventListener('scroll', measure, { passive: true })
      window.addEventListener('resize', measure)
      measure()
    }
    return () => {
      reveal?.disconnect()
      watch?.disconnect()
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      root.classList.remove('pd-motion-ready')
    }
  }, [heroRef, orderRef, rootRef])
  return showBar
}
export function RichParts({ parts: e }) {
  return e.map((e, t) =>
    typeof e == 'string' ? (
      <span key={t}>{e}</span>
    ) : e.href ? (
      <Link className="pd-inline-link" href={e.href} key={t}>
        {e.text}
      </Link>
    ) : e.strong ? (
      <strong key={t}>{e.strong}</strong>
    ) : null,
  )
}
export function PackageFeatures({ features: e, id: t }) {
  return (
    <section className="pd-section pd-features" id={t}>
      <header className="pd-section-head" data-reveal>
        <h2>{e.title}</h2>
        {e.subtitle && <p>{e.subtitle}</p>}
      </header>
      <ul className="pd-feature-grid">
        {e.items.map(([t, n], r) => (
          <li className="pd-feature" data-reveal key={t}>
            <span className="pd-feature-marker" aria-hidden="true">
              {e.marker || String(r + 1).padStart(2, '0')}
            </span>
            <h3>{t}</h3>
            <p>{n}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
export function PackageStory({ story: e }) {
  return (
    <section className="pd-story" data-reveal>
      <h2>{e.title}</h2>
      {e.paragraphs.map((e, t) => (
        <p key={t}>
          <RichParts parts={e} />
        </p>
      ))}
      <p className="pd-story-closing">{e.closing}</p>
    </section>
  )
}
export function PackageSpecs({ specs: e, terms: t }) {
  return (
    <section className="pd-section pd-specs" id={e.id}>
      <header className="pd-section-head" data-reveal>
        <h2>{e.title}</h2>
        {e.subtitle && <p>{e.subtitle}</p>}
      </header>
      {e.panelTitle && (
        <h3 className="pd-panel-title" data-reveal>
          {e.panelTitle}
        </h3>
      )}
      <div className="pd-table-wrap" data-reveal>
        <table>
          <thead>
            <tr>
              <th scope="col">البند</th>
              <th scope="col">{e.tableHeading}</th>
            </tr>
          </thead>
          <tbody>
            {e.rows.map(([t, n]) => (
              <tr key={t}>
                <th scope="row">{t}</th>
                <td data-label={e.tableHeading}>{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {t && (
        <section className="pd-terms" id={t.id} data-reveal>
          <h3>{t.title}</h3>
          <ul>
            {t.items.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}
      {e.exclusions && (
        <section className="pd-terms" data-reveal>
          <h3>{e.exclusionsTitle}</h3>
          <ul className="pd-chip-list">
            {e.exclusions.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}
      {e.note && (
        <p className="pd-note" data-reveal>
          {e.note}
        </p>
      )}
      {e.requirements && (
        <section className="pd-terms" data-reveal>
          <h3>{e.requirementsTitle}</h3>
          <p>{e.requirements}</p>
        </section>
      )}
    </section>
  )
}
export function PackageTimeline({ timeline: e }) {
  return (
    <section className="pd-section pd-timeline" id={e.id}>
      <header className="pd-section-head" data-reveal>
        <h2>{e.title}</h2>
        <p>{e.subtitle}</p>
      </header>
      <ol className="pd-timeline-grid">
        {e.steps.map(([e, t, n]) => (
          <li data-reveal key={e}>
            <span className="pd-timeline-days">{e}</span>
            <h3>{t}</h3>
            <p>{n}</p>
          </li>
        ))}
      </ol>
      <p className="pd-note" data-reveal>
        {e.note}
      </p>
    </section>
  )
}
export function PackageHandover({ handover: e }) {
  return (
    <section className="pd-section pd-handover">
      <header className="pd-section-head" data-reveal>
        <h2>{e.title}</h2>
        <p>{e.subtitle}</p>
      </header>
      <ul className="pd-handover-grid">
        {e.items.map((e) => (
          <li data-reveal key={e}>
            <span aria-hidden="true">✓</span>
            {e}
          </li>
        ))}
      </ul>
    </section>
  )
}
export function PackageOrder({ plan: e, orderRef, onContinue: n }) {
  let [r, i] = useState(false),
    { wa: a, contact: o } = useSite()
  return (
    <section className="pd-order" id={e.order.id} ref={orderRef}>
      <div className="pd-section-head" data-reveal>
        <h2>{e.order.title}</h2>
        {e.order.intro && <p>{e.order.intro}</p>}
      </div>
      <div className="pd-order-summary" data-reveal>
        {e.summaryLabel || `${e.title} • ${e.price} ر.س`}
      </div>
      <label className="pd-consent" data-reveal>
        <input type="checkbox" checked={r} onChange={(e) => i(e.target.checked)} />
        <span>
          <RichParts parts={e.order.consent} />
        </span>
      </label>
      <button
        className="pd-continue"
        type="button"
        disabled={!r}
        onClick={() => {
          if (n) {
            n(e.id)
            return
          }
          if (!o.whatsapp) return
          let t = `السلام عليكم، أبغى أفعّل باقة «${e.title}» (${e.price} ر.س). قرأت مواصفاتها وشروطها ووافقت عليها.`
          window.open(a(t), '_blank', 'noopener,noreferrer')
        }}
      >
        متابعة طلب الباقة ←
      </button>
    </section>
  )
}
const setMeta = (sel, attr, value) => document.querySelector(sel)?.setAttribute(attr, value)

export function PackagePage({ id, onContinue }) {
  const { packages, plans } = useSite()
  const plan = packages[id]
  const card = plans.find((p) => p.id === id)
  const rootRef = useRef(null)
  const heroRef = useRef(null)
  const orderRef = useRef(null)
  const showBar = usePackageMotion(rootRef, heroRef, orderRef)

  useEffect(() => {
    document.title = plan?.seoTitle || 'الباقة غير موجودة | نُبرمِج'
    if (!plan) return
    const url = `https://nbarmej.com/packages/${plan.id}`
    setMeta('meta[name="description"]', 'content', plan.seoDescription)
    setMeta('link[rel="canonical"]', 'href', url)
    setMeta('meta[property="og:title"]', 'content', plan.seoTitle)
    setMeta('meta[property="og:description"]', 'content', plan.seoDescription)
    setMeta('meta[property="og:url"]', 'content', url)
  }, [plan])

  if (!plan) {
    return (
      <main id="main" className="pd-main pd-not-found" dir="rtl" lang="ar">
        <h1>الباقة غير موجودة</h1>
        <Link className="pd-button" href="/#packages">← العودة إلى الباقات</Link>
      </main>
    )
  }
  const { hero } = plan
  return (
    <main
      id="main"
      className="pd-main"
      dir="rtl"
      lang="ar"
      ref={rootRef}
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="pd-wrap">
        <Link className="pd-back" href="/#packages">
          <span aria-hidden="true">→</span>
          {' العودة إلى الباقات'}
        </Link>
        <section className="pd-hero" ref={heroRef}>
          <div className="pd-hero-copy">
            <div className="pd-eyebrow">{hero.eyebrow}</div>
            <h1 tabIndex="-1">
              {hero.heading.map((line, i) => (
                <span className={i === hero.heading.length - 1 ? 'pd-heading-accent' : ''} key={line}>{line}</span>
              ))}
            </h1>
            <p className="pd-lead">{hero.lead}</p>
            <ul className="pd-chips">{hero.chips.map((c) => <li key={c}>{c}</li>)}</ul>
            <div className="pd-price">
              {id === 'landing' && <span className="pd-price-label">سعر الباقة</span>}
              <strong>{plan.price}{' ر.س'}</strong>
              {id === 'landing' && <span className="pd-price-label">دفعة واحدة</span>}
            </div>
            <div className="pd-hero-actions">
              {hero.ctas.map((c) => (
                <Link className={c.primary ? 'pd-button pd-button-primary' : 'pd-button'} href={c.href} key={c.href}>{c.label}</Link>
              ))}
            </div>
          </div>
          <div className="pd-hero-art">
            {card && <img src={card.image} alt={card.imageAlt} draggable="false" />}
          </div>
          <span className="pd-hero-ring" aria-hidden="true" />
        </section>
        <PackageFeatures features={plan.features} id="features" />
        {plan.story && <PackageStory story={plan.story} />}
        <PackageSpecs specs={plan.specs} terms={plan.terms} />
        {plan.timeline && <PackageTimeline timeline={plan.timeline} />}
        {plan.handover && <PackageHandover handover={plan.handover} />}
        <PackageOrder plan={plan} orderRef={orderRef} onContinue={onContinue} />
      </div>
      <div className={`pd-sticky-bar${showBar ? ' is-visible' : ''}`} aria-hidden={!showBar} inert={!showBar}>
        <span>{plan.title}</span>
        <strong>{plan.price}{' ر.س'}</strong>
        <Link className="pd-sticky-cta" href="#order" tabIndex={showBar ? 0 : -1}>تفعيل الباقة ←</Link>
      </div>
    </main>
  )
}
