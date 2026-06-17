import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage        from './pages/HomePage';
import SearchPage      from './pages/SearchPage';
import ProductPage     from './pages/ProductPage';
import ShopPage        from './pages/ShopPage';
import CartPage        from './pages/CartPage';
import CheckoutPage    from './pages/CheckoutPage';
import OrdersPage      from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import NotFoundPage    from './pages/NotFoundPage';

// Shop owner pages
import ShopDashboard   from './pages/shop/ShopDashboard';
import ShopInventory   from './pages/shop/ShopInventory';
import ShopOrders      from './pages/shop/ShopOrders';
import ShopSettings    from './pages/shop/ShopSettings';

// Admin pages
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminShops      from './pages/admin/AdminShops';
import AdminProducts   from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders     from './pages/admin/AdminOrders';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public pages */}
          <Route path="/"                element={<HomePage />} />
          <Route path="/search"          element={<SearchPage />} />
          <Route path="/products/:slug"  element={<ProductPage />} />
          <Route path="/shops/:slug"     element={<ShopPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } />

          {/* Shop owner pages */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="shop_owner">
              <ShopDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/inventory" element={
            <ProtectedRoute requiredRole="shop_owner">
              <ShopInventory />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/orders" element={
            <ProtectedRoute requiredRole="shop_owner">
              <ShopOrders />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute requiredRole="shop_owner">
              <ShopSettings />
            </ProtectedRoute>
          } />

          {/* Admin pages */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/shops" element={
            <ProtectedRoute requiredRole="admin">
              <AdminShops />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute requiredRole="admin">
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute requiredRole="admin">
              <AdminCategories />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute requiredRole="admin">
              <AdminOrders />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
