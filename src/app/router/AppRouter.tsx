import React from 'react';
import { useSandbox } from '../context/SandboxContext';
import { SandboxBanner } from '../components/layout/SandboxBanner';
import { TopNav } from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import { AskNaviModal } from '../components/layout/AskNaviModal';
import { CreateTransactionModal } from '../components/layout/CreateTransactionModal';
import { ReviewFeedbackModal } from '../components/qr/ReviewFeedbackModal';
import { PrototypeControlsModal } from '../components/layout/PrototypeControlsModal';
import { ToastContainer } from '../components/common/Toast';

import { LoginPage } from '../pages/LoginPage';
import { AccountCreatedPage } from '../pages/AccountCreatedPage';
import { HomePage } from '../pages/HomePage';
import { IntegrationsPage } from '../pages/IntegrationsPage';
import { QrApiPage } from '../pages/QrApiPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { DeveloperPage } from '../pages/DeveloperPage';
import { HelpPage } from '../pages/HelpPage';
import { EmptyState } from '../components/common/EmptyState';

// Tour step definitions preserved from existing UI
const TOUR_STEPS = [
  {
    title: 'API Credentials',
    desc: 'Your sandbox Public and Secret API keys live here. Copy them to authenticate every API request.',
  },
  {
    title: 'Integrations & KHQR API',
    desc: 'Explore payment APIs including KHQR code generation, Card processing, and Checkout SDK.',
  },
  {
    title: 'Transactions Activity',
    desc: 'Every test payment triggered via the API appears here. Search, filter, and inspect full details.',
  },
  {
    title: 'Ask Navi AI Assistant',
    desc: 'Navi is your AI assistant. Ask it about endpoints, authentication flows, error codes, or hash signatures.',
  },
  {
    title: 'Developer Quick Start',
    desc: 'Follow the step-by-step checklist to go from setup to your first successful test transaction.',
  },
];

export const AppRouter: React.FC = () => {
  const {
    currentRoute,
    setRoute,
    welcomeModalOpen,
    setWelcomeModalOpen,
    tourStep,
    setTourStep,
    showPrototypeModal,
    setShowPrototypeModal,
  } = useSandbox();

  // Special full-screen route for /login or /account-created
  if (currentRoute === '/login') {
    return <LoginPage />;
  }
  if (currentRoute === '/account-created') {
    return <AccountCreatedPage />;
  }

  // Render content based on current route
  const renderMainContent = () => {
    if (currentRoute === '/home' || currentRoute === '/' || currentRoute === '') {
      return <HomePage />;
    }
    if (currentRoute === '/integrations') {
      return <IntegrationsPage />;
    }
    if (currentRoute.startsWith('/integrations/qr-api')) {
      return <QrApiPage />;
    }
    if (currentRoute === '/transactions') {
      return <TransactionsPage />;
    }
    if (currentRoute.startsWith('/developer')) {
      return <DeveloperPage />;
    }
    if (currentRoute === '/help') {
      return <HelpPage />;
    }

    // Placeholder for secondary routes
    return (
      <EmptyState
        title={`${currentRoute.replace('/', '').toUpperCase()} Section`}
        description="This feature module is accessible in your PayWay Sandbox workspace."
        primaryAction={{
          label: 'Return to Home',
          onClick: () => setRoute('/home'),
        }}
      />
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif", minWidth: 1024, backgroundColor: '#F0F2F5' }}
    >
      <SandboxBanner />
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {renderMainContent()}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <AskNaviModal />
      <CreateTransactionModal />
      <ReviewFeedbackModal />
      <PrototypeControlsModal isOpen={showPrototypeModal} onClose={() => setShowPrototypeModal(false)} />
      <ToastContainer />

      {/* Welcome Modal */}
      {welcomeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl text-center flex flex-col items-center relative"
            style={{ width: 400, padding: '36px 40px 32px' }}
          >
            <button
              onClick={() => setWelcomeModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>

            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #00B4CC 0%, #0A9BB0 100%)' }}
            >
              <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
                <line x1="6" y1="15" x2="9" y2="15" />
                <line x1="11" y1="15" x2="14" y2="15" />
              </svg>
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#00B4CC' }}>
              ABA PayWay Sandbox
            </p>
            <h2 className="text-lg font-bold mb-3" style={{ color: '#0D3D4F' }}>
              Welcome, Henry! 👋
            </h2>
            <p className="text-xs leading-relaxed mb-6 text-gray-500" style={{ maxWidth: 280 }}>
              Your sandbox is in test mode so you can start integrating right away. No real money moves — everything here is safe to explore.
            </p>

            <button
              onClick={() => setWelcomeModalOpen(false)}
              className="w-full rounded-lg py-2.5 text-xs font-semibold text-white mb-2.5 transition-colors cursor-pointer"
              style={{ backgroundColor: '#00B4CC' }}
            >
              Got it, let&apos;s go!
            </button>
            <button
              onClick={() => {
                setWelcomeModalOpen(false);
                setTourStep(0);
              }}
              className="text-xs font-semibold text-cyan-600 hover:underline cursor-pointer"
            >
              Take a guided tour of the dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Guided Tour Overlay */}
      {tourStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-cyan-100 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600">
                Step {tourStep + 1} of {TOUR_STEPS.length}
              </span>
              <button
                onClick={() => setTourStep(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Skip tour
              </button>
            </div>

            <h3 className="font-bold text-sm mb-1 text-gray-800">
              {TOUR_STEPS[tourStep].title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              {TOUR_STEPS[tourStep].desc}
            </p>

            <div className="flex items-center gap-2">
              {tourStep > 0 && (
                <button
                  onClick={() => setTourStep(prev => (prev !== null && prev > 0 ? prev - 1 : null))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              <button
                onClick={() =>
                  setTourStep(prev => (prev !== null && prev < TOUR_STEPS.length - 1 ? prev + 1 : null))
                }
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-white"
                style={{ backgroundColor: '#00B4CC' }}
              >
                {tourStep === TOUR_STEPS.length - 1 ? 'Finish Tour ✓' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
