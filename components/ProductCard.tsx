
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useStore } from '../store/StoreContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleCompare, compareList } = useStore();
  const isComparing = compareList.includes(product.id);

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
            {product.category}
          </span>
        </div>
        
        {/* Comparison Toggle Overlay */}
        <button 
            onClick={(e) => {
                e.preventDefault();
                toggleCompare(product.id);
            }}
            className={`absolute top-4 right-4 w-10 h-10 rounded-xl backdrop-blur transition-all flex items-center justify-center shadow-lg ${isComparing ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-400 hover:text-indigo-600'}`}
            title="Compare Product"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </button>
      </Link>
      
      <div className="p-6">
        <Link to={`/product/${product.id}`} className="block mb-2">
          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase tracking-tight">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">({product.reviewsCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
