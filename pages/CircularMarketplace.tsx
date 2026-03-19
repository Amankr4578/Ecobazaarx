
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Leaf, ShoppingBag, ArrowRight, 
  Tag, Info, CheckCircle2, AlertCircle, TrendingDown,
  User, History, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface ResaleItem {
  id: string;
  name: string;
  originalPrice: number;
  resalePrice: number;
  condition: 'Like New' | 'Good' | 'Fair';
  carbonSaved: number;
  image: string;
  seller: string;
  category: string;
}

const MOCK_RESALE_ITEMS: ResaleItem[] = [
  {
    id: 'r1',
    name: 'Bamboo Toothbrush',
    originalPrice: 499,
    resalePrice: 199,
    condition: 'Like New',
    carbonSaved: 1.2,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800',
    seller: 'EcoWarrior99',
    category: 'Personal Care'
  },
  {
    id: 'r2',
    name: 'Organic Cotton Tote Bag',
    originalPrice: 299,
    resalePrice: 99,
    condition: 'Good',
    carbonSaved: 0.8,
    image: 'https://images.unsplash.com/photo-1544816153-12ad5d714b21?auto=format&fit=crop&q=80&w=800',
    seller: 'GreenLife',
    category: 'Accessories'
  },
  {
    id: 'r3',
    name: 'Glass Water Bottle',
    originalPrice: 899,
    resalePrice: 449,
    condition: 'Fair',
    carbonSaved: 2.5,
    image: 'https://images.unsplash.com/photo-1602143399827-7211aa9ad945?auto=format&fit=crop&q=80&w=800',
    seller: 'ZeroWasteHero',
    category: 'Kitchen'
  }
];

const CircularMarketplace: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [items, setItems] = useState<ResaleItem[]>(MOCK_RESALE_ITEMS);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Personal Care', 'Accessories', 'Kitchen', 'Home'];

  const filteredItems = filter === 'All' 
    ? items 
    : items.filter(item => item.category === filter);

  const handleBuy = (item: ResaleItem) => {
    showNotification(`Added ${item.name} to cart. You saved ${item.carbonSaved}kg of CO2!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <RefreshCw className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Second Life Marketplace</h1>
        </div>
        <p className="text-slate-500 font-medium max-w-2xl text-lg">
          Give pre-loved eco-products a second life. Save money, reduce waste, and track your carbon savings with every circular purchase.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Carbon Saved</p>
            <p className="text-2xl font-black text-slate-900">452.8 kg</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Re-homed</p>
            <p className="text-2xl font-black text-slate-900">1,284</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Points Earned</p>
            <p className="text-2xl font-black text-slate-900">12,400</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              filter === cat 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.condition === 'Like New' ? 'bg-emerald-500 text-white' :
                    item.condition === 'Good' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {item.condition}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-600">-{item.carbonSaved}kg CO2</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sold by {item.seller}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-1">{item.name}</h3>
                
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resale Price</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-900">₹{item.resalePrice.toLocaleString()}</span>
                      <span className="text-sm font-bold text-slate-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">You Save</p>
                    <p className="text-sm font-black text-emerald-600">{Math.round((1 - item.resalePrice/item.originalPrice) * 100)}% OFF</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sell CTA */}
      <div className="mt-20 bg-emerald-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
          <RefreshCw className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4 tracking-tight">Ready to close the loop?</h2>
          <p className="text-emerald-100 font-medium max-w-xl mx-auto mb-10">
            Resell your previous EcoBazaar purchases directly from your order history and earn Green Points while helping the planet.
          </p>
          <Link
            to="/history"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-emerald-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl shadow-black/10"
          >
            Go to Order History
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CircularMarketplace;
