import React, { useRef } from 'react';
import { RequirementStatus, EvidenceItem } from '../../types/sandbox';

interface RequirementCardProps {
  number: number;
  title: string;
  explanation: string;
  status: RequirementStatus;
  autoVerified?: boolean;
  actionRequiredText?: string;
  lastEventTime?: string;
  lastTxId?: string;
  lastDetails?: string;
  
  // Requirement 5 specific props
  isCustomerStatesRequirement?: boolean;
  successStateDetected?: boolean;
  expiredStateDetected?: boolean;
  successEvidence?: EvidenceItem;
  expiredEvidence?: EvidenceItem;
  onUploadEvidence?: (type: 'success' | 'expired', item: EvidenceItem) => void;
  onRemoveEvidence?: (type: 'success' | 'expired') => void;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  number,
  title,
  explanation,
  status,
  autoVerified = true,
  actionRequiredText,
  lastEventTime,
  lastTxId,
  lastDetails,
  isCustomerStatesRequirement = false,
  successStateDetected = false,
  expiredStateDetected = false,
  successEvidence,
  expiredEvidence,
  onUploadEvidence,
  onRemoveEvidence,
}) => {
  const successFileInputRef = useRef<HTMLInputElement>(null);
  const expiredFileInputRef = useRef<HTMLInputElement>(null);

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Verified
          </span>
        );
      case 'action_required':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Action required
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-[#00B4CC] border border-cyan-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00B4CC]" />
            In progress
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
            Failed
          </span>
        );
      case 'not_detected':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Not detected
          </span>
        );
    }
  };

  const handleFileChange = (type: 'success' | 'expired', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadEvidence) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadEvidence(type, {
          fileName: file.name,
          fileData: event.target?.result as string,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`bg-white rounded-xl border p-5 transition-all shadow-2xs ${
      status === 'verified'
        ? 'border-emerald-200/80 bg-emerald-50/10'
        : status === 'action_required'
        ? 'border-amber-200/80 bg-amber-50/10'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* CARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            status === 'verified'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'action_required'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {number}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-800">{title}</h3>
              {autoVerified ? (
                <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                  Automatically verified
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Behavior &amp; UI evidence required
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        <div className="self-start sm:self-center shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      {/* RELATED API ACTIVITY DETECTED */}
      {lastEventTime && (
        <div className="mt-3.5 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-gray-700">Observed in Sandbox</span>
            {lastTxId && (
              <span className="font-mono text-gray-500 text-[11px]">
                ({lastTxId})
              </span>
            )}
            {lastDetails && (
              <span className="text-gray-600 text-[11px]">— {lastDetails}</span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 font-mono">{lastEventTime}</span>
        </div>
      )}

      {/* REQUIREMENT 5 SPECIFIC: BEHAVIORS & EVIDENCE SCREENSHOTS */}
      {isCustomerStatesRequirement && (
        <div className="mt-4 flex flex-col gap-4">
          {/* SYSTEM BEHAVIOR DETECTION ROW */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Required System Behavior Detection
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SUCCESSFUL STATE DETECTED */}
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                successStateDetected
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    successStateDetected ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {successStateDetected ? '✓' : '!'}
                  </span>
                  <div>
                    <span className="font-bold block">1. Successful payment state</span>
                    <span className="text-[11px] opacity-80">Triggered by completing a test QR payment</span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold ${successStateDetected ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {successStateDetected ? 'Detected' : 'Not detected'}
                </span>
              </div>

              {/* EXPIRED STATE DETECTED */}
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                expiredStateDetected
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    expiredStateDetected ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {expiredStateDetected ? '✓' : '!'}
                  </span>
                  <div>
                    <span className="font-bold block">2. Expired QR state</span>
                    <span className="text-[11px] opacity-80">Triggered by simulating QR timeout</span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold ${expiredStateDetected ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {expiredStateDetected ? 'Detected' : 'Not detected'}
                </span>
              </div>
            </div>
          </div>

          {/* UI EVIDENCE UPLOADS SECTION */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              UI Evidence Screenshots Required
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* SUCCESS EVIDENCE */}
              <div className="border border-gray-200 rounded-lg p-3 bg-white flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">
                    A. Successful Payment Screen
                  </span>
                  {successEvidence ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Required
                    </span>
                  )}
                </div>

                {successEvidence ? (
                  <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden shrink-0 flex items-center justify-center border border-gray-300">
                      {successEvidence.fileData ? (
                        <img src={successEvidence.fileData} alt="Evidence" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-500 font-bold">PNG</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{successEvidence.fileName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Uploaded at {successEvidence.uploadedAt}</p>
                      <div className="flex gap-3 mt-1 text-[11px]">
                        <button
                          onClick={() => successFileInputRef.current?.click()}
                          className="text-[#00B4CC] font-semibold hover:underline cursor-pointer"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => onRemoveEvidence && onRemoveEvidence('success')}
                          className="text-rose-600 font-semibold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => successFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-cyan-400 rounded-lg p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-cyan-50/20"
                  >
                    <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 block">Click to upload screenshot</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">PNG or JPG showing successful payment result screen</span>
                  </div>
                )}
                <input
                  ref={successFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('success', e)}
                  className="hidden"
                />
              </div>

              {/* EXPIRED EVIDENCE */}
              <div className="border border-gray-200 rounded-lg p-3 bg-white flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">
                    B. Expired QR Screen
                  </span>
                  {expiredEvidence ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Required
                    </span>
                  )}
                </div>

                {expiredEvidence ? (
                  <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden shrink-0 flex items-center justify-center border border-gray-300">
                      {expiredEvidence.fileData ? (
                        <img src={expiredEvidence.fileData} alt="Evidence" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-500 font-bold">PNG</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{expiredEvidence.fileName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Uploaded at {expiredEvidence.uploadedAt}</p>
                      <div className="flex gap-3 mt-1 text-[11px]">
                        <button
                          onClick={() => expiredFileInputRef.current?.click()}
                          className="text-[#00B4CC] font-semibold hover:underline cursor-pointer"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => onRemoveEvidence && onRemoveEvidence('expired')}
                          className="text-rose-600 font-semibold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => expiredFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-cyan-400 rounded-lg p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-cyan-50/20"
                  >
                    <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 block">Click to upload screenshot</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">PNG or JPG showing expired QR state screen</span>
                  </div>
                )}
                <input
                  ref={expiredFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('expired', e)}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
