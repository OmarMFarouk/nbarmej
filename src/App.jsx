import { useEffect, useRef, useState } from 'react'
import { SiteProvider, useSite } from './SiteContext'
import { SocialIcon, StartIcon } from './icons'
import { arDigits, safeUrl } from './content'

const countLabel = (n) => (n === 0 ? '' : n === 1 ? 'خدمة واحدة' : n === 2 ? 'خدمتان' : `${n} خدمات`)

const Icon = {
  wa: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.7-.6c-3-1.3-5-4.4-5.1-4.6-.2-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.3Z"/></svg>,
  phone: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>,
  mail: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg>,
  sun: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path stroke="currentColor" strokeWidth="2" d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>,
  moon: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z"/></svg>,
  quote: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M5 2h11l3 3v17l-2.3-1.6L14.4 22l-2.4-1.6L9.6 22l-2.3-1.6L5 22z"/><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 8h6M9 12h6M9 16h3"/></svg>,
  zoom: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16 16l5 5M10.5 7.500v6M7.500 10.500h6"/></svg>,
  close: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M5 5l14 14M19 5L5 19"/></svg>,
  arrow: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.2" d="M19 12H5M11 6l-6 6 6 6"/></svg>,
}

// ظهور العناصر تدريجيًا عند التمرير (يُهمَل مع تفضيل تقليل الحركة)
const REVEAL = '.sec-head, .card, .work-item, .stat, .points li, .quote, .final, .faq details, .why-head, .footer-in'
function useReveal() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return
      io.unobserve(e.target)
      e.target.classList.add('in')
      setTimeout(() => e.target.classList.remove('rv', 'in'), 1400)
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    const els = [...document.querySelectorAll(REVEAL)].filter((el) => el.getBoundingClientRect().top > innerHeight * 0.9)
    els.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.matches(REVEAL))
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 0.09 + 's')
      el.classList.add('rv')
      io.observe(el)
    })
    return () => io.disconnect()
  }, [])
}

function Logo() {
  const { brand } = useSite()
  return (
    <a href="#top" className="logo" aria-label={`${brand.name} — الرئيسية`}>
      <span className="logo-mark" aria-hidden="true">N/</span>
      <span className="logo-word">{brand.mark}</span>
    </a>
  )
}

function ThemeToggle() {
  const [theme, setTheme] = useState('light') // نفس الـHTML المُولَّد مسبقًا، ثم نقرأ الثيم الفعلي
  useEffect(() => setTheme(document.documentElement.dataset.theme), [])
  const flip = () => {
    const t = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = t
    try { localStorage.theme = t } catch {}
    setTheme(t)
  }
  return (
    <button className="icon-btn" onClick={flip} aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}>
      {theme === 'dark' ? Icon.sun : Icon.moon}
    </button>
  )
}

const asset = (p) => import.meta.env.BASE_URL.replace(/\/$/, '') + p

function Img({ src, alt, label, eager }) {
  const [ok, setOk] = useState(true)
  return ok
    ? <img src={asset(src)} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" onError={() => setOk(false)} />
    : <div className="img-ph" role="img" aria-label={alt}><span>{label}</span></div>
}

