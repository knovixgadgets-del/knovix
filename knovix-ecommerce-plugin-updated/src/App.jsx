import { Routes, Route, Navigate, useParams } from 'react-router-dom'
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
import Contact from './pages/Contact'
import Blog from './pages/Blog'

import Dashboard from './pages/admin/Dashboard'
import ProductsList from './pages/admin/ProductsList'
import ProductForm from './pages/admin/ProductForm'
import OrdersList from './pages/admin/OrdersList'
import OrderDetail from './pages/admin/OrderDetail'

// /category/mobile-accessories, /category/audio etc. are the descriptive,
// crawlable URLs referenced in category links across the site (and in the
// homepage's SEO fallback markup). Shop itself is filtered via the
// ?category= query param, so this just resolves the pretty URL to it.
// TODO: once category landing pages have their own copy/meta, replace this
// redirect with a real <CategoryPage> route so each category gets its own
// indexable, non-redirected URL.
function CategoryRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/shop?category=${slug}`} replace />
}

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
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/category/:slug" element={<CategoryRedirect />} />
        {/* Alias for the "About Knovix" brand page — points at the same
            /about content rather than a duplicate page, to avoid splitting
            SEO value across two near-identical URLs. */}
        <Route path="/about-knovix" element={<Navigate to="/about" replace />} />

        {['about', 'careers', 'brands', 'faq', 'returns', 'shipping', 'privacy', 'terms'].map((slug) => (
          <Route
            key={slug}
            path={`/${slug}`}
            element={
              <StaticPage
                slug={slug}
                title={slug.replace(/^\w/, (c) => c.toUpperCase())}
              />
            }
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsList />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>
    </Routes>
  )
}