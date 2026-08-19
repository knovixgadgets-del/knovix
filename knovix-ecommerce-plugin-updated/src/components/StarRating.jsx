export default function StarRating({ rating = 0, reviews, size = 'text-xs' }) {
  const pct = Math.max(0, Math.min(5, rating)) / 5 * 100

  return (
    <div className="flex items-center gap-1">
      {/* Two stacked star rows: a muted background row of 5 stars, and an
          amber row on top clipped to the rating's percentage — this gives
          a true fractional fill (e.g. 4.3 shows a partially-filled 5th
          star) instead of just rounding to the nearest whole star. */}
      <div className={`relative inline-block leading-none tracking-[1px] ${size}`}>
        <div className="text-slate-300" aria-hidden="true">★★★★★</div>
        <div
          className="absolute inset-0 overflow-hidden text-amber-400 whitespace-nowrap"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          ★★★★★
        </div>
        <span className="sr-only">{rating} out of 5 stars</span>
      </div>

      {reviews !== undefined && <span className="text-slate-400 ml-0.5 text-xs">({reviews})</span>}
    </div>
  )
}
