import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProduct, createProduct, updateProduct } from '../../api/products'
import { categories } from '../../data/mockData'

const empty = { name: '', category: categories[0].id, price: '', mrp: '', stock: '', image: '', description: '', featured: false, bestSeller: false }

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = id !== 'new'
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) getProduct(id).then((p) => { setForm(p); setLoading(false) })
  }, [id, isEdit])

  function update(key, value) { setForm((f) => ({ ...f, [key]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock) }
      if (isEdit) await updateProduct(id, payload)
      else await createProduct(payload)
      navigate('/admin/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-500 text-sm">Loading…</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2">{error}</p>}
        <div>
          <label className="label">Product Name</label>
          <input required className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input required className="input" value={form.image} onChange={(e) => update('image', e.target.value)} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Price (₹)</label>
            <input required type="number" min="0" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} />
          </div>
          <div>
            <label className="label">MRP (₹)</label>
            <input required type="number" min="0" className="input" value={form.mrp} onChange={(e) => update('mrp', e.target.value)} />
          </div>
          <div>
            <label className="label">Stock</label>
            <input required type="number" min="0" className="input" value={form.stock} onChange={(e) => update('stock', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea rows={3} className="input" value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.featured} onChange={(e) => update('featured', e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.bestSeller} onChange={(e) => update('bestSeller', e.target.checked)} /> Best Seller</label>
        </div>
        <button disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Product'}</button>
      </form>
    </div>
  )
}
