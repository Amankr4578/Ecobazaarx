
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Reward } from '../types';
import { getRewards } from '../services/rewardService';
import { Coins, Gift, Ticket, ArrowRight, CheckCircle2, ShoppingBag, Sparkles, LayoutDashboard, Tag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const REWARDS: Reward[] = [
  {
    id: '1',
    title: '10% Discount Coupon',
    description: 'Get 10% off on your next purchase of any eco-friendly product.',
    pointsCost: 500,
    discountCode: 'ECO10',
    type: 'percentage',
    value: 10
  },
  {
    id: '2',
    title: '$20 Fixed Discount',
    description: 'Enjoy a flat $20 discount on orders above $100.',
    pointsCost: 1200,
    discountCode: 'GREEN20',
    type: 'fixed',
    value: 20
  },
  {
    id: '3',
    title: 'Free Shipping Voucher',
    description: 'Zero shipping costs for your next 3 orders.',
    pointsCost: 300,
    discountCode: 'FREESHIP',
    type: 'fixed',
    value: 0
  },
  {
    id: '4',
    title: '25% Mega Saver',
    description: 'Exclusive 25% discount for our top eco-warriors.',
    pointsCost: 2500,
    discountCode: 'WARRIOR25',
    type: 'percentage',
    value: 25
  }
];

const Rewards: React.FC = () => {
  const { user, redeemPoints, showNotification } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      const data = await getRewards();
      setRewards(data);
      setLoading(false);
    };
    fetchRewards();
  }, []);

  const handleRedeem = (reward: Reward) => {
    if (!user) {
      showNotification('Please login to redeem rewards', 'error');
      return;
    }

    if ((user.greenPoints || 0) < reward.pointsCost) {
      showNotification('Not enough Green Points', 'error');
      return;
    }

    redeemPoints(reward.pointsCost);
    setRedeemedCode(reward.discountCode);
    showNotification(`Successfully redeemed ${reward.title}!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FAFAFA] min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Navigation</h3>
              <div className="flex flex-col gap-1">
                <Link
                  to="/dashboard"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/products"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Marketplace</span>
                </Link>
                <Link
                  to="/offers"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Tag className="w-4 h-4" />
                  <span>Special Offers</span>
                </Link>
                <Link
                  to="/rewards"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                >
                  <Coins className="w-4 h-4" />
                  <span>Rewards</span>
                </Link>
                <Link
                  to="/history"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Clock className="w-4 h-4" />
                  <span>History</span>
                </Link>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 text-center">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-2">Your Balance</span>
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-6 h-6 text-amber-500" />
                <span className="text-3xl font-black text-slate-900">{user?.greenPoints || 0}</span>
              </div>
              <p className="text-[10px] font-bold text-amber-700 mt-3 uppercase tracking-tighter">Eco-Warrior Status</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Green Rewards</h1>
            </div>
            <p className="text-slate-500 font-medium">
              Earn Green Points by purchasing low-emission products and redeem them for exclusive discounts.
            </p>
          </div>

          {/* Rewards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-[2.5rem] h-64 animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rewards.map((reward) => (
                <motion.div 
                  key={reward.id}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] shadow-lg p-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                    <Gift className="w-24 h-24 text-blue-500" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-50 rounded-2xl">
                        <Ticket className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{reward.title}</h3>
                    </div>
                    
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                      {reward.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="text-lg font-black text-slate-900">{reward.pointsCost}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Points</span>
                      </div>
                      
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!user || (user.greenPoints || 0) < reward.pointsCost}
                        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                          !user || (user.greenPoints || 0) < reward.pointsCost
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95'
                        }`}
                      >
                        Redeem Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* How it works */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">1. Shop Green</h4>
              <p className="text-sm text-slate-500 font-medium">Look for products with high Eco Scores to earn more points.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-6">
                <Coins className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">2. Earn Points</h4>
              <p className="text-sm text-slate-500 font-medium">Points are automatically added to your balance after every purchase.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">3. Get Rewards</h4>
              <p className="text-sm text-slate-500 font-medium">Redeem your points for exclusive discounts and special offers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Redeemed Code Modal */}
      <AnimatePresence>
        {redeemedCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Reward Redeemed!</h2>
              <p className="text-slate-500 font-medium mb-8">
                Use the code below at checkout to claim your discount.
              </p>
              
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 mb-8 relative group cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(redeemedCode);
                showNotification('Code copied to clipboard!');
              }}>
                <span className="text-3xl font-black text-slate-900 tracking-[0.2em]">{redeemedCode}</span>
                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Click to Copy</span>
                </div>
              </div>
              
              <button
                onClick={() => setRedeemedCode(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rewards;
