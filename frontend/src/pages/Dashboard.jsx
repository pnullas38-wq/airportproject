import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { 
  Users, 
  Plane, 
  Ticket, 
  Building2, 
  DollarSign,
  Activity,
  History,
  TrendingUp,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/api/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard statistics', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle live updates
  useEffect(() => {
    if (!socket) return;
    
    const handleDbChange = () => {
      console.log('Socket message triggered dashboard statistics refresh');
      loadStats();
    };

    socket.on('db-change', handleDbChange);
    return () => {
      socket.off('db-change', handleDbChange);
    };
  }, [socket, loadStats]);

  if (loading) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-xs text-slate-400 font-semibold">Synchronizing systems analytics...</p>
        </div>
      </Layout>
    );
  }

  // Pre-configured metrics boxes
  const metrics = [
    {
      title: 'Total Passengers',
      value: stats?.counts?.passengers || 0,
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Active Flights',
      value: stats?.counts?.flights || 0,
      icon: Plane,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Booked Tickets',
      value: stats?.counts?.tickets || 0,
      icon: Ticket,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Total Revenue',
      value: stats?.counts?.totalRevenue ? `$${stats.counts.totalRevenue.toLocaleString()}` : '$0.00',
      icon: DollarSign,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
  ];

  // Helper arrays for chart configurations
  const classDistData = {
    labels: stats?.classDistribution?.map(c => c.class_type) || [],
    datasets: [{
      data: stats?.classDistribution?.map(c => c.count) || [],
      backgroundColor: [
        'rgba(14, 127, 244, 0.8)',  // Brand blue
        'rgba(245, 158, 11, 0.8)',  // Amber
        'rgba(16, 185, 129, 0.8)',  // Emerald
      ],
      borderColor: [
        'rgba(14, 127, 244, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 1,
    }]
  };

  const revenueTrendData = {
    labels: stats?.bookingTrends?.map(b => b.booking_date) || [],
    datasets: [
      {
        type: 'line',
        label: 'Daily Bookings Count',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y',
        data: stats?.bookingTrends?.map(b => b.count) || [],
        tension: 0.3
      },
      {
        type: 'bar',
        label: 'Daily Revenue ($)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        yAxisID: 'y1',
        data: stats?.bookingTrends?.map(b => b.revenue) || [],
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 10, weight: '600' },
          color: '#64748b'
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 9 }, color: '#64748b' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: 'rgba(100, 116, 139, 0.08)' },
        ticks: { font: { size: 9 }, color: '#64748b' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 9 }, color: '#64748b' }
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2 tracking-tight">
              <span>Operations Analytics</span>
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse-slow" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time monitoring dashboard and analytics engine for Airport metrics.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Airports: <b>{stats?.counts?.airports || 0}</b></span>
            </span>
            <div className="w-px h-3 bg-slate-250 dark:bg-slate-700" />
            <span className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Staff: <b>{stats?.counts?.staff || 0}</b></span>
            </span>
          </div>
        </div>

        {/* Metrics Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 tracking-wide">{metric.title}</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-50 tracking-tight">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue and Booking Trend (Line + Bar Chart) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>Financial & Booking Trend</span>
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-semibold text-slate-500">
                Last 15 Days
              </span>
            </div>
            <div className="flex-1 relative min-h-[250px]">
              {stats?.bookingTrends?.length > 0 ? (
                <Bar data={revenueTrendData} options={chartOptions} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  Insufficient historical data to render trends
                </div>
              )}
            </div>
          </div>

          {/* Ticket Class Distribution (Doughnut Chart) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col min-h-[350px]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Seat Class Distribution</span>
            </h3>
            <div className="flex-1 relative min-h-[200px] flex items-center justify-center">
              {stats?.classDistribution?.length > 0 ? (
                <div className="w-full h-full max-h-[220px]">
                  <Doughnut 
                    data={classDistData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false, 
                      plugins: { 
                        legend: { 
                          position: 'bottom',
                          labels: { font: { size: 9 }, color: '#64748b' }
                        } 
                      } 
                    }} 
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400">No ticket sales recorded yet</span>
              )}
            </div>
          </div>

        </div>

        {/* Database Views (Flight Occupancy) and Trigger Logs (Audit Logs) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Flight Occupancy (View Query) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Seat Load Factor & Revenue (from vw_flight_occupancy)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800 pb-2 text-[10px] text-slate-400 uppercase font-semibold">
                    <th className="py-2">Flight</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Bookings</th>
                    <th className="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                  {stats?.flightOccupancy?.map((flight, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-350">{flight.flight_name}</td>
                      <td>{flight.source}</td>
                      <td>{flight.destination}</td>
                      <td>
                        <span className="inline-flex px-2 py-0.5 rounded-full font-semibold text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {flight.total_bookings} seats
                        </span>
                      </td>
                      <td className="text-right font-bold">${parseFloat(flight.total_revenue).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!stats?.flightOccupancy || stats.flightOccupancy.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">No scheduled flights active</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sync Trigger Logs (Triggers Audit Trail) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center space-x-1.5">
              <History className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Sync Logs (Triggers audit_logs table)</span>
            </h3>
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {stats?.recentAudits?.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs">
                  <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-blue-500">
                        {log.action_type} - {log.table_name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.action_timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed truncate-2-lines">{log.details}</p>
                  </div>
                </div>
              ))}
              {(!stats?.recentAudits || stats.recentAudits.length === 0) && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Awaiting database transaction records...
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;
