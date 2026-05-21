import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import DynamicTable from '../components/DynamicTable';
import DynamicForm from '../components/DynamicForm';
import { moduleConfigs } from '../config/moduleConfigs';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Plus, X, AlertCircle, Sparkles } from 'lucide-react';

const ModuleManager = () => {
  const { moduleKey } = useParams();
  const config = moduleConfigs[moduleKey];
  const { socket } = useSocket();
  const { isAdmin } = useAuth();

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [filterValues, setFilterValues] = useState({});

  // Modal forms controller states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [toast, setToast] = useState(null);

  // Set default sorting index based on configuration
  useEffect(() => {
    if (config) {
      setSortBy(config.primaryKey);
      setSortOrder('DESC');
      setCurrentPage(1);
      setSearchValue('');
      setFilterValues({});
      setData([]);
    }
  }, [moduleKey, config]);

  // Toast notifier animation helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Reusable API loading handler
  const loadRecords = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      // Build request params
      const params = {
        page: currentPage,
        limit: 10,
        search: searchValue,
        sortBy: sortBy || config.primaryKey,
        sortOrder,
        ...filterValues
      };

      const res = await api.get(config.apiEndpoint, { params });
      if (res.data.success) {
        setData(res.data.data);
        setMeta(res.data.meta || {});
      }
    } catch (error) {
      console.error(`Failed to load ${moduleKey}`, error);
      showToast(error.response?.data?.message || 'Error loading sync details', 'error');
    } finally {
      setLoading(false);
    }
  }, [config, currentPage, searchValue, sortBy, sortOrder, filterValues, moduleKey]);

  // Perform fetching
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Hook into Socket.io database sync broadcasts
  useEffect(() => {
    if (!socket || !config) return;

    const handleDbChange = (payload) => {
      // Check if this socket update applies directly to our currently active screen
      // backend model name matches: e.g. Passenger -> passengers, Flight -> flights, Ticket -> tickets
      const modelMapping = {
        'Passenger': 'passengers',
        'Flight': 'flights',
        'Ticket': 'tickets',
        'Staff': 'staff',
        'Airport': 'airports'
      };

      if (modelMapping[payload.model] === moduleKey) {
        console.log(`Socket triggered refresh for module: ${moduleKey}`);
        loadRecords();
      }
    };

    socket.on('db-change', handleDbChange);
    return () => {
      socket.off('db-change', handleDbChange);
    };
  }, [socket, config, moduleKey, loadRecords]);

  if (!config) {
    return (
      <Layout>
        <div className="py-20 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-500 mb-3" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Invalid Module URL</h3>
          <p className="text-sm mt-1">The requested administrative module config does not exist.</p>
        </div>
      </Layout>
    );
  }

  // CRUD API calls
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedRecord) {
        // UPDATE record
        const id = selectedRecord[config.primaryKey];
        const res = await api.put(`${config.apiEndpoint}/${id}`, formData);
        if (res.data.success) {
          showToast(`${config.singularTitle} updated successfully!`);
          setIsModalOpen(false);
          setSelectedRecord(null);
        }
      } else {
        // CREATE record
        const res = await api.post(config.apiEndpoint, formData);
        if (res.data.success) {
          showToast(`${config.singularTitle} created successfully!`);
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error('API submission failure', error);
      showToast(error.response?.data?.message || 'Error processing record request', 'error');
    }
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${config.singularTitle.toLowerCase()}?`)) {
      return;
    }

    try {
      const res = await api.delete(`${config.apiEndpoint}/${id}`);
      if (res.data.success) {
        showToast(`${config.singularTitle} deleted successfully!`);
      }
    } catch (error) {
      console.error('Delete request failure', error);
      showToast(error.response?.data?.message || 'Failed to delete record', 'error');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Module Title Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2 tracking-tight">
              <span>{config.title}</span>
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse-slow" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Admin Gateway for viewing, sorting, indexing, and modifying {config.title.toLowerCase()} configurations.
            </p>
          </div>
          
          {/* Quick Create new */}
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedRecord(null);
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add {config.singularTitle}</span>
            </button>
          )}
        </div>

        {/* Global Toast Alerts */}
        {toast && (
          <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl flex items-center space-x-3 z-50 animate-bounce ${
            toast.type === 'error' 
              ? 'bg-rose-600 text-white shadow-rose-600/10 border border-rose-500/30' 
              : 'bg-emerald-600 text-white shadow-emerald-600/10 border border-emerald-500/30'
          }`}>
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Dynamic Database Table Frame */}
        <DynamicTable
          title={config.title}
          config={config}
          data={data}
          meta={meta}
          currentPage={currentPage}
          totalPages={meta.totalPages || 1}
          onPageChange={setCurrentPage}
          onSearchChange={setSearchValue}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
          onFilterChange={(field, val) => {
            setFilterValues(prev => ({ ...prev, [field]: val }));
            setCurrentPage(1);
          }}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          loading={loading}
          searchValue={searchValue}
          sortBy={sortBy}
          sortOrder={sortOrder}
          filterValues={filterValues}
        />

        {/* Modal CRUD Editor Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Title */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {selectedRecord ? `Modify ${config.singularTitle}` : `Add New ${config.singularTitle}`}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {selectedRecord ? 'Update fields to save' : 'Fill required fields to create new database record'}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic form generator */}
              <DynamicForm
                config={config}
                initialData={selectedRecord}
                isEdit={!!selectedRecord}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
              />

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ModuleManager;
