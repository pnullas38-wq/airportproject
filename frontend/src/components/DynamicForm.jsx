import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

const DynamicForm = ({
  config,
  initialData = null,
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [lookups, setLookups] = useState({});
  const [loadingLookups, setLoadingLookups] = useState(false);

  const formFields = config.fields.filter(f => f.showInForm);

  // Initialize form fields
  useEffect(() => {
    const defaultData = {};
    formFields.forEach(field => {
      if (initialData && initialData[field.name] !== undefined) {
        // Date formatting helper for datetime-local
        if (field.type === 'datetime-local' && initialData[field.name]) {
          defaultData[field.name] = new Date(initialData[field.name]).toISOString().slice(0, 16);
        } else {
          defaultData[field.name] = initialData[field.name];
        }
      } else {
        defaultData[field.name] = typeof field.defaultValue === 'function' 
          ? field.defaultValue() 
          : (field.defaultValue !== undefined ? field.defaultValue : '');
      }
    });
    setFormData(defaultData);
    setErrors({});
  }, [initialData, config]);

  // Load lookup modules dynamically (e.g. Passengers and Flights dropdowns for Ticket booking)
  useEffect(() => {
    const fetchLookups = async () => {
      const lookupFields = formFields.filter(f => f.type === 'lookup');
      if (lookupFields.length === 0) return;

      setLoadingLookups(true);
      const tempLookups = {};
      
      try {
        for (const field of lookupFields) {
          // Fetch lookup items (limit to a large number e.g. 100 for dropdown efficiency)
          const endpoint = field.lookupModule === 'passengers' ? '/api/passengers' : '/api/flights';
          const res = await api.get(`${endpoint}?limit=100`);
          if (res.data.success) {
            tempLookups[field.name] = res.data.data;
          }
        }
        setLookups(tempLookups);
      } catch (error) {
        console.error('Failed to load lookup references', error);
      } finally {
        setLoadingLookups(false);
      }
    };

    fetchLookups();
  }, [config]);

  // Client-side field level validation
  const validateField = (field, value) => {
    if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, minLength, maxLength, pattern, patternMessage } = field.validation;
      
      if (field.type === 'number') {
        const numVal = parseFloat(value);
        if (!isNaN(numVal)) {
          if (min !== undefined && numVal < min) return `${field.label} must be at least ${min}`;
          if (max !== undefined && numVal > max) return `${field.label} cannot exceed ${max}`;
        }
      }

      if (typeof value === 'string') {
        const strVal = value.trim();
        if (minLength !== undefined && strVal.length < minLength) {
          return `${field.label} must be at least ${minLength} characters`;
        }
        if (maxLength !== undefined && strVal.length > maxLength) {
          return `${field.label} cannot exceed ${maxLength} characters`;
        }
        if (pattern) {
          const regex = new RegExp(pattern);
          if (!regex.test(strVal)) {
            return patternMessage || `${field.label} format is invalid`;
          }
        }
      }
    }
    return '';
  };

  const handleChange = (fieldName, val) => {
    const field = formFields.find(f => f.name === fieldName);
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: val
    }));

    if (field) {
      const errorMsg = validateField(field, val);
      setErrors(prev => ({
        ...prev,
        [fieldName]: errorMsg
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all form fields
    const tempErrors = {};
    let isFormValid = true;

    formFields.forEach(field => {
      const errorMsg = validateField(field, formData[field.name]);
      if (errorMsg) {
        tempErrors[field.name] = errorMsg;
        isFormValid = false;
      }
    });

    setErrors(tempErrors);

    if (isFormValid) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map(field => {
          const hasError = !!errors[field.name];
          
          return (
            <div key={field.name} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} flex flex-col space-y-1.5`}>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>

              {/* Select Options Field */}
              {field.type === 'select' && (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={field.readOnly}
                  className={`text-xs p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 transition ${
                    hasError 
                      ? 'border-rose-500 focus:ring-rose-500' 
                      : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {/* Lookups relation field */}
              {field.type === 'lookup' && (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={field.readOnly || loadingLookups}
                  className={`text-xs p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 transition ${
                    hasError 
                      ? 'border-rose-500 focus:ring-rose-500' 
                      : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500'
                  }`}
                >
                  <option value="">
                    {loadingLookups ? 'Synchronizing references...' : `Select ${field.label}`}
                  </option>
                  
                  {lookups[field.name]?.map(item => {
                    const idAttr = field.lookupModule === 'passengers' ? 'passenger_id' : 'flight_id';
                    
                    let label = '';
                    if (field.lookupModule === 'passengers') {
                      label = `${item.name} (${item.passport_number})`;
                    } else {
                      label = `${item.flight_name} | ${item.source} ➔ ${item.destination}`;
                    }

                    return (
                      <option key={item[idAttr]} value={item[idAttr]}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              )}

              {/* Regular Input types (Text, Number, Date, Tel, Email, Datetime) */}
              {field.type !== 'select' && field.type !== 'lookup' && (
                <input
                  type={field.type}
                  value={formData[field.name] !== undefined && formData[field.name] !== null ? formData[field.name] : ''}
                  placeholder={field.placeholder || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={field.readOnly}
                  className={`text-xs p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 transition ${
                    hasError 
                      ? 'border-rose-500 focus:ring-rose-500' 
                      : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500'
                  }`}
                />
              )}

              {/* Validation failure badge */}
              {hasError && (
                <span className="text-[10px] text-rose-500 flex items-center space-x-1 mt-1 font-semibold animate-pulse">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors[field.name]}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Button tools */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/10 transition text-xs"
        >
          {isEdit ? 'Save Changes' : `Add ${config.singularTitle}`}
        </button>
      </div>

    </form>
  );
};

export default DynamicForm;
