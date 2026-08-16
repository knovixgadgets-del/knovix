import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, deleteProduct } from '../../api/products'

export default function ProductsList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
<<<<<<< HEAD
    getProducts()
      .then((items) => { setProducts(items); setLoading(false) })
      .catch(() => { setProducts([]); setLoading(false) })
=======
    getProducts().then((items) => { setProducts(items); setLoading(false) })
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
  }
  useEffect(load, [])

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await deleteProduct(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

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
            ) : products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3 flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover bg-slate-50" />
                  <span className="line-clamp-1">{p.name}</span>
                </td>
                <td className="p-3 capitalize text-slate-600">{p.category.replace('-', ' ')}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">
                  <span className={p.stock <= 10 ? 'text-red-500 font-medium' : ''}>{p.stock}</span>
                </td>
                <td className="p-3 text-right space-x-3">
                  <Link to={`/admin/products/${p.id}`} className="text-brand-700">Edit</Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
