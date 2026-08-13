import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types/sandbox';
import { StatusBadge } from '../common/StatusBadge';

interface TransactionDetailSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  tx: Transaction | null;
}

export const TransactionDetailSideModal: React.FC<TransactionDetailSideModalProps> = ({
  isOpen,
  onClose,
  tx,
}) => {
  const [activeTab, setActiveTab] = useState<'response' | 'payload' | 'headers' | 'curl'>('response');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !tx) return null;

  // Formatted mock request payload based on transaction
  const reqTimeFormatted = tx.createdAt
    ? tx.createdAt.replace(/[-:\s]/g, '').slice(0, 14)
    : '20260812153000';

  const requestPayload = {
    req_time: reqTimeFormatted,
    merchant_id: 'ec_payway_demo',
    tran_id: tx.tranId,
    amount: tx.amount,
    currency: tx.currency,
    payment_option: tx.paymentType.toLowerCase(),
    description: tx.description,
    return_url: 'https://merchant-store.com/checkout/callback',
    continue_success_url: 'https://merchant-store.com/checkout/success',
    cancel_url: 'https://merchant-store.com/checkout/cancel',
    hash: tx.hash || 'e89f812a1b2c3d4e5f67890123456789',
  };

  const responsePayload = {
    status: {
      code: tx.status === 'SUCCESS' ? '00' : tx.status === 'PENDING' ? '01' : '99',
      message: tx.status === 'SUCCESS' ? 'Success' : tx.status === 'PENDING' ? 'Pending Payment' : 'Transaction Failed',
    },
    data: {
      tran_id: tx.tranId,
      ap_txn_id: `AP-${tx.tranId.replace(/[^0-9]/g, '') || '9821412'}`,
      amount: tx.amount,
      currency: tx.currency,
      payment_type: tx.paymentType,
      payer_name: tx.payerName || 'Anonymous',
      description: tx.description,
      qr_code: tx.paymentType === 'KHQR'
        ? `00020101021229150009abaakhppxxx...hash=${tx.hash || 'e89f812a1b2c'}`
        : null,
      hash: tx.hash || 'e89f812a1b2c3d4e5f67890123456789',
      created_at: tx.createdAt,
    },
  };

  const requestHeaders = {
    'Host': 'api-sandbox.payway.com.kh',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer sandbox_pk_live_0a8f921b3c4d5e6f7a',
    'X-PayWay-Signature': tx.hash || 'e89f812a1b2c3d4e5f67890123456789',
    'X-Request-Timestamp': reqTimeFormatted,
    'User-Agent': 'PayWay-SDK-Node/2.1.0 (Sandbox Environment)',
  };

  const curlCommand = `curl -X POST https://api-sandbox.payway.com.kh/api/v1/purchase \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sandbox_pk_live_0a8f921b3c4d5e6f7a" \\
  -H "X-PayWay-Signature: ${tx.hash || 'e89f812a1b2c3d4e5f67890123456789'}" \\
  -d '${JSON.stringify(requestPayload, null, 2)}'`;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'response':
        return JSON.stringify(responsePayload, null, 2);
      case 'payload':
        return JSON.stringify(requestPayload, null, 2);
      case 'headers':
        return JSON.stringify(requestHeaders, null, 2);
      case 'curl':
        return curlCommand;
    }
  };

  const handleCopy = () => {
    const code = getActiveCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white text-slate-900 w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden transform transition-transform duration-300 ease-out animate-in slide-in-from-right"
        onClick={e => e.stopPropagation()}
      >
        {/* TOP ACCENT BAR */}
        <div
          className="h-1 w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #00B4CC, #4DDAEC, #10B981)' }}
        />

        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#00B4CC] font-bold shrink-0 shadow-2xs">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 tracking-tight">
                  Transaction API Inspector
                </h3>
                <StatusBadge status={tx.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                <span>{tx.tranId}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-semibold">{tx.paymentType}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-white">
          {/* QUICK METADATA GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount</span>
              <span className="text-sm font-extrabold text-slate-900">
                {tx.currency} {tx.amount.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Method</span>
              <span className="text-xs font-bold text-[#00B4CC]">{tx.paymentType}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Payer</span>
              <span className="text-xs font-semibold text-slate-800 truncate">{tx.payerName || 'Anonymous'}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Latency</span>
              <span className="text-xs font-mono font-bold text-emerald-600">200 OK (184ms)</span>
            </div>
          </div>

          {/* DESCRIPTION & TIMESTAMP */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Description:</span>
              <span className="font-semibold text-slate-800">{tx.description}</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px] shrink-0">
              {tx.createdAt}
            </div>
          </div>

          {/* CODE INSPECTOR SECTION */}
          <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs">
            {/* TABS HEADER */}
            <div className="px-3 pt-2.5 pb-0 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('response')}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'response'
                      ? 'bg-white text-[#0092A8] border-t-2 border-[#00B4CC] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Response JSON</span>
                </button>

                <button
                  onClick={() => setActiveTab('payload')}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'payload'
                      ? 'bg-white text-[#0092A8] border-t-2 border-[#00B4CC] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Request Payload</span>
                </button>

                <button
                  onClick={() => setActiveTab('headers')}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'headers'
                      ? 'bg-white text-[#0092A8] border-t-2 border-[#00B4CC] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>HTTP Headers</span>
                </button>

                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'curl'
                      ? 'bg-white text-[#0092A8] border-t-2 border-[#00B4CC] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>cURL Command</span>
                </button>
              </div>

              {/* COPY BUTTON */}
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors flex items-center gap-1 mb-1.5 cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* CODE DISPLAY AREA */}
            <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-slate-800 bg-slate-50 selection:bg-cyan-100">
              <pre className="whitespace-pre">{getActiveCode()}</pre>
            </div>
          </div>

          {/* SIGNATURE HASH */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              X-PayWay HMAC SHA256 Signature Hash
            </span>
            <div className="p-3 bg-slate-50 border border-slate-200 text-[#008196] font-mono text-[11px] font-semibold rounded-xl break-all flex items-center justify-between gap-3">
              <span>{tx.hash || 'e89f812a1b2c3d4e5f67890123456789'}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tx.hash || 'e89f812a1b2c3d4e5f67890123456789');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-[10px] text-slate-500 hover:text-slate-800 underline shrink-0 cursor-pointer"
              >
                Copy Hash
              </button>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            PayWay Sandbox API v1 • Test Environment
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
