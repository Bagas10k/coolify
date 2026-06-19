import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  error = '',
  icon,
  className = '',
  ...props
}) {
  return (
    <div className={`field-component flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          {icon && <span className="text-slate-400">{icon}</span>}
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-3 text-sm bg-slate-50/70 border rounded-xl text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20' 
              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white'
            }`}
          {...props}
        />
      </div>

      {error && <span className="text-xs font-semibold text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}
