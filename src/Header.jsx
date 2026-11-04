import { useEffect, useState } from 'react'
import { useSite } from './SiteContext'
import { Icon, asset } from './ui'
import { safeUrl } from './content'
import { SocialIcon } from './icons'

export function Logo({ href: e = '#top' }) {
  let { brand: t } = useSite()
  return (
    <a href={e} className="logo" aria-label={`${t.name} — الرئيسية`}>
      <img className="logo-image logo-image-light" src={asset('/images/logo/logo-black.png')} alt="شعار نُبرمِج" />
      <img
        className="logo-image logo-image-dark"
        src={asset('/images/logo/logo-orange.png')}
        alt="شعار نُبرمِج"
        aria-hidden="true"
      />
    </a>
  )
}
export function ThemeToggle() {
  const [theme, setTheme] = useState('light') // نفس الـHTML المُولَّد مسبقًا، ثم نقرأ الثيم الفعلي
  // eslint-disable-next-line react-hooks/set-state-in-effect -- الثيم الفعلي يُقرأ بعد الرسم الأول ليتطابق مع HTML المُولَّد
  useEffect(() => setTheme(document.documentElement.dataset.theme), [])
  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.theme = next
    } catch {
      /* التخزين المحلي غير متاح */
    }
    setTheme(next)
  }
  return (
    <button className="icon-btn" onClick={flip} aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}>
      {theme === 'dark' ? Icon.sun : Icon.moon}
    </button>
  )
}
export function Header({ home: e = '' }) {
  let { wa: t, contact: n, sections: r } = useSite(),
    [i, a] = useState(false),
    o = [
      ['الرئيسية', e ? '/' : '#top'],
      ['خدماتنا', '#services'],
      ['أعمالنا', '#work'],
      ['آلية العمل', '#process'],
      ['الباقات', '#packages'],
      ['الأسئلة الشائعة', '#faq'],
    ].filter(([, e]) => !e.startsWith('#') || e === '#packages' || !r[e.slice(1)]?.off)
  return (
    <header className="header">
      <div className="wrap header-in">
        <Logo href={e ? '/' : '#top'} />
        <nav className={i ? 'nav open' : 'nav'} aria-label="التنقل الرئيسي">
          {o.map(([t, n]) => (
            <a href={n.startsWith('#') ? `${e}${n}` : n} onClick={() => a(false)} key={n}>
              {t}
            </a>
          ))}
          {!r.quote.off && (
            <a href={e + '#quote'} className="nav-quote" onClick={() => a(false)}>
              اطلب عرض سعر
            </a>
          )}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <a className="btn btn-primary btn-sm hide-sm" href={t(n.waMessage)} target="_blank" rel="noopener">
            {Icon.wa}
            {' تواصل واتساب'}
          </a>
          <button className="icon-btn burger" aria-label="القائمة" aria-expanded={i} onClick={() => a(!i)}>
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
export function Footer({ home: e = '' }) {
  let { socials: t, contact: n, hoursText: r, brand: i, wa: a, sections: o } = useSite(),
    s = t
      .map((e) => ({
        ...e,
        url: safeUrl(e.url),
      }))
      .filter((e) => e.url),
    c = [
      ['الرئيسية', e ? '/' : '#top', 'home'],
      ['خدماتنا', '#services', 'services'],
      ['نماذج الأعمال', '#work', 'work'],
      ['آلية العمل', '#process', 'process'],
      ['الباقات', '#packages', 'packages'],
      ['اطلب عرض سعر', '#quote', 'quote'],
      ['الأسئلة الشائعة', '#faq', 'faq'],
      ['سياسة الخصوصية', '/privacy', 'privacy'],
    ].filter(([, , e]) => ['packages', 'privacy'].includes(e) || !o[e]?.off),
    d = [
      {
        title: 'تصفح الموقع',
        keys: ['home', 'services', 'work', 'process', 'packages'],
      },
      {
        title: 'معلومات ومساعدة',
        keys: ['quote', 'faq', 'privacy'],
      },
    ].map((e) => ({
      ...e,
      links: c.filter(([, , t]) => e.keys.includes(t)),
    }))
  return (
    <footer className="footer">
      <div className={s.length ? 'wrap footer-in has-social' : 'wrap footer-in'}>
        <div className="footer-brand">
          <Logo href={e ? `${e}#top` : undefined} />
          <p className="muted">{i.tagline}</p>
          <a className="footer-wa" href={a(n.waMessage)} target="_blank" rel="noopener">
            <SocialIcon icon="whatsapp" />
            <span>تواصل معنا على واتساب</span>
            {Icon.arrow}
          </a>
        </div>
        <nav className="footer-links" aria-label="روابط الموقع">
          <div className="footer-link-groups">
            {d.map((t) => (
              <section className="footer-link-group" key={t.title}>
                <h3>{t.title}</h3>
                <ul>
                  {t.links.map(([t, n]) => (
                    <li key={n}>
                      <a href={n.startsWith('#') ? `${e}${n}` : n}>{t}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </nav>
        <address className="footer-contact">
          <h2>تواصل معنا</h2>
          {n.phone && (
            <a href={`tel:${n.phone}`}>
              <SocialIcon icon="phone" />
              <span dir="ltr">{n.phone}</span>
            </a>
          )}
          {n.email && (
            <a href={`mailto:${n.email}`}>
              <SocialIcon icon="mail" />
              <span dir="ltr">{n.email}</span>
            </a>
          )}
          {n.address && (
            <span className="footer-detail">
              <span className="footer-contact-icon">{Icon.location}</span>
              <span>{n.address}</span>
            </span>
          )}
          {r && (
            <span className="footer-hours">
              <span className="footer-contact-icon">{Icon.clock}</span>
              <span>{r}</span>
            </span>
          )}
          {n.registration && (
            <span className="footer-detail">
              <span className="footer-contact-icon">{Icon.registration}</span>
              <span>
                {' رقم السجل التجاري : '}
                <bdi dir="ltr">{n.registration}</bdi>
              </span>
            </span>
          )}
        </address>
        {s.length > 0 && (
          <nav className="footer-social" aria-label="حسابات التواصل الاجتماعي">
            <h2>تابعنا</h2>
            <ul className="socials">
              {s.map((e, t) => (
                <li key={t}>
                  <a href={e.url} target="_blank" rel="noopener noreferrer">
                    <SocialIcon icon={e.icon} />
                    {e.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="wrap footer-bottom">
        <p className="copy">
          {'© '}
          {new Date().getFullYear()} {i.name}. جميع الحقوق محفوظة.
        </p>
        <a href={e || '#top'}>العودة إلى الأعلى ↑</a>
      </div>
    </footer>
  )
}
export function Dock({ home: e = '' }) {
  let { contact: t, wa: n } = useSite()
  return (
    <div className="dock" role="complementary" aria-label="تواصل معنا">
      <a className="dock-wa" href={n(t.waMessage)} target="_blank" rel="noopener" aria-label="واتساب">
        {Icon.wa}
        <span>واتساب</span>
      </a>
      <a className="dock-quote" href={e + '#quote'} aria-label="اطلب عرض سعر">
        {Icon.quote}
        <span>عرض سعر</span>
      </a>
    </div>
  )
}
