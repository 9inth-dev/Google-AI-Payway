import React from 'react';
import { useSandbox } from '../../context/SandboxContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSandbox();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-white rounded-lg shadow-lg border border-gray-100 p-3.5 flex items-start gap-3 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-3"
        >
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && (
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg width="12" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 10 8">
                  <polyline points="1,4 3.5,6.5 9,1" />
                </svg>
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
            )}
            {toast.type === 'warning' && (
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-gray-800">{toast.title}</h4>
            {toast.message && (
              <p className="text-[11px] text-gray-500 mt-0.5">{toast.message}</p>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 text-sm leading-none shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
