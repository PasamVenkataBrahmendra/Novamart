
import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { OrderStatus } from '../types';

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, orders, updateOrderStatus } = useStore();
  const order = orders.find(o => o.id === id);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Processing');

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link to="/admin" className="text-indigo-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const handleUpdateStatus = () => {
    if (id) {
      updateOrderStatus(id, selectedStatus);
      alert('Order status updated successfully!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-sm text-gray-500">Managing Order {order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status & Items */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {order.status}
                </span>
                <span className="text-sm font-medium text-gray-500">Placed on {new Date(order.date).toLocaleString()}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="font-bold text-gray-900 mb-4">Items Summary</h3>
              <div className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-gray-50" />
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">Unit Price: ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">x{item.quantity}</p>
                      <p className="text-sm text-indigo-600 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Log Simulation */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Order Activity</h3>
            <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-100">
              <div className="relative pl-10">
                <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                <p className="text-sm font-bold text-gray-900">Payment Confirmed</p>
                <p className="text-xs text-gray-400">{new Date(order.date).toLocaleString()}</p>
              </div>
              <div className="relative pl-10">
                <div className={`absolute left-3 top-1.5 w-2 h-2 rounded-full ${order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-gray-300'}`}></div>
                <p className={`text-sm font-bold ${order.status === 'Shipped' || order.status === 'Delivered' ? 'text-gray-900' : 'text-gray-400'}`}>Order Dispatched</p>
                <p className="text-xs text-gray-400">{order.status === 'Shipped' || order.status === 'Delivered' ? 'Handed over to logistics' : 'Pending warehouse processing'}</p>
              </div>
              <div className="relative pl-10">
                <div className={`absolute left-3 top-1.5 w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-gray-300'}`}></div>
                <p className={`text-sm font-bold ${order.status === 'Delivered' ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</p>
                <p className="text-xs text-gray-400">{order.status === 'Delivered' ? 'Successfully handed to customer' : 'Awaiting last-mile delivery'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Customer Details</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                C
              </div>
              <div>
                <p className="font-bold text-gray-900">Guest User</p>
                <p className="text-xs text-gray-400">ID: {order.userId}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Shipping Information</h3>
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  {order.shippingAddress || 'No address provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Admin Actions</h3>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button 
                onClick={handleUpdateStatus}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
