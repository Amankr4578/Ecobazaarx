import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Leaf, ShieldCheck, Truck, Package, Factory, 
  Zap, Info, ShoppingCart, Share2, Heart, BarChart3, Scale, Maximize, Globe, Users, TrendingUp, Coins, ExternalLink, X, Settings, Eye, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { getProductById, getProducts, trackActivity, getRecommendations } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

import PriceComparison from '../components/PriceComparison';
import LikePopup from '../components/LikePopup';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, toggleLikeProduct, addToCart, showNotification, setIsCartOpen, addPoints } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [alternativeProducts, setAlternativeProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [likedPopupData, setLikedPopupData] = useState<{ product: Product, points: number } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          // Track view activity
          trackActivity(id, 'view').then(res => {
            if (res && res.pointsEarned) {
              addPoints(res.pointsEarned);
              showNotification(`Earned ${res.pointsEarned} Green Points for viewing!`);
            }
          });
          
          // Fetch related products (recommendations)
          const recommendations = await getRecommendations(data.id);
          setRelatedProducts(recommendations);

          // Fetch all products for alternatives
          const allProducts = await getProducts();
          
          let alternatives: Product[] = [];
          if (data.carbonScore < 50) {
            // If current is bad, recommend better ones
            alternatives = allProducts
              .filter(p => p.category === data.category && p.id !== data.id && p.carbonScore > data.carbonScore)
              .sort((a, b) => b.carbonScore - a.carbonScore)
              .slice(0, 3);
          } else {
            // If current is good, recommend standard (worse) ones for comparison
            alternatives = allProducts
              .filter(p => p.category === data.category && p.id !== data.id && p.carbonScore < data.carbonScore)
              .sort((a, b) => a.carbonScore - b.carbonScore)
              .slice(0, 3);
          }
          setAlternativeProducts(alternatives);
        } else {
          navigate('/products');
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Analyzing Carbon Data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4">Product Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">The product you are looking for does not exist or has been removed from our marketplace.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const carbonChartData = [
    { name: 'Production', value: product.carbonData?.production || 0, color: '#10b981' },
    { name: 'Transport', value: product.carbonData?.transport || 0, color: '#3b82f6' },
    { name: 'Packaging', value: product.carbonData?.packaging || 0, color: '#8b5cf6' },
    { name: 'Usage', value: Math.max(0, product.carbonData?.usage || 0), color: '#f59e0b' },
  ];

  const getScoreLabel = (score: number) => {
    if (score >= 90) return { text: 'Exceptional', color: 'text-emerald-600 bg-emerald-50' };
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600 bg-green-50' };
    if (score >= 70) return { text: 'Good', color: 'text-yellow-600 bg-yellow-50' };
    return { text: 'Fair', color: 'text-orange-600 bg-orange-50' };
  };

  const scoreInfo = getScoreLabel(product.carbonScore);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link 
        to="/products" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column: Image & Basic Info */}
        <div className="space-y-12 sticky top-24">
          {/* Sustainability Alert for High Emission Products */}
          {product.emissionLevel === 'High' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border-2 border-rose-200 rounded-[2rem] p-6 flex items-start gap-4 shadow-lg shadow-rose-500/5"
            >
              <div className="p-3 bg-rose-500 rounded-2xl shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-900 mb-1">High Emission Alert</h3>
                <p className="text-sm text-rose-800 font-medium leading-relaxed">
                  This product has a high carbon footprint. Consider switching to a sustainable alternative to reduce your environmental impact.
                </p>
                {alternativeProducts.length > 0 && (
                  <button 
                    onClick={() => {
                      const element = document.getElementById('eco-alternatives');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-3 text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    View Better Alternatives
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          <div 
            className="relative rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 aspect-square cursor-zoom-in group/image bg-slate-50"
            onClick={() => setIsImageModalOpen(true)}
          >
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800';
                }}
            />
            
            {/* Floating Badges */}
            <div className="absolute top-10 left-10 z-10 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={async () => {
                  if (product) {
                    const points = await toggleLikeProduct(product.id);
                    if (points > 0) {
                      setLikedPopupData({ product, points });
                    }
                  }
                }}
                className={`p-5 rounded-3xl backdrop-blur-md border transition-all active:scale-90 ${
                  user?.likedProducts?.includes(product?.id || '')
                    ? 'bg-red-500 border-red-500 text-white shadow-2xl shadow-red-500/40'
                    : 'bg-white/80 border-white/20 text-slate-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-7 h-7 ${user?.likedProducts?.includes(product?.id || '') ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="absolute bottom-10 right-10">
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/20 flex flex-col items-center min-w-[140px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Eco Score</span>
                <span className="text-6xl font-black text-emerald-600 leading-none">{product.carbonScore}</span>
                <div className="mt-4 flex flex-col gap-2 w-full">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center ${scoreInfo.color}`}>
                    {scoreInfo.text}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center ${getEmissionColor(product.emissionLevel)}`}>
                    {product.emissionLevel} Emission
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 rounded-2xl mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certified</span>
              <span className="text-xs font-bold text-slate-700">Sustainable</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 rounded-2xl mb-4">
                <Leaf className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Material</span>
              <span className="text-xs font-bold text-slate-700">Eco-Friendly</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-50 rounded-2xl mb-4">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping</span>
              <span className="text-xs font-bold text-slate-700">Carbon Neutral</span>
            </div>
          </div>

          {/* Sustainability Score Breakdown */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                Sustainability Score Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carbon Efficiency</span>
                    <span className="text-sm font-black text-emerald-400">9.5/10</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Material Purity</span>
                    <span className="text-sm font-black text-emerald-400">8.8/10</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ethical Sourcing</span>
                    <span className="text-sm font-black text-emerald-400">10/10</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Water Conservation</span>
                    <span className="text-sm font-black text-emerald-400">7.2/10</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Packaging Waste</span>
                    <span className="text-sm font-black text-emerald-400">9.0/10</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Social Impact</span>
                    <span className="text-sm font-black text-emerald-400">9.8/10</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Digital Product Passport (DPP) Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                Digital Product Passport
              </h3>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Verified Blockchain Record</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Repairability & Lifespan */}
              <div className="xl:col-span-1 space-y-6">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repairability Score</span>
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-black text-slate-900">{product.repairabilityScore}</span>
                    <span className="text-slate-400 font-bold mb-1.5">/ 10</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${product.repairabilityScore * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Based on ease of disassembly, availability of spare parts, and repair documentation.
                  </p>
                  
                  <div className="mt-auto pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Lifespan</span>
                    </div>
                    <p className="text-xl font-black text-slate-900">{product.expectedLifespan}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Manufactured: {product.manufactureDate}</p>
                  </div>
                </div>
              </div>

              {/* Lifecycle Timeline */}
              <div className="xl:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-8 text-emerald-400">Product Journey Timeline</h4>
                  <div className="space-y-8">
                    {(product.lifecycleStages || []).map((stage, index) => (
                      <div key={index} className="flex gap-6 relative group">
                        {index !== (product.lifecycleStages?.length || 0) - 1 && (
                          <div className="absolute left-4 top-8 bottom-[-2rem] w-0.5 bg-slate-800 group-hover:bg-emerald-500/30 transition-colors"></div>
                        )}
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 z-10 group-hover:border-emerald-500 transition-colors">
                          <span className="text-[10px] font-black text-emerald-400">{index + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h5 className="font-black text-sm uppercase tracking-wide">{stage.stage}</h5>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
                              <Globe className="w-2.5 h-2.5 text-slate-400" />
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                {stage.location}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
              </div>
            </div>

            {/* End of Life Instructions */}
            <div className="mt-8 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center gap-6 shadow-sm">
              <div className="flex items-center gap-6 w-full">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10 shrink-0">
                  <Package className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-md font-black text-emerald-900 mb-1">End-of-Life Instructions</h4>
                  <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                    {product.recyclingInstructions}
                  </p>
                </div>
              </div>
              <button className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                Download Recycling Guide
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Visualization */}
        <div className="flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                {product.category}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">{product.brand}</span>
              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Earn {product.pointsValue} Points</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8 tracking-tighter">
              {product.name}<span className="text-emerald-600">.</span>
            </h1>
            
            <div className="flex items-center gap-6 mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MRP</span>
                <span className="text-5xl font-black text-slate-900 tracking-tight">₹{Math.round(product.price * 83).toLocaleString()}</span>
              </div>
              <div className="w-px h-12 bg-slate-100"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Eco Savings</span>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-2xl font-black text-emerald-600">15% OFF</span>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-xl leading-relaxed font-medium max-w-2xl">
              {product.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button 
              onClick={() => {
                addToCart(product.id);
                showNotification('Added to cart!', 'success');
              }}
              className="flex-grow flex items-center justify-center gap-4 bg-white border-2 border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-black text-xl shadow-sm hover:border-slate-300 active:scale-[0.98] transition-all group"
            >
              Add to cart
            </button>
            <button 
              onClick={() => {
                addToCart(product.id);
                setIsCartOpen(true);
              }}
              className="flex-grow flex items-center justify-center gap-4 bg-amber-400 hover:bg-amber-500 text-slate-900 px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-amber-200/50 active:scale-[0.98] transition-all"
            >
              Buy at ₹{Math.round((product.priceComparison?.find(c => c.isBestValue)?.price || product.price) * 83).toLocaleString()}
            </button>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  if (product) {
                    const points = await toggleLikeProduct(product.id);
                    if (points > 0) {
                      setLikedPopupData({ product, points });
                    }
                  }
                }}
                className={`p-5 rounded-2xl border transition-all active:scale-90 ${
                  user?.likedProducts?.includes(product.id)
                    ? 'bg-red-500 border-red-500 text-white shadow-2xl shadow-red-500/30'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-6 h-6 ${user?.likedProducts?.includes(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Price Comparison Section (Flash.co style) */}
          {product.priceComparison && product.priceComparison.length > 0 && (
            <div className="mb-10">
              <PriceComparison comparisons={product.priceComparison} />
            </div>
          )}

          {/* Alternatives Section (Greener or Standard Comparison) */}
          {alternativeProducts.length > 0 && (
            <div id="eco-alternatives" className={`mb-10 p-10 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden scroll-mt-24 ${
              product.carbonScore >= 50 
                ? 'bg-slate-50 border-slate-200 shadow-slate-900/5' 
                : 'bg-emerald-50 border-emerald-200 shadow-emerald-500/10'
            }`}>
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                {product.carbonScore >= 50 ? (
                  <BarChart3 className="w-64 h-64 text-slate-900" />
                ) : (
                  <Leaf className="w-64 h-64 text-emerald-900" />
                )}
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-4 rounded-[1.5rem] shadow-xl ${
                    product.carbonScore >= 50 
                      ? 'bg-slate-900 shadow-slate-900/30' 
                      : 'bg-emerald-600 shadow-emerald-600/30'
                  }`}>
                    {product.carbonScore >= 50 ? (
                      <Scale className="w-8 h-8 text-white" />
                    ) : (
                      <Leaf className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {product.carbonScore >= 50 ? 'Impact Comparison' : 'Better for the Planet'}
                    </h3>
                    <p className={`text-xs font-black uppercase tracking-[0.2em] ${
                      product.carbonScore >= 50 ? 'text-slate-500' : 'text-emerald-700'
                    }`}>
                      {product.carbonScore >= 50 ? 'Standard vs Sustainable' : 'Eco-Friendly Alternatives'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {alternativeProducts.map(alt => (
                    <Link 
                      to={`/product/${alt.id}`} 
                      key={alt.id}
                      className={`flex items-center gap-6 p-6 bg-white rounded-[2rem] border hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group ${
                        product.carbonScore >= 50 
                          ? 'border-slate-100 hover:border-slate-900 hover:shadow-slate-900/10' 
                          : 'border-emerald-100 hover:border-emerald-500 hover:shadow-emerald-500/10'
                      }`}
                    >
                      <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                        <img 
                          src={alt.image} 
                          alt={alt.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alt.brand}</p>
                            <h4 className={`text-lg font-black text-slate-900 leading-tight transition-colors ${
                              product.carbonScore >= 50 ? 'group-hover:text-slate-900' : 'group-hover:text-emerald-600'
                            }`}>{alt.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                alt.carbonScore >= 50 ? 'bg-emerald-100' : 'bg-rose-100'
                              }`}>
                                {alt.carbonScore >= 50 ? (
                                  <Leaf className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ShieldCheck className="w-3 h-3 text-rose-600" />
                                )}
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                  alt.carbonScore >= 50 ? 'text-emerald-700' : 'text-rose-700'
                                }`}>Score: {alt.carbonScore}</span>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {alt.carbonScore >= 50 ? 'Sustainable' : 'High Emission'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-slate-900">₹{Math.round(alt.price * 83).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl text-slate-400 group-hover:text-white group-hover:rotate-45 transition-all duration-500 ${
                        product.carbonScore >= 50 ? 'bg-slate-50 group-hover:bg-slate-900' : 'bg-slate-50 group-hover:bg-emerald-600'
                      }`}>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className={`mt-10 p-6 backdrop-blur-md rounded-[2rem] border flex items-center gap-4 ${
                  product.carbonScore >= 50 
                    ? 'bg-white/60 border-slate-200' 
                    : 'bg-white/60 border-emerald-100/50'
                }`}>
                  <div className={`p-3 rounded-2xl ${
                    product.carbonScore >= 50 ? 'bg-slate-100' : 'bg-emerald-100'
                  }`}>
                    {product.carbonScore >= 50 ? (
                      <BarChart3 className="w-6 h-6 text-slate-900" />
                    ) : (
                      <Zap className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <p className={`text-sm font-bold leading-relaxed ${
                    product.carbonScore >= 50 ? 'text-slate-700' : 'text-emerald-900'
                  }`}>
                    {product.carbonScore >= 50 ? (
                      <>
                        By choosing this product over standard alternatives, you are reducing carbon emissions by <span className="text-emerald-600 font-black">{(product.carbonScore - Math.min(...alternativeProducts.map(p => p.carbonScore))).toFixed(0)}%</span>.
                      </>
                    ) : (
                      <>
                        By choosing one of these alternatives, you can reduce your carbon footprint by up to <span className="text-emerald-600 font-black">{(Math.max(...alternativeProducts.map(p => p.carbonScore)) - product.carbonScore).toFixed(0)}%</span> for this purchase.
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>
          )}

          {/* Materials & Specifications Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {product.materials && product.materials.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Primary Materials
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(product.weight || product.dimensions || product.origin) && (
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Specifications
                </h3>
                <div className="space-y-2">
                  {product.weight && (
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Scale className="w-3 h-3" /> Weight
                      </span>
                      <span className="text-slate-700 font-black">{product.weight}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Maximize className="w-3 h-3" /> Dimensions
                      </span>
                      <span className="text-slate-700 font-black">{product.dimensions}</span>
                    </div>
                  )}
                  {product.origin && (
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Origin
                      </span>
                      <span className="text-slate-700 font-black">{product.origin}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sustainability Certifications */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Certifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center group hover:bg-emerald-100 transition-colors">
                <Leaf className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">GOTS Certified</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center group hover:bg-blue-100 transition-colors">
                <ShieldCheck className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Fair Trade</span>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col items-center text-center group hover:bg-purple-100 transition-colors">
                <Zap className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest">Carbon Neutral</span>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex flex-col items-center text-center group hover:bg-orange-100 transition-colors">
                <Package className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Zero Waste</span>
              </div>
            </div>
          </div>

          {/* Market & Carbon Reports Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
            {/* Market Insights Section */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl p-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Users className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  Market Popularity
                </h3>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Purchases</span>
                  <span className="text-2xl font-black text-slate-900">{product.purchaseCount.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-64 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={product.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#1d4ed8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  This product has been purchased by <span className="font-bold">{product.purchaseCount.toLocaleString()} users</span>. 
                  Demand has <span className="font-bold text-blue-700">increased by 24%</span> in the last 30 days.
                </p>
              </div>
            </div>

            {/* Carbon Footprint Visualization */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl p-3 sm:p-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-32 h-32" />
              </div>
              <div className="flex flex-row items-center justify-between gap-2 mb-2 sm:mb-8 relative z-10">
                <div className="flex items-center gap-1 sm:gap-3">
                  <div className="hidden sm:block p-2 bg-emerald-50 rounded-xl shrink-0">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-[8px] sm:text-xl font-black text-slate-900 leading-tight uppercase tracking-widest sm:normal-case sm:tracking-normal">
                    Carbon Footprint
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 sm:bg-transparent px-1.5 py-0.5 sm:p-0 rounded-md sm:rounded-none border border-slate-100 sm:border-none">
                  <span className="text-[6px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Total CO2e</span>
                  <span className="text-[8px] sm:text-2xl font-black text-slate-900">{product.carbonData.total}kg</span>
                </div>
              </div>

              <div className="flex flex-row md:grid md:grid-cols-2 gap-2 sm:gap-8 items-center relative z-10">
                <div className="h-20 sm:h-64 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={carbonChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={10}
                        outerRadius={22}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {carbonChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-0.5 sm:gap-3 flex-1">
                  {carbonChartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-0.5 sm:p-3 bg-slate-50 rounded sm:rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-1 sm:gap-3 min-w-0">
                        <div className="w-1 h-1 sm:w-3 sm:h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[6px] sm:text-sm font-bold text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span className="text-[6px] sm:text-sm font-black text-slate-900 shrink-0 ml-1">{item.value}kg</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  This product emits <span className="font-bold">{product.carbonData.total}kg</span> of CO2 throughout its lifecycle. 
                  Compared to industry standard alternatives, this is a <span className="font-bold">42% reduction</span> in carbon emissions.
                </p>
              </div>
            </div>
          </div>

          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mt-24 pt-16 border-t border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Similar Products</h2>
              <p className="text-slate-500 font-medium mt-1">Sustainable alternatives curated for you.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/products" 
                className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="hidden sm:flex gap-2">
                <button 
                  onClick={() => scroll('left')}
                  className="p-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="p-3 rounded-full bg-slate-900 text-white hover:bg-emerald-600 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto pb-8 gap-6 no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {relatedProducts.map(rp => (
              <Link 
                to={`/products/${rp.id}`} 
                key={rp.id}
                className="min-w-[280px] max-w-[280px] group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col snap-start"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={rp.image} 
                    alt={rp.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLikeProduct(rp.id);
                      }}
                      className={`p-3 rounded-2xl backdrop-blur-md border transition-all active:scale-90 ${
                        user?.likedProducts?.includes(rp.id)
                          ? 'bg-red-500 border-red-500 text-white shadow-lg'
                          : 'bg-white/80 border-white/20 text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${user?.likedProducts?.includes(rp.id) ? 'fill-current' : ''}`} />
                    </button>
                    <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Score: {rp.carbonScore}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black">
                      <span>4.3</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rp.brand}</span>
                  </div>
                  <h3 className="text-md font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">{rp.name}</h3>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-lg font-black text-slate-900">${(rp.price * 0.85).toFixed(2)}</span>
                      <span className="text-xs text-slate-400 line-through">${rp.price.toFixed(2)}</span>
                      <span className="text-xs font-black text-emerald-600">15% OFF</span>
                    </div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">with EcoPoints offer</p>
                  </div>
                </div>
              </Link>
            ))}
            {relatedProducts.length === 0 && (
              <div className="w-full py-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic">No other products in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      {/* Image Intelligence Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-10">
          <div 
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
            onClick={() => setIsImageModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col lg:flex-row h-full max-h-[90vh]">
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-8 right-8 z-10 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="lg:w-2/3 bg-slate-900 flex items-center justify-center p-12 relative overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] z-10"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
              </div>
            </div>
            
            <div className="lg:w-1/3 p-10 overflow-y-auto bg-white">
              <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-500 rounded-xl">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Price Intelligence</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Powered by <span className="text-emerald-600">Flash.co</span>
                      </p>
                    </div>
                  </div>
                <p className="text-slate-500 font-medium text-sm mb-8">
                  We've analyzed the market for <span className="text-slate-900 font-bold">{product.name}</span>. Here's how our price compares to other major retailers.
                </p>
                
                {product.priceComparison && (
                  <PriceComparison comparisons={product.priceComparison} />
                )}
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sustainability Highlights</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Eco Score</span>
                      <span className="text-sm font-black text-emerald-600">{product.carbonScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Carbon Impact</span>
                      <span className="text-sm font-black text-slate-900">{product.carbonData.total}kg CO2e</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    addToCart(product.id);
                    setIsImageModalOpen(false);
                  }}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                >
                  Add to Cart - ₹{Math.round(product.price * 83).toLocaleString()}
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
  );
};

export default ProductDetail;
