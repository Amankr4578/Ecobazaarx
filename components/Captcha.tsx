
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  onRefresh?: () => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify, onRefresh }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = useCallback(() => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
    if (onRefresh) onRefresh();
  }, [onVerify, onRefresh]);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    const valid = val === captchaText;
    setIsVerified(valid);
    onVerify(valid);
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Security Verification
        </label>
        <button
          type="button"
          onClick={generateCaptcha}
          className="text-emerald-600 hover:text-emerald-700 transition-colors"
          title="Refresh Captcha"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div 
          className="flex-grow select-none py-2 px-4 bg-white border-2 border-dashed border-emerald-200 rounded text-xl font-mono font-bold tracking-[0.5em] text-emerald-800 text-center shadow-inner"
          style={{ backgroundImage: 'radial-gradient(#10b98122 1px, transparent 0)', backgroundSize: '10px 10px' }}
        >
          {captchaText}
        </div>
        <div className="flex-shrink-0">
          {isVerified ? (
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
              <ShieldCheck className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-gray-200 text-gray-400 rounded-full">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Type the characters above"
        value={userInput}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
          isVerified 
            ? 'border-emerald-500 ring-emerald-100' 
            : 'border-gray-300 focus:ring-emerald-100 focus:border-emerald-500'
        }`}
      />
    </div>
  );
};

export default Captcha;
