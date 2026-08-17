import React from 'react';
import { useSandbox } from '../context/SandboxContext';
import { CredentialCard } from '../components/common/CredentialCard';
import { getVerifiedRequirementsCount, isTechnicalTestingComplete, isUiEvidenceComplete } from '../utils/readiness';
import { AttentionCard } from '../components/qr/AttentionCard';

export const HomePage: React.FC = () => {
  const {
    state,
    setRoute,
    setShowCreateTxModal,
    transactions,
    apiLogs,
    setSelectedActivityLogId,
  } = useSandbox();

  const hasIntegration = !!state.hasCreatedFirstIntegration || !!state.hasIntegration;
  const isFirstTime = !!state.firstTimeUser;
  const displayLogs = isFirstTime ? [] : (apiLogs || []);

  const verifiedCount = getVerifiedRequirementsCount(state.productionReadiness);
  const latestTx = !isFirstTime && transactions && transactions.length > 0 ? transactions[0] : null;

  const developerTools = [
    {
      title: 'API Documentation',
      desc: 'View API specs & endpoint details',
      icon: (
        <svg width="18" height="18" fill="none" stroke="#00B4CC" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      bg: '#E6F8FA',
      onClick: () => setRoute('/developer/docs'),
    },
    {
      title: 'Payment Simulator',
      desc: 'Run sandbox payment calls',
      icon: (
        <svg width="18" height="18" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      bg: '#FFFBEB',
      onClick: () => setShowCreateTxModal(true),
    },
    {
      title: 'Sample Code',
      desc: 'cURL, Node.js, PHP & Python',
      icon: (
        <svg width="18" height="18" fill="none" stroke="#8B5CF6" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      bg: '#F3F0FF',
      onClick: () => setRoute('/developer/docs'),
    },
    {
      title: 'Transactions',
      desc: 'Inspect request logs & webhooks',
      icon: (
        <svg width="18" height="18" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      bg: '#ECFDF5',
      onClick: () => setRoute('/transactions'),
    },
  ];

  return (
    <div className="flex flex-col gap-7 w-full pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0D3D4F' }}>
            Welcome to PayWay Sandbox, <span style={{ color: '#00B4CC' }}>Henry</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Build and test PayWay integrations safely before accepting live payments.
          </p>
        </div>
      </div>

      {/* Attention Card (If changes requested by ABA PayWay review) */}
      <AttentionCard className="mb-0" />

      {/* ================= SECTION 1: DEVELOPER TOOLS ================= */}
      <div data-tour="developer-tools">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Developer Tools
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {developerTools.map(tool => (
            <button
              key={tool.title}
              onClick={tool.onClick}
              className="bg-white rounded-xl border border-gray-100 shadow-2xs p-4 text-left flex items-center gap-3.5 hover:shadow-md hover:border-cyan-100 transition-all cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: tool.bg }}
              >
                {tool.icon}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">{tool.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{tool.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ================= SECTION 2: SANDBOX CREDENTIALS ================= */}
      <div data-tour="credentials">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Sandbox Credentials
        </div>
        <CredentialCard
          title="Sandbox Credentials"
          description="Use these test keys to authenticate your Sandbox API requests."
          showMerchantId={true}
        />
      </div>

      {/* ================= SECTION 3: YOUR PRODUCTS ================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Your Products
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              PayWay products configured in your Sandbox workspace.
            </p>
          </div>
          <button
            onClick={() => setRoute('/integrations')}
            className="text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: '#00B4CC' }}
          >
            Explore more integrations →
          </button>
        </div>

        {!hasIntegration ? (
          /* FIRST TIME EMPTY STATE */
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-8 flex flex-col items-center justify-center text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-[#00B4CC]"
              style={{ backgroundColor: '#E6F8FA' }}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              No product integrations yet
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-5">
              Start your first PayWay product integration to begin building and testing in Sandbox.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setRoute('/integrations')}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
                style={{ backgroundColor: '#00B4CC' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0A9BB0')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#00B4CC')}
              >
                Start a product integration
              </button>
              <button
                onClick={() => setRoute('/integrations')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer px-3 py-2"
              >
                Explore integrations
              </button>
            </div>
          </div>
        ) : (
          /* EXISTING USER INTEGRATIONS LIST */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active QR API Card */}
            <div className="bg-white rounded-xl border border-cyan-200 shadow-2xs p-5 flex flex-col justify-between hover:border-cyan-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#00B4CC] flex items-center justify-center font-bold">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">QR API</h3>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {state.productionAccessStatus === 'full_production' || state.reviewStatus === 'approved'
                          ? 'Live Production Access'
                          : state.reviewStatus === 'submitted'
                          ? 'Review Pending (2-3 days)'
                          : state.reviewStatus === 'under_review'
                          ? 'Under Active Review'
                          : state.reviewStatus === 'changes_requested'
                          ? 'Changes Requested'
                          : state.reviewStatus === 'resubmitted'
                          ? 'Resubmitted for Review'
                          : 'Sandbox Environment'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                    state.productionAccessStatus === 'full_production' || state.reviewStatus === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : state.reviewStatus === 'changes_requested'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : state.reviewStatus === 'submitted' || state.reviewStatus === 'under_review' || state.reviewStatus === 'resubmitted'
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      state.productionAccessStatus === 'full_production' || state.reviewStatus === 'approved'
                        ? 'bg-emerald-500'
                        : state.reviewStatus === 'changes_requested'
                        ? 'bg-amber-500'
                        : state.reviewStatus === 'submitted' || state.reviewStatus === 'under_review' || state.reviewStatus === 'resubmitted'
                        ? 'bg-cyan-500 animate-pulse'
                        : 'bg-gray-400'
                    }`} />
                    {state.productionAccessStatus === 'full_production' || state.reviewStatus === 'approved'
                      ? 'Approved'
                      : state.reviewStatus === 'changes_requested'
                      ? 'Action Required'
                      : state.reviewStatus === 'submitted'
                      ? 'Submitted'
                      : state.reviewStatus === 'under_review'
                      ? 'Under Review'
                      : state.reviewStatus === 'resubmitted'
                      ? 'Resubmitted'
                      : 'Sandbox'}
                  </span>
                </div>

                {state.productionAccessStatus !== 'sandbox' || state.reviewStatus !== 'none' ? (
                  <div className="grid grid-cols-2 gap-3 my-4 bg-gray-50/70 rounded-lg p-3 border border-gray-100 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase block">
                        Review Timeline
                      </span>
                      <span className="font-bold text-gray-800 mt-0.5 block">
                        {state.reviewStatus === 'approved' ? 'Complete' : '2-3 Working Days'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase block">
                        Review Status
                      </span>
                      <span className="font-bold text-emerald-700 mt-0.5 block">
                        {(() => {
                          switch (state.reviewStatus) {
                            case 'submitted': return 'Submitted';
                            case 'under_review': return 'Under Review';
                            case 'changes_requested': return 'Changes Requested';
                            case 'resubmitted': return 'Resubmitted';
                            case 'approved': return 'Approved';
                            default: return 'In Review';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                ) : isTechnicalTestingComplete(state) && !isUiEvidenceComplete(state) ? (
                  <div className="grid grid-cols-2 gap-3 my-4 bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-amber-800 uppercase block">
                        Readiness Status
                      </span>
                      <span className="font-bold text-amber-900 mt-0.5 block">
                        Almost ready
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-amber-800 uppercase block">
                        Action Required
                      </span>
                      <span className="font-bold text-amber-900 mt-0.5 block">
                        UI evidence required
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 my-4 bg-gray-50/70 rounded-lg p-3 border border-gray-100 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase block">
                        Production Readiness
                      </span>
                      <span className="font-bold text-gray-800 mt-0.5 block">
                        {verifiedCount} of 5 verified
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase block">
                        Last Activity
                      </span>
                      <span className="font-semibold text-gray-700 mt-0.5 block truncate">
                        {latestTx
                          ? `${latestTx.tranId} (${latestTx.currency} ${latestTx.amount.toFixed(2)})`
                          : 'No activity yet'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {state.reviewStatus === 'approved'
                    ? 'Live Production Active'
                    : state.reviewStatus !== 'none'
                    ? 'Sandbox Testing Active'
                    : 'Integration Active'}
                </span>
                <button
                  onClick={() => setRoute(state.reviewStatus !== 'none' || isTechnicalTestingComplete(state) ? '/integrations/qr-api/production' : '/integrations/qr-api')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
                  style={{ backgroundColor: '#00B4CC' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0A9BB0')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#00B4CC')}
                >
                  {state.reviewStatus !== 'none'
                    ? 'View review status'
                    : isTechnicalTestingComplete(state)
                    ? 'Request production access →'
                    : 'Continue integration →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= SECTION 4: RECENT API ACTIVITY ================= */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Recent API Activity</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Sandbox request logs, payments, and webhooks
            </p>
          </div>
          {displayLogs && displayLogs.length > 0 && (
            <button
              onClick={() => setRoute('/integrations/qr-api/activity')}
              className="text-xs font-semibold hover:underline cursor-pointer"
              style={{ color: '#00B4CC' }}
            >
              View full activity log →
            </button>
          )}
        </div>

        {displayLogs && displayLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="py-2.5 px-6">Timestamp</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Endpoint / Event</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-6">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayLogs.slice(0, 5).map(log => (
                  <tr
                    key={log.id}
                    onClick={() => {
                      setSelectedActivityLogId(log.id);
                      setRoute('/integrations/qr-api/activity');
                    }}
                    className="hover:bg-cyan-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-6 text-gray-500 text-[11px] font-mono">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.method === 'POST'
                            ? 'bg-blue-50 text-blue-700'
                            : log.method === 'GET'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-800">
                      {log.endpoint}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status >= 200 && log.status < 300
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-700 text-[11px] font-medium">
                      {log.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mb-3 text-[#00B4CC]">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800">No API activity yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
              Your Sandbox requests, payments and webhooks will appear here once you start integrating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
