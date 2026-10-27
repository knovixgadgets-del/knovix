import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://knovixgadgets.in'
const DEFAULT_TITLE = 'Knovix | Smart Gadgets, Accessories & Everyday Tech'
const DEFAULT_DESC =
  'Shop smart gadgets, mobile accessories, electronics, toys and everyday tech at Knovix. Discover quality products, mega deals and fast delivery across India.'

function setMeta(selector, attr, value, create) {
  let el = document.head.querySelector(selector)
  if (!el && create) {
    el = document.createElement(create.tag)
    Object.entries(create.attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  if (el) el.setAttribute(attr, value)
}

// Per-page <title>, description and canonical URL for a single-page app.
// Before this, every page shared the home page's title and canonical URL, which
// tells search engines that all pages are duplicates of the home page.
export default function usePageMeta(title, description, { noindex = false } = {}) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = title ? `${title} | Knovix` : DEFAULT_TITLE
    const desc = description || DEFAULT_DESC
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`

    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', desc, { tag: 'meta', attrs: { name: 'description' } })
    setMeta('link[rel="canonical"]', 'href', url, { tag: 'link', attrs: { rel: 'canonical' } })
    setMeta('meta[property="og:title"]', 'content', fullTitle, { tag: 'meta', attrs: { property: 'og:title' } })
    setMeta('meta[property="og:description"]', 'content', desc, { tag: 'meta', attrs: { property: 'og:description' } })
    setMeta('meta[property="og:url"]', 'content', url, { tag: 'meta', attrs: { property: 'og:url' } })

    const robots = document.head.querySelector('meta[name="robots"]')
    if (noindex) {
      setMeta('meta[name="robots"]', 'content', 'noindex, nofollow', { tag: 'meta', attrs: { name: 'robots' } })
    } else if (robots) {
      robots.remove()
    }
  }, [title, description, pathname, noindex])
}
