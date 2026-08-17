import React from 'react';
import { useSandbox } from '../context/SandboxContext';
import { SandboxBanner } from '../components/layout/SandboxBanner';
import { TopNav } from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import { AskNaviModal } from '../components/layout/AskNaviModal';
import { CreateTransactionModal } from '../components/layout/CreateTransactionModal';
import { ReviewFeedbackModal } from '../components/qr/ReviewFeedbackModal';
import { PrototypeControlsModal } from '../components/layout/PrototypeControlsModal';
import { GuidedTourOverlay } from '../components/layout/GuidedTourOverlay';
import { FloatingSetupGuide } from '../components/layout/FloatingSetupGuide';
import { ToastContainer } from '../components/common/Toast';

import { LoginPage } from '../pages/LoginPage';
import { AccountCreatedPage } from '../pages/AccountCreatedPage';
import { SandboxWelcomePage } from '../pages/SandboxWelcomePage';
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
    desc: 'Explore payment APIs including KHQR code generation, Card processing, and Hosted Checkout.',
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

  // Special full-screen route for /login, /account-created, or /welcome
  if (currentRoute === '/login') {
    return <LoginPage />;
  }
  if (currentRoute === '/account-created') {
    return <AccountCreatedPage />;
  }
  if (currentRoute === '/welcome' || currentRoute === '/sandbox-welcome') {
    return <SandboxWelcomePage />;
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

      {/* Floating Setup Guide */}
      <FloatingSetupGuide />

      {/* Guided Tour Overlay */}
      <GuidedTourOverlay />
    </div>
  );
};
