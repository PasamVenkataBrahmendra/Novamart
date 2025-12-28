
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
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-3xl shadow-2xl flex items-center gap-6">
          <div className="flex -space-x-3">
            {compareItems.map(p => (
              <div key={p.id} className="relative group">
                <img src={p.image} className="w-12 h-12 rounded-2xl border-2 border-gray-900 object-cover" />
                <button 
                  onClick={() => toggleCompare(p.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                >✕</button>
              </div>
            ))}
            {compareItems.length < 2 && (
              <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/20 text-xs">
                +
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-white/10"></div>
          
          <button 
            disabled={compareItems.length < 2 || isComparing}
            onClick={startComparison}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            {isComparing ? 'Neural Comparing...' : 'Compare Specs'}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-xl overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">AI Comparison <span className="text-indigo-500">Verdict</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white uppercase font-black text-xs tracking-widest">Close View</button>
            </div>

            {isComparing ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-8">
                  <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-200 font-black uppercase tracking-widest animate-pulse">Analyzing technical trade-offs...</p>
              </div>
            ) : verdict ? (
              <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                <div className="grid grid-cols-2 gap-10">
                   {compareItems.map(p => (
                     <div key={p.id} className="text-center space-y-4">
                        <img src={p.image} className="w-48 h-48 mx-auto rounded-[32px] object-cover shadow-2xl" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{p.name}</h3>
                        <p className="text-indigo-400 font-black text-2xl">${p.price}</p>
                     </div>
                   ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[10px] text-white/40 uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-10 py-6 italic font-normal">Feature / Spec</th>
                                <th className="px-6 py-6 text-center">{compareItems[0].name.split(' ')[0]}</th>
                                <th className="px-6 py-6 text-center">{compareItems[1].name.split(' ')[0]}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {verdict.comparisonPoints.map((p, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-10 py-6 font-bold text-white uppercase tracking-wider text-xs">{p.feature}</td>
                                    <td className="px-6 py-6 text-indigo-200 text-center">{p.productA}</td>
                                    <td className="px-6 py-6 text-indigo-200 text-center">{p.productB}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-indigo-600 p-10 rounded-[48px] shadow-2xl shadow-indigo-500/20">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-4">Neural Consensus</h4>
                    <p className="text-2xl font-black text-white leading-tight uppercase tracking-tighter mb-6">{verdict.summary}</p>
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/10 text-indigo-50 leading-relaxed italic">
                        "{verdict.verdict}"
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
