import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Coins, X, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface LikePopupProps {
  product: Product | null;
  points: number;
  onClose: () => void;
}

const LikePopup: React.FC<LikePopupProps> = ({ product, points, onClose }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="absolute -bottom-4 -right-4 bg-red-500 text-white p-4 rounded-2xl shadow-xl"
              >
                <Heart className="w-8 h-8 fill-current" />
              </motion.div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Added to Favorites</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">{product.name}</h2>
            <p className="text-slate-500 font-medium text-sm mb-8">
              You've successfully liked this eco-friendly product and supported sustainable choices!
            </p>

            <div className="w-full bg-amber-50 rounded-3xl p-6 border-2 border-amber-100 relative overflow-hidden group">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                    <Coins className="w-6 h-6 text-slate-900" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Reward Earned</p>
                    <p className="text-xl font-black text-slate-900">+{points} Green Points</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <button
              onClick={onClose}
              className="mt-8 w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LikePopup;
