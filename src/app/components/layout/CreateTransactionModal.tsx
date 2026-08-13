import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';

export const CreateTransactionModal: React.FC = () => {
  const { showCreateTxModal, setShowCreateTxModal, addTransaction, setRoute } = useSandbox();

  const [amount, setAmount] = useState('10.00');
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [desc, setDesc] = useState('Test KHQR Sandbox Payment');
  const [paymentType, setPaymentType] = useState<'KHQR' | 'CARD'>('KHQR');
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<{ tranId: string; amount: number; currency: string } | null>(null);

  if (!showCreateTxModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const parsedAmount = parseFloat(amount) || 10.00;
      const created = addTransaction({
        amount: parsedAmount,
        currency,
        description: desc,
        status: 'SUCCESS',
        paymentType,
        payerName: 'Sandbox Tester',
      });

      setLoading(false);
      setSuccessTx({
        tranId: created.tranId,
        amount: parsedAmount,
        currency,
      });
    }, 1200);
  };

  const handleClose = () => {
    setShowCreateTxModal(false);
    setSuccessTx(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-out"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="h-1 w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #00B4CC, #4DDAEC)' }}
        />

        {successTx ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#ECFDF5' }}
            >
              <svg width="28" height="24" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 28 24">
                <polyline points="3,13 9,19 25,4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#0D3D4F' }}>
              Transaction Processed!
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Your test transaction was successfully recorded in Sandbox mode.
            </p>

            <div
              className="text-xs font-mono bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-6 w-full text-center"
              style={{ color: '#00B4CC' }}
            >
              <div className="font-semibold text-gray-800 mb-0.5">{successTx.tranId}</div>
              <div>{successTx.currency} {successTx.amount.toFixed(2)}</div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleClose}
                className="flex-1 text-xs font-semibold py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Done
              </button>
              <button
                onClick={() => {
                  handleClose();
                  setRoute('/transactions');
                }}
                className="flex-1 text-xs font-semibold py-2.5 rounded-lg text-white"
                style={{ backgroundColor: '#00B4CC' }}
              >
                View Transactions
              </button>
            </div>
          </div>
        ) : (
          <div className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base" style={{ color: '#0D3D4F' }}>
                  Create Test Transaction
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Simulate a payment call in Sandbox mode
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Payment Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('KHQR')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                      paymentType === 'KHQR'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>KHQR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('CARD')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                      paymentType === 'CARD'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>Credit / Debit Card</span>
                  </button>
                </div>
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    step="0.01"
                    required
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as 'USD' | 'KHR')}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="KHR">KHR (៛)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50"
                />
              </div>

              {/* Test Card Info */}
              {paymentType === 'CARD' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Test Card Details
                  </label>
                  <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-700">4111 1111 1111 1111</span>
                    <span className="text-gray-400">12/28 · CVV 123</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 text-xs font-semibold text-white mt-2 transition-opacity"
                style={{ backgroundColor: loading ? '#7DC8D8' : '#00B4CC' }}
              >
                {loading ? 'Processing Test Payment...' : 'Run Test Transaction'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
