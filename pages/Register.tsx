
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { UserPlus, AlertCircle, User as UserIcon, Mail, ShieldCheck, Eye, EyeOff, CheckCircle2, XCircle, X, ArrowLeft } from 'lucide-react';
import Captcha from '../components/Captcha';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialPicking, setIsSocialPicking] = useState<'Google' | 'LinkedIn' | null>(null);
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherName, setOtherName] = useState('');
  const [otherEmail, setOtherEmail] = useState('');
  const [accountExists, setAccountExists] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  const { register, socialLogin, login, showNotification } = useAuth();
  const navigate = useNavigate();

  const isPasswordValid = password.length >= 8;

  // Check if account exists as user types in the "Add Account" modal
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
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!isCaptchaVerified) {
      setError('Please verify the CAPTCHA for security.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register(name, email, password, role);
      
      // Automatically log in after registration to avoid "asking again"
      await login(email, password);
      
      showNotification('Account created and logged in successfully!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Account creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSelect = async (socialName: string, socialEmail: string) => {
    if (!isSocialPicking) return;
    const provider = isSocialPicking;
    setIsSocialPicking(null);
    setIsAddingOther(false);
    setIsSubmitting(true);
    try {
      await socialLogin(provider, socialName, socialEmail);
      navigate('/dashboard');
    } catch (err: any) {
      setError(`Failed to sign up with ${provider}`);
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

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-100">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Step 1: Join EcoBazaar to start your journey
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-bold leading-tight">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsSocialPicking('Google')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => setIsSocialPicking('LinkedIn')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            LinkedIn
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 font-bold uppercase tracking-widest">Or Credentials</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-2 px-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="full-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-2 px-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-2 px-1">
                Security Key
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-bold text-slate-900 placeholder:text-slate-400 ${password.length > 0 && !isPasswordValid ? 'border-red-300' : 'border-slate-200'}`}
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 px-1">
                {password.length > 0 && (
                  <>
                    {isPasswordValid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-tight ${isPasswordValid ? 'text-emerald-600' : 'text-red-500'}`}>
                      {password.length}/8 Minimum
                    </span>
                  </>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-2 px-1">
                Access Tier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none font-bold text-slate-900"
                >
                  <option value={UserRole.USER}>Standard User</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                  <option value={UserRole.ANALYST}>Analyst</option>
                </select>
              </div>
            </div>
          </div>

          <Captcha onVerify={setIsCaptchaVerified} />

          <button
            type="submit"
            disabled={isSubmitting || !isCaptchaVerified || !isPasswordValid}
            className={`w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-black uppercase tracking-widest text-sm bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all ${isSubmitting || !isCaptchaVerified || !isPasswordValid ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Complete Sign Up'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Simulated Social Account Picker Modal */}
      {isSocialPicking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
            <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isAddingOther && (
                  <button onClick={() => setIsAddingOther(false)} className="p-1.5 hover:bg-white rounded-full transition-colors mr-1 shadow-sm border border-slate-100">
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                  </button>
                )}
                {isSocialPicking === 'Google' ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                )}
                <h3 className="font-black text-slate-900 tracking-tight">{isAddingOther ? 'Add Account' : 'Choose Account'}</h3>
              </div>
              <button onClick={closeSocialModal} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6">
              {!isAddingOther ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => handleSocialSelect('Alex Eco', `alex.eco@${isSocialPicking?.toLowerCase()}.com`)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-left border border-transparent hover:border-emerald-100 bg-white shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-100">A</div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Alex Eco</div>
                      <div className="text-xs text-slate-500 font-medium">alex.eco@gmail.com</div>
                    </div>
                  </button>
                  <div className="pt-2 px-3 text-center">
                    <button 
                      onClick={() => setIsAddingOther(true)}
                      className="text-xs font-black text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-2 mx-auto uppercase tracking-widest"
                    >
                      <UserIcon className="w-3.5 h-3.5" /> Use another account
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleOtherSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      autoFocus
                      value={otherName}
                      onChange={(e) => setOtherName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1.5 px-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                      {otherEmail && (
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${accountExists ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                          {accountExists ? 'Existing User' : 'New User'}
                        </span>
                      )}
                    </div>
                    <input 
                      type="email" 
                      required 
                      value={otherEmail}
                      onChange={(e) => setOtherEmail(e.target.value)}
                      placeholder="jane@social.com"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    {accountExists ? 'Continue' : 'Join'} with {isSocialPicking}
                  </button>
                </form>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 text-[10px] text-slate-400 font-bold leading-relaxed border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-500" /> To continue, {isSocialPicking} will securely share your profile details with our persistent identity engine.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
