import React from 'react';
import { useSandbox } from '../../context/SandboxContext';

interface AttentionCardProps {
  onReviewFeedback?: () => void;
  className?: string;
}

export const AttentionCard: React.FC<AttentionCardProps> = ({
  onReviewFeedback,
  className = '',
}) => {
  const { state, setShowFeedbackModal } = useSandbox();

  if (state.reviewStatus !== 'changes_requested') {
    return null;
  }

  const handleCTA = () => {
    if (onReviewFeedback) {
      onReviewFeedback();
    } else {
      setShowFeedbackModal(true);
    }
  };

  return (
    <div
      className={`p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-amber-400 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-amber-200/80 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
          ⚠️
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-sm sm:text-base font-extrabold text-amber-950 tracking-tight">
              PayWay requested changes
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 border border-amber-300/80">
              2 items need your attention
            </span>
          </div>
          <p className="text-xs text-amber-900/90 font-medium leading-relaxed">
            PayWay reviewed your production request and needs a few updates before it can be approved. You can continue using Sandbox while updating your details.
          </p>
        </div>
      </div>

      <button
        onClick={handleCTA}
        className="px-4 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 active:bg-amber-950 rounded-lg transition-all cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1.5 border border-amber-900/20"
      >
        <span>Review feedback</span>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
