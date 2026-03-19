
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Menu, X, LogOut, LayoutDashboard, ShieldCheck, 
  BarChart3, User as UserIcon, Leaf, ChevronDown, 
  Mail, Calendar, BadgeCheck, ShoppingBag, ShoppingCart, MessageCircle, ArrowRight, Trash2, Plus, Minus, Activity, Coins, Zap, QrCode, Camera, Upload, History as HistoryIcon, Heart, Info, Sparkles
} from 'lucide-react';
import { getProducts, createOrder } from '../services/productService';
import { Product, Reward } from '../types';
import { getToken } from '../src/services/authService';
import { GoogleGenAI } from "@google/genai";
import PriceDetails from './PriceDetails.tsx';
import BankOffers from './BankOffers.tsx';
import PaymentModal from './PaymentModal.tsx';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, addToCart, removeFromCart, addPoints, showNotification, notification, hideNotification, isCartOpen, setIsCartOpen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string, product?: Product}[]>([]);
  const [cartProducts, setCartProducts] = useState<(Product & { quantity: number })[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [isGiftCardsOpen, setIsGiftCardsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatCameraActive, setIsChatCameraActive] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const chatVideoRef = useRef<HTMLVideoElement>(null);
  const chatCanvasRef = useRef<HTMLCanvasElement>(null);

  const startChatCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (chatVideoRef.current) {
        chatVideoRef.current.srcObject = stream;
        setIsChatCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      showNotification("Could not access camera.", "error");
    }
  };

  const stopChatCamera = () => {
    if (chatVideoRef.current && chatVideoRef.current.srcObject) {
      const stream = chatVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      chatVideoRef.current.srcObject = null;
    }
    setIsChatCameraActive(false);
  };

  const captureChatPhoto = () => {
    if (chatVideoRef.current && chatCanvasRef.current) {
      const video = chatVideoRef.current;
      const canvas = chatCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        stopChatCamera();
        analyzeChatImage(dataUrl, 'image/jpeg');
      }
    }
  };

  const analyzeChatImage = async (base64Image: string, mimeType: string) => {
    setIsAnalyzing(true);
    setChatHistory(prev => [...prev, { role: 'user', text: "Captured an image for analysis" }]);

    try {
      const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta.env.VITE_GEMINI_API_KEY || "");
      
      if (!apiKey || apiKey === "") {
        throw new Error("MISSING_API_KEY");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: mimeType } },
            { text: "Analyze this image and provide helpful information about it. If it's a product, identify it and provide estimated sustainability details or carbon footprint. If it's something else, describe what you see and offer any relevant eco-friendly advice or interesting facts. Keep the response concise, professional, and friendly." }
          ]
        }
      });

      setChatHistory(prev => [
        ...prev, 
        { role: 'bot', text: response.text || "I couldn't identify the product details from this image. Could you try a clearer photo?" }
      ]);
    } catch (aiErr: any) {
      console.error("AI Analysis error:", aiErr);
      const message = aiErr.message === "MISSING_API_KEY"
        ? "Configuration error: GEMINI_API_KEY is missing. Please add it to your .env file for local development."
        : "Sorry, I encountered an error while analyzing the image. Please try again.";
      setChatHistory(prev => [...prev, { role: 'bot', text: message }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchCoupons = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch('/api/coupons', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) setCoupons(await response.json());
    } catch (e) { console.error(e); }
    setIsLoadingData(false);
  };

  const fetchGiftCards = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch('/api/gift-cards', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) setGiftCards(await response.json());
    } catch (e) { console.error(e); }
    setIsLoadingData(false);
  };

  const fetchNotifications = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) setNotifications(await response.json());
      // Mark as read
      fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
    } catch (e) { console.error(e); }
    setIsLoadingData(false);
  };
  const [appliedOfferDiscount, setAppliedOfferDiscount] = useState(0);
  const [appliedOfferId, setAppliedOfferId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isChatOpen && chatHistory.length === 0) {
      const loadWelcome = async () => {
        const allProducts = await getProducts();
        const featured = allProducts[0];
        if (featured) {
          setChatHistory([
            { role: 'bot', text: "Welcome to Eco Support! How can I help you today? Here's one of our top-rated sustainable products you might like:" },
            { role: 'bot', text: `Check out the ${featured.name}!`, product: featured }
          ]);
        } else {
          setChatHistory([
            { role: 'bot', text: "Welcome to Eco Support! How can I help you today?" }
          ]);
        }
      };
      loadWelcome();
    }
  }, [isChatOpen]);

  const cartCount = user?.cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    const fetchCartProducts = async () => {
      const products = await getProducts();
      setAllProducts(products);
      
      if (user?.cart && user.cart.length > 0) {
        const items = user.cart.map(cartItem => {
          const product = products.find(p => p.id === cartItem.productId);
          return product ? { ...product, quantity: cartItem.quantity } : null;
        }).filter(Boolean) as (Product & { quantity: number })[];
        setCartProducts(items);

        // Find recommendations for high emission products
        const highEmissionItems = items.filter(item => item.carbonScore < 50);
        if (highEmissionItems.length > 0) {
          const recs: Product[] = [];
          highEmissionItems.forEach(item => {
            const alternative = products.find(p => 
              p.category === item.category && 
              p.carbonScore >= 70 && 
              p.id !== item.id &&
              !user.cart?.some(ci => ci.productId === p.id)
            );
            if (alternative && !recs.some(r => r.id === alternative.id)) {
              recs.push(alternative);
            }
          });
          setRecommendations(recs);
        } else {
          setRecommendations([]);
        }
      } else {
        setCartProducts([]);
        setRecommendations([]);
      }
    };
    fetchCartProducts();
  }, [user?.cart]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setChatHistory(prev => [...prev, { role: 'user', text: `Uploaded an image: ${file.name}` }]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        try {
          const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta.env.VITE_GEMINI_API_KEY || "");
          
          if (!apiKey || apiKey === "") {
            throw new Error("API key not found.");
          }
          
          const ai = new GoogleGenAI({ apiKey });
          
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                { text: "Analyze this image and provide helpful information about it. If it's a product, identify it and provide estimated sustainability details or carbon footprint. If it's something else, describe what you see and offer any relevant eco-friendly advice or interesting facts. Keep the response concise, professional, and friendly." }
              ]
            }
          });

          setChatHistory(prev => [
            ...prev, 
            { role: 'bot', text: response.text || "I couldn't identify the product details from this image. Could you try a clearer photo?" }
          ]);
        } catch (aiErr: any) {
          console.error("AI Analysis error:", aiErr);
          const message = aiErr.message?.includes('API key') 
            ? "Configuration error: API key not found. Please ensure GEMINI_API_KEY is set."
            : "Sorry, I encountered an error while analyzing the image. Please try again.";
          setChatHistory(prev => [...prev, { role: 'bot', text: message }]);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error("File handling error:", err);
      setIsAnalyzing(false);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isAnalyzing) return;
    
    const userMessage = chatMessage.trim();
    const newHistory = [...chatHistory, { role: 'user' as const, text: userMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    setIsAnalyzing(true);
    
    try {
      const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta.env.VITE_GEMINI_API_KEY || "");
      
      if (!apiKey || apiKey === "") {
        console.error("Gemini API Key is missing in handleSendMessage");
        throw new Error("MISSING_API_KEY");
      }
      
      // Masked log for debugging
      console.log(`Using API Key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);
      
      const ai = new GoogleGenAI({ apiKey });
      
      // Gemini requires conversation to start with 'user' role and alternate.
      // We skip the initial bot greeting (index 0) to ensure the first message is 'user'.
      const contents = [
        ...chatHistory.slice(1).map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction: "You are EcoSupport, an expert sustainability assistant for EcoBazaar. Your goal is to help users understand environmental impact, carbon footprints, and sustainable shopping. Be helpful, concise, and professional. If asked about specific products, refer to their eco-scores and carbon footprints. If you don't know something, be honest but try to provide general eco-friendly advice.",
        }
      });

      setChatHistory(prev => [
        ...prev, 
        { role: 'bot', text: response.text || "I'm sorry, I couldn't process that request. How else can I help you with sustainability?" }
      ]);
    } catch (err: any) {
      console.error("Chat error details:", err);
      let errorMessage = "Sorry, I'm having trouble connecting to my eco-brain right now. Please try again in a moment.";
      
      if (err.message === "MISSING_API_KEY") {
        errorMessage = "Configuration error: GEMINI_API_KEY is missing. Please check your settings.";
      } else if (err.message && err.message.includes("API key not valid")) {
        errorMessage = "The provided API key is invalid. Please check your .env file.";
      } else if (err.message) {
        // Log the specific error for debugging
        console.error("Specific AI error:", err.message);
      }
      
      setChatHistory(prev => [
        ...prev, 
        { role: 'bot', text: errorMessage }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCheckout = () => {
    if (cartProducts.length === 0) return;
    setIsPaymentModalOpen(true);
    setIsCartOpen(false);
  };

  const confirmOrder = async (status: string = 'pending') => {
    const subtotal = cartProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const platformFee = 0.10;
    const deliveryCharges = 0;
    const discount = subtotal * 0.15;
    const totalAmount = subtotal + platformFee + deliveryCharges - discount - appliedOfferDiscount;
    
    try {
      await createOrder({
        totalAmount: totalAmount,
        discountAmount: discount + appliedOfferDiscount,
        platformFee: platformFee,
        status,
        items: cartProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          price: p.price * 83,
          name: p.name,
          image: p.image
        }))
      });

      const totalPoints = cartProducts.reduce((acc, item) => acc + (item.pointsValue * item.quantity), 0);
      addPoints(totalPoints);
      
      // Clear cart
      cartProducts.forEach(item => removeFromCart(item.id));
      
      setIsCartOpen(false);
      setIsPaymentModalOpen(false);
      showNotification(`Order successful! You earned ${totalPoints} Green Points.`, 'success');
      navigate('/history');
    } catch (error: any) {
      showNotification(error.message || 'Failed to place order', 'error');
    }
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">EcoBazaar<span className="text-emerald-600">.</span></span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors">Dashboard</Link>
                <Link to="/products" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors">Marketplace</Link>
                <Link to="/scanner" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors">Scanner</Link>
                <Link to="/circular" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors">Second Life</Link>
                <Link to="/rewards" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors">Rewards</Link>
                <Link to="/history" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors">Eco History</Link>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-400 hover:text-emerald-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 transition-all active:scale-95"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden lg:block">{user?.name}</span>
                  <div className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-100">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-black text-amber-700">{user?.greenPoints || 0}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-5 bg-slate-900 text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-xl font-bold uppercase shadow-inner">
                          {user?.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg leading-tight">{user?.name}</h4>
                          <p className="text-emerald-400 text-xs font-bold mt-0.5">{user?.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <UserIcon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>My Profile</span>
                      </button>
                      
                      <button
                        onClick={() => { navigate('/rewards'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <Zap className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>GreenPoints Zone</span>
                      </button>

                      <button
                        onClick={() => { navigate('/offers'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <BadgeCheck className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>EcoBazaar Plus</span>
                      </button>

                      <div className="h-px bg-gray-100 my-1 mx-4"></div>

                      <button
                        onClick={() => { navigate('/orders'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <ShoppingBag className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Orders</span>
                      </button>

                      <button
                        onClick={() => { navigate('/history'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <HistoryIcon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Eco History</span>
                      </button>

                      <button
                        onClick={() => { navigate('/products'); setIsProfileOpen(false); }}
                        className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <div className="flex items-center gap-4">
                          <Heart className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                          <span>Wishlist</span>
                        </div>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded-md">{user?.likedProducts?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => { setIsCouponsOpen(true); setIsProfileOpen(false); fetchCoupons(); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <Coins className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Coupons</span>
                      </button>

                      <button
                        onClick={() => { setIsGiftCardsOpen(true); setIsProfileOpen(false); fetchGiftCards(); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <QrCode className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Gift Cards</span>
                      </button>

                      <button
                        onClick={() => { setIsNotificationsOpen(true); setIsProfileOpen(false); fetchNotifications(); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <Activity className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Notifications</span>
                      </button>

                      <div className="h-px bg-gray-100 my-1 mx-4"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-all font-bold group"
                      >
                        <LogOut className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Sign in</Link>
                <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-white border-t animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl mb-4 mt-2">
                   <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{user?.name}</h4>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">Dashboard</Link>
                {user?.role === UserRole.ADMIN && (
                  <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-emerald-600 bg-emerald-50">Admin Dashboard</Link>
                )}
                <Link to="/products" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">Marketplace</Link>
                <Link to="/rewards" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  Rewards <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full border border-amber-100">{user?.greenPoints || 0} pts</span>
                </Link>
                <Link to="/history" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  Eco History
                </Link>
                <Link to="/orders" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  Orders
                </Link>
                {user?.role === UserRole.ADMIN && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">Admin Panel</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-3 rounded-xl text-base font-bold text-red-600 hover:bg-red-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">Sign In</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-emerald-600 hover:bg-emerald-50">Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}
      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Your Cart</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                {cartProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Your cart is empty</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
                      Looks like you haven't added any sustainable products to your cart yet.
                    </p>
                    <button 
                      onClick={() => {setIsCartOpen(false); navigate('/products');}}
                      className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cartProducts.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4 group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200`;
                                }}
                              />
                            </div>
                            <div className="flex-grow flex flex-col">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.brand}</p>
                                  <h4 className="font-black text-slate-900 leading-tight">{item.name}</h4>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Zap className="w-2.5 h-2.5 text-emerald-500" />
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Best Price Verified</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                                  <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-1 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-emerald-600"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-sm font-black text-slate-700 min-w-[1.5rem] text-center">{item.quantity}</span>
                                  <button 
                                    onClick={() => addToCart(item.id)}
                                    className="p-1 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-emerald-600"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="font-black text-slate-900">₹{Math.round(item.price * 83 * item.quantity).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {item.carbonScore < 50 && (
                            <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                              <Info className="w-3 h-3 text-amber-600" />
                              <p className="text-[9px] font-bold text-amber-700">High emission product. Consider a greener alternative below.</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {recommendations.length > 0 && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl text-white shadow-xl shadow-emerald-900/20">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
                          <h4 className="text-sm font-black uppercase tracking-[0.15em]">AI Sustainability Swap Coach</h4>
                        </div>
                        <p className="text-xs font-medium text-emerald-100 mb-6 leading-relaxed">
                          I've found some greener alternatives for items in your cart. Switching could save up to <span className="font-black text-white">12.4kg of CO2</span> and earn you <span className="font-black text-white">150 extra Green Points</span>!
                        </p>
                        <div className="space-y-4">
                          {recommendations.map(rec => (
                            <div key={rec.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 group hover:bg-white/20 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0">
                                  <img 
                                    src={rec.image} 
                                    alt={rec.name} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200`;
                                    }}
                                  />
                                </div>
                                <div className="flex-grow">
                                  <h5 className="text-xs font-black line-clamp-1">{rec.name}</h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/30 rounded text-[8px] font-black uppercase tracking-widest">
                                      <Leaf className="w-2 h-2" />
                                      <span>Eco Score: {rec.carbonScore}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-200">₹{Math.round(rec.price * 83).toLocaleString()}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => {
                                    addToCart(rec.id, 1);
                                    showNotification(`Swapped for ${rec.name}!`, 'success');
                                  }}
                                  className="p-2 bg-white text-emerald-700 rounded-lg hover:scale-110 transition-transform shadow-lg"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(() => {
                      const subtotal = cartProducts.reduce((acc, item) => acc + (Math.round(item.price * 83) * item.quantity), 0);
                      const platformFee = 8;
                      const deliveryCharges = 0;
                      const discount = subtotal * 0.15;
                      const totalAmount = subtotal + platformFee + deliveryCharges - discount - appliedOfferDiscount;
                      
                      return (
                        <>
                          <BankOffers 
                            totalAmount={totalAmount + appliedOfferDiscount} 
                            appliedOfferId={appliedOfferId}
                            onApply={(discount) => {
                              if (appliedOfferDiscount === discount) {
                                setAppliedOfferDiscount(0);
                                setAppliedOfferId(null);
                              } else {
                                setAppliedOfferDiscount(discount);
                                setAppliedOfferId(discount === 42 ? 1 : 4); // Simple logic for demo
                              }
                            }}
                          />

                          <PriceDetails 
                            mrp={subtotal}
                            platformFee={platformFee}
                            deliveryCharges={deliveryCharges}
                            discount={discount + appliedOfferDiscount}
                            totalAmount={totalAmount}
                          />

                          <div className="pt-8 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-bold">Total Amount</span>
                              <span className="text-2xl font-black text-slate-900">
                                ₹{Math.round(totalAmount).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center bg-emerald-50 py-2 rounded-lg">
                              Free eco-friendly shipping included
                            </p>
                            <button 
                              onClick={handleCheckout}
                              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                            >
                              Checkout Now
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={confirmOrder}
        totalAmount={(() => {
          const subtotal = cartProducts.reduce((acc, item) => acc + (Math.round(item.price * 83) * item.quantity), 0);
          const platformFee = 8;
          const deliveryCharges = 0;
          const discount = subtotal * 0.15;
          return subtotal + platformFee + deliveryCharges - discount - appliedOfferDiscount;
        })()}
        itemsCount={cartProducts.reduce((acc, item) => acc + item.quantity, 0)}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-[300] animate-in slide-in-from-right duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 ${
            notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
            notification.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
            'bg-slate-900 border-slate-800 text-white'
          }`}>
            {notification.type === 'success' ? <BadgeCheck className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
            <span className="font-bold text-sm">{notification.message}</span>
            <button onClick={hideNotification} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Widget */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-[100]">
          {isChatOpen ? (
            <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-bold text-sm">Eco Support</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
                {isChatCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-4">
                    <video 
                      ref={chatVideoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <button 
                        onClick={stopChatCamera}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={captureChatPhoto}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl"
                      >
                        <div className="w-8 h-8 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                        </div>
                      </button>
                    </div>
                    <canvas ref={chatCanvasRef} className="hidden" />
                  </div>
                ) : null}
                {isAnalyzing && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 text-xs font-bold text-emerald-600 flex items-center gap-2">
                      <Zap className="w-3 h-3 animate-bounce" />
                      EcoSupport is thinking...
                    </div>
                  </div>
                )}
                {chatHistory.length === 0 && !isAnalyzing && (
                  <div className="text-center py-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">How can we help you today?</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-500/20' 
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.product && (
                      <div className="mt-2 w-full max-w-[85%] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="aspect-video w-full bg-slate-50">
                          <img 
                            src={msg.product.image} 
                            alt={msg.product.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1542601906690-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400`;
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{msg.product.brand}</p>
                          <h5 className="text-xs font-black text-slate-900 truncate">{msg.product.name}</h5>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-black text-slate-900">₹{Math.round(msg.product.price * 83).toLocaleString()}</span>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-full">
                              <Leaf className="w-2 h-2 text-emerald-500" />
                              <span className="text-[8px] font-black text-emerald-700">{msg.product.carbonScore}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => { addToCart(msg.product!.id); showNotification(`Added ${msg.product!.name} to cart!`, 'success'); }}
                            className="w-full mt-2 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={startChatCamera}
                    className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    title="Take Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    title="Upload Image"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your query..."
                    className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                  <button type="submit" className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 shadow-emerald-500/40"
            >
              <MessageCircle className="w-7 h-7" />
            </button>
          )}
        </div>
      )}
      {/* Coupons Modal */}
      {isCouponsOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCouponsOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Your Coupons</h3>
              </div>
              <button onClick={() => setIsCouponsOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {isLoadingData ? (
                <div className="py-12 text-center text-slate-400 font-bold">Loading coupons...</div>
              ) : coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <div key={coupon.id} className="p-6 bg-white border-2 border-dashed border-amber-200 rounded-3xl relative overflow-hidden group hover:border-amber-400 transition-all">
                    <div className="absolute -right-4 -top-4 w-12 h-12 bg-amber-50 rounded-full"></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${Math.round(coupon.discount_value * 83).toLocaleString()} OFF`}
                        </p>
                        <h4 className="text-lg font-black text-slate-900">{coupon.code}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Expires: {new Date(coupon.expiry_date).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.code);
                          showNotification('Coupon code copied!', 'success');
                        }}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-500 font-bold">No active coupons found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gift Cards Modal */}
      {isGiftCardsOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGiftCardsOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <QrCode className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Your Gift Cards</h3>
              </div>
              <button onClick={() => setIsGiftCardsOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {isLoadingData ? (
                <div className="py-12 text-center text-slate-400 font-bold">Loading gift cards...</div>
              ) : giftCards.length > 0 ? (
                giftCards.map((card) => (
                  <div key={card.id} className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                          <Leaf className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-2xl font-black text-emerald-400">₹{Math.round(card.balance * 83).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Number</p>
                      <h4 className="text-lg font-mono tracking-widest">{card.card_number}</h4>
                      <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid Thru: {new Date(card.expiry_date).toLocaleDateString()}</span>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-500 font-bold">No gift cards found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Notifications</h3>
              </div>
              <button onClick={() => setIsNotificationsOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {isLoadingData ? (
                <div className="py-12 text-center text-slate-400 font-bold">Loading notifications...</div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-6 rounded-3xl border transition-all ${notif.is_read ? 'bg-white border-slate-100' : 'bg-emerald-50/50 border-emerald-100 shadow-sm'}`}>
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        notif.type === 'reward' ? 'bg-amber-100 text-amber-600' : 
                        notif.type === 'order' ? 'bg-blue-100 text-blue-600' : 
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {notif.type === 'reward' ? <Zap className="w-5 h-5" /> : 
                         notif.type === 'order' ? <ShoppingBag className="w-5 h-5" /> : 
                         <Info className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{notif.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-500 font-bold">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
