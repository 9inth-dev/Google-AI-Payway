import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { CredentialCard } from '../components/common/CredentialCard';
import { getVerifiedRequirementsCount } from '../utils/readiness';
import { RequirementCard } from '../components/qr/RequirementCard';
import { QrSimulatorModal } from '../components/qr/QrSimulatorModal';
import { ApplyForProductionModal } from '../components/qr/ApplyForProductionModal';
import { ProvisionalProductionDashboard } from '../components/qr/ProvisionalProductionDashboard';
import { AttentionCard } from '../components/qr/AttentionCard';

export const QrApiPage: React.FC = () => {
  const {
    state,
    updateState,
    currentRoute,
    setRoute,
    setShowCreateTxModal,
    addTransaction,
    transactions,
    addToast,
    uploadEvidence,
    removeEvidence,
  } = useSandbox();

  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorMode, setSimulatorMode] = useState<'sample_payment' | 'test_expired'>('sample_payment');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCodeLang, setSelectedCodeLang] = useState<
    'node' | 'php' | 'python' | 'web' | 'ios' | 'android' | 'node_refund' | 'php_refund' | 'python_refund' | 'curl'
  >('node');

  // Determine active sub-tab from current route or fallback
  let activeTab: 'overview' | 'testing' | 'activity' | 'production' = 'overview';
  if (currentRoute.endsWith('/testing')) activeTab = 'testing';
  if (currentRoute.endsWith('/activity')) activeTab = 'activity';
  if (currentRoute.endsWith('/production') || currentRoute.endsWith('/production-access')) activeTab = 'production';

  const getSampleCode = (
    lang: 'node' | 'php' | 'python' | 'web' | 'ios' | 'android' | 'node_refund' | 'php_refund' | 'python_refund' | 'curl'
  ) => {
    const reqTime = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
    const merchantId = state.merchantId || 'ec432921';
    const secretKey = state.secretKey || 'YOUR_SECRET_KEY';

    switch (lang) {
      case 'curl':
        return `curl -X POST https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr \\
  -H "Content-Type: application/json" \\
  -d '{
    "req_time": "${reqTime}",
    "merchant_id": "${merchantId}",
    "tran_id": "PW_${Date.now()}",
    "amount": 15.50,
    "currency": "USD",
    "hash": "e89f812a1b2c3d4e5f67890123456789abcdef1234567890abcdef1234567890"
  }'`;

      case 'node':
        return `const crypto = require('crypto');
const axios = require('axios');

const merchantId = "${merchantId}";
const secretKey = "${secretKey}";
const reqTime = "${reqTime}";
const tranId = "PW_" + Date.now();
const amount = "15.50";

// Compute HMAC-SHA512 Hash
const rawData = reqTime + merchantId + tranId + amount;
const hash = crypto.createHmac('sha512', secretKey).update(rawData).digest('base64');

axios.post('https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr', {
  req_time: reqTime,
  merchant_id: merchantId,
  tran_id: tranId,
  amount: parseFloat(amount),
  currency: "USD",
  hash: hash
}).then(res => console.log('KHQR Result:', res.data));`;

      case 'php':
        return `<?php
$merchantId = "${merchantId}";
$secretKey = "${secretKey}";
$reqTime = "${reqTime}";
$tranId = "PW_" . time();
$amount = "15.50";

$rawStr = $reqTime . $merchantId . $tranId . $amount;
$hash = base64_encode(hash_hmac("sha512", $rawStr, $secretKey, true));

$ch = curl_init("https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  "req_time" => $reqTime,
  "merchant_id" => $merchantId,
  "tran_id" => $tranId,
  "amount" => 15.50,
  "currency" => "USD",
  "hash" => $hash
]));

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;

      case 'python':
        return `import hmac
import hashlib
import base64
import requests

merchant_id = "${merchantId}"
secret_key = "${secretKey}".encode('utf-8')
req_time = "${reqTime}"
tran_id = "PW_109283"
amount = "15.50"

# Compute HMAC-SHA512 Signature
raw_data = f"{req_time}{merchant_id}{tran_id}{amount}".encode('utf-8')
hash_sig = base64.b64encode(hmac.new(secret_key, raw_data, hashlib.sha512).digest()).decode('utf-8')

response = requests.post(
    "https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr",
    json={
        "req_time": req_time,
        "merchant_id": merchant_id,
        "tran_id": tran_id,
        "amount": 15.50,
        "currency": "USD",
        "hash": hash_sig
    }
)
print("KHQR Response:", response.json())`;

      case 'web':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ABA PayWay KHQR Web Integration</title>
  <script src="https://checkout-sandbox.payway.com.kh/plugins/checkout2-0.js"></script>
</head>
<body>
  <h2>ABA PayWay Web Checkout</h2>
  <button id="pay-button" style="padding:10px 20px; background:#00B4CC; color:#fff; border:none; border-radius:5px;">
    Pay with KHQR ($15.50)
  </button>

  <script>
    document.getElementById('pay-button').addEventListener('click', function() {
      AbaPayway.checkout({
        req_time: "${reqTime}",
        merchant_id: "${merchantId}",
        tran_id: "PW_" + Date.now(),
        amount: "15.50",
        currency: "USD",
        hash: "e89f812a1b2c3d4e5f67890123456789abcdef1234567890abcdef1234567890"
      });
    });
  </script>
</body>
</html>`;

      case 'ios':
        return `import Foundation
import CommonCrypto

// Swift PayWay KHQR Request
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
    let merchantId = "${merchantId}"
    let secretKey = "${secretKey}"
    let reqTime = "${reqTime}"
    let tranId = "PW_\\(Int(Date().timeIntervalSince1970))"
    let amount = "15.50"

    let hash = hmacSha512(data: reqTime + merchantId + tranId + amount, key: secretKey)
    let url = URL(string: "https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr")!

    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.httpBody = try? JSONSerialization.data(withJSONObject: [
        "req_time": reqTime, "merchant_id": merchantId, "tran_id": tranId,
        "amount": 15.50, "currency": "USD", "hash": hash
    ])

    URLSession.shared.dataTask(with: req) { data, _, _ in
        if let data = data, let str = String(data: data, encoding: .utf8) {
            print("Response:", str)
        }
    }.resume()
}`;

      case 'android':
        return `import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import android.util.Base64
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

// PayWay KHQR Android Request
fun createPayWayQrTransaction() {
    val merchantId = "${merchantId}"
    val secretKey = "${secretKey}"
    val reqTime = "${reqTime}"
    val tranId = "PW_" + System.currentTimeMillis()
    val amount = "15.50"

    // Calculate HMAC-SHA512
    val rawStr = reqTime + merchantId + tranId + amount
    val secretKeySpec = SecretKeySpec(secretKey.toByteArray(Charsets.UTF_8), "HmacSHA512")
    val mac = Mac.getInstance("HmacSHA512").apply { init(secretKeySpec) }
    val hash = Base64.encodeToString(mac.doFinal(rawStr.toByteArray(Charsets.UTF_8)), Base64.NO_WRAP)

    val client = OkHttpClient()
    val jsonBody = """
        {
          "req_time": "$reqTime",
          "merchant_id": "$merchantId",
          "tran_id": "$tranId",
          "amount": 15.50,
          "currency": "USD",
          "hash": "$hash"
        }
    """.trimIndent()

    val request = Request.Builder()
        .url("https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr")
        .post(jsonBody.toRequestBody("application/json".toMediaType()))
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: java.io.IOException) { e.printStackTrace() }
        override fun onResponse(call: Call, response: Response) {
            println("KHQR Result: " + response.body?.string())
        }
    })
}`;

      case 'node_refund':
        return `const crypto = require('crypto');
const axios = require('axios');

const merchantId = "${merchantId}";
const secretKey = "${secretKey}";
const reqTime = "${reqTime}";
const tranId = "PW_REFUND_" + Date.now();
const amount = "15.50";

// Compute HMAC-SHA512 for Refund API
const rawData = reqTime + merchantId + tranId + amount;
const hash = crypto.createHmac('sha512', secretKey).update(rawData).digest('base64');

axios.post('https://checkout-sandbox.payway.com.kh/api/v1/purchase/refund', {
  req_time: reqTime,
  merchant_id: merchantId,
  tran_id: tranId,
  amount: parseFloat(amount),
  remark: "User requested transaction refund",
  hash: hash
}).then(res => console.log('Refund Response:', res.data));`;

      case 'php_refund':
        return `<?php
$merchantId = "${merchantId}";
$secretKey = "${secretKey}";
$reqTime = "${reqTime}";
$tranId = "PW_REFUND_" . time();
$amount = "15.50";

$rawStr = $reqTime . $merchantId . $tranId . $amount;
$hash = base64_encode(hash_hmac("sha512", $rawStr, $secretKey, true));

$ch = curl_init("https://checkout-sandbox.payway.com.kh/api/v1/purchase/refund");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  "req_time" => $reqTime,
  "merchant_id" => $merchantId,
  "tran_id" => $tranId,
  "amount" => 15.50,
  "remark" => "User requested transaction refund",
  "hash" => $hash
]));

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;

      case 'python_refund':
        return `import hmac
import hashlib
import base64
import requests

merchant_id = "${merchantId}"
secret_key = "${secretKey}".encode('utf-8')
req_time = "${reqTime}"
tran_id = "PW_REFUND_9982"
amount = "15.50"

raw_data = f"{req_time}{merchant_id}{tran_id}{amount}".encode('utf-8')
hash_sig = base64.b64encode(hmac.new(secret_key, raw_data, hashlib.sha512).digest()).decode('utf-8')

response = requests.post(
    "https://checkout-sandbox.payway.com.kh/api/v1/purchase/refund",
    json={
        "req_time": req_time,
        "merchant_id": merchant_id,
        "tran_id": tran_id,
        "amount": 15.50,
        "remark": "User requested transaction refund",
        "hash": hash_sig
    }
)
print("Refund Response:", response.json())`;

      default:
        return '';
    }
  };

  const handleDownloadSample = (filename: string, langId: any) => {
    const code = getSampleCode(langId);
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Download Started', `Downloaded sample file: ${filename}`, 'success');
  };

  // GitHub source + filename for each sample language, matching the
  // "Official SDKs & Sample Code Repositories" cards below so the buttons
  // above the code block point to the exact same resources.
  const CODE_SAMPLE_META: Record<string, { githubUrl: string; filename: string }> = {
    node: { githubUrl: 'https://github.com/aba-bank/payway-node-sample', filename: 'aba-payway-node-sample.js' },
    php: { githubUrl: 'https://github.com/aba-bank/payway-php-sample', filename: 'aba-payway-php-sample.php' },
    python: { githubUrl: 'https://github.com/aba-bank/payway-python-sample', filename: 'aba-payway-python-sample.py' },
    web: { githubUrl: 'https://github.com/aba-bank/payway-web-sample', filename: 'aba-payway-web-sample.html' },
    ios: { githubUrl: 'https://github.com/aba-bank/payway-ios-sdk', filename: 'aba-payway-ios-sample.swift' },
    android: { githubUrl: 'https://github.com/aba-bank/payway-android-sdk', filename: 'aba-payway-android-sample.kt' },
    node_refund: { githubUrl: 'https://github.com/aba-bank/payway-refund-node-sample', filename: 'aba-payway-refund-node.js' },
    php_refund: { githubUrl: 'https://github.com/aba-bank/payway-refund-php-sample', filename: 'aba-payway-refund-php.php' },
    python_refund: { githubUrl: 'https://github.com/aba-bank/payway-refund-python-sample', filename: 'aba-payway-refund-python.py' },
    curl: { githubUrl: 'https://github.com/aba-bank/payway-api-samples', filename: 'aba-payway-curl-sample.sh' },
  };

  const sampleRequestCode = getSampleCode(selectedCodeLang);
  const activeSampleMeta = CODE_SAMPLE_META[selectedCodeLang];

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sampleRequestCode);
    }
    setCopiedCode(true);
    addToast('Code Copied', `Sample request for ${selectedCodeLang.toUpperCase()} copied to clipboard`, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const verifiedCount = getVerifiedRequirementsCount(state);
  const ts = state.testingState || {
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

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto">
      {/* PAGE HEADER */}
      <PageHeader
        title="QR API"
        description="Generate payment QR codes that customers can scan using ABA Mobile or supported KHQR apps."
        breadcrumbs={[
          { label: 'Integrations', onClick: () => setRoute('/integrations') },
          { label: 'QR API' },
        ]}
        badge={
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-[#00B4CC] border border-cyan-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4CC]" />
              Sandbox
            </span>
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
              {verifiedCount} of 5 requirements verified
            </span>
          </div>
        }
      />

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-semibold text-gray-500">
        <button
          onClick={() => setRoute('/integrations/qr-api')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'overview' ? 'text-[#00B4CC] font-bold' : 'hover:text-gray-800'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4CC] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setRoute('/integrations/qr-api/testing')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'testing' ? 'text-[#00B4CC] font-bold' : 'hover:text-gray-800'
          }`}
        >
          Testing
          {activeTab === 'testing' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4CC] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setRoute('/integrations/qr-api/activity')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'activity' ? 'text-[#00B4CC] font-bold' : 'hover:text-gray-800'
          }`}
        >
          API Activity ({transactions.length})
          {activeTab === 'activity' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4CC] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setRoute('/integrations/qr-api/production')}
          className={`pb-3 transition-colors relative cursor-pointer ${
            activeTab === 'production' ? 'text-[#00B4CC] font-bold' : 'hover:text-gray-800'
          }`}
        >
          Production Access
          {activeTab === 'production' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4CC] rounded-full" />
          )}
        </button>
      </div>

      {/* ATTENTION CARD (When PayWay requests changes) */}
      <AttentionCard className="mb-2" />

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* SECTION: PRODUCTION READINESS */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Production Readiness
            </div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 font-bold text-xs">
                  {verifiedCount}/5
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">
                    {verifiedCount} of 5 requirements verified
                  </div>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                    Build and test normally. PayWay will automatically verify supported requirements from your sandbox activity.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRoute('/integrations/qr-api/testing')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors shrink-0 cursor-pointer self-start sm:self-center"
              >
                View testing →
              </button>
            </div>
          </div>

          {/* SECTION: SANDBOX CREDENTIALS */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Sandbox Credentials
            </div>
            <CredentialCard
              title="API Keys for QR Integration"
              description="Pass these credentials when making server-to-server requests to generate KHQR strings."
              showMerchantId={true}
            />
          </div>

          {/* SECTION: START BUILDING */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Start Building
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Generate KHQR Payments</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-3xl">
                  Call the PayWay QR endpoint to generate standardized NBC KHQR dynamic QR codes. Once generated, display the QR string or image to the customer to scan with ABA Mobile or any KHQR compatible banking app.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={() => setRoute('/developer/docs')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  View API documentation
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('sample-code-block');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  View sample code
                </button>
                <button
                  onClick={() => setShowCreateTxModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 text-[#00B4CC] border border-cyan-200 hover:bg-cyan-100 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Open Simulator
                </button>
              </div>

              {/* Sample Request Code Block with Language Selector */}
              <div id="sample-code-block" className="mt-2 bg-gray-900 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto relative">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-gray-800 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1 bg-gray-800/80 p-1 rounded-lg">
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
                        onClick={() => setSelectedCodeLang(lang.id as any)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                          selectedCodeLang === lang.id
                            ? 'bg-[#00B4CC] text-white shadow-xs'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 hidden md:inline mr-1">
                      {selectedCodeLang.includes('refund') ? 'POST /api/v1/purchase/refund' : 'POST /api/v1/purchase/create_qr'}
                    </span>
                    <a
                      href={activeSampleMeta.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer text-[10px] font-semibold border border-gray-700"
                    >
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      GitHub
                    </a>
                    <button
                      onClick={() => handleDownloadSample(activeSampleMeta.filename, selectedCodeLang)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer text-[10px] font-semibold border border-gray-700"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer text-[10px] font-semibold border border-gray-700"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
                <pre className="text-[11px] leading-relaxed text-gray-200">{sampleRequestCode}</pre>
              </div>


            </div>
          </div>

          {/* SECTION: RECENT ACTIVITY */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Recent Activity
              </div>
              {transactions.length > 0 && (
                <button
                  onClick={() => setRoute('/integrations/qr-api/activity')}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#00B4CC' }}
                >
                  View all logs →
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase">
                        <th className="py-2.5 px-6">Transaction ID</th>
                        <th className="py-2.5 px-4">Method</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-6">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.slice(0, 5).map(tx => (
                        <tr key={tx.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-6 font-mono font-medium text-gray-800">
                            {tx.tranId}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px]">
                              {tx.paymentType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-800">
                            {tx.currency} {tx.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={tx.status} size="sm" />
                          </td>
                          <td className="py-3 px-6 text-gray-400 text-[11px]">
                            {tx.createdAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-2 text-[#00B4CC]">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-gray-700">No activity yet</h3>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                    QR payment requests and webhook callbacks will automatically populate here as you run test charges.
                  </p>
                  <button
                    onClick={() => setShowCreateTxModal(true)}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-opacity hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: '#00B4CC' }}
                  >
                    Run Test Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TESTING */}
      {activeTab === 'testing' && (
        <div className="flex flex-col gap-6">
          {/* TOP BANNER & ACTION BAR */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                Testing
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-[#00B4CC] border border-cyan-200">
                  {verifiedCount} of 5 requirements verified
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                Test your integration normally. PayWay automatically verifies supported requirements from your sandbox activity.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <button
                onClick={() => {
                  setSimulatorMode('sample_payment');
                  setShowSimulator(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg text-white shadow-2xs hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: '#00B4CC' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run sample QR payment
              </button>

              <button
                onClick={() => {
                  setSimulatorMode('test_expired');
                  setShowSimulator(true);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Test expired QR
              </button>
            </div>
          </div>

          {/* REQUIREMENTS CARDS LIST */}
          <div className="flex flex-col gap-4">
            <RequirementCard
              number={1}
              title="1. QR generated successfully"
              explanation="Technical requirement. Automatically verified when a successful QR generation API request appears in sandbox."
              status={ts.qrGenerated.status}
              autoVerified={true}
              lastEventTime={ts.qrGenerated.lastEventTime}
              lastDetails={ts.qrGenerated.lastDetails}
            />

            <RequirementCard
              number={2}
              title="2. Payment completed successfully"
              explanation="Technical requirement. Automatically verified when a simulated or real sandbox KHQR payment is completed."
              status={ts.paymentCompleted.status}
              autoVerified={true}
              lastEventTime={ts.paymentCompleted.lastEventTime}
              lastTxId={ts.paymentCompleted.lastTxId}
              lastDetails={ts.paymentCompleted.lastDetails}
            />

            <RequirementCard
              number={3}
              title="3. Webhook received"
              explanation="Technical requirement. Automatically verified when your configured listener endpoint receives and acknowledges the payment result webhook."
              status={ts.webhookReceived.status}
              autoVerified={true}
              lastEventTime={ts.webhookReceived.lastEventTime}
              lastDetails={ts.webhookReceived.lastDetails}
            />

            <RequirementCard
              number={4}
              title="4. Final transaction status confirmed"
              explanation="Technical requirement. Automatically verified when your system calls check_transaction API and receives the final SUCCESS status."
              status={ts.statusConfirmed.status}
              autoVerified={true}
              lastEventTime={ts.statusConfirmed.lastEventTime}
              lastDetails={ts.statusConfirmed.lastDetails}
            />

            <RequirementCard
              number={5}
              title="5. Customer payment states verified"
              explanation="Demonstrate both successful payment and expired QR states alongside UI evidence screenshots."
              status={ts.customerPaymentStates.status}
              autoVerified={false}
              isCustomerStatesRequirement={true}
              successStateDetected={ts.customerPaymentStates.successStateDetected}
              expiredStateDetected={ts.customerPaymentStates.expiredStateDetected}
              successEvidence={ts.customerPaymentStates.successEvidence}
              expiredEvidence={ts.customerPaymentStates.expiredEvidence}
              onUploadEvidence={uploadEvidence}
              onRemoveEvidence={removeEvidence}
            />
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY LOGS */}
      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>KHQR API Activity Logs</CardTitle>
            <CardDescription>
              Inspected request logs and instant webhook callback history for KHQR payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase">
                      <th className="py-2.5 px-4">Tran ID</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Payer</th>
                      <th className="py-2.5 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-mono font-medium text-gray-800">{tx.tranId}</td>
                        <td className="py-3 px-4 font-semibold text-gray-700">
                          {tx.currency} {tx.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={tx.status} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold">
                            {tx.paymentType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{tx.payerName || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-400 text-[11px]">{tx.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs">No activity logged yet.</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PRODUCTION ACCESS */}
      {activeTab === 'production' && (
        <div className="flex flex-col gap-6 max-w-4xl">
          {state.productionAccessStatus !== 'sandbox' ? (
            <ProvisionalProductionDashboard onOpenResubmitModal={() => setShowApplyModal(true)} />
          ) : verifiedCount < 5 ? (
            /* STATE 1: NOT READY */
            <Card>
              <CardHeader className="border-b border-gray-100 pb-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                        Action Required
                      </span>
                    </div>
                    <CardTitle className="text-xl">Production access</CardTitle>
                    <CardDescription className="text-xs text-gray-600 mt-1">
                      Complete the required sandbox checks before accepting live payments.
                    </CardDescription>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                      {verifiedCount} of 5 requirements verified
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {5 - verifiedCount} remaining to unlock Production keys
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-[#00B4CC] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(verifiedCount / 5) * 100}%` }}
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6 flex flex-col gap-6">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Readiness Summary
                </div>

                {/* GROUP 1: INTEGRATION BEHAVIOUR */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Integration behaviour
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {
                        [
                          ts.qrGenerated?.status === 'verified',
                          ts.paymentCompleted?.status === 'verified',
                          ts.webhookReceived?.status === 'verified',
                          ts.statusConfirmed?.status === 'verified',
                        ].filter(Boolean).length
                      } / 4 verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. QR generated successfully */}
                    {ts.qrGenerated?.status === 'verified' ? (
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">✓</span>
                          <span className="text-gray-600">QR generated successfully</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-amber-500 text-amber-600 flex items-center justify-center font-bold text-[9px]">!</span>
                          <span className="font-bold text-gray-900">QR generated successfully</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Incomplete</span>
                      </div>
                    )}

                    {/* 2. Payment completed */}
                    {ts.paymentCompleted?.status === 'verified' ? (
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">✓</span>
                          <span className="text-gray-600">Payment completed</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-amber-500 text-amber-600 flex items-center justify-center font-bold text-[9px]">!</span>
                          <span className="font-bold text-gray-900">Payment completed</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Incomplete</span>
                      </div>
                    )}

                    {/* 3. Webhook received */}
                    {ts.webhookReceived?.status === 'verified' ? (
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">✓</span>
                          <span className="text-gray-600">Webhook received</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-amber-500 text-amber-600 flex items-center justify-center font-bold text-[9px]">!</span>
                          <span className="font-bold text-gray-900">Webhook received</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Incomplete</span>
                      </div>
                    )}

                    {/* 4. Final status confirmed */}
                    {ts.statusConfirmed?.status === 'verified' ? (
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">✓</span>
                          <span className="text-gray-600">Final status confirmed</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-amber-500 text-amber-600 flex items-center justify-center font-bold text-[9px]">!</span>
                          <span className="font-bold text-gray-900">Final status confirmed</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Incomplete</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* GROUP 2: CUSTOMER EXPERIENCE */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Customer experience
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {ts.customerPaymentStates?.status === 'verified' ? 1 : 0} / 1 verified
                    </span>
                  </div>

                  <div>
                    {ts.customerPaymentStates?.status === 'verified' ? (
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">✓</span>
                          <span className="text-gray-600">Success and expired states verified</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-lg border border-amber-200 text-xs shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-amber-500 text-amber-600 flex items-center justify-center font-bold text-[9px]">!</span>
                          <div>
                            <span className="font-bold text-gray-900 block">Success and expired states verified</span>
                            <span className="text-[11px] text-gray-500">
                              Verify both successful payment state &amp; expired QR behavior with UI evidence.
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full shrink-0">Incomplete</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTEXTUAL CTA */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-gray-500">
                    Need help testing? Run our step-by-step simulator in the Testing workspace.
                  </div>
                  <button
                    onClick={() => setRoute('/integrations/qr-api/testing')}
                    className="px-5 py-2.5 text-xs font-bold text-white rounded-lg shadow-xs transition-opacity hover:opacity-95 cursor-pointer flex items-center gap-2"
                    style={{ backgroundColor: '#00B4CC' }}
                  >
                    <span>Complete remaining {5 - verifiedCount === 1 ? 'requirement' : 'requirements'}</span>
                    <span>→</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* STATE 2: READY */
            <Card className="border-emerald-200/80 shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider flex items-center gap-1">
                    <span>✓</span> Ready For Live Deployment
                  </span>
                </div>
                <CardTitle className="text-xl font-bold">
                  Your QR API integration is ready for production
                </CardTitle>
                <CardDescription className="text-xs text-cyan-50 mt-1.5 leading-relaxed max-w-2xl">
                  Your required sandbox checks are complete. You can now connect a business and request production access.
                </CardDescription>

                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
                  <span>5 of 5 requirements verified</span>
                  <span className="bg-white text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    Sandbox Readiness: 100%
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-6 flex flex-col gap-6">
                {/* VERIFIED SUMMARY PROOF */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Verified Checklist Summary
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                      <span className="font-bold text-gray-800 block mb-2">Integration behaviour</span>
                      <ul className="flex flex-col gap-1.5 text-[11px] text-emerald-800 font-medium">
                        <li className="flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span> QR generated successfully
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span> Payment completed
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span> Webhook received
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span> Final status confirmed
                        </li>
                      </ul>
                    </div>

                    <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                      <span className="font-bold text-gray-800 block mb-2">Customer experience</span>
                      <ul className="flex flex-col gap-1.5 text-[11px] text-emerald-800 font-medium">
                        <li className="flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span> Success and expired states verified
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* PRIMARY & SECONDARY ACTION */}
                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-sm hover:opacity-95 transition-opacity cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center gap-2"
                  >
                    <span>Apply for production access</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setRoute('/integrations/qr-api/testing')}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Review testing results
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <QrSimulatorModal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        initialMode={simulatorMode}
      />

      <ApplyForProductionModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </div>
  );
};
