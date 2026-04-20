import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function ProductDetail() {
  const { slug }             = useParams();
  const { addToCart, loading } = useCart();
  const { user }             = useAuth();
  const navigate             = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty]         = useState(1);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => navigate('/'))
      .finally(() => setFetching(false));
  }, [slug, navigate]);

  const handleAdd = async () => {
    if (!user) { toast.error('Login dulu yuk!'); return navigate('/login'); }
    await addToCart(product.id, qty);
  };

  if (fetching) return (
    <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
      <div className="h-96 bg-gray-200 rounded-2xl" />
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/4" />
    </div>
  );

  if (!product) return null;

  const imgSrc = product.image ? `${API_URL}/uploads/${product.image}` : 'https://placehold.co/600x600?text=No+Image';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Gambar */}
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="space-y-4">
            <span className="badge bg-indigo-100 text-indigo-700">{product.category_name || 'Umum'}</span>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-3xl font-bold text-indigo-600">{fmt(product.price)}</p>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
              ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              {product.stock > 0 ? `Stok tersedia: ${product.stock}` : 'Stok habis'}
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            )}

            {/* Qty Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Jumlah:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors">−</button>
                  <span className="px-4 py-2 text-sm font-semibold border-x border-gray-300">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors">+</button>
                </div>
              </div>
            )}

            <button onClick={handleAdd}
              disabled={loading || product.stock === 0}
              className="btn-primary w-full py-3 text-base">
              {product.stock === 0 ? 'Stok Habis' : '🛒 Tambah ke Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
