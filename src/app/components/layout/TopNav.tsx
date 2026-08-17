import React, { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { ChevronDown, Settings, User } from 'lucide-react';

function PayWayLogo() {
  return (
    <div className="flex items-center">
      <span className="font-extrabold text-base leading-none text-white tracking-tight" style={{ letterSpacing: '0.02em' }}>
        ABA
      </span>
      <span
        className="font-extrabold italic text-[#00B4CC] ml-1 tracking-wide"
        style={{ fontSize: 17, letterSpacing: '0.04em' }}
      >
        PAYWAY
      </span>
    </div>
  );
}

export const TopNav: React.FC = () => {
  const { setRoute, setShowAskNaviModal } = useSandbox();
  const [merchantDropdownOpen, setMerchantDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header
      className="flex items-center justify-between px-4 h-14 shrink-0 z-20"
      style={{ backgroundColor: '#073340' }}
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        {/* Merchant Selector Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMerchantDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 bg-[#052833] hover:bg-[#042029] border border-cyan-900/40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {/* Merchant Circle Avatar */}
            <div className="w-5 h-5 rounded-full bg-[#4A3E3D] border border-stone-600 flex items-center justify-center text-[9px] font-bold text-amber-200 uppercase tracking-tighter">
              B
            </div>
            <span className="text-[13px] font-medium text-gray-200">Bodia Spa</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {merchantDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Active Merchant
              </div>
              <button
                type="button"
                onClick={() => setMerchantDropdownOpen(false)}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-800 bg-cyan-50/60 flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-[#4A3E3D] text-[8px] text-amber-200 flex items-center justify-center font-bold">
                  B
                </div>
                <span>Bodia Spa (HQ)</span>
              </button>
              <button
                type="button"
                onClick={() => setMerchantDropdownOpen(false)}
                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-slate-600 text-[8px] text-white flex items-center justify-center font-bold">
                  B
                </div>
                <span>Bodia Siem Reap</span>
              </button>
            </div>
          )}
        </div>

        {/* Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={() => setRoute('/home')}
          className="text-white/80 hover:text-white p-1 transition-colors cursor-pointer ml-1"
          title="Toggle Navigation"
        >
          <svg width="18" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="0" y1="1" x2="18" y2="1" />
            <line x1="0" y1="7" x2="18" y2="7" />
            <line x1="0" y1="13" x2="18" y2="13" />
          </svg>
        </button>

        {/* PayWay Logo */}
        <button type="button" onClick={() => setRoute('/home')} className="text-left cursor-pointer pl-1">
          <PayWayLogo />
        </button>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3.5">
        {/* Ask Navi Button matching exact screenshot */}
        <button
          data-tour="topnav-ask-navi"
          type="button"
          onClick={() => setShowAskNaviModal(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 text-white text-xs font-semibold cursor-pointer shadow-sm hover:opacity-95 transition-all group"
          style={{
            background: 'linear-gradient(135deg, #3B1B7D 0%, #2A105C 100%)',
          }}
        >
          {/* Purple oval glow pill on left */}
          <div className="w-4.5 h-2.5 rounded-full bg-[#A855F7] group-hover:bg-[#C084FC] transition-colors shadow-[0_0_8px_#A855F7]" />
          <div className="flex items-center">
            <span className="text-[13px] font-semibold text-purple-100">Ask Navi</span>
            <sup className="text-[11px] font-black text-purple-300 ml-0.5 leading-none">⁺</sup>
          </div>
        </button>

        {/* Settings Gear Quick Action */}
        <button
          type="button"
          onClick={() => setRoute('/developer/settings')}
          className="text-white/70 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
          title="Developer Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 text-white cursor-pointer hover:opacity-90 py-1"
          >
            <div className="w-7 h-7 rounded-full bg-[#00B4CC] flex items-center justify-center text-white shrink-0 shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="text-xs leading-tight hidden sm:block text-left">
              <div className="font-semibold text-gray-100 text-[12px]">Monineath Heng</div>
              <div className="text-gray-400 text-[10px] flex items-center gap-1">
                <span>Admin</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </div>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-gray-100 text-xs">
                <p className="font-semibold text-gray-800">Monineath Heng</p>
                <p className="text-[11px] text-gray-400 truncate">monineath.heng@bodia-spa.com</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRoute('/developer/api-keys');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                API Credentials
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoute('/login');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
