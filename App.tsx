
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store/StoreContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import AdminOrderDetails from './pages/AdminOrderDetails';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import ShopWithAI from './pages/ShopWithAI';
import Wishlist from './pages/Wishlist';
import ComparisonTray from './components/ComparisonTray';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const { login, user, addNotification } = useStore();
    
    if (user) return <Navigate to="/" />;

    const handleSendOtp = () => {
      if (!email.includes('@')) {
        addNotification('error', 'Enter a valid email address.');
        return;
      }
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        setStep('otp');
        addNotification('info', 'OTP sent to your email (Mock: 123456).');
      }, 800);
    };

    const handleVerifyOtp = () => {
      if (otp === '123456' || email === 'admin@novamart.com') {
        login(email);
      } else {
        addNotification('error', 'Invalid OTP. Try 123456.');
      }
    };

    return (
        <div className="max-w-md mx-auto py-20 animate-in fade-in duration-500 px-4">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome</h1>
                    <p className="text-gray-400 font-medium">Join the NovaMart experience</p>
                </div>

                {step === 'email' ? (
                  <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full h-14 bg-gray-50 border-none rounded-2xl px-4 focus:ring-2 focus:ring-indigo-500 font-medium"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p className="text-[9px] text-indigo-400 font-bold mt-1 uppercase tracking-wider">* admin@novamart.com for admin panel</p>
                    </div>
                    <button 
                        onClick={handleSendOtp}
                        disabled={isAuthenticating}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center"
                    >
                        {isAuthenticating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Send OTP'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Enter 6-Digit OTP</label>
                        <input 
                            type="text" 
                            maxLength={6}
                            className="w-full h-14 bg-gray-50 border-none rounded-2xl px-4 focus:ring-2 focus:ring-indigo-500 font-bold text-center text-2xl tracking-[0.5em]"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button onClick={() => setStep('email')} className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider hover:underline mt-2">Change Email</button>
                    </div>
                    <button 
                        onClick={handleVerifyOtp}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl shadow-indigo-100"
                    >
                        Verify & Sign In
                    </button>
                  </div>
                )}

                <div className="relative pt-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em]"><span className="bg-white px-4 text-gray-300">Fast Access</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button className="py-3 px-4 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 text-xs font-bold hover:bg-gray-50 transition-colors text-gray-600">
                        Google
                    </button>
                    <button className="py-3 px-4 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 text-xs font-bold hover:bg-gray-50 transition-colors text-gray-600">
                        GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/ai-shopping" element={<ShopWithAI />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ComparisonTray />
        </Layout>
      </Router>
    </StoreProvider>
  );
};

export default App;
