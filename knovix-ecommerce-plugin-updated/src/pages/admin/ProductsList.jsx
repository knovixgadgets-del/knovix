import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, deleteProduct } from '../../api/products'

export default function ProductsList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    getProducts({}, { includeHidden: true })
      .then((items) => setProducts(items))
      .catch((err) => { setProducts([]); setError(err.message || "Couldn't load products.") })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      load()
    } catch (err) {
      setError(err.message || "Couldn't delete this product.")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2 mb-4">
          {error} <button type="button" onClick={load} className="underline font-medium">Retry</button>
        </p>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-slate-400" colSpan={5}>Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td className="p-4 text-slate-400" colSpan={5}>{error ? 'Products could not be loaded.' : 'No products yet.'}</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3 flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover bg-slate-50" />
                  <span className="line-clamp-1">{p.name}</span>
                </td>
                <td className="p-3 capitalize text-slate-600">{String(p.category || '').replace(/-/g, ' ')}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">
                  <span className={p.stock !== null && p.stock !== '' && Number(p.stock) <= 10 ? 'text-red-500 font-medium' : ''}>{p.stock ?? '—'}</span>
                </td>
                <td className="p-3 text-right space-x-3">
                  <Link to={`/admin/products/${p.id}`} className="text-brand-700">Edit</Link>
                  <button type="button" onClick={() => handleDelete(p.id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
