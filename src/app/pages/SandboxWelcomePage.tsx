import React from 'react';
import { useSandbox } from '../context/SandboxContext';
import { Code2, FlaskConical, Rocket, ArrowRight } from 'lucide-react';

function GoldenCube() {
  return (
    <svg width="120" height="120" viewBox="0 0 140 140" fill="none">
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

export const SandboxWelcomePage: React.FC = () => {
  const { updateState, setRoute, setTourStep } = useSandbox();

  const handleGetStarted = () => {
    updateState({ hasSeenSandboxWelcome: true });
    setRoute('/home');
    setTourStep(1);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#EBEBEB',
      }}
    >
      {/* Background watermark pattern */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <WatermarkPattern />
      </div>

      {/* Top Header Branding */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="font-extrabold text-xl leading-none" style={{ color: '#E8352A' }}>
              ABA
            </span>
            <sup className="font-black ml-0.5" style={{ fontSize: 9, color: '#E8352A' }}>
              +
            </sup>
            <span
              className="font-extrabold italic ml-1"
              style={{ fontSize: 20, color: '#00B4CC', letterSpacing: '0.03em' }}
            >
              PAYWAY
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-300">
            Sandbox Developer Portal
          </span>
        </div>
      </header>

      {/* Centered Welcome Card */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 sm:px-6 py-6">
        <div
          className="flex flex-col md:flex-row overflow-hidden bg-white max-w-3xl w-full"
          style={{
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
          }}
        >
          {/* Left panel - warm golden gradient + visual identity */}
          <div
            className="flex flex-col items-center justify-center relative p-6 text-center shrink-0"
            style={{
              width: '100%',
              maxWidth: '260px',
              background: 'linear-gradient(145deg, #C8A96A 0%, #D4A843 40%, #B8913A 100%)',
              minHeight: '280px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 50% 60%, rgba(255,220,120,0.22) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <GoldenCube />
              <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/30">
                Safe Test Environment
              </span>
              <p className="text-amber-100 text-[11px] mt-2 leading-relaxed max-w-[200px] text-center">
                Simulated transactions &amp; zero financial risk
              </p>
            </div>
          </div>

          {/* Right panel - Main Welcome Content */}
          <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 relative bg-white">
            {/* Top info badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#00B4CC] text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00B4CC]" />
                Developer Sandbox Ready
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                </svg>
                EN
              </div>
            </div>

            {/* Primary Heading & Supporting Copy */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: '#0D3D4F' }}>
                Welcome to PayWay Sandbox
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1.5 leading-relaxed">
                Build, test and prepare your PayWay integrations in a safe environment before going live.
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Your Sandbox is ready. We&apos;ll quickly show you where to find your API credentials, integrations, developer tools and support.
              </p>
            </div>

            {/* Orientation Points */}
            <div className="my-5 flex flex-col gap-2.5">
              {/* Point 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-cyan-100/70 text-[#00B4CC] flex items-center justify-center shrink-0 mt-0.5">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-gray-900 leading-tight">
                    Build with Sandbox APIs
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                    Develop and test your PayWay integration without moving real money.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-gray-900 leading-tight">
                    Test before you go live
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                    Run test payments and verify your implementation before requesting production access.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-gray-900 leading-tight">
                    Move to production when ready
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                    Complete your requirements and send your integration to PayWay for review.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <div>
              <button
                type="button"
                onClick={handleGetStarted}
                className="w-full rounded-xl py-3 px-5 text-sm font-semibold text-white transition-all duration-150 cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B4CC]"
                style={{ backgroundColor: '#00B4CC' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0A9BB0')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#00B4CC')}
              >
                <span>Let&apos;s get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
