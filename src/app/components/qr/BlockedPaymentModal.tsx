import React from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { PROVISIONAL_CONFIG } from '../../config/provisionalConfig';

interface BlockedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'expired' | 'tx_limit' | 'vol_limit';
}

export const BlockedPaymentModal: React.FC<BlockedPaymentModalProps> = ({
  isOpen,
  onClose,
  reason = 'expired',
}) => {
  const { state } = useSandbox();

  if (!isOpen) return null;

  const getReasonTitle = () => {
    if (reason === 'tx_limit') return 'Transaction limit reached';
    if (reason === 'vol_limit') return 'Transaction volume limit reached';
    return 'Provisional period expired';
  };

  const getReasonDetail = () => {
    if (reason === 'tx_limit') {
      return `${state.provisionalTransactionUsage || PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS} of ${PROVISIONAL_CONFIG.MAX_PROVISIONAL_TRANSACTIONS} transactions used`;
    }
    if (reason === 'vol_limit') {
      return `USD ${(state.provisionalVolumeUSD || PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD).toLocaleString()} of USD ${PROVISIONAL_CONFIG.MAX_PROVISIONAL_VOLUME_USD.toLocaleString()} volume used`;
    }
    return '30-day provisional allocation window elapsed';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white h-full shadow-2xl border-l border-rose-200 max-w-md w-full overflow-hidden flex flex-col transform transition-transform duration-300 ease-out"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-rose-300 hover:text-white text-xl font-bold w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            ×
          </button>

          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
            🚫
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Payment could not be processed
          </h2>
          <p className="text-xs text-rose-200 mt-1 font-medium">
            Your provisional production access is no longer active.
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">
              Specific Failure Reason
            </span>
            <div className="text-sm font-extrabold text-rose-950 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              {getReasonTitle()}
            </div>
            <p className="text-xs text-rose-800 font-mono bg-rose-100/80 p-2 rounded border border-rose-200">
              Details: {getReasonDetail()}
            </p>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 space-y-1.5">
            <strong className="font-bold text-gray-900 block">Automatic Reactivation Notice:</strong>
            <p className="leading-relaxed">
              Production payments will resume automatically if PayWay approves your application.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
