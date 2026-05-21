import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages — we build these in Step 7 and 8
import HomePage        from './pages/HomePage';
import SearchPage      from './pages/SearchPage';
import ProductPage     from './pages/ProductPage';
import ShopPage        from './pages/ShopPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import ShopDashboard   from './pages/shop/ShopDashboard';
import ShopInventory   from './pages/shop/ShopInventory';
import NotFoundPage    from './pages/NotFoundPage';

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

          {/* Shop owner — protected */}
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

          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}