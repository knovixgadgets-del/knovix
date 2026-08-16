export default function StarRating({ rating = 0, reviews }) {
  const full = Math.round(rating)
  return (
    <div className="flex items-center gap-1 text-amber-400 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < full ? '★' : '☆'}</span>
      ))}
      {reviews !== undefined && <span className="text-slate-400 ml-1">({reviews})</span>}
    </div>
  )
}
