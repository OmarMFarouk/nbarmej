import { createContext, useContext } from 'react'

export const NavContext = createContext(null)
export function Link({ href: e, onClick: t, target: n, ...r }) {
  let i = useContext(NavContext)
  return (
    <a
      href={e}
      target={n}
      {...r}
      onClick={(r) => {
        if (
          (t?.(r), r.defaultPrevented || r.button !== 0 || r.metaKey || r.ctrlKey || r.shiftKey || r.altKey || n || !i)
        )
          return
        let a = new URL(e, window.location.href)
        a.origin === window.location.origin && (r.preventDefault(), i(`${a.pathname}${a.search}${a.hash}`))
      }}
    />
  )
}
