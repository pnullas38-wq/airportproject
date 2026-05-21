import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { 
  LayoutDashboard, 
  Users, 
  Plane, 
  Ticket, 
  UserCheck, 
  Building2, 
  LogOut,
  Sun,
  Moon,
  Shield,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/passengers', label: 'Passengers', icon: Users },
    { to: '/flights', label: 'Flights', icon: Plane },
    { to: '/tickets', label: 'Ticket Bookings', icon: Ticket },
    { to: '/staff', label: 'Staff Management', icon: UserCheck },
    { to: '/airports', label: 'Airports', icon: Building2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed top-0 left-0 z-40 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold text-xl">
          A
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide leading-none">Aerosphere</h1>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Airport Admin</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Systems */}
      <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/20">
        {/* Real-time Connection Status */}
        <div className="flex items-center justify-between px-2 text-xs">
          <span className="text-slate-500 flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 animate-pulse text-blue-500" />
            <span>Sync Engine</span>
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isConnected 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
          }`}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/80">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center uppercase font-bold text-sm">
              {user?.username?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">{user?.username}</p>
              <p className="text-[10px] text-slate-500 capitalize flex items-center mt-0.5">
                <Shield className="w-2.5 h-2.5 mr-0.5 text-blue-400" />
                {user?.role}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Theme Toggle inside Sidebar */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
