import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle, Plane } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all details.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register(username, password, role);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-100 to-sky-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Floating Day Clouds background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cloud 1 */}
        <div 
          className="absolute bg-white/70 backdrop-blur-[1px] rounded-full filter blur-[4px] opacity-80"
          style={{
            width: '280px',
            height: '90px',
            top: '10%',
            left: '-300px',
            animation: 'float-cloud-slow 32s linear infinite'
          }}
        />
        {/* Cloud 2 */}
        <div 
          className="absolute bg-white/60 backdrop-blur-[1px] rounded-full filter blur-[6px] opacity-75"
          style={{
            width: '400px',
            height: '120px',
            top: '40%',
            left: '-450px',
            animation: 'float-cloud-slow 48s linear infinite',
            animationDelay: '12s'
          }}
        />
        {/* Cloud 3 */}
        <div 
          className="absolute bg-white/80 backdrop-blur-[1px] rounded-full filter blur-[3px] opacity-90"
          style={{
            width: '200px',
            height: '70px',
            top: '75%',
            left: '-250px',
            animation: 'float-cloud-slow 25s linear infinite',
            animationDelay: '6s'
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
          Create Admin Account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 font-medium">
          Or{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            sign in to existing workspace
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

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  placeholder="Username"
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition placeholder-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-bold text-slate-500">
                Administrative Role
              </label>
              <div className="mt-1.5 relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition"
                >
                  <option value="admin">System Administrator (Full CRUD Access)</option>
                  <option value="staff">Airport Staff (Read Only Access)</option>
                </select>
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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
                  placeholder="Min 6 characters"
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition placeholder-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-500">
                Confirm Password
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
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
                {loading ? 'Registering Workspace...' : 'Register'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;
