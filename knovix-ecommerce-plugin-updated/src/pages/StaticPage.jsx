// Generic content pages (About, FAQ, Privacy, etc.) linked from the footer.
// Pages without real copy yet fall back to a placeholder; add real content
// here as it's written rather than shipping empty pages indefinitely.
const content = {
  about: (
    <>
      <h1 className="text-2xl font-bold mb-4">About Knovix</h1>
      <p className="text-slate-600 leading-relaxed">
        Knovix is an Indian online store for smart gadgets, electronics,
        mobile accessories, toys and everyday technology products. We source
        and curate gadgets that make everyday life a little smarter — from
        earbuds and smartwatches to chargers, mobile accessories and more —
        and ship them across India with easy replacement and secure payment
        options.
      </p>
      <p className="text-slate-600 leading-relaxed mt-4">
        Our goal is simple: help you find quality tech without the
        guesswork, backed by responsive customer support and fast delivery.
      </p>
    </>
  )
}

export default function StaticPage({ title, slug }) {
  const body = slug && content[slug]

  return (
    <div className="container-px max-w-3xl mx-auto py-16">
      {body ?? (
        <>
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          <p className="text-slate-500 text-sm">Content for this page is coming soon.</p>
        </>
      )}
    </div>
  )
}
