
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { Link, Navigate } from 'react-router-dom';
import { geminiService } from '../services/gemini';
import { apiService } from '../services/api';
import { Product } from '../types';

const Admin: React.FC = () => {
  const { user, products, orders, refreshProducts, addNotification } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Simulation of weekly sales data for charts
  const salesData = [
    { day: 'Mon', value: 1200 },
    { day: 'Tue', value: 2400 },
    { day: 'Wed', value: 1800 },
    { day: 'Thu', value: 3100 },
    { day: 'Fri', value: 2900 },
    { day: 'Sat', value: 4500 },
    { day: 'Sun', value: 3800 },
  ];
  const maxVal = Math.max(...salesData.map(d => d.value));

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleAdminAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    setIsSearching(true);
    try {
      const results = await geminiService.searchProducts(searchQuery, products);
      setFilteredProducts(results);
    } catch (error) {
      setFilteredProducts(products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } finally {
      setIsSearching(false);
    }
  };

  const handleForceSeed = async () => {
    if (!confirm('This will wipe your current database and insert 1,000 new products. Proceed?')) return;
    setIsSeeding(true);
    try {
      const response = await fetch(`${apiService.config.baseUrl}/products/seed`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        addNotification('success', '1,000 products seeded successfully!');
        await refreshProducts();
      } else {
          throw new Error('Seed failed');
      }
    } catch (error) {
      addNotification('error', 'Neural sync failed. Check server logs.');
    } finally {
      setIsSeeding(false);
    }
  };

  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div className="space-y-10 lg:space-y-12 py-6 lg:py-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase text-gray-900">Admin <span className="text-indigo-600">HQ</span></h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Operational Analytics • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
                onClick={handleForceSeed}
                disabled={isSeeding}
                className="flex-1 md:flex-none bg-indigo-600 text-white px-6 lg:px-8 py-4 rounded-[20px] lg:rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSeeding ? 'Syncing...' : 'Force Neural Seed'}
            </button>
            <button className="flex-1 md:flex-none bg-white border border-gray-100 px-6 lg:px-8 py-4 rounded-[20px] lg:rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm">
              Export Stats
            </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <div className="md:col-span-2 bg-white p-6 lg:p-10 rounded-[32px] lg:rounded-[48px] border border-gray-100 shadow-sm space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-xl lg:text-2xl font-black tracking-tighter uppercase text-gray-900">Revenue Stream</h3>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">7-Day Gross Performance</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl lg:text-3xl font-black text-indigo-600">${totalSales.toLocaleString()}</p>
                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest leading-none">+12.4% Weekly</p>
                </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="flex items-end justify-between h-40 lg:h-48 gap-3 lg:gap-4 pt-4">
                {salesData.map((data, idx) => (
                    <div key={idx} className="flex-grow flex flex-col items-center gap-3 lg:gap-4 group">
                        <div className="w-full relative">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-xl whitespace-nowrap z-10">
                                ${data.value}
                            </div>
                            <div 
                                className="bg-indigo-50 group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-100 transition-all rounded-t-xl w-full cursor-pointer" 
                                style={{ height: `${(data.value / maxVal) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400">{data.day}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Rapid Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8 md:col-span-2 lg:col-span-1">
            <div className="bg-indigo-600 p-8 rounded-[32px] lg:rounded-[40px] text-white shadow-2xl shadow-indigo-200 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 relative z-10">Inventory Health</p>
                <div className="flex items-end justify-between relative z-10">
                    <div>
                        <p className="text-4xl lg:text-5xl font-black tracking-tighter">{products.reduce((acc, p) => acc + (p.stock < 20 ? 1 : 0), 0)}</p>
                        <p className="text-[10px] font-black mt-2 uppercase tracking-widest">Low Stock Items</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:rotate-12 transition-transform">📦</div>
                </div>
            </div>
            <div className="bg-white p-8 rounded-[32px] lg:rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-xl transition-shadow">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Total Velocity</p>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-900">{orders.length}</p>
                        <p className="text-[10px] font-black mt-2 uppercase tracking-widest text-indigo-600">Processed Orders</p>
                    </div>
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl group-hover:-translate-y-1 transition-transform">⚡</div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
        {/* Products Table */}
        <div className="bg-white rounded-[32px] lg:rounded-[48px] border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <div className="p-8 lg:p-10 border-b space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl lg:text-2xl font-black tracking-tighter uppercase text-gray-900">Inventory Feed</h3>
                    <div className="flex items-center gap-3">
                        {isSearching && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Neural Analysis Active</span>
                    </div>
                </div>
                
                <form onSubmit={handleAdminAISearch} className="relative group">
                  <input 
                    type="text" 
                    placeholder="Search catalog semantically..."
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 font-bold shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
                    <span className="text-[9px] font-black bg-white shadow-sm border border-gray-100 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-widest">Type Query</span>
                  </div>
                </form>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              <div className="min-w-[600px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] border-b border-gray-50">
                        <tr>
                            <th className="px-10 py-6">Product Information</th>
                            <th className="px-6 py-6">MSRP</th>
                            <th className="px-6 py-6">Availability</th>
                            <th className="px-10 py-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {filteredProducts.slice(0, 8).map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-10 py-6">
                                  <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                      <img src={p.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                      <span className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight block">{p.name}</span>
                                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{p.category}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-6 font-black text-gray-600">${p.price.toFixed(2)}</td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-col gap-1">
                                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block text-center ${p.stock < 20 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                          {p.stock} Units
                                      </span>
                                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${p.stock < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (p.stock / 200) * 100)}%` }}></div>
                                      </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </div>
            {filteredProducts.length === 0 && (
              <div className="p-10 text-center text-gray-400 uppercase font-black text-[10px] tracking-widest">No matching assets found</div>
            )}
        </div>

        {/* Order Feed */}
        <div className="bg-white rounded-[32px] lg:rounded-[48px] border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <div className="p-8 lg:p-10 border-b flex justify-between items-center">
                <h3 className="text-xl lg:text-2xl font-black tracking-tighter uppercase text-gray-900">Live Order Feed</h3>
                <Link to="/orders" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline bg-indigo-50 px-4 py-2 rounded-xl">Global History</Link>
            </div>
            <div className="divide-y divide-gray-50">
                {orders.slice(0, 6).map(order => (
                    <div key={order.id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-[20px] bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{order.id}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                                  <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.items.length} Items</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-gray-900 tracking-tighter">${order.total.toFixed(2)}</p>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest inline-block mt-1 ${
                              order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600 animate-pulse'
                            }`}>
                              {order.status}
                            </span>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                  <div className="p-20 text-center">
                    <p className="text-gray-400 uppercase font-black text-[10px] tracking-widest">Waiting for incoming traffic...</p>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
