import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is already authenticated, auto-redirect to their corresponding dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'employee') {
        navigate('/employee', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-template-1 text-slate-900 flex flex-col justify-between items-center selection:bg-slate-900 selection:text-white relative overflow-x-hidden p-4 sm:p-6">
      
      {/* Main Container */}
      <main className="max-w-md w-full my-auto animate-fade-in py-6">
        <div className="bg-white rounded-3xl p-7 sm:p-9 border-2 border-slate-300/90 shadow-2xl space-y-6 text-slate-900">
          
          {/* Brand Header Inside Login Card */}
          <div className="text-center space-y-3">
            <div className="w-28 h-28 bg-white p-3 rounded-3xl border-2 border-slate-200/90 shadow-md inline-flex items-center justify-center">
              <img src="/sm_groups_logo.png" alt="THE SM GROUPS" className="w-full h-full object-contain" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                THE SM GROUPS
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Enterprise Portal
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Sign In to Your Workspace</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Enter your credentials to access your dashboard</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Employee ID or Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. EMP001 or name@company.com"
                  className="input-saas w-full pl-10 text-sm py-2.5 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-saas w-full pl-10 pr-10 text-sm py-2.5 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-bold shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Protected by Enterprise Security Standards
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs font-medium text-slate-500">
        © {new Date().getFullYear()} THE SM GROUPS • Enterprise Workforce Platform
      </footer>

    </div>
  );
};

export default HomePage;
