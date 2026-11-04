import { useEffect, useRef, useState } from 'react'
import { useSite } from './SiteContext'
import { QuoteForm } from './QuoteForm'
import { Icon, Img, SectionHead, asset } from './ui'
import { StartIcon } from './icons'
import { arDigits, servicePath } from './content'

export function Hero() {
  let { hero: e, stack: t, wa: n, contact: r } = useSite()
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title">
            <span className="hero-title-main">
              {e.title1}
              {e.title2 ? ` ${e.title2}` : ''}
            </span>
            <span className="hero-title-accent">
              <em>{e.accent}</em>.
            </span>
          </h1>
          <p className="lead">{e.lead}</p>
          <div className="cta-row">
            <a className="btn btn-primary btn-lg" href={n(r.waMessage)} target="_blank" rel="noopener">
              {Icon.wa} {e.cta1}
            </a>
            <a className="btn btn-ghost btn-lg" href={e.cta2Href || '#work'}>
              {e.cta2} {Icon.arrow}
            </a>
          </div>
          <ul className="trust">
            {e.trust.map((e, t) => (
              <li key={t}>{e}</li>
            ))}
          </ul>
        </div>
        <div className="hero-visual">
          <div className="hero-frame hero-skyline-frame">
            <img
              src={asset('/images/riyadh-skyline-animated.svg')}
              alt="رسم متحرك لأفق مدينة الرياض مع شعار نُبرمِج"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>
      {!e.marqueeOff && t.length > 0 && (
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...t, ...t].map((e, t) => (
              <span key={t}>
                {e}
                <b>✳</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
export function Start() {
  let {
    start: e,
    sections: { start: t },
    wa: n,
  } = useSite()
  return useSite().sections.start.off ? null : (
    <section className="section wrap" id="start">
      <SectionHead tag={t.tag} title={t.title} />
      <div className="start">
        {e.map((e, t) => (
          <article className="card start-card" key={t}>
            <span className="start-badge">
              <StartIcon name={e.icon} />
            </span>
            <h3>{e.title}</h3>
            <p>{e.text}</p>
            <a className="link" href={n(`السلام عليكم، أبغى ${e.title}.`)} target="_blank" rel="noopener">
              {e.cta || 'أبغى هذا'} {Icon.arrow}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
export function Problem() {
  let {
    points: e,
    sections: { problem: t },
    wa: n,
    contact: r,
  } = useSite()
  return useSite().sections.problem.off ? null : (
    <section className="section wrap" id="problem">
      <SectionHead tag={t.tag} title={t.title} text={t.text} />
      <p className="tag">{t.tag2}</p>
      <ul className="points">
        {e.map((e, t) => (
          <li className="card" key={t}>
            {e.t}
          </li>
        ))}
      </ul>
      <a className="btn btn-primary btn-lg" href={n(r.waMessage)} target="_blank" rel="noopener">
        {Icon.wa} {t.cta}
      </a>
    </section>
  )
}
export function Why() {
  let {
    sections: { why: e },
  } = useSite()
  return useSite().sections.why.off ? null : (
    <section className="section wrap why-section" id="why">
      <SectionHead tag={e.tag} title={e.title} />
      <div className="why-banner">
        {e.items.map(({ title: t, description: n }, r) => (
          <article className="why-banner-card" tabIndex="0" key={t}>
            <span
              className="why-banner-part"
              style={{
                '--banner-position': `${100 - (r * 100) / Math.max(e.items.length - 1, 1)}%`,
              }}
              aria-hidden="true"
            />
            <div className="why-banner-caption">
              <h3>{t}</h3>
              <p>{n}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
export function Services() {
  let {
    services: e,
    sections: { services: t },
    brand: n,
    wa: r,
  } = useSite()
  return useSite().sections.services.off ? null : (
    <section className="section wrap" id="services">
      <SectionHead tag={t.tag} title={t.title} text={t.text} />
      <div className="services">
        {e.map((e, i) => (
          <article className="card service" key={i}>
            <div className="service-img">
              <Img src={e.img} alt={`${e.title} — ${n.name}`} label="N/" />
            </div>
            <h3>{e.title}</h3>
            <p>{e.text}</p>
            <ul className="chips">
              {(e.tags || []).map((e, t) => (
                <li key={t}>{e}</li>
              ))}
            </ul>
            <div className="service-links">
              <a
                className="link"
                href={r(`السلام عليكم، أرغب بعرض سعر لخدمة: ${e.title}`)}
                target="_blank"
                rel="noopener"
              >
                {e.cta || t.cta} {Icon.arrow}
              </a>
              {servicePath(e) && (
                <a className="link link-muted" href={servicePath(e)}>
                  تفاصيل الخدمة
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
export function Lightbox({ items: e, i: t, setI: n, wa: r }) {
  let i = e[t],
    a = e.length,
    o = useRef(null),
    c = (e) => n((t + e + a) % a)
  return (
    useEffect(() => {
      let e = document.activeElement,
        t = (e) => {
          e.key === 'Escape' ? n(-1) : e.key === 'ArrowLeft' ? c(1) : e.key === 'ArrowRight' && c(-1)
        }
      return (
        addEventListener('keydown', t),
        (document.body.style.overflow = 'hidden'),
        o.current?.focus(),
        () => {
          ;(removeEventListener('keydown', t), (document.body.style.overflow = ''), e?.focus?.())
        }
      )
    }),
    (
      <div className="lb" role="dialog" aria-modal="true" aria-label={i.title} onClick={() => n(-1)}>
        <div className="lb-card" onClick={(e) => e.stopPropagation()}>
          <button ref={o} type="button" className="lb-close icon-btn" onClick={() => n(-1)} aria-label="إغلاق">
            {Icon.close}
          </button>
          <div className="lb-stage">
            {a > 1 && (
              <button type="button" className="lb-nav lb-prev icon-btn" onClick={() => c(-1)} aria-label="السابق">
                {Icon.arrow}
              </button>
            )}
            <img src={asset(i.img)} alt={i.title} key={i.img} />
            {a > 1 && (
              <button type="button" className="lb-nav lb-next icon-btn" onClick={() => c(1)} aria-label="التالي">
                {Icon.arrow}
              </button>
            )}
          </div>
          <div className="lb-info">
            <div>
              <h3>{i.title}</h3>
              <p className="muted">{i.type}</p>
            </div>
            <span className="lb-count">
              {arDigits(t + 1)}
              {' / '}
              {arDigits(a)}
            </span>
            <a
              className="btn btn-primary btn-sm"
              href={r(`السلام عليكم، ${i.cta || 'أبغى نموذج مشابه'} (مثل مشروع ${i.title}).`)}
              target="_blank"
              rel="noopener"
            >
              {Icon.wa} {i.cta || 'أبغى نموذج مشابه'}
            </a>
          </div>
        </div>
      </div>
    )
  )
}
export function Work() {
  let {
      projects: e,
      sections: { work: t },
      brand: n,
      wa: r,
    } = useSite(),
    [i, a] = useState(-1)
  return useSite().sections.work.off ? null : (
    <section className="section wrap" id="work">
      <SectionHead tag={t.tag} title={t.title} />
      <div className="work">
        {e.map((e, t) => (
          <article className="work-item" key={t}>
            <button
              type="button"
              className="work-img work-zoom"
              onClick={() => a(t)}
              aria-label={`معاينة صورة ${e.title}`}
            >
              <Img src={e.img} alt={`${e.title} — ${e.type} من تنفيذ ${n.name}`} label={e.title} />
              <span className="zoom-badge">
                {Icon.zoom}
                {' معاينة'}
              </span>
            </button>
            <div className="work-meta">
              <div>
                <h3>{e.title}</h3>
                <p className="muted">{[e.type, e.year].filter(Boolean).join(' · ')}</p>
              </div>
              {e.result && <span className="result">{e.result}</span>}
            </div>
            {e.solution && (
              <p className="work-sol">
                <strong>الحل:</strong> {e.solution}
              </p>
            )}
            <a
              className="link"
              href={r(`السلام عليكم، ${e.cta || 'أبغى نموذج مشابه'} (مثل مشروع ${e.title}).`)}
              target="_blank"
              rel="noopener"
            >
              {e.cta || 'أبغى نموذج مشابه'} {Icon.arrow}
            </a>
          </article>
        ))}
      </div>
      {i >= 0 && <Lightbox items={e} i={i} setI={a} wa={r} />}
    </section>
  )
}
export function Process() {
  let {
    process: e,
    sections: { process: t },
  } = useSite()
  return useSite().sections.process.off ? null : (
    <section className="section wrap" id="process">
      <SectionHead tag={t.tag} title={t.title} />
      <ol className="process">
        {e.map((e, t) => (
          <li className="card" key={t}>
            <span className="step">{arDigits(String(t + 1).padStart(2, '0'))}</span>
            <h3>{e.t}</h3>
            <p>{e.d}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
export function Quote() {
  return useSite().sections.quote.off ? null : <QuoteForm />
}
export function Faq() {
  let {
      faq: e,
      sections: { faq: t },
    } = useSite(),
    [n, r] = useState({})
  return useSite().sections.faq.off ? null : (
    <section className="section wrap faq-sec" id="faq">
      <SectionHead tag={t.tag} title={t.title} />
      <div className="faq">
        {e.map((e, t) => (
          <article className={`faq-item${n[t] ? ' is-open' : ''}`} key={e.q}>
            <h3>
              <button
                className="faq-question"
                type="button"
                id={`faq-question-${t}`}
                aria-expanded={!!n[t]}
                aria-controls={`faq-answer-${t}`}
                onClick={() =>
                  r((e) => ({
                    ...e,
                    [t]: !e[t],
                  }))
                }
              >
                <span>{e.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div
              className="faq-answer"
              id={`faq-answer-${t}`}
              role="region"
              aria-labelledby={`faq-question-${t}`}
              aria-hidden={!n[t]}
            >
              <div className="faq-answer-inner">
                <p>{e.a}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: e.map((e) => ({
              '@type': 'Question',
              name: e.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: e.a,
              },
            })),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </section>
  )
}
export function FinalCta() {
  let {
    sections: { final: e },
    contact: t,
    wa: n,
  } = useSite()
  return useSite().sections.final.off ? null : (
    <section className="wrap final">
      <div>
        <h2>
          {e.title
            .split(
              `
`,
            )
            .map((e, t) => (
              <span key={t}>
                {t > 0 && <br />}
                {e}
              </span>
            ))}
        </h2>
        {e.text && <p className="final-text">{e.text}</p>}
      </div>
      <a className="btn btn-invert btn-lg" href={n(t.waMessage)} target="_blank" rel="noopener">
        {Icon.wa} {e.cta}
      </a>
    </section>
  )
}
