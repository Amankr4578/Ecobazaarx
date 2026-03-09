import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, ShieldCheck, Mail, Calendar, Award, 
  ShoppingBag, Heart, Settings, Camera, Save, LogOut,
  Phone, MapPin, Globe, Info, CreditCard, Bell, ChevronRight,
  X, Leaf, Recycle, Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../src/services/userService';
import { User } from '../types';

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
      console.log('Server response:', response);
      
      // Update local storage and app state with fresh user data
      console.log('Refreshing user data...');
      await refreshUser();
      console.log('User data refreshed.');

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
                            <p className="text-base font-black text-slate-900">$24.99</p>
                            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Payment Methods</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Notifications</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Security Privacy</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Help Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
