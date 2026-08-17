import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SandboxState, Transaction, ToastMessage, QrTestingState, RequirementStatus, EvidenceItem, ApiLog, ApiCategory } from '../types/sandbox';
import { isReadyForProduction } from '../utils/readiness';

const DEFAULT_TESTING_STATE: QrTestingState = {
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

const DEFAULT_SANDBOX_STATE: SandboxState = {
  isLoggedIn: false,
  firstTimeUser: true,
  hasIntegration: false,
  qrIntegrationStatus: 'not_started',
  hasDismissedQrHelper: false,
  hasSeenSandboxWelcome: false,
  hasCompletedWelcomeTour: false,
  hasViewedSandboxCredentials: false,
  hasCreatedFirstIntegration: false,
  hasCompletedFirstTestPayment: false,
  hasCopiedApiCredentials: false,
  hasMadeFirstApiCall: false,
  showPostTourGuideHighlight: false,
  setupGuideDismissed: false,
  hasVisitedIntegrations: false,
  testingState: DEFAULT_TESTING_STATE,
  uiEvidence: {
    recordingAttached: false,
    screenshotAttached: false,
  },
  productionReadiness: {
    apiKeysVerified: false,
    webhookConfigured: false,
    testTransactionsCount: 0,
    testTransactionsRequired: 5,
    businessDetailsSubmitted: false,
    kycApproved: false,
  },
  productionAccessStatus: 'sandbox',
  reviewStatus: 'none',
  publicKey: 'pk_sandbox_a1b2c3d4e5f6g7h8i9j0',
  secretKey: 'sk_sandbox_z9y8x7w6v5u4t3s2r1q0',
  merchantId: 'aba_payway_mch_883921',
  webhookUrl: 'https://api.yourcompany.com/v1/payway-webhook',
  webhookSecret: 'whsec_sandbox_998877665544332211',
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_001',
    tranId: '000000000000123',
    orderId: '000000000000123',
    voucherCount: 1,
    amount: 40.00,
    currency: 'USD',
    description: 'Spa Package Service #123',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'KHQR',
    paymentMethodType: 'abapay',
    createdAt: '2026-08-16 10:24:12',
    payerName: 'Lara Windfield',
    phoneNumber: '+855 98 76 54 32',
    discountedAmount: 0.00,
    paidAmount: 40.00,
    refundAmount: 0.00,
    channel: 'Mobile App',
    consumerType: 'Individual',
    hash: '8e4f1a2b9c3d4e5f67890123456789ab',
  },
  {
    id: 'tx_002',
    tranId: '000000000000122',
    orderId: '000000000000122',
    voucherCount: 2,
    amount: 12.50,
    currency: 'USD',
    description: 'Organic Tea & Treatment #122',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'KHQR',
    paymentMethodType: 'abapay',
    createdAt: '2026-08-16 09:50:33',
    payerName: 'Jasper Thorne',
    phoneNumber: '+855 97 65 43 21',
    discountedAmount: 0.00,
    paidAmount: 12.50,
    refundAmount: 0.00,
    channel: 'Online',
    consumerType: 'Individual',
    hash: '5d3b2c1a8e7f609123456789abcdef01',
  },
  {
    id: 'tx_003',
    tranId: '000000000000121',
    orderId: '000000000000121',
    amount: 12.50,
    currency: 'USD',
    description: 'Aromatherapy Session #121',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'KHQR',
    paymentMethodType: 'wing',
    createdAt: '2026-08-16 08:35:10',
    payerName: 'Mira Larkspur',
    phoneNumber: '+855 96 54 32 10',
    discountedAmount: 0.00,
    paidAmount: 12.50,
    refundAmount: 0.00,
    channel: 'POS',
    consumerType: 'Individual',
    hash: '3a1b2c4d5e6f7890123456789abcdef2',
  },
  {
    id: 'tx_004',
    tranId: '000000000000120',
    orderId: '000000000000120',
    amount: 12.50,
    currency: 'USD',
    description: 'Body Scrub Care #120',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'KHQR',
    paymentMethodType: 'acleda',
    createdAt: '2026-08-15 16:12:45',
    payerName: 'Finnian Crestwood',
    phoneNumber: '+855 95 43 21 09',
    discountedAmount: 0.00,
    paidAmount: 12.50,
    refundAmount: 0.00,
    channel: 'Mobile App',
    consumerType: 'Individual',
    hash: '1f2e3d4c5b6a7890123456789abcdef3',
  },
  {
    id: 'tx_005',
    tranId: '000000000000119',
    orderId: '000000000000119',
    amount: 25.00,
    currency: 'USD',
    description: 'Herbal Compress Therapy #119',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'CARD',
    paymentMethodType: 'visa',
    cardLast4: '1111',
    cardLabel: 'Local card',
    createdAt: '2026-08-15 14:40:19',
    payerName: 'Zara Nightingale',
    phoneNumber: '+855 94 32 10 98',
    discountedAmount: 0.00,
    paidAmount: 25.00,
    refundAmount: 0.00,
    channel: 'Online',
    consumerType: 'Individual',
    hash: '7b8c9d0e1f2a34567890123456789abc',
  },
  {
    id: 'tx_006',
    tranId: '000000000000118',
    orderId: '000000000000118',
    amount: 50.00,
    currency: 'USD',
    description: 'Deluxe Spa Retreat #118',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'CARD',
    paymentMethodType: 'mastercard',
    cardLast4: '2222',
    cardLabel: 'ABA card',
    createdAt: '2026-08-14 11:15:00',
    payerName: 'Orion Vale',
    phoneNumber: '+855 93 21 09 87',
    discountedAmount: 0.00,
    paidAmount: 50.00,
    refundAmount: 20.00,
    channel: 'POS',
    consumerType: 'Corporate',
    hash: '9a0b1c2d3e4f567890123456789abcde',
  },
  {
    id: 'tx_007',
    tranId: '000000000000117',
    orderId: '000000000000117',
    amount: 120.00,
    currency: 'USD',
    description: 'Executive Wellness VIP #117',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'CARD',
    paymentMethodType: 'unionpay',
    cardLast4: '3333',
    cardLabel: 'Inter. card',
    createdAt: '2026-08-14 09:02:11',
    payerName: 'Talia Rivers',
    phoneNumber: '+855 92 10 98 76',
    discountedAmount: 0.00,
    paidAmount: 120.00,
    refundAmount: 70.00,
    channel: 'Online',
    consumerType: 'Individual',
    hash: '4e5f6a7b8c9d01234567890123456789',
  },
  {
    id: 'tx_008',
    tranId: '000000000000116',
    orderId: '000000000000116',
    amount: 10.00,
    currency: 'USD',
    description: 'Essential Oils Boutique #116',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'KHQR',
    paymentMethodType: 'abapay',
    createdAt: '2026-08-13 15:20:00',
    payerName: 'Kieran Ashford',
    phoneNumber: '+855 91 09 87 65',
    discountedAmount: 0.00,
    paidAmount: 10.00,
    refundAmount: 10.00,
    channel: 'Payment Link',
    consumerType: 'Individual',
    hash: '2c3d4e5f6a7b8c9d0123456789abcdef',
  },
  {
    id: 'tx_009',
    tranId: '000000000000115',
    orderId: '000000000000115',
    amount: 20.00,
    currency: 'USD',
    description: 'Reflexology Treatment #115',
    status: 'SUCCESS',
    orderStatus: 'Completed',
    paymentType: 'CARD',
    paymentMethodType: 'visa',
    cardLast4: '4444',
    cardLabel: 'ABA card',
    createdAt: '2026-08-13 13:10:45',
    payerName: 'Elena Starling',
    phoneNumber: '+855 90 98 76 54',
    discountedAmount: 0.00,
    paidAmount: 20.00,
    refundAmount: 20.00,
    channel: 'Mobile App',
    consumerType: 'Individual',
    hash: '6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
  }
];

