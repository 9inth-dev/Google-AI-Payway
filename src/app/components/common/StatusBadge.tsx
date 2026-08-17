import React from 'react';

export type StatusVariant = 
  | 'testing'
  | 'active'
  | 'completed'
  | 'submitted'
  | 'resubmitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'live'
  | 'sandbox'
  | 'locked'
  | 'pending'
  | 'failed'
  | 'in_progress'
  | 'not_started'
  | 'success';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const normStatus = status.toLowerCase().replace(/\s+/g, '_');

  let bg = '#F3F4F6';
  let text = '#4B5563';
  let border = '#E5E7EB';
  let dotColor = '#9CA3AF';
  let defaultLabel = status;

  switch (normStatus) {
    case 'testing':
      bg = '#E6F8FA';
      text = '#0A9BB0';
      border = '#B2ECF3';
      dotColor = '#00B4CC';
      defaultLabel = 'Testing Mode';
      break;
    case 'active':
    case 'approved':
    case 'live':
    case 'completed':
    case 'success':
      bg = '#ECFDF5';
      text = '#059669';
      border = '#A7F3D0';
      dotColor = '#10B981';
      defaultLabel = normStatus === 'success' ? 'Successful' : normStatus === 'live' ? 'Live Production' : normStatus === 'approved' ? 'Approved' : normStatus === 'active' ? 'Active' : 'Completed';
      break;
    case 'submitted':
    case 'resubmitted':
    case 'under_review':
    case 'pending':
    case 'in_progress':
      bg = '#EFF6FF';
      text = '#2563EB';
      border = '#BFDBFE';
      dotColor = '#3B82F6';
      defaultLabel = normStatus === 'submitted' ? 'Submitted' : normStatus === 'resubmitted' ? 'Resubmitted' : normStatus === 'under_review' ? 'Under Review' : normStatus === 'pending' ? 'Pending' : 'In Progress';
      break;
    case 'changes_requested':
      bg = '#FFFBEB';
      text = '#D97706';
      border = '#FDE68A';
      dotColor = '#F59E0B';
      defaultLabel = 'Changes Requested';
      break;
    case 'locked':
    case 'failed':
      bg = '#FEF2F2';
      text = '#DC2626';
      border = '#FECACA';
      dotColor = '#EF4444';
      defaultLabel = normStatus === 'locked' ? 'Locked' : 'Failed';
      break;
    case 'not_started':
      bg = '#F3F4F6';
      text = '#6B7280';
      border = '#E5E7EB';
      dotColor = '#9CA3AF';
      defaultLabel = 'Not Started';
      break;
  }

  const displayLabel = label || defaultLabel;

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-semibold gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${sizeStyles} ${className}`}
      style={{
        backgroundColor: bg,
        color: text,
        borderColor: border,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
};
