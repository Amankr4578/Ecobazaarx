import React from 'react';
import { TrendingUp, Zap, ExternalLink } from 'lucide-react';
import { PriceComparison as PriceComparisonType } from '../types';

interface PriceComparisonProps {
  comparisons: PriceComparisonType[];
  compact?: boolean;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ comparisons, compact }) => {
  if (!comparisons || comparisons.length === 0) return null;

  const bestValue = comparisons.find(c => c.isBestValue) || comparisons[0];

  if (compact) {
    return (
      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm shrink-0">
              {bestValue.site[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-900 truncate">{bestValue.site}</p>
              <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider">Best Price</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-black text-emerald-600">
              ₹{Math.round(bestValue.price * 83).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Price Intelligence
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Powered by <span className="text-emerald-600">Flash.co</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full">
          <Zap className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Best Deal Found</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {comparisons.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              item.isBestValue 
                ? 'bg-white border-emerald-500 shadow-md relative ring-1 ring-emerald-500/20' 
                : 'bg-white/50 border-slate-100 hover:border-slate-300'
            }`}
          >
            {item.isBestValue && (
              <div className="absolute -top-2.5 left-6 px-3 py-1 text-[9px] bg-emerald-500 text-white font-black uppercase tracking-widest rounded-md shadow-lg z-10">
                EcoBazaar Exclusive
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-sm shadow-inner">
                {item.site[0]}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{item.site}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified Price</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xl font-black ${item.isBestValue ? 'text-emerald-600' : 'text-slate-900'}`}>
                ₹{Math.round(item.price * 83).toLocaleString()}
              </span>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2.5 rounded-xl transition-all ${
                  item.isBestValue 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-50 text-slate-300 border border-slate-200 hover:bg-slate-100 hover:text-slate-500'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-4 text-[10px] text-slate-400 font-bold italic text-center">
        Prices updated real-time. We guarantee the lowest price for sustainable products.
      </p>
    </div>
  );
};

export default PriceComparison;
