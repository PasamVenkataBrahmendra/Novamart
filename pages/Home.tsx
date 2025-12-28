
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import ProductCard from '../components/ProductCard';
import { geminiService } from '../services/gemini';
import { Product } from '../types';

const Home: React.FC = () => {
  const { products, isLoading, recentlyViewed, refreshProducts, locale, addNotification } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearching, setIsAISearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Mobiles', 'Accessories', 'Grocery', 'Appliances', 'Health', 'Beauty', 'Sports', 'Books'];

  const recommendedProducts = products.filter(p => recentlyViewed.includes(p.id));

  const handleAISearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      refreshProducts();
      return;
    }
    setIsAISearching(true);
    try {
      await refreshProducts(searchQuery);
    } finally {
      setIsAISearching(false);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification('error', 'Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = locale === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      addNotification('success', `Voice recognized: "${transcript}"`);
      refreshProducts(transcript);
    };

    recognition.start();
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    refreshProducts(undefined, cat);
  };

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setIsAISearching(true);
      try {
        await geminiService.searchByImage(base64, products);
        refreshProducts(searchQuery, activeCategory);
      } finally {
        setIsAISearching(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const t = {
    en: { heroTitle: 'THE FUTURE OF', heroTitleSub: 'SHOPPING IS HERE', heroPara: 'Hyper-personalized discovery powered by Gemini AI and persistent storage.', explore: 'Explore Now', ask: 'Ask AI Shopper', placeholder: 'Search catalog...' },
    hi: { heroTitle: 'खरीदारी का', heroTitleSub: 'भविष्य यहाँ है', heroPara: 'जेमिनी एआई और सुरक्षित स्टोरेज द्वारा संचालित अत्यधिक व्यक्तिगत खोज।', explore: 'अभी खोजें', ask: 'AI से पूछें', placeholder: 'कैटलॉग खोजें...' }
  }[locale];

  return (
    <div className="space-y-12 lg:space-y-16 animate-in fade-in duration-700">
      <section className="relative h-[400px] lg:h-[500px] rounded-[32px] lg:rounded-[48px] overflow-hidden bg-gray-900 group">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[20s]" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 lg:px-6 space-y-6 lg:space-y-8">
            <span className="bg-indigo-600/30 backdrop-blur-md border border-indigo-400/30 text-indigo-200 px-4 lg:px-5 py-1.5 lg:py-2 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em]">AI-Driven Backend Integrated</span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none">
              {t.heroTitle} <br/> 
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">{t.heroTitleSub}</span>
            </h1>
            <p className="text-gray-300 max-w-lg mx-auto text-sm lg:text-lg font-medium">{t.heroPara}</p>
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
                <button className="bg-white text-gray-900 px-6 lg:px-10 py-3 lg:py-5 rounded-2xl lg:rounded-3xl font-black text-xs lg:text-sm uppercase tracking-widest hover:bg-gray-100 transition-all shadow-2xl">Explore</button>
                <Link to="/ai-shopping" className="bg-indigo-600 text-white px-6 lg:px-10 py-3 lg:py-5 rounded-2xl lg:rounded-3xl font-black text-xs lg:text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20">{t.ask}</Link>
            </div>
        </div>
      </section>

      {/* Adaptive Personalized Feed */}
      {recommendedProducts.length > 0 && (
        <section className="animate-in slide-in-from-bottom-8 duration-700 delay-300">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                    <span className="animate-ping">✨</span> Picked For You
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter uppercase">Based On Your <span className="text-indigo-600">History</span></h2>
              </div>
              <p className="text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest max-w-xs md:text-right">Our neural engine re-ranked these items based on your recent activity.</p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
              {recommendedProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
           </div>
        </section>
      )}

      {/* Search & Categories */}
      <section className="sticky top-16 z-30 bg-gray-50/90 backdrop-blur-lg py-4 border-b border-gray-100 -mx-4 px-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full lg:flex-grow py-1">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-100'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
                <form onSubmit={handleAISearch} className="relative flex-grow lg:min-w-[300px]">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.placeholder} className="w-full h-12 lg:h-14 bg-white border border-gray-100 rounded-xl lg:rounded-2xl pl-10 lg:pl-12 pr-10 lg:pr-12 text-sm font-medium focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                    <svg className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    
                    <button 
                      type="button" 
                      onClick={handleVoiceSearch}
                      className={`absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 transition-all ${isListening ? 'text-red-500 scale-125' : 'text-gray-400 hover:text-indigo-600'}`}
                    >
                      <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                      {isListening && <span className="absolute -inset-1 rounded-full border border-red-500 animate-ping"></span>}
                    </button>
                </form>
                <label className="h-12 lg:h-14 w-12 lg:w-14 bg-white border border-gray-100 rounded-xl lg:rounded-2xl flex items-center justify-center cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 shadow-sm transition-colors">
                    <svg className="w-5 lg:w-6 h-5 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageSearch} />
                </label>
            </div>
        </div>
      </section>

      {/* Main Catalog */}
      <section>
        <div className="flex items-center justify-between mb-8 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-tighter">{activeCategory === 'All' ? 'Catalog' : activeCategory}</h2>
            {(isLoading || isAISearching) && <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] lg:text-xs uppercase tracking-widest"><span className="animate-pulse">✨</span> {locale === 'hi' ? 'बैकएंड...' : 'Synchronizing...'}</div>}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-[24px] lg:rounded-[32px] aspect-[4/5]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
              {products.slice(0, 24).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
