
import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { geminiService } from '../services/gemini';
import { ComparisonVerdict, Product } from '../types';

const ComparisonTray: React.FC = () => {
  const { compareList, products, toggleCompare } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verdict, setVerdict] = useState<ComparisonVerdict | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  if (compareList.length === 0) return null;

  const compareItems = products.filter(p => compareList.includes(p.id));

  const startComparison = async () => {
    if (compareItems.length < 2) return;
    setIsComparing(true);
    setIsModalOpen(true);
    try {
      const data = await geminiService.compareProducts(compareItems[0], compareItems[1]);
      setVerdict(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 w-[max-content] max-w-[95vw]">
        <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 p-2 lg:p-3 rounded-[24px] lg:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 lg:gap-6 ring-1 ring-white/5">
          <div className="flex -space-x-3 px-1">
            {compareItems.map(p => (
              <div key={p.id} className="relative group">
                <img src={p.image} className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl border-2 border-gray-900 object-cover shadow-lg" />
                <button 
                  onClick={() => toggleCompare(p.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shadow-lg"
                >✕</button>
              </div>
            ))}
            {compareItems.length < 2 && (
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/20 text-xs">
                +
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-white/10"></div>
          
          <button 
            disabled={compareItems.length < 2 || isComparing}
            onClick={startComparison}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 text-white px-5 lg:px-8 py-2.5 lg:py-3.5 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            {isComparing ? 'Neural Mapping...' : 'Compare Specs'}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-3xl overflow-y-auto overflow-x-hidden">
          <div className="min-h-screen container mx-auto p-4 md:p-12 lg:p-20 space-y-12 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h2 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none">AI Comparison <span className="text-indigo-500">Verdict</span></h2>
                  <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] mt-2">Simulated Neural Trade-off Analysis</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-2xl uppercase font-black text-[10px] tracking-widest transition-all"
                >
                  Dismiss Analysis
                </button>
            </div>

            {isComparing ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-10">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-indigo-200 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Computing technical weights...</p>
                    <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest">Analyzing customer sentiment data</p>
                  </div>
              </div>
            ) : verdict ? (
              <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="grid grid-cols-2 gap-4 lg:gap-16">
                   {compareItems.map(p => (
                     <div key={p.id} className="text-center space-y-6 group">
                        <div className="relative aspect-square max-w-[280px] mx-auto">
                          <img src={p.image} className="w-full h-full mx-auto rounded-[32px] lg:rounded-[64px] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 rounded-[32px] lg:rounded-[64px] ring-1 ring-white/10"></div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm lg:text-2xl font-black text-white uppercase tracking-tight line-clamp-2">{p.name}</h3>
                          <p className="text-indigo-400 font-black text-lg lg:text-3xl tracking-tighter">${p.price.toFixed(2)}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[32px] lg:rounded-[48px] overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full text-left min-w-[500px]">
                          <thead className="bg-white/5 text-[9px] lg:text-[10px] text-white/40 uppercase font-black tracking-widest border-b border-white/5">
                              <tr>
                                  <th className="px-8 lg:px-10 py-5 lg:py-6 italic font-medium">Metric / Attribute</th>
                                  <th className="px-6 py-5 lg:py-6 text-center">{compareItems[0].name.split(' ')[0]}</th>
                                  <th className="px-6 py-5 lg:py-6 text-center">{compareItems[1].name.split(' ')[0]}</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs lg:text-sm">
                              {verdict.comparisonPoints.map((p, i) => (
                                  <tr key={i} className="hover:bg-white/5 transition-colors">
                                      <td className="px-8 lg:px-10 py-5 lg:py-6 font-black text-white uppercase tracking-wider text-[9px] lg:text-[11px] bg-white/[0.02]">{p.feature}</td>
                                      <td className="px-6 py-5 lg:py-6 text-indigo-100/80 text-center font-medium">{p.productA}</td>
                                      <td className="px-6 py-5 lg:py-6 text-indigo-100/80 text-center font-medium">{p.productB}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                    </div>
                </div>

                <div className="bg-indigo-600 p-8 lg:p-14 rounded-[40px] lg:rounded-[64px] shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-6">Neural Consensus Summary</h4>
                      <p className="text-2xl lg:text-4xl font-black text-white leading-[1.1] uppercase tracking-tighter mb-8 lg:mb-12 max-w-3xl">{verdict.summary}</p>
                      <div className="bg-black/30 backdrop-blur-xl p-6 lg:p-10 rounded-3xl lg:rounded-[40px] border border-white/10 text-indigo-50 leading-relaxed italic text-sm lg:text-xl font-medium shadow-inner">
                          "{verdict.verdict}"
                      </div>
                    </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default ComparisonTray;
