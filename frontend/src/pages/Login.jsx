import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Brain, Mail, Lock, User, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register API expects JSON: { username, email, password }
        const response = await api.post('/api/auth/register', {
          username,
          email,
          password,
        });
        const { access_token } = response.data;
        login(access_token);
        navigate('/dashboard');
      } else {
        // Login API expects URL-encoded form data (OAuth2PasswordRequestForm):
        // username = email, password = password
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await api.post('/api/auth/login', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        const { access_token } = response.data;
        login(access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Authentication failed. Please verify your credentials and check if the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Glass card container */}
      <div className="glass max-w-md w-full p-8 md:p-10 relative z-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] neon-pulse">
        
        {/* Title / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-4">
            <Brain className="w-9 h-9 text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold tracking-wide">
            {isRegister ? 'Create Neural Link' : 'Initialize BCI Session'}
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 text-center">
            {isRegister 
              ? 'Register a virtual brain profile to start simulation' 
              : 'Sign in to access your telemetry and ML decoding cockpit'
            }
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-start gap-3 text-xs leading-relaxed animate-shake">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Operator Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-slate-900 border border-white/10 focus:border-cyan-500 outline-none rounded-xl text-sm transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="operator@mindflow.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-slate-900 border border-white/10 focus:border-cyan-500 outline-none rounded-xl text-sm transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 block">Passcode</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-slate-900 border border-white/10 focus:border-cyan-500 outline-none rounded-xl text-sm transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? 'Activate Neural Link' : 'Establish Connection'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Option */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-400">
          {isRegister ? (
            <p>
              Already have an operator link?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className="text-cyan-400 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Initialize BCI
              </button>
            </p>
          ) : (
            <p>
              New operator profile needed?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className="text-cyan-400 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Create Link
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Back button */}
      <Link 
        to="/" 
        className="absolute bottom-6 left-6 text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
      >
        &larr; Back to Landing Page
      </Link>
    </div>
  );
}
