
import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Checkout: React.FC = () => {
  const { cart, placeOrder, activeCoupon, addNotification } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [address, setAddress] = useState({ street: '', city: '', zip: '' });
  const [payment, setPayment] = useState({ card: '', expiry: '', cvc: '' });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = activeCoupon ? (subtotal * activeCoupon.discount) / 100 : 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal - discount + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      processPayment();
    }
  };

  const processPayment = () => {
    setIsProcessing(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
        currentProgress += Math.random() * 30;
        if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            setTimeout(() => {
                const fullAddress = `${address.street}, ${address.city} ${address.zip}`;
                placeOrder(fullAddress);
                navigate('/orders');
            }, 500);
        }
        setProgress(currentProgress);
    }, 400);
  };

  if (cart.length === 0) return <Navigate to="/" />;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 py-10">
      {/* Payment Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-[48px] p-12 text-center space-y-8 animate-in zoom-in duration-300 shadow-2xl">
                <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        <circle 
                            cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            className="text-indigo-600 transition-all duration-300" 
                            strokeDasharray={251.2} 
                            strokeDashoffset={251.2 - (251.2 * progress) / 100} 
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-black text-indigo-600">{Math.round(progress)}%</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Processing Payment</h3>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Do not close or refresh this window</p>
                </div>
                <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em]">
        <span className={`${step >= 1 ? 'text-indigo-600' : 'text-gray-300'}`}>01 Shipping</span>
        <div className={`h-px w-8 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        <span className={`${step >= 2 ? 'text-indigo-600' : 'text-gray-300'}`}>02 Payment</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl space-y-10">
            <h2 className="text-4xl font-black tracking-tighter uppercase">{step === 1 ? 'Shipping' : 'Payment'}</h2>
            
            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Delivery Address</label>
                    <input 
                      required
                      placeholder="123 Main St, Apartment 4B" 
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 font-medium"
                      value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">City</label>
                    <input 
                        required
                        placeholder="New York" 
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 font-medium"
                        value={address.city}
                        onChange={e => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">ZIP Code</label>
                    <input 
                        required
                        placeholder="10001" 
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 font-medium"
                        value={address.zip}
                        onChange={e => setAddress({...address, zip: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Card Number</label>
                    <input 
                      required
                      placeholder="0000 0000 0000 0000" 
                      className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 font-bold tracking-widest"
                      value={payment.card}
                      onChange={e => setPayment({...payment, card: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Expiry Date</label>
                    <input 
                        required
                        placeholder="MM/YY" 
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 font-medium"
                        value={payment.expiry}
                        onChange={e => setPayment({...payment, expiry: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">CVC</label>
                    <input 
                        required
                        placeholder="123" 
                        className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 font-medium"
                        value={payment.cvc}
                        onChange={e => setPayment({...payment, cvc: e.target.value})}
                    />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">🔐</div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        Your payment is secured with industry-standard 256-bit encryption. No data is stored on our servers.
                    </p>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-6">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="px-10 py-5 rounded-3xl border border-gray-100 font-black text-xs uppercase tracking-widest hover:bg-gray-50">Back</button>
              )}
              <button 
                type="submit"
                className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-indigo-100 active:scale-95"
              >
                {step === 1 ? 'Confirm Shipping' : `Complete Order • $${total.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 sticky top-24">
            <h3 className="text-xl font-black tracking-tighter uppercase">Order Summary</h3>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 overflow-hidden"><img src={item.image} className="w-full h-full object-cover" /></div>
                    <span className="text-gray-500 font-bold">{item.name} <span className="text-indigo-600">x{item.quantity}</span></span>
                  </div>
                  <span className="font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-6 border-t space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-[10px] font-black uppercase text-green-600 tracking-widest">
                        <span>Discount ({activeCoupon?.code})</span>
                        <span>-${discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <span>Shipping</span>
                    <span className="text-gray-900">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="pt-4 flex justify-between font-black text-2xl text-gray-900 tracking-tighter uppercase">
                    <span>Total</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
