import React from 'react';
import { useSandbox, SAMPLE_API_LOGS } from '../../context/SandboxContext';

interface PrototypeControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrototypeControlsModal: React.FC<PrototypeControlsModalProps> = ({ isOpen, onClose }) => {
  const { updateState, updateTestingState, addToast, setRoute, setApiLogs, setTransactions } = useSandbox();

  if (!isOpen) return null;

  const applyPreset = (presetName: string) => {
    const now = new Date();

    switch (presetName) {
      case 'first_time':
        setApiLogs([]);
        setTransactions([]);
        updateState({
          isLoggedIn: true,
          firstTimeUser: true,
          hasSeenSandboxWelcome: false,
          hasCompletedWelcomeTour: false,
          hasIntegration: false,
          hasViewedSandboxCredentials: false,
          hasCreatedFirstIntegration: false,
          hasCompletedFirstTestPayment: false,
          hasCopiedApiCredentials: false,
          hasMadeFirstApiCall: false,
          showPostTourGuideHighlight: false,
          setupGuideDismissed: false,
          hasVisitedIntegrations: false,
          qrIntegrationStatus: 'not_started',
          productionAccessStatus: 'sandbox',
          reviewStatus: 'none',
        });
        updateTestingState({
          qrGenerated: { status: 'not_detected' },
          paymentCompleted: { status: 'not_detected' },
          webhookReceived: { status: 'not_detected' },
          statusConfirmed: { status: 'not_detected' },
          customerPaymentStates: { status: 'not_detected', successStateDetected: false, expiredStateDetected: false },
        });
        addToast('Preset Applied: First Time User', 'Reset sandbox to initial unintegrated state with Welcome screen', 'info');
        setRoute('/welcome');
        break;

      case 'integration_started':
        setApiLogs(SAMPLE_API_LOGS.slice(0, 1));
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasSeenSandboxWelcome: true,
          hasCompletedWelcomeTour: true,
          hasIntegration: true,
          qrIntegrationStatus: 'in_progress',
          productionAccessStatus: 'sandbox',
          reviewStatus: 'none',
        });
        updateTestingState({
          qrGenerated: { status: 'verified', timestamp: now.toLocaleTimeString() },
          paymentCompleted: { status: 'not_detected' },
          webhookReceived: { status: 'not_detected' },
          statusConfirmed: { status: 'not_detected' },
          customerPaymentStates: { status: 'not_detected', successStateDetected: false, expiredStateDetected: false },
        });
        addToast('Preset Applied: QR Integration Started', 'Workspace created with 1 verified test step', 'info');
        setRoute('/integrations/qr-api');
        break;

