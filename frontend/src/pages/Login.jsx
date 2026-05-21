import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle, Plane, Cloud } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-100 to-sky-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Dynamic Floating CSS Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cloud 1 */}
        <div 
          className="absolute bg-white/70 backdrop-blur-[1px] rounded-full filter blur-[4px] opacity-80"
          style={{
            width: '280px',
            height: '90px',
            top: '15%',
            left: '-300px',
            animation: 'float-cloud-slow 35s linear infinite'
          }}
        />
        {/* Cloud 2 */}
        <div 
          className="absolute bg-white/60 backdrop-blur-[1px] rounded-full filter blur-[6px] opacity-75"
          style={{
            width: '400px',
            height: '120px',
            top: '45%',
            left: '-450px',
            animation: 'float-cloud-slow 50s linear infinite',
            animationDelay: '15s'
          }}
        />
        {/* Cloud 3 */}
        <div 
          className="absolute bg-white/80 backdrop-blur-[1px] rounded-full filter blur-[3px] opacity-90"
          style={{
            width: '200px',
            height: '70px',
            top: '70%',
            left: '-250px',
            animation: 'float-cloud-slow 28s linear infinite',
            animationDelay: '5s'
          }}
        />
      </div>

      <style>{`
        @keyframes float-cloud-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 600px)); }
        }
      `}</style>

      {/* Sun glow effect */}
      <div className="absolute top-10 right-10 w-[250px] h-[250px] bg-amber-250/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Plane className="w-6 h-6 rotate-45" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-800 tracking-tight leading-none">
          Sign In to Aerosphere
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 font-medium">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            register a new administrator account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/85 border border-white/40 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center space-x-2 animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-500">
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
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition placeholder-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500">
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
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition placeholder-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-blue-500/20"
              >
                {loading ? 'Authenticating Gateway...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick info credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-semibold text-blue-600">
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
