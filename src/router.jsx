import { createContext, useContext } from 'react'

// دالة التنقل الداخلي (تُوفَّر من App). بدونها يعمل الرابط كرابط عادي
export const NavContext = createContext(null)

export function Link({ href, onClick, target, ...rest }) {
  const navigate = useContext(NavContext)
  return (
    <a
      href={href}
      target={target}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || target || !navigate) return
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        e.preventDefault()
        navigate(`${url.pathname}${url.search}${url.hash}`)
      }}
    />
  )
}
