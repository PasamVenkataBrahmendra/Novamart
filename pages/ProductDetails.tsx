
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { geminiService } from '../services/gemini';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, reviews, addToCart, trackView, watchPrice, addNotification } = useStore();
  const product = products.find(p => p.id === id);
  const productReviews = reviews.filter(r => r.productId === id);
  
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  
  // Negotiation State
  const [isHaggling, setIsHaggling] = useState(false);
  const [haggleInput, setHaggleInput] = useState('');
  const [haggleMessages, setHaggleMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isHaggleLoading, setIsHaggleLoading] = useState(false);
  const [dealCoupon, setDealCoupon] = useState<string | null>(null);

  // Vibe Check State
  const [vibeResult, setVibeResult] = useState<{score: number, synergyReason: string, proTip: string} | null>(null);
  const [isCheckingVibe, setIsCheckingVibe] = useState(false);

  useEffect(() => {
    if (product) {
        setSelectedImage(product.image);
        generateSummary();
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
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleHaggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !haggleInput.trim() || isHaggleLoading) return;

    const userMsg = haggleInput;
    setHaggleInput('');
    const newHistory = [...haggleMessages, { role: 'user' as const, content: userMsg }];
    setHaggleMessages(newHistory);
    setIsHaggleLoading(true);

    try {
      const result = await geminiService.negotiate(product, userMsg, haggleMessages);
      setHaggleMessages([...newHistory, { role: 'assistant', content: result.message }]);
      if (result.dealClosed && result.couponCode) {
        setDealCoupon(result.couponCode);
        addNotification('success', `DEAL CLOSED! Use code ${result.couponCode} at checkout.`);
      }
    } catch (err) {
      addNotification('error', 'Silas is busy at the docks. Try again later.');
    } finally {
      setIsHaggleLoading(false);
    }
  };

  const handleVibeCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    
    setIsCheckingVibe(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await geminiService.checkVibeCompatibility(base64, product);
        setVibeResult(result);
      } finally {
        setIsCheckingVibe(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!product) return <div className="py-20 text-center uppercase font-black text-gray-300 tracking-[0.2em]">Product not found</div>;

  return (
    <div className="space-y-12 lg:space-y-24 animate-in fade-in duration-500 max-w-7xl mx-auto py-6 lg:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <div className="space-y-6">
          <div className="aspect-square rounded-[32px] lg:rounded-[64px] overflow-hidden bg-white shadow-2xl border border-gray-100 p-4">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover rounded-[24px] lg:rounded-[48px]" />
          </div>
          
          {/* Vibe Check Action */}
          <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-indigo-900 uppercase tracking-tight">AI Vibe Checker</h3>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Does this match your room?</p>
              </div>
              <label className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                Upload My Space
                <input type="file" className="hidden" accept="image/*" onChange={handleVibeCheck} />
              </label>
            </div>
            
            {isCheckingVibe && <div className="h-2 bg-indigo-200 rounded-full animate-pulse"></div>}
            
            {vibeResult && (
              <div className="bg-white p-6 rounded-2xl border border-indigo-50 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-indigo-600">{vibeResult.score}%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Match Score</div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium italic">"{vibeResult.synergyReason}"</p>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-3 items-start">
                  <span className="text-lg">💡</span>
                  <p className="text-[10px] text-amber-800 font-bold uppercase tracking-tight">{vibeResult.proTip}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-block bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200">{product.category}</span>
            <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase">{product.name}</h1>
            <div className="flex items-center gap-6">
              <span className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">${product.price.toFixed(2)}</span>
              <button 
                onClick={() => setIsHaggling(!isHaggling)}
                className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all"
              >
                Negotiate Price
              </button>
            </div>
          </div>

          {/* Haggle Interface */}
          {isHaggling && (
            <div className="bg-gray-900 rounded-[32px] p-6 lg:p-8 space-y-6 shadow-2xl animate-in slide-in-from-top-4">
               <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-xl shadow-lg">🎩</div>
                  <div>
                    <h4 className="text-white font-black uppercase text-xs tracking-widest">Silas the Merchant</h4>
                    <span className="text-[9px] text-indigo-400 font-bold uppercase animate-pulse">Online & Skeptical</span>
                  </div>
               </div>
               
               <div className="h-48 overflow-y-auto space-y-4 hide-scrollbar">
                  {haggleMessages.length === 0 && (
                    <p className="text-gray-500 text-xs italic">"Well well... you look like someone with an eye for quality. What's your best offer for this fine specimen?"</p>
                  )}
                  {haggleMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-[10px] lg:text-xs font-medium ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-indigo-100 rounded-tl-none'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isHaggleLoading && <div className="w-8 h-4 bg-white/10 rounded-full animate-pulse"></div>}
               </div>

               {dealCoupon ? (
                 <div className="bg-green-500/20 border border-green-500 p-4 rounded-2xl text-center">
                    <p className="text-green-400 font-black uppercase text-xs tracking-widest mb-2">Deal Secured!</p>
                    <div className="bg-white text-gray-900 py-2 rounded-lg font-black text-lg tracking-[0.5em]">{dealCoupon}</div>
                 </div>
               ) : (
                 <form onSubmit={handleHaggle} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Make your offer..."
                      className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={haggleInput}
                      onChange={e => setHaggleInput(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 active:scale-95 transition-all">Send</button>
                 </form>
               )}
            </div>
          )}

          <p className="text-gray-500 text-base lg:text-xl leading-relaxed font-medium">{product.description}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
                onClick={() => addToCart(product)}
                className="flex-grow bg-gray-900 text-white py-6 rounded-[32px] font-black text-xs lg:text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 active:scale-95 transition-all"
            >
                Add To Cart
            </button>
            <button 
                onClick={() => watchPrice(product.id)}
                className="px-10 bg-white border border-gray-100 text-gray-900 py-6 rounded-[32px] font-black text-xs lg:text-sm uppercase tracking-[0.2em] shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
                Watch Price
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <section className="bg-gray-900 rounded-[32px] lg:rounded-[64px] p-6 lg:p-12 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl lg:text-3xl font-black tracking-tighter uppercase">Review Intelligence</h2>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Generative AI Sentiment Analysis</p>
                </div>
                {isSummarizing && <div className="animate-spin h-6 w-6 border-2 border-indigo-400 border-t-transparent rounded-full"></div>}
            </div>
            {summary ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-gray-300 leading-relaxed text-sm prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }}>
                    </div>
                    <div className="space-y-6">
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Verified Consensus</h4>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-3xl border border-white/5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <p className="text-xs text-white/80 font-medium">Top insight: Reliability exceeds category average by 22%.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-white/20 italic font-black text-xs uppercase tracking-widest animate-pulse text-center py-10">Neural engine is calculating consensus...</div>
            )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
