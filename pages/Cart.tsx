
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, applyCoupon, activeCoupon } = useStore();
  const [couponCode, setCouponCode] = useState('');
  
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = activeCoupon ? (subtotal * activeCoupon.discount) / 100 : 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal - discount + shipping;

  if (cart.length === 0) {
    return (
      <div className="py-24 text-center animate-in zoom-in duration-500">
        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-400 mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Your bag is empty</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Add some items from our collection to get started.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
      <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Cart <span className="text-indigo-600">({cart.length})</span></h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-6">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-8 rounded-[40px] border border-gray-100 flex flex-col sm:flex-row gap-8 items-center shadow-sm hover:shadow-xl transition-all group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-grow space-y-2">
                <Link to={`/product/${item.id}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors block">{item.name}</Link>
                <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-indigo-600">${item.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 bg-gray-50 px-4 py-2 rounded-2xl">
                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-8 h-8 font-bold text-xl hover:text-indigo-600">-</button>
                <span className="font-black text-lg w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-8 h-8 font-bold text-xl hover:text-indigo-600">+</button>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline mt-2">Remove Item</button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-2xl space-y-10 sticky top-24">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-500 font-bold uppercase text-[11px] tracking-widest">
                <span>Subtotal</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold uppercase text-[11px] tracking-widest">
                  <span>Discount ({activeCoupon?.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 font-bold uppercase text-[11px] tracking-widest">
                <span>Shipping</span>
                <span className="text-gray-900">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="pt-6 border-t flex justify-between font-black text-3xl text-gray-900 tracking-tighter uppercase">
                <span>Total</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="Coupon Code" 
                        className="flex-grow h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={() => { if(applyCoupon(couponCode)) alert("Coupon Applied!"); else alert("Invalid Code"); }}
                        className="bg-gray-900 text-white px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >Apply</button>
                </div>
                <Link to="/checkout" className="block w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm text-center uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Checkout</Link>
            </div>
            
            <div className="p-6 bg-indigo-50 rounded-3xl flex gap-4">
                <div className="text-2xl">✨</div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">AI Shopping Tip</p>
                    <p className="text-xs text-indigo-700 font-medium">Use code <span className="font-black">WELCOME20</span> for 20% off your first purchase!</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
