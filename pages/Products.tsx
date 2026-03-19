import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Leaf, ArrowRight, ShoppingBag, Heart, X, Eye, Trophy, BadgeCheck, LayoutDashboard, BarChart3, ShieldCheck, Zap, TrendingUp, Settings, Tag, Clock, Coins, User, Utensils, Shirt, Smartphone, Home as HomeIcon, Flower2, Gamepad2, Briefcase, Dog, Sparkles } from 'lucide-react';
import { getProducts, trackActivity } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import PriceComparison from '../components/PriceComparison';
import OfferCard from '../components/OfferCard';
import LikePopup from '../components/LikePopup';

const Products: React.FC = () => {
  const { user, toggleLikeProduct, addToCart, removeFromCart } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [likedProductsData, setLikedProductsData] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [ecoHero, setEcoHero] = useState<Product | null>(null);
  const [offerProduct, setOfferProduct] = useState<Product | null>(null);
  const [likedPopupData, setLikedPopupData] = useState<{ product: Product, points: number } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
      
      // Find the absolute lowest carbon product
      const hero = [...data].filter(p => p.carbonData).sort((a, b) => (a.carbonData?.total || 0) - (b.carbonData?.total || 0))[0];
      setEcoHero(hero);
      
      // Set a random product as offer or the one with highest points
      const offer = [...data].sort((a, b) => b.pointsValue - a.pointsValue)[0];
      setOfferProduct(offer);
      
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (showLeaderboard) {
      result = [...products].sort((a, b) => b.carbonScore - a.carbonScore).slice(0, 10);
    } else {
      if (searchTerm) {
        result = result.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedCategory !== 'All') {
        result = result.filter(p => p.category === selectedCategory);
      }
    }
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products, showLeaderboard]);

  useEffect(() => {
    if (user?.likedProducts && products.length > 0) {
      const liked = products.filter(p => user.likedProducts?.includes(p.id));
      setLikedProductsData(liked);
    } else {
      setLikedProductsData([]);
    }
  }, [user?.likedProducts, products]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Personal Care': return <User className="w-4 h-4" />;
      case 'Kitchen': return <Utensils className="w-4 h-4" />;
      case 'Clothing': return <Shirt className="w-4 h-4" />;
      case 'Electronics': return <Smartphone className="w-4 h-4" />;
      case 'Home': return <HomeIcon className="w-4 h-4" />;
      case 'Garden': return <Flower2 className="w-4 h-4" />;
      case 'Toys': return <Gamepad2 className="w-4 h-4" />;
      case 'Office': return <Briefcase className="w-4 h-4" />;
      case 'Pet Care': return <Dog className="w-4 h-4" />;
      case 'Beauty': return <Sparkles className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-orange-600 bg-orange-50 border-orange-100';
  };

  const getEmissionColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-emerald-500 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      case 'High': return 'bg-rose-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Trending Marquee */}
      <div className="bg-slate-900 py-3 overflow-hidden whitespace-nowrap border-b border-white/5 relative z-20">
        <div className="flex animate-marquee gap-12 items-center">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Trending: Bamboo Toothbrush (+42%)</span>
              </div>
              <div className="flex items-center gap-3">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New Arrival: Solar Power Bank</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Eco Score Leader: Organic Cotton T-Shirt</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Curated Sustainability</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
              Eco Marketplace<span className="text-emerald-600">.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Discover products with verified low environmental impact. Every purchase supports a more sustainable future for our planet.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search the marketplace..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

      {/* Visual Category Selector */}
      <div className="flex flex-col md:flex-row gap-10">
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
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
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

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Marketplace Filters</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {setSelectedCategory('All'); setShowLeaderboard(false);}}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                    selectedCategory === 'All' && !showLeaderboard
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <span>All Products</span>
                </button>

                <button
                  onClick={() => {setShowLeaderboard(true); setSelectedCategory('All');}}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                    showLeaderboard
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                      : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span>Leaderboard</span>
                  </div>
                </button>
              </div>
            </div>

            {offerProduct && (
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Special Offers</h3>
                <OfferCard product={offerProduct} />
              </div>
            )}

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Categories</h3>
              <div className="flex flex-col gap-1">
                {categories.filter(c => c !== 'All').map((cat) => (
                  <button
                    key={cat as string}
                    onClick={() => {setSelectedCategory(cat as string); setShowLeaderboard(false);}}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 group ${
                      selectedCategory === cat && !showLeaderboard
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    <div className={`${selectedCategory === cat && !showLeaderboard ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                      {getCategoryIcon(cat as string)}
                    </div>
                    <span>{cat as string}</span>
                  </button>
                ))}
              </div>
            </div>

            {likedProductsData.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Liked Items</h3>
                <div className="grid grid-cols-4 gap-2 px-2">
                  {likedProductsData.slice(0, 8).map(item => (
                    <Link 
                      to={`/products/${item.id}`} 
                      key={item.id}
                      className="aspect-square rounded-lg overflow-hidden border border-slate-100 hover:border-emerald-500 transition-colors group relative"
                      title={item.name}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  ))}
                </div>
                {likedProductsData.length > 8 && (
                  <p className="text-[10px] text-slate-400 mt-2 px-2 font-bold italic">+{likedProductsData.length - 8} more favorites</p>
                )}
              </div>
            )}

            <div className="bg-emerald-900 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <Leaf className="w-8 h-8 text-emerald-400 mb-4" />
                <h4 className="font-black text-lg leading-tight mb-2">Eco Tip</h4>
                <p className="text-emerald-100/80 text-xs font-medium leading-relaxed">
                  Choosing products with a score above 90 can reduce your personal carbon footprint by up to 40%.
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-800 rounded-full blur-2xl"></div>
            </div>
          </div>
        </aside>

        <div className="flex-grow">
          {/* Eco Hero Notification */}
          {ecoHero && !showLeaderboard && selectedCategory === 'All' && !searchTerm && (
            <div className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20 shrink-0">
                  <img src={ecoHero.image} alt={ecoHero.name} className="w-full h-full object-contain drop-shadow-xl" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm mb-4">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Low Carbon Hero</span>
                  </div>
                  <h2 className="text-3xl font-black leading-tight mb-2">Meet the {ecoHero.name}</h2>
                  <p className="text-emerald-100/80 font-medium text-sm max-w-xl mb-6">
                    This product has the lowest carbon footprint in our entire collection ({ecoHero.carbonData.total}kg CO2e). Switching to this could save you significant emissions!
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button 
                      onClick={() => setQuickViewProduct(ecoHero)}
                      className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg"
                    >
                      Quick View
                    </button>
                    <button 
                      onClick={() => addToCart(ecoHero.id)}
                      className="bg-emerald-500/30 text-white border border-white/20 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-[2rem] border border-slate-100 h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredProducts.map(product => (
                <Link 
                  to={`/products/${product.id}`} 
                  key={product.id}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col relative"
                >
                  {/* Image Section */}
                  <div className="relative h-72 overflow-hidden bg-slate-50/50">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'} 
                      alt={product.name}
                      className="w-full h-full object-contain p-10 group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-154260190690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400`;
                      }}
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
                      <div className={`px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest shadow-lg backdrop-blur-md ${getScoreColor(product.carbonScore)}`}>
                        Score: {product.carbonScore}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const points = await toggleLikeProduct(product.id);
                          if (points > 0) {
                            setLikedPopupData({ product, points });
                          }
                        }}
                        className={`p-3 rounded-2xl backdrop-blur-md border shadow-xl transition-all ${
                          user?.likedProducts?.includes(product.id)
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-white/90 border-white/20 text-slate-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${user?.likedProducts?.includes(product.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickViewProduct(product);
                          trackActivity(product.id, 'view');
                        }}
                        className="p-3 bg-white/90 border border-white/20 text-slate-400 hover:text-emerald-600 rounded-2xl shadow-xl backdrop-blur-md transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{product.brand}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                    </div>

                    {product.priceComparison && product.priceComparison.length > 0 && (
                      <div className="mb-6">
                        <PriceComparison comparisons={product.priceComparison} compact />
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">₹{Math.round(product.price * 83).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">M.R.P Incl. Taxes</span>
                      </div>
                      
                      {user?.cart?.some(item => item.productId === product.id) ? (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromCart(product.id);
                          }}
                          className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-lg shadow-red-500/10"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product.id);
                            trackActivity(product.id, 'purchase');
                          }}
                          className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                          <ShoppingBag className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setQuickViewProduct(null)}
          ></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400 hover:text-slate-900 transition-colors shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-8">
              <img 
                src={quickViewProduct.image} 
                alt={quickViewProduct.name} 
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800';
                }}
              />
            </div>
            
            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
              <div className="mb-6">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">{quickViewProduct.brand}</p>
                <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">{quickViewProduct.name}</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-900">₹{Math.round(quickViewProduct.price * 83).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 line-through font-bold">₹{Math.round(quickViewProduct.price * 1.2 * 83).toLocaleString()}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full border font-black text-[10px] uppercase tracking-widest ${getScoreColor(quickViewProduct.carbonScore)}`}>
                    Eco Score: {quickViewProduct.carbonScore}
                  </div>
                  <div className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest ${getEmissionColor(quickViewProduct.emissionLevel)}`}>
                    {quickViewProduct.emissionLevel} Emission
                  </div>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  {quickViewProduct.description}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sustainability</p>
                      <p className="text-xs font-bold text-slate-700">Verified Low Carbon Impact</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                      <p className="text-xs font-bold text-slate-700">{quickViewProduct.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Lifespan</p>
                      <p className="text-xs font-bold text-slate-700">{quickViewProduct.expectedLifespan}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sustainability Certifications</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">GOTS</span>
                    </div>
                    <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Fair Trade</span>
                    </div>
                    <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Neutral</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Carbon Efficiency</span>
                      <span className="text-[9px] font-black text-emerald-600">9.5/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Material Purity</span>
                      <span className="text-[9px] font-black text-emerald-600">8.8/10</span>
                    </div>
                  </div>
                </div>

                {quickViewProduct.priceComparison && quickViewProduct.priceComparison.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Price Intelligence</h4>
                    <PriceComparison comparisons={quickViewProduct.priceComparison} />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to={`/products/${quickViewProduct.id}`}
                  className="flex-grow bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                  View Full Details
                </Link>
                <button
                  onClick={async () => {
                    const points = await toggleLikeProduct(quickViewProduct.id);
                    if (points > 0) {
                      setLikedPopupData({ product: quickViewProduct, points });
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-center ${
                    user?.likedProducts?.includes(quickViewProduct.id)
                      ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${user?.likedProducts?.includes(quickViewProduct.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LikePopup 
        product={likedPopupData?.product || null} 
        points={likedPopupData?.points || 0} 
        onClose={() => setLikedPopupData(null)} 
      />
      </div>
    </div>
  );
};

export default Products;
