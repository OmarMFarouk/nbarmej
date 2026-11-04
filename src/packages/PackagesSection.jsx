import { Link } from '../router'
import { useSite } from '../SiteContext'

export function PlanCard({ plan: e }) {
  const { pkCopy: PACKAGES_COPY } = useSite()
  return (
    <article className="pk-card">
      <div className="pk-art">
        <img src={e.image} alt={e.imageAlt} loading="lazy" />
      </div>
      <div className="pk-card-body">
        <div className="pk-type">{e.type}</div>
        <h2>{e.cardTitle}</h2>
        <p className="pk-description">{e.cardDescription}</p>
        <div className="pk-price">
          <span dir="ltr">{e.price}</span> <span>ريال سعودي</span>
        </div>
        <ul className="pk-features">
          {e.cardFeatures.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <div className="pk-foot">
          <Link className="pk-button pk-button-alt" href={`/packages/${e.id}`}>
            {PACKAGES_COPY.viewDetails}
          </Link>
          <Link className="pk-button" href={`/packages/${e.id}#order`}>
            {PACKAGES_COPY.activate}
          </Link>
          <div className="pk-more">{e.footnote}</div>
        </div>
      </div>
    </article>
  )
}
export function PackagesSection() {
  const { pkCopy: PACKAGES_COPY, plans } = useSite()
  let { wa: e } = useSite(),
    t = e('السلام عليكم، أرغب بطلب دراسة لمشروعي والحصول على عرض فني ومالي. نوع المشروع: …')
  return (
    <section className="pk-page" dir="rtl" lang="ar" id="packages">
      <div className="pk-wrap">
        <header className="pk-hero">
          <div className="pk-eyebrow">{PACKAGES_COPY.eyebrow}</div>
          <h2>
            {PACKAGES_COPY.titleStart} <span className="pk-accent">{PACKAGES_COPY.titleAccent}</span>
          </h2>
          <p>{PACKAGES_COPY.intro}</p>
        </header>
        <div className="pk-packages">
          {plans.map((e) => (
            <PlanCard plan={e} key={e.id} />
          ))}
        </div>
        <section className="pk-note">
          <h2>{PACKAGES_COPY.noteTitle}</h2>
          <p>{PACKAGES_COPY.noteText}</p>
        </section>
        <section className="pk-special">
          <div>
            <h2>{PACKAGES_COPY.specialTitle}</h2>
            <p>{PACKAGES_COPY.specialText}</p>
          </div>
          <a className="pk-button" href={t} target="_blank" rel="noopener noreferrer">
            {PACKAGES_COPY.specialCta}
          </a>
        </section>
      </div>
    </section>
  )
}
