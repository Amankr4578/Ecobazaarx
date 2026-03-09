
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, User, ShieldCheck, Heart, Coins, Leaf, Clock, 
  Settings, CreditCard, MapPin, ArrowRight, ShoppingBag, 
  Zap, Eye, Star, Gift, HelpCircle, LogOut 
} from 'lucide-react';
import { getProducts, getActivityStats } from '../services/productService';
import { Product } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, activityData] = await Promise.all([
          getProducts(),
          getActivityStats()
        ]);

        if (user?.likedProducts) {
          setLikedProducts(products.filter(p => user.likedProducts?.includes(p.id)));
        }

        if (activityData) {
          setRecentActivity(activityData.history.slice(0, 4));
          setStats(activityData.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.likedProducts]);

  if (!user) return null;

  const accountCards = [
    {
      title: 'Your Orders',
      description: 'Track, return, or buy things again',
      icon: Package,
      link: '/history',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Login & Security',
      description: 'Edit login, name, and mobile number',
      icon: ShieldCheck,
      link: '/profile',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Your Rewards',
      description: 'View your green points and redeem offers',
      icon: Coins,
      link: '/rewards',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Your Wishlist',
      description: 'Products you have saved for later',
      icon: Heart,
      link: '/profile',
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      title: 'Eco Impact',
      description: 'See your carbon savings and eco-rank',
      icon: Leaf,
      link: '/history',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Your Addresses',
      description: 'Edit addresses for orders and gifts',
      icon: MapPin,
      link: '/profile',
      color: 'text-slate-600',
      bg: 'bg-slate-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FBFBFB] min-h-screen">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-200 border-4 border-white">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Account</h1>
              <p className="text-slate-500 font-medium mt-1">Manage your profile, orders, and eco-impact</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <Coins className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Green Points</p>
                <p className="text-lg font-black text-slate-900">{user.greenPoints || 0}</p>
              </div>
            </div>
            <div className="px-5 py-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-3 text-white">
              <Leaf className="w-5 h-5" />
              <div>
                <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">CO2 Saved</p>
                <p className="text-lg font-black">{stats?.total_carbon_saved?.toFixed(1) || '0.0'} kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section (Amazon Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {accountCards.map((card, index) => (
          <Link 
            key={index} 
            to={card.link}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group flex items-start gap-5"
          >
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{card.title}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders / Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-900" />
                <h3 className="font-black text-slate-900 tracking-tight">Recent Activity</h3>
              </div>
              <Link to="/history" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">View All Orders</Link>
            </div>
            <div className="p-8">
              {recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-6 group p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${item.action_type === 'purchase' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-blue-500 shadow-blue-100'}`}>
                        {item.action_type === 'purchase' ? <ShoppingBag className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-slate-900">
                          {item.action_type === 'purchase' ? 'Purchased' : 'Viewed'} {item.product_name}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {new Date(item.created_at).toLocaleDateString()} • {item.action_type === 'purchase' ? `+${Math.round(item.carbon_impact)} Points` : 'Explored'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{item.carbon_impact.toFixed(1)} kg</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CO2 Impact</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-500 font-bold">No recent activity found.</p>
                  <Link to="/products" className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-4 inline-block hover:underline">Start Shopping</Link>
                </div>
              )}
            </div>
          </div>

          {/* Wishlist Preview */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="font-black text-slate-900 tracking-tight">Your Wishlist</h3>
              </div>
              <Link to="/products" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">Browse More</Link>
            </div>
            <div className="p-8">
              {likedProducts.length > 0 ? (
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {likedProducts.map(product => (
                    <Link 
                      to={`/products/${product.id}`} 
                      key={product.id}
                      className="min-w-[200px] group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.name}/200/150`;
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-black text-slate-900 text-xs truncate">{product.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-emerald-600">${product.price}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black text-slate-400">4.8</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Heart className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Your wishlist is empty.</p>
                  <Link to="/products" className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-4 inline-block hover:underline">Find Products</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Points Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                  <Gift className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Eco Rewards</h3>
              </div>
              <div className="mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-400">{user.greenPoints || 0}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Points</span>
                </div>
              </div>
              <Link to="/rewards" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40">
                Redeem Rewards <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              Help & Support
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Track Package', icon: Package },
                { label: 'Return Items', icon: Clock },
                { label: 'Customer Service', icon: User },
                { label: 'Payment Issues', icon: CreditCard }
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={logout}
            className="w-full py-5 bg-white text-red-500 border border-red-100 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
