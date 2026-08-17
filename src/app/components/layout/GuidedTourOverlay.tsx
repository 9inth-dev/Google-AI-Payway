import React, { useEffect, useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';

interface TourStepDef {
  targetSelector: string;
  title: string;
  description: string;
  primaryAction: string;
}

const TOUR_STEPS_CONFIG: TourStepDef[] = [
  {
    targetSelector: '[data-tour="credentials"]',
    title: 'Your Sandbox credentials',
    description:
      "These are the test keys you'll use to authenticate PayWay API requests while building in Sandbox. You can copy them anytime from here or from Developer → API Keys.",
    primaryAction: 'Next',
  },
  {
    targetSelector: '[data-tour="sidebar-integrations"]',
    title: 'Explore PayWay integrations',
    description:
      'Find PayWay products here, choose what you want to build, and start a new product integration.',
    primaryAction: 'Next',
  },
  {
    targetSelector: '[data-tour="developer-tools"]',
    title: 'Everything you need to build',
    description:
      "Access PayWay's API documentation, sample code, payment simulator and transaction tools while you develop.",
    primaryAction: 'Next',
  },
  {
    targetSelector: '[data-tour="sidebar-developer"]',
    title: 'Your developer workspace',
    description:
      'Manage your API keys, developer settings and technical documentation from here whenever you need them.',
    primaryAction: 'Next',
  },
  {
    targetSelector: '[data-tour="topnav-ask-navi"]',
    title: 'Need help? Ask Navi',
    description:
      'Navi can help you choose a PayWay product, understand an API, troubleshoot an error or figure out what to do next.',
    primaryAction: 'Finish tour',
  },
];

export const GuidedTourOverlay: React.FC = () => {
  const { tourStep, setTourStep, updateState, devSidebarOpen, setDevSidebarOpen } = useSandbox();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const stepIndex = tourStep !== null ? tourStep - 1 : null;
  const currentStepDef = stepIndex !== null && stepIndex >= 0 && stepIndex < TOUR_STEPS_CONFIG.length
    ? TOUR_STEPS_CONFIG[stepIndex]
    : null;

  useEffect(() => {
    if (tourStep === 1) {
      updateState({ hasViewedSandboxCredentials: true });
    }
    if (tourStep === 4 && !devSidebarOpen) {
      setDevSidebarOpen(true);
    }
  }, [tourStep, updateState, devSidebarOpen, setDevSidebarOpen]);

  useEffect(() => {
    if (!currentStepDef) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(currentStepDef.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setTargetRect(el.getBoundingClientRect());
        }, 150);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [currentStepDef]);

  if (tourStep === null || !currentStepDef) return null;

  const handleFinishOrSkip = () => {
    updateState({ hasCompletedWelcomeTour: true, showPostTourGuideHighlight: true });
    setTourStep(null);
  };

  const handleNext = () => {
    if (tourStep < TOUR_STEPS_CONFIG.length) {
      setTourStep(tourStep + 1);
    } else {
      handleFinishOrSkip();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Translucent overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] transition-opacity duration-300 cursor-pointer"
        onClick={handleFinishOrSkip}
      />

      {/* Spotlight cutout border over highlighted element */}
      {targetRect && (
        <div
          className="absolute rounded-xl border-2 border-[#00B4CC] shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] transition-all duration-300 pointer-events-none"
          style={{
            top: Math.max(0, targetRect.top - 8),
            left: Math.max(0, targetRect.left - 8),
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          <div className="absolute -top-3 left-4 bg-[#00B4CC] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
            Step {tourStep} of {TOUR_STEPS_CONFIG.length}
          </div>
        </div>
      )}

      {/* Tour Card Floating Window */}
      <div
        className="fixed z-50 w-full max-w-sm px-4 transition-all duration-300"
        style={{
          top: targetRect
            ? Math.min(window.innerHeight - 240, Math.max(20, targetRect.bottom + 16))
            : '50%',
          left: targetRect
            ? Math.min(window.innerWidth - 380, Math.max(20, targetRect.left))
            : '50%',
          transform: targetRect ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-5 border border-cyan-100 relative text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00B4CC]">
              Tour · {tourStep} of {TOUR_STEPS_CONFIG.length}
            </span>
            <button
              onClick={handleFinishOrSkip}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium cursor-pointer"
            >
              Skip tour
            </button>
          </div>

          <h3 className="font-bold text-sm text-gray-800 mb-1.5">
            {currentStepDef.title}
          </h3>

          <p className="text-xs text-gray-600 leading-relaxed mb-5">
            {currentStepDef.description}
          </p>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleFinishOrSkip}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all shadow-sm cursor-pointer"
              style={{ backgroundColor: '#00B4CC' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0A9BB0')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#00B4CC')}
            >
              {currentStepDef.primaryAction} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
