import { useState, useEffect } from 'react';
import api from '../api/axios';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const STATUS_STYLE = {
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
const STATUS_LABEL = {
  pending: 'Menunggu', paid: 'Dibayar', shipped: 'Dikirim', delivered: 'Selesai', cancelled: 'Dibatalkan',
};

export default function MyOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]     = useState(null);

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  const viewDetail = async (id) => {
    if (selected === id) { setSelected(null); setDetail(null); return; }
    setSelected(id);
    const { data } = await api.get(`/orders/${id}`);
    setDetail(data.order);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Memuat pesanan...</div>;

  if (!orders.length) return (
    <div className="text-center py-20 space-y-3">
      <p className="text-5xl">📋</p>
      <p className="text-lg font-semibold text-gray-700">Belum ada pesanan</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
      {orders.map(order => (
        <div key={order.id} className="card overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => viewDetail(order.id)}>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-800">Order #{order.id}</p>
              <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-right space-y-1">
              <span className={`badge ${STATUS_STYLE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
              <p className="text-sm font-bold text-indigo-600 block">{fmt(order.total_price)}</p>
            </div>
          </div>

          {/* Detail (expandable) */}
          {selected === order.id && detail && (
            <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Rincian Item:</h3>
              {detail.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.product_name} ×{item.quantity}</span>
                  <span>{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 text-sm text-gray-500">
                <p><strong>Alamat:</strong> {detail.shipping_address}</p>
                {detail.notes && <p><strong>Catatan:</strong> {detail.notes}</p>}
                <p><strong>Pembayaran:</strong> {detail.payment_method}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
