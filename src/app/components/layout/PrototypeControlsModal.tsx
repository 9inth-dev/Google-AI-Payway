import React from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { ReviewStatus, ProductionAccessStatus } from '../../types/sandbox';

interface PrototypeControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrototypeControlsModal: React.FC<PrototypeControlsModalProps> = ({ isOpen, onClose }) => {
  const { updateState, updateTestingState, addToast, setRoute, resetToDefaults } = useSandbox();

  if (!isOpen) return null;

  const applyPreset = (presetName: string) => {
    const now = new Date();

    switch (presetName) {
      case 'first_time':
        updateState({
          isLoggedIn: true,
          firstTimeUser: true,
          hasIntegration: false,
          qrIntegrationStatus: 'not_started',
          productionAccessStatus: 'sandbox',
          reviewStatus: 'none',
          provisionalStartDate: undefined,
          provisionalTransactionUsage: 0,
          provisionalVolumeUSD: 0,
        });
        updateTestingState({
          qrGenerated: { status: 'not_detected' },
          paymentCompleted: { status: 'not_detected' },
          webhookReceived: { status: 'not_detected' },
          statusConfirmed: { status: 'not_detected' },
          customerPaymentStates: { status: 'not_detected', successStateDetected: false, expiredStateDetected: false },
        });
        addToast('Preset Applied: First Time User', 'Reset sandbox to initial unintegrated state', 'info');
        setRoute('/home');
        break;

      case 'integration_started':
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'in_progress',
          productionAccessStatus: 'sandbox',
          reviewStatus: 'none',
          provisionalStartDate: undefined,
          provisionalTransactionUsage: 1,
          provisionalVolumeUSD: 25,
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
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'in_progress',
          productionAccessStatus: 'sandbox',
          reviewStatus: 'none',
          provisionalStartDate: undefined,
          provisionalTransactionUsage: 3,
          provisionalVolumeUSD: 150,
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
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'sandbox',
          reviewStatus: 'none',
          provisionalStartDate: undefined,
          provisionalTransactionUsage: 5,
          provisionalVolumeUSD: 350,
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
        setRoute('/integrations/qr-api/readiness');
        break;

      case 'provisional_day1':
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'provisional_active',
          reviewStatus: 'submitted',
          provisionalStartDate: now.toISOString(),
          provisionalDaysRemaining: 30,
          provisionalTransactionUsage: 4,
          provisionalVolumeUSD: 200,
          productionApiKey: 'pk_live_mct_883921_a9f8b7c6d5e4',
        });
        addToast('Preset Applied: Provisional Day 1', 'Provisional key active with 30 days remaining', 'success');
        setRoute('/integrations/qr-api/production');
        break;

      case 'provisional_day20': {
        const day20Date = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'provisional_active',
          reviewStatus: 'under_review',
          provisionalStartDate: day20Date,
          provisionalDaysRemaining: 10,
          provisionalTransactionUsage: 42,
          provisionalVolumeUSD: 2100,
          productionApiKey: 'pk_live_mct_883921_a9f8b7c6d5e4',
        });
        addToast('Preset Applied: Provisional Day 20', 'Under review with 10 days remaining', 'info');
        setRoute('/integrations/qr-api/production');
        break;
      }

      case 'changes_requested': {
        const day12Date = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString();
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'provisional_active',
          reviewStatus: 'changes_requested',
          provisionalStartDate: day12Date,
          provisionalDaysRemaining: 18,
          provisionalTransactionUsage: 25,
          provisionalVolumeUSD: 1250,
          productionApiKey: 'pk_live_mct_883921_a9f8b7c6d5e4',
        });
        addToast('Preset Applied: Changes Requested', 'PayWay requested changes; key remains active', 'warning');
        setRoute('/integrations/qr-api/production');
        break;
      }

      case 'provisional_expired': {
        const expiredDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString();
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'provisional_expired',
          reviewStatus: 'under_review',
          provisionalStartDate: expiredDate,
          provisionalDaysRemaining: 0,
          provisionalTransactionUsage: 65,
          provisionalVolumeUSD: 3250,
          productionApiKey: 'pk_live_mct_883921_a9f8b7c6d5e4',
        });
        addToast('Preset Applied: Provisional Expired', 'Key blocked due to 30-day expiration', 'error');
        setRoute('/integrations/qr-api/production');
        break;
      }

      case 'approved':
        updateState({
          isLoggedIn: true,
          firstTimeUser: false,
          hasIntegration: true,
          qrIntegrationStatus: 'verified',
          productionAccessStatus: 'full_production',
          reviewStatus: 'approved',
          provisionalTransactionUsage: 110,
          provisionalVolumeUSD: 5500,
          productionApiKey: 'pk_live_mct_883921_a9f8b7c6d5e4',
        });
        addToast('Preset Applied: Approved', 'Full production granted! Limits removed from same key.', 'success');
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
                Instantly jump to any stage of the PayWay Sandbox lifecycle.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center transition-colors"
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
              <div className="text-[10px] text-slate-400 mt-0.5">Unintegrated Home page with Ask Navi recommendation prompt.</div>
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
              onClick={() => applyPreset('provisional_day1')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-cyan-400">5. Provisional Day 1</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Application submitted, live key active (30 days left).</div>
            </button>

            <button
              onClick={() => applyPreset('provisional_day20')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-purple-400">6. Provisional Day 20</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Under Review state with 10 days remaining.</div>
            </button>

            <button
              onClick={() => applyPreset('changes_requested')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-amber-300">7. Changes Requested</div>
              <div className="text-[10px] text-slate-400 mt-0.5">PayWay requested changes; key remains active.</div>
            </button>

            <button
              onClick={() => applyPreset('provisional_expired')}
              className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-rose-300">8. Provisional Expired</div>
              <div className="text-[10px] text-slate-400 mt-0.5">30-day window elapsed; key blocked until approval.</div>
            </button>

            <button
              onClick={() => applyPreset('approved')}
              className="p-3 sm:col-span-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-emerald-300">9. Approved (Full Production)</div>
              <div className="text-[10px] text-slate-300 mt-0.5">Full production access granted. Same key reactivated with all limits removed!</div>
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
