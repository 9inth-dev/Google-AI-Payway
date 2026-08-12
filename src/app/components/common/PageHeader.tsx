import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 mb-5 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? 'text-gray-600 font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold" style={{ color: '#0D3D4F' }}>
            {title}
          </h1>
          {badge}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 max-w-3xl mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
};
