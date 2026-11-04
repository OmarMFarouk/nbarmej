import { useEffect, useRef, useState } from 'react'
import { useSite } from './SiteContext'
import { Icon, countLabel } from './ui'
import { getAttribution, trackRequest } from './tracking'

const uuid = () =>
  crypto.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 3) | 8).toString(16)
  })

const EMPTY = { service: [], budget: '', timeline: '', name: '', phone: '', details: '', company_site: '' }
const MSG = {
  name: 'اكتب اسمك',
  phone: 'اكتب رقم جوال صحيح، مثال: 05XXXXXXXX',
  service: 'اختر خدمة واحدة على الأقل',
}
const SERVER_ERR = {
  locked: 'محاولات كثيرة، جرّب بعد قليل أو تواصل معنا مباشرة.',
  too_fast: 'تأكد من تعبئة النموذج ثم أعد المحاولة.',
}

const validate = (f) => {
  const e = {}
  if (f.name.trim().length < 2) e.name = MSG.name
  if (f.phone.replace(/\D/g, '').length < 9) e.phone = MSG.phone
  if (!f.service.length) e.service = MSG.service
  return e
}

export function QuoteForm() {
  const { services, quote: opts, sections: { quote: sec }, brand } = useSite()
  const [f, setF] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [order, setOrder] = useState('')
  const [failMsg, setFailMsg] = useState('')
  const key = useRef(uuid()) // مفتاح الإرسال: يمنع تكرار الطلب عند الضغط المتكرر أو إعادة المحاولة
  const shownAt = useRef(Date.now())
  const sendRef = useRef(null) // زر الإرسال هو المرساة: الشريط العائم يظهر حين يغيب عن الشاشة
  const [passed, setPassed] = useState(false)

  const set = (patch) => setF((s) => ({ ...s, ...patch }))
  const toggleService = (v) => set({ service: f.service.includes(v) ? f.service.filter((x) => x !== v) : [...f.service, v] })
  const dirty = f.service.length > 0 || f.budget || f.timeline || f.name || f.phone || f.details

  useEffect(() => {
    const el = sendRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPassed(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [status])

  const preview = [
    `طلب عرض سعر — ${brand.name}`,
    f.name && `الاسم: ${f.name}`,
    f.phone && `الجوال: ${f.phone}`,
    f.service.length && `الخدمات: ${f.service.join('، ')}`,
    f.budget && `الميزانية: ${f.budget}`,
    f.timeline && `المدة: ${f.timeline}`,
    f.details && `تفاصيل: ${f.details}`,
  ].filter(Boolean).join('\n')

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const errs = validate(f)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.querySelector('.quote-form [aria-invalid="true"], .quote-form .field-err')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    setStatus('sending')
    setFailMsg('')
    try {
      const r = await fetch('/api/?a=request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, key: key.current, elapsed: (Date.now() - shownAt.current) / 1000, attr: getAttribution() }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.status === 422 && j.fields) {
        setErrors(Object.fromEntries(Object.keys(j.fields).map((k) => [k, MSG[k] || 'تحقق من هذا الحقل'])))
        setStatus('idle')
        return
      }
      if (!r.ok || !j.ok) throw new Error(j.error || 'server')
      if (!j.dup) trackRequest(j.order_no) // التحويل بعد نجاح الحفظ فقط، وبدون تكرار
      setOrder(j.order_no)
      setStatus('done')
    } catch (err) {
      setFailMsg(SERVER_ERR[err.message] || 'تعذر إرسال الطلب الآن. حاول مرة أخرى، أو تواصل معنا مباشرة.')
      setStatus('error')
    }
  }

  const again = () => {
    key.current = uuid()
    shownAt.current = Date.now()
    setF(EMPTY)
    setErrors({})
    setStatus('idle')
  }

  const sending = status === 'sending'
  return (
    <section className="section wrap" id="quote">
      <div className="quote">
        <div className="quote-side">
          <p className="tag">{sec.tag}</p>
          <h2>{sec.title}</h2>
          <p className="muted">{sec.text}</p>
          <pre className="preview" aria-label="معاينة الطلب">{preview}</pre>
        </div>
        {status === 'done' ? (
          <div className="quote-form quote-ok" role="status" aria-live="polite">
            <strong>✓ وصلنا طلبك! بنراجعه ونتواصل معك بالخطوة الجاية.</strong>
            <p>رقم طلبك: <b dir="ltr">{order}</b></p>
            <button type="button" className="btn btn-ghost" onClick={again}>إرسال طلب آخر</button>
          </div>
        ) : (
          <form className="quote-form" onSubmit={submit} noValidate>
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
              {errors.service && <p className="field-err" role="alert">{errors.service}</p>}
            </fieldset>
            <div className="field-row">
              <label>الميزانية التقريبية
                <select value={f.budget} onChange={(e) => set({ budget: e.target.value })}>
                  <option value="">اختر…</option>
                  {opts.budget.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label>المدة المطلوبة
                <select value={f.timeline} onChange={(e) => set({ timeline: e.target.value })}>
                  <option value="">اختر…</option>
                  {opts.timeline.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            </div>
            <div className="field-row">
              <label>الاسم
                <input value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="مثال: سارة" autoComplete="name" aria-invalid={!!errors.name} required />
                {errors.name && <span className="field-err" role="alert">{errors.name}</span>}
              </label>
              <label>رقم الجوال
                <input value={f.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="05XXXXXXXX" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" aria-invalid={!!errors.phone} required />
                {errors.phone && <span className="field-err" role="alert">{errors.phone}</span>}
              </label>
            </div>
            <label>تفاصيل إضافية
              <input value={f.details} onChange={(e) => set({ details: e.target.value })} placeholder="جملة عن فكرتك" />
            </label>
            {/* مصيدة للروبوتات: حقل مخفي لا يراه الزوار */}
            <div className="hp" aria-hidden="true">
              <label>الموقع<input tabIndex={-1} autoComplete="off" value={f.company_site} onChange={(e) => set({ company_site: e.target.value })} /></label>
            </div>
            {status === 'error' && <p className="field-err" role="alert">{failMsg}</p>}
            <button ref={sendRef} className="btn btn-primary btn-lg btn-block" type="submit" disabled={sending} aria-busy={sending}>
              {sending ? 'جارٍ الإرسال…' : <>أرسل طلبك.. وخلّنا نضبطها {Icon.arrow}</>}
            </button>
          </form>
        )}
      </div>
      {status !== 'done' && dirty && passed && (
        <div className="preview-float" role="status">
          <p>
            <strong>طلبك جاهز</strong>
            <span>{[countLabel(f.service.length), f.budget, f.timeline].filter(Boolean).join(' · ') || 'أكمل التفاصيل'}</span>
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => sendRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })}>
            أكمل الإرسال
          </button>
        </div>
      )}
    </section>
  )
}
