import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge, StatusVariant } from '../components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { getVerifiedRequirementsCount, isReadyForProduction } from '../utils/readiness';

type TabType = 'my_integrations' | 'explore_products';

export const IntegrationsPage: React.FC = () => {
  const { state, updateState, setRoute, openAskNaviWithQuery, setShowFeedbackModal } = useSandbox();

  const hasIntegration =
    !!state.hasCreatedFirstIntegration ||
    !!state.hasIntegration ||
    (state.qrIntegrationStatus !== 'not_started' && state.qrIntegrationStatus !== undefined);

  // Default tab: 'my_integrations' if user has 1+ integrations, otherwise 'explore_products'
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    hasIntegration ? 'my_integrations' : 'explore_products'
  );

  const activeIntegrationCount = hasIntegration ? 1 : 0;

  const handleDismissTooltip = () => {
    updateState({ hasVisitedIntegrations: true });
  };

  const handleAskNavi = () => {
    updateState({ hasVisitedIntegrations: true });
    openAskNaviWithQuery(
      "Tell me how you want customers to pay and I'll help you choose the right PayWay integration."
    );
  };

  const handleStartQrIntegration = () => {
    updateState({
      hasCreatedFirstIntegration: true,
      hasIntegration: true,
      qrIntegrationStatus: state.qrIntegrationStatus === 'not_started' ? 'in_progress' : state.qrIntegrationStatus,
    });
    setRoute('/integrations/qr-api');
  };

  // Determine QR API state details for My Integrations card
  let qrBadgeLabel = 'Sandbox';
  let qrBadgeVariant: StatusVariant = 'sandbox';
  let myIntegrationDesc = 'Continue building and testing your QR API integration.';
  let myIntegrationSub = `${getVerifiedRequirementsCount(state)} of 5 requirements verified`;
  let qrCtaText = 'Continue integration';
  let qrCtaAction = () => setRoute('/integrations/qr-api');

  if (state.reviewStatus === 'submitted' || state.reviewStatus === 'under_review') {
    qrBadgeLabel = 'Under Review';
    qrBadgeVariant = 'under_review';
    myIntegrationDesc = 'PayWay is reviewing your production request.';
    myIntegrationSub = 'Review Status: Under Review';
    qrCtaText = 'View review status';
    qrCtaAction = () => setRoute('/integrations/qr-api/production');
  } else if (state.reviewStatus === 'changes_requested') {
    qrBadgeLabel = 'Changes Requested';
    qrBadgeVariant = 'changes_requested';
    myIntegrationDesc = 'PayWay requested updates to your production application.';
    myIntegrationSub = 'Review Status: Action Required';
    qrCtaText = 'Review feedback';
    qrCtaAction = () => {
      setRoute('/integrations/qr-api/production');
      if (setShowFeedbackModal) setShowFeedbackModal(true);
    };
  } else if (state.reviewStatus === 'resubmitted') {
    qrBadgeLabel = 'Under Review';
    qrBadgeVariant = 'resubmitted';
    myIntegrationDesc = 'PayWay is reviewing your updated production request.';
    myIntegrationSub = 'Review Status: Resubmitted';
    qrCtaText = 'View review status';
    qrCtaAction = () => setRoute('/integrations/qr-api/production');
  } else if (state.reviewStatus === 'approved' || state.productionAccessStatus === 'full_production') {
    qrBadgeLabel = 'Production Approved';
    qrBadgeVariant = 'approved';
    myIntegrationDesc = 'Your production credentials are ready.';
    myIntegrationSub = 'Production Credentials Ready';
    qrCtaText = 'Open integration';
    qrCtaAction = () => setRoute('/integrations/qr-api/production');
  } else if (isReadyForProduction(state)) {
    qrBadgeLabel = 'Production Ready';
    qrBadgeVariant = 'active';
    myIntegrationDesc = 'Your required Sandbox checks and UI evidence are complete.';
    myIntegrationSub = '5 of 5 requirements verified';
    qrCtaText = 'Request production access';
    qrCtaAction = () => setRoute('/integrations/qr-api/production');
  } else {
    qrBadgeLabel = 'Sandbox';
    qrBadgeVariant = 'sandbox';
    myIntegrationDesc = 'Continue building and testing your QR API integration.';
    myIntegrationSub = `${getVerifiedRequirementsCount(state)} of 5 requirements verified`;
    qrCtaText = 'Continue integration';
    qrCtaAction = () => setRoute('/integrations/qr-api');
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <PageHeader
        title="Payment Integrations"
        description="Start, manage and explore PayWay product integrations."
      />

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px" aria-label="Integrations Tabs">
          <button
            onClick={() => setActiveTab('my_integrations')}
            className={`py-3 px-1 border-b-2 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'my_integrations'
                ? 'border-[#00B4CC] text-[#00B4CC]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>My Integrations</span>
            {activeIntegrationCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'my_integrations'
                    ? 'bg-cyan-100 text-[#00B4CC]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {activeIntegrationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('explore_products')}
            className={`py-3 px-1 border-b-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'explore_products'
                ? 'border-[#00B4CC] text-[#00B4CC]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Explore Products
          </button>
        </nav>
      </div>

      {/* TAB 1: MY INTEGRATIONS */}
      {activeTab === 'my_integrations' && (
        <div className="flex flex-col gap-4">
          {!hasIntegration ? (
            /* Empty State */
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-4 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-100 text-[#00B4CC] flex items-center justify-center mb-3">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-800">No integrations yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                Start a PayWay product integration and it will appear here.
              </p>
              <button
                onClick={() => setActiveTab('explore_products')}
                className="mt-4 px-4 py-2 rounded-lg bg-[#00B4CC] hover:bg-[#0A9BB0] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Explore products →
              </button>
            </div>
          ) : (
            /* Active Integration Card */
            <Card className="hover:border-cyan-300 transition-all shadow-2xs">
              <CardHeader
                action={<StatusBadge status={qrBadgeVariant} label={qrBadgeLabel} size="sm" />}
              >
                <CardTitle
                  icon={
                    <svg width="22" height="22" fill="none" stroke="#00B4CC" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  }
                >
                  QR API
                </CardTitle>
                <CardDescription>{myIntegrationDesc}</CardDescription>
              </CardHeader>

              <CardContent className="pt-2 border-t border-gray-100 mt-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500">
                  {myIntegrationSub}
                </span>

                <button
                  onClick={qrCtaAction}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white shadow-2xs transition-opacity hover:opacity-95 cursor-pointer flex items-center gap-1"
                  style={{ backgroundColor: '#00B4CC' }}
                >
                  <span>{qrCtaText}</span>
                  <span>→</span>
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: EXPLORE PRODUCTS */}
      {activeTab === 'explore_products' && (
        <div className="flex flex-col gap-6">
          {/* Contextual Ask Navi Banner */}
          <div className="bg-gradient-to-r from-cyan-50/80 via-teal-50/50 to-sky-50/80 border border-cyan-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#00B4CC] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                N
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800">
                  Not sure which product fits your use case?
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Navi can recommend the right PayWay integration based on how you want to accept payments.
                </p>
              </div>
            </div>

            <button
              onClick={handleAskNavi}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-2xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              style={{ backgroundColor: '#00B4CC' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0A9BB0')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#00B4CC')}
            >
              <span>Ask Navi</span>
              <span className="text-cyan-100">→</span>
            </button>

            {/* First Visit Contextual Tooltip Nudge (Only on Explore Products) */}
            {!state.hasVisitedIntegrations && (
              <div className="absolute top-full left-4 sm:left-auto sm:right-4 mt-2 z-30 w-80 bg-slate-900 text-white rounded-xl p-4 shadow-xl border border-slate-700 animate-fade-in">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-cyan-300">Not sure where to start?</h4>
                  <button
                    onClick={handleDismissTooltip}
                    className="text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  Navi can recommend a PayWay product based on how you want to accept payments.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={handleDismissTooltip}
                    className="text-[11px] text-slate-400 hover:text-white font-medium cursor-pointer"
                  >
                    Maybe later
                  </button>
                  <button
                    onClick={handleAskNavi}
                    className="px-3 py-1 bg-[#00B4CC] hover:bg-[#0A9BB0] text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    Ask Navi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Available Now Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Available now</h3>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* QR API Catalogue Card */}
              <Card className="flex flex-col justify-between hover:border-cyan-300 hover:shadow-md transition-all">
                <CardHeader
                  action={
                    <div className="flex items-center gap-1.5">
                      {hasIntegration ? (
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          Already integrating
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                          Available in Sandbox
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                        API
                      </span>
                    </div>
                  }
                >
                  <CardTitle
                    icon={
                      <svg width="22" height="22" fill="none" stroke="#00B4CC" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    }
                  >
                    QR API
                  </CardTitle>
                  <CardDescription>
                    Generate payment QR codes customers can scan using ABA Mobile or supported KHQR banking apps.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    NBC KHQR Standard
                  </span>

                  {!hasIntegration ? (
                    <button
                      onClick={handleStartQrIntegration}
                      className="text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1 hover:opacity-95"
                      style={{ backgroundColor: '#00B4CC' }}
                    >
                      <span>Start integration</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setRoute('/integrations/qr-api')}
                      className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-cyan-500 text-[#00B4CC] hover:bg-cyan-50 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>View integration</span>
                      <span>→</span>
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Coming soon</h3>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* eCommerce Checkout */}
              <Card className="flex flex-col justify-between border-gray-200 bg-gray-50/50 opacity-80">
                <CardHeader
                  action={
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                      Coming soon
                    </span>
                  }
                >
                  <CardTitle
                    icon={
                      <svg width="20" height="20" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                      </svg>
                    }
                  >
                    eCommerce Checkout
                  </CardTitle>
                  <CardDescription>
                    Accept card, ABA PAY and KHQR payments through PayWay hosted checkout.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">Hosted Page</span>
                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded border border-gray-200 select-none">
                    Coming soon
                  </span>
                </CardContent>
              </Card>

              {/* Credit / Debit Card API */}
              <Card className="flex flex-col justify-between border-gray-200 bg-gray-50/50 opacity-80">
                <CardHeader
                  action={
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                      Coming soon
                    </span>
                  }
                >
                  <CardTitle
                    icon={
                      <svg width="20" height="20" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    }
                  >
                    Credit / Debit Card API
                  </CardTitle>
                  <CardDescription>
                    Accept Visa, Mastercard, JCB and UnionPay payments with supported 3D Secure flows.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">Card Payments</span>
                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded border border-gray-200 select-none">
                    Coming soon
                  </span>
                </CardContent>
              </Card>

              {/* ABA Mobile Deeplink API */}
              <Card className="flex flex-col justify-between border-gray-200 bg-gray-50/50 opacity-80">
                <CardHeader
                  action={
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                      Coming soon
                    </span>
                  }
                >
                  <CardTitle
                    icon={
                      <svg width="20" height="20" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="5" y="2" width="14" height="20" rx="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    }
                  >
                    ABA Mobile Deeplink API
                  </CardTitle>
                  <CardDescription>
                    Launch customers directly into ABA Mobile to continue a supported payment experience.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">Mobile App</span>
                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded border border-gray-200 select-none">
                    Coming soon
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
