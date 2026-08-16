import { Routes, Route } from 'react-router-dom'
import StoreLayout from './layouts/StoreLayout'
import AdminLayout from './layouts/AdminLayout'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Account from './pages/Account'
import NotFound from './pages/NotFound'
import StaticPage from './pages/StaticPage'

import Dashboard from './pages/admin/Dashboard'
import ProductsList from './pages/admin/ProductsList'
import ProductForm from './pages/admin/ProductForm'
import OrdersList from './pages/admin/OrdersList'
import OrderDetail from './pages/admin/OrderDetail'

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
<<<<<<< HEAD
        {['about', 'careers', 'blog', 'contact', 'faq', 'returns', 'shipping', 'privacy', 'terms'].map((slug) => (
=======
        {['about', 'careers', 'blog', 'brands', 'contact', 'faq', 'returns', 'shipping', 'privacy', 'terms'].map((slug) => (
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
          <Route key={slug} path={`/${slug}`} element={<StaticPage title={slug.replace(/^\w/, (c) => c.toUpperCase())} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsList />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>
    </Routes>
  )
}
