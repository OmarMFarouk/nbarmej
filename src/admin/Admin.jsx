import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULTS, merge } from '../content'
import { api, setCsrf } from './api'
import { PAGES, NAV, titleOf, iconOf } from './pages'
import { Ico, LangCtx, pick, errText, Fields, ListEditor, setIn, useUpload } from './ui'

const hashRoute = () => {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?')
  return { path: path || 'dash', q: new URLSearchParams(qs || '') }
}
const go = (p) => { location.hash = '#/' + p }

function Logo({ t }) {
  return (
    <span className="logo">
      <span className="logo-mark" aria-hidden="true">N/</span>
      <span className="logo-word">{t('لوحة التحكم|Admin')}</span>
    </span>
  )
}

function Password({ value, onChange, label, auto }) {
  const [show, setShow] = useState(false)
  return (
    <label className="ad-field">
      <span className="ad-label">{label}</span>
      <span className="ad-pass">
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={auto} required minLength={auto === 'current-password' ? 1 : 8} dir="ltr" />
        <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="show"><Ico n={show ? 'eyeoff' : 'eye'} size={18} /></button>
      </span>
    </label>
  )
}

// ---------- شاشات الدخول ----------
function Login({ t, lang, onIn }) {
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try { const u = await api('login', f); setCsrf(u.csrf); onIn(u) } catch (x) { setErr(errText(x, lang)) }
    setBusy(false)
  }
  return (
    <main className="ad-auth">
      <form className="ad-auth-card" onSubmit={submit}>
        <Logo t={t} />
        <h1>{t('تسجيل الدخول|Sign in')}</h1>
        <label className="ad-field"><span className="ad-label">{t('البريد الإلكتروني|Email')}</span>
          <input type="email" dir="ltr" autoComplete="username" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <Password label={t('كلمة المرور|Password')} value={f.password} onChange={(v) => setF({ ...f, password: v })} auto="current-password" />
        {err && <p className="ad-err" role="alert">{err}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? '…' : t('دخول|Sign in')}</button>
        <a className="ad-link" href="#/forgot">{t('نسيت كلمة المرور؟|Forgot password?')}</a>
      </form>
    </main>
  )
}

function Forgot({ t, lang }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try { await api('forgot', { email }); setDone(true) } catch (x) { setErr(errText(x, lang)) }
  }
  return (
    <main className="ad-auth">
      <form className="ad-auth-card" onSubmit={submit}>
        <Logo t={t} />
        <h1>{t('استعادة كلمة المرور|Reset password')}</h1>
        {done ? <p className="ad-ok">{t('إن كان البريد مسجّلًا فقد أرسلنا إليه رابط الاستعادة (صالح ساعة).|If that email is registered, a reset link has been sent (valid for 1 hour).')}</p> : <>
          <p className="muted">{t('اكتب بريد الإدارة وسنرسل لك رابطًا لتعيين كلمة مرور جديدة.|Enter the admin email and we will send you a link to set a new password.')}</p>
          <label className="ad-field"><span className="ad-label">{t('البريد الإلكتروني|Email')}</span>
            <input type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          {err && <p className="ad-err" role="alert">{err}</p>}
          <button className="btn btn-primary btn-block">{t('إرسال الرابط|Send link')}</button>
        </>}
        <a className="ad-link" href="#/">{t('العودة لتسجيل الدخول|Back to sign in')}</a>
      </form>
    </main>
  )
}

function Reset({ t, lang, token }) {
  const [pw, setPw] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try { await api('reset', { token, new: pw }); setDone(true) } catch (x) { setErr(errText(x, lang)) }
  }
  return (
    <main className="ad-auth">
      <form className="ad-auth-card" onSubmit={submit}>
        <Logo t={t} />
        <h1>{t('كلمة مرور جديدة|New password')}</h1>
        {done ? <p className="ad-ok">{t('تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.|Password changed. You can sign in now.')}</p> : <>
          <Password label={t('كلمة المرور الجديدة|New password')} value={pw} onChange={setPw} auto="new-password" />
          <small className="muted">{t('٨ أحرف على الأقل|At least 8 characters')}</small>
          {err && <p className="ad-err" role="alert">{err}</p>}
          <button className="btn btn-primary btn-block">{t('حفظ|Save')}</button>
        </>}
        <a className="ad-link" href="#/">{t('تسجيل الدخول|Sign in')}</a>
      </form>
    </main>
  )
}

