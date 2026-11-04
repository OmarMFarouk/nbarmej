import { useCallback, useEffect, useState } from 'react'
import { HOME_DESC, HOME_TITLE, HomePage, PrivacyRoute, ServicePage, setMeta } from './pages'
import { Dock, Footer, Header } from './Header'
import { PackagePage } from './packages/PackagePage'
import { NavContext } from './router'
import { SiteProvider, useSite } from './SiteContext'

const SITE = 'https://nbarmej.com'

// بعد كل تنقّل: تركيز العنوان، تحديث وسوم الصفحة (الرئيسية/الخصوصية)، ثم التمرير للهاش أو للأعلى
function RouteEffects({ path }) {
  const { privacy } = useSite()
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      document.querySelector('main h1')?.focus({ preventScroll: true })
      const url = new URL(path, window.location.origin)
      if (url.pathname === '/') {
        document.title = HOME_TITLE
        setMeta('meta[name="description"]', 'content', HOME_DESC)
        setMeta('link[rel="canonical"]', 'href', SITE + '/')
        setMeta('meta[property="og:title"]', 'content', HOME_TITLE)
        setMeta('meta[property="og:description"]', 'content', HOME_DESC)
        setMeta('meta[property="og:url"]', 'content', SITE + '/')
      } else if (url.pathname === '/privacy') {
        document.title = 'سياسة الخصوصية | نُبرمِج'
        setMeta('meta[name="description"]', 'content', privacy.intro)
        setMeta('link[rel="canonical"]', 'href', SITE + '/privacy')
        setMeta('meta[property="og:title"]', 'content', document.title)
        setMeta('meta[property="og:description"]', 'content', privacy.intro)
        setMeta('meta[property="og:url"]', 'content', SITE + '/privacy')
      }
      if (url.hash) document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      else window.scrollTo(0, 0)
    })
    return () => window.cancelAnimationFrame(id)
  }, [path]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// path: المسار الحالي (يُمرَّر وقت البناء للـprerender). onContinue: اختياري عند زر «متابعة طلب الباقة»
export function App({
  initial,
  path: startPath = typeof location === 'undefined' ? '/' : `${location.pathname}${location.search}${location.hash}`,
  onContinue,
}) {
  const [path, setPath] = useState(startPath)

  // تنقّل داخلي بدون إعادة تحميل (روابط <Link>): نفس الصفحة = تمرير للهاش فقط
  const navigate = useCallback((href) => {
    const to = new URL(href, window.location.href)
    const from = new URL(window.location.href)
    const next = `${to.pathname}${to.search}${to.hash}`
    window.history.pushState(null, '', next)
    if (to.pathname === from.pathname && to.search === from.search) {
      if (to.hash) window.requestAnimationFrame(() => document.getElementById(to.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }))
      return
    }
    setPath(next)
  }, [])

  useEffect(() => {
    const onPop = () => setPath(`${location.pathname}${location.search}${location.hash}`)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const pathname = path.split(/[?#]/, 1)[0]
  const service = pathname.match(/^\/services\/([a-z0-9-]+)\/?$/)
  const pack = pathname.match(/^\/packages\/([a-z0-9-]+)\/?$/)
  const privacy = /^\/privacy\/?$/.test(pathname)

  let page = <HomePage />
  if (privacy) page = <PrivacyRoute />
  else if (service) page = <ServicePage slug={service[1]} />
  else if (pack) {
    page = (
      <>
        <a className="skip" href="#main">تخطَّ إلى المحتوى</a>
        <Header home="/" />
        <PackagePage id={pack[1]} onContinue={onContinue} key={pack[1]} />
        <Footer home="/" />
        <Dock home="/" />
      </>
    )
  }

  return (
    <NavContext.Provider value={navigate}>
      <SiteProvider initial={initial}>
        <RouteEffects path={path} />
        <div
          className="public-site"
          onCopy={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {page}
        </div>
      </SiteProvider>
    </NavContext.Provider>
  )
}

export default App
