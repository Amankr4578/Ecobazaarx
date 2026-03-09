import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Zap, ArrowRight, ShoppingBag, LayoutDashboard, Heart, Eye, Clock, Sparkles, Coins } from 'lucide-react';
import { getProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

const Offers: React.FC = () => {
  const { user, addToCart, toggleLikeProduct } = useAuth();
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const data = await getProducts();
      // Simulate offers by taking products with high points or specific categories
      // In a real app, this would be a specific API endpoint for offers
      const offers = data.filter(p => p.pointsValue > 40 || p.carbonScore > 90).slice(0, 8);
      setOfferProducts(offers);
      setLoading(false);
    };
    fetchOffers();
  }, []);

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
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-orange-600 text-white shadow-lg shadow-orange-500/20"
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

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <Clock className="w-8 h-8 text-orange-400 mb-4" />
                <h4 className="font-black text-lg leading-tight mb-2">Flash Deals</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  New sustainable offers are added every 24 hours. Don't miss out on high-score products!
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Exclusive Eco-Offers</h1>
            </div>
            <p className="text-slate-500 font-medium">
              Limited time deals on our most sustainable products. Earn double points on every purchase.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-[2rem] border border-slate-100 h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {offerProducts.map(product => (
                <div 
                  key={product.id}
                  className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative"
                >
                  {/* Offer Badge */}
                  <div className="absolute top-4 right-4 z-30 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                    <Zap className="w-3 h-3 fill-current" />
                    20% OFF
                  </div>

                  <div className="relative h-48 overflow-hidden bg-slate-50">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/10 transition-all duration-300"></div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{product.brand}</p>
                      <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{product.name}</h3>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-400 line-through">${(product.price * 1.2).toFixed(2)}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Score: {product.carbonScore}</span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <button 
                        onClick={() => addToCart(product.id)}
                        className="w-full bg-orange-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                      </button>
                      <Link 
                        to={`/products/${product.id}`}
                        className="w-full bg-slate-50 text-slate-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && offerProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <Tag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-900 mb-2">No active offers</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                Check back later for new sustainable deals and exclusive discounts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for Leaf icon since it's used but not imported in the original list
const Leaf = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C10.9 14.36 12 14 15 12" />
  </svg>
);

export default Offers;
