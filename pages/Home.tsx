
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) {
      addNotification('error', 'Voice search not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = locale === 'hi' ? 'hi-IN' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      refreshProducts(transcript);
    };
    recognition.start();
  };

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setIsAISearching(true);
      try {
        const detectedSearch = await geminiService.searchByImage(base64, products);
        if (detectedSearch) {
          setSearchQuery(detectedSearch);
          refreshProducts(detectedSearch);
        }
      } catch (err) {
        addNotification('error', 'Image analysis failed.');
      } finally {
        setIsAISearching(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    refreshProducts(undefined, cat);
  };

  const t = {
    en: { heroTitle: 'Neural Discovery', heroTitleSub: 'For The Modern Human', heroPara: 'Synthesized e-commerce for a post-search world.', explore: 'Explore Catalog', placeholder: 'Search products or categories...' },
    hi: { heroTitle: 'खरीदारी का भविष्य', heroTitleSub: 'यहाँ है', heroPara: 'जेमिनी एआई द्वारा संचालित व्यक्तिगत खोज।', explore: 'अभी खोजें', placeholder: 'उत्पाद खोजें...' }
  }[locale];

  return (
    <div className="space-y-12">
      {/* HERO SECTION */}
      <section className="relative h-[350px] lg:h-[450px] rounded-[48px] overflow-hidden bg-gray-900 group shadow-xl">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[15s]" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 lg:px-12 space-y-6">
            <span className="bg-indigo-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg">AI Power Storefront</span>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                {t.heroTitle} <br/> 
                <span className="text-indigo-400">{t.heroTitleSub}</span>
              </h1>
            </div>
            <p className="text-gray-300 max-w-lg mx-auto text-sm lg:text-lg font-medium leading-relaxed opacity-90">{t.heroPara}</p>
        </div>
      </section>

      {/* SEARCH & FILTER BAR - Adjusted sticky top to match updated header */}
      <section className="sticky top-16 sm:top-20 z-30 bg-gray-50/95 backdrop-blur-xl py-6 -mx-4 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <form onSubmit={handleAISearch} className="relative flex-grow w-full">
                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      placeholder={t.placeholder} 
                      className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-24 text-sm font-bold shadow-sm focus:shadow-xl focus:ring-2 focus:ring-indigo-500 transition-all" 
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={handleVoiceSearch}
                        className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:text-indigo-600'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                      </button>
                      <label className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageSearch} />
                      </label>
                    </div>
                </form>
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-400 hover:text-indigo-600'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </section>

      {/* RECENTLY VIEWED */}
      {recommendedProducts.length > 0 && (
        <section className="space-y-8 animate-in slide-in-from-bottom-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Your <span className="text-indigo-600">Considerations</span></h2>
              <Link to="/ai-shopping" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600">Refine Feed →</Link>
           </div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
           </div>
        </section>
      )}

      {/* PRODUCT CATALOG */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-tighter">
              {activeCategory === 'All' ? 'Full Inventory' : activeCategory}
            </h2>
            {(isLoading || isAISearching) && (
              <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                Neural Sync...
              </div>
            )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] space-y-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="bg-gray-100 rounded-2xl aspect-square"></div>
                <div className="h-4 bg-gray-100 w-3/4 rounded-lg"></div>
                <div className="h-6 bg-gray-100 w-1/2 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="text-5xl">🔭</div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Null Vector Detected</h3>
            <p className="text-gray-500 text-sm font-medium">Try broadening your search parameters.</p>
            <button onClick={() => { setSearchQuery(''); handleCategoryChange('All'); }} className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] hover:underline">Reset Feed</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
