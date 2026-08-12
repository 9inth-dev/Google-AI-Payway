import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${
        bordered ? 'border border-gray-100' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', action }) => {
  return (
    <div className={`p-5 pb-3 flex items-start justify-between ${className}`}>
      <div>{children}</div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
};

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconBg?: string;
}> = ({ children, className = '', icon, iconBg = '#E6F8FA' }) => {
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
      )}
      <h2 className={`text-sm font-semibold text-gray-800 ${className}`}>
        {children}
      </h2>
    </div>
  );
};

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <p className={`text-xs text-gray-500 mt-1 leading-relaxed ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`p-5 pt-2 ${className}`}>{children}</div>;
};
