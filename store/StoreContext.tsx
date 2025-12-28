
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order, Review, OrderStatus, Coupon, Notification } from '../types';
import { apiService } from '../services/api';
import { MOCK_REVIEWS } from '../constants';

type Locale = 'en' | 'hi';

interface StoreState {
  products: Product[];
  isLoading: boolean;
  cart: CartItem[];
  wishlist: string[];
  compareList: string[]; // List of product IDs
  user: User | null;
  orders: Order[];
  reviews: Review[];
  notifications: Notification[];
  recentlyViewed: string[];
  activeCoupon: Coupon | null;
  locale: Locale;
  setLocale: (l: Locale) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  trackView: (productId: string) => void;
  applyCoupon: (code: string) => boolean;
  placeOrder: (address: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => void;
  refreshProducts: (query?: string, category?: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  watchPrice: (productId: string) => void;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const initStore = async () => {
      setIsLoading(true);
      try {
        const prodData = await apiService.products.getAll();
        setProducts(prodData);
        setReviews(MOCK_REVIEWS);

        const savedUser = localStorage.getItem('nova_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          const orderData = await apiService.orders.getUserOrders(parsedUser.id);
          setOrders(orderData);
        }

        const savedCart = localStorage.getItem('nova_cart');
        if (savedCart) setCart(JSON.parse(savedCart));

        const savedWish = localStorage.getItem('nova_wishlist');
        if (savedWish) setWishlist(JSON.parse(savedWish));

        const savedViewed = localStorage.getItem('nova_viewed');
        if (savedViewed) setRecentlyViewed(JSON.parse(savedViewed));

        const savedLocale = localStorage.getItem('nova_locale');
        if (savedLocale) setLocale(savedLocale as Locale);
      } finally {
        setIsLoading(false);
      }
    };
    initStore();
  }, []);

  useEffect(() => localStorage.setItem('nova_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('nova_wishlist', JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem('nova_viewed', JSON.stringify(recentlyViewed)), [recentlyViewed]);
  useEffect(() => localStorage.setItem('nova_locale', locale), [locale]);

  const addNotification = (type: Notification['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const refreshProducts = async (query?: string, category?: string) => {
    setIsLoading(true);
    const data = await apiService.products.getAll(query, category);
    setProducts(data);
    setIsLoading(false);
  };

  const watchPrice = (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    addNotification('info', `Price alert set for ${p?.name}! We'll notify you if the price drops.`);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        addNotification('info', `Updated ${product.name} quantity.`);
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      addNotification('success', `${product.name} added to cart!`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.id !== productId));
  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
  };
  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addNotification('info', 'Removed from wishlist.');
        return prev.filter(id => id !== productId);
      } else {
        const prod = products.find(p => p.id === productId);
        addNotification('success', `${prod?.name} saved to wishlist!`);
        return [...prev, productId];
      }
    });
  };

  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      const exists = prev.includes(productId);
      if (exists) return prev.filter(id => id !== productId);
      if (prev.length >= 2) {
        addNotification('error', 'You can only compare 2 products at a time.');
        return prev;
      }
      addNotification('info', 'Product added to comparison tray.');
      return [...prev, productId];
    });
  };

  const trackView = (productId: string) => {
    setRecentlyViewed(prev => [productId, ...prev.filter(id => id !== productId)].slice(0, 8));
  };

  const applyCoupon = (code: string) => {
    const coupons: Coupon[] = [
      { code: 'NOVA10', discount: 10, description: '10% off' },
      { code: 'WELCOME20', discount: 20, description: '20% off' }
    ];
    const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (found) { 
      setActiveCoupon(found); 
      addNotification('success', `Coupon ${code} applied!`);
      return true; 
    }
    addNotification('error', 'Invalid coupon code.');
    return false;
  };

  const placeOrder = async (address: string) => {
    if (!user) return;
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = activeCoupon ? (subtotal * activeCoupon.discount) / 100 : 0;
    const finalTotal = subtotal - discount;

    const newOrder = await apiService.orders.place(user.id, cart, finalTotal, address);
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setActiveCoupon(null);
    addNotification('success', 'Order placed successfully! Check your email for confirmation.');
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await apiService.orders.updateStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    addNotification('info', `Order ${orderId} status updated to ${status}.`);
  };

  const login = async (email: string) => {
    const userData = await apiService.auth.login(email);
    setUser(userData);
    localStorage.setItem('nova_user', JSON.stringify(userData));
    const userOrders = await apiService.orders.getUserOrders(userData.id);
    setOrders(userOrders);
    addNotification('success', `Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
    localStorage.removeItem('nova_user');
    addNotification('info', 'Logged out successfully.');
  };

  const addReview = (review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0]
    };
    setReviews(prev => [newReview, ...prev]);
    addNotification('success', 'Review submitted! Thank you.');
  };

  return (
    <StoreContext.Provider value={{ 
      products, isLoading, cart, wishlist, compareList, user, orders, reviews, notifications, recentlyViewed, activeCoupon,
      locale, setLocale,
      addToCart, removeFromCart, updateCartQuantity, clearCart, toggleWishlist, toggleCompare, trackView,
      applyCoupon, placeOrder, updateOrderStatus, login, logout, refreshProducts, addReview, addNotification, watchPrice
    }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${
            n.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            n.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <span className="text-xl">
              {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <p className="text-xs font-bold uppercase tracking-wider">{n.message}</p>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
