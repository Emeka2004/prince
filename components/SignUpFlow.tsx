
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface SignUpFlowProps {
  onSuccess: (userData: { username: string; email: string }) => void;
  onSwitchToLogin: () => void;
}

const SignUpFlow: React.FC<SignUpFlowProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation using ONLY if statements
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      setError("Please use a valid @gmail.com address.");
      return;
    }

    setLoading(true);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, username: formData.username, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(`Failed to send verification email: ${errorData.error || 'Unknown error'}`);
      }

      setStep('verify');
    } catch (err: any) {
      console.error('Registration error:', err);
      // If the error object has a message from our throw above, use it.
      setError(err.message || "Failed to send verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verification logic using ONLY if statements
    if (verificationCode !== generatedCode) {
      setError("Incorrect verification code. Please check your email.");
      return;
    }

    if (verificationCode === generatedCode) {
      setSuccess("Account verified successfully!");
      setTimeout(() => {
        onSuccess({
          username: formData.username,
          email: formData.email
        });
      }, 1500);
    }
  };

  // Stage 1: Registration UI
  if (step === 'register') {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Join the Smart Material Recommender community</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Username
            </label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
              placeholder="Your username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} /> Gmail Address
            </label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} /> Password
              </label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} /> Confirm
              </label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                Sign Up <ChevronRight size={18} />
              </>
            )}
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Already have an account? Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Stage 2: Verification UI
  if (step === 'verify') {
    return (
      <div className="w-full animate-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4 border border-indigo-100 dark:border-indigo-800">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Verify Email</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">We've sent a 6-digit code to <br/><span className="font-bold text-slate-700 dark:text-slate-300">{formData.email}</span></p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-in slide-in-from-top-2">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
              Enter 6-Digit Verification Code
            </label>
            <input 
              type="text" 
              maxLength={6}
              required
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-2xl font-bold tracking-[0.5em] text-center dark:text-slate-200"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Verify <CheckCircle2 size={18} />
          </button>

          <button 
            type="button"
            onClick={() => setStep('register')}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Registration
          </button>
        </form>
      </div>
    );
  }

  return null;
};

export default SignUpFlow;
