
import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Wallet, Building2, Smartphone, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalAmount: number;
  itemsCount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, totalAmount, itemsCount }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const paymentMethods = [
    { id: 'upi', name: 'UPI (Google Pay, PhonePe, BHIM)', icon: <Smartphone className="w-5 h-5" />, description: 'Pay directly from your bank account' },
    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5" />, description: 'Visa, Mastercard, RuPay & more' },
    { id: 'wallet', name: 'Wallets', icon: <Wallet className="w-5 h-5" />, description: 'Paytm, Amazon Pay, Mobikwik' },
    { id: 'netbanking', name: 'Net Banking', icon: <Building2 className="w-5 h-5" />, description: 'All major Indian banks supported' },
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConfirm();
      }, 2000);
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={!isProcessing ? onClose : undefined}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {isSuccess ? (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Successful!</h2>
                <p className="text-slate-500 font-medium">Your sustainable order is being processed.</p>
                <div className="mt-8 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                    className="h-full bg-emerald-600"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Secure Payment</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction is encrypted</p>
                    </div>
                  </div>
                  {!isProcessing && (
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  )}
                </div>

                <div className="p-8">
                  <div className="bg-slate-900 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-slate-900/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Order Summary</span>
                      <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                        {itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount to Pay</p>
                        <p className="text-4xl font-black">₹{totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Eco Savings</p>
                        <p className="text-lg font-black italic">₹150 Saved</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Payment Method</p>
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        disabled={isProcessing}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          selectedMethod === method.id 
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-md' 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl transition-colors ${
                          selectedMethod === method.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {method.icon}
                        </div>
                        <div className="flex-grow">
                          <p className="font-black text-slate-900 text-sm">{method.name}</p>
                          <p className="text-[10px] font-medium text-slate-400">{method.description}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-colors ${
                          selectedMethod === method.id ? 'text-emerald-600' : 'text-slate-300'
                        }`} />
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={isProcessing}
                    onClick={handlePayment}
                    className="w-full mt-8 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Pay ₹{totalAmount.toLocaleString()} Now</span>
                    )}
                  </button>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">100% Safe & Secure Payments</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
