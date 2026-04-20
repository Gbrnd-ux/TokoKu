import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function Cart() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) return (
    <div className="text-center py-20 space-y-4">
      <p className="text-6xl">🛒</p>
      <h2 className="text-xl font-semibold text-gray-700">Keranjang kamu kosong</h2>
      <p className="text-gray-400 text-sm">Yuk, mulai belanja produk favorit kamu!</p>
      <Link to="/" className="btn-primary inline-block mt-2">Mulai Belanja</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors">
          Kosongkan semua
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Item List */}
        <div className="md:col-span-2 card p-4">
          {cartItems.map(item => <CartItem key={item.id} item={item} />)}
        </div>

        {/* Ringkasan Order */}
        <div className="card p-5 space-y-4 h-fit">
          <h2 className="font-semibold text-gray-900">Ringkasan Pesanan</h2>

          <div className="space-y-2 text-sm">
            {cartItems.map(i => (
              <div key={i.id} className="flex justify-between text-gray-600">
                <span className="truncate max-w-[150px]">{i.name} ×{i.quantity}</span>
                <span>{fmt(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-indigo-600">{fmt(cartTotal)}</span>
          </div>

          <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-3 text-base">
            Lanjut ke Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
