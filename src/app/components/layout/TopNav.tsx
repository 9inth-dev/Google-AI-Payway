import React from 'react';
import { useSandbox } from '../../context/SandboxContext';

function PayWayLogo() {
  return (
    <div className="flex items-center">
      <span className="font-extrabold text-base leading-none" style={{ color: "#E8352A" }}>
        ABA
      </span>
      <sup className="font-black ml-0.5 text-white" style={{ fontSize: 8 }}>
        +
      </sup>
      <span
        className="font-extrabold italic text-white ml-1 tracking-wide"
        style={{ fontSize: 17, letterSpacing: "0.03em" }}
      >
        PAYWAY
      </span>
    </div>
  );
}

export const TopNav: React.FC = () => {
  const { setRoute, setShowAskNaviModal } = useSandbox();

  return (
    <header
      className="flex items-center justify-between px-5 h-14 shrink-0 z-20"
      style={{ backgroundColor: "#0D5C73" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setRoute('/home')}
          className="text-white/70 hover:text-white transition-colors cursor-pointer"
          title="Go to Home"
        >
          <svg width="18" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="0" y1="1" x2="18" y2="1" />
            <line x1="0" y1="7" x2="18" y2="7" />
            <line x1="0" y1="13" x2="18" y2="13" />
          </svg>
        </button>
        <button onClick={() => setRoute('/home')} className="text-left cursor-pointer">
          <PayWayLogo />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Ask Navi Button */}
        <button
          onClick={() => setShowAskNaviModal(true)}
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
          style={{ background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)" }}
        >
          <span style={{ fontSize: 13 }}>✦</span> Ask Navi
        </button>

        {/* Developer Settings Quick Action */}
        <button
          onClick={() => setRoute('/developer/settings')}
          className="text-white/70 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/10"
          title="Developer Settings"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>

        {/* Profile Switcher & Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 text-white cursor-pointer hover:opacity-90 py-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#1A7A90" }}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="text-xs leading-tight hidden sm:block text-left">
              <div className="font-semibold">Olakunle Henry</div>
              <div className="opacity-60 text-[10px]">Developer Sandbox</div>
            </div>
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="white"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="opacity-60 hidden sm:block"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 hidden group-hover:block z-50">
            <div className="px-3 py-2 border-b border-gray-100 text-xs">
              <p className="font-semibold text-gray-800">Olakunle Henry</p>
              <p className="text-[11px] text-gray-400 truncate">henry.dev@payway-merchant.com</p>
            </div>
            <button
              onClick={() => setRoute('/developer/api-keys')}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              API Credentials
            </button>
            <button
              onClick={() => setRoute('/login')}
              className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
