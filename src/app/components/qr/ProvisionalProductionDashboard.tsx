import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { PROVISIONAL_CONFIG } from '../../config/provisionalConfig';
import { ReviewStatus, ProductionAccessStatus } from '../../types/sandbox';
import { AttentionCard } from './AttentionCard';
import { BlockedPaymentModal } from './BlockedPaymentModal';

interface ProvisionalProductionDashboardProps {
  onOpenResubmitModal?: () => void;
}

export const ProvisionalProductionDashboard: React.FC<ProvisionalProductionDashboardProps> = ({
  onOpenResubmitModal,
}) => {
  const { state, updateState, addToast, setShowFeedbackModal } = useSandbox();

  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Blocked Payment Modal state
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedReason, setBlockedReason] = useState<'expired' | 'tx_limit' | 'vol_limit'>('expired');

  // Calculate days remaining strictly based on provisionalStartDate
  const getDaysRemaining = () => {
    if (state.productionAccessStatus === 'full_production') return 'Unlimited';
    if (state.productionAccessStatus === 'provisional_expired') return '0 days (Expired)';
    if (!state.provisionalStartDate) return `${PROVISIONAL_CONFIG.PROVISIONAL_PERIOD_DAYS} days`;

    const now = new Date();
    const start = new Date(state.provisionalStartDate);
    const diffTime = now.getTime() - start.getTime();
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, PROVISIONAL_CONFIG.PROVISIONAL_PERIOD_DAYS - elapsedDays);
    return `${remaining} days`;
  };

  const keyToDisplay = state.productionApiKey || 'pk_live_mct_883921_a9f8b7c6d5e4';

  const handleCopyKey = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(keyToDisplay);
    }
    setCopiedKey(true);
    addToast('Key Copied', 'Production API Key copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Human-readable labels for review status
  const getReviewStatusLabel = (status: ReviewStatus) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'changes_requested':
        return 'Changes Requested';
      case 'resubmitted':
        return 'Resubmitted';
      case 'approved':
        return 'Approved';
      case 'none':
      default:
        return 'Not Submitted';
    }
  };

  // Badge styling for review status
  const getReviewStatusBadgeClass = (status: ReviewStatus) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'under_review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'changes_requested':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'resubmitted':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Human-readable labels for production access status
  const getAccessStatusLabel = (status: ProductionAccessStatus) => {
    switch (status) {
      case 'provisional_active':
        return 'Provisional Active';
      case 'provisional_expired':
        return 'Provisional Expired';
      case 'provisional_limit_reached':
        return 'Provisional Limit Reached';
      case 'full_production':
        return 'Full Production';
      case 'sandbox':
      default:
        return 'Sandbox';
    }
  };

  const isFull = state.productionAccessStatus === 'full_production' || state.reviewStatus === 'approved';
  const isExpired = !isFull && state.productionAccessStatus === 'provisional_expired';
  const isLimitReached = !isFull && state.productionAccessStatus === 'provisional_limit_reached';
  const isBlocked = isExpired || isLimitReached;

  // Simulate payment
  const handleSimulatePayment = () => {
    if (isBlocked) {
      let reason: 'expired' | 'tx_limit' | 'vol_limit' = 'expired';
      if (isLimitReached) {
        reason = (state.provisionalVolumeUSD || 0) >= PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD ? 'vol_limit' : 'tx_limit';
      }
      setBlockedReason(reason);
      setShowBlockedModal(true);
      return;
    }

    if (isFull) {
      addToast('Payment Processed', 'Live payment processed under Full Production (Unrestricted).', 'success');
      return;
    }

    // Active provisional
    const newCount = (state.provisionalTransactionUsage || 0) + 1;
    const newVol = (state.provisionalVolumeUSD || 0) + 50;

    if (newCount >= PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS) {
      updateState({
        provisionalTransactionUsage: PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS,
        provisionalVolumeUSD: newVol,
        productionAccessStatus: 'provisional_limit_reached',
      });
      setBlockedReason('tx_limit');
      setShowBlockedModal(true);
      addToast('Transaction Limit Reached', 'Key blocked: 100/100 transactions reached.', 'error');
    } else if (newVol >= PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD) {
      updateState({
        provisionalTransactionUsage: newCount,
        provisionalVolumeUSD: PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD,
        productionAccessStatus: 'provisional_limit_reached',
      });
      setBlockedReason('vol_limit');
      setShowBlockedModal(true);
      addToast('Volume Limit Reached', 'Key blocked: USD 5,000/USD 5,000 reached.', 'error');
    } else {
      updateState({
        provisionalTransactionUsage: newCount,
        provisionalVolumeUSD: newVol,
      });
      addToast('Provisional Payment Processed', `Payment processed ($50.00). Usage: ${newCount}/100 txs.`, 'success');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* HEADER SECTION */}
      <div className={`bg-gradient-to-r ${
        isFull
          ? 'from-gray-900 via-emerald-950 to-slate-900 border-emerald-500/30'
          : isBlocked
          ? 'from-rose-950 via-red-950 to-slate-900 border-rose-500/30'
          : 'from-gray-900 via-slate-800 to-cyan-950 border-cyan-500/30'
      } text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border`}>
        {/* Subtle decorative glow */}
        <div className={`absolute top-0 right-0 w-80 h-80 ${
          isFull ? 'bg-emerald-500/10' : isBlocked ? 'bg-rose-500/10' : 'bg-[#00B4CC]/10'
        } rounded-full blur-3xl pointer-events-none`} />

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
              isFull
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : isBlocked
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
            }`}>
              {isFull
                ? 'Full Production'
                : isExpired
                ? 'Provisional Expired'
                : isLimitReached
                ? 'Provisional Limit Reached'
                : 'Provisional Production Access'}
            </span>

            <span className="text-white/40 text-xs">•</span>

            <span className="text-xs font-medium flex items-center gap-1.5 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
              Key Status: {isBlocked ? 'Blocked (Pending Approval)' : isFull ? 'Active (Full Access)' : 'Active (Provisional)'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isFull
              ? 'QR API is live'
              : isExpired
              ? 'Your provisional access has expired'
              : isLimitReached
              ? (state.provisionalVolumeUSD || 0) >= PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD
                ? 'Transaction volume limit reached'
                : 'Transaction limit reached'
              : 'Provisional production access'}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            {isFull
              ? 'Your production access is fully approved. Provisional limits have been removed and your production key is active.'
              : isExpired
              ? 'Your 30 day provisional production period has ended. Your production key can no longer process payments until PayWay approves your application.'
              : isLimitReached
              ? 'You have reached the limit allowed during provisional production access. Your production key can no longer process payments until PayWay approves your application.'
              : 'Your production key is active while PayWay completes its review. Approval will remove the provisional limits from this same key.'}
          </p>
        </div>
      </div>

      {/* PROMINENT ERROR CARD (For Expired or Limit Reached) */}
      {isExpired && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-rose-200 border border-rose-300 text-rose-900 flex items-center justify-center font-bold text-lg shrink-0">
              🚫
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-extrabold text-rose-950">
                Your provisional access has expired
              </h3>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                Your 30 day provisional production period has ended. Your production key can no longer process payments until PayWay approves your application.
              </p>
              {state.reviewStatus === 'changes_requested' && (
                <p className="text-xs text-amber-900 font-semibold mt-1">
                  If PayWay has requested changes, you can still update your application and resubmit it for review.
                </p>
              )}
            </div>
          </div>

          <div className="p-3 bg-white/80 border border-rose-200 rounded-lg text-xs text-rose-950 font-medium">
            <strong>IMPORTANT DISCLAIMER:</strong> Resubmitting your application will not restore provisional production access. Your production key will remain blocked until your application is approved.
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {state.reviewStatus === 'changes_requested' && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Review requested changes
              </button>
            )}
            <button
              onClick={() => {
                const statusSection = document.getElementById('review-status-details');
                if (statusSection) statusSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-semibold text-rose-900 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              View application status
            </button>
          </div>
        </div>
      )}

      {isLimitReached && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-rose-200 border border-rose-300 text-rose-900 flex items-center justify-center font-bold text-lg shrink-0">
              ⚡
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-extrabold text-rose-950">
                {(state.provisionalVolumeUSD || 0) >= PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD
                  ? 'Transaction volume limit reached'
                  : 'Transaction limit reached'}
              </h3>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                {(state.provisionalVolumeUSD || 0) >= PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD
                  ? 'You have reached the payment volume allowed during provisional production access. Your production key can no longer process payments until PayWay approves your application.'
                  : 'You have reached the transaction limit for provisional production access. Your production key can no longer process payments until PayWay approves your application.'}
              </p>
              <div className="text-xs font-bold text-rose-950 font-mono mt-1">
                Usage: {(state.provisionalVolumeUSD || 0) >= PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD
                  ? `USD ${(PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD).toLocaleString()} of USD ${PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD.toLocaleString()} used`
                  : `${PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS} of ${PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS} transactions used`}
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/80 border border-rose-200 rounded-lg text-xs text-rose-950 font-medium">
            <strong>IMPORTANT DISCLAIMER:</strong> Resubmitting your application will not reset your transaction limit or restore production access. Your key will remain blocked until approval.
          </div>

          {state.reviewStatus === 'changes_requested' && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Review feedback &amp; resubmit
              </button>
            </div>
          )}
        </div>
      )}

      {/* ATTENTION CARD (When PayWay requests changes & key is active) */}
      {!isBlocked && <AttentionCard />}

      {/* SUMMARY GRID (Provisional limits when testing vs Approved clean status) */}
      {!isFull ? (
        <div id="review-status-details" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Days Remaining */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs flex flex-col gap-1.5 hover:border-gray-300 transition-all">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Days remaining
            </span>
            <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {getDaysRemaining()}
            </div>
            <p className="text-[11px] text-gray-400">
              {isExpired ? 'Period ended' : `From ${PROVISIONAL_CONFIG.PROVISIONAL_PERIOD_DAYS}-day initial allocation`}
            </p>
          </div>

          {/* 2. Transactions Used */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs flex flex-col gap-1.5 hover:border-gray-300 transition-all">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Transactions used
            </span>
            <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {`${state.provisionalTransactionUsage} of ${PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS}`}
            </div>
            <p className="text-[11px] text-gray-400">
              {`${Math.max(0, PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS - state.provisionalTransactionUsage)} transactions remaining`}
            </p>
          </div>

          {/* 3. Transaction Volume */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs flex flex-col gap-1.5 hover:border-gray-300 transition-all">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Transaction volume
            </span>
            <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
              USD {(state.provisionalVolumeUSD || 0).toLocaleString()} of USD {PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD.toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-400">
              USD {Math.max(0, PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD - (state.provisionalVolumeUSD || 0)).toLocaleString()} cap remaining
            </p>
          </div>

          {/* 4. Review Status */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs flex flex-col gap-1.5 hover:border-gray-300 transition-all justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Review status
            </span>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getReviewStatusBadgeClass(state.reviewStatus)}`}>
                {getReviewStatusLabel(state.reviewStatus)}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              PayWay Integration Manager
            </p>
          </div>
        </div>
      ) : (
        /* APPROVED STATE - NO PROVISIONAL LIMIT CARDS DISPLAYED */
        <div id="review-status-details" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50/40 rounded-xl border border-emerald-200/90 p-5 shadow-2xs flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Production Access Status
            </span>
            <div className="text-2xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-2">
              <span>Unlimited Access</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                No Limits
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              All provisional transaction and volume limits have been removed upon approval.
            </p>
          </div>

          <div className="bg-emerald-50/40 rounded-xl border border-emerald-200/90 p-5 shadow-2xs flex flex-col gap-1.5 justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Merchant Application
            </span>
            <div>
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                ✓ Application Approved
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              Verified by PayWay Integration Manager
            </p>
          </div>
        </div>
      )}

      {/* PRODUCTION API KEY SECTION */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Production API Key</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Use this key to authenticate live payments against PayWay Production Gateway (`api.payway.com.kh`).
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
            isBlocked ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}>
            {isBlocked ? 'Blocked (Pending Approval)' : 'Active Key'}
          </span>
        </div>

        <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-gray-400 font-sans text-[11px] uppercase font-bold shrink-0">Key:</span>
            <span className={`${isBlocked ? 'text-rose-400 line-through' : 'text-emerald-400'} font-bold tracking-wide`}>
              {showKey ? keyToDisplay : `pk_live_mct_883921_••••••••${keyToDisplay.slice(-4)}`}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-sans font-semibold transition-colors cursor-pointer"
            >
              {showKey ? 'Hide' : 'Reveal'}
            </button>

            <button
              onClick={handleCopyKey}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copiedKey ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* IMPORTANT KEY PERSISTENCE NOTE */}
        {isFull ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <span className="text-emerald-600 font-bold text-sm">✓</span>
            <span className="font-medium">
              <strong>Production Key Unrestricted.</strong> Your live API key is active with no transaction or volume limits.
            </span>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 flex items-center gap-2">
            <span className="text-cyan-600 font-bold">ℹ️</span>
            <span className="font-medium">
              <strong>This key will remain the same after approval.</strong> PayWay will not issue a replacement key upon approval; provisional restrictions will automatically be lifted from this exact key.
            </span>
          </div>
        )}
      </div>

      {/* PROTOTYPE DEMO SIMULATOR FOR INTEGRATION MANAGER REVIEW OUTCOMES */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
              🧪
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Integration Manager &amp; Lifecycle Simulator (Stakeholder Prototype Controls)
              </h4>
              <p className="text-xs text-slate-400">
                Simulate Reviewer actions and Hard Provisional Limits (Expiration, Limits) in real-time.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-400/30">
            Internal Prototype Only
          </span>
        </div>

        {/* SIMULATION ACTIONS */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Reviewer &amp; Approval Actions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                updateState({
                  reviewStatus: 'under_review',
                  productionAccessStatus: isBlocked ? state.productionAccessStatus : 'provisional_active',
                });
                addToast('Review State Updated', 'Moved application to: Under Review', 'info');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                state.reviewStatus === 'under_review'
                  ? 'bg-purple-950/80 border-purple-500/80 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold block text-purple-300">Move to Under Review</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Reviewer evaluates submission</span>
              </div>
              <span className="text-[10px] font-mono mt-2 text-purple-400 font-bold">State: under_review →</span>
            </button>

            <button
              onClick={() => {
                updateState({
                  reviewStatus: 'changes_requested',
                  productionAccessStatus: isBlocked ? state.productionAccessStatus : 'provisional_active',
                });
                addToast('Review State Updated', 'PayWay requested changes', 'warning');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                state.reviewStatus === 'changes_requested'
                  ? 'bg-amber-950/80 border-amber-500/80 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold block text-amber-300">Request Changes</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">2 items need attention</span>
              </div>
              <span className="text-[10px] font-mono mt-2 text-amber-400 font-bold">State: changes_requested →</span>
            </button>

            <button
              onClick={() => {
                updateState({
                  reviewStatus: 'approved',
                  productionAccessStatus: 'full_production',
                });
                addToast('Application Approved', 'Full production access granted! Same key reactivated with no limits.', 'success');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isFull
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold block text-emerald-300">Approve Application</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Reactivates SAME key &amp; removes limits</span>
              </div>
              <span className="text-[10px] font-mono mt-2 text-emerald-400 font-bold">State: approved / full_production →</span>
            </button>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
            2. Hard Provisional Limit &amp; Payment Testing
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Action: Expire provisional access */}
            <button
              onClick={() => {
                updateState({ productionAccessStatus: 'provisional_expired' });
                addToast('Access Expired', 'Provisional access 30-day period elapsed. Key blocked.', 'error');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isExpired
                  ? 'bg-rose-950/80 border-rose-500/80 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold block text-rose-300">Expire Provisional Access</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Simulate 30-day period end</span>
              </div>
              <span className="text-[10px] font-mono mt-2 text-rose-400 font-bold">State: provisional_expired →</span>
            </button>

            {/* Action: Reach tx limit */}
            <button
              onClick={() => {
                updateState({
                  provisionalTransactionUsage: PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS,
                  productionAccessStatus: 'provisional_limit_reached',
                });
                addToast('Tx Limit Reached', '100/100 transactions used. Key blocked.', 'error');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isLimitReached && (state.provisionalVolumeUSD || 0) < PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD
                  ? 'bg-rose-950/80 border-rose-500/80 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold block text-amber-300">Reach Tx Count Cap</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Set usage to 100/100 txs</span>
              </div>
              <span className="text-[10px] font-mono mt-2 text-amber-400 font-bold">100/100 →</span>
            </button>

            {/* Action: Reach volume limit */}
            <button
              onClick={() => {
                updateState({
                  provisionalVolumeUSD: PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD,
                  productionAccessStatus: 'provisional_limit_reached',
                });
                addToast('Volume Cap Reached', 'USD 5,000/USD 5,000 volume used. Key blocked.', 'error');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isLimitReached && (state.provisionalVolumeUSD || 0) >= PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD
                  ? 'bg-rose-950/80 border-rose-500/80 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold block text-amber-300">Reach Volume Cap</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Set volume to $5,000 cap</span>
              </div>
              <span className="text-[10px] font-mono mt-2 text-amber-400 font-bold">$5,000/$5,000 →</span>
            </button>

            {/* Action: Simulate Live Payment */}
            <button
              onClick={handleSimulatePayment}
              className="p-3 rounded-xl border border-cyan-500/60 bg-cyan-950/80 hover:bg-cyan-900 text-white text-left flex flex-col justify-between transition-all cursor-pointer shadow-sm"
            >
              <div>
                <span className="text-xs font-bold block text-cyan-300">Simulate Live Payment</span>
                <span className="text-[11px] text-slate-300 mt-0.5 block">Attempt $50.00 charge</span>
              </div>
              <span className="text-[10px] font-mono mt-2 text-cyan-400 font-bold font-sans">
                {isBlocked ? '⚠️ Will Fail (Blocked)' : '+$50.00 →'}
              </span>
            </button>
          </div>
        </div>

        {/* INDEPENDENT STATE CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
          {/* Review Status Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-300">Individual Review State Machine:</label>
            <div className="flex flex-wrap gap-1.5">
              {(['submitted', 'under_review', 'changes_requested', 'resubmitted', 'approved'] as ReviewStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    const updates: any = { reviewStatus: st };
                    if (st === 'approved') {
                      updates.productionAccessStatus = 'full_production';
                    }
                    updateState(updates);
                    addToast('Review Status Updated', `Review state changed to: ${getReviewStatusLabel(st)}`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border cursor-pointer transition-all ${
                    state.reviewStatus === st
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {getReviewStatusLabel(st)}
                </button>
              ))}
            </div>
          </div>

          {/* Production Access Status Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-300">Individual Production Access State Machine:</label>
            <div className="flex flex-wrap gap-1.5">
              {(['sandbox', 'provisional_active', 'provisional_expired', 'provisional_limit_reached', 'full_production'] as ProductionAccessStatus[]).map((pas) => (
                <button
                  key={pas}
                  onClick={() => {
                    updateState({ productionAccessStatus: pas });
                    addToast('Access Status Updated', `Production access status changed to: ${getAccessStatusLabel(pas)}`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border cursor-pointer transition-all ${
                    state.productionAccessStatus === pas
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {getAccessStatusLabel(pas)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BLOCKED PAYMENT MODAL */}
      <BlockedPaymentModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        reason={blockedReason}
      />
    </div>
  );
};
