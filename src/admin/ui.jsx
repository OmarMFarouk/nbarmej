import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { api, upload, ERRORS } from './api'
import { SOCIAL_ICONS, SOCIAL_NAMES, SocialIcon } from '../icons'
import { DAYS_AR, DAYS_EN } from '../content'

// ---------- اللغة: النصوص بصيغة 'عربي|English' ----------
export const LangCtx = createContext({ lang: 'ar', t: (s) => s })
export const useT = () => useContext(LangCtx)
export const pick = (s, lang) => (s || '').split('|')[lang === 'ar' ? 0 : 1] ?? s
export const errText = (e, lang) => pick(ERRORS[e?.message] || ERRORS.server, lang)

// ---------- أيقونات اللوحة ----------
const P = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  layout: 'M3 4h18v16H3zM3 10h18M9 10v10',
  building: 'M5 21V4h10v17M15 9h4v12M9 8h2M9 12h2M9 16h2M3 21h18',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M8.5 9.5h.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  key: 'M14 10a4 4 0 1 0-3.9 3L3 20v1h3v-2h2v-2h2l1.5-1.5A4 4 0 0 0 14 10ZM16 8h.01',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  layers: 'M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5',
  phone: 'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5M12 17h.01',
  quote: 'M5 2h11l3 3v17l-2.3-1.6L14.4 22l-2.4-1.6L9.6 22l-2.3-1.6L5 22zM9 8h6M9 12h6M9 16h3',
  steps: 'M4 19h4v-4h4v-4h4V7h4',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a7 7 0 0 1 4 6',
  tag: 'M3 12V3h9l9 9-9 9zM7.5 7.5h.01',
  type: 'M4 6V4h16v2M12 4v16M9 20h6',
  logout: 'M9 21H4V3h5M16 7l5 5-5 5M21 12H9',
  menu: 'M4 6h16M4 12h16M4 18h16',
  chev: 'M6 9l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  up: 'M12 19V5M5 12l7-7 7 7',
  down: 'M12 5v14M5 12l7 7 7-7',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  drag: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  upload: 'M12 16V4M6 10l6-6 6 6M4 20h16',
  check: 'M5 12.5l4.5 4.5L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeoff: 'M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.3 3.8M6.5 7.5A17 17 0 0 0 2 12s4 7 10 7a9.5 9.5 0 0 0 4.3-1',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  moon: 'M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  save: 'M5 3h12l4 4v14H3V3zM7 3v6h9V3M7 21v-7h10v7',
  undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  copy: 'M9 9h11v12H9zM5 15V3h11',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01',
}
export const Ico = ({ n, size = 20 }) => (
  <svg className="ad-ico" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={P[n] || P.tag} />
  </svg>
)

// ---------- حقول ----------
const getIn = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o)
export const setIn = (o, path, v) => {
  const [k, ...rest] = path.split('.')
  return Array.isArray(o)
    ? Object.assign([...o], { [k]: rest.length ? setIn(o[k], rest.join('.'), v) : v })
    : { ...o, [k]: rest.length ? setIn(o?.[k] ?? {}, rest.join('.'), v) : v }
}
export { getIn }

export function Tags({ value = [], onChange, placeholder }) {
  const [txt, setTxt] = useState('')
  const add = () => {
    const v = txt.trim()
    if (v) onChange([...value, v])
    setTxt('')
  }
  return (
    <div className="ad-tags">
      <ul>
        {value.map((t, i) => (
          <li key={i}>
            <span>{t}</span>
            <button type="button" aria-label="×" onClick={() => onChange(value.filter((_, j) => j !== i))}><Ico n="x" size={14} /></button>
          </li>
        ))}
      </ul>
      <div className="ad-tags-add">
        <input value={txt} placeholder={placeholder} onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',' || e.key === '،') { e.preventDefault(); add() } }} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={add}><Ico n="plus" size={16} /></button>
      </div>
    </div>
  )
}

// نافذة اختيار صورة: مرفوعاتك + صور الموقع الأساسية + رفع جديد
const BUILTIN = ['hero-side', 'service-1', 'service-2', 'service-3', 'service-4', 'service-5', 'service-6', 'work-1', 'work-2', 'work-3', 'work-4', 'work-5'].map((n) => `/images/${n}.webp`)

export function useUpload(onDone) {
  const { lang } = useT()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const run = async (file) => {
    if (!file) return
    setBusy(true); setErr('')
    try { onDone(await upload(file)) } catch (e) { setErr(errText(e, lang)) }
    setBusy(false)
  }
  return { busy, err, run }
}

