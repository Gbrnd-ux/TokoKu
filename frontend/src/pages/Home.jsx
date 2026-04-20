import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { search, category, page, limit: 12 } })
      .then(({ data }) => {
        setProducts(data.products);
        setTotalPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleCategory = (slug) => { setCategory(slug === category ? '' : slug); setPage(1); };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Belanja Mudah & Terpercaya 🛍️</h1>
        <p className="text-indigo-100">Temukan produk terbaik dengan harga terjangkau</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" value={search} onChange={handleSearch}
          placeholder="Cari produk..."
          className="input pl-10 py-3 text-base shadow-sm" />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => handleCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
            ${!category ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'}`}>
          Semua
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => handleCategory(c.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${category === c.slug ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📦</p>
          <p className="text-lg font-medium">Produk tidak ditemukan</p>
          <p className="text-sm">Coba kata kunci lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                ${page === p ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-400'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
