import React, { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Printer, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  FilterX
} from 'lucide-react';
import { exportToCSV, printReport } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';

const DynamicTable = ({
  title,
  config,
  data = [],
  meta = {},
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onEdit,
  onDelete,
  loading = false,
  searchValue = '',
  sortBy = '',
  sortOrder = 'DESC',
  filterValues = {}
}) => {
  const { isAdmin } = useAuth();
  const [activeSearch, setActiveSearch] = useState(searchValue);

  const tableFields = config.fields.filter(f => f.showInTable);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange(activeSearch);
  };

  const handleSortClick = (fieldName) => {
    const newOrder = sortBy === fieldName && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onSortChange(fieldName, newOrder);
  };

  // Build filter fields (select type fields)
  const filterableFields = config.fields.filter(f => f.type === 'select');

  const handleExport = () => {
    exportToCSV(data, tableFields, `${title.toLowerCase()}_export.csv`);
  };

  const handlePrint = () => {
    printReport(data, tableFields, title);
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (['scheduled', 'on time', 'arrived', 'economy', 'morning shift', 'pilot'].includes(s)) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    }
    if (['delayed', 'business', 'evening shift', 'cabin crew'].includes(s)) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    }
    if (['cancelled', 'first class', 'night shift', 'airport security'].includes(s)) {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    }
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition">
      
      {/* Table Actions Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Metadata */}
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {data.length} records of {meta.totalItems || data.length}
          </p>
        </div>

        {/* Filters, Searching, and Exports */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Dynamic Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder={config.searchPlaceholder || "Search..."}
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {activeSearch && (
              <button
                type="button"
                onClick={() => {
                  setActiveSearch('');
                  onSearchChange('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-3"
              >
                Clear
              </button>
            )}
          </form>

          {/* Dynamic Filters mapping */}
          {filterableFields.map(field => (
            <select
              key={field.name}
              value={filterValues[field.name] || ''}
              onChange={(e) => onFilterChange(field.name, e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All {field.label}s</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ))}

          {/* Reset Filters button */}
          {Object.keys(filterValues).some(k => filterValues[k]) && (
            <button
              onClick={() => {
                filterableFields.forEach(f => onFilterChange(f.name, ''));
              }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800 transition"
              title="Reset Filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Export tools */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Print PDF report"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Print</span>
          </button>
        </div>

      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
              {tableFields.map(field => (
                <th
                  key={field.name}
                  onClick={() => handleSortClick(field.name)}
                  className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 select-none cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{field.label}</span>
                    {sortBy === field.name ? (
                      sortOrder === 'ASC' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan={tableFields.length + 1} className="py-20 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Loading synchronization records...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={tableFields.length + 1} className="py-20 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No airport records found matching your filters.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr 
                  key={row[config.primaryKey]} 
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition duration-150"
                >
                  {tableFields.map(field => {
                    let displayVal = '';
                    if (field.derived && typeof field.getValue === 'function') {
                      displayVal = field.getValue(row);
                    } else if (field.format && typeof field.format === 'function') {
                      displayVal = field.format(row[field.name]);
                    } else {
                      displayVal = row[field.name];
                    }

                    // Special treatment for status/class styling
                    const isTag = ['status', 'class_type', 'role', 'department', 'shift_timing'].includes(field.name);

                    return (
                      <td key={field.name} className="px-6 py-4 text-xs font-medium">
                        {isTag ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold text-[10px] ${getStatusBadgeClass(displayVal)}`}>
                            {displayVal}
                          </span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-350">{displayVal !== null && displayVal !== undefined ? String(displayVal) : ''}</span>
                        )}
                      </td>
                    );
                  })}
                  
                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right space-x-1">
                    <button
                      onClick={() => onEdit(row)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-500 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      title={isAdmin ? "Edit record" : "View record details"}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(row[config.primaryKey])}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:text-rose-500 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer controls */}
      {!loading && totalPages > 1 && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DynamicTable;
