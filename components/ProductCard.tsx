
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
    <div className="group relative bg-white rounded-[32px] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100">
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden m-2 rounded-[24px]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-gray-900 uppercase tracking-widest">
            {product.category}
          </span>
        </div>
        
        <button 
            onClick={(e) => {
                e.preventDefault();
                toggleCompare(product.id);
            }}
            className={`absolute top-4 right-4 w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center transition-all ${isComparing ? 'bg-indigo-600 text-white' : 'bg-white/70 text-gray-600 hover:bg-white'}`}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </Link>
      
      <div className="px-6 py-6 space-y-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-extrabold text-gray-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase tracking-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-black text-amber-500">★ {product.rating}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">({product.reviewsCount})</span>
          </div>
        </Link>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-black text-gray-900 tracking-tighter">${product.price.toFixed(0)}</span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-12 h-12 rounded-2xl bg-gray-900 text-white hover:bg-indigo-600 transition-all flex items-center justify-center shadow-lg active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
