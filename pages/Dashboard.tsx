
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, User, ShieldCheck, Heart, Coins, Leaf, Clock, 
  Settings, CreditCard, MapPin, ArrowRight, ShoppingBag, 
  Zap, Eye, Star, Gift, HelpCircle, LogOut, X, MessageCircle, CheckCircle2
} from 'lucide-react';
import { getProducts, getActivityStats } from '../services/productService';
import { Product } from '../types';
import { getToken } from '../src/services/authService';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState<string | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const supportOptions = [
    { 
      label: 'Track Package', 
      icon: Package, 
      description: 'Check your delivery status', 
      placeholder: 'e.g. it not delivery' 
    },
    { 
      label: 'Return Items', 
      icon: Clock, 
      description: 'Request a return or refund', 
      placeholder: 'e.g. item is damaged or wrong' 
    },
    { 
      label: 'Customer Service', 
      icon: User, 
      description: 'Chat with our support agents', 
      placeholder: 'e.g. talk to our support team' 
    },
    { 
      label: 'Payment Issues', 
      icon: CreditCard, 
      description: 'Help with billing or charges', 
      placeholder: 'e.g. billing and payment help' 
    }
  ];

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportCategory || !supportMessage) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          subject: `Support Request: ${supportCategory}`,
          category: supportCategory.toLowerCase().replace(' ', '_'),
          message: supportMessage
        })
      });

      if (response.ok) {
        setSupportSuccess(true);
        setSupportMessage('');
        setTimeout(() => {
          setSupportSuccess(false);
          setIsSupportModalOpen(false);
          setSupportCategory(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit support ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const [products, activityData, ordersRes] = await Promise.all([
          getProducts(),
          getActivityStats(),
          fetch('/api/orders/history', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (user?.likedProducts) {
          setLikedProducts(products.filter(p => user.likedProducts?.includes(p.id)));
        }

        if (activityData) {
          setRecentActivity(activityData.history.slice(0, 4));
          setStats(activityData.stats);
        }

        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setRecentOrders(orders.slice(0, 3));
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
      link: '/orders',
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
          {/* Recent Orders Section */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 tracking-tight">Recent Orders</h3>
              </div>
              <Link to="/orders" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">View All Orders</Link>
            </div>
            <div className="p-8">
              {recentOrders.length > 0 ? (
                <div className="space-y-6">
                  {recentOrders.map((order, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            {new Date(order.created_at).toLocaleDateString()} • {order.items.length} Items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">₹{Math.round(order.total_amount * 83).toLocaleString()}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Package className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No orders yet.</p>
                  <Link to="/products" className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-4 inline-block hover:underline">Start Shopping</Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-900" />
                <h3 className="font-black text-slate-900 tracking-tight">Recent Activity</h3>
              </div>
              <Link to="/history" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">View All Activity</Link>
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
                <h3 className="font-black text-slate-900 tracking-tight">Liked Products</h3>
              </div>
              <Link to="/products" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">Browse More</Link>
            </div>
            <div className="p-8">
              {likedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {likedProducts.map(product => (
                    <Link 
                      to={`/products/${product.id}`} 
                      key={product.id}
                      className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all duration-300 border border-slate-100 hover:border-emerald-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-emerald-100 transition-colors">
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{product.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">₹{Math.round(product.price * 83).toLocaleString()}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-all" />
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
              {supportOptions.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setSupportCategory(item.label);
                    setSupportMessage(''); // Clear message when opening new category
                    setIsSupportModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-emerald-50 transition-colors">
                      <item.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold text-slate-900 block">{item.label}</span>
                      <span className="text-[10px] font-medium text-slate-400">{item.description}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
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
      {/* Support Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-10">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsSupportModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Support: {supportCategory}</h3>
                </div>
                <button 
                  onClick={() => setIsSupportModalOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {supportSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Ticket Submitted!</h4>
                  <p className="text-slate-500 font-medium">Our team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Describe your issue</label>
                    <textarea 
                      required
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder={supportOptions.find(opt => opt.label === supportCategory)?.placeholder || `Tell us more about your ${supportCategory?.toLowerCase()} issue...`}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[150px]"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
