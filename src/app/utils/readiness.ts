import { QrTestingState, SandboxState } from '../types/sandbox';

export function getVerifiedRequirementsCount(arg?: QrTestingState | SandboxState | any): number {
  if (!arg) return 0;

  const testingState: QrTestingState | undefined = arg.testingState || (arg.qrGenerated ? arg : undefined);
  if (!testingState) return 0;

  let count = 0;
  if (testingState.qrGenerated?.status === 'verified') count++;
  if (testingState.paymentCompleted?.status === 'verified') count++;
  if (testingState.webhookReceived?.status === 'verified') count++;
  if (testingState.statusConfirmed?.status === 'verified') count++;
  if (testingState.customerPaymentStates?.status === 'verified') count++;

  return count;
}
