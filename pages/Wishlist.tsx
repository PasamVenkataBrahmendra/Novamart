
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import ProductCard from '../components/ProductCard';

const Wishlist: React.FC = () => {
  const { products, wishlist, toggleWishlist } = useStore();
  const wishProducts = products.filter(p => wishlist.includes(p.id));

  if (wishlist.length === 0) {
    return (
      <div className="py-24 text-center animate-in zoom-in duration-500">
        <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-pink-400 mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </div>
        <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Wishlist is empty</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Save your favorite items here to track them easily.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">My Wishlist</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">You have {wishlist.length} items saved</p>
        </div>
        <button onClick={() => wishlist.forEach(id => toggleWishlist(id))} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Clear All</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {wishProducts.map(product => (
            <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100"
                    title="Remove from wishlist"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
