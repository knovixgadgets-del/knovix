import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-px max-w-md mx-auto py-24 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-slate-500 mt-2">Page not found.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back to Home</Link>
    </div>
  )
}
