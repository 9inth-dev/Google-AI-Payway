import React, { useState, useEffect, useRef } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import {
  X,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Mic,
  Send,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface CodeSnippet {
  language: string;
  code: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'navi';
  type?: 'text' | 'voice';
  text?: string;
  voiceDuration?: string;
  timestamp: string;
  codeSnippet?: CodeSnippet;
  liked?: boolean | null;
  suggestions?: string[];
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export const AskNaviModal: React.FC = () => {
  const {
    showAskNaviModal,
    setShowAskNaviModal,
    askNaviInitialQuery,
    setRoute,
    addToast,
    state,
    updateState,
  } = useSandbox();

  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUsagePolicy, setShowUsagePolicy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial demo messages matching screenshot exactly
  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-voice-1',
      role: 'user',
      type: 'voice',
      voiceDuration: '0:08',
      timestamp: '12:23 AM',
    },
    {
      id: 'msg-reply-1',
      role: 'navi',
      type: 'text',
      text: 'Here is the official PayWay “Purchase” API example in JavaScript (frontend) and PHP (backend) from the developer docs. Replace the empty values with your real merchant data and generated hash.',
      timestamp: '12:25 AM',
      liked: null,
      codeSnippet: {
        language: 'JAVASCRIPT',
        code: `function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage: Prevent API calls on every keystroke
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce((e) => {
  console.log('Searching for:', e.target.value);
}, 300));`,
      },
    },
  ];

  const [chat, setChat] = useState<ChatMessage[]>(initialMessages);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (showAskNaviModal) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      if (askNaviInitialQuery) {
        handleSendMessage(askNaviInitialQuery);
      }
    }
  }, [showAskNaviModal, askNaviInitialQuery]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAskNaviModal) {
        setShowAskNaviModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAskNaviModal, setShowAskNaviModal]);

  if (!showAskNaviModal) return null;

  // Copy code helper
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    addToast('Copied to Clipboard', 'Code snippet copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Feedback thumb action
  const handleToggleLike = (msgId: string, isLike: boolean) => {
    setChat(prev =>
      prev.map(m => {
        if (m.id === msgId) {
          const nextVal = m.liked === isLike ? null : isLike;
          if (nextVal === true) addToast('Feedback Saved', 'Thank you for your rating!', 'success');
          return { ...m, liked: nextVal };
        }
        return m;
      })
    );
  };

  // Voice toggle simulation
  const handleToggleVoice = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newVoiceMsg: ChatMessage = {
        id: `voice-${Date.now()}`,
        role: 'user',
        type: 'voice',
        voiceDuration: '0:05',
        timestamp,
      };
      setChat(prev => [...prev, newVoiceMsg]);
      setIsTyping(true);

      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          role: 'navi',
          type: 'text',
          text: 'I processed your audio query regarding KHQR payment generation. Here is the verified request body payload and HMAC calculation sample:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          codeSnippet: {
            language: 'JAVASCRIPT',
            code: `// Generate Dynamic KHQR Payload
const payload = {
  req_time: "20260816110724",
  merchant_id: "ec438842",
  tran_id: "ORDER_${Math.floor(10000 + Math.random() * 90000)}",
  amount: "12.50",
  currency: "USD",
  type: "purchase",
  hash: generatePaywayHash(signatureString, apiKey)
};`,
          },
          cta: {
            label: 'Open QR API Workspace →',
            onClick: () => {
              setRoute('/integrations/qr-api');
              setShowAskNaviModal(false);
            },
          },
        };
        setChat(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 700);
    } else {
      setIsRecordingVoice(true);
      addToast('Voice Recording', 'Listening to your audio question... Click Voice again to send', 'info');
    }
  };

  // Response logic
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      type: 'text',
      text: textToSend,
      timestamp,
    };

    setChat(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    const q = textToSend.toLowerCase();

    setTimeout(() => {
      let botResponse: ChatMessage;

      if (q.includes('qr') || q.includes('khqr')) {
        botResponse = {
          id: `navi-${Date.now()}`,
          role: 'navi',
          type: 'text',
          text: 'To generate a dynamic KHQR code with PayWay, send a `POST` request to `/api/v1/purchase/create_qr` on the sandbox server. The response returns an EMVCo-compliant QR string and base64 image.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          codeSnippet: {
            language: 'JAVASCRIPT',
            code: `const response = await fetch("https://sandbox.payway.com.kh/api/v1/purchase/create_qr", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    req_time: "20260816110724",
    merchant_id: "ec438842",
    tran_id: "TRX_99120",
    amount: "25.00",
    currency: "USD",
    hash: calculatedHash
  })
});
const data = await response.json();
console.log("KHQR String:", data.qr_string);`,
          },
          cta: {
            label: 'Open QR API Workspace →',
            onClick: () => {
              setRoute('/integrations/qr-api');
              setShowAskNaviModal(false);
            },
          },
        };
      } else if (q.includes('hash') || q.includes('hmac') || q.includes('signature')) {
        botResponse = {
          id: `navi-${Date.now()}`,
          role: 'navi',
          type: 'text',
          text: 'PayWay uses an HMAC-SHA512 hash signature. If you receive `ERR_400_INVALID_HASH`, check parameter concatenation order. Optional parameters must be concatenated as empty strings.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          codeSnippet: {
            language: 'JAVASCRIPT',
            code: `import crypto from 'crypto';

function generatePaywayHash(fields, secretApiKey) {
  const rawString = [
    fields.req_time,
    fields.merchant_id,
    fields.tran_id,
    fields.amount,
    fields.items || '',
    fields.shipping || '',
    fields.firstname || '',
    fields.lastname || '',
    fields.email || '',
    fields.phone || '',
    fields.type || '',
    fields.payment_option || ''
  ].join('');

  return crypto
    .createHmac('sha512', secretApiKey)
    .update(rawString)
    .digest('base64');
}`,
          },
        };
      } else if (q.includes('provisional') || q.includes('production') || q.includes('live')) {
        botResponse = {
          id: `navi-${Date.now()}`,
          role: 'navi',
          type: 'text',
          text: 'Provisional Production grants immediate live processing capabilities for up to 30 days while your compliance documents are reviewed. Once approved, the provisional limit is removed automatically from your same API key.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cta: {
            label: 'View Production Access Center →',
            onClick: () => {
              setRoute('/production');
              setShowAskNaviModal(false);
            },
          },
        };
      } else {
        botResponse = {
          id: `navi-${Date.now()}`,
          role: 'navi',
          type: 'text',
          text: `Regarding "${textToSend}": In the PayWay Developer Sandbox, you can test KHQR payments, simulate ABA PAY checkouts, inspect webhooks, and verify HMAC SHA-512 signatures.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          codeSnippet: {
            language: 'JAVASCRIPT',
            code: `// Verify incoming webhook status
if (webhookPayload.status === "0") {
  console.log("Transaction successfully paid:", webhookPayload.tran_id);
}`,
          },
        };
      }

      setChat(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 transition-opacity animate-in fade-in duration-200"
      onClick={() => setShowAskNaviModal(false)}
    >
      {/* SIDE DRAWER CONTAINER */}
      <div
        className="w-full sm:w-[440px] md:w-[470px] lg:w-[490px] h-full bg-white flex flex-col border-l border-gray-200 shadow-2xl animate-in slide-in-from-right duration-250 ease-out select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* ================= TOP HEADER ================= */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-0.5">
            <span className="text-xl font-bold text-gray-900 tracking-tight">Navi</span>
            <sup className="text-sm font-bold text-[#8B5CF6] leading-none ml-0.5">⁺</sup>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setChat(initialMessages);
                addToast('Conversation Reset', 'Reset chat to initial example', 'info');
              }}
              title="Reset conversation"
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowAskNaviModal(false)}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= CHAT SCROLLABLE CONTAINER ================= */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-white">
          {chat.map(msg => {
            // User Voice Message (Waveform pill)
            if (msg.role === 'user' && msg.type === 'voice') {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1 self-end max-w-[85%]">
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white shadow-xs cursor-pointer hover:opacity-95 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}
                    onClick={() => addToast('Voice Clip', 'Playing user voice question...', 'info')}
                  >
                    {/* Simulated Voice Waveform Bars */}
                    <div className="flex items-center gap-1 h-3.5">
                      <span className="w-0.5 h-2 bg-white/70 rounded-full" />
                      <span className="w-0.5 h-3.5 bg-white rounded-full" />
                      <span className="w-0.5 h-1.5 bg-white/60 rounded-full" />
                      <span className="w-0.5 h-3 bg-white rounded-full" />
                      <span className="w-0.5 h-2 bg-white/80 rounded-full" />
                      <span className="w-0.5 h-4 bg-white rounded-full" />
                      <span className="w-0.5 h-2.5 bg-white/90 rounded-full" />
                      <span className="w-0.5 h-1 bg-white/50 rounded-full" />
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 pr-1">{msg.timestamp}</span>
                </div>
              );
            }

            // User Text Message
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1 self-end max-w-[85%]">
                  <div
                    className="px-4 py-2.5 rounded-2xl rounded-tr-xs text-white text-xs leading-relaxed shadow-xs"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[11px] text-gray-400 pr-1">{msg.timestamp}</span>
                </div>
              );
            }

            // Navi Response Message Card
            return (
              <div key={msg.id} className="flex flex-col gap-2 self-start w-full max-w-[100%]">
                {/* Gray Background Card */}
                <div className="bg-[#F6F7F9] rounded-2xl p-4 text-xs text-gray-800 leading-relaxed border border-gray-100 shadow-2xs">
                  {/* Message Paragraph Text */}
                  <div className="text-[13px] text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Dark Code Box Container */}
                  {msg.codeSnippet && (
                    <div className="mt-3.5 rounded-xl overflow-hidden bg-[#1E1E1E] text-gray-200 border border-gray-800 shadow-inner">
                      {/* Code Header Bar */}
                      <div className="flex items-center justify-between px-3.5 py-2 bg-[#18181B] border-b border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                          {msg.codeSnippet.language}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(msg.codeSnippet!.code, msg.id)}
                          className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Code Content */}
                      <pre className="p-3.5 text-[11px] font-mono leading-relaxed overflow-x-auto text-[#E2E8F0] select-text">
                        <code>{msg.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Primary CTA if attached */}
                  {msg.cta && (
                    <button
                      type="button"
                      onClick={msg.cta.onClick}
                      className="mt-3.5 w-full px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>{msg.cta.label}</span>
                    </button>
                  )}
                </div>

                {/* Footer under card: Timestamp on left, Thumbs on right */}
                <div className="flex items-center justify-between px-1 text-xs text-gray-400">
                  <span className="text-[11px]">{msg.timestamp}</span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(msg.id, true)}
                      className={`transition-colors cursor-pointer p-0.5 ${
                        msg.liked === true ? 'text-[#8B5CF6]' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleLike(msg.id, false)}
                      className={`transition-colors cursor-pointer p-0.5 ${
                        msg.liked === false ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pending / Typing Bubble */}
          {isTyping && (
            <div className="self-start">
              <div
                className="px-3.5 py-2 rounded-full text-white flex items-center gap-1 shadow-2xs"
                style={{ background: '#8B5CF6' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= BOTTOM INPUT SECTION ================= */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-2">
          {/* Rounded Input Container */}
          <div className="border border-gray-200 rounded-2xl p-3 bg-white shadow-xs focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all flex flex-col gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value.slice(0, 150))}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSendMessage(query);
                }
              }}
              placeholder="Ask Navi anything about PayWay..."
              className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />

            {/* Input Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSendMessage(query)}
                    className="p-1 rounded-md text-[#8B5CF6] hover:bg-purple-50 transition-colors cursor-pointer"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {/* Character Counter */}
                <span className="text-[11px] font-mono text-gray-400">
                  {query.length}/150
                </span>

                {/* Voice Pill Button */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs transition-all cursor-pointer ${
                    isRecordingVoice
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-[#8B5CF6] hover:bg-[#7C3AED]'
                  }`}
                  title={isRecordingVoice ? 'Click to finish speaking' : 'Speak with Navi'}
                >
                  <div className="flex items-center gap-0.5">
                    <span className="w-0.5 h-2 bg-white rounded-full" />
                    <span className="w-0.5 h-3 bg-white rounded-full" />
                    <span className="w-0.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <span>{isRecordingVoice ? 'Listening...' : 'Voice'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <p className="text-center text-[10px] text-gray-500">
            Navi can make mistakes. Check our{' '}
            <button
              type="button"
              onClick={() => setShowUsagePolicy(true)}
              className="text-[#7C3AED] hover:underline font-medium cursor-pointer"
            >
              Navi's Usage Policy.
            </button>
          </p>
        </div>
      </div>

      {/* Usage Policy Modal */}
      {showUsagePolicy && (
        <div
          className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowUsagePolicy(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <span>Navi Usage Policy</span>
                <sup className="text-xs text-[#8B5CF6]">⁺</sup>
              </h3>
              <button
                type="button"
                onClick={() => setShowUsagePolicy(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-600 space-y-2.5 leading-relaxed">
              <p>
                Navi is an AI-powered assistant built for the PayWay Sandbox Developer Portal. All sample codes, hash explanations, and API responses are for development testing.
              </p>
              <p>
                Always verify parameter concatenation order and cryptographic secrets against your official merchant account documentation before deploying to production.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUsagePolicy(false)}
              className="mt-5 w-full py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
