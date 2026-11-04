import { useSite } from '../SiteContext'
import { useEffect } from 'react'

export function PrivacyPage() {
  const PRIVACY = useSite().privacy
  return (
    useEffect(() => {
      window.scrollTo(0, 0)
    }, []),
    (
      <main id="main" className="privacy-main" dir="rtl" lang="ar">
        <h1>سياسة الخصوصية</h1>
        <p className="privacy-updated">
          {'آخر تحديث: '}
          {PRIVACY.updated}
        </p>
        <p className="privacy-lead">{PRIVACY.intro}</p>
        {PRIVACY.sections.map((e) => (
          <section className="privacy-section" key={e.title}>
            <h2>{e.title}</h2>
            {e.intro && <p>{e.intro}</p>}
            {e.items && (
              <ul>
                {e.items.map((e, t) => (
                  <li key={t}>
                    {Array.isArray(e) ? (
                      <>
                        <strong>{e[0]}</strong>
                        {e[1]}
                      </>
                    ) : (
                      e
                    )}
                  </li>
                ))}
              </ul>
            )}
            {e.paragraphs?.map((e) => (
              <p key={e}>{e}</p>
            ))}
            {e.note && <p>{e.note}</p>}
          </section>
        ))}
        <section className="privacy-section">
          <h2>{PRIVACY.contactTitle}</h2>
          <div className="privacy-contact">
            <p>
              <strong>{PRIVACY.contact.name}</strong>
            </p>
            <p>
              {'البريد: '}
              <a href={`mailto:${PRIVACY.contact.email}`}>{PRIVACY.contact.email}</a>
            </p>
            <p>
              {'الجوال / واتساب: '}
              <a href={PRIVACY.contact.phoneHref} dir="ltr">
                {PRIVACY.contact.phoneLabel}
              </a>
            </p>
            <p>
              {'العنوان: '}
              {PRIVACY.contact.address}
            </p>
          </div>
        </section>
      </main>
    )
  )
}
