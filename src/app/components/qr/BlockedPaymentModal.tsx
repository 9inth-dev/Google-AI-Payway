import React from 'react';
import { useSandbox } from '../../context/SandboxContext';

interface BlockedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockedPaymentModal: React.FC<BlockedPaymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setRoute } = useSandbox();

  if (!isOpen) return null;

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
            Production access not available
          </h2>
          <p className="text-xs text-rose-200 mt-1 font-medium">
            Your production request must be approved before you can accept live payments.
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
            <strong className="font-bold text-amber-950 block">Approval Required:</strong>
            <p className="leading-relaxed">
              PayWay reviews all integrations and business details before issuing production keys. Reviews usually take 2 to 3 working days.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              setRoute('/integrations/qr-api/production');
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            View review status
          </button>
        </div>
      </div>
    </div>
  );
};
