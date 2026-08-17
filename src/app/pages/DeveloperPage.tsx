import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { CredentialCard } from '../components/common/CredentialCard';
import { PAYWAY_DEVELOPER_SITE_URL, QR_API_DOCUMENTATION_URL } from '../constants/developerResources';
import { ExternalLink, BookOpen, QrCode, Code2, ArrowRight } from 'lucide-react';

export const DeveloperPage: React.FC = () => {
  const { currentRoute, setRoute, state, updateState, addToast } = useSandbox();

  let devTab: 'api-keys' | 'settings' | 'docs' = 'api-keys';
  if (currentRoute.endsWith('/settings')) devTab = 'settings';
  if (currentRoute.endsWith('/docs')) devTab = 'docs';

  // Form state for Developer Settings
  const [webhook, setWebhook] = useState(state.webhookUrl);
  const [ipWhitelist, setIpWhitelist] = useState('203.144.128.1, 103.216.52.12');
  const [hmacAlgo, setHmacAlgo] = useState('HMAC-SHA512');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateState({ webhookUrl: webhook });
    addToast('Developer Settings Saved', 'Webhook URL & API preferences updated', 'success');
  };

  const hasActiveQrIntegration = !!state.hasCreatedFirstIntegration || !!state.hasIntegration;

  return (
    <div className="flex flex-col gap-5 w-full">
      <PageHeader
        title="Developer Console"
        description="Manage API credentials, configure webhook callbacks, signature algorithms, and access official PayWay documentation."
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-semibold text-gray-500">
        <button
          onClick={() => setRoute('/developer/api-keys')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            devTab === 'api-keys' ? 'text-cyan-600 font-bold' : 'hover:text-gray-800'
          }`}
        >
          API Keys &amp; Credentials
          {devTab === 'api-keys' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setRoute('/developer/settings')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            devTab === 'settings' ? 'text-cyan-600 font-bold' : 'hover:text-gray-800'
          }`}
        >
          Developer Settings &amp; Webhooks
          {devTab === 'settings' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setRoute('/developer/docs')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            devTab === 'docs' ? 'text-cyan-600 font-bold' : 'hover:text-gray-800'
          }`}
        >
          API Documentation
          {devTab === 'docs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
          )}
        </button>
      </div>

      {/* SUB-TAB 1: API KEYS */}
      {devTab === 'api-keys' && (
        <div className="flex flex-col gap-5">
          <CredentialCard showMerchantId showWebhook />

          <Card>
            <CardHeader>
              <CardTitle>API Key Security &amp; Usage Rules</CardTitle>
              <CardDescription>
                Important guidelines for managing ABA PayWay sandbox credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <span className="text-cyan-600 font-bold">1.</span>
                <p>
                  <strong>Never expose Secret Keys in client-side code</strong> (HTML/React browser JS). Always proxy requests through your server environment.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-cyan-600 font-bold">2.</span>
                <p>
                  All request payloads require a <strong>base64 encoded HMAC-SHA512 signature</strong> calculated using your Secret Key.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-cyan-600 font-bold">3.</span>
                <p>
                  Sandbox keys are isolated to <code>checkout-sandbox.payway.com.kh</code> and will not accept real currency or debit real bank accounts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUB-TAB 2: DEVELOPER SETTINGS */}
      {devTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Sandbox Webhook &amp; Security Settings</CardTitle>
            <CardDescription>
              Configure webhook notification destinations and IP access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="flex flex-col gap-4 max-w-xl">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Webhook Notification URL</label>
                <input
                  type="url"
                  value={webhook}
                  onChange={e => setWebhook(e.target.value)}
                  placeholder="https://yourdomain.com/v1/payway-webhook"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50"
                  required
                />
                <span className="text-[11px] text-gray-400">
                  PayWay will send POST requests here when payment transactions succeed or fail.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Signature Algorithm</label>
                <select
                  value={hmacAlgo}
                  onChange={e => setHmacAlgo(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50"
                >
                  <option value="HMAC-SHA512">HMAC-SHA512 (Recommended)</option>
                  <option value="HMAC-SHA256">HMAC-SHA256</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Sandbox Server IP Whitelist</label>
                <input
                  type="text"
                  value={ipWhitelist}
                  onChange={e => setIpWhitelist(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50 font-mono"
                />
                <span className="text-[11px] text-gray-400">Comma-separated IPv4 addresses allowed to send API calls</span>
              </div>

              <button
                type="submit"
                className="w-fit px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95 cursor-pointer mt-2"
                style={{ backgroundColor: '#00B4CC' }}
              >
                Save Developer Settings
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SUB-TAB 3: DEVELOPER RESOURCES & API DOCS */}
      {devTab === 'docs' && (
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5">
            <h2 className="text-base font-bold text-gray-800">Developer Resources</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Access PayWay documentation and implementation resources for the products you're building.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: PayWay Developer Site */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5 flex flex-col justify-between hover:border-gray-200 transition-all">
              <div>
                <div className="w-9 h-9 rounded-lg bg-cyan-50 text-[#00B4CC] flex items-center justify-center mb-3.5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">PayWay Developer Site</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Browse complete API references, integration guides and PayWay developer documentation.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-gray-100">
                <a
                  href={PAYWAY_DEVELOPER_SITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4CC] hover:text-[#009cb2] transition-colors"
                >
                  <span>Open Developer Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: QR API Documentation */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5 flex flex-col justify-between hover:border-gray-200 transition-all">
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">QR API Documentation</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Learn how to generate QR payments, handle payment results and confirm transaction status.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-gray-100">
                <a
                  href={QR_API_DOCUMENTATION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4CC] hover:text-[#009cb2] transition-colors"
                >
                  <span>View QR API documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 3: Sample Code */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5 flex flex-col justify-between hover:border-gray-200 transition-all">
              <div>
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3.5">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Sample Code</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  View implementation examples for the PayWay product you're integrating.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-gray-100">
                {hasActiveQrIntegration ? (
                  <button
                    type="button"
                    onClick={() => setRoute('/integrations/qr-api')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4CC] hover:text-[#009cb2] transition-colors cursor-pointer"
                  >
                    <span>View QR API sample code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRoute('/integrations')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4CC] hover:text-[#009cb2] transition-colors cursor-pointer"
                  >
                    <span>Explore integrations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

