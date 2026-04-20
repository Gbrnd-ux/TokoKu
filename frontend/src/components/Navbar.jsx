import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount }    = useCart();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
          🛍️ TokoKu
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Beranda</Link>
          {user?.role === 'admin' && (
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Orders */}
              <Link to="/orders" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors hidden sm:block">
                Pesanan Saya
              </Link>

              {/* User menu */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium hidden sm:block">{user.name}</span>
                <button onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"    className="btn-outline text-sm py-1.5 px-3">Masuk</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Daftar</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
