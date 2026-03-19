
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Scan, Sparkles, Leaf, 
  AlertCircle, CheckCircle2, ArrowRight, 
  ShieldCheck, Info, RefreshCw, ShoppingBag,
  Zap, X
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const SustainabilityScanner: React.FC = () => {
  const { showNotification } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      showNotification("Could not access camera. Please check permissions.", "error");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
        analyzeImage(dataUrl, 'image/jpeg');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyzeImage(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image: string, mimeType: string) => {
    setScanning(true);
    setResult(null);

    try {
      const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta.env.VITE_GEMINI_API_KEY || "");
      
      if (!apiKey || apiKey === "") {
        throw new Error("MISSING_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: "Analyze this product image for sustainability. Identify the product name clearly. Estimate its environmental impact (0-100 score where 100 is best). Estimate its carbon footprint in kg CO2e (e.g., '0.45 KG CO2E'). List 3-4 key sustainability pros and 3-4 environmental cons. Suggest 3 eco-friendly alternatives available on EcoBazaar. Return the data in a strict JSON format." },
            { inlineData: { mimeType: mimeType || "image/jpeg", data: base64Image.split(',')[1] } }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              score: { type: Type.NUMBER },
              impactLevel: { type: Type.STRING, description: "e.g., 'MODERATE IMPACT', 'HIGH IMPACT', 'LOW IMPACT'" },
              carbonEmission: { type: Type.STRING, description: "e.g., '0.45 KG CO2E'" },
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              alternatives: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  }
                } 
              }
            },
            required: ["productName", "score", "impactLevel", "carbonEmission", "pros", "cons", "alternatives"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const data = JSON.parse(text);
      if (data.score && typeof data.score === 'string') {
        data.score = parseInt(data.score, 10) || 0;
      }
      setResult(data);
    } catch (error: any) {
      console.error('Analysis failed details:', error);
      let errorMessage = 'Failed to analyze image. Please check your internet connection and try again.';
      
      if (error.message === "MISSING_API_KEY") {
        errorMessage = 'Configuration Error: GEMINI_API_KEY is missing. Please add it to your .env file.';
      } else if (error.message && error.message.includes("API key not valid")) {
        errorMessage = 'The provided Gemini API key is invalid. Please check your .env file.';
      } else if (error.message) {
        console.error("Specific AI error in scanner:", error.message);
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-emerald-100 rounded-3xl mb-6">
          <Scan className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">AI Sustainability Scanner</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Upload a photo of any product to get an instant sustainability assessment and find greener alternatives.
        </p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-10">
          {!image && !isCameraActive ? (
            <div className="max-w-md mx-auto">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-300 group-hover:text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Upload Photo</h3>
                <p className="text-slate-400 font-medium mb-6 text-sm">Select from gallery</p>
                <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Select Image</button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          ) : isCameraActive ? (
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-video bg-slate-900">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20">
                <div className="w-full h-full border-2 border-emerald-400/50 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                </div>
              </div>
              
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
                <button 
                  onClick={stopCamera}
                  className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                >
                  <div className="w-16 h-16 border-4 border-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full group-hover:scale-90 transition-all"></div>
                  </div>
                </button>
                <div className="w-14"></div> {/* Spacer */}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="space-y-10">
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-video bg-slate-900">
                <img src={image} alt="Scanned product" className="w-full h-full object-contain" />
                {scanning && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                    <motion.div
                      animate={{ y: [0, 200, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                    />
                    <Sparkles className="w-12 h-12 text-emerald-400 animate-pulse mb-4" />
                    <p className="font-black uppercase tracking-[0.2em] text-xs">Analyzing Impact...</p>
                  </div>
                )}
                <button 
                  onClick={() => { setImage(null); setResult(null); }}
                  className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-slate-900 hover:bg-white transition-colors shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                  >
                    {/* Score Header */}
                    <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100">
                      <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-xl">
                        <svg className="w-32 h-32 -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-slate-100"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={364.4}
                            initial={{ strokeDashoffset: 364.4 }}
                            animate={{ strokeDashoffset: 364.4 * (1 - result.score / 100) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={result.score > 70 ? 'text-emerald-500' : result.score > 40 ? 'text-amber-500' : 'text-red-500'}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-slate-900">{result.score}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Eco Score</span>
                        </div>
                      </div>
                      <div className="flex-grow text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{result.productName}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${
                            result.score > 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                            result.score > 40 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {result.impactLevel || (result.score > 70 ? 'HIGHLY SUSTAINABLE' : result.score > 40 ? 'MODERATE IMPACT' : 'HIGH IMPACT')}
                          </span>
                          {result.carbonEmission && (
                            <div className="flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-sm">
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                EST. {result.carbonEmission} CO2E
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-10 bg-emerald-50/30 rounded-[3rem] border border-emerald-100/50">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[11px]">Sustainability Pros</h4>
                        </div>
                        <ul className="space-y-4">
                          {(result.pros || []).map((pro: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-600 leading-relaxed">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-10 bg-red-50/30 rounded-[3rem] border border-red-100/50">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          </div>
                          <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[11px]">Environmental Cons</h4>
                        </div>
                        <ul className="space-y-4">
                          {(result.cons || []).map((con: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-600 leading-relaxed">
                              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.4)]" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Alternatives */}
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">EcoBazaar Alternatives</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {(result.alternatives || []).map((alt: any, i: number) => (
                          <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <Leaf className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900">{alt.name}</h4>
                                <p className="text-xs text-slate-500 font-medium">{alt.reason}</p>
                              </div>
                            </div>
                            <Link 
                              to="/products"
                              className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-slate-100">
          <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" />
          <div>
            <h5 className="font-black text-slate-900 text-sm mb-1">Verified Analysis</h5>
            <p className="text-xs text-slate-500 font-medium">Our AI analyzes materials, packaging, and brand reputation.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-slate-100">
          <Leaf className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <h5 className="font-black text-slate-900 text-sm mb-1">Impact Tracking</h5>
            <p className="text-xs text-slate-500 font-medium">Scanning products helps us build your personalized eco-profile.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-slate-100">
          <ShoppingBag className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h5 className="font-black text-slate-900 text-sm mb-1">Smart Swaps</h5>
            <p className="text-xs text-slate-500 font-medium">Find better alternatives instantly from our curated marketplace.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScanner;
