
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await verifyEmail(email, code);
      navigate('/login', { state: { message: 'Email verified successfully! You can now log in.' } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            We've sent a 6-digit verification code to <span className="font-semibold text-gray-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Demo Tip</p>
          <p className="text-sm text-emerald-600">The simulated verification code is: <span className="font-mono font-bold">123456</span></p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="sr-only">Verification Code</label>
            <input
              id="code"
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="appearance-none block w-full px-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-center text-3xl font-bold tracking-[0.5em]"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all ${isSubmitting || code.length !== 6 ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="flex items-center gap-2">
                Verify Account <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="text-center">
          <button 
            type="button" 
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            onClick={() => alert("Verification code resent (Simulated)")}
          >
            Didn't receive a code? Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
