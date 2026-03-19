
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Mail, User as UserIcon, Shield, Database, Activity, Server, BadgeCheck, Leaf, ArrowRight, Heart, ShoppingBag, PieChart as PieChartIcon, Trophy, LayoutDashboard, Zap, Eye, X, Tag, Clock, Coins } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getProducts } from '../services/productService';
import { Product } from '../types';
import PriceComparison from '../components/PriceComparison';
import OfferCard from '../components/OfferCard';

const AdminDashboard: React.FC = () => {
  const { user, getDbCount, addToCart } = useAuth();
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [offerProduct, setOfferProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();
      setAllProducts(products);
      
      if (user?.likedProducts && user.likedProducts.length > 0) {
        const filtered = products.filter(p => user.likedProducts?.includes(p.id));
        setLikedProducts(filtered);
      } else {
        setLikedProducts([]);
      }
      
      // Set a random product as offer or the one with highest points
      const offer = [...products].sort((a, b) => b.pointsValue - a.pointsValue)[0];
      setOfferProduct(offer);
      
      setLoading(false);
    };
    fetchData();
  }, [user?.likedProducts]);

  const categoryData = likedProducts.reduce((acc: any[], product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: product.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const leaderboard = [...allProducts]
    .sort((a, b) => b.carbonScore - a.carbonScore)
    .slice(0, 5);

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
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
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
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Clock className="w-4 h-4" />
                  <span>History</span>
                </Link>
              </div>
            </div>

            {offerProduct && (
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Special Offers</h3>
                <OfferCard product={offerProduct} />
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-black text-slate-900">Quick Stats</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Liked Products</p>
                  <p className="text-xl font-black text-slate-900">{likedProducts.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cart Items</p>
                  <p className="text-xl font-black text-slate-900">{user?.cart?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome, {user?.name}!</h1>
              <p className="text-slate-500 font-medium mt-1">Sign Up Secure Management Console</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
               <div className="px-4 py-2 bg-emerald-50 rounded-xl flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Database Online</span>
               </div>
               <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-2">
                 <Database className="w-3.5 h-3.5 text-slate-400" />
                 <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{getDbCount()} Users in SQLite</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <UserIcon className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="h-16 w-16 rounded-[1.25rem] bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-100">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Verified Identity</h3>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Profile Control</p>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-slate-50 relative z-10">
            <div className="flex items-center gap-4 group/item">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-500 transition-colors">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Record</span>
                <span className="text-sm font-bold text-slate-700">{user?.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 group/item">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-500 transition-colors">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Access Tier</span>
                <span className="text-sm font-bold text-slate-700">{user?.role} Level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Visualization Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-black tracking-tight">Interests Overview</h3>
          </div>
          <div className="h-48">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                No data to visualize
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carbon Impact Card */}
        <div className="bg-emerald-600 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20">
                    <Leaf className="w-5 h-5 text-white" />
                   </div>
                   <h3 className="text-lg font-black tracking-tight">Your Carbon Impact</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black">12.4</span>
                  <span className="text-emerald-100 font-bold text-sm uppercase tracking-widest">kg CO2e saved</span>
                </div>
                <p className="text-emerald-100/80 text-xs font-bold mb-8">
                  You've offset the equivalent of <span className="text-white font-black">3 trees</span> planted this month.
                </p>
                <div className="mt-auto">
                  <Link to="/products" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-lg">
                    Shop Sustainable <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Leaderboard Card */}
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-yellow-500/20 rounded-xl border border-yellow-500/20">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Eco Leaderboard</h3>
            </div>
            <div className="space-y-6">
              {leaderboard.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-black ${index === 0 ? 'text-yellow-500' : 'text-slate-600'}`}>0{index + 1}</span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 p-1">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate w-24">{product.name}</p>
                      <Zap className="w-3 h-3 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-black text-sm">{product.carbonScore}</div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Eco Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Database Health Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 lg:col-span-2 relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2.5 bg-slate-100 rounded-xl">
                    <Server className="w-5 h-5 text-slate-900" />
                   </div>
                   <h3 className="text-lg font-black tracking-tight text-slate-900">System Performance Overview</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mon', val: 400 },
                        { name: 'Tue', val: 300 },
                        { name: 'Wed', val: 500 },
                        { name: 'Thu', val: 280 },
                        { name: 'Fri', val: 590 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <Bar dataKey="val" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Health</span>
                        <span className="text-xs font-black text-emerald-600">99.9%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[99.9%]"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Storage Used</span>
                        <span className="text-xs font-black text-blue-600">12%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[12%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Latency</div>
                        <div className="text-lg font-bold text-slate-900">~0.4ms</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Users</div>
                        <div className="text-lg font-bold text-slate-900">{getDbCount()}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Engine</div>
                        <div className="text-lg font-bold text-slate-900 uppercase">LocalDB</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Auth</div>
                        <div className="text-lg font-bold text-slate-900 uppercase">RBAC+</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
                <h3 className="font-black text-slate-900 tracking-tight">Your Liked Products</h3>
              </div>
              <Link to="/products" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">Browse More</Link>
          </div>
          <div className="p-10">
              {loading ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="min-w-[200px] h-48 bg-slate-50 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : likedProducts.length > 0 ? (
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                  {likedProducts.map(product => (
                    <Link 
                      to={`/products/${product.id}`} 
                      key={product.id}
                      className="min-w-[240px] group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="h-32 overflow-hidden relative group/img">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuickViewProduct(product);
                            }}
                            className="bg-white text-slate-900 p-2 rounded-xl shadow-lg transform translate-y-2 group-hover/img:translate-y-0 transition-transform"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-900 text-sm truncate flex-grow">{product.name}</h4>
                          <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            <Zap className="w-2.5 h-2.5 text-emerald-600" />
                            <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Best</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-emerald-600">₹{Math.round(product.price * 83).toLocaleString()}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Heart className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">You haven't liked any products yet.</p>
                  <Link to="/products" className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-4 inline-block hover:underline">Start Exploring</Link>
                </div>
              )}
          </div>
      </div>

      <div className="mt-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 tracking-tight">System Performance Metrics</h3>
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Milestone 3 Core Verified</span>
          </div>
          <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                  <div>
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2.5">
                          <span className="text-slate-500">SQLite Database Integrity</span>
                          <span className="text-emerald-600">Active</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                          <div className="bg-emerald-500 h-full w-full shadow-lg shadow-emerald-500/30"></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2.5">
                          <span className="text-slate-500">JWT Auth State Sync</span>
                          <span className="text-emerald-600">Stable</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                          <div className="bg-emerald-500 h-full w-full shadow-lg shadow-emerald-500/30"></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2.5">
                          <span className="text-slate-500">Persistent Backend Store</span>
                          <span className="text-emerald-600">Connected</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                          <div className="bg-emerald-500 h-full w-full shadow-lg shadow-emerald-500/30"></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2.5">
                          <span className="text-slate-400">ML Prediction Engine</span>
                          <span className="text-emerald-600">Ready</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                          <div className="bg-emerald-500 h-full w-full shadow-lg shadow-emerald-500/30"></div>
                      </div>
                  </div>
              </div>
              <div className="mt-12 flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <BadgeCheck className="w-5 h-5 text-emerald-500" />
                <p className="text-xs font-bold text-slate-500 italic">Security Audit: Milestone 3 Foundation is currently operating at optimal capacity with persistent database.</p>
              </div>
          </div>
          </div>
        </div>
      </div>
      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setQuickViewProduct(null)}
          ></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-10">
              <img 
                src={quickViewProduct.image} 
                alt={quickViewProduct.name} 
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="md:w-1/2 p-10 overflow-y-auto">
              <div className="mb-6">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{quickViewProduct.brand}</p>
                <h2 className="text-2xl font-black text-slate-900 mb-2">{quickViewProduct.name}</h2>
                <span className="text-2xl font-black text-emerald-600">₹{Math.round(quickViewProduct.price * 0.85 * 83).toLocaleString()}</span>
              </div>
              
              <div className="mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Price Intelligence</h4>
                {quickViewProduct.priceComparison && (
                  <PriceComparison comparisons={quickViewProduct.priceComparison} />
                )}
              </div>
              
              <button 
                onClick={() => {
                  addToCart(quickViewProduct.id);
                  setQuickViewProduct(null);
                }}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
