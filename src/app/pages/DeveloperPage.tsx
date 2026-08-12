import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { CredentialCard } from '../components/common/CredentialCard';

export const DeveloperPage: React.FC = () => {
  const { currentRoute, setRoute, state, updateState, addToast } = useSandbox();

  let devTab: 'api-keys' | 'settings' | 'docs' = 'api-keys';
  if (currentRoute.endsWith('/settings')) devTab = 'settings';
  if (currentRoute.endsWith('/docs')) devTab = 'docs';

  // Form state for Developer Settings
  const [webhook, setWebhook] = useState(state.webhookUrl);
  const [ipWhitelist, setIpWhitelist] = useState('203.144.128.1, 103.216.52.12');
  const [hmacAlgo, setHmacAlgo] = useState('HMAC-SHA512');
  const [codeLang, setCodeLang] = useState<'node' | 'python' | 'android' | 'ios' | 'php' | 'curl'>('node');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateState({ webhookUrl: webhook });
    addToast('Developer Settings Saved', 'Webhook URL & API preferences updated', 'success');
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Developer Console"
        description="Manage API credentials, configure webhook callbacks, signature algorithms, and view official PayWay API documentation."
        breadcrumbs={[
          { label: 'Home', onClick: () => setRoute('/home') },
          { label: 'Developer' },
          { label: devTab === 'api-keys' ? 'API Keys' : devTab === 'settings' ? 'Developer Settings' : 'API Documentation' },
        ]}
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
          API Documentation &amp; SDKs
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

      {/* SUB-TAB 3: API DOCS */}
      {devTab === 'docs' && (
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              action={
                <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'node', label: 'Node.js' },
                    { id: 'php', label: 'PHP' },
                    { id: 'python', label: 'Python' },
                    { id: 'web', label: 'Web/WAP' },
                    { id: 'ios', label: 'iOS' },
                    { id: 'android', label: 'Android' },
                    { id: 'node_refund', label: 'Node Refund' },
                    { id: 'php_refund', label: 'PHP Refund' },
                    { id: 'python_refund', label: 'Python Refund' },
                    { id: 'curl', label: 'cURL' },
                  ].map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setCodeLang(lang.id as any)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                        codeLang === lang.id ? 'bg-[#00B4CC] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              }
            >
              <CardTitle>Sample Code & Hashing Examples</CardTitle>
              <CardDescription>Generate dynamic KHQR strings or refunds with prefilled sandbox credentials</CardDescription>
            </CardHeader>

            <CardContent>
              <pre className="p-4 bg-gray-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
                {codeLang === 'curl' &&
`curl -X POST "https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr" \\
  -H "Content-Type: application/json" \\
  -d '{
    "req_time": "20260811154500",
    "merchant_id": "${state.merchantId}",
    "tran_id": "PW_20260811_001",
    "amount": "10.00",
    "currency": "USD",
    "hash": "YOUR_CALCULATED_HMAC_SHA512_HASH"
  }'`}

                {codeLang === 'node' &&
`const crypto = require('crypto');
const axios = require('axios');

const secretKey = "${state.secretKey}";
const merchantId = "${state.merchantId}";
const reqTime = "20260811154500";
const tranId = "PW_" + Date.now();
const amount = "10.00";

// Calculate HMAC-SHA512
const str = reqTime + merchantId + tranId + amount;
const hash = crypto.createHmac('sha512', secretKey).update(str).digest('base64');

axios.post('https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr', {
  req_time: reqTime,
  merchant_id: merchantId,
  tran_id: tranId,
  amount: amount,
  hash: hash
}).then(res => console.log(res.data));`}

                {codeLang === 'php' &&
`<?php
$secretKey = "${state.secretKey}";
$merchantId = "${state.merchantId}";
$reqTime = date("YmdHis");
$tranId = "PW_" . time();
$amount = "10.00";

$rawStr = $reqTime . $merchantId . $tranId . $amount;
$hash = base64_encode(hash_hmac("sha512", $rawStr, $secretKey, true));

$data = [
  "req_time" => $reqTime,
  "merchant_id" => $merchantId,
  "tran_id" => $tranId,
  "amount" => $amount,
  "hash" => $hash
];
// Execute cURL request...
?>`}

                {codeLang === 'python' &&
`import hmac
import hashlib
import base64
import requests

secret_key = "${state.secretKey}".encode('utf-8')
merchant_id = "${state.merchantId}"
req_time = "20260811154500"
tran_id = "PW_99281"
amount = "10.00"

raw_str = f"{req_time}{merchant_id}{tran_id}{amount}".encode('utf-8')
hash_sig = base64.b64encode(hmac.new(secret_key, raw_str, hashlib.sha512).digest()).decode('utf-8')

response = requests.post(
    "https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr",
    json={
        "req_time": req_time,
        "merchant_id": merchant_id,
        "tran_id": tran_id,
        "amount": amount,
        "hash": hash_sig
    }
)`}

                {codeLang === 'web' &&
`<!DOCTYPE html>
<html>
<head>
  <title>PayWay Web/WAP Sample</title>
  <script src="https://checkout-sandbox.payway.com.kh/plugins/checkout2-0.js"></script>
</head>
<body>
  <button id="pay-btn">Pay via ABA PayWay</button>
  <script>
    document.getElementById('pay-btn').onclick = function() {
      AbaPayway.checkout({
        req_time: "20260811154500",
        merchant_id: "${state.merchantId}",
        tran_id: "PW_" + Date.now(),
        amount: "10.00",
        currency: "USD",
        hash: "CALCULATED_HASH"
      });
    };
  </script>
</body>
</html>`}

                {codeLang === 'ios' &&
`import Foundation
import CommonCrypto

func hmacSha512(data: String, key: String) -> String {
    let keyData = Data(key.utf8)
    let messageData = Data(data.utf8)
    var macData = Data(count: Int(CC_SHA512_DIGEST_LENGTH))
    keyData.withUnsafeBytes { kBytes in
        messageData.withUnsafeBytes { mBytes in
            CCHmac(CCHmacAlgorithm(kCCHmacAlgSHA512), kBytes.baseAddress, keyData.count, mBytes.baseAddress, messageData.count, macData.withUnsafeMutableBytes { $0.baseAddress })
        }
    }
    return macData.base64EncodedString()
}

func generateKHQR() {
    let merchantId = "${state.merchantId}"
    let secretKey = "${state.secretKey}"
    let reqTime = "20260811154500"
    let tranId = "PW_\\(Int(Date().timeIntervalSince1970))"
    
    let hash = hmacSha512(data: reqTime + merchantId + tranId + "10.00", key: secretKey)
    let url = URL(string: "https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr")!
    
    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.httpBody = try? JSONSerialization.data(withJSONObject: [
        "req_time": reqTime, "merchant_id": merchantId, "tran_id": tranId,
        "amount": 10.00, "currency": "USD", "hash": hash
    ])
    
    URLSession.shared.dataTask(with: req) { data, _, _ in
        if let data = data, let str = String(data: data, encoding: .utf8) {
            print("Response:", str)
        }
    }.resume()
}`}

                {codeLang === 'android' &&
`import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import android.util.Base64
import okhttp3.*

fun createPayWayQrTransaction() {
    val merchantId = "${state.merchantId}"
    val secretKey = "${state.secretKey}"
    val reqTime = "20260811154500"
    val tranId = "PW_" + System.currentTimeMillis()
    val amount = "10.00"

    val rawStr = reqTime + merchantId + tranId + amount
    val secretKeySpec = SecretKeySpec(secretKey.toByteArray(Charsets.UTF_8), "HmacSHA512")
    val mac = Mac.getInstance("HmacSHA512").apply { init(secretKeySpec) }
    val hash = Base64.encodeToString(mac.doFinal(rawStr.toByteArray(Charsets.UTF_8)), Base64.NO_WRAP)
}`}

                {codeLang === 'node_refund' &&
`const crypto = require('crypto');
const axios = require('axios');

const secretKey = "${state.secretKey}";
const merchantId = "${state.merchantId}";
const reqTime = "20260811154500";
const tranId = "PW_REFUND_001";
const amount = "10.00";

const rawData = reqTime + merchantId + tranId + amount;
const hash = crypto.createHmac('sha512', secretKey).update(rawData).digest('base64');

axios.post('https://checkout-sandbox.payway.com.kh/api/v1/purchase/refund', {
  req_time: reqTime,
  merchant_id: merchantId,
  tran_id: tranId,
  amount: parseFloat(amount),
  remark: "Refund request",
  hash: hash
}).then(res => console.log(res.data));`}

                {codeLang === 'php_refund' &&
`<?php
$secretKey = "${state.secretKey}";
$merchantId = "${state.merchantId}";
$reqTime = date("YmdHis");
$tranId = "PW_REFUND_001";
$amount = "10.00";

$rawStr = $reqTime . $merchantId . $tranId . $amount;
$hash = base64_encode(hash_hmac("sha512", $rawStr, $secretKey, true));

$data = [
  "req_time" => $reqTime,
  "merchant_id" => $merchantId,
  "tran_id" => $tranId,
  "amount" => $amount,
  "hash" => $hash
];
?>`}

                {codeLang === 'python_refund' &&
`import hmac
import hashlib
import base64
import requests

secret_key = "${state.secretKey}".encode('utf-8')
merchant_id = "${state.merchantId}"
req_time = "20260811154500"
tran_id = "PW_REFUND_001"
amount = "10.00"

raw_str = f"{req_time}{merchant_id}{tran_id}{amount}".encode('utf-8')
hash_sig = base64.b64encode(hmac.new(secret_key, raw_str, hashlib.sha512).digest()).decode('utf-8')

response = requests.post(
    "https://checkout-sandbox.payway.com.kh/api/v1/purchase/refund",
    json={
        "req_time": req_time,
        "merchant_id": merchant_id,
        "tran_id": tran_id,
        "amount": amount,
        "hash": hash_sig
    }
)`}
              </pre>
            </CardContent>
          </Card>

          {/* OFFICIAL SDK DOWNLOADS LIST */}
          <Card>
            <CardHeader>
              <CardTitle>SDK Downloads & GitHub Repositories</CardTitle>
              <CardDescription>
                Download official integration sample files or view source repositories on ABA PayWay GitHub.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: 'Node.js', subtitle: 'JAVASCRIPT', githubUrl: 'https://github.com/aba-bank/payway-node-sample', filename: 'aba-payway-node-sample.js' },
                  { title: 'PHP', subtitle: 'PHP', githubUrl: 'https://github.com/aba-bank/payway-php-sample', filename: 'aba-payway-php-sample.php' },
                  { title: 'Python', subtitle: 'PYTHON', githubUrl: 'https://github.com/aba-bank/payway-python-sample', filename: 'aba-payway-python-sample.py' },
                  { title: 'Web / iOS / Android', subtitle: 'Web/WAP · HTML · JavaScript', githubUrl: 'https://github.com/aba-bank/payway-web-sample', filename: 'aba-payway-web-sample.html' },
                  { title: 'iOS', subtitle: 'SWIFT', githubUrl: 'https://github.com/aba-bank/payway-ios-sdk', filename: 'aba-payway-ios-sample.swift' },
                  { title: 'Android', subtitle: 'KOTLIN', githubUrl: 'https://github.com/aba-bank/payway-android-sdk', filename: 'aba-payway-android-sample.kt' },
                  { title: 'Node.js Refund', subtitle: 'Refund · JAVASCRIPT', githubUrl: 'https://github.com/aba-bank/payway-refund-node-sample', filename: 'aba-payway-refund-node.js' },
                  { title: 'PHP Refund', subtitle: 'Refund · PHP', githubUrl: 'https://github.com/aba-bank/payway-refund-php-sample', filename: 'aba-payway-refund-php.php' },
                  { title: 'Python Refund', subtitle: 'Refund · PYTHON', githubUrl: 'https://github.com/aba-bank/payway-refund-python-sample', filename: 'aba-payway-refund-python.py' },
                ].map((sdk, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-gray-900">{sdk.title}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-cyan-50 text-[#00B4CC] border border-cyan-100 rounded">
                          {sdk.subtitle}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200/60">
                      <a
                        href={sdk.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                      >
                        GitHub
                      </a>
                      <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(`// ABA PayWay ${sdk.title} Sample Code`)}`}
                        download={sdk.filename}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:opacity-95 transition-opacity rounded-lg cursor-pointer"
                        style={{ backgroundColor: '#00B4CC' }}
                      >
                        ↓ Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
