import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';

export const FloatingSetupGuide: React.FC = () => {
  const { state, updateState, setRoute, transactions, apiLogs, setShowFeedbackModal } = useSandbox();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);

  if (state.setupGuideDismissed) {
    return null;
  }

  // Task 1: Start your first integration
  const hasAnyIntegration =
    !state.firstTimeUser && (
      Boolean(state.hasCreatedFirstIntegration) ||
      Boolean(state.hasIntegration) ||
      (state.qrIntegrationStatus !== 'not_started' && state.qrIntegrationStatus !== undefined)
    );
  const task1Complete = hasAnyIntegration;

  // Task 2: Make your first API call
  const task2Complete =
    !state.firstTimeUser && (
      Boolean(state.hasMadeFirstApiCall) ||
      Boolean(apiLogs && apiLogs.some(log => log.status >= 200 && log.status < 300))
    );

  // Task 3: Make your first test payment
  const task3Complete =
    !state.firstTimeUser && (
      Boolean(state.hasCompletedFirstTestPayment) ||
      Boolean(transactions && transactions.some(tx => tx.status === 'SUCCESS' || tx.status === 'success' || tx.status === 'completed')) ||
      state.testingState?.paymentCompleted?.status === 'verified'
    );

  // Task 4: Request Production Access
  const task4Complete =
    !state.firstTimeUser && (
      state.reviewStatus === 'submitted' ||
      state.reviewStatus === 'under_review' ||
      state.reviewStatus === 'changes_requested' ||
      state.reviewStatus === 'resubmitted' ||
      state.reviewStatus === 'approved' ||
      (state.reviewStatus !== 'none' && state.reviewStatus !== undefined) ||
      state.productionAccessStatus === 'pending_review' ||
      state.productionAccessStatus === 'full_production' ||
      state.productionAccessStatus === 'submitted' ||
      state.productionAccessStatus === 'under_review' ||
      state.productionAccessStatus === 'changes_requested' ||
      state.productionAccessStatus === 'resubmitted'
    );

  // Task 5: Go live with your first product
  const hasGoneLive =
    !state.firstTimeUser &&
    state.reviewStatus === 'approved' &&
    Boolean(state.productionApiKey || state.productionAccessStatus === 'full_production');
  const task5Complete = hasGoneLive;

  const tasks = [
    { id: 1, complete: task1Complete },
    { id: 2, complete: task2Complete },
    { id: 3, complete: task3Complete },
    { id: 4, complete: task4Complete },
    { id: 5, complete: task5Complete },
  ];

  const completedCount = tasks.filter(t => t.complete).length;
  const isAllComplete = completedCount === 5;

  const handleDismiss = () => {
    updateState({ setupGuideDismissed: true, showPostTourGuideHighlight: false });
  };

  const handleCloseTooltip = () => {
    updateState({ showPostTourGuideHighlight: false });
  };

  const handleOpenFromTooltip = () => {
    updateState({ showPostTourGuideHighlight: false });
    setIsExpanded(true);
  };

  // Task 1 Action
  const handleTask1Action = () => {
    setRoute('/integrations');
  };

  // Task 2 Action
  const handleTask2Action = () => {
    if (!hasAnyIntegration) {
      setRoute('/integrations');
    } else {
      setRoute('/integrations/qr-api');
    }
  };

  // Task 3 Action
  const handleTask3Action = () => {
    if (!hasAnyIntegration) {
      setRoute('/integrations');
    } else {
      setRoute('/integrations/qr-api/testing');
    }
  };

  // Task 4 Action
  const techVerified =
    (state.testingState?.testTransactionsCount || 0) >= 5 &&
    state.testingState?.webhookReceived.status === 'verified';
  const evidenceAttached =
    !!state.uiEvidence?.recordingAttached &&
    !!state.uiEvidence?.screenshotAttached;

  let task4ActionText = 'Request production access →';
  if (!techVerified) {
    task4ActionText = 'Continue integration →';
  } else if (!evidenceAttached) {
    task4ActionText = 'Complete requirements →';
  } else {
    task4ActionText = 'Request production access →';
  }

  const handleTask4Action = () => {
    if (!techVerified) {
      setRoute('/integrations/qr-api');
    } else if (!evidenceAttached) {
      setRoute('/integrations/qr-api/evidence');
    } else {
      setRoute('/integrations/qr-api/production');
    }
  };

  // Task 5 Action & Microcopy
  let task5ActionText = 'Request production access →';
  let task5StatusText: string | undefined = undefined;
  let task5Microcopy: string | undefined = undefined;

  if (state.reviewStatus === 'submitted' || state.reviewStatus === 'under_review') {
    task5StatusText = 'Under PayWay review';
    task5Microcopy = 'Reviews usually take 2 to 3 working days.';
    task5ActionText = 'View review status →';
  } else if (state.reviewStatus === 'changes_requested') {
    task5ActionText = 'Review feedback →';
  } else if (state.reviewStatus === 'resubmitted') {
    task5StatusText = 'Back under review';
    task5Microcopy = 'Reviews usually take 2 to 3 working days.';
    task5ActionText = 'View review status →';
  } else if (state.reviewStatus === 'none' || !task4Complete) {
    task5ActionText = 'Request production access →';
  }

  const handleTask5Action = () => {
    if (state.reviewStatus === 'changes_requested') {
      setRoute('/integrations/qr-api/production');
      if (setShowFeedbackModal) {
        setShowFeedbackModal(true);
      }
    } else if (
      state.reviewStatus === 'submitted' ||
      state.reviewStatus === 'under_review' ||
      state.reviewStatus === 'resubmitted'
    ) {
      setRoute('/integrations/qr-api/production');
    } else {
      handleTask4Action();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans select-none flex flex-col items-end gap-3">
      {/* Post-Tour Attention Tooltip */}
      {state.showPostTourGuideHighlight && !isExpanded && (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 max-w-xs text-left animate-bounce-short z-50 relative">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-cyan-300">Keep going with your Setup Guide</h4>
            <button
              onClick={handleCloseTooltip}
              className="text-gray-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-gray-300 mb-3 leading-relaxed">
            We&apos;ll keep track of the essential things to complete as you build your first PayWay integration.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFromTooltip}
              className="px-3 py-1.5 rounded-lg bg-[#00B4CC] hover:bg-[#0A9BB0] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              View Setup Guide
            </button>
            <button
              onClick={handleCloseTooltip}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Got it
            </button>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-2 right-8 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45" />
        </div>
      )}

      {!isExpanded ? (
        /* Collapsed Floating Pill */
        <button
          onClick={() => {
            if (state.showPostTourGuideHighlight) {
              updateState({ showPostTourGuideHighlight: false });
            }
            setIsExpanded(true);
          }}
          className={`bg-white text-gray-800 border shadow-xl rounded-full px-4 py-2.5 flex items-center gap-3 text-xs font-semibold hover:border-cyan-400 hover:shadow-2xl transition-all cursor-pointer group ${
            state.showPostTourGuideHighlight ? 'ring-2 ring-cyan-400 border-cyan-400' : 'border-gray-200'
          }`}
        >
          {/* Progress Ring / Icon */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            {isAllComplete ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold">
                ✓
              </div>
            ) : (
              <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#00B4CC] transition-all duration-500"
                  strokeDasharray={`${(completedCount / 5) * 100}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            )}
          </div>

          <span>
            {isAllComplete ? (
              <span className="text-emerald-700 font-bold">Setup complete 🎉</span>
            ) : (
              <>
                Setup guide <span className="text-[#00B4CC]">· {completedCount} of 5</span>
              </>
            )}
          </span>

          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="text-gray-400 group-hover:text-gray-600 transition-transform group-hover:-translate-y-0.5"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      ) : (
        /* Expanded Setup Card */
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-84 p-5 transition-all text-left">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00B4CC] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00B4CC]" />
              Setup Guide ({completedCount}/5)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2 py-0.5 rounded hover:bg-gray-100 cursor-pointer"
                title="Minimise guide"
              >
                Minimise
              </button>
              <button
                onClick={() => setShowDismissConfirm(true)}
                className="text-xs text-gray-400 hover:text-red-600 font-medium px-1.5 py-0.5 rounded hover:bg-red-50 cursor-pointer"
                title="Dismiss setup guide"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Dismiss Confirmation prompt */}
          {showDismissConfirm ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 text-xs">
              <p className="font-semibold text-slate-800 mb-1">
                Dismiss Setup Guide?
              </p>
              <p className="text-gray-500 mb-3 text-[11px]">
                You can reopen setup guidance from Help & Documentation anytime.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-1.5 rounded bg-red-600 text-white font-semibold text-[11px] hover:bg-red-700 cursor-pointer"
                >
                  Yes, dismiss
                </button>
                <button
                  onClick={() => setShowDismissConfirm(false)}
                  className="flex-1 py-1.5 rounded bg-gray-200 text-gray-700 font-semibold text-[11px] hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {/* Header */}
          {isAllComplete ? (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
              <div className="text-2xl mb-1">🎉</div>
              <h3 className="text-sm font-bold text-emerald-900">You&apos;re all set 🎉</h3>
              <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                You&apos;ve completed the essential PayWay journey and your first product is live.
              </p>
              <button
                onClick={handleDismiss}
                className="mt-3 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="mb-3">
              <h3 className="text-sm font-bold text-gray-800">Setup Guide</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Complete these essentials as you build your first PayWay integration.
              </p>
            </div>
          )}

          {/* Tasks List */}
          <div className="flex flex-col gap-2">
            {/* Task 1 */}
            <TaskRow
              number={1}
              title="1. Start your first integration"
              description="Choose a PayWay product and create your first Sandbox integration."
              isComplete={task1Complete}
              actionText="Explore integrations →"
              onAction={handleTask1Action}
            />

            {/* Task 2 */}
            <TaskRow
              number={2}
              title="2. Make your first API call"
              description="Send your first successful request to a PayWay Sandbox endpoint."
              isComplete={task2Complete}
              actionText={!hasAnyIntegration ? "Start an integration →" : "Open integration →"}
              onAction={handleTask2Action}
            />

            {/* Task 3 */}
            <TaskRow
              number={3}
              title="3. Make your first test payment"
              description="Complete a successful payment using the PayWay Sandbox simulator."
              isComplete={task3Complete}
              actionText={!hasAnyIntegration ? "Start an integration →" : "Test a payment →"}
              onAction={handleTask3Action}
            />

            {/* Task 4 */}
            <TaskRow
              number={4}
              title="4. Request Production Access"
              description="Complete your production requirements and submit your integration to PayWay for review."
              isComplete={task4Complete}
              actionText={task4ActionText}
              onAction={handleTask4Action}
            />

            {/* Task 5 */}
            <TaskRow
              number={5}
              title="5. Go live with your first product"
              description="Get your production request approved and receive your production credentials."
              isComplete={task5Complete}
              statusText={task5StatusText}
              microcopy={task5Microcopy}
              actionText={task5ActionText}
              onAction={handleTask5Action}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskRowProps {
  number: number;
  title: string;
  description: string;
  isComplete: boolean;
  actionText?: string;
  onAction?: () => void;
  statusText?: string;
  microcopy?: string;
}

const TaskRow: React.FC<TaskRowProps> = ({
  number,
  title,
  description,
  isComplete,
  actionText,
  onAction,
  statusText,
  microcopy,
}) => {
  return (
    <div
      onClick={() => !isComplete && onAction && onAction()}
      className={`p-2.5 rounded-lg border transition-all ${
        isComplete
          ? 'bg-gray-50/80 border-gray-100'
          : 'bg-white border-cyan-100 hover:border-cyan-300 hover:shadow-xs cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isComplete ? (
          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
            ✓
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center text-[9px] font-bold text-[#00B4CC] shrink-0 mt-0.5">
            {number}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold ${isComplete ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {title}
          </div>
          <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
            {description}
          </div>

          {!isComplete && statusText && (
            <div className="mt-1.5 p-1.5 bg-purple-50/80 border border-purple-200/80 rounded text-[10px] text-purple-900">
              <span className="font-bold block">{statusText}</span>
              {microcopy && <span className="text-[9.5px] text-purple-700 block mt-0.5">{microcopy}</span>}
            </div>
          )}

          <div className="text-[10px] mt-1.5">
            {isComplete ? (
              <span className="text-emerald-600 font-semibold">Completed</span>
            ) : (
              actionText && (
                <span className="text-[#00B4CC] font-semibold hover:underline flex items-center gap-0.5">
                  {actionText}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
