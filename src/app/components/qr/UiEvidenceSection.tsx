import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';

export const FIGMA_UI_GUIDELINE_URL = 'https://www.figma.com/file/payway-qr-ui-guideline-placeholder';

interface UiEvidenceSectionProps {
  stepNumber?: number;
  className?: string;
}

export const UiEvidenceSection: React.FC<UiEvidenceSectionProps> = ({ stepNumber, className = '' }) => {
  const { state, attachRecording, removeRecording, attachScreenshot, removeScreenshot, addToast } = useSandbox();
  const [showScreenshotPreview, setShowScreenshotPreview] = useState(false);

  const uiEv = state.uiEvidence || { recordingAttached: false, screenshotAttached: false };

  const attachedCount = (uiEv.recordingAttached ? 1 : 0) + (uiEv.screenshotAttached ? 1 : 0);

  const handleCopyFigmaLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(FIGMA_UI_GUIDELINE_URL);
      addToast('Guideline link copied', 'PayWay Figma UI guideline link copied to clipboard', 'info');
    }
  };

  return (
    <div id="ui-evidence-section" className={className}>
      {/* MAIN CONTAINER CARD */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
        {/* SECTION HEADER */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {stepNumber ? (
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#00B4CC] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {stepNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">Step {stepNumber}: Upload Checkout UI Evidence</h3>
              </div>
            ) : (
              <h3 className="text-base font-bold text-slate-900">UI Evidence</h3>
            )}
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Show that your checkout follows the PayWay QR payment flow. Attach a short screen recording and a screenshot of your live QR payment UI.
            </p>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider ${
            attachedCount === 2 
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-700' 
              : 'bg-amber-50/80 border border-amber-300/80 text-amber-600'
          }`}>
            {attachedCount === 2 ? '✓ VERIFIED' : 'REQUIRED FOR PRODUCTION'}
          </span>
        </div>

        {/* FOLLOW THE PAYWAY QR UI GUIDELINE CARD (Only shown when documents are still needed) */}
        {attachedCount < 2 && (
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Follow the PayWay QR UI guideline</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Review the official layout, spacing, and branding requirements before recording or capturing your UI.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={FIGMA_UI_GUIDELINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#00B4CC] text-white hover:bg-[#009cb2] transition-colors shadow-2xs"
              >
                View UI guideline
              </a>
              <button
                type="button"
                onClick={handleCopyFigmaLink}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                Copy guideline link
              </button>
            </div>
          </div>
        )}

        {/* PROGRESS BAR & COUNTER DIVIDER */}
        <div className="relative mb-6">
          {attachedCount === 2 ? (
            <div className="flex flex-col gap-2">
              <div className="w-full h-1 bg-emerald-500 rounded-full" />
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <span className="text-xs font-bold text-slate-700">2 of 2 evidence items attached</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                  UI EVIDENCE COMPLETE
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
              <span className="text-xs font-bold text-slate-700 ml-auto">
                {attachedCount} of 2 evidence items attached
              </span>
            </div>
          )}
        </div>

        {/* TWO CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CARD 1: Payment flow screen recording */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">Payment flow screen recording</h5>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider shrink-0 ${
                  uiEv.recordingAttached
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                    : 'bg-amber-50/80 border border-amber-300/80 text-amber-600'
                }`}>
                  {uiEv.recordingAttached ? '✓ VERIFIED' : 'REQUIRED'}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Record the full customer journey: QR renders &gt; Customer scans &gt; Payment result appears.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Around 30 seconds. MP4 or MOV. Maximum 50MB.
              </p>
            </div>

            {/* Bottom action / attachment area */}
            {uiEv.recordingAttached ? (
              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-500 shrink-0">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {uiEv.recordingFileName ? uiEv.recordingFileName.replace('.mp4', '') : 'qr-payment-flo'}...
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        MP4
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {uiEv.recordingFileSize || '4.8 MB'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={attachRecording}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeRecording}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={attachRecording}
                className="w-full border border-dashed border-slate-300/90 bg-white hover:bg-slate-50/80 rounded-lg py-2.5 px-4 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors mt-4"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload recording</span>
              </button>
            )}
          </div>

          {/* CARD 2: QR payment UI screenshot */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">QR payment UI screenshot</h5>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider shrink-0 ${
                  uiEv.screenshotAttached
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                    : 'bg-amber-50/80 border border-amber-300/80 text-amber-600'
                }`}>
                  {uiEv.screenshotAttached ? '✓ VERIFIED' : 'REQUIRED'}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Capture your live QR payment screen, following the layout in the PayWay UI guideline above.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                PNG or JPG. Maximum 10MB.
              </p>
            </div>

            {/* Bottom action / attachment area */}
            {uiEv.screenshotAttached ? (
              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-cyan-400 shrink-0">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {uiEv.screenshotFileName ? uiEv.screenshotFileName.replace('.png', '') : 'qr-payment-scr'}...
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {uiEv.screenshotFileSize || '312 KB'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowScreenshotPreview(true)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Preview
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={attachScreenshot}
                className="w-full border border-dashed border-slate-300/90 bg-white hover:bg-slate-50/80 rounded-lg py-2.5 px-4 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors mt-4"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload screenshot</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SCREENSHOT PREVIEW MODAL */}
      {showScreenshotPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold">QR Payment UI Screenshot Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScreenshotPreview(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-slate-900 flex flex-col items-center justify-center min-h-[320px]">
              <div className="w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-slate-800">
                {/* Header */}
                <div className="bg-red-600 text-white p-3 text-center font-bold text-xs">
                  ABA PAYWAY KHQR
                </div>
                {/* Content */}
                <div className="p-4 flex flex-col items-center text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Merchant Name</span>
                  <span className="text-xs font-bold text-slate-900 mb-2">My Test Store Ltd.</span>

                  <div className="text-sm font-extrabold text-cyan-700 mb-3">$10.00 USD</div>

                  {/* KHQR Box */}
                  <div className="w-36 h-36 border-2 border-red-600 rounded-lg p-2 flex flex-col items-center justify-center bg-white shadow-inner mb-3 relative">
                    <div className="w-full h-full border border-slate-800 p-1 flex flex-wrap gap-1 items-center justify-center bg-slate-50">
                      <div className="w-6 h-6 bg-slate-900" />
                      <div className="w-6 h-6 bg-slate-900" />
                      <div className="w-6 h-6 bg-slate-900" />
                      <div className="w-6 h-6 bg-slate-900" />
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-medium">Scan with ABA Mobile or Bakong app</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">qr-payment-screen.png (1.8 MB)</span>
              <button
                type="button"
                onClick={() => setShowScreenshotPreview(false)}
                className="px-4 py-2 font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
