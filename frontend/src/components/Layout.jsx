import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  Server,
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Monitor socket events to throw quick real-time notifications on the UI!
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;

    const handleDbChange = (payload) => {
      const typeLabel = {
        'CREATE': 'Added new record to',
        'UPDATE': 'Updated record in',
        'DELETE': 'Deleted record from'
      };

      const newNotif = {
        id: Date.now(),
        title: 'Database Synchronization',
        message: `${typeLabel[payload.action] || 'Modified'} ${payload.model}`,
        time: new Date().toLocaleTimeString(),
        type: payload.action === 'DELETE' ? 'warning' : 'success'
      };

      setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep last 10
    };

    socket.on('db-change', handleDbChange);
    return () => {
      socket.off('db-change', handleDbChange);
    };
  }, [socket]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 text-slate-900 dark:text-slate-100 flex">
      {/* Admin Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        
        {/* Header Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 shadow-sm">
          
          {/* Dashboard Left Side Indicators */}
          <div className="flex items-center space-x-4">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-500" />
              <span>AMS Central Gateway</span>
            </h2>
            
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            
            {/* Realtime API status */}
            <div className="flex items-center space-x-1.5">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Sync Engine Active</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span className="text-xs font-medium text-rose-500">Connecting Sync...</span>
                </>
              )}
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-4">
            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-850">
                    <h3 className="font-semibold text-sm">Synchronizer Logs</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto py-1">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        No recent sync alerts
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start space-x-3 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0"
                        >
                          {notif.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{notif.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                          </div>
                          <button 
                            onClick={() => removeNotification(notif.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Summary */}
            <div className="flex items-center space-x-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none">{user?.username}</p>
                <span className="text-[10px] font-semibold text-slate-400 capitalize">{user?.role}</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/35 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm select-none">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>

          </div>
        </header>

        {/* Actionable Content Window */}
        <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