// ---------- صفحات اللوحة ----------
function Dashboard({ t, draft, user }) {
  const cards = [
    ['services', draft.services.length, 'الخدمات|Services'],
    ['projects', draft.projects.length, 'المشاريع|Projects'],
    ['faq', draft.faq.length, 'الأسئلة الشائعة|FAQ'],
    ['socials', draft.socials.filter((s) => s.url).length, 'حسابات التواصل|Social links'],
  ]
  return (
    <>
      {user.default && (
        <div className="ad-warn" role="alert">
          <Ico n="alert" /> <span>{t('ما زالت كلمة المرور الافتراضية مستخدمة. غيّرها الآن.|You are still using the default password. Change it now.')}</span>
          <a className="btn btn-primary btn-sm" href="#/password">{t('تغيير|Change')}</a>
        </div>
      )}
      <div className="ad-stats">
        {cards.map(([id, n, lbl]) => (
          <a key={id} href={`#/${id}`} className="ad-card ad-stat">
            <strong>{n}</strong>
            <span>{t(lbl)}</span>
          </a>
        ))}
      </div>
      <h2 className="ad-h2">{t('اختصارات|Quick links')}</h2>
      <div className="ad-quick">
        {['hero', 'services', 'projects', 'contact', 'hours', 'socials', 'media', 'password'].map((id) => {
          const n = NAV.flatMap(function f(x) { return x.children ? x.children.flatMap(f) : [x] }).find((x) => x.id === id)
          return <a key={id} href={`#/${id}`} className="ad-card ad-q"><Ico n={iconOf(n)} /><span>{t(titleOf(n))}</span></a>
        })}
      </div>
    </>
  )
}

function EditPage({ t, page, draft, setDraft }) {
  const data = page.key ? draft[page.key] : draft
  const setData = (d) => setDraft(page.key ? { ...draft, [page.key]: d } : d)
  return (
    <>
      {page.note && <p className="ad-note">{t(page.note)}</p>}
      {page.kind === 'list'
        ? <ListEditor items={data} onChange={setData} page={page} />
        : <div className="ad-card"><Fields fields={page.fields} data={data} set={(k, v) => setData(k === '*' ? v : setIn(data, k, v))} /></div>}
    </>
  )
}

