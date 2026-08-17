import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';

function GoldenCube() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
      <polygon points="70,20 120,47 70,74 20,47" fill="#F5C842" />
      <polygon points="20,47 70,74 70,120 20,93" fill="#C8903A" />
      <polygon points="120,47 70,74 70,120 120,93" fill="#E8A830" />
      <polygon points="70,20 120,47 70,74 20,47" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    </svg>
  );
}

function WatermarkPattern() {
  return (
    <svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" style={{ opacity: 0.045 }}>
      {[0, 1, 2, 3, 4].map(row =>
        [0, 1, 2].map(col => (
          <text
            key={`${row}-${col}`}
            x={col * 420 - 60}
            y={row * 180 + 120}
            fontSize="80"
            fontWeight="900"
            fontStyle="italic"
            fill="#0D5C73"
            fontFamily="Arial, sans-serif"
            transform={`rotate(-20, ${col * 420 + 150}, ${row * 180 + 80})`}
          >
            PAYWAY
          </text>
        ))
      )}
    </svg>
  );
}

export const LoginPage: React.FC = () => {
  const { setRoute, updateState, state } = useSandbox();
  const [email, setEmail] = useState('henry.dev@payway-merchant.com');
  const [password, setPassword] = useState('sandbox123456');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateState({ isLoggedIn: true });
    if (state.hasSeenSandboxWelcome) {
      setRoute('/home');
    } else {
      setRoute('/account-created');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#EBEBEB",
      }}
    >
      {/* PayWay background watermark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <WatermarkPattern />
      </div>

      {/* ABA+ PayWay logo top left */}
      <div className="relative z-10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="font-extrabold text-xl leading-none" style={{ color: "#E8352A" }}>
              ABA
            </span>
            <sup className="font-black ml-0.5" style={{ fontSize: 9, color: "#E8352A" }}>
              +
            </sup>
            <span
              className="font-extrabold italic ml-1"
              style={{ fontSize: 20, color: "#00B4CC", letterSpacing: "0.03em" }}
            >
              PAYWAY
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-300">
            Sandbox Developer Portal
          </span>
        </div>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 py-6">
        <div
          className="flex overflow-hidden bg-white"
          style={{
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
            width: 720,
          }}
        >
          {/* Left panel - warm golden gradient + 3D cube */}
          <div
            className="flex flex-col items-center justify-center relative p-6 text-center"
            style={{
              width: 280,
              background: "linear-gradient(145deg, #C8A96A 0%, #D4A843 40%, #B8913A 100%)",
              minHeight: 420,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at 50% 60%, rgba(255,220,120,0.22) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <GoldenCube />
              <h3 className="text-white font-bold text-sm mt-4 tracking-wide">
                PayWay Developer Sandbox
              </h3>
              <p className="text-amber-100 text-xs mt-1.5 leading-relaxed max-w-[200px] mx-auto">
                Test payment integrations, simulate webhooks, and inspect API activity in real-time.
              </p>
            </div>
          </div>

          {/* Right panel - white content login form */}
          <div className="flex-1 flex flex-col justify-center px-8 py-8 relative">
            {/* EN badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
              </svg>
              EN
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[#00B4CC] text-[11px] font-semibold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00B4CC]" />
                Sandbox Environment
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#0D3D4F" }}>
                Sign in to PayWay
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your developer account details to access the sandbox
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4CC] focus:border-transparent transition-all"
                  placeholder="developer@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4CC] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#00B4CC] focus:ring-[#00B4CC]"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#/login"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("In sandbox mode, you can sign in with any email and password.");
                  }}
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#00B4CC" }}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer mt-2"
                style={{ backgroundColor: "#00B4CC" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#0A9BB0")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#00B4CC")}
              >
                Sign In
              </button>
            </form>

            <p className="text-[11px] text-gray-400 text-center mt-5">
              Prototype Mode: Click Sign In with any credentials
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-5 px-8 flex items-end gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 px-2 bg-gray-800 rounded flex items-center">
            <span className="text-white font-bold text-xs">ABA BANK</span>
          </div>
          <div className="h-7 px-2 bg-red-700 rounded flex items-center">
            <span className="text-white font-bold" style={{ fontSize: 9 }}>
              NATIONAL BANK OF CAMBODIA
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-gray-500">
            Advanced Bank of Asia Ltd. 148 Preah Sihanouk Blvd, Phnom Penh, Cambodia
          </p>
          <a href="#/help" className="text-xs hover:underline" style={{ color: "#00B4CC" }}>
            Privacy Policy &amp; Terms
          </a>
        </div>
      </div>
    </div>
  );
};
