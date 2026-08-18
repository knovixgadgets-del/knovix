// Generic placeholder for simple content pages (About, FAQ, Privacy, etc.)
// linked from the footer — swap in real copy whenever it's ready.
export default function StaticPage({ title }) {
  return (
    <div className="container-px max-w-3xl mx-auto py-16">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-slate-500 text-sm">Content for this page is coming soon.</p>
    </div>
  )
}
