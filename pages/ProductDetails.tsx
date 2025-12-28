
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { geminiService } from '../services/gemini';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, reviews, addToCart, addReview, user, trackView, watchPrice } = useStore();
  const product = products.find(p => p.id === id);
  const productReviews = reviews.filter(r => r.productId === id);
  
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [bundle, setBundle] = useState<Product[]>([]);
  const [isBundling, setIsBundling] = useState(false);
  
  const [spaceAnalysis, setSpaceAnalysis] = useState<string>('');
  const [isAnalyzingSpace, setIsAnalyzingSpace] = useState(false);

  const related = products
    .filter(p => p.id !== id && (p.category === product?.category || p.tags.some(t => product?.tags.includes(t))))
    .slice(0, 4);

  useEffect(() => {
    if (product) {
        setSelectedImage(product.image);
        generateSummary();
        generateBundle();
        trackView(product.id);
        window.scrollTo(0, 0);
    }
  }, [id, product]);

  const generateSummary = async () => {
    if (!product || productReviews.length === 0) return;
    setIsSummarizing(true);
    try {
        const text = await geminiService.summarizeReviews(product.name, productReviews);
        setSummary(text || '');
    } catch (e) {
        console.error(e);
    } finally {
        setIsSummarizing(false);
    }
  };

  const generateBundle = async () => {
    if (!product) return;
    setIsBundling(true);
    try {
      const suggested = await geminiService.suggestBundle(product, products);
      setBundle(suggested);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBundling(false);
    }
  };

  const handleSpaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    
    setIsAnalyzingSpace(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const analysis = await geminiService.analyzeSpace(base64, product.name);
        setSpaceAnalysis(analysis || '');
      } catch (e) {
        console.error(e);
      } finally {
        setIsAnalyzingSpace(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addAllToCart = () => {
    if (product) addToCart(product);
    bundle.forEach(p => addToCart(p));
  };

  if (!product) return <div className="py-20 text-center uppercase font-black text-gray-300 tracking-[0.2em]">Product not found</div>;

  return (
    <div className="space-y-12 lg:space-y-24 animate-in fade-in duration-500 max-w-7xl mx-auto py-6 lg:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <div className="space-y-4 lg:space-y-6">
          <div className="aspect-square rounded-[32px] lg:rounded-[64px] overflow-hidden bg-white shadow-xl lg:shadow-2xl border border-gray-100 p-4 lg:p-8">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover rounded-[24px] lg:rounded-[48px]" />
          </div>
          <div className="flex gap-2 lg:gap-4 justify-center">
            {[product.image, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'].map((img, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(img)}
                className={`w-16 lg:w-24 h-16 lg:h-24 rounded-2xl lg:rounded-3xl overflow-hidden border-2 lg:border-4 transition-all ${selectedImage === img ? 'border-indigo-600 scale-105 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8 lg:space-y-12 py-2 lg:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="space-y-4 w-full">
              <span className="inline-block bg-indigo-600 text-white px-4 lg:px-5 py-1.5 lg:py-2 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200">{product.category}</span>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase">{product.name}</h1>
              <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 lg:w-5 h-4 lg:h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                  </div>
                  <span className="text-xs lg:text-sm text-gray-400 font-bold uppercase tracking-widest">{product.rating} / 5 Rating</span>
              </div>
            </div>
            
            <button 
                onClick={() => watchPrice(product.id)}
                className="group flex flex-row sm:flex-col items-center gap-3 lg:gap-2 bg-white sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none w-full sm:w-auto border sm:border-0"
            >
                <div className="w-10 lg:w-14 h-10 lg:h-14 rounded-xl lg:rounded-[24px] bg-indigo-50 sm:bg-white shadow-sm sm:shadow-xl flex items-center justify-center text-indigo-600 sm:text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <svg className="w-5 lg:w-6 h-5 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600 transition-all">Watch Price</span>
            </button>
          </div>

          <p className="text-gray-500 text-base lg:text-xl leading-relaxed font-medium">{product.description}</p>

          <div className="flex items-center gap-4 lg:gap-6">
            <span className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter">${product.price.toFixed(2)}</span>
            <div className="h-8 lg:h-10 w-px bg-gray-200"></div>
            <span className="text-gray-300 line-through text-lg lg:text-2xl font-bold">${(product.price * 1.2).toFixed(2)}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
                onClick={() => addToCart(product)}
                className="flex-grow bg-gray-900 text-white py-4 lg:py-6 rounded-2xl lg:rounded-[32px] font-black text-xs lg:text-sm uppercase tracking-[0.2em] shadow-xl lg:shadow-2xl hover:bg-gray-800 active:scale-95 transition-all"
            >
                Add To Cart
            </button>
            <label className="px-6 lg:px-8 bg-indigo-600 text-white py-4 lg:py-0 rounded-2xl lg:rounded-[32px] font-black text-xs lg:text-sm uppercase tracking-[0.2em] shadow-xl lg:shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-indigo-200 flex items-center justify-center cursor-pointer">
                View In Space
                <input type="file" className="hidden" accept="image/*" onChange={handleSpaceUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* AI Space Analysis Preview */}
      {spaceAnalysis && (
        <section className="bg-indigo-50 rounded-[32px] lg:rounded-[64px] p-6 lg:p-12 border border-indigo-100 animate-in zoom-in-95 duration-700">
            <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-8">
               <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-2xl lg:rounded-3xl shadow-xl flex items-center justify-center text-2xl lg:text-3xl animate-bounce">🏠</div>
               <div className="space-y-4 flex-grow w-full">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black text-indigo-900 uppercase tracking-tighter leading-none">AI Space <span className="text-indigo-600">Consensus</span></h2>
                    <p className="text-indigo-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest mt-1">Simulated Augmented Reality Analysis</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur p-4 lg:p-8 rounded-2xl lg:rounded-[40px] border border-white text-indigo-800 italic font-medium leading-relaxed text-sm lg:text-base">
                    "{spaceAnalysis}"
                  </div>
               </div>
            </div>
        </section>
      )}

      {/* Complete the Look - AI Cross-Sell */}
      {bundle.length > 0 && (
        <section className="bg-white rounded-[32px] lg:rounded-[64px] border border-gray-100 p-6 lg:p-12 shadow-sm space-y-8 lg:space-y-10 animate-in slide-in-from-bottom-10">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="text-center lg:text-left">
                    <h2 className="text-2xl lg:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Complete The <span className="text-indigo-600">Look</span></h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs mt-2">Neural engine curated bundle for your lifestyle</p>
                </div>
                <button 
                    onClick={addAllToCart}
                    className="bg-indigo-600 text-white px-6 lg:px-10 py-4 lg:py-5 rounded-2xl lg:rounded-[24px] font-black text-[9px] lg:text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all w-full lg:w-auto"
                >
                    Add Entire Bundle • ${(product.price + bundle.reduce((acc, p) => acc + p.price, 0)).toFixed(2)}
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
                <div className="relative group text-center space-y-4 bg-gray-50 p-4 lg:p-6 rounded-[24px] lg:rounded-[48px]">
                    <img src={product.image} className="w-full h-32 lg:h-48 object-cover rounded-[20px] lg:rounded-[32px]" />
                    <p className="font-black text-gray-900 text-[10px] lg:text-xs uppercase truncate tracking-tight">{product.name}</p>
                    <span className="text-indigo-600 font-black text-xs lg:text-sm">${product.price}</span>
                    <div className="absolute top-1/2 -right-5 -translate-y-1/2 text-2xl text-gray-300 hidden sm:block">+</div>
                </div>
                {bundle.map((p, idx) => (
                    <div key={p.id} className="relative group text-center space-y-4 bg-gray-50 p-4 lg:p-6 rounded-[24px] lg:rounded-[48px]">
                        <img src={p.image} className="w-full h-32 lg:h-48 object-cover rounded-[20px] lg:rounded-[32px]" />
                        <p className="font-black text-gray-900 text-[10px] lg:text-xs uppercase truncate tracking-tight">{p.name}</p>
                        <span className="text-indigo-600 font-black text-xs lg:text-sm">${p.price}</span>
                        {idx === 0 && <div className="absolute top-1/2 -right-5 -translate-y-1/2 text-2xl text-gray-300 hidden sm:block">+</div>}
                    </div>
                ))}
            </div>
        </section>
      )}

      {/* AI Review Summary */}
      <section className="bg-gray-900 rounded-[32px] lg:rounded-[64px] p-6 lg:p-12 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-48 lg:w-64 h-48 lg:h-64 bg-indigo-600/20 rounded-full blur-[80px] lg:blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-6 lg:space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl lg:text-3xl font-black tracking-tighter uppercase">Review Intelligence</h2>
                    <p className="text-indigo-400 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-1">Generative AI Sentiment Analysis</p>
                </div>
                {isSummarizing && <div className="animate-spin h-5 w-5 lg:h-6 lg:w-6 border-2 border-indigo-400 border-t-transparent rounded-full"></div>}
            </div>
            {summary ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="bg-white/5 p-6 lg:p-8 rounded-2xl lg:rounded-[40px] border border-white/10 text-gray-300 leading-relaxed text-sm prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }}>
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Verified Insights</h4>
                        <div className="space-y-3 lg:space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 items-center bg-white/5 p-3 lg:p-4 rounded-xl lg:rounded-3xl border border-white/5">
                                    <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-indigo-500"></div>
                                    <p className="text-[10px] lg:text-xs text-white/80 font-medium">94% of users recommend this for its durability.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-white/20 italic font-black text-[10px] lg:text-xs uppercase tracking-widest animate-pulse">Neural engine is calculating consensus...</div>
            )}
        </div>
      </section>

      <section className="space-y-8 lg:space-y-12">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-4xl font-black text-gray-900 uppercase tracking-tighter">You Might <span className="text-indigo-600">Also Like</span></h2>
            <Link to="/" className="text-[9px] lg:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
