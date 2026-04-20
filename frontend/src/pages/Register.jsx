import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm)
      return toast.error('Password tidak cocok');
    if (form.password.length < 6)
      return toast.error('Password minimal 6 karakter');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Registrasi berhasil! Selamat berbelanja 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-sm text-gray-500 mt-1">Sudah punya akun? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Masuk</Link></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nama Lengkap', name: 'name',    type: 'text',     placeholder: 'Budi Santoso' },
            { label: 'Email',        name: 'email',   type: 'email',    placeholder: 'email@contoh.com' },
            { label: 'No. HP',       name: 'phone',   type: 'tel',      placeholder: '08xxxxxxxxxx' },
            { label: 'Password',     name: 'password',type: 'password', placeholder: 'Min. 6 karakter' },
            { label: 'Ulangi Password', name: 'confirm', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                className="input" placeholder={f.placeholder}
                required={f.name !== 'phone'} />
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base">
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
