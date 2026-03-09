
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Eye, EyeOff, Mail, ArrowRight, X, User as UserIcon, CheckCircle2, Database, ShieldCheck, UserPlus } from 'lucide-react';
import Captcha from '../components/Captcha';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialPicking, setIsSocialPicking] = useState<'Google' | 'LinkedIn' | null>(null);
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherName, setOtherName] = useState('');
  const [otherEmail, setOtherEmail] = useState('');
  const [accountExists, setAccountExists] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const successMsg = (location.state as any)?.message;

  useEffect(() => {
    if (otherEmail) {
      const users = JSON.parse(localStorage.getItem('ecobazaar_registered_users') || '[]');
      const exists = users.some((u: any) => u.email.toLowerCase() === otherEmail.toLowerCase());
      setAccountExists(exists);
    } else {
      setAccountExists(false);
    }
  }, [otherEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaVerified) {
      setError('Please complete the security verification.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSelect = async (name: string, socialEmail: string) => {
    if (!isSocialPicking) return;
    const provider = isSocialPicking;
    setIsSubmitting(true);
    try {
      await socialLogin(provider, name, socialEmail);
      setIsSocialPicking(null);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(`Failed to sign in with ${provider}`);
      setIsSocialPicking(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherName || !otherEmail) return;
    handleSocialSelect(otherName, otherEmail);
  };

  const closeSocialModal = () => {
    setIsSocialPicking(null);
    setIsAddingOther(false);
    setOtherName('');
    setOtherEmail('');
    setAccountExists(false);
  };

  const isAccountNotFoundError = error && (error.includes('not found') || error.includes('Sign Up first'));

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="max-w-[440px] w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-200 group hover:rotate-6 transition-transform">
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2.5 text-slate-500 font-medium text-sm">
            Please enter your details to continue
          </p>
        </div>
        
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {error && (
          <div className={`bg-red-50 border border-red-100 p-5 rounded-[1.5rem] flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300 ${isAccountNotFoundError ? 'ring-2 ring-red-200' : ''}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-bold leading-snug">{error}</p>
            </div>
            {isAccountNotFoundError && (
              <Link 
                to="/register" 
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-emerald-600 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Create New Account
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsSocialPicking('Google')}
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 active:scale-95 shadow-sm bg-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => setIsSocialPicking('LinkedIn')}
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 active:scale-95 shadow-sm bg-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            LinkedIn
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Or use email</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email-address" className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-2.5 px-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-400"
                  placeholder="hello@ecobazaar.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-2.5 px-1">
                Security Key
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <Captcha onVerify={setIsCaptchaVerified} />

          <button
            type="submit"
            disabled={isSubmitting || !isCaptchaVerified}
            className={`w-full py-4 px-4 rounded-[1.25rem] text-white font-black text-sm bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 tracking-widest uppercase ${isSubmitting || !isCaptchaVerified ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>Sign In <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 font-medium">
            New here?{' '}
            <Link to="/register" className="font-black text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors">
              Join EcoBazaar
            </Link>
          </p>
        </div>
      </div>

      {/* Social Modal - High Quality Glass UI */}
      {isSocialPicking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={closeSocialModal}></div>
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-400 border border-white">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                  {isSocialPicking === 'Google' ? (
                    <svg className="w-7 h-7" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  ) : (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#0A66C2"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-none mb-1.5">{isSocialPicking} Login</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Select an Account</p>
                </div>
              </div>
              <button onClick={closeSocialModal} className="p-3 bg-white hover:bg-red-50 hover:text-red-500 rounded-2xl shadow-sm border border-slate-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              {!isAddingOther ? (
                <div className="space-y-4">
                  <button onClick={() => handleSocialSelect('Alex Eco', `alex.eco@${isSocialPicking?.toLowerCase()}.com`)} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-white rounded-3xl transition-all border-2 border-transparent hover:border-emerald-100 shadow-sm group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-200 group-hover:rotate-6 transition-transform">A</div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-slate-900">Alex Eco</div>
                        <div className="text-[10px] text-slate-400 font-medium tracking-tight">alex.eco@social.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </button>
                  <button onClick={() => setIsAddingOther(true)} className="w-full py-4 text-xs font-black text-emerald-600 flex items-center justify-center gap-2 hover:bg-emerald-50 rounded-2xl transition-all">
                    <UserIcon className="w-4 h-4" /> Link Other Account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOtherSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <input type="text" required autoFocus value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                    <div className="relative">
                      <input type="email" required value={otherEmail} onChange={(e) => setOtherEmail(e.target.value)} placeholder="Email Address" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                      {otherEmail && (
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase shadow-sm border ${accountExists ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                           <Database className="w-3 h-3" /> {accountExists ? 'Recognized' : 'New Account'}
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4.5 bg-emerald-600 text-white font-black rounded-2xl text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 tracking-widest uppercase">
                    {accountExists ? 'Sign In' : 'Sign Up & Sync'} <Database className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
            
            <div className="p-10 bg-slate-50 text-[10px] text-slate-400 font-bold leading-relaxed flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>Identity verification via {isSocialPicking} is simulated using our persistent LocalDB engine. Data is stored safely on your device.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
