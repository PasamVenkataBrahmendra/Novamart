
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { geminiService } from '../services/gemini';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ShopWithAI: React.FC = () => {
  const { products } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    const greet = async () => {
      setMessages([{ role: 'assistant', content: "Hello! I'm your NovaMart Personal Shopper. Let's find exactly what you're looking for. To start, what kind of items are you interested in today? (e.g. tech for work, home decor, or outdoor gear)" }]);
    };
    greet();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const result = await geminiService.consult(newHistory, products);
      
      if (result.type === 'question') {
        setMessages(prev => [...prev, { role: 'assistant', content: result.text }]);
        setStep(prev => prev + 1);
      } else if (result.type === 'recommendation') {
        setMessages(prev => [...prev, { role: 'assistant', content: "I've found some perfect matches for you! Take a look below." }]);
        setReasoning(result.reasoning);
        const matched = products.filter(p => result.productIds.includes(p.id));
        setRecommendations(matched);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered a glitch in my system. Could you try rephrasing that?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setMessages([{ role: 'assistant', content: "Let's try again! What can I help you find this time?" }]);
    setRecommendations([]);
    setReasoning('');
    setStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-700">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
          <span className="animate-pulse">✨</span> Personal AI Consultation
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900">Your AI Shopping <span className="text-indigo-600">Concierge</span></h1>
        <p className="text-gray-500 max-w-lg mx-auto">Answer a few questions and let our advanced neural engine curate the perfect collection just for you.</p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="flex-grow overflow-y-auto p-6 md:p-10 space-y-6 hide-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 p-5 rounded-3xl rounded-bl-none flex gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {recommendations.length === 0 ? (
          <div className="p-6 bg-gray-50 border-t">
            <form onSubmit={handleSend} className="flex gap-4">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-grow bg-white border-none rounded-2xl px-6 py-4 text-sm shadow-inner focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                Next
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">Consultation Step {step + 1}</p>
          </div>
        ) : (
          <div className="p-6 bg-indigo-600 text-white text-center">
            <button onClick={reset} className="font-bold text-sm hover:underline">Start New Consultation</button>
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-20 space-y-10 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100">
            <h3 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">💡</span> My Reasoning
            </h3>
            <p className="text-indigo-700 leading-relaxed text-sm italic">"{reasoning}"</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopWithAI;
