import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
<<<<<<< HEAD
    <BrowserRouter>
=======
    <BrowserRouter
      basename="/shop"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
<<<<<<< HEAD
)
=======
)
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
