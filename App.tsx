
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Library, 
  BarChart3, 
  GraduationCap, 
  ChevronRight, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  Filter,
  Loader2,
  TrendingUp,
  Award,
  BookMarked,
  Menu,
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Star,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  Moon,
  Sun
} from 'lucide-react';
import { RecommendationRequest, Material, MaterialCategory } from './types';
import { getAIRecommendations } from './services/gemini';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import SignUpFlow from './components/SignUpFlow';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

interface UserProfile {
  username: string;
  email: string;
}

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({ username: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Application State
  const [activeTab, setActiveTab] = useState<'recommend' | 'library' | 'analytics'>('recommend');
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Feedback State
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [form, setForm] = useState<RecommendationRequest>({
    courseTitle: '',
    topic: '',
    level: 'Beginner'
  });
  const [results, setResults] = useState<{ summary: string; recommendations: Material[] } | null>(null);
  
  const [library, setLibrary] = useState<Material[]>([
    { 
      id: 'init-1', 
      title: 'Introduction to Algorithms', 
      author: 'Thomas H. Cormen', 
      category: MaterialCategory.BOOK, 
      url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/', 
      description: 'A comprehensive guide to algorithm design and analysis.', 
      relevanceScore: 98, 
      tags: ['Computer Science', 'Algorithms'] 
    },
    { 
      id: 'init-2', 
      title: 'CS50: Introduction to Computer Science', 
      author: 'David J. Malan', 
      category: MaterialCategory.COURSE, 
      url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x', 
      description: 'Harvard University\'s introduction to the intellectual enterprises of computer science.', 
      relevanceScore: 95, 
      tags: ['CS50', 'Programming'] 
    }
  ]);

  // Handle Theme Persistence
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'signup') {
      if (!registrationForm.username || !registrationForm.email || !registrationForm.password) {
        setAuthError("All fields are required.");
        return;
      }
      
      const newUserProfile: UserProfile = {
        username: registrationForm.username,
        email: registrationForm.email
      };
      
      setRegisteredUsers(prev => [...prev, newUserProfile]);
      setUser(newUserProfile);
    } else if (authMode === 'login') {
      const existingUser = registeredUsers.find(u => u.email === loginForm.email);
      if (existingUser) {
        setUser(existingUser);
      } else {
        setAuthError("Invalid email or password.");
      }
    } else if (authMode === 'forgot') {
      setResetSent(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseTitle || !form.topic) return;

    setLoading(true);
    try {
      const data = await getAIRecommendations(form);
      setResults(data);
      setLibrary(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newOnes = data.recommendations.filter(r => !existingIds.has(r.id));
        return [...newOnes, ...prev];
      });
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = (rating: number) => {
    setUserRating(rating);
    setFeedbackSubmitted(true);
  };

  const analyticsData = useMemo(() => {
    const categoryCounts = library.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    const barData = library.slice(0, 6).map(item => ({
      name: item.title.length > 8 ? item.title.substring(0, 8) + '..' : item.title,
      score: item.relevanceScore
    }));

    return { pieData, barData };
  }, [library]);

  const MaterialCard: React.FC<{ material: Material }> = ({ material }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded border border-indigo-100 dark:border-indigo-800 uppercase tracking-wider">
          {material.category}
        </span>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
          <TrendingUp size={12} />
          {material.relevanceScore}%
        </div>
      </div>
      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 text-sm sm:text-base">{material.title}</h3>
      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium flex items-center gap-1">
        By <span className="text-slate-700 dark:text-slate-300">{material.author}</span>
      </p>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px] flex-grow">{material.description}</p>
      <div className="flex flex-wrap gap-1 mb-5">
        {material.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium">#{tag}</span>
        ))}
      </div>
      <a 
        href={material.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-xs sm:text-sm font-semibold transition-all border border-slate-200 dark:border-slate-700"
      >
        View Resource <ExternalLink size={14} />
      </a>
    </div>
  );

  if (!user) {
    if (authMode === 'signup') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-500 relative p-8">
            <SignUpFlow 
              onSuccess={(userData) => {
                const newUser = { ...userData };
                setRegisteredUsers(prev => [...prev, newUser]);
                setUser(newUser);
              }}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-500 relative">
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute top-4 right-4 p-2 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-amber-400 z-20 hover:scale-110 transition-transform"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="bg-indigo-600 dark:bg-indigo-700 p-8 text-center relative overflow-hidden">
            <Sparkles className="absolute -right-4 -top-4 text-white/20 animate-pulse" size={96} />
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center text-white mb-4 relative z-10 shadow-lg">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1 relative z-10">EduStream AI</h1>
            <p className="text-indigo-100 text-sm relative z-10">Your path to academic excellence starts here</p>
          </div>

          <div className="p-8">
            <>
              {authMode !== 'forgot' && (
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl mb-6">
                  <button 
                    onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'signup' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                  >
                    Sign Up
                  </button>
                  <button 
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                  >
                    Login
                  </button>
                </div>
              )}

              {authError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl font-bold text-center animate-in slide-in-from-top-2">
                  {authError}
                </div>
              )}

              {authMode === 'forgot' && resetSent ? (
                <div className="text-center py-6 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Instructions Sent!</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">We've sent an email to <b>{loginForm.email}</b> with instructions to reset your password.</p>
                  <button 
                    onClick={() => { setAuthMode('login'); setResetSent(false); }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft size={16} /> Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} /> Full Name
                      </label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
                        placeholder="John Doe"
                        value={registrationForm.username}
                        onChange={(e) => setRegistrationForm({...registrationForm, username: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={12} /> Email Address
                    </label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
                      placeholder="example@email.com"
                      value={authMode === 'signup' ? registrationForm.email : loginForm.email}
                      onChange={(e) => authMode === 'signup' ? setRegistrationForm({...registrationForm, email: e.target.value}) : setLoginForm({...loginForm, email: e.target.value})}
                    />
                  </div>

                  {authMode !== 'forgot' && (
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Lock size={12} /> Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
                          placeholder="Enter secure password"
                          value={authMode === 'signup' ? registrationForm.password : loginForm.password}
                          onChange={(e) => authMode === 'signup' ? setRegistrationForm({...registrationForm, password: e.target.value}) : setLoginForm({...loginForm, password: e.target.value})}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 mt-2 active:scale-95"
                  >
                    {authMode === 'signup' ? 'Create Account' : authMode === 'login' ? 'Sign In' : 'Send Reset Instructions'} 
                    <ChevronRight size={18} />
                  </button>

                  {authMode === 'login' && (
                    <div className="text-center pt-2">
                      <button 
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  {authMode === 'forgot' && (
                    <div className="text-center pt-2">
                      <button 
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                      >
                        <ArrowLeft size={12} /> Back to Login
                      </button>
                    </div>
                  )}
                </form>
              )}
            </>
            
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 mt-6 leading-relaxed px-4">
              By continuing, you agree to our Terms of Use and Privacy Policy. EduStream is an AI experiment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const NavItems = () => (
    <>
      <button 
        onClick={() => { setActiveTab('recommend'); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'recommend' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
      >
        <Search size={18} /> Smart Discovery
      </button>
      <button 
        onClick={() => { setActiveTab('library'); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'library' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
      >
        <Library size={18} /> My Library
      </button>
      <button 
        onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
      >
        <BarChart3 size={18} /> Insights
      </button>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative transition-colors duration-300">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">EduStream</span>
          </div>
          <button className="lg:hidden text-slate-400 p-1" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItems />
        </nav>

        {/* Theme Toggle Button in Sidebar */}
        <div className="px-4 py-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
               <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-4.5' : 'translate-x-0.5'}`} style={{ transform: isDarkMode ? 'translateX(18px)' : 'translateX(2px)' }} />
            </div>
          </button>
        </div>

        {/* Rating/Feedback Sidebar Section */}
        <div className="px-4 py-2">
          {!feedbackSubmitted ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ThumbsUp size={10} /> Rate the tool
              </p>
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleRatingSubmit(star)}
                    className="p-1 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star 
                      size={20} 
                      className={`${(hoverRating || userRating || 0) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ThumbsUp size={14} />
              </div>
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 leading-tight">Thanks for your feedback!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center text-white font-bold text-xs uppercase">
                {user.username.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.username}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
              <Sparkles size={10} /> Member
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors text-xs font-bold"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col w-full relative">
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
              {activeTab === 'recommend' && 'Discovery Engine'}
              {activeTab === 'library' && 'Personal Collection'}
              {activeTab === 'analytics' && 'Performance Metrics'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end mr-1">
                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{user.username}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Member</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 uppercase">
               {user.username.charAt(0)}
             </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 w-full max-w-6xl mx-auto flex-grow">
          {activeTab === 'recommend' && (
            <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <section className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="max-w-3xl relative z-10">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 sm:mb-4 tracking-tight leading-tight">
                    Hello, {user.username}. <br/><span className="text-indigo-600 dark:text-indigo-400">Let's find your materials.</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">Our AI analyzes your course requirements to find high-impact resources.</p>
                  
                  <form onSubmit={handleRecommend} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Course Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Psychology 101"
                        className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
                        value={form.courseTitle}
                        onChange={(e) => setForm({...form, courseTitle: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Topic</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Cognitive Bias"
                        className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm dark:text-slate-200"
                        value={form.topic}
                        onChange={(e) => setForm({...form, topic: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Depth Level</label>
                      <select 
                        className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm cursor-pointer dark:text-slate-200"
                        value={form.level}
                        onChange={(e) => setForm({...form, level: e.target.value as any})}
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2 sm:pt-4">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-8 py-3.5 rounded-xl sm:rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} /> Researching...
                          </>
                        ) : (
                          <>
                            Generate Recommendations <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-indigo-50/50 dark:bg-indigo-900/10 clip-path-slant hidden lg:block"></div>
              </section>

              {results && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                  <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                      <Award size={20} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Curated for You</h2>
                  </div>
                  
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-4 sm:p-6 rounded-2xl mb-8 sm:mb-10 flex gap-4 backdrop-blur-sm">
                    <div className="hidden sm:flex w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 items-center justify-center shrink-0">
                       <Sparkles className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-1">AI Logic</p>
                      <p className="text-sm sm:text-base text-indigo-900 dark:text-indigo-200 leading-relaxed font-semibold italic">"{results.summary}"</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {results.recommendations.map(m => (
                      <MaterialCard key={m.id} material={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Resource Repository</h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Your curated academic history.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                  <Filter size={16} /> Filter Results
                </button>
              </div>

              {library.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {library.map((m, idx) => (
                    <MaterialCard key={`${m.id}-${idx}`} material={m} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
                    <BookMarked size={32} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2 text-center">Library Empty</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xs text-center mb-8 leading-relaxed">Start discovering materials to build your collection.</p>
                  <button 
                    onClick={() => setActiveTab('recommend')}
                    className="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all"
                  >
                    Go to Discovery
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 sm:mb-3">Resources Saved</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">{library.length}</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                      <TrendingUp size={10} /> +15%
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 sm:mb-3">Avg Relevance</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                      {library.length > 0 
                        ? (library.reduce((a, b) => a + b.relevanceScore, 0) / library.length).toFixed(1) 
                        : '0'}%
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-800 shrink-0">
                      Target Met
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 sm:mb-3">Tool Rating</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 truncate">
                      {userRating ? `${userRating}/5` : 'N/A'}
                    </span>
                    <span className={`text-[10px] font-bold ${userRating ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800' : 'text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'} px-2 py-0.5 rounded-lg border shrink-0`}>
                      {userRating ? 'Rating' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 sm:mb-3">Tier</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 truncate">Elite</span>
                    <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 sm:mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <BookOpen size={18} />
                    </div>
                    Material Mix
                  </h3>
                  <div className="h-48 sm:h-72 w-full">
                    {library.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {analyticsData.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                              fontSize: '10px',
                              backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                              color: isDarkMode ? '#f1f5f9' : '#1e293b'
                            }} 
                            itemStyle={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-700 italic text-xs">Analytics unavailable</div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 sm:mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <TrendingUp size={18} />
                    </div>
                    Top Scores
                  </h3>
                  <div className="h-48 sm:h-72 w-full">
                    {library.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.barData}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 9, fill: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 600}} 
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 9, fill: isDarkMode ? '#64748b' : '#94a3b8'}} 
                          />
                          <Tooltip 
                            cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} 
                            contentStyle={{ 
                              borderRadius: '10px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                              fontSize: '10px',
                              backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                              color: isDarkMode ? '#f1f5f9' : '#1e293b'
                            }}
                          />
                          <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-700 italic text-xs">Analytics unavailable</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 p-8 sm:p-12 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <Sparkles className="absolute -right-6 -top-6 opacity-10" size={160} />
                <div className="max-w-xl relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <MessageSquare size={24} />
                    </div>
                    <h3 className="text-2xl font-bold">Your opinion matters</h3>
                  </div>
                  <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                    EduStream is constantly learning from your interactions. Help us improve the discovery engine by sharing your experience.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => alert("Detailed feedback form coming soon!")}
                      className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                      Write a Review <ExternalLink size={16} />
                    </button>
                    {!feedbackSubmitted && (
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={20} className="text-white/40" />
                        ))}
                        <span className="text-[10px] font-bold uppercase ml-2 opacity-60 tracking-widest">Rate in sidebar</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
