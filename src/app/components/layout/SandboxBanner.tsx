import React from 'react';
import { useSandbox } from '../../context/SandboxContext';

export const SandboxBanner: React.FC = () => {
  const { setRoute, resetToDefaults, setShowPrototypeModal } = useSandbox();

  return (
    <div
      className="flex items-center justify-between px-6 py-2 shrink-0 z-30 select-none"
      style={{ backgroundColor: '#F5A623' }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={resetToDefaults}
          className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-medium px-2 py-0.5 rounded transition-colors cursor-pointer"
          title="Reset sandbox demo state to defaults"
        >
          Reset Demo
        </button>

        <button
          onClick={() => setShowPrototypeModal(true)}
          className="text-[10px] bg-slate-900/80 hover:bg-slate-900 text-amber-200 font-bold px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 border border-amber-300/40"
          title="Open Stakeholder Prototype Presets"
        >
          <span>🧪</span> Prototype Presets
        </button>
      </div>

      <div className="flex items-center gap-2 text-white text-sm font-medium">
        <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Sandbox Mode</span>
        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white/90 font-normal">
          Test Environment
        </span>
      </div>

      <div className="w-36 flex justify-end">
        <button
          onClick={() => setRoute('/developer/docs')}
          className="flex items-center gap-1.5 border border-white/70 text-white text-xs px-3 py-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="text-xs leading-none">⊕</span> APIs &amp; Docs
        </button>
      </div>
    </div>
  );
};
