
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard, Wallet, Building2, Smartphone, ChevronRight, CheckCircle2, QrCode, Coins, Info, ChevronDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string) => void;
  totalAmount: number;
  itemsCount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, totalAmount, itemsCount }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiryMonth: '01',
    expiryYear: '2026'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsProcessing(false);
      setSelectedMethod(null);
      setSelectedUpiApp(null);
      setSelectedBank(null);
      setUpiId('');
      setCardDetails({
        name: '',
        number: '',
        expiryMonth: '01',
        expiryYear: '2026'
      });
    }
  }, [isOpen]);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConfirm(selectedMethod === 'cod' ? 'pending' : 'paid');
      }, 2000);
    }, 2500);
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI (Google Pay, PhonePe, BHIM)', icon: <Smartphone className="w-5 h-5" />, description: 'Pay directly from your bank account' },
    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5" />, description: 'Visa, Mastercard, RuPay & more' },
    { id: 'wallet', name: 'Wallets', icon: <Wallet className="w-5 h-5" />, description: 'Paytm, Amazon Pay, Mobikwik' },
    { id: 'netbanking', name: 'Net Banking', icon: <Building2 className="w-5 h-5" />, description: 'All major Indian banks supported' },
    { id: 'cod', name: 'Cash on Delivery', icon: <Coins className="w-5 h-5" />, description: 'Pay when you receive the order' },
  ];

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
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
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
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
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

                <div className="p-6">
                  <div className="bg-slate-900 rounded-3xl p-5 text-white mb-6 shadow-xl shadow-slate-900/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Order Summary</span>
                      <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                        {itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount to Pay</p>
                        <p className="text-3xl font-black">₹{Math.round(totalAmount).toLocaleString()}</p>
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
                      <div key={method.id} className="space-y-2">
                        <button
                          disabled={isProcessing}
                          onClick={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
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
                          <ChevronRight className={`w-5 h-5 transition-all ${
                            selectedMethod === method.id ? 'text-emerald-600 rotate-90' : 'text-slate-300'
                          }`} />
                        </button>

                        {selectedMethod === 'upi' && method.id === 'upi' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-emerald-50/10 rounded-2xl border-2 border-emerald-100 space-y-4 mb-2 mt-1">
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { id: 'gpay', name: 'Google Pay', color: 'bg-blue-50/50 text-blue-600 border-blue-100/50' },
                                  { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50/50 text-purple-600 border-purple-100/50' },
                                  { id: 'paytm', name: 'Paytm', color: 'bg-sky-50/50 text-sky-600 border-sky-100/50' },
                                  { id: 'bhim', name: 'BHIM', color: 'bg-orange-50/50 text-orange-600 border-orange-100/50' }
                                ].map((app) => (
                                  <button
                                    key={app.id}
                                    onClick={() => setSelectedUpiApp(app.id)}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                                      selectedUpiApp === app.id 
                                        ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20' 
                                        : `${app.color} hover:shadow-sm hover:bg-white`
                                    }`}
                                  >
                                    <Smartphone className="w-4 h-4" />
                                    {app.name}
                                  </button>
                                ))}
                              </div>

                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                                  <span className="bg-white px-2 text-slate-400">Or Pay via UPI ID</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <input 
                                  type="text"
                                  placeholder="Enter UPI ID (e.g. name@upi)"
                                  value={upiId}
                                  onChange={(e) => {
                                    setUpiId(e.target.value);
                                    if (e.target.value) setSelectedUpiApp(null);
                                  }}
                                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-emerald-600 outline-none transition-all"
                                />
                                <p className="text-[8px] font-bold text-slate-400 ml-1">Your UPI ID is usually your mobile number followed by @bankname</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {selectedMethod === 'card' && method.id === 'card' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 bg-white rounded-2xl border-2 border-slate-100 space-y-6 mb-2 mt-1">
                              <h4 className="text-sm font-bold text-slate-900">Add a new credit or debit card</h4>
                              
                              <div className="flex gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                  Please ensure your card is enabled for online transactions. <span className="text-blue-600 font-bold cursor-pointer hover:underline">Learn more</span>
                                </p>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-0 border border-slate-300 rounded-lg overflow-hidden">
                                  <input 
                                    type="text"
                                    placeholder="Name on card"
                                    value={cardDetails.name}
                                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                                    className="w-full px-4 py-3 text-sm font-medium text-slate-900 outline-none border-b border-slate-300 focus:bg-slate-50 transition-colors"
                                  />
                                  <input 
                                    type="text"
                                    placeholder="Card number"
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                    className="w-full px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-slate-50 transition-colors"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-900">Expiry date</label>
                                  <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                      <select 
                                        value={cardDetails.expiryMonth}
                                        onChange={(e) => setCardDetails({...cardDetails, expiryMonth: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 appearance-none outline-none focus:border-slate-400 transition-all"
                                      >
                                        {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                                          <option key={m} value={m}>{m}</option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    <div className="flex-1 relative">
                                      <select 
                                        value={cardDetails.expiryYear}
                                        onChange={(e) => setCardDetails({...cardDetails, expiryYear: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 appearance-none outline-none focus:border-slate-400 transition-all"
                                      >
                                        {Array.from({length: 10}, (_, i) => (2024 + i).toString()).map(y => (
                                          <option key={y} value={y}>{y}</option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>

                                <button
                                  disabled={isProcessing || !cardDetails.name || !cardDetails.number}
                                  onClick={handlePayment}
                                  className="w-full py-4 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 rounded-full font-bold text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                  {isProcessing ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                      <span>Processing...</span>
                                    </>
                                  ) : (
                                    <span>Continue</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {selectedMethod === 'netbanking' && method.id === 'netbanking' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100 space-y-2 mb-2 mt-1">
                              {[
                                'Airtel Payments Bank',
                                'Axis Bank',
                                'HDFC Bank',
                                'ICICI Bank',
                                'Kotak Bank',
                                'State Bank of India'
                              ].map((bank) => (
                                <button
                                  key={bank}
                                  onClick={() => setSelectedBank(bank)}
                                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                    selectedBank === bank 
                                      ? 'bg-white border border-emerald-600 shadow-sm' 
                                      : 'hover:bg-white border border-transparent'
                                  }`}
                                >
                                  <span className={`text-sm font-bold ${selectedBank === bank ? 'text-emerald-600' : 'text-slate-700'}`}>
                                    {bank}
                                  </span>
                                  {selectedBank === bank && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {selectedMethod === 'cod' && method.id === 'cod' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-orange-50/30 rounded-2xl border-l-4 border-orange-400 space-y-2 mb-2 mt-1">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                <h4 className="text-sm font-bold text-slate-900">One-time password required at time of delivery</h4>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed ml-6">
                                Please ensure someone will be available to receive this delivery. <span className="text-blue-600 hover:underline cursor-pointer">Learn more.</span>
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>


                  {selectedMethod && (
                    <button
                      disabled={
                        isProcessing || 
                        (selectedMethod === 'upi' && !selectedUpiApp && !upiId) ||
                        (selectedMethod === 'netbanking' && !selectedBank) ||
                        (selectedMethod === 'card' && (!cardDetails.name || !cardDetails.number))
                      }
                      onClick={handlePayment}
                      className="w-full mt-8 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Pay ₹{Math.round(totalAmount).toLocaleString()} Now</span>
                      )}
                    </button>
                  )}
                  
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
