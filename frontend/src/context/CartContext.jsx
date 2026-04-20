import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading]     = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); setCartTotal(0); return; }
    try {
      const { data } = await api.get('/cart');
      setCartItems(data.items);
      setCartTotal(data.total);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      await api.post('/cart', { product_id: productId, quantity });
      await fetchCart();
      toast.success('Produk ditambahkan ke keranjang 🛒');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put('/cart', { product_id: productId, quantity });
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah jumlah');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
      toast.success('Produk dihapus dari keranjang');
    } catch {
      toast.error('Gagal menghapus produk');
    }
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCartItems([]);
    setCartTotal(0);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, cartCount, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