export function MediaPicker({ onPick, onClose }) {
  const { t, lang } = useT()
  const [list, setList] = useState(null)
  const load = () => api('media').then(setList).catch(() => setList([]))
  useEffect(() => { load() }, [])
  const up = useUpload((r) => { load(); onPick(r.url) })
  return (
    <div className="ad-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="ad-modal-box" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>{t('اختر صورة|Choose an image')}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="×"><Ico n="x" /></button>
        </header>
        <label className="btn btn-primary btn-sm ad-upload">
          <Ico n="upload" size={16} /> {up.busy ? t('جارٍ الرفع…|Uploading…') : t('رفع صورة جديدة|Upload new')}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => up.run(e.target.files[0])} />
        </label>
        {up.err && <p className="ad-err">{up.err}</p>}
        <h4>{t('مرفوعاتك|Your uploads')}</h4>
        <div className="ad-grid-img">
          {list?.length === 0 && <p className="muted">{t('لا توجد صور مرفوعة بعد|No uploads yet')}</p>}
          {list?.map((m) => <button key={m.name} type="button" onClick={() => onPick(m.url)}><img src={m.url} alt="" loading="lazy" /></button>)}
        </div>
        <h4>{t('صور الموقع الأساسية|Built-in site images')}</h4>
        <div className="ad-grid-img">
          {BUILTIN.map((u) => <button key={u} type="button" onClick={() => onPick(u)}><img src={u} alt="" loading="lazy" /></button>)}
        </div>
      </div>
    </div>
  )
}

export function ImageField({ value, onChange }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const up = useUpload((r) => onChange(r.url))
  return (
    <div className="ad-image">
      <div className="ad-thumb">{value ? <img src={value} alt="" /> : <Ico n="image" size={28} />}</div>
      <div className="ad-image-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}><Ico n="image" size={16} /> {t('اختيار|Choose')}</button>
        <label className="btn btn-ghost btn-sm">
          <Ico n="upload" size={16} /> {up.busy ? '…' : t('رفع|Upload')}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => up.run(e.target.files[0])} />
        </label>
        {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}><Ico n="trash" size={16} /></button>}
        {up.err && <p className="ad-err">{up.err}</p>}
      </div>
      {open && <MediaPicker onClose={() => setOpen(false)} onPick={(u) => { onChange(u); setOpen(false) }} />}
    </div>
  )
}

export function IconField({ value, onChange }) {
  const { t, lang } = useT()
  const up = useUpload((r) => onChange(r.url))
  const custom = /^(\/|https?:)/.test(value || '')
  return (
    <div className="ad-icons">
      <div className="ad-icon-grid" role="radiogroup">
        {Object.keys(SOCIAL_ICONS).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={value === k} className={value === k ? 'on' : ''} title={pick(SOCIAL_NAMES[k] || k, lang)} onClick={() => onChange(k)}>
            <SocialIcon icon={k} size="1.4em" />
          </button>
        ))}
        {custom && <button type="button" role="radio" aria-checked className="on"><SocialIcon icon={value} size="1.4em" /></button>}
      </div>
      <label className="btn btn-ghost btn-sm">
        <Ico n="upload" size={16} /> {up.busy ? '…' : t('أيقونة مخصصة|Custom icon')}
        <input type="file" accept="image/png,image/webp,image/jpeg,image/gif" hidden onChange={(e) => up.run(e.target.files[0])} />
      </label>
      {up.err && <p className="ad-err">{up.err}</p>}
    </div>
  )
}

export function HoursField({ value, onChange }) {
  const { t, lang } = useT()
  const v = { days: [], from: '09:00', to: '18:00', ...value }
  const names = lang === 'ar' ? DAYS_AR : DAYS_EN
  const toggle = (d) => onChange({ ...v, days: v.days.includes(d) ? v.days.filter((x) => x !== d) : [...v.days, d].sort() })
  return (
    <div className="ad-hours">
      <div className="ad-days">
        {names.map((n, d) => (
          <button key={d} type="button" className={v.days.includes(d) ? 'on' : ''} aria-pressed={v.days.includes(d)} onClick={() => toggle(d)}>{n}</button>
        ))}
      </div>
      <div className="ad-row2">
        <label>{t('من|From')}<input type="time" value={v.from} onChange={(e) => onChange({ ...v, from: e.target.value })} /></label>
        <label>{t('إلى|To')}<input type="time" value={v.to} onChange={(e) => onChange({ ...v, to: e.target.value })} /></label>
      </div>
    </div>
  )
}

