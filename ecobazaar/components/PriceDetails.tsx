
import React from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface PriceDetailsProps {
  mrp: number;
  platformFee: number;
  discount: number;
  deliveryCharges: number;
  totalAmount: number;
}

const PriceDetails: React.FC<PriceDetailsProps> = ({ mrp, platformFee, discount, deliveryCharges, totalAmount }) => {
  const [isFeesOpen, setIsFeesOpen] = React.useState(true);
  const [isDiscountsOpen, setIsDiscountsOpen] = React.useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = React.useState(true);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Price details</h3>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-bold border-b border-dashed border-slate-300 cursor-help" title="Maximum Retail Price">MRP</span>
          <span className="font-black text-slate-900">₹{mrp.toLocaleString()}</span>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setIsFeesOpen(!isFeesOpen)}
            className="w-full flex justify-between items-center group"
          >
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold">Fees</span>
              {isFeesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>
          
          {isFeesOpen && (
            <div className="pl-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium border-b border-dashed border-slate-200 cursor-help">Platform Fee</span>
                <span className="text-slate-900 font-bold text-sm">₹{platformFee}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
            className="w-full flex justify-between items-center group"
          >
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold">Delivery</span>
              {isDeliveryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>
          
          {isDeliveryOpen && (
            <div className="pl-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium">Delivery Charges</span>
                <span className="text-emerald-600 font-bold text-sm">{deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setIsDiscountsOpen(!isDiscountsOpen)}
            className="w-full flex justify-between items-center group"
          >
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold">Discounts</span>
              {isDiscountsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>
          
          {isDiscountsOpen && (
            <div className="pl-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium">Discount on MRP</span>
                <span className="text-emerald-600 font-bold text-sm">- ₹{discount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100 my-2"></div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-black text-slate-900">Total Amount</span>
          <span className="text-lg font-black text-slate-900">₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-emerald-50 p-4 mx-6 mb-6 rounded-2xl flex items-center gap-3">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <p className="text-emerald-700 text-xs font-black uppercase tracking-widest">
          You will save ₹{discount.toLocaleString()} on this order
        </p>
      </div>

      <div className="px-6 pb-6 flex items-start gap-3 text-slate-400">
        <ShieldCheck className="w-5 h-5 shrink-0 text-slate-500" />
        <p className="text-[10px] font-bold leading-relaxed">
          Safe and Secure Payments. Easy returns. 100% Authentic products.
        </p>
      </div>
    </div>
  );
};

export default PriceDetails;
