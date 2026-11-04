import { useEffect } from 'react'
import { useSite } from './SiteContext'
import { Icon, Img, useReveal } from './ui'
import { Dock, Footer, Header } from './Header'
import { Faq, FinalCta, Hero, Problem, Process, Quote, Services, Start, Why, Work } from './sections'
import { PackagesSection } from './packages/PackagesSection'
import { servicePath } from './content'
import { PrivacyPage } from './privacy/PrivacyPage'

export const HOME_TITLE = 'تصميم موقع شركة في الرياض — مواقع تجيب لك طلبات ومبيعات | نُبرمِج'
export const HOME_DESC =
  'نصمم مواقع الشركات والمكاتب والمتاجر الإلكترونية بسعر واضح، مع حجز مواعيد وربط واتساب. نخدم الرياض وكل المملكة. اطلب عرض سعرك.'
export function setMeta(e, t, n) {
  document.querySelector(e)?.setAttribute(t, n)
}
export function HomePage() {
  let { brand: e, services: t, contact: n, wa: r } = useSite(),
    i = [
      {
        text: e.ribbon,
        linkText: e.ribbonLink,
        href: r(n.waMessage),
      },
      ...t
        .filter((e) => e.title && e.slug)
        .map((e) => ({
          text: e.title,
          linkText: 'اطلب سعر الخدمة ←',
          href: r(`السلام عليكم، أرغب بعرض سعر لخدمة: ${e.title}`),
        })),
    ]
  return (
    useReveal(),
    (
      <>
        <a className="skip" href="#main">
          تخطَّ إلى المحتوى
        </a>
        <div className="scroll-bar" aria-hidden="true" />
        {!e.ribbonOff && (
          <div className="ribbon" role="note">
            <div className="ribbon-track">
              {[0, 1].map((e) => (
                <div className="ribbon-group" aria-hidden={e ? 'true' : undefined} key={e}>
                  {i.map((t, n) => (
                    <span className="ribbon-item" key={`${t.text}-${n}`}>
                      {t.text}
                      <a href={t.href} target="_blank" rel="noopener noreferrer" tabIndex={e ? -1 : undefined}>
                        {t.linkText}
                      </a>
                      <b>✳</b>
                    </span>
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
          <PackagesSection />
          <Quote />
          <Why />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
        <Dock />
      </>
    )
  )
}
export function ServicePage({ slug: e }) {
  let { services: t, brand: n, wa: r } = useSite(),
    i = t.find((t) => t.slug === e)
  if (
    (useEffect(() => {
      i && (document.title = `${i.seoTitle || i.title} | ${n.name}`)
    }, [i, n.name]),
    !i)
  )
    return (
      <>
        <Header home="/" />
        <main id="main" className="wrap svc-page">
          <h1>الخدمة غير موجودة</h1>
          <a className="btn btn-primary" href="/#services">
            كل الخدمات
          </a>
        </main>
        <Footer home="/" />
      </>
    )
  let o = t.filter((e) => e !== i && e.slug)
  return (
    <>
      <a className="skip" href="#main">
        تخطَّ إلى المحتوى
      </a>
      <Header home="/" />
      <main id="main" className="wrap svc-page">
        <nav className="crumbs" aria-label="مسار التنقل">
          <a href="/">الرئيسية</a>
          {' / '}
          <a href="/#services">خدماتنا</a>
          {' / '}
          <span aria-current="page">{i.title}</span>
        </nav>
        <div className="svc-hero">
          <div>
            <h1>{i.seoTitle || i.title}</h1>
            <p className="svc-lead">{i.text}</p>
            <ul className="chips">
              {(i.tags || []).map((e, t) => (
                <li key={t}>{e}</li>
              ))}
            </ul>
            <div className="svc-ctas">
              <a
                className="btn btn-primary"
                href={r(`السلام عليكم، أرغب بعرض سعر لخدمة: ${i.title}`)}
                target="_blank"
                rel="noopener"
              >
                {Icon.wa}
                {' اطلب عرض سعر'}
              </a>
              <a className="btn btn-ghost" href="/#quote">
                جهّز طلبك بالتفصيل
              </a>
            </div>
          </div>
          <div className="service-img">
            <Img src={i.img} alt={`${i.title} — ${n.name}`} label="N/" eager={!0} />
          </div>
        </div>
        {i.about && (
          <section className="svc-about">
            {i.about
              .split(
                `
`,
              )
              .filter(Boolean)
              .map((e, t) => (
                <p key={t}>{e}</p>
              ))}
          </section>
        )}
        {i.features?.length > 0 && (
          <section className="svc-features">
            <h2>ماذا تحصل عليه</h2>
            <ul>
              {i.features.map((e, t) => (
                <li key={t}>{e}</li>
              ))}
            </ul>
          </section>
        )}
        {o.length > 0 && (
          <section className="svc-others">
            <h2>خدمات أخرى</h2>
            <ul>
              {o.map((e) => (
                <li key={e.slug}>
                  <a className="link" href={servicePath(e)}>
                    {e.title} {Icon.arrow}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <FinalCta />
      </main>
      <Footer home="/" />
      <Dock home="/" />
    </>
  )
}
export function PrivacyRoute() {
  return (
    <>
      <a className="skip" href="#main">
        تخطَّ إلى المحتوى
      </a>
      <Header home="/" />
      <PrivacyPage />
      <Footer home="/" />
      <Dock home="/" />
    </>
  )
}
