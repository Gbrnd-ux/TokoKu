import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar      from './components/Navbar';
import Home        from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart        from './pages/Cart';
import Checkout    from './pages/Checkout';
import Login       from './pages/Login';
import Register    from './pages/Register';
import MyOrders    from './pages/MyOrders';
import Dashboard   from './pages/Dashboard';

// Route guard untuk halaman yang butuh login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><span className="text-gray-500">Loading...</span></div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Route guard khusus admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />

          <Route path="/cart"     element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders"   element={<PrivateRoute><MyOrders /></PrivateRoute>} />

          <Route path="/dashboard/*" element={<AdminRoute><Dashboard /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
