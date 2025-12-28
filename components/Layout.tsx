
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { apiService } from '../services/api';
import AIChatbot from './AIChatbot';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, user, logout, wishlist, locale, setLocale } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  const t = {
    en: { shop: 'Shop', wishlist: 'Wishlist', ai: 'AI Shopper', gifts: 'Gift Finder', tryon: 'Try-On Lab', orders: 'Orders', admin: 'Admin', signin: 'Sign In' },
    hi: { shop: 'खरीदारी', wishlist: 'इच्छा सूची', ai: 'AI सहायक', gifts: 'उपहार खोजें', tryon: 'वर्चुअल ट्राइ-ऑन', orders: 'आदेश', admin: 'व्यवस्थापक', signin: 'लॉगिन' }
  }[locale];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-6">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 -ml-2 text-gray-600 hover:text-indigo-600 transition-colors active:scale-90"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
              </svg>
            </button>
            <Link to="/" className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
                NovaMart<span className="text-xs font-medium text-gray-400 align-top ml-1">AI</span>
            </Link>

            <div className="hidden lg:flex items-center bg-gray-50 rounded-full p-1 border ml-4">
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

          <nav className="flex items-center gap-2 lg:gap-8">
            <div className="hidden lg:flex items-center gap-6">
                <Link 
                    to="/" 
                    className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    {t.shop}
                </Link>

                <Link 
                    to="/try-on" 
                    className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${isActive('/try-on') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
                >
                    <span className="text-base">📷</span> {t.tryon}
                </Link>

                <Link 
                    to="/gift-finder" 
                    className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${isActive('/gift-finder') ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
                >
                    <span className="text-base">🎁</span> {t.gifts}
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
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4 border-l pl-2 sm:pl-4">
                <Link to="/cart" className="relative group p-2 active:scale-90 transition-transform">
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase shadow-inner">
                        {user.name.charAt(0)}
                    </div>
                    <button 
                      onClick={logout}
                      className="hidden sm:block text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="bg-indigo-600 text-white px-3 lg:px-5 py-2 rounded-xl text-xs lg:text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                    {t.signin}
                  </Link>
                )}
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
          <div className={`absolute top-0 left-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col p-6 transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">NovaMart</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-indigo-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <nav className="flex flex-col gap-5">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={`text-lg font-bold flex items-center gap-3 ${isActive('/') ? 'text-indigo-600' : 'text-gray-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                {t.shop}
              </Link>
              <Link to="/try-on" onClick={() => setIsMenuOpen(false)} className={`text-lg font-bold flex items-center gap-3 ${isActive('/try-on') ? 'text-green-600' : 'text-gray-600'}`}>
                <span className="text-xl">📷</span> {t.tryon}
              </Link>
              <Link to="/gift-finder" onClick={() => setIsMenuOpen(false)} className={`text-lg font-bold flex items-center gap-3 ${isActive('/gift-finder') ? 'text-pink-600' : 'text-gray-600'}`}>
                <span className="text-xl">🎁</span> {t.gifts}
              </Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className={`text-lg font-bold flex items-center gap-3 ${isActive('/wishlist') ? 'text-indigo-600' : 'text-gray-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                {t.wishlist}
              </Link>
              <Link to="/ai-shopping" onClick={() => setIsMenuOpen(false)} className={`text-lg font-bold flex items-center gap-3 p-3 rounded-2xl ${isActive('/ai-shopping') ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-indigo-600 bg-indigo-50'}`}>
                <span className="text-xl">✨</span> {t.ai}
              </Link>
              {user && (
                <Link to="/orders" onClick={() => setIsMenuOpen(false)} className={`text-lg font-bold flex items-center gap-3 ${isActive('/orders') ? 'text-indigo-600' : 'text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  {t.orders}
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={`text-lg font-bold flex items-center gap-3 ${isActive('/admin') ? 'text-indigo-600' : 'text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  {t.admin}
                </Link>
              )}
              {user && (
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left text-lg font-bold text-red-500 mt-4 pt-4 border-t flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
        {children}
      </main>

      <footer className="bg-white border-t py-12 mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1 space-y-4">
            <h3 className="text-xl font-bold text-indigo-600">NovaMart AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Building the future of e-commerce with cutting edge AI integrations and seamless cross-device experiences.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-900 mb-6">Discovery</h4>
            <ul className="text-sm text-gray-500 space-y-3">
              <li><Link to="/try-on" className="hover:text-green-600 transition-colors">Virtual Try-On</Link></li>
              <li><Link to="/wishlist" className="hover:text-indigo-600 transition-colors">Wishlist</Link></li>
              <li><Link to="/gift-finder" className="hover:text-pink-600 transition-colors">AI Gift Concierge</Link></li>
            </ul>
          </div>
          <div className="hidden md:block">
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-900 mb-6">Support</h4>
            <ul className="text-sm text-gray-500 space-y-3">
              <li><Link to="/" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-600 transition-colors">Track Order</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-900 mb-6">Updates</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Join</button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-8 mt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span>© 2024 NovaMart AI. All rights reserved.</span>
        </div>
      </footer>

      <AIChatbot />
    </div>
  );
};

export default Layout;
