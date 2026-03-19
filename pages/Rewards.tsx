
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Reward } from '../types';
import { getRewards } from '../services/rewardService';
import { 
  Coins, Gift, Ticket, ArrowRight, CheckCircle2, 
  ShoppingBag, Sparkles, LayoutDashboard, Tag, 
  Clock, Eye, Heart, TreeDeciduous, Users, 
  Globe, Zap, Target, RefreshCw,
  History, MapPin, ShieldCheck, Award, Calendar, Camera, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import VirtualForest from '../components/VirtualForest';

const COMMUNITY_GOALS = [
  {
    id: 'cg1',
    title: 'Plant 10,000 Real Trees',
    description: 'We are partnering with OneTreePlanted to restore forests in the Amazon.',
    currentPoints: 845000,
    targetPoints: 1000000,
    icon: TreeDeciduous,
    color: 'emerald',
    details: {
      partner: 'OneTreePlanted',
      location: 'Amazon Basin, Brazil',
      impact: 'Restoring 50 hectares of degraded rainforest, providing habitat for endangered species.',
      timeline: 'March 2026 - December 2026',
      howItWorks: 'Every 100 Green Points contributed funds the planting and maintenance of one native sapling.',
      milestones: [
        { label: 'Site Preparation', status: 'Completed' },
        { label: 'Sapling Sourcing', status: 'In Progress' },
        { label: 'Community Training', status: 'Pending' }
      ]
    }
  },
  {
    id: 'cg2',
    title: 'Ocean Plastic Cleanup',
    description: 'Funding robotic interceptors to remove plastic from major river mouths.',
    currentPoints: 420000,
    targetPoints: 500000,
    icon: Globe,
    color: 'blue',
    details: {
      partner: 'The Ocean Cleanup',
      location: 'Citarum River, Indonesia',
      impact: 'Preventing 500 tons of plastic from entering the ocean annually.',
      timeline: 'Ongoing Operation',
      howItWorks: 'Points fund the fuel, maintenance, and waste processing for Interceptor 004.',
      milestones: [
        { label: 'Interceptor Deployment', status: 'Completed' },
        { label: 'Waste Sorting Facility', status: 'Completed' },
        { label: 'Expansion to Tributaries', status: 'In Progress' }
      ]
    }
  },
  {
    id: 'cg3',
    title: 'Solar Power for Schools',
    description: 'Installing solar panels in rural schools to provide clean energy.',
    currentPoints: 150000,
    targetPoints: 300000,
    icon: Zap,
    color: 'amber',
    details: {
      partner: 'SolarAid',
      location: 'Mpika District, Zambia',
      impact: 'Providing reliable lighting and digital learning tools for 1,200 students.',
      timeline: 'June 2026 - August 2026',
      howItWorks: 'Points purchase solar arrays, battery storage, and energy-efficient LED lighting kits.',
      milestones: [
        { label: 'School Selection', status: 'Completed' },
        { label: 'Equipment Procurement', status: 'Pending' },
        { label: 'Installation Phase', status: 'Pending' }
      ]
    }
  }
];

const Rewards: React.FC = () => {
  const { user, redeemPoints, showNotification } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<typeof COMMUNITY_GOALS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'rewards' | 'impact' | 'community' | 'verification'>('rewards');

  useEffect(() => {
    const fetchRewards = async () => {
      const data = await getRewards();
      setRewards(data);
      setLoading(false);
    };
    fetchRewards();
  }, []);

  const handleRedeem = (reward: Reward) => {
    if (!user) {
      showNotification('Please login to redeem rewards', 'error');
      return;
    }

    if ((user.greenPoints || 0) < reward.pointsCost) {
      showNotification('Not enough Green Points', 'error');
      return;
    }

    redeemPoints(reward.pointsCost);
    setRedeemedCode(reward.discountCode);
    showNotification(`Successfully redeemed ${reward.title}!`, 'success');
  };

  const FIELD_CAPTURES = [
    {
      id: 'c1',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
      caption: 'Sapling #882 planted in Amazon Sector 4',
      timestamp: '2 hours ago',
      location: 'Amazon, Brazil',
      type: 'Tree Planting'
    },
    {
      id: 'c2',
      image: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&q=80&w=800',
      caption: 'Interceptor 004 clearing plastic from Citarum River',
      timestamp: '5 hours ago',
      location: 'Java, Indonesia',
      type: 'Ocean Cleanup'
    },
    {
      id: 'c3',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800',
      caption: 'Solar panels installed at Mpika Primary School',
      timestamp: 'Yesterday',
      location: 'Mpika, Zambia',
      type: 'Clean Energy'
    }
  ];

  const VERIFIED_PROJECTS = [
    {
      id: 'p1',
      name: 'Amazon Rainforest Restoration',
      partner: 'OneTreePlanted',
      location: 'Brazil (0.123° S, 60.123° W)',
      date: 'Feb 2026',
      trees: 5000,
      certificateUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=400',
      status: 'Completed'
    },
    {
      id: 'p2',
      name: 'Great Pacific Garbage Patch Cleanup',
      partner: 'The Ocean Cleanup',
      location: 'North Pacific Ocean',
      date: 'Jan 2026',
      impact: '2.5 Tons Plastic',
      certificateUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=400',
      status: 'Ongoing'
    }
  ];

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
                  to="/circular"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Second Life</span>
                </Link>
                <Link
                  to="/rewards"
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                >
                  <Coins className="w-4 h-4" />
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

            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 text-center">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-2">Your Balance</span>
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-6 h-6 text-amber-500" />
                <span className="text-3xl font-black text-slate-900">{user?.greenPoints || 0}</span>
              </div>
              <p className="text-[10px] font-bold text-amber-700 mt-3 uppercase tracking-tighter">Eco-Warrior Status</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-10 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'rewards' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Rewards
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'impact' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Your Forest
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'community' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Green Goals
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'verification' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Verification
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'rewards' && (
              <motion.div
                key="rewards-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Header Section */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Green Rewards</h1>
                  </div>
                  <p className="text-slate-500 font-medium">
                    Earn Green Points by purchasing low-emission products and redeem them for exclusive discounts.
                  </p>
                </div>

                {/* Rewards Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white rounded-[2.5rem] h-64 animate-pulse border border-slate-100"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {rewards.map((reward) => (
                      <motion.div 
                        key={reward.id}
                        whileHover={{ y: -5 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] shadow-lg p-8 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                          <Gift className="w-24 h-24 text-blue-500" />
                        </div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                              <Ticket className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">{reward.title}</h3>
                          </div>
                          
                          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            {reward.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-amber-500" />
                              <span className="text-lg font-black text-slate-900">{reward.pointsCost}</span>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Points</span>
                            </div>
                            
                            <button
                              onClick={() => handleRedeem(reward)}
                              disabled={!user || (user.greenPoints || 0) < reward.pointsCost}
                              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                !user || (user.greenPoints || 0) < reward.pointsCost
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95'
                              }`}
                            >
                              Redeem Now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* How it works */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-6">
                      <Eye className="w-8 h-8 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">1. Explore</h4>
                    <p className="text-sm text-slate-500 font-medium">Earn 5 points just for viewing product details and learning about their impact.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">2. Shop Green</h4>
                    <p className="text-sm text-slate-500 font-medium">Earn 50 points for every purchase of high Eco Score products.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">3. Engage</h4>
                    <p className="text-sm text-slate-500 font-medium">Earn 10 points for liking products and building your eco-wishlist.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-6">
                      <Gift className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">4. Get Rewards</h4>
                    <p className="text-sm text-slate-500 font-medium">Redeem your points for exclusive discounts and special offers.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'impact' && (
              <motion.div
                key="impact-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <TreeDeciduous className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Virtual Forest</h1>
                  </div>
                  <p className="text-slate-500 font-medium">
                    Watch your environmental impact grow. Every eco-conscious action helps expand your forest.
                  </p>
                </div>
                <VirtualForest />
              </motion.div>
            )}

            {activeTab === 'community' && (
              <motion.div
                key="community-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community Green Goals</h1>
                  </div>
                  <p className="text-slate-500 font-medium">
                    Join forces with other eco-warriors. Pool your Green Points to fund real-world environmental projects.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {COMMUNITY_GOALS.map((goal) => (
                    <div key={goal.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg p-10 overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                        <goal.icon className={`w-48 h-48 text-${goal.color}-600`} />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className={`p-4 bg-${goal.color}-50 rounded-2xl text-${goal.color}-600`}>
                              <goal.icon className="w-8 h-8" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-slate-900">{goal.title}</h3>
                              <p className="text-slate-500 font-medium">{goal.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-1">
                              <Target className="w-4 h-4 text-slate-400" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Goal Progress</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">
                              {Math.round((goal.currentPoints / goal.targetPoints) * 100)}%
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(goal.currentPoints / goal.targetPoints) * 100}%` }}
                              className={`h-full bg-${goal.color}-500 shadow-lg shadow-${goal.color}-500/20`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className={`text-${goal.color}-600`}>{goal.currentPoints.toLocaleString()} Points Pooled</span>
                            <span className="text-slate-400">Target: {goal.targetPoints.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center gap-4">
                          <button 
                            onClick={() => showNotification('Thank you for your contribution!', 'success')}
                            className={`px-8 py-4 bg-${goal.color}-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-${goal.color}-700 transition-all shadow-xl shadow-${goal.color}-500/20`}
                          >
                            Contribute Points
                          </button>
                          <button 
                            onClick={() => setSelectedProject(goal)}
                            className="px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                          >
                            View Project Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'verification' && (
              <motion.div
                key="verification-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verification & Transparency</h1>
                  </div>
                  <p className="text-slate-500 font-medium">
                    We believe in radical transparency. Here you can find proof of the real-world impact your Green Points have funded.
                  </p>
                </div>

                {/* Partners Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['OneTreePlanted', 'The Ocean Cleanup', 'SolarAid'].map((partner) => (
                    <div key={partner} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                        <Globe className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="font-black text-slate-900 mb-1">{partner}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Official Partner</p>
                      <a href="#" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">View Credentials</a>
                    </div>
                  ))}
                </div>

                {/* Live Field Evidence */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-500" />
                    Live Field Evidence
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FIELD_CAPTURES.map((capture) => (
                      <div key={capture.id} className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden group">
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                          <img src={capture.image} alt="Field Capture" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-4 left-4 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            Live Capture
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{capture.type}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{capture.timestamp}</span>
                          </div>
                          <p className="text-xs font-black text-slate-900 mb-3 leading-tight">{capture.caption}</p>
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{capture.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impact Certificates */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Recent Impact Certificates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {VERIFIED_PROJECTS.map((project) => (
                      <div key={project.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-48 h-64 md:h-auto bg-slate-100 relative group cursor-pointer">
                          <img src={project.certificateUrl} alt="Certificate" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">View PDF</span>
                          </div>
                        </div>
                        <div className="p-8 flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-black text-slate-900 mb-1">{project.name}</h4>
                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{project.partner}</p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full">
                              {project.status}
                            </span>
                          </div>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{project.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{project.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-900 text-sm font-black">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>{project.trees ? `${project.trees.toLocaleString()} Trees Planted` : project.impact}</span>
                            </div>
                          </div>
                          <button className="w-full py-3 bg-slate-50 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200">
                            Verify on Blockchain
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-400" />
                    Live Audit Trail
                  </h3>
                  <div className="space-y-6">
                    {[
                      { action: 'Donation Dispatched', amount: '₹44,820.00', to: 'OneTreePlanted', id: 'TXN-9823-A' },
                      { action: 'Goal Milestone Reached', amount: '500,000 Points', to: 'Ocean Cleanup', id: 'TXN-7712-B' },
                      { action: 'Impact Verified', amount: '250 Trees', to: 'Amazon Project', id: 'TXN-4451-C' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-white/10 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-black text-sm">{item.action}</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">To: {item.to}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-emerald-400">{item.amount}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Redeemed Code Modal */}
      <AnimatePresence>
        {redeemedCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Reward Redeemed!</h2>
              <p className="text-slate-500 font-medium mb-8">
                Use the code below at checkout to claim your discount.
              </p>
              
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 mb-8 relative group cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(redeemedCode);
                showNotification('Code copied to clipboard!');
              }}>
                <span className="text-3xl font-black text-slate-900 tracking-[0.2em]">{redeemedCode}</span>
                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Click to Copy</span>
                </div>
              </div>
              
              <button
                onClick={() => setRedeemedCode(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className={`p-8 bg-${selectedProject.color}-600 text-white relative`}>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <selectedProject.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{selectedProject.title}</h2>
                    <p className="text-white/80 font-bold uppercase text-[10px] tracking-widest">Project Details & Impact</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partner Organization</h4>
                      <p className="text-sm font-black text-slate-900">{selectedProject.details.partner}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</h4>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {selectedProject.details.location}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Timeline</h4>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {selectedProject.details.timeline}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">How it works</h4>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      {selectedProject.details.howItWorks}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Environmental Impact</h4>
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-900 leading-relaxed">
                      {selectedProject.details.impact}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Project Milestones</h4>
                  <div className="space-y-3">
                    {selectedProject.details.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                        <span className="text-sm font-black text-slate-900">{m.label}</span>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          m.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setSelectedProject(null);
                      showNotification('Thank you for your contribution!', 'success');
                    }}
                    className={`w-full py-4 bg-${selectedProject.color}-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-${selectedProject.color}-700 transition-all shadow-xl shadow-${selectedProject.color}-500/20`}
                  >
                    Contribute Points to this Project
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rewards;
