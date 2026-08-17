import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { CredentialCard } from '../components/common/CredentialCard';
import { getVerifiedRequirementsCount, isTechnicalTestingComplete, isUiEvidenceComplete, isReadyForProduction } from '../utils/readiness';
import { RequirementCard } from '../components/qr/RequirementCard';
import { QrSimulatorModal } from '../components/qr/QrSimulatorModal';
import { ApplyForProductionModal } from '../components/qr/ApplyForProductionModal';
import { ProvisionalProductionDashboard } from '../components/qr/ProvisionalProductionDashboard';
import { ProductionReadinessAccordion } from '../components/qr/ProductionReadinessAccordion';
import { AttentionCard } from '../components/qr/AttentionCard';
import { TransactionDetailSideModal } from '../components/transactions/TransactionDetailSideModal';
import { Transaction } from '../types/sandbox';
import { PAYWAY_DEVELOPER_SITE_URL, QR_API_DOCUMENTATION_URL, QR_API_SAMPLE_LANGUAGES } from '../constants/developerResources';
import { Copy, ExternalLink } from 'lucide-react';

export const QrApiPage: React.FC = () => {
  const {
    state,
    updateState,
    currentRoute,
    setRoute,
    setShowCreateTxModal,
    addTransaction,
    transactions,
    addToast,
    uploadEvidence,
    removeEvidence,
  } = useSandbox();

  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorMode, setSimulatorMode] = useState<'sample_payment' | 'test_expired'>('sample_payment');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedCodeLang, setSelectedCodeLang] = useState<'curl' | 'javascript' | 'php' | 'python'>('curl');

  // Determine active sub-tab from current route or fallback
  let activeTab: 'overview' | 'testing' | 'activity' | 'production' = 'overview';
  if (currentRoute.endsWith('/testing')) activeTab = 'testing';
  if (currentRoute.endsWith('/activity')) activeTab = 'activity';
  if (currentRoute.endsWith('/production') || currentRoute.endsWith('/production-access')) activeTab = 'production';

  const getSampleCode = (lang: 'curl' | 'javascript' | 'php' | 'python' | string) => {
    const reqTime = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
    const merchantId = state.merchantId || 'ec432921';
    const secretKey = state.secretKey || 'YOUR_SECRET_KEY';
    const tranId = `PW_${Date.now()}`;

    const sample = QR_API_SAMPLE_LANGUAGES.find(s => s.id === lang);
    if (sample) {
      return sample.snippet({ merchantId, secretKey, reqTime, tranId });
    }
    return '';
  };



  const sampleRequestCode = getSampleCode(selectedCodeLang);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sampleRequestCode);
    }
    setCopiedCode(true);
    addToast('Sample code copied', 'QR API sample request copied to clipboard', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const verifiedCount = getVerifiedRequirementsCount(state);
  const ts = state.testingState || {
    qrGenerated: { status: 'not_detected' },
    paymentCompleted: { status: 'not_detected' },
    webhookReceived: { status: 'not_detected' },
    statusConfirmed: { status: 'not_detected' },
    customerPaymentStates: {
      status: 'not_detected',
      successStateDetected: false,
      expiredStateDetected: false,
    },
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* PAGE HEADER */}
      <PageHeader
        title="QR API"
        description="Generate payment QR codes that customers can scan using ABA Mobile or supported KHQR apps."
        badge={
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-[#00B4CC] border border-cyan-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4CC]" />
              Sandbox
            </span>
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
              {verifiedCount} of 5 requirements verified
            </span>
          </div>
        }
      />

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-semibold text-gray-500">
        <button
          onClick={() => setRoute('/integrations/qr-api')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'overview' ? 'text-[#00B4CC] font-bold' : 'hover:text-gray-800'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4CC] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setRoute('/integrations/qr-api/testing')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'testing' ? 'text-[#00B4CC] font-bold' : 'hover:text-gray-800'
          }`}
        >
          Testing
          {activeTab === 'testing' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4CC] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setRoute('/integrations/qr-api/production')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'production' ? 'text-[#00B4CC] font-bold' : 'hover:text-gray-800'
          }`}
        >
          Production Access
          {activeTab === 'production' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4CC] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setRoute('/integrations/qr-api/activity')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'activity' ? 'text-[#00B4CC] font-bold' : 'hover:text-gray-800'
          }`}
        >
          API Activity ({transactions.length})
          {activeTab === 'activity' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4CC] rounded-full" />
          )}
        </button>
      </div>

      {/* ATTENTION CARD (When PayWay requests changes) */}
      <AttentionCard className="mb-2" />

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* SECTION: PRODUCTION READINESS */}
          {state.productionAccessStatus === 'sandbox' && state.reviewStatus !== 'approved' && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                Production Readiness
              </div>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border ${
                    verifiedCount === 5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {verifiedCount}/5
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">
                      {verifiedCount === 5 
                        ? 'All 5 requirements verified!' 
                        : `${verifiedCount} of 5 requirements verified`}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                      {verifiedCount === 5
                        ? 'You have tested everything and all requirements look good! You can now request production access.'
                        : 'Build and test normally. PayWay will automatically verify supported requirements from your sandbox activity.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setRoute('/integrations/qr-api/production')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer self-start sm:self-center ${
                    verifiedCount === 5 
                      ? 'bg-[#00B4CC] text-white hover:bg-[#009cb2]' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {verifiedCount === 5 ? 'Request production access →' : 'View testing →'}
                </button>
              </div>
            </div>
          )}

          {/* SECTION: SANDBOX CREDENTIALS */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Sandbox Credentials
            </div>
            <CredentialCard
              title="API Keys for QR Integration"
              description="Pass these credentials when making server-to-server requests to generate KHQR strings."
              showMerchantId={true}
            />
          </div>

          {/* SECTION: START BUILDING */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Start Building
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Generate KHQR Payments</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-3xl">
                  Call the PayWay QR endpoint to generate standardized NBC KHQR dynamic QR codes. Once generated, display the QR string or image to the customer to scan with ABA Mobile or any KHQR compatible banking app.
                </p>
              </div>

              {/* Quick Actions & Official Reference */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setRoute('/developer/docs')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    View API documentation
                  </button>
                  <a
                    href={QR_API_DOCUMENTATION_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span>Full QR API Guide</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  Product: <strong className="text-gray-800">ABA PayWay QR API (KHQR)</strong>
                </span>
              </div>

              {/* Sample Request Code Block with Language Selector */}
              <div id="sample-code-block" className="mt-2 bg-gray-900 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto relative">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-gray-800 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1 bg-gray-800/80 p-1 rounded-lg">
                    {QR_API_SAMPLE_LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedCodeLang(lang.id as any)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                          selectedCodeLang === lang.id
                            ? 'bg-[#00B4CC] text-white shadow-xs'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 hidden md:inline mr-2">
                      POST /api/v1/purchase/create_qr
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer text-[11px] font-semibold border border-gray-700"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
                <pre className="text-[11px] leading-relaxed text-gray-200">{sampleRequestCode}</pre>
              </div>


            </div>
          </div>

          {/* SECTION: RECENT ACTIVITY */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Recent Activity
              </div>
              {transactions.length > 0 && (
                <button
                  onClick={() => setRoute('/integrations/qr-api/activity')}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#00B4CC' }}
                >
                  View all logs →
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase">
                        <th className="py-2.5 px-6">Transaction ID</th>
                        <th className="py-2.5 px-4">Method</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-6">Timestamp</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.slice(0, 5).map(tx => (
                        <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setSelectedTx(tx)}>
                          <td className="py-3 px-6 font-mono font-medium text-gray-800">
                            {tx.tranId}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px]">
                              {tx.paymentType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-800">
                            {tx.currency} {tx.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={tx.status} size="sm" />
                          </td>
                          <td className="py-3 px-6 text-gray-400 text-[11px]">
                            {tx.createdAt}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTx(tx);
                              }}
                              className="text-xs font-semibold hover:underline"
                              style={{ color: '#00B4CC' }}
                            >
                              Inspect API →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-2 text-[#00B4CC]">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-gray-700">No activity yet</h3>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                    QR payment requests and webhook callbacks will automatically populate here as you run test charges.
                  </p>
                  <button
                    onClick={() => setShowCreateTxModal(true)}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-opacity hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: '#00B4CC' }}
                  >
                    Run Test Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TESTING */}
      {activeTab === 'testing' && (
        <div className="flex flex-col gap-6">
          {/* TOP BANNER & ACTION BAR */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                Testing
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  verifiedCount === 5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-cyan-50 text-[#00B4CC] border-cyan-200'
                }`}>
                  {verifiedCount === 5 ? '5 of 5 verified (Complete)' : `${verifiedCount} of 5 requirements verified`}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                {verifiedCount === 5
                  ? 'Great job! You have tested everything and all scenarios are verified. You can now request production access.'
                  : 'Test your integration normally. PayWay automatically verifies supported requirements from your sandbox activity.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              {verifiedCount === 5 && (
                <button
                  onClick={() => setRoute('/integrations/qr-api/production')}
                  className="px-3.5 py-2 text-xs font-bold rounded-lg text-white bg-[#00B4CC] hover:bg-[#009cb2] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Request production access</span>
                  <span>→</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSimulatorMode('sample_payment');
                  setShowSimulator(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run sample QR payment
              </button>

              <button
                onClick={() => {
                  setSimulatorMode('test_expired');
                  setShowSimulator(true);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Test expired QR
              </button>
            </div>
          </div>

          {/* REQUIREMENTS CARDS LIST */}
          <div className="flex flex-col gap-4">
            <RequirementCard
              number={1}
              title="1. QR generated successfully"
              explanation="Technical requirement. Automatically verified when a successful QR generation API request appears in sandbox."
              status={ts.qrGenerated.status}
              autoVerified={true}
              lastEventTime={ts.qrGenerated.lastEventTime}
              lastDetails={ts.qrGenerated.lastDetails}
            />

            <RequirementCard
              number={2}
              title="2. Payment completed successfully"
              explanation="Technical requirement. Automatically verified when a simulated or real sandbox KHQR payment is completed."
              status={ts.paymentCompleted.status}
              autoVerified={true}
              lastEventTime={ts.paymentCompleted.lastEventTime}
              lastTxId={ts.paymentCompleted.lastTxId}
              lastDetails={ts.paymentCompleted.lastDetails}
            />

            <RequirementCard
              number={3}
              title="3. Webhook received"
              explanation="Technical requirement. Automatically verified when your configured listener endpoint receives and acknowledges the payment result webhook."
              status={ts.webhookReceived.status}
              autoVerified={true}
              lastEventTime={ts.webhookReceived.lastEventTime}
              lastDetails={ts.webhookReceived.lastDetails}
            />

            <RequirementCard
              number={4}
              title="4. Final transaction status confirmed"
              explanation="Technical requirement. Automatically verified when your system calls check_transaction API and receives the final SUCCESS status."
              status={ts.statusConfirmed.status}
              autoVerified={true}
              lastEventTime={ts.statusConfirmed.lastEventTime}
              lastDetails={ts.statusConfirmed.lastDetails}
            />

            <RequirementCard
              number={5}
              title="5. Customer payment states verified"
              explanation="Demonstrate both successful payment and expired QR states alongside UI evidence screenshots."
              status={ts.customerPaymentStates.status}
              autoVerified={false}
              isCustomerStatesRequirement={true}
              successStateDetected={ts.customerPaymentStates.successStateDetected}
              expiredStateDetected={ts.customerPaymentStates.expiredStateDetected}
              successEvidence={ts.customerPaymentStates.successEvidence}
              expiredEvidence={ts.customerPaymentStates.expiredEvidence}
              onUploadEvidence={uploadEvidence}
              onRemoveEvidence={removeEvidence}
            />
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY LOGS */}
      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>KHQR API Activity Logs</CardTitle>
            <CardDescription>
              Inspected request logs and instant webhook callback history for KHQR payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase">
                      <th className="py-2.5 px-4">Tran ID</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Payer</th>
                      <th className="py-2.5 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-mono font-medium text-gray-800">{tx.tranId}</td>
                        <td className="py-3 px-4 font-semibold text-gray-700">
                          {tx.currency} {tx.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={tx.status} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold">
                            {tx.paymentType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{tx.payerName || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-400 text-[11px]">{tx.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs">No activity logged yet.</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PRODUCTION ACCESS */}
      {activeTab === 'production' && (
        <div className="flex flex-col gap-6 w-full">
          {state.productionAccessStatus !== 'sandbox' || state.reviewStatus !== 'none' ? (
            <ProvisionalProductionDashboard onOpenResubmitModal={() => setShowApplyModal(true)} />
          ) : (
            <ProductionReadinessAccordion
              onRequestProductionAccess={() => setShowApplyModal(true)}
            />
          )}
        </div>
      )}

      <QrSimulatorModal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        initialMode={simulatorMode}
      />

      <ApplyForProductionModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />

      <TransactionDetailSideModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        tx={selectedTx}
      />
    </div>
  );
};
