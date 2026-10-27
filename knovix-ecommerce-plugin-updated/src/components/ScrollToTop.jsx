import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router keeps the previous scroll position on navigation, so opening a
// product from the middle of a long list landed the shopper half-way down the
// product page. Jump to the top on every page change (but not for #anchors).
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, search, hash])

  return null
}