function Header() {
  const { wa, contact, sections } = useSite()
  const [open, setOpen] = useState(false)
  const links = [['خدماتنا', '#services'], ['أعمالنا', '#work'], ['آلية العمل', '#process'], ['الأسعار', '#pricing'], ['الأسئلة الشائعة', '#faq']].filter(([, h]) => !sections[h.slice(1)]?.off)
  return (
    <header className="header">
      <div className="wrap header-in">
        <Logo />
        <nav className={open ? 'nav open' : 'nav'} aria-label="التنقل الرئيسي">
          {links.map(([t, h]) => <a key={h} href={h} onClick={() => setOpen(false)}>{t}</a>)}
          {!sections.quote.off && <a href="#quote" className="nav-quote" onClick={() => setOpen(false)}>اطلب عرض سعر</a>}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <a className="btn btn-primary btn-sm hide-sm" href={wa(contact.waMessage)} target="_blank" rel="noopener">{Icon.wa} تواصل واتساب</a>
          <button className="icon-btn burger" aria-label="القائمة" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const { hero, brand, stack, wa, contact } = useSite()
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title">
            {hero.title1} {hero.title2}<br /> <em>{hero.accent}</em>.
          </h1>
          <p className="lead">{hero.lead}</p>
          <div className="cta-row">
            <a className="btn btn-primary btn-lg" href={wa(contact.waMessage)} target="_blank" rel="noopener">{Icon.wa} {hero.cta1}</a>
            <a className="btn btn-ghost btn-lg" href="#work">{hero.cta2} {Icon.arrow}</a>
          </div>
          <ul className="trust">{hero.trust.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
        <div className="hero-visual">
          <div className="hero-frame"><Img eager src={hero.image} alt={`فريق ${brand.name} أثناء العمل`} label="N/" /></div>
          <div className="hero-badge">
            <strong>{hero.badgeNum}</strong>
            <span>{hero.badgeText}</span>
          </div>
        </div>
      </div>
      {!hero.marqueeOff && stack.length > 0 && <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...stack, ...stack].map((s, i) => <span key={i}>{s}<b>✳</b></span>)}
        </div>
      </div>}
    </section>
  )
}

function Stats() {
  const { stats } = useSite()
  return (
    <section className="wrap stats" aria-label="أرقامنا">
      {stats.map((s, i) => (
        <div key={i} className="stat"><strong>{s.n}</strong><span>{s.l}</span></div>
      ))}
    </section>
  )
}

function SectionHead({ tag, title, text }) {
  return (
    <div className="sec-head">
      <p className="tag">{tag}</p>
      <h2>{title}</h2>
      {text && <p className="muted">{text}</p>}
    </div>
  )
}

function Start() {
  const { start, sections: { start: sec }, wa } = useSite()
  if (useSite().sections.start.off) return null
  return (
    <section className="section wrap" id="start">
      <SectionHead tag={sec.tag} title={sec.title} />
      <div className="start">
        {start.map((x, i) => (
          <article key={i} className="card start-card">
            <span className="start-badge"><StartIcon name={x.icon} /></span>
            <h3>{x.title}</h3>
            <p>{x.text}</p>
            <a className="link" href={wa(`السلام عليكم، أبغى ${x.title}.`)} target="_blank" rel="noopener">{x.cta || 'أبغى هذا'} {Icon.arrow}</a>
          </article>
        ))}
      </div>
    </section>
  )
}

function Problem() {
  const { points, sections: { problem: sec }, wa, contact } = useSite()
  if (useSite().sections.problem.off) return null
  return (
    <section className="section wrap" id="problem">
      <SectionHead tag={sec.tag} title={sec.title} text={sec.text} />
      <p className="tag">{sec.tag2}</p>
      <ul className="points">{points.map((p, i) => <li key={i} className="card">{p.t}</li>)}</ul>
      <a className="btn btn-primary btn-lg" href={wa(contact.waMessage)} target="_blank" rel="noopener">{Icon.wa} {sec.cta}</a>
    </section>
  )
}

function Pricing() {
  const { pricing, sections: { pricing: sec } } = useSite()
  if (useSite().sections.pricing.off) return null
  return (
    <section className="section wrap" id="pricing">
      <SectionHead tag={sec.tag} title={sec.title} />
      <div className="pricing">
        {pricing.map((p, i) => (
          <article key={i} className="card price-card">
            <h3>{p.name}</h3>
            <strong className="price">{p.price}</strong>
            <p>{p.text}</p>
            <a className="btn btn-primary btn-sm" href="#quote">{p.cta || 'احسب تكلفة مشروعي'}</a>
          </article>
        ))}
      </div>
    </section>
  )
}

function Why() {
  const { sections: { why: sec } } = useSite()
  if (useSite().sections.why.off) return null
  return (
    <>
      <section className="section wrap why-head"><SectionHead tag={sec.tag} title={sec.title} /></section>
      <Stats />
    </>
  )
}

