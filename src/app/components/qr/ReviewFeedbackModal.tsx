import React from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { PROVISIONAL_CONFIG } from '../../config/provisionalConfig';

export const ReviewFeedbackModal: React.FC = () => {
  const {
    state,
    updateState,
    addToast,
    setRoute,
    showFeedbackModal,
    setShowFeedbackModal,
  } = useSandbox();

  if (!showFeedbackModal) return null;

  // Calculate days remaining strictly based on original provisionalStartDate
  const getDaysRemaining = () => {
    if (!state.provisionalStartDate) return PROVISIONAL_CONFIG.PROVISIONAL_PERIOD_DAYS;

    const now = new Date();
    const start = new Date(state.provisionalStartDate);
    const diffTime = now.getTime() - start.getTime();
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, PROVISIONAL_CONFIG.PROVISIONAL_PERIOD_DAYS - elapsedDays);
  };

  const daysRemaining = getDaysRemaining();
  const daysElapsed = Math.min(PROVISIONAL_CONFIG.PROVISIONAL_PERIOD_DAYS, PROVISIONAL_CONFIG.PROVISIONAL_PERIOD_DAYS - daysRemaining);

  const handleRouteToRequirement = (tab: string) => {
    setShowFeedbackModal(false);
    setRoute(`/integrations/qr-api?tab=${tab}`);
  };

  const handleResubmit = () => {
    // HARD RULE:
    // Resubmission MUST NEVER reactivate provisional production access if blocked!
    // It only updates reviewStatus to 'resubmitted'.
    // It maintains the original provisionalStartDate, productionApiKey, and usage limits.
    const currentAccessStatus = state.productionAccessStatus;

    updateState({
      reviewStatus: 'resubmitted',
      productionAccessStatus: currentAccessStatus,
    });

    if (currentAccessStatus === 'provisional_expired' || currentAccessStatus === 'provisional_limit_reached') {
      addToast(
        'Application Resubmitted',
        'Application resubmitted for review. Production key remains blocked until approval.',
        'warning'
      );
    } else {
      addToast(
        'Application Resubmitted',
        'Application resubmitted for review. You can continue accepting live payments while PayWay reviews your submission.',
        'success'
      );
    }

    setShowFeedbackModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white h-full max-w-2xl w-full shadow-2xl border-l border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-amber-950 text-white p-6 relative shrink-0">
          <button
            onClick={() => setShowFeedbackModal(false)}
            className="absolute top-5 right-5 text-gray-400 hover:text-white text-xl font-bold w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            ×
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
              PayWay Review Feedback
            </span>
            <span className="text-xs text-amber-200/80 font-mono">• 2 Feedback Items</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Reviewer Requested Changes
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Your provisional production key remains active while you make these updates. Correcting these 2 items will allow PayWay to complete final approval.
          </p>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* NOTICE BANNER */}
          {state.productionAccessStatus === 'provisional_expired' || state.productionAccessStatus === 'provisional_limit_reached' ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-rose-700 text-lg">🚫</span>
              <div className="text-xs text-rose-900 leading-relaxed">
                <strong className="font-bold text-rose-950 block mb-0.5">Key Blocked — Resubmission Disclaimer</strong>
                Resubmitting your application will not restore provisional production access. Your production key <code className="bg-rose-100 text-rose-950 px-1 py-0.5 rounded font-mono font-bold text-[11px]">{state.productionApiKey || 'pk_live_mct_883921_a9f8b7c6d5'}</code> will remain blocked until your application is approved.
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-amber-700 text-lg">ℹ️</span>
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-bold text-amber-950 block mb-0.5">Provisional Key Active During Changes</strong>
                Your live key <code className="bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-mono font-bold text-[11px]">{state.productionApiKey || 'pk_live_mct_883921_a9f8b7c6d5'}</code> is uninterrupted. You currently have <span className="font-bold text-amber-950">{daysRemaining} days remaining</span> in your provisional period.
              </div>
            </div>
          )}

          {/* STRUCTURED COMMENTS */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
              Feedback Items to Resolve (2)
            </h3>

            {/* ITEM 1 */}
            <div className="bg-white border-2 border-amber-200 hover:border-amber-300 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">
                    Successful payment screenshot
                  </h4>
                </div>
                <p className="text-xs text-gray-600 pl-7 leading-relaxed">
                  &ldquo;Successful payment screenshot does not clearly show the transaction amount.&rdquo;
                </p>
              </div>

              <button
                onClick={() => handleRouteToRequirement('testing')}
                className="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-center flex items-center gap-1.5"
              >
                <span>Update evidence</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* ITEM 2 */}
            <div className="bg-white border-2 border-amber-200 hover:border-amber-300 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">
                    EXPIRED QR state
                  </h4>
                </div>
                <p className="text-xs text-gray-600 pl-7 leading-relaxed">
                  &ldquo;Expired QR state needs clearer customer guidance.&rdquo;
                </p>
              </div>

              <button
                onClick={() => handleRouteToRequirement('testing')}
                className="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-center flex items-center gap-1.5"
              >
                <span>Review requirement</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* TIMELINE / BUSINESS RULE EXPLANATION CARD */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Provisional Lifecycle Rule Verification
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Key Preserved
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                <span className="block text-[10px] text-gray-400 font-semibold">First submission</span>
                <span className="font-bold text-gray-800">Day 1</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-amber-200">
                <span className="block text-[10px] text-amber-800 font-semibold">Changes requested</span>
                <span className="font-bold text-amber-900">Day 12</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-cyan-200">
                <span className="block text-[10px] text-cyan-800 font-semibold">Resubmission</span>
                <span className="font-bold text-cyan-900">Day {daysElapsed || 16}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-200">
                <span className="block text-[10px] text-emerald-800 font-semibold">Remaining</span>
                <span className="font-bold text-emerald-900">{daysRemaining} days</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic text-center">
              Resubmission maintains the original provisional start date ({state.provisionalStartDate ? new Date(state.provisionalStartDate).toLocaleDateString() : 'Initial Date'}), same production API key, and existing volume usage.
            </p>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Review status will update to <strong className="text-gray-800 font-bold">Resubmitted</strong> upon confirmation.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleResubmit}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Resubmit application</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
