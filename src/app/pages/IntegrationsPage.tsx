import React from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';

export const IntegrationsPage: React.FC = () => {
  const { state, setRoute, setShowCreateTxModal } = useSandbox();

  const integrationsList = [
    {
      id: 'qr-api',
      title: 'KHQR Code API',
      description: 'Generate dynamic NBC KHQR codes, verify instant Bakong payments, and poll status in real-time.',
      status: state.qrIntegrationStatus,
      icon: (
        <svg width="22" height="22" fill="none" stroke="#00B4CC" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      badgeText: 'Primary API',
      route: '/integrations/qr-api',
      popular: true,
      clickable: true,
    },
    {
      id: 'ecommerce-checkout',
      title: 'eCommerce Checkout',
      description: 'Accept cards, ABA PAY and KHQR payments seamlessly through PayWay hosted web checkout popups.',
      status: 'coming_soon',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      ),
      badgeText: 'Hosted Web Checkout',
      route: '',
      popular: false,
      clickable: false,
    },
    {
      id: 'card-api',
      title: 'Credit / Debit Card API',
      description: 'Accept Visa, Mastercard, JCB, and UnionPay with 3D Secure v2 authentication.',
      status: 'coming_soon',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#8B5CF6" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      badgeText: 'Card Payments',
      route: '',
      popular: false,
      clickable: false,
    },
    {
      id: 'deeplink-mobile',
      title: 'ABA Mobile Deeplink API',
      description: 'Seamless app-to-app payment redirection into ABA Mobile for Cambodian merchants.',
      status: 'coming_soon',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
      badgeText: 'Mobile App',
      route: '',
      popular: false,
      clickable: false,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Payment Integrations"
        description="Explore ABA PayWay sandbox APIs. Select a payment method to start testing integration endpoints, review documentation, or test live callbacks."
        breadcrumbs={[{ label: 'Home', onClick: () => setRoute('/home') }, { label: 'Integrations' }]}
        badge={<StatusBadge status={state.productionAccessStatus} label={state.productionAccessStatus === 'sandbox' ? 'Sandbox' : 'Provisional Sandbox'} />}
        actions={
          <button
            onClick={() => setShowCreateTxModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition-opacity hover:opacity-95 cursor-pointer"
            style={{ backgroundColor: '#00B4CC' }}
          >
            + Test Transaction
          </button>
        }
      />

      {/* Provisional Access Summary Meter - Only visible when application has been submitted */}
      {state.productionAccessStatus !== 'sandbox' && (
        <Card className="bg-gradient-to-r from-teal-50/50 via-white to-cyan-50/30 border-cyan-100">
          <CardContent className="pt-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0 font-bold text-sm">
                  i
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800">Sandbox Provisional Access</h3>
                    <StatusBadge status="provisional" size="sm" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    You are currently building in the sandbox environment. You have{' '}
                    <span className="font-semibold text-gray-700">{state.provisionalDaysRemaining} days</span> remaining
                    in your provisional sandbox period.
                  </p>
                </div>
              </div>

              {/* Usage Gauge */}
              <div className="flex flex-col gap-1.5 min-w-[200px] bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Test Tx Usage</span>
                  <span className="font-mono font-bold text-cyan-700">
                    {state.provisionalTransactionUsage} / {state.provisionalTransactionLimit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (state.provisionalTransactionUsage / state.provisionalTransactionLimit) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">Unlimited sandbox test API calls allowed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrationsList.map(item => (
          <Card
            key={item.id}
            className={`flex flex-col justify-between transition-all ${
              item.clickable
                ? 'hover:border-cyan-200 hover:shadow-md cursor-pointer'
                : 'border-gray-100 opacity-75 bg-gray-50/40 cursor-not-allowed select-none'
            }`}
            onClick={item.clickable ? () => setRoute(item.route) : undefined}
          >
            <CardHeader
              action={
                <div className="flex flex-col items-end gap-1">
                  {item.clickable ? (
                    <StatusBadge status={item.status} size="sm" />
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  )}
                  {item.popular && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      Popular
                    </span>
                  )}
                </div>
              }
            >
              <CardTitle icon={item.icon}>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>

            <CardContent className="pt-0 border-t border-gray-50 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                {item.badgeText}
              </span>
              {item.clickable ? (
                <span
                  className="text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  style={{ color: '#00B4CC' }}
                >
                  Manage API Integration →
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded border border-gray-200 cursor-not-allowed">
                  Unclickable / Coming Soon
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
