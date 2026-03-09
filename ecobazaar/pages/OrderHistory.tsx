
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, Calendar, Package, ArrowRight, CheckCircle2, 
  Clock, ChevronRight, Search, Filter, Download
} from 'lucide-react';

const OrderHistory: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem('eco_token');
    if (!token) return;

    try {
      const response = await fetch('/api/orders/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDirectPay = async (orderId: string) => {
    setPayingId(orderId);
    const token = localStorage.getItem('eco_token');
    try {
      const response = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Payment successful!', 'success');
        fetchOrders();
      } else {
        showNotification('Payment failed', 'error');
      }
    } catch (error) {
      showNotification('An error occurred', 'error');
    } finally {
      setPayingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#FBFBFB] min-h-screen">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
          <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Account</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900">Order History</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Orders</h1>
        <p className="text-slate-500 font-medium mt-2">Track and manage your sustainable purchases</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:col-span-3 flex-grow space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            orders.map((order, idx) => (
              <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Placed</p>
                      <p className="text-sm font-black text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-sm font-black text-slate-900">₹{order.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{order.status}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleDirectPay(order.id)}
                        disabled={payingId === order.id}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {payingId === order.id ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Invoice</button>
                    <Link 
                      to={`/track/${order.id}`}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 overflow-hidden border border-slate-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <ShoppingBag className="w-8 h-8" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-black text-slate-900 mb-1">{item.name}</h3>
                        <p className="text-slate-500 font-medium text-xs">Quantity: {item.quantity} • ₹{Math.round(item.price).toLocaleString()} each</p>
                        <div className="mt-3 flex items-center gap-4">
                          <Link to={`/products/${item.productId}`} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">Buy it again</Link>
                          <Link to={`/products/${item.productId}`} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:underline">View item</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="w-12 h-12 text-slate-200" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">No orders found</h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">
                You haven't made any sustainable purchases yet. Start your journey towards a greener planet today.
              </p>
              <Link 
                to="/products" 
                className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
              >
                Explore Marketplace
              </Link>
            </div>
          )}
        </div>

        <div className="lg:w-80 shrink-0 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 tracking-tight">Filter Orders</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Time Period</label>
                <select className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500">
                  <option>Last 3 months</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>Older</option>
                </select>
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Apply Filters</button>
            </div>
          </div>

          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
              <Download className="w-20 h-20" />
            </div>
            <h3 className="font-black mb-2 tracking-tight">Download Report</h3>
            <p className="text-emerald-100 text-xs font-medium mb-6 leading-relaxed">Get a detailed summary of your eco-impact and purchases.</p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/20">Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
