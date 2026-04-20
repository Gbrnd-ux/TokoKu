import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login dulu yuk!'); return navigate('/login'); }
    await addToCart(product.id);
  };

  const imgSrc = product.image
    ? `${API_URL}/uploads/${product.image}`
    : 'https://placehold.co/300x300?text=No+Image';

  return (
    <Link to={`/product/${product.slug}`} className="card group block hover:shadow-md transition-shadow duration-200">
      {/* Gambar */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="badge bg-red-500 text-white text-sm">Habis</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-indigo-500 font-medium">{product.category_name || 'Umum'}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>
        <p className="text-base font-bold text-indigo-600">{formatRupiah(product.price)}</p>
        <p className="text-xs text-gray-400">Stok: {product.stock}</p>

        <button
          onClick={handleAddToCart}
          disabled={loading || product.stock === 0}
          className="w-full btn-primary text-sm py-1.5 mt-1"
        >
          {product.stock === 0 ? 'Stok Habis' : '+ Keranjang'}
        </button>
      </div>
    </Link>
  );
}
