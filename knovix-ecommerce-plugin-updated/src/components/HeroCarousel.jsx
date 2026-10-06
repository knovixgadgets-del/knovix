import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon, TruckIcon, CheckCircleIcon, BoxIcon, PhoneIcon } from './Icons'

const TEXT_MS = 4500
const PRODUCT_MS = 3000
const SLIDE_MS = 700
const VISIBLE = 2
const SUPPORT_TEL = 'tel:+919447477665'

const inr = (n) => Number(n || 0).toLocaleString('en-IN')

// Two-rectangle product carousel (Amazon-style): two product cards visible at
// once inside an overflow-hidden frame, sliding one card at a time forever.
// Cards are fixed rectangles; each product image is contained to fit inside.
function ProductRail({ products }) {
  const n = products.length
  const [idx, setIdx] = useState(0)
  const [anim, setAnim] = useState(true)
  const [paused, setPaused] = useState(false)
  const loop = n > VISIBLE
  const track = loop ? [...products, ...products.slice(0, VISIBLE)] : products

  useEffect(() => {
    if (!loop || paused) return
    const t = setInterval(() => setIdx((i) => i + 1), PRODUCT_MS)
    return () => clearInterval(t)
  }, [loop, paused])

  // After sliding onto the cloned tail, snap back to the start with no
  // animation so the loop is seamless.
  useEffect(() => {
    if (!loop || idx < n) return
    const t = setTimeout(() => {
      setAnim(false)
      setIdx(0)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)))
    }, SLIDE_MS)
    return () => clearTimeout(t)
  }, [idx, loop, n])

  return (
    <div
      className="w-full max-w-md lg:max-w-xl mx-auto lg:ml-auto overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`flex ${anim ? 'transition-transform ease-in-out' : ''}`}
        style={{ transform: `translateX(-${(idx * 100) / VISIBLE}%)`, transitionDuration: `${SLIDE_MS}ms` }}
      >
        {track.map((p, i) => (
          <div key={`${p.id}-${i}`} className="w-1/2 shrink-0 p-1.5 sm:p-2">
            <Link
              to={`/product/${p.id}`}
              className="flex flex-col h-full rounded-xl bg-white p-2.5 sm:p-3 shadow-card"
            >
              <div className="aspect-[4/5] w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <span className="text-xs text-slate-300">No image</span>
                )}
              </div>
              <p className="mt-2 text-[13px] sm:text-sm font-medium text-ink-900 line-clamp-1">{p.name}</p>
              <p className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-bold text-brand-700">₹{inr(p.price)}</span>
                {Number(p.mrp) > Number(p.price) && (
                  <span className="text-[11px] text-slate-400 line-through">₹{inr(p.mrp)}</span>
                )}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function RailSkeleton() {
  return (
    <div className="w-full max-w-md lg:max-w-xl mx-auto lg:ml-auto flex">
      {[0, 1].map((i) => (
        <div key={i} className="w-1/2 p-1.5 sm:p-2">
          <div className="rounded-xl bg-white/10 animate-pulse aspect-[4/5]" />
        </div>
      ))}
    </div>
  )
}

// Dark Knovix-themed hero: peacock navy canvas, yellow accent, headline text
// that auto-loops, a two-card product carousel, and a trust-badge row.
export default function HeroCarousel({ slides = [], products = [], loading = false, freeMin = null }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const count = slides.length

  const goTo = useCallback((i) => setActive(((i % count) + count) % count), [count])

  useEffect(() => {
    if (count <= 1 || paused) return
    const t = setInterval(() => setActive((i) => (i + 1) % count), TEXT_MS)
    return () => clearInterval(t)
  }, [count, paused, active])

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    setPaused(true)
  }
  function onTouchEnd(e) {
    if (touchStartX.current != null) {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(dx) > 40) goTo(active + (dx < 0 ? 1 : -1))
    }
    touchStartX.current = null
    setPaused(false)
  }

  const badges = [
    { Icon: TruckIcon, title: 'Free Shipping', sub: freeMin ? `On orders above ₹${freeMin}` : 'On eligible orders' },
    { Icon: PhoneIcon, title: '24/7 Customer Support', sub: 'Tap to call us', href: SUPPORT_TEL },
    { Icon: BoxIcon, title: 'Easy Replacement', sub: '7 Days' },
    { Icon: CheckCircleIcon, title: 'Secure Checkout', sub: 'Safe & protected' }
  ]

  return (
    <div className="relative w-full bg-ink-900 text-white overflow-hidden flex flex-col min-h-[75svh] sm:min-h-0">
      <div className="pointer-events-none absolute -right-24 -top-10 w-[26rem] h-[26rem] rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 w-72 h-72 rounded-full bg-brand-600/20 blur-3xl" />

      <div className="relative flex-1 container-px max-w-7xl mx-auto w-full grid lg:grid-cols-2 items-center content-center gap-6 lg:gap-10 pt-7 pb-5 sm:py-10">
        {/* Headline slides — stacked in one grid cell so the block sizes
            itself and keeps its padding, then cross-fades. */}
        <div
          className="select-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="grid">
            {slides.map((slide, i) => {
              const on = i === active
              return (
                <div
                  key={slide.id}
                  aria-hidden={!on}
                  className={`col-start-1 row-start-1 transition-all duration-700 ease-out ${
                    on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                  }`}
                >
                  <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-amber-400">{slide.eyebrow}</p>
                  <h2 className="mt-2.5 font-display font-semibold text-[32px] leading-[1.1] sm:text-5xl lg:text-6xl">
                    {slide.title}{' '}
                    <span className="font-script text-amber-400 text-[42px] sm:text-6xl lg:text-7xl italic font-bold whitespace-nowrap">{slide.accent}</span>
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-sm leading-relaxed">{slide.subtitle}</p>
                  <Link
                    to={slide.href}
                    tabIndex={on ? 0 : -1}
                    className="mt-5 inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-ink-900 font-bold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    {slide.cta}
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>

          {count > 1 && (
            <div className="mt-5 flex items-center gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-7 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>

        {loading ? <RailSkeleton /> : products.length > 0 ? <ProductRail products={products} /> : null}
      </div>

      {/* Trust badges */}
      <div className="relative container-px max-w-7xl mx-auto w-full pb-6 pt-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-4 border-t border-white/10 pt-5">
          {badges.map(({ Icon, title, sub, href }) => {
            const inner = (
              <>
                <span className="w-9 h-9 shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-xs font-semibold truncate">{title}</span>
                  <span className="block text-[11px] text-slate-400 truncate">{sub}</span>
                </span>
              </>
            )
            return href ? (
              <a key={title} href={href} className="flex items-center gap-2.5 min-w-0 hover:opacity-90">{inner}</a>
            ) : (
              <div key={title} className="flex items-center gap-2.5 min-w-0">{inner}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
