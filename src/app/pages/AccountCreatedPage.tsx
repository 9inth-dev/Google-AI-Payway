import React from 'react';
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

export const AccountCreatedPage: React.FC = () => {
  const { setRoute, setWelcomeModalOpen } = useSandbox();

  const handleGoToSandbox = () => {
    setRoute('/home');
    setWelcomeModalOpen(true);
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
      <div className="relative z-10 px-8 py-5">
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
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 pb-8">
        <div
          className="flex overflow-hidden bg-white"
          style={{
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
            width: 680,
          }}
        >
          {/* Left panel - warm golden gradient + 3D cube */}
          <div
            className="flex items-center justify-center relative"
            style={{
              width: 280,
              background: "linear-gradient(145deg, #C8A96A 0%, #D4A843 40%, #B8913A 100%)",
              minHeight: 320,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at 50% 60%, rgba(255,220,120,0.22) 0%, transparent 70%)",
              }}
            />
            <GoldenCube />
          </div>

          {/* Right panel - white content */}
          <div className="flex-1 flex flex-col items-center justify-center px-10 py-10 relative">
            {/* EN badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
              </svg>
              EN
            </div>

            {/* Success icon with sparkles */}
            <div className="relative mb-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#22C55E" }}
              >
                <svg width="28" height="24" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 28 24">
                  <polyline points="3,13 10,20 25,4" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full" style={{ backgroundColor: "#00B4CC" }} />
              <div className="absolute top-1 -right-5 w-2 h-2 rounded-full" style={{ backgroundColor: "#00B4CC", opacity: 0.5 }} />
              <div className="absolute -top-3 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#00B4CC", opacity: 0.4 }} />
              <div className="absolute -bottom-2 -left-3 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#B8E8F0", opacity: 0.8 }} />
            </div>

            <h2 className="text-xl font-bold mb-2 text-center" style={{ color: "#0D3D4F" }}>
              Account Created
            </h2>
            <p className="text-xs text-center leading-relaxed mb-7 text-gray-500" style={{ maxWidth: 260 }}>
              Your ABA PayWay Sandbox account is ready! Start building and testing payment APIs in a secure, risk-free environment.
            </p>

            <button
              onClick={handleGoToSandbox}
              className="w-full rounded-lg py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
              style={{ backgroundColor: "#00B4CC", maxWidth: 240 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#0A9BB0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#00B4CC")}
            >
              Go to Sandbox
            </button>
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
