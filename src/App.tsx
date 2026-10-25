import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import AdminPage from './pages/AdminPage'
import CartPage from './pages/CartPage'
import KitchenPage from './pages/KitchenPage'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import OrderPage from './pages/OrderPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ReceptionPage from './pages/ReceptionPage'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/pedido/:id" element={<OrderTrackingPage />} />
            <Route path="/pedido/:id/confirmado" element={<OrderPage />} />

            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/cocina"
              element={
                <ProtectedRoute allowedRoles={['cocinero']}>
                  <KitchenPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recepcion"
              element={
                <ProtectedRoute allowedRoles={['recepcionista']}>
                  <ReceptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['administrador']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </CartProvider>
  )
}
