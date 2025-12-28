
import React from 'react';
import { useStore } from '../store/StoreContext';
import { Link } from 'react-router-dom';

const Orders: React.FC = () => {
  const { orders } = useStore();

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
        </div>
        <h2 className="text-3xl font-bold">No orders yet</h2>
        <p className="text-gray-500">Your shopping journey is just beginning. Start browsing our collection!</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Discover Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b">
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order Placed</p>
                  <p className="text-sm font-semibold">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</p>
                  <p className="text-sm font-semibold">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ship To</p>
                  <p className="text-sm font-semibold truncate max-w-[150px]">{order.shippingAddress || 'Guest'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order #</p>
                <p className="text-sm font-semibold">{order.id}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                <span className="text-sm font-bold text-gray-900">{order.status}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center p-3 rounded-xl border border-gray-50">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-bold truncate max-w-[200px]">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                <button className="flex-grow bg-white border border-gray-200 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">Track Package</button>
                <button className="flex-grow bg-white border border-gray-200 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">Return Items</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