export const INITIAL_API_LOGS: ApiLog[] = [];

export const SAMPLE_API_LOGS: ApiLog[] = [
  {
    id: 'log_001',
    timestamp: '10:24:12 AM',
    method: 'POST',
    endpoint: '/api/v1/purchase/create_qr',
    status: 200,
    result: 'Success',
    category: 'api_request',
    tranId: 'PW20260811-9821',
    latencyMs: 118,
    verifiedRequirement: '1. QR generated successfully',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-PayWay-Merchant-Id': 'aba_payway_mch_883921',
      'X-PayWay-Signature': '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d'
    },
    requestBody: {
      req_time: '20260811102412',
      merchant_id: 'aba_payway_mch_883921',
      tran_id: 'PW20260811-9821',
      amount: 15.50,
      currency: 'USD',
      items: 'W3sibmFtZSI6IkNvZmZlZSIsInF1YW50aXR5IjoxLCJwcmljZSI6MTUuNX1d',
      hash: 'e89f812a1b2c3d4e5f67890123456789abcdef1234567890abcdef1234567890'
    },
    responseHeaders: {
      'Content-Type': 'application/json',
      'Server': 'PayWay-Gateway/2.4'
    },
    responseBody: {
      status: 0,
      description: 'Success',
      qrString: '00020101021238580016A0000007700001010112aba_payway_mch_883921520459995303840540415.505802KH5912PAYWAY_TEST6010PHNOM_PENH63047A1F',
      md5: '7d8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c'
    }
  },
  {
    id: 'log_002',
    timestamp: '10:24:25 AM',
    method: 'POST',
    endpoint: '/payments/complete-scan',
    status: 200,
    result: 'SUCCESS',
    category: 'payment',
    tranId: 'PW20260811-9821',
    latencyMs: 342,
    verifiedRequirement: '2. Payment completed successfully',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-Client-App': 'ABA-Mobile-Simulator/3.1'
    },
    requestBody: {
      tran_id: 'PW20260811-9821',
      payer_name: 'Sokha Chan',
      payer_bank: 'ABA Mobile',
      amount: 15.50,
      currency: 'USD'
    },
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: {
      status: 0,
      status_code: 'SUCCESS',
      approval_code: 'APV881203',
      tran_id: 'PW20260811-9821'
    }
  },
  {
    id: 'log_003',
    timestamp: '10:24:27 AM',
    method: 'Webhook',
    endpoint: 'payment.completed',
    status: 200,
    result: 'Received',
    category: 'webhook',
    tranId: 'PW20260811-9821',
    latencyMs: 84,
    verifiedRequirement: '3. Webhook received',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-PayWay-Webhook-Signature': 'whsec_e3f2a1b0c9d8e7f6a5b4c3d2e1f0'
    },
    requestBody: {
      event: 'payment.completed',
      merchant_id: 'aba_payway_mch_883921',
      tran_id: 'PW20260811-9821',
      amount: 15.50,
      currency: 'USD',
      status: 'SUCCESS',
      timestamp: '2026-08-11T10:24:27Z'
    },
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: {
      received: true,
      code: 200,
      message: 'Merchant listener endpoint acknowledged webhook callback'
    }
  },
  {
    id: 'log_004',
    timestamp: '10:24:30 AM',
    method: 'GET',
    endpoint: '/api/v1/purchase/check_transaction',
    status: 200,
    result: 'SUCCESS',
    category: 'api_request',
    tranId: 'PW20260811-9821',
    latencyMs: 95,
    verifiedRequirement: '4. Final transaction status confirmed',
    requestHeaders: {
      'X-PayWay-Merchant-Id': 'aba_payway_mch_883921'
    },
    requestBody: {
      tran_id: 'PW20260811-9821',
      req_time: '20260811102430'
    },
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: {
      status: 0,
      tran_id: 'PW20260811-9821',
      payment_status: 'SUCCESS',
      total_amount: 15.50,
      currency: 'USD'
    }
  }
];

