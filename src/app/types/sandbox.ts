export type IntegrationStatus = 
  | 'not_started'
  | 'in_progress'
  | 'testing'
  | 'completed'
  | 'production_requested'
  | 'active';

export type ProductionAccessStatus = 
  | 'sandbox'
  | 'provisional_active'
  | 'provisional_expired'
  | 'provisional_limit_reached'
  | 'full_production';

export type ReviewStatus = 
  | 'none'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'resubmitted'
  | 'approved';

export type RequirementStatus = 'not_detected' | 'in_progress' | 'verified' | 'action_required' | 'failed';

export interface RequirementDetail {
  status: RequirementStatus;
  lastEventTime?: string;
  lastTxId?: string;
  lastDetails?: string;
}

export interface EvidenceItem {
  fileName: string;
  fileData?: string; // base64 or object url preview
  uploadedAt: string;
}

export interface CustomerPaymentStatesRequirement {
  status: RequirementStatus;
  successStateDetected: boolean;
  expiredStateDetected: boolean;
  successEvidence?: EvidenceItem;
  expiredEvidence?: EvidenceItem;
  lastEventTime?: string;
}

export interface QrTestingState {
  qrGenerated: RequirementDetail;
  paymentCompleted: RequirementDetail;
  webhookReceived: RequirementDetail;
  statusConfirmed: RequirementDetail;
  customerPaymentStates: CustomerPaymentStatesRequirement;
}

export interface ProductionReadiness {
  apiKeysVerified: boolean;
  webhookConfigured: boolean;
  testTransactionsCount: number;
  testTransactionsRequired: number;
  businessDetailsSubmitted: boolean;
  kycApproved: boolean;
}

export interface SandboxState {
  isLoggedIn: boolean;
  firstTimeUser: boolean;
  hasIntegration: boolean;
  qrIntegrationStatus: IntegrationStatus;
  hasDismissedQrHelper?: boolean;
  testingState?: QrTestingState;
  productionReadiness: ProductionReadiness;
  productionAccessStatus: ProductionAccessStatus;
  reviewStatus: ReviewStatus;
  provisionalDaysRemaining: number;
  provisionalTransactionUsage: number;
  provisionalTransactionLimit: number;
  provisionalVolumeUSD?: number;
  provisionalStartDate?: string;
  productionApiKey?: string;
  
  // Credentials
  publicKey: string;
  secretKey: string;
  merchantId: string;
  
  // Webhook
  webhookUrl: string;
  webhookSecret: string;
}

export interface Transaction {
  id: string;
  tranId: string;
  amount: number;
  currency: 'USD' | 'KHR';
  description: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paymentType: 'KHQR' | 'CARD' | 'DEEPLINK';
  createdAt: string;
  payerName?: string;
  hash?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export type ApiCategory = 'api_request' | 'payment' | 'webhook' | 'error';

export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'Webhook';
  endpoint: string;
  status: number;
  result: string;
  category: ApiCategory;
  tranId?: string;
  latencyMs?: number;
  verifiedRequirement?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  errorInfo?: {
    code: string;
    message: string;
    troubleshooting: string;
    suggestion: string;
  };
}
