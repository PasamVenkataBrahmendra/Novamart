
import { Product, User, Order, Review, CartItem, OrderStatus } from '../types';
import { MOCK_PRODUCTS, MOCK_REVIEWS } from '../constants';

/**
 * DEPLOYMENT CONFIGURATION:
 * This logic ensures the frontend finds your Render backend automatically.
 */
const getBaseUrl = () => {
  // Use VITE_API_URL if provided (Standard Vite way)
  const viteUrl = (import.meta as any).env?.VITE_API_URL;
  if (viteUrl) return viteUrl.replace(/\/$/, "");

  // Fallback for Render/Vercel environments where env vars might be tricky
  if (window.location.hostname.includes('vercel.app')) {
    // If we're on vercel, we likely want the production render backend
    // This is a common pattern for NovaMart users
    return 'https://novamart-backend.onrender.com/api';
  }
  
  // Local development fallback
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();
const IS_LIVE_BACKEND = API_BASE_URL.includes('onrender.com');

class MockDatabase {
  private products: Product[] = [];
  private users: User[] = [];
  private orders: Order[] = [];
  private reviews: Review[] = [];

  constructor() {
    this.load();
    if (this.products.length === 0) {
      this.products = MOCK_PRODUCTS;
      this.reviews = MOCK_REVIEWS;
      this.save();
    }
  }

  private load() {
    try {
      const data = localStorage.getItem('novamart_db');
      if (data) {
        const parsed = JSON.parse(data);
        this.products = parsed.products || [];
        this.users = parsed.users || [];
        this.orders = parsed.orders || [];
        this.reviews = parsed.reviews || [];
      }
    } catch (e) {
      console.warn("Local storage access failed, using memory.");
    }
  }

  private save() {
    try {
      localStorage.setItem('novamart_db', JSON.stringify({
        products: this.products.slice(0, 100),
        users: this.users,
        orders: this.orders,
        reviews: this.reviews
      }));
    } catch (e) {
      console.error("Database save failed: Storage likely full.");
    }
  }

  async getProducts(query?: string, category?: string) {
    await this.delay(200);
    let filtered = [...this.products];
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return filtered.slice(0, 50); 
  }

  async getProductById(id: string) {
    return this.products.find(p => p.id === id);
  }

  async login(email: string) {
    await this.delay(400);
    let user = this.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user'
      };
      this.users.push(user);
      this.save();
    }
    return user;
  }

  async placeOrder(userId: string, items: CartItem[], total: number, address: string) {
    await this.delay(600);
    const order: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      items,
      total,
      status: 'Processing',
      date: new Date().toISOString(),
      shippingAddress: address
    };
    this.orders.unshift(order);
    this.save();
    return order;
  }

  async getOrders(userId?: string) {
    await this.delay(300);
    if (userId) return this.orders.filter(o => o.userId === userId);
    return this.orders;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index].status = status;
      this.save();
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const db = new MockDatabase();

export const apiService = {
  config: {
    baseUrl: API_BASE_URL,
    isLive: IS_LIVE_BACKEND
  },
  products: {
    getAll: async (q?: string, cat?: string): Promise<Product[]> => {
      try {
        const url = new URL(`${API_BASE_URL}/products`);
        if (q) url.searchParams.append('search', q);
        if (cat) url.searchParams.append('category', cat);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Backend responded with error');
        return res.json();
      } catch (err) {
        console.warn("Backend connection failed. Using local storage mode.", err);
        return db.getProducts(q, cat);
      }
    },
    getOne: async (id: string): Promise<Product | undefined> => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        return res.json();
      } catch (err) {
        return db.getProductById(id);
      }
    },
  },
  auth: {
    login: async (email: string): Promise<User> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        return res.json();
      } catch (err) {
        return db.login(email);
      }
    },
  },
  orders: {
    place: async (userId: string, items: CartItem[], total: number, address: string): Promise<Order> => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, items, total, shippingAddress: address })
        });
        return res.json();
      } catch (err) {
        return db.placeOrder(userId, items, total, address);
      }
    },
    getUserOrders: async (userId: string): Promise<Order[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
        return res.json();
      } catch (err) {
        return db.getOrders(userId);
      }
    },
    getAll: async (): Promise<Order[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`);
        return res.json();
      } catch (err) {
        return db.getOrders();
      }
    },
    updateStatus: async (id: string, status: OrderStatus): Promise<void> => {
      try {
        await fetch(`${API_BASE_URL}/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        return;
      } catch (err) {
        return db.updateOrderStatus(id, status);
      }
    },
  }
};
