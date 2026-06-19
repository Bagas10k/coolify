import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  icon,
  badge,
  badgeVariant = 'primary', // 'primary' | 'secondary' | 'yellow'
  onClick,
  className = '',
  footer,
  ...props
}) {
  const isClickable = typeof onClick === 'function';

  const badgeVariants = {
    primary: 'bg-blue-50 text-blue-600 border border-blue-100',
    secondary: 'bg-purple-50 text-purple-600 border border-purple-100',
    yellow: 'bg-amber-50 text-amber-600 border border-amber-100',
  };

  return (
    <div
      onClick={onClick}
      className={`card-component bg-white border border-slate-100/80 rounded-3xl p-8 transition-all duration-300 ease-in-out shadow-sm
        ${isClickable ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200/80 active:scale-[0.98]' : ''} 
        ${className}`}
      {...props}
    >
      {(icon || badge || title) && (
        <div className="flex items-start justify-between mb-6">
          {icon && (
            <div className="card-icon-wrapper p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              {icon}
            </div>
          )}
          {badge && (
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full ${badgeVariants[badgeVariant]}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      {title && <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-snug mb-2">{title}</h3>}
      {subtitle && <p className="text-xs font-semibold text-slate-400 mb-4">{subtitle}</p>}
      
      <div className="card-body-content text-sm text-slate-600 leading-relaxed">
        {children}
      </div>

      {footer && (
        <div className="card-footer-content mt-6 pt-5 border-t border-slate-100/60 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
