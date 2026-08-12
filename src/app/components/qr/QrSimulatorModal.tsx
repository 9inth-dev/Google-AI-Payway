import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';

interface QrSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'sample_payment' | 'test_expired';
}

interface SimulatedEvent {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  details: string;
  timestamp: string;
}

export const QrSimulatorModal: React.FC<QrSimulatorModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'sample_payment',
}) => {
  const { state, updateTestingState, addTransaction, addToast, addApiLog } = useSandbox();

  const [mode, setMode] = useState<'sample_payment' | 'test_expired'>(initialMode);
  const [amount, setAmount] = useState('15.50');
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [item, setItem] = useState('Sandbox Test Order');
  
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrString, setQrString] = useState<string | null>(null);
  const [events, setEvents] = useState<SimulatedEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);

  if (!isOpen) return null;

  const handleGenerateQr = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 15.50;
    const generated = `00020101021238580016A0000007700001010112${state.merchantId}5204599953038405404${parsedAmount.toFixed(
      2
    )}5802KH5912PAYWAY_TEST6010PHNOM_PENH63047A1F`;

    setQrString(generated);
    setQrGenerated(true);
    setSimulationCompleted(false);
    setEvents([]);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Instantly verify Requirement 1: QR generated successfully
    updateTestingState({
      qrGenerated: {
        status: 'verified',
        lastEventTime: timeStr,
        lastDetails: `POST /api/v1/purchase/create_qr (200 OK)`,
      },
    });

    addToast('KHQR String Generated', 'API request POST /api/v1/purchase/create_qr succeeded', 'success');
  };

  const handleRunSuccessfulPaymentSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setEvents([]);

    const parsedAmount = parseFloat(amount) || 15.50;
    const now = new Date();

    const initialEvents: SimulatedEvent[] = [
      { id: 'ev1', title: 'POST /api/v1/purchase/create_qr', status: 'running', details: 'Sending payload to PayWay API...', timestamp: now.toLocaleTimeString() },
      { id: 'ev2', title: 'Payment scanned & confirmed', status: 'pending', details: 'Customer scanned KHQR with ABA Mobile app', timestamp: '' },
      { id: 'ev3', title: 'Webhook notification dispatched', status: 'pending', details: `POST ${state.webhookUrl}`, timestamp: '' },
      { id: 'ev4', title: 'Check transaction status', status: 'pending', details: 'GET /api/v1/purchase/check_transaction (200 OK)', timestamp: '' },
    ];

    setEvents(initialEvents);

    let createdTxId = '';

    // Step 1: POST create_qr 200
    setTimeout(() => {
      const t1 = new Date().toLocaleTimeString();
      setEvents(prev => prev.map(ev => ev.id === 'ev1' ? { ...ev, status: 'success', details: '200 OK — KHQR payload signature verified', timestamp: t1 } : ev.id === 'ev2' ? { ...ev, status: 'running' } : ev));

      updateTestingState({
        qrGenerated: {
          status: 'verified',
          lastEventTime: t1,
          lastDetails: '200 OK — QR string generated successfully',
        },
      });

      addApiLog({
        method: 'POST',
        endpoint: '/api/v1/purchase/create_qr',
        status: 200,
        result: 'Success',
        category: 'api_request',
        latencyMs: 112,
        verifiedRequirement: '1. QR generated successfully',
        requestHeaders: {
          'Content-Type': 'application/json',
          'X-PayWay-Merchant-Id': state.merchantId,
        },
        requestBody: {
          req_time: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14),
          merchant_id: state.merchantId,
          amount: parsedAmount,
          currency: currency,
          items: item,
        },
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: { status: 0, description: 'Success', qrString: qrString || '0002010102123...' }
      });
    }, 600);

    // Step 2: Payment scanned & completed
    setTimeout(() => {
      const t2 = new Date().toLocaleTimeString();
      setEvents(prev => prev.map(ev => ev.id === 'ev2' ? { ...ev, status: 'success', details: 'Payment completed by Sokha Chan (ABA App)', timestamp: t2 } : ev.id === 'ev3' ? { ...ev, status: 'running' } : ev));

      const newTx = addTransaction({
        amount: parsedAmount,
        currency: currency,
        description: item,
        status: 'SUCCESS',
        paymentType: 'KHQR',
        payerName: 'Sokha Chan (ABA Mobile)',
      });
      createdTxId = newTx.tranId;

      updateTestingState({
        paymentCompleted: {
          status: 'verified',
          lastEventTime: t2,
          lastTxId: newTx.tranId,
          lastDetails: `Customer completed payment of ${currency} ${parsedAmount.toFixed(2)}`,
        },
      });

      addApiLog({
        method: 'POST',
        endpoint: '/payments/complete-scan',
        status: 200,
        result: 'SUCCESS',
        category: 'payment',
        tranId: newTx.tranId,
        latencyMs: 310,
        verifiedRequirement: '2. Payment completed successfully',
        requestHeaders: { 'Content-Type': 'application/json' },
        requestBody: { tran_id: newTx.tranId, payer: 'Sokha Chan (ABA Mobile)', amount: parsedAmount, currency: currency },
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: { status: 0, status_code: 'SUCCESS', approval_code: 'APV881203' }
      });
    }, 1500);

    // Step 3: Webhook received & acknowledged
    setTimeout(() => {
      const t3 = new Date().toLocaleTimeString();
      setEvents(prev => prev.map(ev => ev.id === 'ev3' ? { ...ev, status: 'success', details: '200 OK — Merchant server acknowledged webhook', timestamp: t3 } : ev.id === 'ev4' ? { ...ev, status: 'running' } : ev));

      updateTestingState({
        webhookReceived: {
          status: 'verified',
          lastEventTime: t3,
          lastDetails: `Webhook received & acknowledged (200 OK)`,
        },
      });

      addApiLog({
        method: 'Webhook',
        endpoint: 'payment.completed',
        status: 200,
        result: 'Received',
        category: 'webhook',
        tranId: createdTxId,
        latencyMs: 82,
        verifiedRequirement: '3. Webhook received',
        requestHeaders: { 'Content-Type': 'application/json', 'X-PayWay-Webhook-Signature': state.webhookSecret },
        requestBody: { event: 'payment.completed', merchant_id: state.merchantId, tran_id: createdTxId, amount: parsedAmount, currency: currency, status: 'SUCCESS' },
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: { received: true, code: 200, message: 'Merchant listener endpoint acknowledged webhook' }
      });
    }, 2400);

    // Step 4: Final status check confirmed
    setTimeout(() => {
      const t4 = new Date().toLocaleTimeString();
      setEvents(prev => prev.map(ev => ev.id === 'ev4' ? { ...ev, status: 'success', details: 'Transaction status verified: SUCCESS', timestamp: t4 } : ev));

      const currentTesting = state.testingState;
      const currentCps = currentTesting?.customerPaymentStates || {
        status: 'not_detected',
        successStateDetected: false,
        expiredStateDetected: false,
      };

      updateTestingState({
        statusConfirmed: {
          status: 'verified',
          lastEventTime: t4,
          lastDetails: 'API confirmed final status = SUCCESS',
        },
        customerPaymentStates: {
          ...currentCps,
          successStateDetected: true,
          lastEventTime: t4,
        },
      });

      addApiLog({
        method: 'GET',
        endpoint: '/api/v1/purchase/check_transaction',
        status: 200,
        result: 'SUCCESS',
        category: 'api_request',
        tranId: createdTxId,
        latencyMs: 98,
        verifiedRequirement: '4. Final transaction status confirmed',
        requestHeaders: { 'X-PayWay-Merchant-Id': state.merchantId },
        requestBody: { tran_id: createdTxId },
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: { status: 0, tran_id: createdTxId, payment_status: 'SUCCESS', amount: parsedAmount, currency: currency }
      });

      setIsSimulating(false);
      setSimulationCompleted(true);
      addToast('Simulated Payment Complete', 'Requirements 1–4 and Successful Payment state verified!', 'success');
    }, 3200);
  };

  const handleRunExpiredQrSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setEvents([]);

    const parsedAmount = parseFloat(amount) || 15.50;
    const now = new Date();

    const initialEvents: SimulatedEvent[] = [
      { id: 'exp1', title: 'POST /api/v1/purchase/create_qr', status: 'running', details: 'Generated temporary KHQR token', timestamp: now.toLocaleTimeString() },
      { id: 'exp2', title: 'QR Expiration Window Elapsed', status: 'pending', details: '15 minute lifetime reached without customer payment', timestamp: '' },
      { id: 'exp3', title: 'Status check returned EXPIRED', status: 'pending', details: 'GET /api/v1/purchase/check_transaction (Status: EXPIRED)', timestamp: '' },
    ];

    setEvents(initialEvents);

    let createdExpTxId = '';

    // Step 1: Generate QR
    setTimeout(() => {
      const t1 = new Date().toLocaleTimeString();
      setEvents(prev => prev.map(ev => ev.id === 'exp1' ? { ...ev, status: 'success', details: '200 OK — Temporary QR generated', timestamp: t1 } : ev.id === 'exp2' ? { ...ev, status: 'running' } : ev));
    }, 600);

    // Step 2: Timeout reached
    setTimeout(() => {
      const t2 = new Date().toLocaleTimeString();
      setEvents(prev => prev.map(ev => ev.id === 'exp2' ? { ...ev, status: 'failed', details: 'QR code expired after 15 minutes idle', timestamp: t2 } : ev.id === 'exp3' ? { ...ev, status: 'running' } : ev));

      const expTx = addTransaction({
        amount: parsedAmount,
        currency: currency,
        description: `${item} (Expired Test)`,
        status: 'FAILED',
        paymentType: 'KHQR',
        payerName: 'N/A (Expired)',
      });
      createdExpTxId = expTx.tranId;
    }, 1600);

    // Step 3: Status check EXPIRED
    setTimeout(() => {
      const t3 = new Date().toLocaleTimeString();
      setEvents(prev => prev.map(ev => ev.id === 'exp3' ? { ...ev, status: 'success', details: 'Status = EXPIRED confirmed', timestamp: t3 } : ev));

      const currentTesting = state.testingState;
      const currentCps = currentTesting?.customerPaymentStates || {
        status: 'not_detected',
        successStateDetected: false,
        expiredStateDetected: false,
      };

      updateTestingState({
        customerPaymentStates: {
          ...currentCps,
          expiredStateDetected: true,
          lastEventTime: t3,
        },
      });

      addApiLog({
        method: 'GET',
        endpoint: '/api/v1/purchase/check_transaction',
        status: 200,
        result: 'EXPIRED',
        category: 'api_request',
        tranId: createdExpTxId,
        latencyMs: 105,
        verifiedRequirement: '5. Customer payment states verified (Expired QR)',
        requestHeaders: { 'X-PayWay-Merchant-Id': state.merchantId },
        requestBody: { tran_id: createdExpTxId },
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: { status: 11, tran_id: createdExpTxId, payment_status: 'EXPIRED', message: 'Transaction window timed out' }
      });

      setIsSimulating(false);
      setSimulationCompleted(true);
      addToast('Expired QR Detected', 'Expired QR behavior state marked as detected!', 'info');
    }, 2500);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-100 my-8">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00B4CC]" />
              PayWay Sandbox QR Simulator
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Simulate real-time customer behavior and API callback triggers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 flex flex-col gap-5">
          {/* SIMULATION MODE TOGGLE */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setMode('sample_payment');
                setQrGenerated(false);
                setEvents([]);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'sample_payment' ? 'bg-white text-gray-800 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Run Sample Payment
            </button>
            <button
              onClick={() => {
                setMode('test_expired');
                setQrGenerated(false);
                setEvents([]);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'test_expired' ? 'bg-white text-gray-800 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Test Expired QR
            </button>
          </div>

          {/* STEP 1: FORM TO GENERATE QR */}
          <form onSubmit={handleGenerateQr} className="flex flex-col gap-3.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Step 1: Configure QR Payload
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white outline-none focus:border-[#00B4CC]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as 'USD' | 'KHR')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white outline-none focus:border-[#00B4CC]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                Description / Item
              </label>
              <input
                type="text"
                value={item}
                onChange={e => setItem(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white outline-none focus:border-[#00B4CC]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-95 cursor-pointer"
              style={{ backgroundColor: '#00B4CC' }}
            >
              Generate Mock KHQR
            </button>
          </form>

          {/* STEP 2: DISPLAY QR CODE AND TRIGGER SIMULATION */}
          {qrGenerated && qrString && (
            <div className="p-4 bg-white border border-cyan-200 rounded-xl flex flex-col items-center justify-center gap-3">
              <div className="w-32 h-32 bg-white border-2 border-dashed border-cyan-400 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-2xs">
                <span className="text-[10px] font-bold text-red-600">KHQR PAYWAY</span>
                <span className="text-xs font-bold text-gray-800 mt-1">
                  {currency} {parseFloat(amount).toFixed(2)}
                </span>
                <span className="text-[9px] text-gray-400 font-mono mt-1">
                  MERCHANT_SANDBOX
                </span>
              </div>

              <div className="w-full flex flex-col items-center gap-2">
                {mode === 'sample_payment' ? (
                  <button
                    onClick={handleRunSuccessfulPaymentSimulation}
                    disabled={isSimulating}
                    className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSimulating ? 'Simulating scan & payment...' : 'Simulate Successful Payment'}
                  </button>
                ) : (
                  <button
                    onClick={handleRunExpiredQrSimulation}
                    disabled={isSimulating}
                    className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSimulating ? 'Simulating timeout...' : 'Simulate QR Expiration'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* REAL-TIME SIMULATION EVENT TIMELINE */}
          {events.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-200 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                Live Event Sequence Observed
              </span>
              <div className="flex flex-col gap-2">
                {events.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 text-[11px]">
                    <span className="mt-0.5">
                      {ev.status === 'success' && <span className="text-emerald-400 font-bold">✓</span>}
                      {ev.status === 'running' && <span className="text-cyan-400 animate-spin inline-block">⏳</span>}
                      {ev.status === 'pending' && <span className="text-gray-600">○</span>}
                      {ev.status === 'failed' && <span className="text-amber-400 font-bold">✕</span>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${
                          ev.status === 'success' ? 'text-emerald-300' : ev.status === 'running' ? 'text-cyan-300' : ev.status === 'failed' ? 'text-amber-300' : 'text-gray-500'
                        }`}>
                          {ev.title}
                        </span>
                        {ev.timestamp && (
                          <span className="text-[10px] text-gray-500">{ev.timestamp}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{ev.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            {simulationCompleted ? '✓ Sandbox requirements updated' : 'Run simulations to verify requirements'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {simulationCompleted ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
