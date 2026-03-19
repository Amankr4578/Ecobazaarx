import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Tag } from 'lucide-react';
import { Product } from '../types';

interface OfferCardProps {
  product: Product;
}

const OfferCard: React.FC<OfferCardProps> = ({ product }) => {
  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 text-white relative overflow-hidden shadow-xl shadow-orange-500/20 group">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md border border-white/20">
            <Tag className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">Recently Offered</span>
        </div>
        
        <div className="aspect-square w-full bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-4 border border-white/10 group-hover:scale-105 transition-transform duration-500">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain drop-shadow-2xl"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400`;
            }}
          />
        </div>
        
        <h4 className="font-black text-sm leading-tight mb-1 truncate">{product.name}</h4>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-black">₹{Math.round(product.price * 83 * 0.85).toLocaleString()}</span>
          <span className="text-[10px] font-bold text-orange-100 line-through opacity-60">₹{Math.round(product.price * 83).toLocaleString()}</span>
        </div>
        
        <Link 
          to={`/products/${product.id}`}
          className="w-full bg-white text-orange-600 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-lg"
        >
          Claim Offer <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute top-0 right-0 p-3 opacity-20">
        <Zap className="w-12 h-12 text-white" />
      </div>
    </div>
  );
};

export default OfferCard;
