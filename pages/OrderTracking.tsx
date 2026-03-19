
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Truck, CheckCircle2, Clock, MapPin, 
  ChevronRight, ArrowLeft, ShoppingBag, Info,
  CreditCard, ShieldCheck, AlertCircle
} from 'lucide-react';
import { getToken } from '../src/services/authService';

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchOrder = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        showNotification('Order not found', 'error');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    const token = getToken();
    try {
      const response = await fetch(`/api/orders/${id}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Payment successful!', 'success');
        fetchOrder();
      } else {
        showNotification('Payment failed', 'error');
      }
    } catch (error) {
      showNotification('An error occurred during payment', 'error');
    } finally {
      setPaying(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!order) return null;

  const tracking = order.tracking_info || { updates: [] };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#FBFBFB] min-h-screen">
      <div className="mb-10">
        <Link to="/orders" className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Track Order</h1>
            <p className="text-slate-500 font-medium mt-2">Order ID: <span className="text-slate-900 font-bold">{order.id}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              order.status === 'paid' 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              {order.status}
            </span>
            {order.status === 'pending' && (
              <button 
                onClick={handlePay}
                disabled={paying}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {paying ? 'Processing...' : 'Pay Now'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Tracking Timeline */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3">
              <Truck className="w-6 h-6 text-emerald-600" />
              Delivery Status
            </h3>
            
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
              <div className="space-y-12">
                {tracking.updates.map((update: any, idx: number) => (
                  <div key={idx} className="relative pl-12">
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      idx === 0 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-white border-2 border-slate-100 text-slate-300'
                    }`}>
                      {idx === 0 ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-base font-black ${idx === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{update.status}</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {formatDate(update.time)}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${idx === 0 ? 'text-slate-500' : 'text-slate-300'}`}>{update.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
              Order Items
            </h3>
            <div className="space-y-6">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-slate-900">{item.name}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">Quantity: {item.quantity} • ₹{Math.round(item.price * 83).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">₹{Math.round(item.price * item.quantity * 83).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-slate-100 space-y-3">
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Subtotal</span>
                <span>₹{Math.round(((order.total_amount || 0) + (order.discount_amount || 0) - (order.platform_fee || 0)) * 83).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-600">
                <span>Discount</span>
                <span>-₹{Math.round((order.discount_amount || 0) * 83).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Platform Fee</span>
                <span>₹{Math.round((order.platform_fee || 0) * 83).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900 pt-4">
                <span>Total</span>
                <span>₹{Math.round((order.total_amount || 0) * 83).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Shipping Info */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Shipping Address
            </h3>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-sm font-black text-slate-900 mb-2">Eco Warrior</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                123 Green Street, Eco City<br />
                Sustainability State, 560001<br />
                India
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment Method
            </h3>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">EcoPay Secure</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">**** 4242</p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                Need Help?
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
                Our eco-support team is available 24/7 to help you with your order.
              </p>
              <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Contact Support</button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
