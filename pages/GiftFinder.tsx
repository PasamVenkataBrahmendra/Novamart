
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { geminiService } from '../services/gemini';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const GiftFinder: React.FC = () => {
  const { products, addNotification } = useStore();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ intro: string, items: { product: Product, reason: string }[] } | null>(null);

  const [selections, setSelections] = useState({
    recipient: '',
    occasion: '',
    personality: '',
    budget: ''
  });

  const RECIPIENTS = [
    { id: 'Partner', label: 'Partner', icon: '❤️' },
    { id: 'Parent', label: 'Parent', icon: '🏠' },
    { id: 'Friend', label: 'Friend', icon: '🤝' },
    { id: 'Colleague', label: 'Colleague', icon: '💼' },
    { id: 'Self', label: 'Myself', icon: '🎁' }
  ];

  const OCCASIONS = ['Birthday', 'Anniversary', 'Housewarming', 'Congratulation', 'Just Because'];
  
  const PERSONALITIES = [
    { id: 'Gamer', label: 'The Gamer', desc: 'Loves high-performance tech and immersive experiences.' },
    { id: 'Trendsetter', label: 'The Trendsetter', desc: 'Always ahead with the latest fashion and accessories.' },
    { id: 'Homebody', label: 'The Homebody', desc: 'Enjoys comfort, aesthetics, and cozy living spaces.' },
    { id: 'Chef', label: 'The Foodie', desc: 'Passionate about kitchen gadgets and gourmet items.' },
    { id: 'Professional', label: 'The Hustler', desc: 'Values efficiency, sleek design, and productivity.' }
  ];

  const BUDGETS = ['Budget (<$50)', 'Mid-Range ($50-$200)', 'Luxury (>$200)'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await geminiService.getGiftRecommendations(selections, products);
      if (data && data.recommendations) {
        const mappedItems = data.recommendations.map((rec: any) => ({
          product: products.find((p: any) => p.id === rec.productId),
          reason: rec.aiReason
        })).filter((i: any) => i.product);
        
        setResults({ intro: data.intro, items: mappedItems });
        setStep(5);
      } else {
        throw new Error();
      }
    } catch (e) {
      addNotification('error', 'The Gift Oracle is currently offline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="max-w-5xl mx-auto py-10 lg:py-16 px-4 animate-in fade-in duration-700">
      {step < 5 && (
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter uppercase">AI Gift <span className="text-indigo-600">Oracle</span></h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs">Decoding thoughtfulness through neural discovery</p>
          </div>

          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-16">
            <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="min-h-[400px]">
            {/* Step 1: Recipient */}
            {step === 1 && (
              <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
                <h2 className="text-2xl lg:text-3xl font-black text-center uppercase tracking-tighter">Who are we <span className="text-indigo-600">celebrating?</span></h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
                  {RECIPIENTS.map(r => (
                    <button 
                      key={r.id}
                      onClick={() => { setSelections({...selections, recipient: r.id}); setStep(2); }}
                      className="group bg-white border border-gray-100 p-8 rounded-[32px] hover:shadow-2xl hover:shadow-indigo-100 transition-all active:scale-95 text-center space-y-4"
                    >
                      <span className="text-4xl lg:text-5xl block group-hover:scale-125 transition-transform">{r.icon}</span>
                      <span className="block font-black uppercase text-[10px] tracking-widest text-gray-400 group-hover:text-indigo-600">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Occasion */}
            {step === 2 && (
              <div className="space-y-10 animate-in slide-in-from-right-10 duration-500 text-center">
                <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">What is the <span className="text-indigo-600">occasion?</span></h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {OCCASIONS.map(o => (
                    <button 
                      key={o}
                      onClick={() => { setSelections({...selections, occasion: o}); setStep(3); }}
                      className="px-8 py-5 bg-white border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-400 hover:bg-indigo-600 hover:text-white hover:shadow-xl transition-all"
                    >
                      {o}
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-indigo-600">Back to Recipient</button>
              </div>
            )}

            {/* Step 3: Personality */}
            {step === 3 && (
              <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
                <h2 className="text-2xl lg:text-3xl font-black text-center uppercase tracking-tighter">Describe their <span className="text-indigo-600">vibe</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {PERSONALITIES.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => { setSelections({...selections, personality: p.id}); setStep(4); }}
                      className="flex items-center gap-6 bg-white border border-gray-100 p-6 rounded-[32px] hover:shadow-2xl hover:shadow-indigo-100 transition-all text-left"
                    >
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black">AI</div>
                      <div>
                        <span className="block font-black uppercase text-xs tracking-tight text-gray-900">{p.label}</span>
                        <span className="text-[10px] font-medium text-gray-400 leading-tight">{p.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-indigo-600">Back to Occasion</button>
                </div>
              </div>
            )}

            {/* Step 4: Budget */}
            {step === 4 && (
              <div className="space-y-10 animate-in slide-in-from-right-10 duration-500 text-center">
                <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">Setting the <span className="text-indigo-600">scale</span></h2>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                  {BUDGETS.map(b => (
                    <button 
                      key={b}
                      onClick={() => setSelections({...selections, budget: b})}
                      className={`px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${selections.budget === b ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-400 hover:border-indigo-600'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                
                <div className="pt-10">
                  <button 
                    disabled={!selections.budget || isGenerating}
                    onClick={handleGenerate}
                    className="w-full max-w-sm bg-gray-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {isGenerating ? 'Consulting the brain...' : 'Find The Perfect Gift'}
                  </button>
                </div>
                <button onClick={() => setStep(3)} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-indigo-600">Back to Personality</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-12 text-center p-6">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🔮</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">AI Gift Wrapping...</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Filtering 1,000+ items against recipient personality</p>
            </div>
        </div>
      )}

      {/* Final Reveal */}
      {step === 5 && results && (
        <div className="space-y-12 animate-in zoom-in-95 duration-1000">
           <div className="text-center space-y-6">
              <div className="inline-block bg-green-50 text-green-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-100">Found {results.items.length} Matches</div>
              <h2 className="text-3xl lg:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none max-w-3xl mx-auto">"{results.intro}"</h2>
              <p className="text-gray-400 font-medium max-w-xl mx-auto">Based on the {selections.personality} profile for this {selections.occasion}, these items achieved the highest neural compatibility score.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {results.items.map((item, idx) => (
                <div key={item.product.id} className="group relative">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black z-10 shadow-xl">#{idx + 1}</div>
                  <ProductCard product={item.product} />
                  <div className="mt-6 bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] relative overflow-hidden">
                    <div className="absolute top-2 right-4 text-4xl opacity-10 font-black italic select-none">Why It Fits</div>
                    <p className="text-indigo-800 text-xs font-medium italic relative z-10">"{item.reason}"</p>
                  </div>
                </div>
              ))}
           </div>

           <div className="text-center pt-10">
              <button 
                onClick={() => { setStep(1); setResults(null); }}
                className="px-12 py-5 bg-white border border-gray-100 rounded-3xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
              >
                Start New Search
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default GiftFinder;