      case 'partially_tested':
        setApiLogs(SAMPLE_API_LOGS.slice(0, 3));
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'in_progress',
          productionAccessStatus: 'sandbox',
          reviewStatus: 'none',
        });
        updateTestingState({
          qrGenerated: { status: 'verified', timestamp: now.toLocaleTimeString() },
          paymentCompleted: { status: 'verified', timestamp: now.toLocaleTimeString() },
          webhookReceived: { status: 'verified', timestamp: now.toLocaleTimeString() },
          statusConfirmed: { status: 'not_detected' },
          customerPaymentStates: { status: 'action_required', successStateDetected: true, expiredStateDetected: false },
        });
        addToast('Preset Applied: Partially Tested', '3 of 5 test requirements completed', 'info');
        setRoute('/integrations/qr-api');
        break;

      case 'production_ready':
        setApiLogs(SAMPLE_API_LOGS);
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'sandbox',
          reviewStatus: 'none',
          productionReadiness: {
            apiKeysVerified: true,
            webhookConfigured: true,
            testTransactionsCount: 5,
            testTransactionsRequired: 5,
            businessDetailsSubmitted: true,
            kycApproved: true,
          },
        });
        updateTestingState({
          qrGenerated: { status: 'verified', timestamp: now.toLocaleTimeString() },
          paymentCompleted: { status: 'verified', timestamp: now.toLocaleTimeString() },
          webhookReceived: { status: 'verified', timestamp: now.toLocaleTimeString() },
          statusConfirmed: { status: 'verified', timestamp: now.toLocaleTimeString() },
          customerPaymentStates: {
            status: 'verified',
            successStateDetected: true,
            expiredStateDetected: true,
            successEvidence: { fileName: 'merchant_app_success_proof.png', fileUrl: 'blob:proof_success', uploadedAt: '10:20 AM', fileSize: '1.2 MB' },
            expiredEvidence: { fileName: 'merchant_app_expired_proof.png', fileUrl: 'blob:proof_expired', uploadedAt: '10:22 AM', fileSize: '980 KB' },
          },
        });
        addToast('Preset Applied: Production Ready', '5/5 requirements verified! Ready to apply.', 'success');
        setRoute('/integrations/qr-api/production');
        break;

      case 'submitted':
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'pending_review',
          reviewStatus: 'submitted',
        });
        addToast('Preset Applied: Request Submitted', 'Application queued for PayWay review', 'info');
        setRoute('/integrations/qr-api/production');
        break;

      case 'under_review':
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'pending_review',
          reviewStatus: 'under_review',
        });
        addToast('Preset Applied: Under PayWay Review', 'PayWay team evaluating submission', 'info');
        setRoute('/integrations/qr-api/production');
        break;

      case 'changes_requested':
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'pending_review',
          reviewStatus: 'changes_requested',
        });
        addToast('Preset Applied: Changes Requested', 'PayWay requested application updates', 'warning');
        setRoute('/integrations/qr-api/production');
        break;

      case 'resubmitted':
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'pending_review',
          reviewStatus: 'resubmitted',
        });
        addToast('Preset Applied: Resubmitted for Review', 'Updated request resubmitted to PayWay', 'info');
        setRoute('/integrations/qr-api/production');
        break;

      case 'approved':
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'full_production',
          reviewStatus: 'approved',
          productionApiKey: 'pk_live_mct_883921_a9f8b7c6d5e4',
        });
        addToast('Preset Applied: Approved', 'Live Production API Key issued!', 'success');
        setRoute('/integrations/qr-api/production');
        break;

      default:
        break;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 max-w-lg w-full overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
              🧪
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Stakeholder Demonstration Presets
              </h3>
              <p className="text-[11px] text-slate-400">
                Instantly jump to any stage of the PayWay Integration lifecycle.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* PRESET LIST */}
        <div className="p-5 space-y-2 max-h-[420px] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => applyPreset('first_time')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-200">1. First Time User</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Unintegrated Home page with Onboarding Tour &amp; Product setup.</div>
            </button>

            <button
              onClick={() => applyPreset('integration_started')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-cyan-300">2. QR Integration Started</div>
              <div className="text-[10px] text-slate-400 mt-0.5">QR API workspace initialized with 1 test completed.</div>
            </button>

            <button
              onClick={() => applyPreset('partially_tested')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-purple-300">3. Partially Tested</div>
              <div className="text-[10px] text-slate-400 mt-0.5">3/5 requirements verified (QR, scan, webhook).</div>
            </button>

            <button
              onClick={() => applyPreset('production_ready')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-emerald-300">4. Production Ready</div>
              <div className="text-[10px] text-slate-400 mt-0.5">5/5 verified with UI evidence uploaded. Ready to apply.</div>
            </button>

            <button
              onClick={() => applyPreset('submitted')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-blue-300">5. Request Submitted</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Application sent to PayWay. Review pending (2-3 days).</div>
            </button>

            <button
              onClick={() => applyPreset('under_review')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-purple-400">6. Under PayWay Review</div>
              <div className="text-[10px] text-slate-400 mt-0.5">PayWay team actively evaluating technical implementation.</div>
            </button>

            <button
              onClick={() => applyPreset('changes_requested')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-amber-300">7. Changes Requested</div>
              <div className="text-[10px] text-slate-400 mt-0.5">PayWay requested updates. Attention card &amp; feedback active.</div>
            </button>

            <button
              onClick={() => applyPreset('resubmitted')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-cyan-400">8. Resubmitted for Review</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Updated application resubmitted for PayWay review.</div>
            </button>

            <button
              onClick={() => applyPreset('approved')}
              className="p-3 sm:col-span-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-emerald-300">9. Approved (Live Production)</div>
              <div className="text-[10px] text-slate-300 mt-0.5">Application approved! Live Production Key issued and active.</div>
            </button>
          </div>
        </div>

        {/* FOOTER RESET */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => {
              resetToDefaults();
              onClose();
              setRoute('/home');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-500/30"
          >
            ↺ Reset Prototype Defaults
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
