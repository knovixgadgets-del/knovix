import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomeBannerCarousel.css';

/**
 * Home banner carousel.
 *
 * - Loads the slides from the WordPress plugin:  GET /wp-json/knovix/v1/banners
 *   (managed in wp-admin > WooCommerce > Knovix Banners).
 * - If the API is slow or unreachable it shows the 3 images in /public/banners,
 *   so the home page is never empty.
 *
 * Usage:   <HomeBannerCarousel />
 */

// Works whether VITE_API_BASE_URL is ".../wp-json/knovix/v1" or just the site URL.
function apiRoot(base) {
  const b = String(base || '').replace(/\/+$/, '');
  if (!b) return '/wp-json/knovix/v1';
  return b.includes('/wp-json') ? b : `${b}/wp-json/knovix/v1`;
}

const FALLBACK = [1, 2, 3].map((n) => ({
  id: `fallback-${n}`,
  image: `/banners/knovix-banner-${n}.webp`,
  mobileImage: `/banners/knovix-banner-${n}-sm.webp`,
  alt: 'Knovix Gadgets',
  link: '/shop',
}));

function SlideLink({ link, active, children }) {
  if (!link) return children;
  const tab = active ? 0 : -1;
  if (/^https?:\/\//i.test(link)) {
    return (
      <a href={link} tabIndex={tab} className="kbc-link">
        {children}
      </a>
    );
  }
  return (
    <Link to={link} tabIndex={tab} className="kbc-link">
      {children}
    </Link>
  );
}

export default function HomeBannerCarousel({
  apiBase = import.meta.env.VITE_API_BASE_URL,
  interval = 5000,
}) {
  const [slides, setSlides] = useState(FALLBACK);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = slides.length;

  // Load banners from the backend.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${apiRoot(apiBase)}/banners`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setSlides(data);
          setIndex(0);
        }
      })
      .catch(() => {}); // keep the fallback slides
    return () => ctrl.abort();
  }, [apiBase]);

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  // Auto-loop (respects "reduce motion").
  useEffect(() => {
    if (paused || count < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(t);
  }, [paused, count, interval]);

  const onTouchStart = (e) => {
    setPaused(true);
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    const start = touchX.current;
    touchX.current = null;
    setPaused(false);
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      className="kbc"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="kbc-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div
            className="kbc-slide"
            key={s.id || i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
          >
            <SlideLink link={s.link} active={i === index}>
              <picture>
                <source media="(max-width: 640px)" srcSet={s.mobileImage || s.image} />
                <img
                  src={s.image}
                  alt={s.alt || ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable="false"
                />
              </picture>
            </SlideLink>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button type="button" className="kbc-arrow kbc-prev" aria-label="Previous banner" onClick={() => go(index - 1)}>
            &#8249;
          </button>
          <button type="button" className="kbc-arrow kbc-next" aria-label="Next banner" onClick={() => go(index + 1)}>
            &#8250;
          </button>
          <div className="kbc-dots">
            {slides.map((s, i) => (
              <button
                type="button"
                key={s.id || i}
                className={i === index ? 'kbc-dot is-active' : 'kbc-dot'}
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
