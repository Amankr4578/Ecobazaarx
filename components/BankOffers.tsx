
import React from 'react';
import { ChevronRight, Info, Zap, Smartphone, Wallet, CreditCard, Building2 } from 'lucide-react';

interface BankOffersProps {
  totalAmount: number;
  onApply?: (discount: number) => void;
  appliedOfferId?: number | null;
}

const BankOffers: React.FC<BankOffersProps> = ({ totalAmount, onApply, appliedOfferId }) => {
  const offers = [
    {
      id: 1,
      title: '₹42 off',
      amount: 42,
      subtitle: 'MULTIPLE BANKS',
      type: 'UPI • CASHBACK',
      icon: <Smartphone className="w-5 h-5 text-blue-600" />,
      bestValue: true
    },
    {
      id: 2,
      title: '₹42 off',
      amount: 42,
      subtitle: 'PAYTM',
      type: 'UPI • CASHBACK',
      icon: <Wallet className="w-5 h-5 text-blue-600" />
    },
    {
      id: 3,
      title: '₹42 off',
      amount: 42,
      subtitle: 'BHIM',
      type: 'UPI • CASHBACK',
      icon: <Building2 className="w-5 h-5 text-blue-600" />
    },
    {
      id: 4,
      title: '₹8 off',
      amount: 8,
      subtitle: 'FLIPKART AXIS',
      type: 'CREDIT CARD • CASHBACK',
      icon: <CreditCard className="w-5 h-5 text-blue-600" />
    }
  ];

  return (
    <div className="bg-blue-600 rounded-3xl overflow-hidden shadow-xl mb-6">
      <div className="px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="bg-white text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter italic">
            WOW! DEAL
          </div>
          <span className="text-sm font-bold">Apply offers for maximum savings</span>
        </div>
        <ChevronRight className="w-5 h-5 -rotate-90" />
      </div>

      <div className="bg-[#F0F7FF] p-1">
        <div className="bg-[#F0F7FF] p-5 rounded-b-[2rem]">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Buy at ₹{(totalAmount - (appliedOfferId ? (offers.find(o => o.id === appliedOfferId)?.amount || 0) : 0)).toLocaleString()}</h3>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
            <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6">Bank offers</h4>
            
            <div className="grid grid-cols-2 gap-3">
              {offers.map((offer) => (
                <div 
                  key={offer.id} 
                  className={`border rounded-2xl p-3 transition-all group relative bg-white flex flex-col ${
                    appliedOfferId === offer.id ? 'border-blue-600 bg-blue-50/30' : 'border-blue-50 hover:border-blue-200'
                  }`}
                >
                  {offer.bestValue && (
                    <div className="absolute -top-3 left-2 bg-[#FFF9E6] text-[#855D00] px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border border-[#FFE08A] shadow-sm z-10 whitespace-nowrap scale-90 origin-left">
                      BEST VALUE FOR YOU
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-blue-50 rounded-xl">
                      {offer.icon}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-lg font-black text-slate-900 leading-tight truncate">{offer.title}</p>
                        <button 
                          onClick={() => onApply?.(offer.amount)}
                          className={`font-black text-[9px] uppercase tracking-widest transition-colors pt-0.5 shrink-0 ml-1 whitespace-nowrap ${
                            appliedOfferId === offer.id ? 'text-emerald-600' : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {appliedOfferId === offer.id ? 'APPLIED' : 'APPLY'}
                        </button>
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">{offer.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-50 mb-2 mt-auto"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest truncate mr-1">{offer.type}</span>
                    <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankOffers;
