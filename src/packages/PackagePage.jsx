import { useEffect, useRef, useState } from 'react'
import { Link } from '../router'
import { useSite } from '../SiteContext'
import { PLANS } from './plans'

export function usePackageMotion(e, t, n) {
  let [r, i] = useState(false)
  return (
    useEffect(() => {
      let r = e.current
      if (!r) return
      let a = matchMedia('(prefers-reduced-motion: reduce)').matches,
        o
      !a &&
        'IntersectionObserver' in window &&
        (r.classList.add('pd-motion-ready'),
        (o = new IntersectionObserver(
          (e) => {
            e.forEach((e) => {
              e.isIntersecting && (e.target.classList.add('pd-visible'), o.unobserve(e.target))
            })
          },
          {
            threshold: 0.12,
            rootMargin: '0px 0px -5% 0px',
          },
        )),
        r.querySelectorAll('[data-reveal]').forEach((e) => {
          let t = [...e.parentElement.children].filter((e) => e.hasAttribute('data-reveal')).indexOf(e)
          e.style.setProperty('--pd-delay', `${Math.min(t, 5) * 80}ms`)
          let n = e.getBoundingClientRect()
          n.top < innerHeight && n.bottom > 0 ? e.classList.add('pd-visible') : o.observe(e)
        }))
      let s = true,
        c = false,
        l = () => i(!s && !c),
        u,
        d = () => {
          s = t.current?.getBoundingClientRect().bottom > 0
          let e = n.current?.getBoundingClientRect()
          ;((c = !!(e && e.top < innerHeight && e.bottom > 0)), l())
        }
      return (
        'IntersectionObserver' in window
          ? ((u = new IntersectionObserver(
              (e) => {
                ;(e.forEach((e) => {
                  ;(e.target === t.current && (s = e.isIntersecting), e.target === n.current && (c = e.isIntersecting))
                }),
                  l())
              },
              {
                threshold: 0.05,
              },
            )),
            t.current && u.observe(t.current),
            n.current && u.observe(n.current))
          : (window.addEventListener('scroll', d, {
              passive: true,
            }),
            window.addEventListener('resize', d),
            d()),
        () => {
          ;(o?.disconnect(),
            u?.disconnect(),
            window.removeEventListener('scroll', d),
            window.removeEventListener('resize', d),
            r.classList.remove('pd-motion-ready'))
        }
      )
    }, [t, n, e]),
    r
  )
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
      <header className="pd-section-head" data-reveal={!0}>
        <h2>{e.title}</h2>
        {e.subtitle && <p>{e.subtitle}</p>}
      </header>
      <ul className="pd-feature-grid">
        {e.items.map(([t, n], r) => (
          <li className="pd-feature" data-reveal={!0} key={t}>
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
    <section className="pd-story" data-reveal={!0}>
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
      <header className="pd-section-head" data-reveal={!0}>
        <h2>{e.title}</h2>
        {e.subtitle && <p>{e.subtitle}</p>}
      </header>
      {e.panelTitle && (
        <h3 className="pd-panel-title" data-reveal={!0}>
          {e.panelTitle}
        </h3>
      )}
      <div className="pd-table-wrap" data-reveal={!0}>
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
        <section className="pd-terms" id={t.id} data-reveal={!0}>
          <h3>{t.title}</h3>
          <ul>
            {t.items.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}
      {e.exclusions && (
        <section className="pd-terms" data-reveal={!0}>
          <h3>{e.exclusionsTitle}</h3>
          <ul className="pd-chip-list">
            {e.exclusions.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}
      {e.note && (
        <p className="pd-note" data-reveal={!0}>
          {e.note}
        </p>
      )}
      {e.requirements && (
        <section className="pd-terms" data-reveal={!0}>
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
      <header className="pd-section-head" data-reveal={!0}>
        <h2>{e.title}</h2>
        <p>{e.subtitle}</p>
      </header>
      <ol className="pd-timeline-grid">
        {e.steps.map(([e, t, n]) => (
          <li data-reveal={!0} key={e}>
            <span className="pd-timeline-days">{e}</span>
            <h3>{t}</h3>
            <p>{n}</p>
          </li>
        ))}
      </ol>
      <p className="pd-note" data-reveal={!0}>
        {e.note}
      </p>
    </section>
  )
}
export function PackageHandover({ handover: e }) {
  return (
    <section className="pd-section pd-handover">
      <header className="pd-section-head" data-reveal={!0}>
        <h2>{e.title}</h2>
        <p>{e.subtitle}</p>
      </header>
      <ul className="pd-handover-grid">
        {e.items.map((e) => (
          <li data-reveal={!0} key={e}>
            <span aria-hidden="true">✓</span>
            {e}
          </li>
        ))}
      </ul>
    </section>
  )
}
export function PackageOrder({ plan: e, orderRef: t, onContinue: n }) {
  let [r, i] = useState(false),
    { wa: a, contact: o } = useSite()
  return (
    <section className="pd-order" id={e.order.id} ref={t}>
      <div className="pd-section-head" data-reveal={!0}>
        <h2>{e.order.title}</h2>
        {e.order.intro && <p>{e.order.intro}</p>}
      </div>
      <div className="pd-order-summary" data-reveal={!0}>
        {e.summaryLabel || `${e.title} • ${e.price} ر.س`}
      </div>
      <label className="pd-consent" data-reveal={!0}>
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
export function PackagePage({ id: e, onContinue: t }) {
  let n = useSite().packages[e],
    r = useRef(null),
    i = useRef(null),
    a = useRef(null),
    o = usePackageMotion(r, i, a),
    s = PLANS.find((t) => t.id === e)
  return (
    useEffect(() => {
      if (((document.title = n?.seoTitle || 'الباقة غير موجودة | نُبرمِج'), !n)) return
      let e = `https://nbarmej.com/packages/${n.id}`
      ;(document.querySelector('meta[name="description"]')?.setAttribute('content', n.seoDescription),
        document.querySelector('link[rel="canonical"]')?.setAttribute('href', e),
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', n.seoTitle),
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', n.seoDescription),
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', e))
    }, [n]),
    n ? (
      <main
        id="main"
        className="pd-main"
        dir="rtl"
        lang="ar"
        ref={r}
        onCopy={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="pd-wrap">
          <Link className="pd-back" href="/#packages">
            <span aria-hidden="true">→</span>
            {' العودة إلى الباقات'}
          </Link>
          <section className="pd-hero" ref={i}>
            <div className="pd-hero-copy">
              <div className="pd-eyebrow">{n.hero.eyebrow}</div>
              <h1 tabIndex="-1">
                {n.hero.heading.map((e, t) => (
                  <span className={t === n.hero.heading.length - 1 ? 'pd-heading-accent' : ''} key={e}>
                    {e}
                  </span>
                ))}
              </h1>
              <p className="pd-lead">{n.hero.lead}</p>
              <ul className="pd-chips">
                {n.hero.chips.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <div className="pd-price">
                {e === 'landing' && <span className="pd-price-label">سعر الباقة</span>}
                <strong>
                  {n.price}
                  {' ر.س'}
                </strong>
                {e === 'landing' && <span className="pd-price-label">دفعة واحدة</span>}
              </div>
              <div className="pd-hero-actions">
                {n.hero.ctas.map((e) => (
                  <Link className={e.primary ? 'pd-button pd-button-primary' : 'pd-button'} href={e.href} key={e.href}>
                    {e.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="pd-hero-art">
              <img src={s.image} alt={s.imageAlt} draggable="false" />
            </div>
            <span className="pd-hero-ring" aria-hidden="true" />
          </section>
          <PackageFeatures features={n.features} id="features" />
          {n.story && <PackageStory story={n.story} />}
          <PackageSpecs specs={n.specs} terms={n.terms} />
          {n.timeline && <PackageTimeline timeline={n.timeline} />}
          {n.handover && <PackageHandover handover={n.handover} />}
          <PackageOrder plan={n} orderRef={a} onContinue={t} />
        </div>
        <div className={`pd-sticky-bar${o ? ' is-visible' : ''}`} aria-hidden={!o} inert={!o}>
          <span>{n.title}</span>
          <strong>
            {n.price}
            {' ر.س'}
          </strong>
          <Link className="pd-sticky-cta" href="#order" tabIndex={o ? 0 : -1}>
            تفعيل الباقة ←
          </Link>
        </div>
      </main>
    ) : (
      <main id="main" className="pd-main pd-not-found" dir="rtl" lang="ar">
        <h1>الباقة غير موجودة</h1>
        <Link className="pd-button" href="/#packages">
          ← العودة إلى الباقات
        </Link>
      </main>
    )
  )
}
