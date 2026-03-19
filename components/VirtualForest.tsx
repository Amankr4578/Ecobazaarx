
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TreeDeciduous, TreePine, Flower2, CloudRain, 
  Sun, Wind, Bird, Sparkles, Info, TrendingUp,
  Camera, Share2, Download, X, Upload, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackTreePlanting } from '../services/productService';

const VirtualForest: React.FC = () => {
  const { user, addPoints, showNotification } = useAuth();
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showPlantModal, setShowPlantModal] = React.useState(false);
  const [plantImage, setPlantImage] = React.useState<string | null>(null);
  const [isSubmittingPlant, setIsSubmittingPlant] = React.useState(false);
  const points = user?.greenPoints || 0;
  
  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      setShowShareModal(true);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlantImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlantSubmit = async () => {
    if (!plantImage) return;
    setIsSubmittingPlant(true);
    try {
      const result = await trackTreePlanting(plantImage);
      if (result && result.pointsEarned) {
        addPoints(result.pointsEarned);
        showNotification(`Verified! You earned ${result.pointsEarned} Green Points!`, 'success');
        setShowPlantModal(false);
        setPlantImage(null);
      }
    } catch (error) {
      showNotification('Failed to verify planting. Please try again.', 'error');
    } finally {
      setIsSubmittingPlant(false);
    }
  };
  
  // Logic to determine forest growth based on points
  const treeCount = Math.floor(points / 100);
  const flowerCount = Math.floor((points % 100) / 20);
  const forestLevel = Math.floor(points / 500) + 1;
  const carbonOffset = (points * 0.5).toFixed(1);

  const renderForest = () => {
    const elements = [];
    
    // Add trees
    for (let i = 0; i < Math.min(treeCount, 20); i++) {
      const Icon = i % 2 === 0 ? TreeDeciduous : TreePine;
      elements.push(
        <motion.div
          key={`tree-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="absolute"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            bottom: `${Math.random() * 40 + 10}%`,
            zIndex: Math.floor(Math.random() * 10)
          }}
        >
          <Icon 
            className={`${i % 3 === 0 ? 'w-12 h-12' : 'w-16 h-16'} text-emerald-600 drop-shadow-lg`} 
            style={{ opacity: 0.7 + Math.random() * 0.3 }}
          />
        </motion.div>
      );
    }

    // Add flowers
    for (let i = 0; i < Math.min(flowerCount, 15); i++) {
      elements.push(
        <motion.div
          key={`flower-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: (treeCount + i) * 0.1 }}
          className="absolute"
          style={{
            left: `${Math.random() * 90 + 5}%`,
            bottom: `${Math.random() * 20 + 5}%`,
            zIndex: 15
          }}
        >
          <Flower2 className="w-6 h-6 text-pink-400" />
        </motion.div>
      );
    }

    return elements;
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
      {/* Capture Flash Animation */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Forest Visualization Area */}
      <div className="relative h-96 bg-gradient-to-b from-blue-50 to-emerald-50 overflow-hidden border-b border-slate-100">
        {/* Sky Elements */}
        <div className="absolute top-10 left-10 flex gap-12 opacity-40">
          <Sun className="w-12 h-12 text-amber-400 animate-pulse" />
          <CloudRain className="w-10 h-10 text-blue-300 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
        
        {/* Capture Button */}
        <div className="absolute top-6 left-6 z-50 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCapture}
            className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 group"
          >
            <Camera className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Capture Forest</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlantModal(true)}
            className="bg-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center gap-3 group"
          >
            <TreeDeciduous className="w-5 h-5 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Log Real Tree</span>
          </motion.button>
        </div>
        <div className="absolute top-20 right-20 opacity-20">
          <Wind className="w-16 h-16 text-slate-300" />
        </div>
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-emerald-100/50 rounded-t-[100%] scale-x-150 translate-y-10" />
        
        {/* Rendered Forest */}
        {renderForest()}

        {/* Level Badge */}
        <div className="absolute top-6 right-6">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
              {forestLevel}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forest Level</p>
              <p className="text-sm font-black text-slate-900">
                {forestLevel === 1 ? 'Sproutling' : 
                 forestLevel === 2 ? 'Green Grove' : 
                 forestLevel === 3 ? 'Eco Woodland' : 'Ancient Forest'}
              </p>
            </div>
          </div>
        </div>

        {/* Points Progress */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Tree in {100 - (points % 100)} points</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{points % 100}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${points % 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Info */}
      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <div className="p-2 bg-blue-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Impact Stats</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-black text-slate-900">{carbonOffset} kg</p>
                <p className="text-xs font-medium text-slate-500">Estimated CO2 Offset</p>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{treeCount}</p>
                <p className="text-xs font-medium text-slate-500">Virtual Trees Planted</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">How it works</h4>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
              Your virtual forest grows as you earn Green Points. Every 100 points plants a new tree, and every 20 points adds a flower. This visualization represents your real-world contribution to a more sustainable future.
            </p>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Info className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                Tip: Purchasing high Eco Score products earns you 50 points instantly!
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Share Your Impact</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-8">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TreeDeciduous className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">EcoBazaar Impact Card</span>
                    </div>
                    
                    <h4 className="text-2xl font-black mb-2">{user?.name}'s Virtual Forest</h4>
                    <p className="text-emerald-100 text-sm font-medium mb-8">Level {forestLevel} Sproutling • {treeCount} Trees Planted</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">CO2 Offset</p>
                        <p className="text-xl font-black">{carbonOffset} kg</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Green Points</p>
                        <p className="text-xl font-black">{points}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all">
                    <Share2 className="w-4 h-4" />
                    Share Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Real Tree Modal */}
      <AnimatePresence>
        {showPlantModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                    <TreeDeciduous className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Log Real-World Planting</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Earn 100 Green Points</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPlantModal(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-slate-100"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Planted a tree in the real world? Amazing! Take a photo of your new sapling to verify your impact and earn <span className="text-emerald-600 font-black">100 Green Points</span> for your virtual forest.
                </p>
                
                <div className="relative group">
                  {plantImage ? (
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-emerald-100 shadow-inner">
                      <img src={plantImage} alt="Planted tree" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPlantImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-all cursor-pointer group">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-100">
                        <Upload className="w-8 h-8 text-emerald-600" />
                      </div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Upload Photo</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">JPG, PNG up to 5MB</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
                
                <button 
                  disabled={!plantImage || isSubmittingPlant}
                  onClick={handlePlantSubmit}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${
                    !plantImage || isSubmittingPlant 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 active:scale-[0.98]'
                  }`}
                >
                  {isSubmittingPlant ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify & Earn Points <CheckCircle2 className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VirtualForest;
