import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Selamat datang, ${user.name}! 👋`);
      navigate(user.role === 'admin' ? '/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Masuk ke TokoKu</h1>
          <p className="text-sm text-gray-500 mt-1">Belum punya akun? <Link to="/register" className="text-indigo-600 font-medium hover:underline">Daftar sekarang</Link></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="input" placeholder="email@contoh.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="input" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
