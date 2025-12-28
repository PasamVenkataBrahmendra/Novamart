
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
import { apiService } from './services/api';

const Login: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const { login, signup, user, addNotification } = useStore();
    
    if (user) return <Navigate to="/" />;

    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.email.includes('@')) {
        addNotification('error', 'Enter a valid email address.');
        return;
      }
      if (formData.password.length < 6) {
        addNotification('error', 'Password must be at least 6 characters.');
        return;
      }

      setIsAuthenticating(true);
      try {
        if (mode === 'signup') {
            await signup(formData.name, formData.email, formData.password);
        } else {
            await login(formData.email, formData.password);
        }
      } catch (err) {
        addNotification('error', 'Authentication failed. Please check your credentials.');
      } finally {
        setIsAuthenticating(false);
      }
    };

    const handleGoogleLogin = async () => {
      setIsAuthenticating(true);
      addNotification('info', 'Connecting to Google accounts...');
      
      // Simulate Google OAuth Popup
      setTimeout(async () => {
        try {
          const mockGoogleUser = {
            email: "google.user@example.com",
            name: "Google Explorer",
            googleId: "g-" + Math.random().toString(36).substr(2, 9)
          };
          
          const userData = await apiService.auth.googleLogin(mockGoogleUser.email, mockGoogleUser.name);
          login(userData.email, "google-provider-bypass"); // Internal login call
          addNotification('success', 'Signed in with Google successfully!');
        } catch (e) {
          addNotification('error', 'Google Sign-In failed.');
        } finally {
          setIsAuthenticating(false);
        }
      }, 1500);
    };

    return (
        <div className="max-w-md mx-auto py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            <div className="bg-white p-8 lg:p-12 rounded-[40px] border border-gray-100 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        {mode === 'login' ? 'Enter your credentials to continue' : 'Join the NovaMart ecosystem'}
                    </p>
                </div>

                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <button 
                        onClick={() => setMode('login')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => setMode('signup')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    {mode === 'signup' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Name</label>
                            <input 
                                required
                                type="text" 
                                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 focus:ring-2 focus:ring-indigo-500 font-bold placeholder:text-gray-300"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
                        <input 
                            required
                            type="email" 
                            className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 focus:ring-2 focus:ring-indigo-500 font-bold placeholder:text-gray-300"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Secure Password</label>
                        <input 
                            required
                            type="password" 
                            className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 focus:ring-2 focus:ring-indigo-500 font-bold placeholder:text-gray-300"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isAuthenticating ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            mode === 'login' ? 'Sign In Now' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="relative pt-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]"><span className="bg-white px-4 text-gray-300">Social Connect</span></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={isAuthenticating}
                        className="w-full h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {mode === 'login' ? "Don't have an account?" : "Already a member?"}
                        <button 
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="ml-2 text-indigo-600 hover:underline"
                        >
                            {mode === 'login' ? 'Create one now' : 'Sign in here'}
                        </button>
                    </p>
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