function MediaPage({ t, lang }) {
  const [list, setList] = useState(null)
  const load = useCallback(() => api('media').then(setList).catch(() => setList([])), [])
  useEffect(() => { load() }, [load])
  const up = useUpload(load)
  const del = async (m) => { if (confirm(t('حذف هذه الصورة نهائيًا؟|Delete this image permanently?'))) { await api('delmedia', { name: m.name }); load() } }
  return (
    <>
      <label className="btn btn-primary ad-upload">
        <Ico n="upload" size={18} /> {up.busy ? '…' : t('رفع صورة|Upload image')}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => [...e.target.files].forEach(up.run)} />
      </label>
      {up.err && <p className="ad-err">{up.err}</p>}
      <p className="muted">{t('JPG / PNG / WebP / GIF حتى ٥ ميجابايت.|JPG / PNG / WebP / GIF up to 5 MB.')}</p>
      <div className="ad-media">
        {list?.length === 0 && <p className="ad-empty muted">{t('لا توجد صور بعد|No images yet')}</p>}
        {list?.map((m) => (
          <figure key={m.name} className="ad-card">
            <img src={m.url} alt="" loading="lazy" />
            <figcaption>
              <span dir="ltr">{m.name}</span>
              <span>
                <button className="icon-btn" onClick={() => navigator.clipboard?.writeText(location.origin + m.url)} aria-label="copy"><Ico n="copy" size={16} /></button>
                <button className="icon-btn danger" onClick={() => del(m)} aria-label="delete"><Ico n="trash" size={16} /></button>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  )
}

function PasswordPage({ t, lang, onChanged }) {
  const [f, setF] = useState({ current: '', new: '', again: '' })
  const [msg, setMsg] = useState(null)
  const submit = async (e) => {
    e.preventDefault(); setMsg(null)
    if (f.new !== f.again) return setMsg({ err: t('كلمتا المرور غير متطابقتين|Passwords do not match') })
    try { await api('password', { current: f.current, new: f.new }); setMsg({ ok: t('تم تغيير كلمة المرور|Password changed') }); setF({ current: '', new: '', again: '' }); onChanged() }
    catch (x) { setMsg({ err: errText(x, lang) }) }
  }
  return (
    <form className="ad-card ad-narrow" onSubmit={submit}>
      <Password label={t('كلمة المرور الحالية|Current password')} value={f.current} onChange={(v) => setF({ ...f, current: v })} auto="current-password" />
      <Password label={t('كلمة المرور الجديدة|New password')} value={f.new} onChange={(v) => setF({ ...f, new: v })} auto="new-password" />
      <Password label={t('تأكيد كلمة المرور|Confirm password')} value={f.again} onChange={(v) => setF({ ...f, again: v })} auto="new-password" />
      <small className="muted">{t('٨ أحرف على الأقل|At least 8 characters')}</small>
      {msg?.err && <p className="ad-err" role="alert">{msg.err}</p>}
      {msg?.ok && <p className="ad-ok" role="status">{msg.ok}</p>}
      <button className="btn btn-primary">{t('تغيير كلمة المرور|Change password')}</button>
    </form>
  )
}

// ---------- الشريط الجانبي: مجموعات متداخلة قابلة للطي ----------
const leaves = (n) => (n.children ? n.children.flatMap(leaves) : [n.id])
const ancestors = (nodes, id, trail = []) => {
  for (const n of nodes) {
    if (n.id === id) return trail
    if (n.children) { const r = ancestors(n.children, id, [...trail, n.key]); if (r) return r }
  }
  return null
}

function NavNode({ n, depth, route, open, toggle, t, close }) {
  if (n.children) {
    const isOpen = !!open[n.key]
    const hasActive = leaves(n).includes(route)
    return (
      <li>
        <button className={`ad-nav-g d${depth} ${isOpen ? 'open' : ''} ${hasActive ? 'has' : ''}`} aria-expanded={isOpen} onClick={() => toggle(n.key)}>
          <Ico n={iconOf(n)} size={18} /><span>{t(titleOf(n))}</span><Ico n="chev" size={16} />
        </button>
        <div className={`ad-collapse ${isOpen ? 'open' : ''}`}><ul className="ad-nav-sub">
          {n.children.map((c) => <NavNode key={c.id || c.key} n={c} depth={depth + 1} route={route} open={open} toggle={toggle} t={t} close={close} />)}
        </ul></div>
      </li>
    )
  }
  return (
    <li>
      <a href={`#/${n.id}`} className={`ad-nav-i d${depth} ${route === n.id ? 'on' : ''}`} aria-current={route === n.id ? 'page' : undefined} onClick={close}>
        <Ico n={iconOf(n)} size={18} /><span>{t(titleOf(n))}</span>
      </a>
    </li>
  )
}

function Shell({ t, lang, setLang, user, setUser, onOut }) {
  const [content, setContent] = useState(null)
  const [draft, setDraft] = useState(null)
  const [route, setRoute] = useState(hashRoute().path)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [theme, setTheme] = useState(document.documentElement.dataset.theme)
  const [open, setOpen] = useState(() => { try { return JSON.parse(localStorage.adNav) } catch { return { site: true, home: true } } })

  useEffect(() => {
    api('content').then((j) => { const c = merge(DEFAULTS, j); setContent(c); setDraft(c) })
  }, [])
  useEffect(() => {
    const on = () => { setRoute(hashRoute().path); setMenu(false); scrollTo(0, 0) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  // افتح المجموعات الأب للصفحة الحالية
  useEffect(() => {
    const a = ancestors(NAV, route) || []
    if (a.some((k) => !open[k])) setOpen((o) => ({ ...o, ...Object.fromEntries(a.map((k) => [k, true])) }))
  }, [route]) // eslint-disable-line
  useEffect(() => { try { localStorage.adNav = JSON.stringify(open) } catch {} }, [open])

  const dirty = useMemo(() => content && JSON.stringify(content) !== JSON.stringify(draft), [content, draft])
  useEffect(() => {
    const warn = (e) => { if (dirty) e.preventDefault() }
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [dirty])

  const flash = (msg, err) => { setToast({ msg, err }); setTimeout(() => setToast(null), 3500) }
  const save = async () => {
    setSaving(true)
    try { await api('save', draft); setContent(draft); flash(t('تم الحفظ وظهر على الموقع ✓|Saved and live on the site ✓')) }
    catch (x) { flash(errText(x, lang), true); if (x.status === 401) onOut() }
    setSaving(false)
  }
  const flipTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = n
    try { localStorage.theme = n } catch {}
    setTheme(n)
  }
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }))
  const page = PAGES[route]
  const title = page ? page.title : { dash: 'لوحة البداية|Dashboard', media: 'مكتبة الصور|Media library', password: 'تغيير كلمة المرور|Change password' }[route] || 'لوحة البداية|Dashboard'

  return (
    <div className={`ad ${menu ? 'menu-open' : ''}`}>
      <aside className="ad-side" aria-label={t('القائمة|Menu')}>
        <div className="ad-side-top"><Logo t={t} /><button className="icon-btn ad-close" onClick={() => setMenu(false)} aria-label="close"><Ico n="x" /></button></div>
        <nav><ul className="ad-nav">
          {NAV.map((n) => <NavNode key={n.id || n.key} n={n} depth={0} route={route} open={open} toggle={toggle} t={t} close={() => setMenu(false)} />)}
        </ul></nav>
        <div className="ad-side-foot">
          <a className="ad-nav-i" href="/" target="_blank" rel="noopener"><Ico n="ext" size={18} /><span>{t('عرض الموقع|View site')}</span></a>
          <p className="muted" dir="ltr">{user.email}</p>
          <button className="btn btn-ghost btn-sm btn-block" onClick={onOut}><Ico n="logout" size={16} /> {t('خروج|Sign out')}</button>
        </div>
      </aside>
      {menu && <div className="ad-backdrop" onClick={() => setMenu(false)} />}

      <div className="ad-main">
        <header className="ad-top">
          <button className="icon-btn ad-burger" onClick={() => setMenu(true)} aria-label="menu"><Ico n="menu" /></button>
          <h1>{pick(title, lang)}</h1>
          <div className="ad-top-actions">
            <button className="icon-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label="language"><b>{lang === 'ar' ? 'EN' : 'ع'}</b></button>
            <button className="icon-btn" onClick={flipTheme} aria-label="theme"><Ico n={theme === 'dark' ? 'sun' : 'moon'} /></button>
          </div>
        </header>

        <div className="ad-content">
          {!draft ? <p className="muted">…</p>
            : page ? <EditPage t={t} page={page} draft={draft} setDraft={setDraft} />
            : route === 'media' ? <MediaPage t={t} lang={lang} />
            : route === 'password' ? <PasswordPage t={t} lang={lang} onChanged={() => setUser({ ...user, default: false })} />
            : <Dashboard t={t} draft={draft} user={user} />}
        </div>

        {page && draft && (
          <div className={`ad-savebar ${dirty ? 'dirty' : ''}`}>
            <span>{dirty ? t('تعديلات غير محفوظة|Unsaved changes') : t('كل شيء محفوظ|All changes saved')}</span>
            <button className="btn btn-ghost btn-sm" disabled={!dirty} onClick={() => setDraft(content)}><Ico n="undo" size={16} /> {t('تراجع|Discard')}</button>
            <button className="btn btn-primary btn-sm" disabled={!dirty || saving} onClick={save}><Ico n="save" size={16} /> {saving ? '…' : t('حفظ|Save')}</button>
          </div>
        )}
      </div>
      {toast && <div className={`ad-toast ${toast.err ? 'err' : ''}`} role="status">{toast.msg}</div>}
    </div>
  )
}

export default function Admin() {
  const [lang, setLangState] = useState(() => { try { return localStorage.adLang || 'ar' } catch { return 'ar' } })
  const [user, setUser] = useState(undefined) // undefined = جارٍ التحقق، null = غير مسجل
  const [route, setRoute] = useState(hashRoute())
  const t = useMemo(() => Object.assign((s) => pick(s, lang), { lang }), [lang])
  const setLang = (l) => { setLangState(l); try { localStorage.adLang = l } catch {} }

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = pick('لوحة التحكم|Admin panel', lang) + ' — ' + pick('نُبرمِج|Nbarmej', lang)
  }, [lang])
  useEffect(() => {
    api('me').then((u) => { setCsrf(u.csrf); setUser(u) }).catch(() => setUser(null))
    const on = () => setRoute(hashRoute())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const out = async () => { try { await api('logout', {}) } catch {} setCsrf(''); setUser(null); go('') }

  let body
  if (user === undefined) body = <main className="ad-auth"><p className="muted">…</p></main>
  else if (route.path === 'forgot') body = <Forgot t={t} lang={lang} />
  else if (route.path === 'reset') body = <Reset t={t} lang={lang} token={route.q.get('token') || ''} />
  else if (!user) body = <Login t={t} lang={lang} onIn={(u) => { setUser(u); go('dash') }} />
  else body = <Shell t={t} lang={lang} setLang={setLang} user={user} setUser={setUser} onOut={out} />

  return <LangCtx.Provider value={{ lang, t }}>{body}</LangCtx.Provider>
}
