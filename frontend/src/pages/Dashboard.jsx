import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const STATUS_STYLE = {
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ─── Sub-pages ────────────────────────────────────────────────

function DashboardHome() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=1'),
      api.get('/orders'),
      api.get('/auth/users'),
    ]).then(([p, o, u]) => {
      const revenue = o.data.orders.reduce((s, x) => s + Number(x.total_price), 0);
      setStats({ products: p.data.total, orders: o.data.orders.length, users: u.data.users.length, revenue });
    });
  }, []);

  const cards = [
    { label: 'Total Produk',  value: stats.products,       icon: '📦', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Order',   value: stats.orders,          icon: '🛒', color: 'bg-purple-50 text-purple-600' },
    { label: 'Total User',    value: stats.users,           icon: '👤', color: 'bg-green-50 text-green-600' },
    { label: 'Total Revenue', value: fmt(stats.revenue),    icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Ringkasan Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`card p-4 ${c.color}`}>
            <div className="text-3xl mb-1">{c.icon}</div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm font-medium opacity-80">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductManager() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form, setForm] = useState({ name: '', category_id: '', description: '', price: '', stock: '' });
  const [image, setImage] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products?limit=50').then(({ data }) => setProducts(data.products)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', category_id: '', description: '', price: '', stock: '' }); setImage(null); setShowForm(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, category_id: p.category_id || '', description: p.description || '', price: p.price, stock: p.stock }); setImage(null); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);

    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk diperbarui!');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk ditambahkan!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Produk dihapus');
    fetchProducts();
  };

  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Manajemen Produk</h2>
        <button onClick={openAdd} className="btn-primary">+ Tambah Produk</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">{editing ? 'Edit Produk' : 'Tambah Produk'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { label: 'Nama Produk', name: 'name',        type: 'text' },
                { label: 'Harga (Rp)',  name: 'price',       type: 'number' },
                { label: 'Stok',        name: 'stock',       type: 'number' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    className="input" required />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input">
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} className="input resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar {editing && '(opsional, kosongkan jika tidak diganti)'}</label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-medium cursor-pointer" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Memuat...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Gambar', 'Nama', 'Kategori', 'Harga', 'Stok', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <img src={p.image ? `${API_URL}/uploads/${p.image}` : 'https://placehold.co/48x48'}
                      alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name || '-'}</td>
                  <td className="px-4 py-3 text-indigo-600 font-semibold">{fmt(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-indigo-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:underline font-medium">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrderManager() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success('Status diperbarui');
    fetchOrders();
  };

  const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  const STATUS_LABEL   = { pending: 'Menunggu', paid: 'Dibayar', shipped: 'Dikirim', delivered: 'Selesai', cancelled: 'Batal' };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Manajemen Order</h2>
      {loading ? (
        <p className="text-center text-gray-400 py-8">Memuat...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Order ID', 'Pelanggan', 'Total', 'Status', 'Tanggal', 'Ubah Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-800">#{o.id}</td>
                  <td className="px-4 py-3 text-gray-600">{o.user_name}</td>
                  <td className="px-4 py-3 text-indigo-600 font-bold">{fmt(o.total_price)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserManager() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h2>
      {loading ? (
        <p className="text-center text-gray-400 py-8">Memuat...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Nama', 'Email', 'No. HP', 'Role', 'Bergabung'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Layout ──────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/dashboard',          label: '📊 Overview',  end: true },
  { to: '/dashboard/products', label: '📦 Produk' },
  { to: '/dashboard/orders',   label: '🛒 Order' },
  { to: '/dashboard/users',    label: '👤 Pengguna' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-6 min-h-[80vh]">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0">
        <div className="card p-3 space-y-1 sticky top-24">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 pb-1">Admin Panel</p>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                 ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <button onClick={() => navigate('/')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
              ← Kembali ke Toko
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <Routes>
          <Route index          element={<DashboardHome />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders"   element={<OrderManager />} />
          <Route path="users"    element={<UserManager />} />
        </Routes>
      </main>
    </div>
  );
}
