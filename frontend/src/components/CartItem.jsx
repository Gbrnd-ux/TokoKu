import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const imgSrc = item.image ? `${API_URL}/uploads/${item.image}` : 'https://placehold.co/80x80';

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Gambar */}
      <img src={imgSrc} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />

      {/* Detail */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
        <p className="text-sm text-indigo-600 font-bold mt-0.5">{fmt(item.price)}</p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600
                       hover:bg-gray-100 text-base font-bold transition-colors"
          >−</button>

          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>

          <button
            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600
                       hover:bg-gray-100 text-base font-bold transition-colors disabled:opacity-40"
          >+</button>
        </div>
      </div>

      {/* Subtotal + hapus */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-800">{fmt(item.price * item.quantity)}</p>
        <button
          onClick={() => removeFromCart(item.product_id)}
          className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
