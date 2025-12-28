
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import AIChatbot from './AIChatbot';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, user, logout, wishlist, locale, setLocale } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  const t = {
    en: { shop: 'Discovery', wishlist: 'Wishlist', ai: 'Personal Shopper', gifts: 'Gift Oracle', tryon: 'Virtual Try-On', orders: 'Purchase History', admin: 'Admin HQ', signin: 'Sign In' },
    hi: { shop: 'डिस्कवरी', wishlist: 'इच्छा सूची', ai: 'AI सहायक', gifts: 'उपहार ओरेकल', tryon: 'वर्चुअल ट्राइ-ऑन', orders: 'आदेश इतिहास', admin: 'एडमिन मुख्यालय', signin: 'लॉगिन' }
  }[locale];

  const NavLink = ({ to, icon, label, badge, colorClass = "indigo" }: { to: string, icon: string, label: string, badge?: number | string, colorClass?: string }) => (
    <Link 
      to={to} 
      onClick={() => setIsMenuOpen(false)}
      className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
        isActive(to) 
          ? `bg-indigo-600 text-white shadow-lg shadow-indigo-500/20` 
          : `text-gray-500 hover:bg-gray-100 hover:text-gray-900`
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      </div>
      {badge !== undefined && (typeof badge === 'number' ? badge > 0 : badge !== '') && (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${isActive(to) ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-gray-900'}`}>
          {badge}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* UNIFIED TOP HEADER WITH HAMBURGER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16 sm:h-20 flex items-center px-4 lg:px-10 justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* THE THREE LINES (HAMBURGER MENU) */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 active:scale-90 transition-all flex items-center gap-2 group border border-transparent hover:border-indigo-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Menu</span>
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
              <span className="text-lg font-black italic">N</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tighter text-gray-900 leading-none">NovaMart<span className="text-indigo-600">AI</span></h1>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/cart" className="relative group p-2.5 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all active:scale-90">
            <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-lg">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="hidden sm:flex items-center gap-3 border-l pl-6">
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cart Status</p>
              <p className="text-xs font-black text-gray-900">${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</p>
            </div>
          </div>
          {!user && (
            <Link to="/login" className="hidden md:flex items-center justify-center px-6 bg-gray-900 text-white h-11 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all">
              {t.signin}
            </Link>
          )}
        </div>
      </header>

      {/* GLOBAL DRAWER SIDEBAR */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col p-6 transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-10">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                <span className="text-xl font-black italic">N</span>
              </div>
              <h2 className="text-xl font-black tracking-tighter text-gray-900 leading-none">NovaMart<span className="text-indigo-600">AI</span></h2>
            </Link>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="flex-grow space-y-8 overflow-y-auto hide-scrollbar">
            <div className="space-y-1.5">
              <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Essentials</p>
              <NavLink to="/" icon="🛍️" label={t.shop} />
              <NavLink to="/wishlist" icon="💖" label={t.wishlist} badge={wishlist.length} />
              <NavLink to="/orders" icon="📦" label={t.orders} />
            </div>

            <div className="space-y-1.5">
              <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">AI Intelligence</p>
              <NavLink to="/ai-shopping" icon="✨" label={t.ai} />
              <NavLink to="/try-on" icon="📷" label={t.tryon} />
              <NavLink to="/gift-finder" icon="🎁" label={t.gifts} />
            </div>

            {user?.role === 'admin' && (
              <div className="space-y-1.5">
                <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Management</p>
                <NavLink to="/admin" icon="🛡️" label={t.admin} />
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            {user ? (
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{user.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 truncate uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full text-center py-2 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-full bg-gray-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all">
                {t.signin}
              </Link>
            )}
            
            <div className="mt-4 flex bg-gray-100 rounded-xl p-1">
              <button onClick={() => setLocale('en')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${locale === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>EN</button>
              <button onClick={() => setLocale('hi')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${locale === 'hi' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>हि</button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA (REMOVED LG:ML) */}
      <main className="p-4 lg:p-10 max-w-7xl mx-auto">
        {children}
      </main>

      <footer className="bg-white border-t py-12 px-4 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 uppercase">NovaMart AI</h3>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-medium">
                Pioneering the intersection of neural intelligence and seamless commerce. Built for the modern discovery era.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Platform</h4>
              <ul className="text-[10px] text-gray-400 space-y-2 uppercase font-bold">
                <li><Link to="/try-on" className="hover:text-indigo-600">Vision Lab</Link></li>
                <li><Link to="/ai-shopping" className="hover:text-indigo-600">AI Concierge</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Legal</h4>
              <ul className="text-[10px] text-gray-400 space-y-2 uppercase font-bold">
                <li><span className="cursor-pointer hover:text-indigo-600">Privacy</span></li>
                <li><span className="cursor-pointer hover:text-indigo-600">Security</span></li>
              </ul>
            </div>
          </div>
          <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 h-fit">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-900 mb-2">System Status</h4>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_green]"></div>
                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">All Systems Operational</p>
             </div>
          </div>
        </div>
      </footer>

      <AIChatbot />
    </div>
  );
};

export default Layout;
