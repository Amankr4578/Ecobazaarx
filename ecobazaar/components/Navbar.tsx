
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Menu, X, LogOut, LayoutDashboard, ShieldCheck, 
  BarChart3, User as UserIcon, Leaf, ChevronDown, 
  Mail, Calendar, BadgeCheck, ShoppingBag, ShoppingCart, MessageCircle, ArrowRight, Trash2, Plus, Minus, Activity, Coins, Zap, QrCode, Camera, History as HistoryIcon, Heart
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { getProducts, createOrder } from '../services/productService';
import { Product } from '../types';
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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerSource, setScannerSource] = useState<'cart' | 'chat' | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [appliedOfferDiscount, setAppliedOfferDiscount] = useState(0);
  const [appliedOfferId, setAppliedOfferId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
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
      if (user?.cart && user.cart.length > 0) {
        const allProducts = await getProducts();
        const items = user.cart.map(cartItem => {
          const product = allProducts.find(p => p.id === cartItem.productId);
          return product ? { ...product, quantity: cartItem.quantity } : null;
        }).filter(Boolean) as (Product & { quantity: number })[];
        setCartProducts(items);
      } else {
        setCartProducts([]);
      }
    };
    fetchCartProducts();
  }, [user?.cart]);

  useEffect(() => {
    if (isScannerOpen) {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            async (decodedText) => {
              // Handle scanned QR code
              // Assuming QR code contains product ID
              const allProducts = await getProducts();
              const product = allProducts.find(p => p.id === decodedText);
              
              if (product) {
                setScannedProduct(product);
                
                // If scanned from chat, add to chat history
                if (scannerSource === 'chat') {
                  setChatHistory(prev => [
                    ...prev, 
                    { role: 'user', text: `Scanned: ${product.name}` },
                    { role: 'bot', text: `I've found this product for you! It has a Carbon Score of ${product.carbonScore}/100.`, product }
                  ]);
                }

                // Auto-add to cart after a short delay to show details
                setTimeout(() => {
                  addToCart(product.id);
                  showNotification(`Added ${product.name} to cart!`, 'success');
                  setIsScannerOpen(false);
                  setScannedProduct(null);
                  setScannerSource(null);
                  if (scannerSource === 'cart') {
                    setIsCartOpen(true);
                  }
                }, 2000);
              } else {
                setScannerError("Product not found. Please try another QR code.");
                setTimeout(() => setScannerError(null), 3000);
              }
            },
            (errorMessage) => {
              // Ignore common errors
            }
          );
        } catch (err) {
          console.error("Scanner error:", err);
          setScannerError("Could not start camera. Please ensure permissions are granted.");
        }
      };
      
      startScanner();
    } else {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current = null;
        }).catch(err => console.error("Stop scanner error:", err));
      }
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Cleanup scanner error:", err));
      }
    };
  }, [isScannerOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setChatHistory(prev => [...prev, { role: 'user', text: `Uploaded an image: ${file.name}` }]);

    try {
      // 1. Try QR scanning first (fastest)
      const html5QrCode = new Html5Qrcode("reader-hidden");
      try {
        const decodedText = await html5QrCode.scanFile(file, true);
        const allProducts = await getProducts();
        const product = allProducts.find(p => p.id === decodedText);
        
        if (product) {
          setChatHistory(prev => [
            ...prev, 
            { role: 'bot', text: `I've identified this product from the QR code! It has a Carbon Score of ${product.carbonScore}/100.`, product }
          ]);
          setIsAnalyzing(false);
          return;
        }
      } catch (qrErr) {
        console.log("No QR code found in image, trying AI analysis...");
      } finally {
        await html5QrCode.clear();
      }

      // 2. Fallback to Gemini AI analysis
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
          
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                { text: "Identify this product and provide its estimated carbon footprint details. If you recognize it as a specific product from our catalog (EcoBazaar), mention its name and carbon score. Otherwise, give a general estimate of its environmental impact. Keep the response concise and helpful." }
              ]
            }
          });

          setChatHistory(prev => [
            ...prev, 
            { role: 'bot', text: response.text || "I couldn't identify the product details from this image. Could you try a clearer photo or scan the QR code?" }
          ]);
        } catch (aiErr) {
          console.error("AI Analysis error:", aiErr);
          setChatHistory(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error while analyzing the image. Please try again." }]);
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user' as const, text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    
    // Simple bot response
    setTimeout(() => {
      setChatHistory([...newHistory, { role: 'bot' as const, text: "Thanks for your query! Our eco-experts will get back to you shortly." }]);
    }, 1000);
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
  };

  const confirmOrder = async () => {
    const subtotalINR = cartProducts.reduce((acc, item) => acc + (item.price * 83 * item.quantity), 0);
    const platformFeeINR = 7;
    const deliveryChargesINR = 0;
    const discountINR = Math.round(subtotalINR * 0.15);
    const totalAmountINR = subtotalINR + platformFeeINR + deliveryChargesINR - discountINR - appliedOfferDiscount;
    
    try {
      await createOrder({
        totalAmount: totalAmountINR,
        discountAmount: discountINR + appliedOfferDiscount,
        platformFee: platformFeeINR,
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
                <Link to="/rewards" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors">Rewards</Link>
                <Link to="/history" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors">History</Link>
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
                        onClick={() => { navigate('/history'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <ShoppingBag className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Orders</span>
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
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <Coins className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Coupons</span>
                      </button>

                      <button
                        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold group"
                      >
                        <QrCode className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span>Gift Cards</span>
                      </button>

                      <button
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
                  History
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
                  <button 
                    onClick={() => { setIsScannerOpen(true); setScannerSource('cart'); }}
                    className="ml-2 p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all flex items-center gap-2"
                    title="Scan QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Scan</span>
                  </button>
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
                        <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4 group">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.name}/200/200`;
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
                      ))}
                    </div>

                    {(() => {
                      const subtotalINR = cartProducts.reduce((acc, item) => acc + (item.price * 83 * item.quantity), 0);
                      const platformFeeINR = 7;
                      const deliveryChargesINR = 0;
                      const discountINR = Math.round(subtotalINR * 0.15);
                      const totalAmountINR = subtotalINR + platformFeeINR + deliveryChargesINR - discountINR - appliedOfferDiscount;
                      
                      return (
                        <>
                          <BankOffers 
                            totalAmount={totalAmountINR + appliedOfferDiscount} 
                            appliedOfferId={appliedOfferId}
                            onApply={(discount) => {
                              if (appliedOfferDiscount === discount) {
                                setAppliedOfferDiscount(0);
                                setAppliedOfferId(null);
                              } else {
                                setAppliedOfferDiscount(discount);
                                setAppliedOfferId(discount === 50 ? 1 : 4); // Simple logic for demo
                              }
                            }}
                          />

                          <PriceDetails 
                            mrp={subtotalINR}
                            platformFee={platformFeeINR}
                            deliveryCharges={deliveryChargesINR}
                            discount={discountINR + appliedOfferDiscount}
                            totalAmount={totalAmountINR}
                          />

                          <div className="pt-8 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-bold">Total Amount</span>
                              <span className="text-2xl font-black text-slate-900">
                                ₹{totalAmountINR.toLocaleString()}
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
          const subtotalINR = cartProducts.reduce((acc, item) => acc + (item.price * 83 * item.quantity), 0);
          const platformFeeINR = 7;
          const deliveryChargesINR = 0;
          const discountINR = Math.round(subtotalINR * 0.15);
          return subtotalINR + platformFeeINR + deliveryChargesINR - discountINR - appliedOfferDiscount;
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
                {isAnalyzing && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 text-xs font-bold text-emerald-600 flex items-center gap-2">
                      <Zap className="w-3 h-3 animate-bounce" />
                      Analyzing image...
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
                              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${msg.product!.name}/400/225`;
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{msg.product.brand}</p>
                          <h5 className="text-xs font-black text-slate-900 truncate">{msg.product.name}</h5>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-black text-slate-900">${msg.product.price.toFixed(2)}</span>
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
                <div id="reader-hidden" className="hidden"></div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    title="Upload Image"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsScannerOpen(true); setScannerSource('chat'); }}
                    className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    title="Scan Product"
                  >
                    <QrCode className="w-5 h-5" />
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
      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsScannerOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Camera className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Product Scanner</h3>
              </div>
              <button onClick={() => setIsScannerOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6">
              {scannedProduct ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl mb-4 border-4 border-white">
                      <img src={scannedProduct.image} alt={scannedProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{scannedProduct.brand}</p>
                    <h4 className="text-xl font-black text-slate-900 mb-2">{scannedProduct.name}</h4>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-emerald-100 shadow-sm">
                        <Leaf className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs font-black text-emerald-700">{scannedProduct.carbonScore}/100</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-amber-100 shadow-sm">
                        <Coins className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-black text-amber-700">{scannedProduct.pointsValue} pts</span>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mb-6">${scannedProduct.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 text-emerald-600 animate-pulse">
                      <BadgeCheck className="w-5 h-5" />
                      <span className="text-sm font-bold">Product Identified! Adding to cart...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="reader" className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center relative">
                  {!scannerError && (
                    <div className="absolute inset-0 pointer-events-none border-4 border-emerald-500/30 rounded-2xl">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg"></div>
                    </div>
                  )}
                  {scannerError && (
                    <div className="p-6 text-center">
                      <p className="text-red-500 font-bold text-sm">{scannerError}</p>
                      <button 
                        onClick={() => setIsScannerOpen(false)}
                        className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                      >
                        Close Scanner
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {!scannedProduct && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl">
                    <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">How it works</p>
                      <p className="text-[10px] text-emerald-700 font-medium leading-relaxed mt-1">
                        Point your camera at a product's QR code. EcoBazaar will automatically identify the product and add it to your cart.
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                    Secure & Private • Camera access required
                  </p>
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
