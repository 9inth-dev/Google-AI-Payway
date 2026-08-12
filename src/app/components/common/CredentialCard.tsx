import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';

interface CredentialRowProps {
  label: string;
  value: string;
  isSecret?: boolean;
}

export const CredentialRow: React.FC<CredentialRowProps> = ({ label, value, isSecret = false }) => {
  const [revealed, setRevealed] = useState(!isSecret);
  const [copied, setCopied] = useState(false);
  const { addToast } = useSandbox();

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
    }
    setCopied(true);
    addToast('Copied to Clipboard', `${label} copied`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 shrink-0">
        {label}
      </span>
      <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded border border-gray-100 px-3 py-2 overflow-hidden">
        <span
          className="font-mono text-xs text-gray-700 truncate flex-1"
          style={{ letterSpacing: revealed ? '0.04em' : '0.15em' }}
        >
          {revealed ? value : '•'.repeat(Math.min(24, value.length))}
        </span>
        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded shrink-0">
          Sandbox
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {isSecret && (
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="text-xs font-medium px-3 py-1.5 rounded-md text-white transition-colors"
            style={{ backgroundColor: '#00B4CC' }}
          >
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
          style={{ color: '#00B4CC', borderColor: '#00B4CC' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export const CredentialCard: React.FC<{
  title?: string;
  description?: string;
  showMerchantId?: boolean;
  showWebhook?: boolean;
}> = ({
  title = 'API Credentials',
  description = 'Use these sandbox keys to authenticate API calls. Keep secret keys private.',
  showMerchantId = true,
  showWebhook = false,
}) => {
  const { state, addToast } = useSandbox();

  const handleRegenerate = () => {
    if (confirm('Regenerate sandbox keys? Current test credentials will be updated.')) {
      addToast('Keys Regenerated', 'New sandbox API keys issued successfully', 'info');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#E6F8FA' }}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="#00B4CC"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="7" cy="17" r="3" />
              <path d="M10.5 13.5L21 3" />
              <path d="M18 5l2 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
            {description && (
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleRegenerate}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          title="Regenerate Sandbox Keys"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Roll Keys
        </button>
      </div>

      <div className="flex flex-col">
        {showMerchantId && (
          <CredentialRow label="Merchant ID" value={state.merchantId} isSecret={false} />
        )}
        <CredentialRow label="Public Key" value={state.publicKey} isSecret={false} />
        <CredentialRow label="Secret Key" value={state.secretKey} isSecret={true} />
        {showWebhook && (
          <CredentialRow label="Webhook URL" value={state.webhookUrl} isSecret={false} />
        )}
      </div>
    </div>
  );
};