function Services() {
  const { services, sections: { services: sec }, brand, wa } = useSite()
  if (useSite().sections.services.off) return null
  return (
    <section className="section wrap" id="services">
      <SectionHead tag={sec.tag} title={sec.title} text={sec.text} />
      <div className="services">
        {services.map((s, i) => (
          <article key={i} className="card service">
            <div className="service-img"><Img src={s.img} alt={`${s.title} — ${brand.name}`} label="N/" /></div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <ul className="chips">{(s.tags || []).map((t, j) => <li key={j}>{t}</li>)}</ul>
            <a className="link" href={wa(`السلام عليكم، أرغب بعرض سعر لخدمة: ${s.title}`)} target="_blank" rel="noopener">
              {s.cta || sec.cta} {Icon.arrow}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

// معاينة صور الأعمال: Esc للإغلاق، والأسهم للتنقل
function Lightbox({ items, i, setI, wa }) {
  const w = items[i]
  const n = items.length
  const closeRef = useRef(null)
  const go = (d) => setI((i + d + n) % n)
  useEffect(() => {
    const prev = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') setI(-1)
      else if (e.key === 'ArrowLeft') go(1)
      else if (e.key === 'ArrowRight') go(-1)
    }
    addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => { removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.() }
  })
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={w.title} onClick={() => setI(-1)}>
      <div className="lb-card" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="lb-close icon-btn" onClick={() => setI(-1)} aria-label="إغلاق">{Icon.close}</button>
        <div className="lb-stage">
          {n > 1 && <button type="button" className="lb-nav lb-prev icon-btn" onClick={() => go(-1)} aria-label="السابق">{Icon.arrow}</button>}
          <img key={w.img} src={asset(w.img)} alt={w.title} />
          {n > 1 && <button type="button" className="lb-nav lb-next icon-btn" onClick={() => go(1)} aria-label="التالي">{Icon.arrow}</button>}
        </div>
        <div className="lb-info">
          <div>
            <h3>{w.title}</h3>
            <p className="muted">{w.type}</p>
          </div>
          <span className="lb-count">{arDigits(i + 1)} / {arDigits(n)}</span>
          <a className="btn btn-primary btn-sm" href={wa(`السلام عليكم، ${w.cta || 'أبغى نموذج مشابه'} (مثل مشروع ${w.title}).`)} target="_blank" rel="noopener">{Icon.wa} {w.cta || 'أبغى نموذج مشابه'}</a>
        </div>
      </div>
    </div>
  )
}

function Work() {
  const { projects, sections: { work: sec }, brand, wa } = useSite()
  const [open, setOpen] = useState(-1)
  if (useSite().sections.work.off) return null
  return (
    <section className="section wrap" id="work">
      <SectionHead tag={sec.tag} title={sec.title} />
      <div className="work">
        {projects.map((w, i) => (
          <article key={i} className="work-item">
            <button type="button" className="work-img work-zoom" onClick={() => setOpen(i)} aria-label={`معاينة صورة ${w.title}`}>
              <Img src={w.img} alt={`${w.title} — ${w.type} من تنفيذ ${brand.name}`} label={w.title} />
              <span className="zoom-badge">{Icon.zoom} معاينة</span>
            </button>
            <div className="work-meta">
              <div><h3>{w.title}</h3><p className="muted">{[w.type, w.year].filter(Boolean).join(' · ')}</p></div>
              {w.result && <span className="result">{w.result}</span>}
            </div>
            {w.solution && <p className="work-sol"><strong>الحل:</strong> {w.solution}</p>}
            <a className="link" href={wa(`السلام عليكم، ${w.cta || 'أبغى نموذج مشابه'} (مثل مشروع ${w.title}).`)} target="_blank" rel="noopener">{w.cta || 'أبغى نموذج مشابه'} {Icon.arrow}</a>
          </article>
        ))}
      </div>
      {open >= 0 && <Lightbox items={projects} i={open} setI={setOpen} wa={wa} />}
    </section>
  )
}

function Process() {
  const { process, sections: { process: sec } } = useSite()
  if (useSite().sections.process.off) return null
  return (
    <section className="section wrap" id="process">
      <SectionHead tag={sec.tag} title={sec.title} />
      <ol className="process">
        {process.map((p, i) => (
          <li key={i} className="card">
            <span className="step">{arDigits(String(i + 1).padStart(2, '0'))}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function QuoteInner() {
  const { services, quote: opts, sections: { quote: sec }, brand, wa } = useSite()
  const [f, setF] = useState({ service: [], budget: '', timeline: '', name: '', details: '' })
  const toggleService = (v) => setF((s) => ({
    ...s, service: s.service.includes(v) ? s.service.filter((x) => x !== v) : [...s.service, v],
  }))
  const dirty = f.service.length > 0 || f.budget || f.timeline || f.name || f.details
  const sendRef = useRef(null) // زر الإرسال هو المرساة: الشريط يظهر حين يغيب عن الشاشة
  const [passed, setPassed] = useState(false) // مرّ المستخدم بالمعاينة للأسفل
  useEffect(() => {
    const el = sendRef.current
    const io = new IntersectionObserver(
      ([e]) => setPassed(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const msg = [
    `السلام عليكم ${brand.name}، أرغب بعرض سعر.`,
    f.name && `الاسم: ${f.name}`,
    f.service.length && `الخدمات: ${f.service.join('، ')}`,
    f.budget && `الميزانية: ${f.budget}`,
    f.timeline && `المدة: ${f.timeline}`,
    f.details && `تفاصيل: ${f.details}`,
  ].filter(Boolean).join('\n')

  return (
    <section className="section wrap" id="quote">
      <div className="quote">
        <div className="quote-side">
          <p className="tag">{sec.tag}</p>
          <h2>{sec.title}</h2>
          <p className="muted">{sec.text}</p>
          <pre className="preview" aria-label="معاينة الرسالة">{msg}</pre>
        </div>
        <form className="quote-form" onSubmit={(e) => { e.preventDefault(); window.open(wa(msg), '_blank', 'noopener') }}>
          <fieldset>
            <legend>ما الذي تحتاجه؟ <span className="hint">(يمكن اختيار أكثر من خدمة)</span></legend>
            <div className="opt-grid">
              {services.map((s) => s.title).filter(Boolean).map((o) => {
                const on = f.service.includes(o)
                return (
                  <button type="button" key={o} className={on ? 'opt on' : 'opt'} aria-pressed={on} onClick={() => toggleService(o)}>
                    <span className="tick" aria-hidden="true" />{o}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div className="field-row">
            <label>الميزانية التقريبية
              <select value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })}>
                <option value="">اختر…</option>
                {opts.budget.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label>المدة المطلوبة
              <select value={f.timeline} onChange={(e) => setF({ ...f, timeline: e.target.value })}>
                <option value="">اختر…</option>
                {opts.timeline.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          </div>
          <div className="field-row">
            <label>الاسم
              <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="مثال: سارة" autoComplete="name" />
            </label>
            <label>تفاصيل إضافية
              <input value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} placeholder="جملة عن فكرتك" />
            </label>
          </div>
          <button ref={sendRef} className="btn btn-primary btn-lg btn-block" type="submit">{Icon.wa} أرسل الطلب على واتساب</button>
        </form>
      </div>
      {dirty && passed && (
        <div className="preview-float" role="status">
          <p>
            <strong>طلبك جاهز</strong>
            <span>{[countLabel(f.service.length), f.budget, f.timeline].filter(Boolean).join(' · ') || 'أكمل التفاصيل'}</span>
          </p>
          <a className="btn btn-primary btn-sm" href={wa(msg)} target="_blank" rel="noopener">{Icon.wa} إرسال</a>
        </div>
      )}
    </section>
  )
}

function Quote() {
  return useSite().sections.quote.off ? null : <QuoteInner />
}

function Faq() {
  const { faq, sections: { faq: sec } } = useSite()
  if (useSite().sections.faq.off) return null
  return (
    <section className="section wrap faq-sec" id="faq">
      <SectionHead tag={sec.tag} title={sec.title} />
      <div className="faq">
        {faq.map((x, i) => (
          <details key={i}><summary>{x.q}</summary><p>{x.a}</p></details>
        ))}
      </div>
      {/* innerHTML وليس نصًا: React يهرّب علامات التنصيص في الـHTML المُولَّد فيفسد الـJSON */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
      }).replace(/</g, '\\u003c') }} />
    </section>
  )
}

function FinalCta() {
  const { sections: { final: sec }, contact, wa } = useSite()
  if (useSite().sections.final.off) return null
  return (
    <section className="wrap final">
      <div>
        <h2>{sec.title.split('\n').map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>)}</h2>
        {sec.text && <p className="final-text">{sec.text}</p>}
      </div>
      <a className="btn btn-invert btn-lg" href={wa(contact.waMessage)} target="_blank" rel="noopener">{Icon.wa} {sec.cta}</a>
    </section>
  )
}

function Footer() {
  const { socials: all, contact: CONTACT, hoursText, brand, wa } = useSite()
  const socials = all.map((s) => ({ ...s, url: safeUrl(s.url) })).filter((s) => s.url)
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div>
          <Logo />
          <p className="muted">{brand.tagline}</p>
        </div>
        <address>
          {CONTACT.phone && <a href={`tel:${CONTACT.phone}`} dir="ltr">{CONTACT.phone}</a>}
          {CONTACT.email && <a href={`mailto:${CONTACT.email}`} dir="ltr">{CONTACT.email}</a>}
          {CONTACT.address && <span>{CONTACT.address}</span>}
          {hoursText && <span className="muted">{hoursText}</span>}
          <a href={wa(CONTACT.waMessage)} target="_blank" rel="noopener">واتساب</a>
        </address>
        {socials.length > 0 && (
          <ul className="socials">{socials.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noopener"><SocialIcon icon={s.icon} /> {s.name}</a></li>)}</ul>
        )}
      </div>
      <p className="wrap copy">© {new Date().getFullYear()} {brand.name}. جميع الحقوق محفوظة.</p>
    </footer>
  )
}

// وسائل التواصل ظاهرة دائمًا: شريط جانبي على الحاسب، وشريط سفلي على الجوال
function Dock() {
  const { contact: CONTACT, wa } = useSite()
  return (
    <div className="dock" role="complementary" aria-label="تواصل معنا">
      <a className="dock-wa" href={wa(CONTACT.waMessage)} target="_blank" rel="noopener" aria-label="واتساب">{Icon.wa}<span>واتساب</span></a>
      <a className="dock-quote" href="#quote" aria-label="اطلب عرض سعر">{Icon.quote}<span>عرض سعر</span></a>
    </div>
  )
}

function Page() {
  const { brand } = useSite()
  useReveal()
  return (
    <>
      <a className="skip" href="#main">تخطَّ إلى المحتوى</a>
      <div className="scroll-bar" aria-hidden="true" />
      {!brand.ribbonOff && (
        <div className="ribbon" role="note">
          <div className="ribbon-track">
            {[0, 1].map((g) => (
              <div className="ribbon-group" key={g} aria-hidden={g ? 'true' : undefined}>
                {Array.from({ length: 4 }, (_, i) => (
                  <span className="ribbon-item" key={i}>{brand.ribbon}<a href="#quote" tabIndex={g || i ? -1 : undefined}>{brand.ribbonLink}</a><b>✳</b></span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <Header />
      <main id="main">
        <Hero />
        <Start />
        <Problem />
        <Services />
        <Work />
        <Process />
        <Pricing />
        <Quote />
        <Why />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <Dock />
    </>
  )
}

export default function App({ initial }) {
  return <SiteProvider initial={initial}><Page /></SiteProvider>
}
