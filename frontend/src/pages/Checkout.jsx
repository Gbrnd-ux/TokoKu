import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const PAYMENT_METHODS = [
  { value: 'bca',     label: 'Transfer BCA',     icon: '🏦', info: '1234567890', name: 'TokoKu Official' },
  { value: 'bni',     label: 'Transfer BNI',     icon: '🏦', info: '0987654321', name: 'TokoKu Official' },
  { value: 'mandiri', label: 'Transfer Mandiri', icon: '🏦', info: '1122334455', name: 'TokoKu Official' },
  { value: 'gopay',   label: 'GoPay',            icon: '💚', info: '087745673071', name: 'TokoKu Official' },
  { value: 'dana',    label: 'DANA',             icon: '💙', info: '087745673071', name: 'TokoKu Official' },
  { value: 'cod',     label: 'Bayar di Tempat',  icon: '💵', info: 'Bayar saat kurir tiba', name: '' },
];

function StepForm({ cartItems, cartTotal, onSuccess }) {
  const [form, setForm]       = useState({ shipping_address: '', payment_method: 'bca', notes: '' });
  const [loading, setLoading] = useState(false);
  const selected = PAYMENT_METHODS.find(m => m.value === form.payment_method);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shipping_address.trim()) return toast.error('Alamat pengiriman wajib diisi');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', form);
      onSuccess({ orderId: data.order.id, total: cartTotal, method: selected });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">📍 Alamat Pengiriman</h2>
            <textarea name="shipping_address" value={form.shipping_address}
              onChange={e => setForm({ ...form, shipping_address: e.target.value })}
              rows={3} className="input resize-none"
              placeholder="Jl. Contoh No. 123, Kecamatan, Kota, Provinsi" required />
            <input type="text" name="notes" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="input" placeholder="Catatan untuk penjual (opsional)" />
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">💳 Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(m => (
                <label key={m.value}
                  className={`cursor-pointer border-2 rounded-xl p-3 transition-all
                    ${form.payment_method === m.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                      : 'border-gray-200 hover:border-indigo-300'}`}>
                  <input type="radio" name="payment_method" value={m.value}
                    checked={form.payment_method === m.value}
                    onChange={e => setForm({ ...form, payment_method: e.target.value })}
                    className="sr-only" />
                  <p className="text-sm font-semibold text-gray-800">{m.icon} {m.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.info}</p>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Memproses...' : '✅ Buat Pesanan'}
          </button>
        </form>

        <div className="card p-5 space-y-3 h-fit">
          <h2 className="font-semibold text-gray-900">🧾 Ringkasan</h2>
          <div className="space-y-2 text-sm">
            {cartItems.map(i => (
              <div key={i.id} className="flex justify-between text-gray-600">
                <span className="truncate max-w-[130px]">{i.name} x{i.quantity}</span>
                <span>{fmt(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-indigo-600">{fmt(cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPayment({ orderId, total, method, onPaid }) {
  const DURATION = 60 * 60;
  const [timeLeft,  setTimeLeft]  = useState(DURATION);
  const [copied,    setCopied]    = useState('');
  const [preview,   setPreview]   = useState(null);
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded,  setUploaded]  = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timer); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const h   = String(Math.floor(s / 3600)).padStart(2, '0');
    const m   = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Disalin!');
    setTimeout(() => setCopied(''), 2000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error('Ukuran file max 5MB');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Pilih bukti pembayaran dulu');
    setUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    setUploaded(true);
    setUploading(false);
    toast.success('Bukti pembayaran terkirim! Menunggu konfirmasi admin.');
  };

  const isCOD = method.value === 'cod';

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Status Header */}
      <div className="card p-5 text-center space-y-1">
        <div className="text-5xl mb-2">{isCOD ? '🚚' : '⏳'}</div>
        <h1 className="text-xl font-bold text-gray-900">
          {isCOD ? 'Pesanan Dikonfirmasi!' : 'Selesaikan Pembayaran'}
        </h1>
        <p className="text-sm text-gray-500">
          Order ID: <span className="font-bold text-indigo-600">#{orderId}</span>
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 pt-3">
          {['Pesanan Dibuat', 'Pembayaran', 'Verifikasi', 'Diproses'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex flex-col items-center gap-1`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 0 ? 'bg-green-500 text-white' :
                    i === 1 ? 'bg-indigo-600 text-white' :
                    'bg-gray-200 text-gray-400'}`}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <span className="text-xs text-gray-400 w-16 text-center leading-tight">{s}</span>
              </div>
              {i < 3 && <div className={`w-8 h-0.5 mb-4 ${i === 0 ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {!isCOD && (
        <>
          {/* Timer */}
          <div className={`card p-4 text-center ${timeLeft < 300 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <p className="text-xs font-medium text-gray-500 mb-1">⏱ Batas waktu pembayaran</p>
            <p className={`text-3xl font-bold font-mono tracking-widest ${timeLeft < 300 ? 'text-red-600' : 'text-yellow-600'}`}>
              {formatTime(timeLeft)}
            </p>
            {timeLeft === 0 && (
              <p className="text-xs text-red-500 mt-1 font-medium">Waktu habis! Hubungi admin jika sudah transfer.</p>
            )}
            {timeLeft > 0 && (
              <p className="text-xs text-gray-400 mt-1">Segera transfer sebelum waktu habis</p>
            )}
          </div>

          {/* Info Rekening */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">🏦 Detail Transfer</h2>

            {/* Total */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-xs text-indigo-500 font-medium mb-1">Total yang harus ditransfer</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-indigo-700">{fmt(total)}</p>
                <button onClick={() => copy(String(total), 'total')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                    ${copied === 'total' ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {copied === 'total' ? '✓ Disalin' : 'Salin'}
                </button>
              </div>
              <p className="text-xs text-indigo-400 mt-1">Transfer nominal tepat untuk mempercepat verifikasi</p>
            </div>

            {/* Rekening */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                <span className="text-xl">{method.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{method.label}</p>
                  {method.name && <p className="text-xs text-gray-400">a/n {method.name}</p>}
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Nomor Rekening / Akun</p>
                  <p className="font-mono font-bold text-xl text-gray-800 tracking-wider">{method.info}</p>
                </div>
                <button onClick={() => copy(method.info, 'rekening')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                    ${copied === 'rekening' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {copied === 'rekening' ? '✓ Disalin' : 'Salin'}
                </button>
              </div>
            </div>

            {/* Langkah */}
            <div className="space-y-2.5">
              <p className="text-sm font-semibold text-gray-700">📌 Cara Pembayaran:</p>
              {[
                `Buka aplikasi ${method.label}`,
                `Transfer ke ${method.info} a/n ${method.name}`,
                `Masukkan nominal tepat ${fmt(total)}`,
                'Simpan bukti transfer (screenshot)',
                'Upload bukti di bawah ini',
                'Tunggu konfirmasi admin (maks. 1x24 jam)',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Bukti */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">📎 Upload Bukti Pembayaran</h2>
              {!uploaded && <span className="text-xs text-red-500 font-medium">* Wajib</span>}
            </div>

            {!uploaded ? (
              <>
                <div onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer
                             hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                  {preview ? (
                    <img src={preview} alt="preview" className="max-h-52 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">📷</div>
                      <p className="text-sm font-medium text-gray-600">Klik untuk pilih foto bukti transfer</p>
                      <p className="text-xs text-gray-400">Format JPG, PNG — Maks. 5MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                {file && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    </div>
                    <button onClick={() => { setFile(null); setPreview(null); }}
                      className="text-xs text-red-400 hover:text-red-600 font-medium ml-2">Hapus</button>
                  </div>
                )}

                <button onClick={handleUpload} disabled={!file || uploading}
                  className="btn-primary w-full py-2.5 disabled:opacity-50">
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Mengirim bukti...
                    </span>
                  ) : '📤 Kirim Bukti Pembayaran'}
                </button>
              </>
            ) : (
              <div className="text-center space-y-3 py-4">
                <div className="text-5xl">✅</div>
                <p className="font-semibold text-green-700">Bukti pembayaran berhasil dikirim!</p>
                <img src={preview} alt="bukti" className="max-h-40 mx-auto rounded-xl object-contain border border-gray-200 shadow-sm" />
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-700">
                  Admin akan memverifikasi dalam <strong>1x24 jam</strong>.<br/>
                  Notifikasi akan dikirim via WhatsApp/Email.
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* COD */}
      {isCOD && (
        <div className="card p-5 space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-green-800">🚚 Detail Pesanan COD</p>
            {[
              'Pesanan kamu sedang diproses oleh penjual',
              'Kurir akan menghubungi kamu sebelum pengiriman',
              `Siapkan uang tunai sebesar ${fmt(total)}`,
              'Bayar langsung ke kurir saat barang tiba',
              'Pastikan kondisi barang sebelum membayar',
            ].map((info, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <p className="text-sm text-green-700">{info}</p>
              </div>
            ))}
          </div>
          <div className="border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Siapkan uang tunai sebesar</p>
            <p className="text-3xl font-bold text-indigo-600">{fmt(total)}</p>
          </div>
        </div>
      )}

      {/* Butuh Bantuan */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Butuh bantuan?</p>
          <p className="text-xs text-gray-400">Sebutkan Order ID <strong>#{orderId}</strong></p>
        </div>
        <a href="https://wa.me/6287745673071" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <span>💬</span> WhatsApp
        </a>
      </div>

      <div className="flex gap-3 pb-6">
        <button onClick={onPaid} className="btn-primary flex-1 py-2.5">
          📋 Lihat Pesanan
        </button>
        <button onClick={() => window.location.href = '/'} className="btn-outline flex-1 py-2.5">
          🛍️ Belanja Lagi
        </button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { cartItems, cartTotal, fetchCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [orderData, setOrderData] = useState(null);

  const handleOrderSuccess = ({ orderId, total, method }) => {
    setOrderData({ orderId, total, method });
    fetchCart();
    setStep(2);
  };

  return step === 1 ? (
    <StepForm cartItems={cartItems} cartTotal={cartTotal} onSuccess={handleOrderSuccess} />
  ) : (
    <StepPayment
      orderId={orderData.orderId}
      total={orderData.total}
      method={orderData.method}
      onPaid={() => navigate('/orders')}
    />
  );
}