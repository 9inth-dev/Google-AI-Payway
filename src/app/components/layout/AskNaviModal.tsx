import React, { useState, useEffect } from 'react';
import { useSandbox } from '../../context/SandboxContext';

interface QuestionTopic {
  title: string;
  query: string;
  answer: string;
}

export const AskNaviModal: React.FC = () => {
  const {
    showAskNaviModal,
    setShowAskNaviModal,
    askNaviInitialQuery,
    currentRoute,
    state,
    updateState,
    setRoute,
    addToast,
  } = useSandbox();

  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{
    role: 'user' | 'navi';
    text: string;
    options?: { label: string; action: () => void }[];
    cta?: { label: string; onClick: () => void };
  }[]>([
    {
      role: 'navi',
      text: "Hello! I'm Navi, your ABA PayWay Developer Assistant. Ask me anything about KHQR APIs, sandbox testing, or production access!",
    },
  ]);

  // Contextual question prompts depending on current route
  const getContextualTopics = (): QuestionTopic[] => {
    if (currentRoute.includes('/production')) {
      return [
        {
          title: 'What is provisional production?',
          query: 'What does provisional production mean?',
          answer:
            'Provisional production gives you an active production API key immediately upon application submission. You can process live payments for up to 30 days while PayWay Integration Managers review your compliance evidence.',
        },
        {
          title: 'What happens after approval?',
          query: 'What happens after approval?',
          answer:
            'Upon PayWay approval, all provisional restrictions (30-day countdown and transaction caps) are permanently removed from your SAME production API key. No key replacement or reconfiguration is required.',
        },
        {
          title: 'Why are payments paused?',
          query: 'Why are my payments currently paused?',
          answer:
            'Payments stop processing if your 30-day provisional window expires OR if you reach the provisional transaction cap ($5,000 USD / 100 txs) before approval. Once PayWay approves your submission, your key reactivates automatically.',
        },
      ];
    }

    if (currentRoute.includes('/integrations/qr-api')) {
      return [
        {
          title: 'How do I generate a QR?',
          query: 'How do I generate a QR?',
          answer:
            'Send a POST request to `/api/v1/purchase/create_qr` with `req_time`, `merchant_id`, `tran_id`, `amount`, `currency` (USD/KHR), `items`, and `hash`. The response contains `qr_string` and base64 `qr_image`.',
        },
        {
          title: 'Why did this request fail?',
          query: 'Why did this request fail?',
          answer:
            'Most API failures in Sandbox stem from HMAC-SHA512 signature mismatches (ERR_400_INVALID_HASH). Verify that parameter concatenation order matches: req_time + merchant_id + tran_id + amount + items + shipping + firstname + lastname + email + phone + type + payment_option, hashed with your secret key.',
        },
        {
          title: 'How do webhooks work?',
          query: 'How do webhooks work?',
          answer:
            `When a customer completes a payment via ABA Mobile or KHQR, PayWay sends a POST notification to your webhook URL (${state.webhookUrl || 'https://api.yourcompany.com/v1/payway-webhook'}) containing status, tran_id, approval_code, and hash signature.`,
        },
      ];
    }

    // Default Developer Home Context
    return [
      {
        title: 'What product should I use?',
        query: 'What PayWay product should I use?',
        answer: '', // Triggers recommendation flow
      },
      {
        title: 'How do sandbox keys work?',
        query: 'How do sandbox keys work?',
        answer:
          'Sandbox keys (`pk_sandbox_...` and `sk_sandbox_...`) allow you to test API calls against `https://sandbox.payway.com.kh` without processing real money. When ready, apply for Provisional Production Access to receive your live key.',
      },
      {
        title: 'How do I test QR payments?',
        query: 'How do I test QR payments?',
        answer:
          'Navigate to QR API Workspace → Overview, and click Open QR Simulator. You can simulate scanning with ABA Mobile, test successful payments, and verify expired QR handling.',
      },
    ];
  };

  const contextualTopics = getContextualTopics();

  // Handle Initial Query or First-time user greeting
  useEffect(() => {
    if (showAskNaviModal) {
      if (askNaviInitialQuery) {
        handleAsk(askNaviInitialQuery);
      } else if (!state.hasIntegration && currentRoute === '/home') {
        // Welcome recommendation prompt on First Time Home
        setChat([
          {
            role: 'navi',
            text: "Hello! I'm Navi, your PayWay Assistant. Let's find the best payment integration for your business. How do you want customers to pay?",
            options: [
              { label: 'Scan a QR code', action: () => handleRecommendationSelect('qr') },
              { label: 'Pay through an online checkout', action: () => handleRecommendationSelect('checkout') },
              { label: 'I am not sure', action: () => handleRecommendationSelect('unsure') },
            ],
          },
        ]);
      }
    }
  }, [showAskNaviModal, askNaviInitialQuery]);

  if (!showAskNaviModal) return null;

  // Recommendation flow handler
  const handleRecommendationSelect = (choice: 'qr' | 'checkout' | 'unsure') => {
    if (choice === 'qr') {
      setChat(prev => [
        ...prev,
        { role: 'user', text: 'Scan a QR code' },
        {
          role: 'navi',
          text: '💡 **Recommend: QR API**\n\n**Reason:** QR API lets you generate payment QR codes inside your own product so customers can pay using ABA Mobile or supported KHQR apps.',
          cta: {
            label: 'Start QR API integration →',
            onClick: () => {
              updateState({ hasIntegration: true, qrIntegrationStatus: 'in_progress' });
              setRoute('/integrations/qr-api');
              setShowAskNaviModal(false);
              addToast('Workspace Created', 'QR API Workspace initialized', 'success');
            },
          },
        },
      ]);
    } else {
      setChat(prev => [
        ...prev,
        { role: 'user', text: choice === 'checkout' ? 'Pay through an online checkout' : 'I am not sure' },
        {
          role: 'navi',
          text: 'For hosted payment pages, Checkout Page is available. However, for native in-app mobile payments in Cambodia, **QR API** is our recommended integration choice.',
          cta: {
            label: 'Start QR API integration →',
            onClick: () => {
              updateState({ hasIntegration: true, qrIntegrationStatus: 'in_progress' });
              setRoute('/integrations/qr-api');
              setShowAskNaviModal(false);
              addToast('Workspace Created', 'QR API Workspace initialized', 'success');
            },
          },
        },
      ]);
    }
  };

  const handleAsk = (userQuery: string) => {
    if (!userQuery.trim()) return;

    // Check if user is asking "What PayWay product should I use?"
    if (userQuery.toLowerCase().includes('what payway product') || userQuery.toLowerCase().includes('product should i use')) {
      setChat(prev => [
        ...prev,
        { role: 'user', text: userQuery },
        {
          role: 'navi',
          text: "Let's find the best PayWay integration for your business. How do you want customers to pay?",
          options: [
            { label: 'Scan a QR code', action: () => handleRecommendationSelect('qr') },
            { label: 'Pay through an online checkout', action: () => handleRecommendationSelect('checkout') },
            { label: 'I am not sure', action: () => handleRecommendationSelect('unsure') },
          ],
        },
      ]);
      setQuery('');
      return;
    }

    const topic = contextualTopics.find(
      t => t.query.toLowerCase().substring(0, 15) === userQuery.toLowerCase().substring(0, 15)
    );

    const newChat = [...chat, { role: 'user' as const, text: userQuery }];
    setChat(newChat);
    setQuery('');

    setTimeout(() => {
      let reply = topic?.answer
        ? topic.answer
        : `Great question regarding "${userQuery}"! In the PayWay Sandbox, all endpoints operate under sandbox.payway.com.kh. You can verify payloads, inspect logs, or simulate KHQR payments in your workspace.`;

      setChat(prev => [...prev, { role: 'navi', text: reply }]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-fadeIn">
      {/* SIDE PANEL DRAWER */}
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-gray-200 animate-slideLeft"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="px-6 py-4 flex items-center justify-between text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #0D5C73 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              ✦
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Ask Navi</h3>
              <p className="text-xs text-white/80">ABA PayWay AI Developer Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setShowAskNaviModal(false)}
            className="text-white/80 hover:text-white text-2xl font-bold leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-gray-50/50">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 max-w-[90%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {msg.role === 'navi' ? (
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-xs">
                  ✦
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-xs">
                  YOU
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-teal-700 text-white rounded-tr-none font-medium'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none font-medium'
                  }`}
                  style={{ whitespace: 'pre-line' }}
                >
                  {msg.text}
                </div>

                {/* Option Buttons if provided */}
                {msg.options && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={opt.action}
                        className="px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors text-left cursor-pointer shadow-2xs"
                      >
                        👉 {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* CTA Button inside chat bubble */}
                {msg.cta && (
                  <button
                    onClick={msg.cta.onClick}
                    className="mt-1 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    {msg.cta.label}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CONTEXTUAL TOPICS CHIPS */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Suggested for this page:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {contextualTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleAsk(topic.query)}
                className="text-[11px] bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold px-3 py-1.5 rounded-full transition-colors border border-purple-200 cursor-pointer shadow-2xs"
              >
                {topic.title}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT FORM */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAsk(query);
          }}
          className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask Navi about PayWay APIs, KHQR, or webhooks..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-opacity hover:opacity-95 cursor-pointer"
            style={{ backgroundColor: '#7C3AED' }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
