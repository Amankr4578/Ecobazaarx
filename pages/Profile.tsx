import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, ShieldCheck, Mail, Calendar, Award, 
  ShoppingBag, Heart, Settings, Camera, Save, LogOut,
  Phone, MapPin, Globe, Info, CreditCard, Bell, ChevronRight,
  X, Leaf, Recycle, Truck, Coins, QrCode, Activity, Zap, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../src/services/userService';
import { getProducts } from '../services/productService';
import { getToken } from '../src/services/authService';
import { User, Product } from '../types';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout, showNotification, refreshUser } = useAuth();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [isGiftCardsOpen, setIsGiftCardsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      if (user?.likedProducts && user.likedProducts.length > 0) {
        const allProducts = await getProducts();
        const liked = allProducts.filter(p => user.likedProducts?.includes(p.id));
        setLikedProducts(liked);
      } else {
        setLikedProducts([]);
      }
    };
    fetchLikedProducts();
  }, [user?.likedProducts]);

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
      fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
    } catch (e) { console.error(e); }
    setIsLoadingData(false);
  };
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    country: user?.country || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
    sustainabilityPreferences: user?.sustainabilityPreferences || {
      plasticFreePackaging: false,
      carbonNeutralShipping: false,
      localSourcingOnly: false
    }
  });

  // Fetch full profile on mount
  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      let parsedPrefs = user.sustainabilityPreferences;
      if (typeof parsedPrefs === 'string') {
        try {
          parsedPrefs = JSON.parse(parsedPrefs);
        } catch (e) {
          parsedPrefs = null;
        }
      }

      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        sustainabilityPreferences: parsedPrefs || {
          plasticFreePackaging: false,
          carbonNeutralShipping: false,
          localSourcingOnly: false
        }
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('handleUpdateProfile called. Current user state:', user);
    
    setLoading(true);
    try {
      console.log('Starting profile update with data:', formData);
      // Map camelCase to snake_case for the server
      const updateData = {
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        country: formData.country || null,
        bio: formData.bio || null,
        profile_image: formData.profileImage || null,
        sustainability_preferences: formData.sustainabilityPreferences || null
      };
      
      console.log('Sending to server:', updateData);
      const response = await updateProfile(updateData);
      console.log('Server response received successfully:', response);
      
      // Update local storage and app state with fresh user data
      console.log('Refreshing user data via refreshUser...');
      await refreshUser();
      console.log('User data refresh complete.');

      showNotification('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update catch block:', error);
      showNotification(error.message || 'Failed to update profile', 'error');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Profile Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[3rem] bg-emerald-50 p-1 shadow-2xl border border-emerald-100 overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover rounded-[2.8rem]" />
                ) : (
                  <div className="w-full h-full rounded-[2.8rem] bg-emerald-600 flex items-center justify-center text-white text-6xl font-black">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl hover:bg-slate-800 transition-all active:scale-90">
                <Camera className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                    {user.role}
                  </span>
                  <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                    Verified
                  </span>
                </div>
              </div>
              <p className="text-slate-500 font-medium text-lg max-w-2xl mb-6">
                {user.bio || "Sustainability enthusiast and eco-warrior. Helping the planet one purchase at a time."}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Green Points</span>
                  <span className="text-2xl font-black text-emerald-600">{user.greenPoints || 0}</span>
                </div>
                <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</span>
                  <span className="text-2xl font-black text-slate-900">{user.cart?.length || 0}</span>
                </div>
                <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wishlist</span>
                  <span className="text-2xl font-black text-slate-900">{user.likedProducts?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              {isEditing && (
                <button 
                  onClick={() => handleUpdateProfile()}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isEditing 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'
                }`}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
              <button 
                onClick={logout}
                className="w-full py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            {isEditing ? (
              <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 animate-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Update Personal Details</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Country</label>
                      <input 
                        type="text" 
                        value={formData.country}
                        onChange={e => setFormData({...formData, country: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Street Address</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                      <input 
                        type="text" 
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State / Province</label>
                      <input 
                        type="text" 
                        value={formData.state}
                        onChange={e => setFormData({...formData, state: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Zip Code</label>
                      <input 
                        type="text" 
                        value={formData.zipCode}
                        onChange={e => setFormData({...formData, zipCode: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bio</label>
                    <textarea 
                      rows={4}
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100">
                    <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-emerald-600" />
                      Sustainability Preferences
                    </h4>
                    <div className="space-y-4">
                      {[
                        { key: 'plasticFreePackaging', label: 'Plastic-free packaging only', icon: Recycle },
                        { key: 'carbonNeutralShipping', label: 'Carbon-neutral shipping only', icon: Truck },
                        { key: 'localSourcingOnly', label: 'Local sourcing only', icon: Globe }
                      ].map((pref) => (
                        <label key={pref.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-all">
                          <div className="flex items-center gap-3">
                            <pref.icon className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-bold text-slate-700">{pref.label}</span>
                          </div>
                          <input 
                            type="checkbox"
                            checked={!!(formData.sustainabilityPreferences as any)?.[pref.key]}
                            onChange={(e) => {
                              const currentPrefs = (formData.sustainabilityPreferences as any) || {
                                plasticFreePackaging: false,
                                carbonNeutralShipping: false,
                                localSourcingOnly: false
                              };
                              setFormData({
                                ...formData,
                                sustainabilityPreferences: {
                                  ...currentPrefs,
                                  [pref.key]: e.target.checked
                                }
                              });
                            }}
                            className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Details
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 group hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-blue-50 rounded-2xl">
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Personal Info</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</span>
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                        <span className="text-sm font-bold text-slate-900">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                        <span className="text-sm font-bold text-slate-900">{user.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 group hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-emerald-50 rounded-2xl">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Address</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</span>
                        <span className="text-sm font-bold text-slate-900">{user.city || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</span>
                        <span className="text-sm font-bold text-slate-900">{user.state || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Country</span>
                        <span className="text-sm font-bold text-slate-900">{user.country || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Address Card */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-50 rounded-2xl">
                        <Globe className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Shipping Details</h3>
                    </div>
                    <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Manage Addresses</button>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-900 mb-2">{user.name}</p>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {user.address ? (
                        <>
                          {user.address}<br />
                          {user.city}, {user.state} {user.zipCode}<br />
                          {user.country}
                        </>
                      ) : (
                        "No primary address set. Add one to speed up checkout."
                      )}
                    </p>
                  </div>
                </div>

                {/* Sustainability Preferences Display */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                      <Leaf className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Sustainability Preferences</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'plasticFreePackaging', label: 'Plastic-Free', icon: Recycle },
                      { key: 'carbonNeutralShipping', label: 'Carbon-Neutral', icon: Truck },
                      { key: 'localSourcingOnly', label: 'Local Sourcing', icon: Globe }
                    ].map((pref) => {
                      const prefs = typeof user.sustainabilityPreferences === 'string' 
                        ? JSON.parse(user.sustainabilityPreferences) 
                        : user.sustainabilityPreferences;
                      const isActive = prefs?.[pref.key as keyof typeof prefs];
                      
                      return (
                        <div 
                          key={pref.key} 
                          className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                            isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50'
                          }`}
                        >
                          <pref.icon className="w-6 h-6" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-center">{pref.label}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            isActive
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-slate-300'
                          }`}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">Recent Activity</h3>
                    <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="p-10">
                    <div className="space-y-8">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-6 group cursor-pointer">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Purchased Eco-Friendly Bamboo Set</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">2 days ago • +15 Green Points</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-slate-900">₹{Math.round(24.99 * 83).toLocaleString()}</p>
                            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Liked Products</h3>
                  <Link to="/products" className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline">Explore More</Link>
                </div>
                
                {likedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {likedProducts.map(product => (
                      <Link 
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="group bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="aspect-square overflow-hidden relative">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 right-4 z-10">
                            <div className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                              <Heart className="w-4 h-4 text-red-500 fill-current" />
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{product.brand}</p>
                          <h4 className="text-lg font-black text-slate-900 mb-2 truncate">{product.name}</h4>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-black text-slate-900">₹{Math.round(product.price * 0.85 * 83).toLocaleString()}</span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                              <Coins className="w-3 h-3 text-amber-500" />
                              <span className="text-[10px] font-black text-amber-700">{product.pointsValue} pts</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Heart className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-500 font-bold text-lg mb-2">Your wishlist is empty</p>
                    <p className="text-slate-400 text-sm mb-8">Start liking products to save them for later!</p>
                    <Link to="/products" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10">
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-10 flex items-center gap-3">
                  <Award className="w-6 h-6 text-emerald-400" />
                  Eco Impact
                </h3>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carbon Saved</p>
                    <p className="text-4xl font-black text-emerald-400">12.4 kg</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[65%] h-full bg-emerald-400"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eco Rank</p>
                    <p className="text-4xl font-black text-emerald-400">Top 15%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Badges Earned</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Quick Links</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => { setIsNotificationsOpen(true); fetchNotifications(); }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Notifications</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button 
                  onClick={() => { setIsCouponsOpen(true); fetchCoupons(); }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Coupons</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button 
                  onClick={() => { setIsGiftCardsOpen(true); fetchGiftCards(); }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Gift Cards</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default Profile;
