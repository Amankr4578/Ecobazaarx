
import React, { useEffect, useState } from 'react';
import { getActivityStats, getCommunityActivity } from '../services/productService';
import { Activity, Calendar, Leaf, ShoppingBag, ArrowRight, TrendingDown, TrendingUp, History as HistoryIcon, Clock, Zap, LayoutDashboard, Tag, Coins, Users, Eye, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: number;
  user_id: number;
  product_id: number;
  action_type: 'view' | 'purchase' | 'like' | 'unlike';
  carbon_impact: number;
  created_at: string;
  product_name: string;
  user_name?: string;
}

interface ActivityStats {
  total_actions: number;
  total_carbon_footprint: number;
  avg_carbon_impact: number;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<ActivityItem[]>([]);
  const [communityHistory, setCommunityHistory] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [userData, communityData] = await Promise.all([
          getActivityStats(),
          getCommunityActivity()
        ]);
        
        if (userData) {
          setHistory(userData.history);
          setStats(userData.stats);
        }
        
        if (communityData) {
          setCommunityHistory(communityData);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Loading your eco-journey...</p>
        </div>
      </div>
    );
  }

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
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Rewards</span>
                </Link>
                <Link
                  to="/history"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                >
                  <Clock className="w-4 h-4" />
                  <span>Eco History</span>
                </Link>
                <Link
                  to="/orders"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order History</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-black text-slate-900">Eco Journey</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Actions</p>
                  <p className="text-xl font-black text-slate-900">{stats?.total_actions || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carbon Saved</p>
                  <p className="text-xl font-black text-emerald-600">{stats?.total_carbon_footprint?.toFixed(1) || 0}kg</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <HistoryIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Eco History</h1>
            </div>
            <p className="text-slate-500 font-medium">
              Tracking every step of your sustainable journey. From views to purchases, see your impact.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Quick View: Liked Products */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Heart className="w-6 h-6 text-rose-500" />
                Liked Products
              </h3>
              <div className="space-y-4">
                {(() => {
                  const likedProductIds = Array.from(new Set(history.filter(item => item.action_type === 'like' || item.action_type === 'unlike').map(i => i.product_id)));
                  const currentlyLiked = likedProductIds.filter(productId => {
                    const latestAction = history.find(i => i.product_id === productId && (i.action_type === 'like' || i.action_type === 'unlike'));
                    return latestAction?.action_type === 'like';
                  });

                  return currentlyLiked.length > 0 ? (
                    currentlyLiked.map(productId => {
                      const item = history.find(i => i.product_id === productId && i.action_type === 'like');
                      const isPurchased = history.some(i => i.product_id === productId && i.action_type === 'purchase');
                      return (
                        <div key={productId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{item?.product_name}</h4>
                              {isPurchased && (
                                <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  Purchased
                                </span>
                              )}
                            </div>
                          </div>
                          <Link to={`/products/${productId}`} className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-medium text-slate-400 italic py-4">No liked products yet.</p>
                  );
                })()}
              </div>
            </div>

            {/* Quick View: Purchased Products */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
                Purchased Products
              </h3>
              <div className="space-y-4">
                {history.filter(item => item.action_type === 'purchase').length > 0 ? (
                  Array.from(new Set(history.filter(item => item.action_type === 'purchase').map(i => i.product_id)))
                    .map(productId => {
                      const item = history.find(i => i.product_id === productId && i.action_type === 'purchase');
                      return (
                        <div key={productId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl border border-slate-100">
                              <ShoppingBag className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{item?.product_name}</h4>
                              <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                Purchased Product
                              </span>
                            </div>
                          </div>
                          <Link to={`/products/${productId}`} className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic py-4">No purchased products yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-emerald-600" />
                  Recent Activity
                </h3>

                <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {history.length > 0 ? (
                    history.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-12"
                      >
                        <div className={`absolute left-0 top-1 w-9 h-9 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
                          item.action_type === 'purchase' ? 'bg-emerald-600' : 'bg-blue-500'
                        }`}>
                          {item.action_type === 'purchase' ? (
                            <ShoppingBag className="w-4 h-4 text-white" />
                          ) : (
                            <Activity className="w-4 h-4 text-white" />
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                item.action_type === 'purchase' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.action_type}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{item.product_name}</h4>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Impact</p>
                              <div className="flex items-center gap-1.5">
                                <Leaf className={`w-3.5 h-3.5 ${item.carbon_impact < 5 ? 'text-emerald-500' : 'text-orange-500'}`} />
                                <span className="font-black text-slate-900">{item.carbon_impact.toFixed(1)} kg</span>
                              </div>
                            </div>
                            <Link to={`/products/${item.product_id}`} className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HistoryIcon className="w-10 h-10 text-slate-200" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">No history yet</h4>
                      <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        Start exploring the marketplace to see your activity history here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-600/20">
                <h3 className="text-xl font-black mb-6">Eco Summary</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Average Impact</p>
                      <p className="text-xl font-black">{stats?.avg_carbon_impact?.toFixed(2) || 0} kg</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs font-medium text-emerald-100 leading-relaxed">
                      Your average carbon footprint per activity is lower than the platform average of 6.2 kg. Keep up the great work!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Community Activity
                </h3>
                <div className="space-y-4">
                  {communityHistory.length > 0 ? (
                    communityHistory.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className={`p-1.5 rounded-lg shrink-0 ${item.action_type === 'purchase' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          {item.action_type === 'purchase' ? <ShoppingBag className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                            <span className="text-slate-900">{item.user_name}</span> {item.action_type === 'purchase' ? 'purchased' : 'viewed'}
                          </p>
                          <p className="text-xs font-bold text-slate-700 truncate">{item.product_name}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-xs font-bold text-slate-400">No community activity yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-900 mb-6">Insights</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Most Viewed', value: 'Organic Cotton Tee', icon: Activity, color: 'text-blue-500' },
                    { label: 'Top Category', value: 'Apparel', icon: ShoppingBag, color: 'text-emerald-500' },
                    { label: 'Eco Streak', value: '12 Days', icon: Zap, color: 'text-amber-500' }
                  ].map((insight, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <insight.icon className={`w-5 h-5 ${insight.color}`} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{insight.label}</p>
                        <p className="text-sm font-bold text-slate-900">{insight.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
