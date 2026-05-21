import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle, Plane, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Plane className="w-6 h-6 rotate-45" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white tracking-tight leading-none">
          Create Admin Account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Or{' '}
          <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-400 transition">
            sign in to existing workspace
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

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  placeholder="Username"
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition placeholder-slate-650"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-slate-400">
                Administrative Role
              </label>
              <div className="mt-1.5 relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition"
                >
                  <option value="admin">System Administrator (Full CRUD Access)</option>
                  <option value="staff">Airport Staff (Read Only Access)</option>
                </select>
                <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
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
                  placeholder="Min 6 characters"
                  className="block w-full text-xs pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition placeholder-slate-650"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400">
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
