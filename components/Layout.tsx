
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { apiService } from '../services/api';
import AIChatbot from './AIChatbot';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, user, logout, wishlist, locale, setLocale } = useStore();
  const location = useLocation();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  const t = {
    en: { shop: 'Shop', wishlist: 'Wishlist', ai: 'AI Shopper', orders: 'Orders', admin: 'Admin', signin: 'Sign In' },
    hi: { shop: 'खरीदारी', wishlist: 'इच्छा सूची', ai: 'AI सहायक', orders: 'आदेश', admin: 'व्यवस्थापक', signin: 'लॉगिन' }
  }[locale];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                NovaMart<span className="text-sm font-medium text-gray-400 align-top ml-1">AI</span>
            </Link>

            <div className="hidden lg:flex items-center bg-gray-50 rounded-full p-1 border">
                <button 
                    onClick={() => setLocale('en')}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${locale === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLocale('hi')}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${locale === 'hi' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    हिन्दी
                </button>
            </div>
          </div>

          <nav className="flex items-center gap-4 lg:gap-8">
            <Link 
                to="/" 
                className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
            >
                {t.shop}
            </Link>

            <Link 
                to="/wishlist" 
                className={`text-sm font-semibold transition-colors flex items-center gap-1 ${isActive('/wishlist') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
            >
                {t.wishlist}
                {wishlist.length > 0 && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>}
            </Link>

            <Link 
                to="/ai-shopping" 
                className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${isActive('/ai-shopping') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-indigo-600 hover:bg-indigo-50'}`}
            >
                <span className="text-base">✨</span> {t.ai}
            </Link>
            
            {user && (
                <Link 
                    to="/orders" 
                    className={`text-sm font-semibold transition-colors ${isActive('/orders') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    {t.orders}
                </Link>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-semibold text-gray-500 hover:text-indigo-600">{t.admin}</Link>
            )}
            
            <div className="flex items-center gap-4 border-l pl-4">
                <Link to="/cart" className="relative group p-2">
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                        {user.name.charAt(0)}
                    </div>
                    <button 
                      onClick={logout}
                      className="text-xs text-red-500 hover:underline font-bold uppercase tracking-wider"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                    {t.signin}
                  </Link>
                )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t py-12 mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1 space-y-4">
            <h3 className="text-xl font-bold text-indigo-600">NovaMart AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
                Building the future of e-commerce with cutting edge AI integrations.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${apiService.config.baseUrl.includes('onrender.com') ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Backend: {apiService.config.baseUrl.includes('onrender.com') ? 'Live Production' : 'Mock/Local'}
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-900 mb-6">Discovery</h4>
            <ul className="text-sm text-gray-500 space-y-3">
              <li><Link to="/wishlist" className="hover:text-indigo-600">Wishlist</Link></li>
              <li><Link to="/ai-shopping" className="hover:text-indigo-600">AI Personal Shopper</Link></li>
              <li><Link to="/" className="hover:text-indigo-600">Gift Finder</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-900 mb-6">Company</h4>
            <ul className="text-sm text-gray-500 space-y-3">
              <li><Link to="/" className="hover:text-indigo-600">About Us</Link></li>
              <li><Link to="/" className="hover:text-indigo-600">Careers</Link></li>
              <li><Link to="/" className="hover:text-indigo-600">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-900 mb-6">Stay Connected</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700">Join</button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-8 mt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span>© 2024 NovaMart AI. All rights reserved.</span>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Security</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>

      <AIChatbot />
    </div>
  );
};

export default Layout;