export function Field({ def, value, onChange }) {
  const { t } = useT()
  const label = t(def.label)
  if (def.type === 'heading') return <h3 className="ad-h3">{label}</h3>
  if (def.type === 'show') return <label className="ad-field wide ad-show"><span className="ad-switch"><input type="checkbox" checked={!value} onChange={(e) => onChange(!e.target.checked)} /><i /></span><span className="ad-label">{label}</span></label>
  const common = { value: value ?? '', onChange: (e) => onChange(e.target.value), placeholder: def.ph ? t(def.ph) : undefined }
  let input
  switch (def.type) {
    case 'textarea': input = <textarea rows={def.rows || 3} {...common} />; break
    case 'tags': input = <Tags value={value || []} onChange={onChange} placeholder={t('اكتب ثم Enter|Type then Enter')} />; break
    case 'image': input = <ImageField value={value} onChange={onChange} />; break
    case 'select': input = <select {...common}>{def.options.map((o) => { const [v, l] = o.split('|'); return <option key={v} value={v}>{l}</option> })}</select>; break
    case 'icon': input = <IconField value={value} onChange={onChange} />; break
    case 'hours': input = <HoursField value={value} onChange={onChange} />; break
    default: input = <input type={def.type === 'text' || !def.type ? 'text' : def.type} dir={def.ltr ? 'ltr' : undefined} {...common} />
  }
  const Wrap = ['tags', 'image', 'icon', 'hours'].includes(def.type) ? 'div' : 'label'
  return (
    <Wrap className={`ad-field ${def.wide ? 'wide' : ''}`}>
      <span className="ad-label">{label}</span>
      {input}
      {def.hint && <small className="muted">{t(def.hint)}</small>}
    </Wrap>
  )
}

export function Fields({ fields, data, set }) {
  return (
    <div className="ad-fields">
      {fields.map((f, i) => (
        <Field key={f.k || i} def={f} value={f.k === '*' ? data : f.k ? getIn(data, f.k) : undefined} onChange={(v) => set(f.k, v)} />
      ))}
    </div>
  )
}

// ---------- قائمة قابلة للترتيب والإضافة والحذف ----------
export function ListEditor({ items = [], onChange, page }) {
  const { t } = useT()
  const [openIdx, setOpenIdx] = useState(-1)
  const drag = useRef(-1)
  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return
    const a = [...items]
    a.splice(to, 0, a.splice(from, 1)[0])
    onChange(a)
    setOpenIdx(-1)
  }
  const add = () => { onChange([...items, { ...page.blank }]); setOpenIdx(items.length) }
  const del = (i) => { if (confirm(t('حذف هذا العنصر؟|Delete this item?'))) { onChange(items.filter((_, j) => j !== i)); setOpenIdx(-1) } }
  return (
    <div className="ad-list">
      {items.length === 0 && <p className="ad-empty muted">{t('لا عناصر بعد|Nothing here yet')}</p>}
      {items.map((it, i) => {
        const open = openIdx === i
        const title = page.itemTitle?.(it) || t('(بدون عنوان)|(untitled)')
        return (
          <article key={i} className={`ad-item ${open ? 'open' : ''} ${it.off ? 'off' : ''}`} draggable={!open}
            onDragStart={() => { drag.current = i }} onDragOver={(e) => e.preventDefault()} onDrop={() => move(drag.current, i)}>
            <header onClick={() => setOpenIdx(open ? -1 : i)}>
              <span className="ad-grip" title={t('اسحب للترتيب|Drag to reorder')}><Ico n="drag" size={18} /></span>
              <span className="ad-num">{i + 1}</span>
              {page.itemImg && (it[page.itemImg] ? <img className="ad-mini" src={it[page.itemImg]} alt="" /> : <span className="ad-mini"><Ico n="image" size={16} /></span>)}
              {page.itemIcon && <span className="ad-mini"><SocialIcon icon={it[page.itemIcon]} /></span>}
              <strong>{title}</strong>
              <span className="ad-item-actions" onClick={(e) => e.stopPropagation()}>
                <label className="ad-switch" title={t('تفعيل / تعطيل|Active / inactive')}><input type="checkbox" checked={!it.off} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, off: !e.target.checked } : x)))} /><i /></label>
                <button type="button" className="icon-btn" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={t('أعلى|Up')}><Ico n="up" size={16} /></button>
                <button type="button" className="icon-btn" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} aria-label={t('أسفل|Down')}><Ico n="down" size={16} /></button>
                <button type="button" className="icon-btn danger" onClick={() => del(i)} aria-label={t('حذف|Delete')}><Ico n="trash" size={16} /></button>
              </span>
              <span className={`ad-chev ${open ? 'open' : ''}`}><Ico n="chev" size={18} /></span>
            </header>
            {open && <div className="ad-item-body"><Fields fields={page.fields} data={it} set={(k, v) => onChange(items.map((x, j) => (j === i ? setIn(x, k, v) : x)))} /></div>}
          </article>
        )
      })}
      <button type="button" className="btn btn-ghost ad-add" onClick={add}><Ico n="plus" size={18} /> {t('إضافة عنصر|Add item')}</button>
    </div>
  )
}
