import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle, Plane } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Plane className="w-6 h-6 rotate-45" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white tracking-tight leading-none">
          Sign In to Aerosphere
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-500 hover:text-blue-400 transition">
            register a new administrator account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl glass">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center space-x-2 animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-400">
                Username
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition placeholder-slate-650"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400">
                Password
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition placeholder-slate-650"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-blue-500/10"
              >
                {loading ? 'Authenticating Gateway...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick info credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800/40 border border-slate-800 text-[10px] font-semibold text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Demo login: <b>admin</b> / <b>admin123</b></span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