interface SandboxContextType {
  state: SandboxState;
  transactions: Transaction[];
  apiLogs: ApiLog[];
  toasts: ToastMessage[];
  currentRoute: string;
  showCreateTxModal: boolean;
  showAskNaviModal: boolean;
  askNaviInitialQuery: string | null;
  welcomeModalOpen: boolean;
  tourStep: number | null;
  devSidebarOpen: boolean;
  selectedActivityLogId: string | null;
  showFeedbackModal: boolean;
  showPrototypeModal: boolean;
  
  // Actions
  setRoute: (route: string) => void;
  updateState: (updates: Partial<SandboxState>) => void;
  updateTestingState: (updates: Partial<QrTestingState>) => void;
  uploadEvidence: (type: 'success' | 'expired', file: EvidenceItem) => void;
  removeEvidence: (type: 'success' | 'expired') => void;
  attachRecording: () => void;
  removeRecording: () => void;
  attachScreenshot: () => void;
  removeScreenshot: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'tranId'>) => Transaction;
  addApiLog: (log: Omit<ApiLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => ApiLog;
  createFailedSampleApiLog: () => ApiLog;
  setApiLogs: React.Dispatch<React.SetStateAction<ApiLog[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  setShowCreateTxModal: (show: boolean) => void;
  setShowAskNaviModal: (show: boolean) => void;
  setShowFeedbackModal: (show: boolean) => void;
  setShowPrototypeModal: (show: boolean) => void;
  openAskNaviWithQuery: (query: string) => void;
  setWelcomeModalOpen: (show: boolean) => void;
  setTourStep: (step: number | null | ((prev: number | null) => number | null)) => void;
  setDevSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedActivityLogId: (id: string | null) => void;
  resetToDefaults: () => void;
}


const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export const SandboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage if available
  const [state, setState] = useState<SandboxState>(() => {
    try {
      const saved = localStorage.getItem('payway_sandbox_state');
      return saved ? JSON.parse(saved) : DEFAULT_SANDBOX_STATE;
    } catch {
      return DEFAULT_SANDBOX_STATE;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const savedState = localStorage.getItem('payway_sandbox_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.firstTimeUser) return [];
      } else {
        if (DEFAULT_SANDBOX_STATE.firstTimeUser) return [];
      }
      const saved = localStorage.getItem('payway_sandbox_txs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [apiLogs, setApiLogs] = useState<ApiLog[]>(() => {
    try {
      const savedState = localStorage.getItem('payway_sandbox_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.firstTimeUser) return [];
      } else {
        if (DEFAULT_SANDBOX_STATE.firstTimeUser) return [];
      }
      const saved = localStorage.getItem('payway_sandbox_apilogs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedActivityLogId, setSelectedActivityLogId] = useState<string | null>(null);
  const [askNaviInitialQuery, setAskNaviInitialQuery] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Route state is kept in memory/sessionStorage only. It is intentionally
  // NOT reflected into window.location.hash: the v0 preview runtime installs
  // a global MutationObserver that reacts to any hash change by calling
  // document.querySelector(hash) for anchor-scroll tracking. Our routes
  // contain slashes (e.g. "/account-created"), which is not a valid CSS
  // selector and throws a SyntaxError in that runtime code whenever the hash
  // changes - including via history.pushState, since that still mutates
  // location.hash. Avoiding the URL hash entirely sidesteps the issue.
  const getInitialRoute = () => {
    try {
      const saved = sessionStorage.getItem('payway_sandbox_route');
      if (saved) return saved;
    } catch {
      // ignore
    }
    if (!state.isLoggedIn) return '/login';
    if (!state.hasSeenSandboxWelcome) return '/welcome';
    return '/home';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [showCreateTxModal, setShowCreateTxModal] = useState(false);
  const [showAskNaviModal, setShowAskNaviModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPrototypeModal, setShowPrototypeModal] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [devSidebarOpen, setDevSidebarOpen] = useState(true);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('payway_sandbox_state', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save sandbox state', e);
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem('payway_sandbox_txs', JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('payway_sandbox_apilogs', JSON.stringify(apiLogs));
    } catch (e) {
      console.error('Failed to save API logs', e);
    }
  }, [apiLogs]);

  const addApiLog = (newLog: Omit<ApiLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): ApiLog => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const createdLog: ApiLog = {
      ...newLog,
      id: newLog.id || `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: newLog.timestamp || formattedTime,
    };

    setApiLogs(prev => [createdLog, ...prev]);
    if (createdLog.status >= 200 && createdLog.status < 300) {
      setState(prev => ({ ...prev, hasMadeFirstApiCall: true }));
    }
    return createdLog;
  };

  const createFailedSampleApiLog = (): ApiLog => {
    const log = addApiLog({
      method: 'POST',
      endpoint: '/api/v1/purchase/create_qr',
      status: 400,
      result: 'INVALID_SIGNATURE',
      category: 'error',
      latencyMs: 142,
      requestHeaders: {
        'Content-Type': 'application/json',
        'X-PayWay-Merchant-Id': state.merchantId,
        'X-PayWay-Signature': 'invalid_signature_sample'
      },
      requestBody: {
        req_time: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14),
        merchant_id: state.merchantId,
        tran_id: `PW_ERR_${Date.now()}`,
        amount: 25.00,
        currency: 'USD',
        items: 'W3sibmFtZSI6IkZhaWxlZCBUZXN0IiwicXVhbnRpdHkiOjEsInByaWNlIjoyNX1d',
        hash: 'invalid_calculated_hash_string_123456789'
      },
      responseHeaders: {
        'Content-Type': 'application/json',
        'Server': 'PayWay-Gateway/2.4'
      },
      responseBody: {
        status: 3,
        description: 'Invalid hash signature provided in API payload header/body',
        error_code: 'ERR_400_INVALID_HASH'
      },
      errorInfo: {
        code: 'ERR_400_INVALID_HASH',
        message: 'Base64 HMAC-SHA512 hash signature mismatch.',
        troubleshooting: 'Parameter concatenation mismatch before HMAC calculation. The exact required parameter order is: req_time + merchant_id + tran_id + amount + items + shipping + firstname + lastname + email + phone + type + payment_option.',
        suggestion: 'Ensure secret_key is applied as HMAC key and that output is base64-encoded without extra trailing white spaces.'
      }
    });

    addToast('Failed Request Created', 'Simulated 400 Bad Request error log added to API Activity', 'error');
    setSelectedActivityLogId(log.id);
    return log;
  };

  const openAskNaviWithQuery = (queryText: string) => {
    setAskNaviInitialQuery(queryText);
    setShowAskNaviModal(true);
  };

  // Persist the current route to sessionStorage & push to history
  useEffect(() => {
    try {
      sessionStorage.setItem('payway_sandbox_route', currentRoute);
      if (window.location.pathname !== currentRoute) {
        window.history.pushState(null, '', currentRoute);
      }
    } catch {
      // ignore
    }
  }, [currentRoute]);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path && path !== '/') {
        setCurrentRoute(path);
      } else {
        setCurrentRoute('/home');
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setRoute = useCallback((route: string) => {
    const cleanRoute = route.startsWith('/') ? route : `/${route}`;
    setCurrentRoute(cleanRoute);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    try {
      if (window.location.pathname !== cleanRoute) {
        window.history.pushState(null, '', cleanRoute);
      }
    } catch {
      // ignore
    }
  }, []);

  const addToast = useCallback((title: string, message?: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateState = useCallback((updates: Partial<SandboxState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateTestingState = useCallback((updates: Partial<QrTestingState>) => {
    setState(prev => {
      const currentTesting = prev.testingState || DEFAULT_TESTING_STATE;
      const newTesting: QrTestingState = {
        ...currentTesting,
        ...updates,
      };

      // Auto compute requirement 5 customerPaymentStates status
      const cps = newTesting.customerPaymentStates;
      let newCpsStatus: RequirementStatus = 'not_detected';
      const hasBothBehaviors = cps.successStateDetected && cps.expiredStateDetected;
      const hasBothEvidence = !!cps.successEvidence && !!cps.expiredEvidence;

      if (hasBothBehaviors && hasBothEvidence) {
        newCpsStatus = 'verified';
      } else if (cps.successStateDetected || cps.expiredStateDetected || cps.successEvidence || cps.expiredEvidence) {
        newCpsStatus = 'action_required';
      }

      newTesting.customerPaymentStates = {
        ...cps,
        status: newCpsStatus,
      };

      return {
        ...prev,
        testingState: newTesting,
      };
    });
  }, []);

  const uploadEvidence = useCallback((type: 'success' | 'expired', file: EvidenceItem) => {
    setState(prev => {
      const currentTesting = prev.testingState || DEFAULT_TESTING_STATE;
      const cps = currentTesting.customerPaymentStates;

      const updatedCps = {
        ...cps,
        [type === 'success' ? 'successEvidence' : 'expiredEvidence']: file,
      };

      const hasBothBehaviors = updatedCps.successStateDetected && updatedCps.expiredStateDetected;
      const hasBothEvidence = !!updatedCps.successEvidence && !!updatedCps.expiredEvidence;

      let newStatus: RequirementStatus = 'not_detected';
      if (hasBothBehaviors && hasBothEvidence) {
        newStatus = 'verified';
      } else if (updatedCps.successStateDetected || updatedCps.expiredStateDetected || updatedCps.successEvidence || updatedCps.expiredEvidence) {
        newStatus = 'action_required';
      }

      updatedCps.status = newStatus;

      return {
        ...prev,
        testingState: {
          ...currentTesting,
          customerPaymentStates: updatedCps,
        },
      };
    });
    addToast('Evidence Uploaded', `Uploaded UI evidence screenshot for ${type === 'success' ? 'successful payment' : 'expired QR'}`, 'success');
  }, [addToast]);

  const removeEvidence = useCallback((type: 'success' | 'expired') => {
    setState(prev => {
      const currentTesting = prev.testingState || DEFAULT_TESTING_STATE;
      const cps = currentTesting.customerPaymentStates;

      const updatedCps = {
        ...cps,
        [type === 'success' ? 'successEvidence' : 'expiredEvidence']: undefined,
      };

      const hasBothBehaviors = updatedCps.successStateDetected && updatedCps.expiredStateDetected;
      const hasBothEvidence = !!updatedCps.successEvidence && !!updatedCps.expiredEvidence;

      let newStatus: RequirementStatus = 'not_detected';
      if (hasBothBehaviors && hasBothEvidence) {
        newStatus = 'verified';
      } else if (updatedCps.successStateDetected || updatedCps.expiredStateDetected || updatedCps.successEvidence || updatedCps.expiredEvidence) {
        newStatus = 'action_required';
      }

      updatedCps.status = newStatus;

      return {
        ...prev,
        testingState: {
          ...currentTesting,
          customerPaymentStates: updatedCps,
        },
      };
    });
    addToast('Evidence Removed', `Removed screenshot for ${type === 'success' ? 'successful payment' : 'expired QR'}`, 'info');
  }, [addToast]);

  const attachRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      uiEvidence: {
        ...(prev.uiEvidence || { recordingAttached: false, screenshotAttached: false }),
        recordingAttached: true,
        recordingFileName: 'qr-payment-flow.mp4',
        recordingFileSize: '12.4 MB',
      },
    }));
    addToast('Screen Recording Attached', 'Attached qr-payment-flow.mp4', 'success');
  }, [addToast]);

  const removeRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      uiEvidence: {
        ...(prev.uiEvidence || { recordingAttached: false, screenshotAttached: false }),
        recordingAttached: false,
        recordingFileName: undefined,
        recordingFileSize: undefined,
      },
    }));
    addToast('Screen Recording Removed', 'Removed screen recording attachment', 'info');
  }, [addToast]);

  const attachScreenshot = useCallback(() => {
    setState(prev => ({
      ...prev,
      uiEvidence: {
        ...(prev.uiEvidence || { recordingAttached: false, screenshotAttached: false }),
        screenshotAttached: true,
        screenshotFileName: 'qr-payment-screen.png',
        screenshotFileSize: '1.8 MB',
      },
    }));
    addToast('UI Screenshot Attached', 'Attached qr-payment-screen.png', 'success');
  }, [addToast]);

  const removeScreenshot = useCallback(() => {
    setState(prev => ({
      ...prev,
      uiEvidence: {
        ...(prev.uiEvidence || { recordingAttached: false, screenshotAttached: false }),
        screenshotAttached: false,
        screenshotFileName: undefined,
        screenshotFileSize: undefined,
      },
    }));
    addToast('UI Screenshot Removed', 'Removed UI screenshot attachment', 'info');
  }, [addToast]);

  const addTransaction = useCallback((newTx: Omit<Transaction, 'id' | 'createdAt' | 'tranId'>): Transaction => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    
    const orderIdNum = String(Date.now()).slice(-15).padStart(15, '0');
    const created: Transaction = {
      ...newTx,
      id: `txn_sb_${Date.now()}`,
      tranId: newTx.orderId || orderIdNum,
      orderId: newTx.orderId || orderIdNum,
      orderStatus: newTx.orderStatus || (newTx.status === 'SUCCESS' ? 'Completed' : newTx.status === 'PENDING' ? 'Pending' : 'Failed'),
      discountedAmount: newTx.discountedAmount ?? 0,
      paidAmount: newTx.paidAmount ?? newTx.amount,
      refundAmount: newTx.refundAmount ?? 0,
      phoneNumber: newTx.phoneNumber || '+855 98 76 54 32',
      paymentMethodType: newTx.paymentMethodType || (newTx.paymentType === 'CARD' ? 'visa' : 'abapay'),
      channel: newTx.channel || 'Online',
      consumerType: newTx.consumerType || 'Individual',
      createdAt: dateStr,
      hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };

    setTransactions(prev => [created, ...prev]);

    setState(prev => ({
      ...prev,
      hasCompletedFirstTestPayment: true,
      productionReadiness: {
        ...prev.productionReadiness,
        testTransactionsCount: prev.productionReadiness.testTransactionsCount + 1,
      },
    }));

    addToast('Transaction Created', `Successfully generated ${created.tranId}`, 'success');
    return created;
  }, [addToast]);

  const resetToDefaults = useCallback(() => {
    setState(DEFAULT_SANDBOX_STATE);
    setTransactions(INITIAL_TRANSACTIONS);
    setApiLogs(INITIAL_API_LOGS);
    localStorage.removeItem('payway_sandbox_state');
    localStorage.removeItem('payway_sandbox_txs');
    localStorage.removeItem('payway_sandbox_apilogs');
    addToast('State Reset', 'Restored default demo sandbox settings', 'info');
  }, [addToast]);

  const contextValue = useMemo(() => ({
    state,
    transactions,
    apiLogs,
    toasts,
    currentRoute,
    showCreateTxModal,
    showAskNaviModal,
    askNaviInitialQuery,
    welcomeModalOpen,
    tourStep,
    devSidebarOpen,
    selectedActivityLogId,
    showFeedbackModal,
    showPrototypeModal,
    setRoute,
    updateState,
    updateTestingState,
    uploadEvidence,
    removeEvidence,
    attachRecording,
    removeRecording,
    attachScreenshot,
    removeScreenshot,
    addTransaction,
    addApiLog,
    createFailedSampleApiLog,
    setApiLogs,
    setTransactions,
    addToast,
    removeToast,
    setShowCreateTxModal,
    setShowAskNaviModal,
    setShowFeedbackModal,
    setShowPrototypeModal,
    openAskNaviWithQuery,
    setWelcomeModalOpen,
    setTourStep,
    setDevSidebarOpen,
    setSelectedActivityLogId,
    resetToDefaults,
  }), [
    state,
    transactions,
    apiLogs,
    toasts,
    currentRoute,
    showCreateTxModal,
    showAskNaviModal,
    askNaviInitialQuery,
    welcomeModalOpen,
    tourStep,
    devSidebarOpen,
    selectedActivityLogId,
    showFeedbackModal,
    showPrototypeModal,
    setRoute,
    updateState,
    updateTestingState,
    uploadEvidence,
    removeEvidence,
    attachRecording,
    removeRecording,
    attachScreenshot,
    removeScreenshot,
    addTransaction,
    addApiLog,
    createFailedSampleApiLog,
    setApiLogs,
    setTransactions,
    addToast,
    removeToast,
    openAskNaviWithQuery,
    resetToDefaults,
  ]);

  return (
    <SandboxContext.Provider value={contextValue}>
      {children}
    </SandboxContext.Provider>
  );
};

export const useSandbox = () => {
  const context = useContext(SandboxContext);
  if (!context) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
};
