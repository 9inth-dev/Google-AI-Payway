import React, { useState, useEffect } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import {
  getVerifiedRequirementsCount,
  isTechnicalTestingComplete,
  isUiEvidenceComplete,
  getUiEvidenceAttachedCount,
  isReadyForProduction,
} from '../../utils/readiness';
import { ChevronDown, Check, Lock, ExternalLink, Copy, Video, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';

export const FIGMA_UI_GUIDELINE_URL = 'https://www.figma.com/file/payway-qr-ui-guideline-placeholder';

interface ProductionReadinessAccordionProps {
  onRequestProductionAccess: () => void;
}

export const ProductionReadinessAccordion: React.FC<ProductionReadinessAccordionProps> = ({
  onRequestProductionAccess,
}) => {
  const {
    state,
    setRoute,
    attachRecording,
    removeRecording,
    attachScreenshot,
    removeScreenshot,
    addToast,
  } = useSandbox();

  const [showScreenshotPreview, setShowScreenshotPreview] = useState(false);

  const techComplete = isTechnicalTestingComplete(state);
  const evidenceComplete = isUiEvidenceComplete(state);
  const readyForProd = isReadyForProduction(state);
  const verifiedTechCount = getVerifiedRequirementsCount(state);
  const evidenceCount = getUiEvidenceAttachedCount(state);

  // All sections start collapsed and can be independently opened/closed
  const [openSections, setOpenSections] = useState<{
    technical: boolean;
    evidence: boolean;
    submit: boolean;
  }>({
    technical: false,
    evidence: false,
    submit: false,
  });

  // Handle independent accordion toggle
  const toggleSection = (section: 'technical' | 'evidence' | 'submit') => {
    if (section === 'submit' && !readyForProd) {
      addToast('Prerequisites Required', 'Please complete Technical Tests and UI Evidence before submitting.', 'info');
      return;
    }
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate completed stages count (out of 3)
  const completedStagesCount = (techComplete ? 1 : 0) + (evidenceComplete ? 1 : 0) + (state.reviewStatus !== 'none' ? 1 : 0);

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

  const uiEv = state.uiEvidence || { recordingAttached: false, screenshotAttached: false };

  const handleCopyFigmaLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(FIGMA_UI_GUIDELINE_URL);
      addToast('Guideline link copied', 'PayWay Figma UI guideline link copied to clipboard', 'info');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 3. PAGE INTRODUCTION (Non-clickable Header & Stage Tracker) */}
      <div className="flex flex-col gap-3.5 pb-1">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Production readiness</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Complete the requirements below before requesting production access.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                completedStagesCount >= 2
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : completedStagesCount === 1
                  ? 'bg-cyan-50 text-[#00B4CC] border-cyan-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {completedStagesCount} of 3 stages complete
            </span>
          </div>
        </div>

        {/* 3-Stage Mini Progress Track */}
        <div className="grid grid-cols-3 gap-2 w-full pt-0.5">
          <div className="flex flex-col gap-1.5">
            <div className={`h-1.5 rounded-full transition-colors ${techComplete ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <span className="text-[11px] font-medium text-gray-500">1. Technical Tests</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className={`h-1.5 rounded-full transition-colors ${evidenceComplete ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <span className="text-[11px] font-medium text-gray-500">2. UI Evidence</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className={`h-1.5 rounded-full transition-colors ${state.reviewStatus !== 'none' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <span className="text-[11px] font-medium text-gray-500">3. Submit Request</span>
          </div>
        </div>
      </div>

      {/* ACCORDION CONTAINER */}
      <div className="flex flex-col gap-3.5 w-full">
        {/* ========================================================================= */}
        {/* SECTION 1: TECHNICAL TESTS                                                */}
        {/* ========================================================================= */}
        <div
          className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs ${
            openSections.technical ? 'border-[#00B4CC]/60 ring-1 ring-[#00B4CC]/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Header */}
          <button
            type="button"
            role="button"
            aria-expanded={openSections.technical}
            aria-controls="technical-tests-panel"
            onClick={() => toggleSection('technical')}
            className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer bg-white hover:bg-gray-50/50"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Step indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  techComplete
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-cyan-50 text-[#00B4CC] border border-cyan-200'
                }`}
              >
                {techComplete ? <Check className="w-4 h-4 stroke-[2.5]" /> : '1'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-gray-900">Technical Tests</span>
                </div>
                <span className="text-xs text-gray-500 font-medium block mt-0.5">
                  {techComplete ? '5/5 verified' : `${verifiedTechCount}/5 verified`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                  techComplete
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : verifiedTechCount > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {techComplete ? 'Complete ✓' : verifiedTechCount > 0 ? 'In progress' : 'Action required'}
              </span>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  openSections.technical ? 'rotate-180 text-gray-600' : ''
                }`}
              />
            </div>
          </button>

          {/* Expanded Content */}
          {openSections.technical && (
            <div
              id="technical-tests-panel"
              className="px-4 sm:px-6 pb-5 pt-2 border-t border-gray-100 flex flex-col gap-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                  Automatically verified through your sandbox API transaction activity.
                </p>
                <button
                  type="button"
                  onClick={() => setRoute('/integrations/qr-api/testing')}
                  className="text-xs font-bold text-[#00B4CC] hover:text-[#009cb2] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Go to test page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Requirements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* 1. QR generated successfully */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-colors ${
                    ts.qrGenerated?.status === 'verified'
                      ? 'bg-gray-50/80 border-gray-200 text-gray-700'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                        ts.qrGenerated?.status === 'verified'
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-amber-500 text-amber-600'
                      }`}
                    >
                      {ts.qrGenerated?.status === 'verified' ? '✓' : '!'}
                    </span>
                    <span className={ts.qrGenerated?.status === 'verified' ? 'text-gray-700 font-medium' : 'font-bold text-gray-900'}>
                      QR generated successfully
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      ts.qrGenerated?.status === 'verified'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-amber-800 bg-amber-100'
                    }`}
                  >
                    {ts.qrGenerated?.status === 'verified' ? 'Completed' : 'Incomplete'}
                  </span>
                </div>

                {/* 2. Payment completed */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-colors ${
                    ts.paymentCompleted?.status === 'verified'
                      ? 'bg-gray-50/80 border-gray-200 text-gray-700'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                        ts.paymentCompleted?.status === 'verified'
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-amber-500 text-amber-600'
                      }`}
                    >
                      {ts.paymentCompleted?.status === 'verified' ? '✓' : '!'}
                    </span>
                    <span className={ts.paymentCompleted?.status === 'verified' ? 'text-gray-700 font-medium' : 'font-bold text-gray-900'}>
                      Payment completed
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      ts.paymentCompleted?.status === 'verified'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-amber-800 bg-amber-100'
                    }`}
                  >
                    {ts.paymentCompleted?.status === 'verified' ? 'Completed' : 'Incomplete'}
                  </span>
                </div>

                {/* 3. Webhook received */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-colors ${
                    ts.webhookReceived?.status === 'verified'
                      ? 'bg-gray-50/80 border-gray-200 text-gray-700'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                        ts.webhookReceived?.status === 'verified'
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-amber-500 text-amber-600'
                      }`}
                    >
                      {ts.webhookReceived?.status === 'verified' ? '✓' : '!'}
                    </span>
                    <span className={ts.webhookReceived?.status === 'verified' ? 'text-gray-700 font-medium' : 'font-bold text-gray-900'}>
                      Webhook received
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      ts.webhookReceived?.status === 'verified'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-amber-800 bg-amber-100'
                    }`}
                  >
                    {ts.webhookReceived?.status === 'verified' ? 'Completed' : 'Incomplete'}
                  </span>
                </div>

                {/* 4. Final transaction status confirmed */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-colors ${
                    ts.statusConfirmed?.status === 'verified'
                      ? 'bg-gray-50/80 border-gray-200 text-gray-700'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                        ts.statusConfirmed?.status === 'verified'
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-amber-500 text-amber-600'
                      }`}
                    >
                      {ts.statusConfirmed?.status === 'verified' ? '✓' : '!'}
                    </span>
                    <span className={ts.statusConfirmed?.status === 'verified' ? 'text-gray-700 font-medium' : 'font-bold text-gray-900'}>
                      Final transaction status confirmed
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      ts.statusConfirmed?.status === 'verified'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-amber-800 bg-amber-100'
                    }`}
                  >
                    {ts.statusConfirmed?.status === 'verified' ? 'Completed' : 'Incomplete'}
                  </span>
                </div>

                {/* 5. Success and expired states verified */}
                <div
                  className={`sm:col-span-2 flex items-center justify-between p-3 rounded-lg border text-xs transition-colors ${
                    ts.customerPaymentStates?.status === 'verified'
                      ? 'bg-gray-50/80 border-gray-200 text-gray-700'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                        ts.customerPaymentStates?.status === 'verified'
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-amber-500 text-amber-600'
                      }`}
                    >
                      {ts.customerPaymentStates?.status === 'verified' ? '✓' : '!'}
                    </span>
                    <div>
                      <span className={ts.customerPaymentStates?.status === 'verified' ? 'text-gray-700 font-medium' : 'font-bold text-gray-900 block'}>
                        Success and expired states verified
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Verify successful payment and expired QR behavior in sandbox testing.
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      ts.customerPaymentStates?.status === 'verified'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-amber-800 bg-amber-100'
                    }`}
                  >
                    {ts.customerPaymentStates?.status === 'verified' ? 'Completed' : 'Incomplete'}
                  </span>
                </div>
              </div>

              {/* Single Clear Action Banner */}
              <div className="mt-1 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/70">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Perform or simulate test transactions</span>
                  <span className="text-[11px] text-slate-500">
                    Execute sample KHQR payments and simulate webhook callbacks in the test workspace.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setRoute('/integrations/qr-api/testing')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#00B4CC] hover:bg-[#009cb2] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs self-start sm:self-auto"
                >
                  <span>Go to test page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: UI EVIDENCE                                                    */}
        {/* ========================================================================= */}
        <div
          className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs ${
            openSections.evidence ? 'border-[#00B4CC]/60 ring-1 ring-[#00B4CC]/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Header */}
          <button
            type="button"
            role="button"
            aria-expanded={openSections.evidence}
            aria-controls="ui-evidence-panel"
            onClick={() => toggleSection('evidence')}
            className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer bg-white hover:bg-gray-50/50"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Step indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  evidenceComplete
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {evidenceComplete ? <Check className="w-4 h-4 stroke-[2.5]" /> : '2'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-gray-900">UI Evidence</span>
                </div>
                <span className="text-xs text-gray-500 font-medium block mt-0.5">
                  {evidenceCount}/2 uploaded
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                  evidenceComplete
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : evidenceCount === 1
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {evidenceComplete ? 'Complete ✓' : evidenceCount === 1 ? 'Action required' : 'Required'}
              </span>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  openSections.evidence ? 'rotate-180 text-gray-600' : ''
                }`}
              />
            </div>
          </button>

          {/* Expanded Content */}
          {openSections.evidence && (
            <div
              id="ui-evidence-panel"
              className="px-4 sm:px-6 pb-5 pt-2 border-t border-gray-100 flex flex-col gap-4 animate-in fade-in duration-150"
            >
              <p className="text-xs text-gray-600 leading-relaxed pt-1">
                Show that your checkout follows the PayWay QR payment flow. Attach a short screen recording and a screenshot of your live QR payment UI.
              </p>

              {/* PayWay UI Guideline helper banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Follow the PayWay QR UI guideline</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review the official layout, spacing, and branding requirements before recording or capturing your UI.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={FIGMA_UI_GUIDELINE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#00B4CC] text-white hover:bg-[#009cb2] transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <span>View UI guideline</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyFigmaLink}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy link</span>
                  </button>
                </div>
              </div>

              {/* Two Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* CARD 1: Screen Recording */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-[#00B4CC]" />
                        <h5 className="text-xs font-bold text-slate-900">Payment flow screen recording</h5>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider shrink-0 ${
                          uiEv.recordingAttached
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                            : 'bg-amber-50/80 border border-amber-300/80 text-amber-600'
                        }`}
                      >
                        {uiEv.recordingAttached ? '✓ Verified' : 'Required'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Must demonstrate: <strong>QR renders → Customer scans → Payment result appears</strong>.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Around 30 seconds · MP4 or MOV · Maximum 50MB
                    </p>
                  </div>

                  {/* Recording Actions */}
                  {uiEv.recordingAttached ? (
                    <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            {uiEv.recordingFileName || 'qr-payment-flow.mp4'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {uiEv.recordingFileSize || '12.4 MB'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
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
                      className="w-full border border-dashed border-slate-300 bg-white hover:bg-slate-50 rounded-lg py-2.5 px-4 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors mt-4"
                    >
                      <Video className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload recording</span>
                    </button>
                  )}
                </div>

                {/* CARD 2: UI Screenshot */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#00B4CC]" />
                        <h5 className="text-xs font-bold text-slate-900">QR payment UI screenshot</h5>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider shrink-0 ${
                          uiEv.screenshotAttached
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                            : 'bg-amber-50/80 border border-amber-300/80 text-amber-600'
                        }`}
                      >
                        {uiEv.screenshotAttached ? '✓ Verified' : 'Required'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Must show the customer-facing QR payment UI following the PayWay UI guideline.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      PNG or JPG · Maximum 10MB
                    </p>
                  </div>

                  {/* Screenshot Actions */}
                  {uiEv.screenshotAttached ? (
                    <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-cyan-400 shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            {uiEv.screenshotFileName || 'qr-payment-screen.png'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {uiEv.screenshotFileSize || '1.8 MB'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowScreenshotPreview(true)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={removeScreenshot}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={attachScreenshot}
                      className="w-full border border-dashed border-slate-300 bg-white hover:bg-slate-50 rounded-lg py-2.5 px-4 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors mt-4"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload screenshot</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SUBMIT REQUEST                                                 */}
        {/* ========================================================================= */}
        <div
          className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs ${
            !readyForProd
              ? 'border-gray-200 opacity-90'
              : openSections.submit
              ? 'border-emerald-400 ring-1 ring-emerald-400/30'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Header */}
          <button
            type="button"
            role="button"
            aria-expanded={openSections.submit}
            aria-controls="submit-request-panel"
            onClick={() => toggleSection('submit')}
            className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors ${
              !readyForProd ? 'cursor-not-allowed bg-gray-50/70' : 'cursor-pointer bg-white hover:bg-gray-50/50'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Step indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  readyForProd
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {!readyForProd ? <Lock className="w-3.5 h-3.5" /> : '3'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-gray-900">Submit Request</span>
                </div>
                <span className="text-xs text-gray-500 font-medium block mt-0.5">
                  {!readyForProd ? 'Complete the requirements above first' : 'All prerequisites verified'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                  readyForProd
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                {!readyForProd ? (
                  <>
                    <Lock className="w-3 h-3 text-gray-400" />
                    <span>Locked</span>
                  </>
                ) : (
                  <span>Ready ✓</span>
                )}
              </span>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  openSections.submit ? 'rotate-180 text-gray-600' : ''
                } ${!readyForProd ? 'opacity-40' : ''}`}
              />
            </div>
          </button>

          {/* Expanded Content (Only when ready) */}
          {openSections.submit && readyForProd && (
            <div
              id="submit-request-panel"
              className="px-4 sm:px-6 pb-6 pt-3 border-t border-gray-100 flex flex-col gap-4 animate-in fade-in duration-150"
            >
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">
                      You're ready to request production access
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-xl">
                      Your required Sandbox tests and UI evidence are complete. Continue to provide your business details and submit your integration to PayWay for review.
                    </p>

                    {/* Compact Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                          <span className="font-semibold text-gray-800">Technical Tests</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Complete (5/5)
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                          <span className="font-semibold text-gray-800">UI Evidence</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Complete (2/2)
                        </span>
                      </div>
                    </div>

                    {/* Primary CTA */}
                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={onRequestProductionAccess}
                        className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Request production access</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-xs text-gray-500 font-medium">
                        Reviews usually take 2 to 3 working days.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Preview Modal */}
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
                <div className="bg-red-600 text-white p-3 text-center font-bold text-xs">
                  ABA PAYWAY KHQR
                </div>
                <div className="p-4 flex flex-col items-center text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Merchant Name</span>
                  <span className="text-xs font-bold text-slate-900 mb-2">Bodia Spa Boutique</span>

                  <div className="text-sm font-extrabold text-cyan-700 mb-3">$10.00 USD</div>

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
