import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 mb-5 ${className}`}>
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
