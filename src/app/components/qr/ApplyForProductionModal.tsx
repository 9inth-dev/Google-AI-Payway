import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';

interface ApplyForProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyForProductionModal: React.FC<ApplyForProductionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, updateState, addToast } = useSandbox();

  // Step state: 1 to 7
  const [step, setStep] = useState<number>(1);

  // Step 1: Submitter choice
  const [submitterType, setSubmitterType] = useState<'own' | 'client'>('own');

  // Step 2A: Merchant ABA Verification
  const [isAbaAccountVerified, setIsAbaAccountVerified] = useState(false);

  // Step 2B: Client Business Contact & Authorization
  const [clientMerchantName, setClientMerchantName] = useState('Henry Stores Co., Ltd.');
  const [clientMerchantEmail, setClientMerchantEmail] = useState('owner@henrystores.kh');
  const [clientMerchantPhone, setClientMerchantPhone] = useState('+855 12 888 999');
  const [authSent, setAuthSent] = useState(false);
  const [isMerchantApproved, setIsMerchantApproved] = useState(false);

  // Step 3: Business & Outlet Selection
  const [selectedBusiness, setSelectedBusiness] = useState('Henry Stores Co.');
  const [selectedOutlet, setSelectedOutlet] = useState('Main Branch');
  const [isCustomBusiness, setIsCustomBusiness] = useState(false);
  const [customBusinessName, setCustomBusinessName] = useState('');
  const [customOutletName, setCustomOutletName] = useState('');

  // Step 4: Payment Methods
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['KHQR', 'ABA PAY']);

  // Step 5: Documents (for WeChat Pay / Alipay)
  const [uploadedMoc, setUploadedMoc] = useState<string | null>(null);
  const [uploadedPatent, setUploadedPatent] = useState<string | null>(null);
  const [uploadedIdDoc, setUploadedIdDoc] = useState<string | null>(null);

  // Step 6: Final Authorization Checkbox
  const [confirmedAuth, setConfirmedAuth] = useState(true);

  if (!isOpen) return null;

  const requiresExtraDocs = selectedMethods.includes('WeChat Pay') || selectedMethods.includes('Alipay');

  const handleNextStep = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 7) {
      setStep(step - 1);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setSelectedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedAuth) return;

    const nowIso = new Date().toISOString();
    const isResubmission = state.reviewStatus === 'changes_requested';
    const newReviewStatus = isResubmission ? 'resubmitted' : 'submitted';

    // Rule 5 & 6: Provisional period lasts 30 days from FIRST successful submission.
    // Resubmitting MUST NEVER restart the 30 day period.
    const provisionalStartDate = state.provisionalStartDate || nowIso;

    // Rule 10 & 11: Never issue a replacement key simply because state changes.
    const productionApiKey = state.productionApiKey || 'pk_live_mct_883921_a9f8b7c6d5';

    updateState({
      productionAccessStatus: state.productionAccessStatus === 'full_production' ? 'full_production' : 'provisional_active',
      reviewStatus: newReviewStatus,
      provisionalStartDate,
      productionApiKey,
      productionReadiness: {
        ...state.productionReadiness,
        businessDetailsSubmitted: true,
      },
    });

    // Temporary success notification per spec
    addToast(
      'Production access is active',
      'You can now accept live payments while PayWay reviews your application.',
      'success'
    );

    // Return the user to the QR API workspace. Do not leave them inside a completion wizard.
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setIsAbaAccountVerified(false);
    setAuthSent(false);
    setIsMerchantApproved(false);
    onClose();
  };

  const currentBusinessName = isCustomBusiness ? customBusinessName || 'New Merchant Business' : selectedBusiness;
  const currentOutletName = isCustomBusiness ? customOutletName || 'Main Outlet' : selectedOutlet;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={resetAndClose}
    >
      <div
        className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden border-l border-gray-200 animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 p-6 text-white relative shrink-0">
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
              Production Setup Workflow
            </span>
            <span className="text-white/60 text-xs">•</span>
            <span className="text-xs text-cyan-100 font-medium">Step {step} of 6</span>
          </div>

          <h2 className="text-xl font-bold">Apply for Production Access</h2>
          <p className="text-xs text-cyan-100 mt-0.5">
            Connect your merchant entity, select payment methods, and activate live QR API processing.
          </p>

          {/* Progress Indicator */}
          {step <= 6 && (
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/20 text-[10px] font-semibold text-white/70 overflow-x-auto pb-1 scrollbar-none">
              <span className={`px-2 py-0.5 rounded-full ${step === 1 ? 'bg-white text-cyan-800 font-bold' : step > 1 ? 'bg-white/30 text-white' : ''}`}>
                1. Submitter
              </span>
              <span>›</span>
              <span className={`px-2 py-0.5 rounded-full ${step === 2 ? 'bg-white text-cyan-800 font-bold' : step > 2 ? 'bg-white/30 text-white' : ''}`}>
                2. Verification
              </span>
              <span>›</span>
              <span className={`px-2 py-0.5 rounded-full ${step === 3 ? 'bg-white text-cyan-800 font-bold' : step > 3 ? 'bg-white/30 text-white' : ''}`}>
                3. Business &amp; Outlet
              </span>
              <span>›</span>
              <span className={`px-2 py-0.5 rounded-full ${step === 4 ? 'bg-white text-cyan-800 font-bold' : step > 4 ? 'bg-white/30 text-white' : ''}`}>
                4. Payments
              </span>
              <span>›</span>
              <span className={`px-2 py-0.5 rounded-full ${step === 5 ? 'bg-white text-cyan-800 font-bold' : step > 5 ? 'bg-white/30 text-white' : ''}`}>
                5. Documents
              </span>
              <span>›</span>
              <span className={`px-2 py-0.5 rounded-full ${step === 6 ? 'bg-white text-cyan-800 font-bold' : ''}`}>
                6. Review
              </span>
            </div>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* ==================== STEP 1: SUBMITTER ==================== */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Who are you setting this integration up for?
                </h3>
                <p className="text-xs text-gray-500">
                  Select your relationship to the merchant business accepting live payments.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {/* Option A: My own business */}
                <div
                  onClick={() => setSubmitterType('own')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    submitterType === 'own'
                      ? 'border-[#00B4CC] bg-cyan-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    submitterType === 'own' ? 'border-[#00B4CC] bg-[#00B4CC]' : 'border-gray-300'
                  }`}>
                    {submitterType === 'own' && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">My own business</span>
                    <span className="text-xs text-gray-600 block mt-0.5">
                      I am the merchant or business owner setup directly.
                    </span>
                  </div>
                </div>

                {/* Option B: A client's business */}
                <div
                  onClick={() => setSubmitterType('client')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    submitterType === 'client'
                      ? 'border-[#00B4CC] bg-cyan-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    submitterType === 'client' ? 'border-[#00B4CC] bg-[#00B4CC]' : 'border-gray-300'
                  }`}>
                    {submitterType === 'client' && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">A client's business</span>
                    <span className="text-xs text-gray-600 block mt-0.5">
                      I am a developer or agency integrating PayWay for a merchant.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  Continue to Verification →
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: VERIFICATION ==================== */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              {submitterType === 'own' ? (
                /* 2A. MY OWN BUSINESS VERIFICATION */
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Verify your ABA account</h3>
                    <p className="text-xs text-gray-600">
                      Confirm ownership of your merchant ABA Bank account using ABA Mobile app.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-cyan-50/30 border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center gap-3">
                    <div className="w-28 h-28 bg-white border-2 border-cyan-500 rounded-xl p-2 shadow-xs flex flex-col items-center justify-center relative">
                      <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 5 === 0 ? 'bg-cyan-900' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-white px-2 py-1 rounded-md text-[10px] font-extrabold text-cyan-800 border border-cyan-200 shadow-xs">
                          ABA PAY
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 max-w-sm">
                      Open ABA Mobile on your smartphone, tap <strong>Scan QR</strong>, and scan this code to authenticate ownership.
                    </p>

                    <div className="w-full pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAbaAccountVerified(true);
                          addToast('Account Verified', 'ABA Bank account ownership confirmed', 'success');
                          handleNextStep();
                        }}
                        className="w-full py-2.5 px-4 text-xs font-bold text-cyan-800 bg-cyan-100/80 hover:bg-cyan-200/80 rounded-lg transition-colors border border-cyan-300 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>⚡ Simulate successful ABA Mobile verification</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2B. CLIENT BUSINESS AUTHORIZATION */
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Request merchant authorization</h3>
                    <p className="text-xs text-gray-600">
                      Specify the merchant details to dispatch an authorization request to their ABA Mobile app.
                    </p>
                  </div>

                  {!authSent ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Merchant Business Name</label>
                        <input
                          type="text"
                          value={clientMerchantName}
                          onChange={e => setClientMerchantName(e.target.value)}
                          className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
                          placeholder="e.g. Henry Stores Co., Ltd."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-700">Merchant Contact Email</label>
                          <input
                            type="email"
                            value={clientMerchantEmail}
                            onChange={e => setClientMerchantEmail(e.target.value)}
                            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-700">Merchant Phone Number</label>
                          <input
                            type="tel"
                            value={clientMerchantPhone}
                            onChange={e => setClientMerchantPhone(e.target.value)}
                            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthSent(true);
                          addToast('Authorization Sent', `Sent request to ${clientMerchantEmail}`, 'info');
                        }}
                        className="mt-2 py-2.5 px-4 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                        style={{ backgroundColor: '#00B4CC' }}
                      >
                        Send authorization request
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg animate-pulse">
                        ⏳
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Waiting for merchant approval</h4>
                        <p className="text-xs text-gray-600 mt-1 max-w-md leading-relaxed">
                          The merchant must approve this production request from ABA Mobile before you can access their business and outlet information.
                        </p>
                      </div>

                      <div className="w-full pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMerchantApproved(true);
                            addToast('Merchant Approved', 'Henry Stores Co. authorized integration', 'success');
                            handleNextStep();
                          }}
                          className="w-full py-2.5 px-4 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 rounded-lg transition-colors border border-amber-400 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>⚡ Simulate merchant approval</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 3: BUSINESS AND OUTLET ==================== */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Select business and outlet</h3>
                <p className="text-xs text-gray-500">
                  Select an authorized business profile and outlet location for live QR API processing.
                </p>
              </div>

              {!isCustomBusiness ? (
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-semibold text-gray-700">Select Existing Business Entity:</div>

                  {/* Business Card: Henry Stores Co. */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏢</span>
                        <span className="font-bold text-xs text-gray-900">Henry Stores Co.</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Authorized Entity
                      </span>
                    </div>

                    <div className="p-3 flex flex-col gap-2 bg-white">
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                        Outlets
                      </div>

                      {/* Outlet 1: Main Branch */}
                      <div
                        onClick={() => setSelectedOutlet('Main Branch')}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          selectedOutlet === 'Main Branch'
                            ? 'border-[#00B4CC] bg-cyan-50/50 font-semibold'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            checked={selectedOutlet === 'Main Branch'}
                            onChange={() => setSelectedOutlet('Main Branch')}
                            className="text-cyan-600 focus:ring-cyan-500"
                          />
                          <span>Main Branch (Phnom Penh)</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Eligible</span>
                      </div>

                      {/* Outlet 2: Airport Branch */}
                      <div
                        onClick={() => setSelectedOutlet('Airport Branch')}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          selectedOutlet === 'Airport Branch'
                            ? 'border-[#00B4CC] bg-cyan-50/50 font-semibold'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            checked={selectedOutlet === 'Airport Branch'}
                            onChange={() => setSelectedOutlet('Airport Branch')}
                            className="text-cyan-600 focus:ring-cyan-500"
                          />
                          <span>Airport Branch (PNH International)</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Eligible</span>
                      </div>

                      {/* Outlet 3: Siem Reap Branch (Disabled) */}
                      <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 text-xs flex items-center justify-between opacity-60 cursor-not-allowed">
                        <div className="flex items-center gap-2.5">
                          <input type="radio" disabled checked={false} />
                          <span className="text-gray-500 line-through">Siem Reap Branch</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                          QR API already enabled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Path: Add a new business */}
                  <button
                    type="button"
                    onClick={() => setIsCustomBusiness(true)}
                    className="py-2.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>+ Add a new business</span>
                  </button>
                </div>
              ) : (
                /* CUSTOM BUSINESS FORM */
                <div className="flex flex-col gap-3 bg-gray-50 p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">Add New Merchant Business Record</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomBusiness(false)}
                      className="text-xs text-cyan-700 hover:underline"
                    >
                      ← Back to Henry Stores Co.
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Business Name</label>
                    <input
                      type="text"
                      value={customBusinessName}
                      onChange={e => setCustomBusinessName(e.target.value)}
                      placeholder="e.g. Mondulkiri Coffee Roasters"
                      className="px-3 py-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Outlet Name</label>
                    <input
                      type="text"
                      value={customOutletName}
                      onChange={e => setCustomOutletName(e.target.value)}
                      placeholder="e.g. Flagship Store (BKK1)"
                      className="px-3 py-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  Continue to Payment Methods →
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 4: PAYMENT METHODS ==================== */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Select payment methods</h3>
                <p className="text-xs text-gray-500">
                  Select payment methods to activate on your live KHQR checkout. Multiple selection permitted.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. KHQR */}
                <div
                  onClick={() => togglePaymentMethod('KHQR')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMethods.includes('KHQR')
                      ? 'border-[#00B4CC] bg-cyan-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#E1251B] text-white flex items-center justify-center font-black text-[10px]">
                      KHQR
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">KHQR</span>
                      <span className="text-[10px] text-gray-500">National Bakong standard</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes('KHQR')}
                    onChange={() => {}}
                    className="text-cyan-600 rounded focus:ring-cyan-500"
                  />
                </div>

                {/* 2. ABA PAY */}
                <div
                  onClick={() => togglePaymentMethod('ABA PAY')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMethods.includes('ABA PAY')
                      ? 'border-[#00B4CC] bg-cyan-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#005A9C] text-white flex items-center justify-center font-bold text-[9px]">
                      ABA
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">ABA PAY</span>
                      <span className="text-[10px] text-gray-500">ABA Mobile instant push</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes('ABA PAY')}
                    onChange={() => {}}
                    className="text-cyan-600 rounded focus:ring-cyan-500"
                  />
                </div>

                {/* 3. WeChat Pay */}
                <div
                  onClick={() => togglePaymentMethod('WeChat Pay')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMethods.includes('WeChat Pay')
                      ? 'border-[#00B4CC] bg-cyan-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#07C160] text-white flex items-center justify-center font-bold text-[9px]">
                      WX
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">WeChat Pay</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded">Requires docs</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes('WeChat Pay')}
                    onChange={() => {}}
                    className="text-cyan-600 rounded focus:ring-cyan-500"
                  />
                </div>

                {/* 4. Alipay */}
                <div
                  onClick={() => togglePaymentMethod('Alipay')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMethods.includes('Alipay')
                      ? 'border-[#00B4CC] bg-cyan-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#1677FF] text-white flex items-center justify-center font-bold text-[9px]">
                      ALI
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">Alipay</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded">Requires docs</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes('Alipay')}
                    onChange={() => {}}
                    className="text-cyan-600 rounded focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Requirement Explanation Note */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                <span className="text-sm">ℹ️</span>
                <span>
                  <strong>Requirements depend on selected payment methods:</strong> KHQR &amp; ABA PAY are auto-verified with your ABA account. International schemes (WeChat Pay / Alipay) require corporate scheme documents.
                </span>
              </div>

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={selectedMethods.length === 0}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  Continue to Documents →
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 5: BUSINESS REQUIREMENTS ==================== */}
          {step === 5 && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Business documentation requirements</h3>
                <p className="text-xs text-gray-500">
                  Compliance requirements based on your selected payment methods: <strong>{selectedMethods.join(', ')}</strong>
                </p>
              </div>

              {!requiresExtraDocs ? (
                /* KHQR / ABA PAY ONLY NO EXTRA DOCS REQUIRED */
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">ABA bank account verified</h4>
                    <p className="text-xs text-emerald-800 mt-1 max-w-sm">
                      No additional business documents required. KHQR and ABA PAY access is pre-verified using your authenticated ABA merchant settlement account.
                    </p>
                  </div>
                </div>
              ) : (
                /* WECHAT / ALIPAY REQUIRED DOCUMENTS */
                <div className="flex flex-col gap-3.5">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <strong>Scheme Documentation Required:</strong> International payment networks (WeChat Pay &amp; Alipay) mandate entity verification under scheme compliance rules.
                  </div>

                  {/* Document 1: MOC Certificate */}
                  <div className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">1. Business Registration Certificate (MOC)</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          Required by WeChat Pay and Alipay international schemes to verify registered corporate entity in Cambodia.
                        </span>
                      </div>
                      {uploadedMoc ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                          Uploaded ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                    {!uploadedMoc ? (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedMoc('MOC_Registration_Certificate_2026.pdf');
                          addToast('Document Attached', 'MOC Registration Certificate attached', 'info');
                        }}
                        className="py-1.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-xs text-gray-700 font-medium rounded-lg cursor-pointer self-start"
                      >
                        📎 Upload MOC Certificate
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-mono font-medium">
                        📄 {uploadedMoc}
                      </span>
                    )}
                  </div>

                  {/* Document 2: Tax Patent */}
                  <div className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">2. Tax Patent Certificate</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          Required for international payment scheme tax compliance and merchant identification.
                        </span>
                      </div>
                      {uploadedPatent ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                          Uploaded ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                    {!uploadedPatent ? (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPatent('Tax_Patent_Certificate_2026.pdf');
                          addToast('Document Attached', 'Tax Patent Certificate attached', 'info');
                        }}
                        className="py-1.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-xs text-gray-700 font-medium rounded-lg cursor-pointer self-start"
                      >
                        📎 Upload Tax Patent
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-mono font-medium">
                        📄 {uploadedPatent}
                      </span>
                    )}
                  </div>

                  {/* Document 3: Passport / National ID */}
                  <div className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">3. Passport / National ID of Authorized Signatory</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          Required by card brand rules to verify signatory authority for international payment processing.
                        </span>
                      </div>
                      {uploadedIdDoc ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                          Uploaded ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                    {!uploadedIdDoc ? (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedIdDoc('Authorized_Signatory_Passport.pdf');
                          addToast('Document Attached', 'Passport ID document attached', 'info');
                        }}
                        className="py-1.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-xs text-gray-700 font-medium rounded-lg cursor-pointer self-start"
                      >
                        📎 Upload Passport / ID
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-mono font-medium">
                        📄 {uploadedIdDoc}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  Continue to Review Application →
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 6: REVIEW APPLICATION ==================== */}
          {step === 6 && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Review application</h3>
                <p className="text-xs text-gray-500">
                  Verify your production setup summary before activating live provisional access.
                </p>
              </div>

              {/* Summary Table Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Product:</span>
                  <span className="font-bold text-gray-900">QR API</span>
                </div>

                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Submitter:</span>
                  <span className="font-bold text-gray-900">
                    {submitterType === 'own' ? 'Merchant (My own business)' : `Developer on behalf (${currentBusinessName})`}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Business:</span>
                  <span className="font-bold text-gray-900">{currentBusinessName}</span>
                </div>

                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Outlet:</span>
                  <span className="font-bold text-gray-900">{currentOutletName}</span>
                </div>

                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Payment methods:</span>
                  <span className="font-bold text-cyan-700">{selectedMethods.join(', ')}</span>
                </div>

                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Sandbox testing:</span>
                  <span className="font-semibold text-emerald-600">✓ Complete (5/5 verified)</span>
                </div>

                <div className="flex flex-col gap-1.5 border-b border-gray-200/80 pb-2.5">
                  <span className="text-gray-500 font-medium">UI Evidence:</span>
                  <div className="pl-2 flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment flow screen recording:</span>
                      <span className="font-semibold text-emerald-600">
                        {state.uiEvidence?.recordingAttached ? 'Attached' : 'Missing'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">QR payment UI screenshot:</span>
                      <span className="font-semibold text-emerald-600">
                        {state.uiEvidence?.screenshotAttached ? 'Attached' : 'Missing'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-gray-500 font-medium">Business verification:</span>
                  <span className="font-semibold text-emerald-600">✓ Complete (ABA Mobile)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Documents:</span>
                  <span className={`font-semibold ${requiresExtraDocs ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {requiresExtraDocs ? '✓ Complete' : 'Not required'}
                  </span>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl">
                <input
                  type="checkbox"
                  checked={confirmedAuth}
                  onChange={e => setConfirmedAuth(e.target.checked)}
                  className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 shrink-0"
                />
                <span className="leading-snug">
                  I confirm that the information provided is correct and I am authorized to submit this production request.
                </span>
              </label>

              <div className="flex justify-between gap-2 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  ← Back
                </button>

                {/* PRIMARY CTA - CRITICAL WORDING MATCH */}
                <button
                  type="submit"
                  disabled={!confirmedAuth}
                  className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  Submit and activate provisional access
                </button>
              </div>
            </form>
          )}

          {/* ==================== STEP 7: PROVISIONAL PRODUCTION ACCESS ACTIVATED ==================== */}
          {step === 7 && (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold shadow-xs">
                ✓
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Provisional Production Access Activated!
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-md leading-relaxed">
                  Your business <strong className="text-gray-900">{currentBusinessName}</strong> has been granted immediate provisional production access. You can now accept live payments up to $10,000 / month.
                </p>
              </div>

              {/* Live Keys Box */}
              <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs w-full max-w-md text-left font-mono flex flex-col gap-2 shadow-inner">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Live Production Credentials
                </div>

                <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">Live Merchant ID:</span>
                  <span className="text-white font-bold">pw_live_mct_883921</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">Live Public Key:</span>
                  <span className="text-white font-bold">pk_live_8f7a6b5c4d3e2f1a</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Live Secret Key:</span>
                  <span className="text-amber-300 font-bold">sk_live_9z8y7x6w5v4u3t2r</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 w-full max-w-md">
                ✓ ABA PayWay compliance team has received your application for full un-capped verification.
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="mt-2 px-8 py-2.5 text-xs font-bold text-white rounded-lg shadow-sm hover:opacity-95 cursor-pointer"
                style={{ backgroundColor: '#00B4CC' }}
              >
                Return to Workspace
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
