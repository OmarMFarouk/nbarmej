import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { Ico, errText } from './ui'

const STATUS = {
  new: 'جديد|New',
  qualified: 'مؤهل|Qualified',
  unqualified: 'غير مؤهل|Not qualified',
  signed: 'تم التعاقد|Signed',
}
const pick = (s, lang) => (s || '').split('|')[lang === 'ar' ? 0 : 1]

function Detail({ r, t, onSave, onRetry }) {
  const [note, setNote] = useState(r.note || '')
  const attr = [r.utm_source, r.utm_medium, r.utm_campaign, r.utm_term, r.utm_content].filter(Boolean).join(' / ')
  return (
    <div className="rq-detail">
      <dl>
        <dt>{t('البريد|Email')}</dt><dd dir="ltr">{r.email ? <a href={`mailto:${r.email}`}>{r.email}</a> : '—'}</dd>
        <dt>{t('الخدمات|Services')}</dt><dd>{r.service}</dd>
        <dt>{t('الميزانية|Budget')}</dt><dd>{r.budget || '—'}</dd>
        <dt>{t('المدة|Timeline')}</dt><dd>{r.timeline || '—'}</dd>
        <dt>{t('تفاصيل|Details')}</dt><dd>{r.details || '—'}</dd>
        <dt>{t('المصدر|Source')}</dt><dd dir="ltr">{r.source || '—'}{attr && ` · ${attr}`}</dd>
        <dt>GCLID</dt><dd dir="ltr">{r.gclid || '—'}</dd>
        <dt>{t('الصفحة|Page')}</dt><dd dir="ltr">{r.landing_url || '—'}</dd>
        <dt>{t('الإشعار|Notification')}</dt>
        <dd>
          {Number(r.notified_email) ? '✓ ' : '✗ '}{t('بريد الفريق|Team email')}
          {r.email && <>{' · '}{Number(r.notified_customer) ? '✓ ' : '✗ '}{t('تأكيد العميل|Customer confirmation')}</>}
          {' · '}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRetry(r)}>{t('إعادة الإرسال|Resend')}</button>
          {r.notify_error && <small className="ad-err" dir="ltr"> {r.notify_error}</small>}
        </dd>
      </dl>
      <label className="ad-field">
        <span className="ad-label">{t('ملاحظة داخلية|Internal note')}</span>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => onSave(r, { note })}>{t('حفظ الملاحظة|Save note')}</button>
    </div>
  )
}

export default function RequestsPage({ t, lang }) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(null)
  const [err, setErr] = useState('')

  const load = useCallback(() => {
    const qs = new URLSearchParams({ status, q, page })
    api('requests&' + qs).then((d) => { setData(d); setErr('') }).catch((e) => setErr(errText(e, lang)))
  }, [status, q, page, lang])
  useEffect(() => { const id = setTimeout(load, q ? 250 : 0); return () => clearTimeout(id) }, [load, q])

  const save = async (r, patch) => {
    try { await api('request_set', { id: r.id, ...patch }); load() } catch (e) { setErr(errText(e, lang)) }
  }
  const retry = async (r) => {
    try { await api('request_retry', { id: r.id }); load() } catch (e) { setErr(errText(e, lang)) }
  }

  const counts = data?.counts || {}
  const total = Object.values(counts).reduce((a, b) => a + Number(b), 0)
  const pages = data ? Math.max(1, Math.ceil(data.total / data.per)) : 1

  return (
    <>
      <div className="rq-bar">
        <div className="rq-tabs" role="tablist">
          <button className={!status ? 'on' : ''} onClick={() => { setStatus(''); setPage(1) }}>{t('الكل|All')} <b>{total}</b></button>
          {Object.keys(STATUS).map((s) => (
            <button key={s} className={status === s ? 'on' : ''} onClick={() => { setStatus(s); setPage(1) }}>{pick(STATUS[s], lang)} <b>{counts[s] || 0}</b></button>
          ))}
        </div>
        <input className="rq-search" type="search" placeholder={t('بحث بالاسم أو الجوال أو رقم الطلب|Search name, phone or order no.')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <a className="btn btn-ghost btn-sm" href="/api/?a=requests_csv"><Ico n="save" size={16} /> CSV</a>
      </div>
      {err && <p className="ad-err" role="alert">{err}</p>}
      {data?.items.length === 0 && <p className="ad-empty muted">{t('لا توجد طلبات بعد|No requests yet')}</p>}
      <div className="rq-list">
        {data?.items.map((r) => (
          <article key={r.id} className={`ad-card rq-item ${open === r.id ? 'open' : ''}`}>
            <div className="rq-head" onClick={() => setOpen(open === r.id ? null : r.id)}>
              <b dir="ltr">{r.order_no}</b>
              <span className="rq-name">{r.name}</span>
              <a href={`https://wa.me/${String(r.phone).replace('+', '')}`} target="_blank" rel="noopener" dir="ltr" onClick={(e) => e.stopPropagation()}>{r.phone}</a>
              <small className="muted" dir="ltr">{r.created_at}</small>
              {!Number(r.notified_email) && <span className="rq-warn" title={r.notify_error}>⚠</span>}
              <select value={r.status} onClick={(e) => e.stopPropagation()} onChange={(e) => save(r, { status: e.target.value })} aria-label="status" data-s={r.status}>
                {Object.keys(STATUS).map((s) => <option key={s} value={s}>{pick(STATUS[s], lang)}</option>)}
              </select>
            </div>
            {open === r.id && <Detail r={r} t={t} onSave={save} onRetry={retry} />}
          </article>
        ))}
      </div>
      {pages > 1 && (
        <div className="rq-pager">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
          <span>{page} / {pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>›</button>
        </div>
      )}
    </>
  )
}
