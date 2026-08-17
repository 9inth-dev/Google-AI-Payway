import React from 'react';
import { useSandbox } from '../../context/SandboxContext';

interface NavItemDef {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

const PRIMARY_NAV: NavItemDef[] = [
  { label: 'Home', icon: 'home', route: '/home' },
  { label: 'Integrations', icon: 'layers', route: '/integrations', badge: 'New' },
  { label: 'Transactions', icon: 'swap', route: '/transactions' },
  { label: 'Invoices', icon: 'file', route: '/invoices' },
  { label: 'Customers', icon: 'user', route: '/customers' },
  { label: 'Discount Programs', icon: 'tag', route: '/discount-programs' },
  { label: 'Payment Link', icon: 'link', route: '/payment-link' },
];

const DEV_NAV: NavItemDef[] = [
  { label: 'API Keys', icon: 'key', route: '/developer/api-keys' },
  { label: 'Developer Settings', icon: 'sliders', route: '/developer/settings' },
  { label: 'API Documentation', icon: 'book', route: '/developer/docs' },
];

export const Sidebar: React.FC = () => {
  const { currentRoute, setRoute, devSidebarOpen, setDevSidebarOpen } = useSandbox();

  const isRouteActive = (targetRoute: string) => {
    if (targetRoute === '/home') return currentRoute === '/home' || currentRoute === '/';
    if (targetRoute === '/integrations') return currentRoute.startsWith('/integrations');
    if (targetRoute === '/developer/api-keys') return currentRoute === '/developer/api-keys';
    if (targetRoute === '/developer/settings') return currentRoute === '/developer/settings';
    if (targetRoute === '/developer/docs') return currentRoute === '/developer/docs';
    return currentRoute === targetRoute;
  };

  return (
    <aside className="w-52 bg-white border-r border-gray-100 flex flex-col py-3 shrink-0 overflow-y-auto select-none">
      <nav className="flex flex-col gap-0.5 px-2">
        {PRIMARY_NAV.map(item => (
          <NavItem
            key={item.route}
            label={item.label}
            icon={item.icon}
            active={isRouteActive(item.route)}
            badge={item.badge}
            dataTour={item.route === '/integrations' ? 'sidebar-integrations' : undefined}
            onClick={() => setRoute(item.route)}
          />
        ))}

        {/* Developer Section Header */}
        <div className="mt-4 px-3 pb-1" data-tour="sidebar-developer">
          <div className="h-px bg-gray-100 mb-3" />
          <button
            type="button"
            onClick={() => setDevSidebarOpen(prev => !prev)}
            className="flex items-center justify-between w-full group py-1"
          >
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" stroke="#94A3B8" strokeWidth="2.2" viewBox="0 0 24 24">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span
                className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-600 transition-colors"
                style={{ letterSpacing: '0.08em' }}
              >
                Developer
              </span>
            </div>
            <svg
              width="11"
              height="11"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2"
              viewBox="0 0 24 24"
              style={{
                transform: devSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Developer Sub-items */}
        {devSidebarOpen && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {DEV_NAV.map(item => (
              <NavItem
                key={item.route}
                label={item.label}
                icon={item.icon}
                active={isRouteActive(item.route)}
                sub
                onClick={() => setRoute(item.route)}
              />
            ))}
          </div>
        )}

        {/* Help & Documentation Section */}
        <div className="mt-3 px-3 pb-1">
          <div className="h-px bg-gray-100 mb-2" />
        </div>
        <NavItem
          label="Help & Documentation"
          icon="help"
          active={isRouteActive('/help')}
          onClick={() => setRoute('/help')}
        />
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 pb-2 pt-4">
        <div className="border-t border-gray-100 pt-3">
          <div className="text-[10px] text-gray-400 mb-1">Sandbox Environment</div>
          <div className="flex items-center gap-1 mb-2">
            <div className="h-4 px-1.5 rounded-sm bg-gray-800 flex items-center justify-center">
              <span className="text-white font-bold" style={{ fontSize: 7 }}>ABA</span>
            </div>
            <div className="h-4 px-1 rounded-sm bg-red-700 flex items-center justify-center">
              <span className="text-white font-bold" style={{ fontSize: 6 }}>NBC</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-500 font-medium leading-tight">PayWay Sandbox v2.4</div>
          <div className="flex gap-2 mt-1.5 text-[11px]">
            <a href="#/help" className="hover:underline" style={{ color: '#00B4CC' }}>Support</a>
            <span className="text-gray-300">|</span>
            <a href="#/developer/docs" className="hover:underline" style={{ color: '#00B4CC' }}>API Spec</a>
          </div>
        </div>
      </div>
    </aside>
  );
};

function NavItem({
  label,
  icon,
  active,
  sub,
  badge,
  dataTour,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  sub?: boolean;
  badge?: string;
  dataTour?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-tour={dataTour}
      onClick={onClick}
      className="flex items-center justify-between w-full rounded text-left transition-colors cursor-pointer"
      style={{
        padding: sub ? '7px 12px 7px 20px' : '9px 12px',
        color: active ? '#00B4CC' : '#5A6E7A',
        backgroundColor: active ? '#E6F8FA' : 'transparent',
        borderLeft: active ? '3px solid #00B4CC' : '3px solid transparent',
        fontWeight: active ? 600 : 500,
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F7F8';
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <NavIcon name={icon} active={!!active} />
        <span className="truncate text-xs sm:text-sm" style={{ fontSize: sub ? 12 : 13 }}>
          {label}
        </span>
      </div>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 shrink-0">
          {badge}
        </span>
      )}
    </button>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const col = active ? '#00B4CC' : '#7A909C';
  const p = {
    width: 15,
    height: 15,
    fill: 'none' as const,
    stroke: col,
    strokeWidth: 1.8,
    viewBox: '0 0 24 24' as const,
  };

  if (name === 'home')
    return (
      <svg {...p}>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    );
  if (name === 'layers')
    return (
      <svg {...p}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  if (name === 'swap')
    return (
      <svg {...p}>
        <path d="M7 16V4m0 0L3 8m4-4l4 4" />
        <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  if (name === 'file')
    return (
      <svg {...p}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  if (name === 'user')
    return (
      <svg {...p}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  if (name === 'tag')
    return (
      <svg {...p}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    );
  if (name === 'link')
    return (
      <svg {...p}>
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    );
  if (name === 'key')
    return (
      <svg {...p}>
        <circle cx="7" cy="17" r="3" />
        <path d="M10.5 13.5L21 3" />
        <path d="M18 5l2 2" />
      </svg>
    );
  if (name === 'sliders')
    return (
      <svg {...p}>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    );
  if (name === 'book')
    return (
      <svg {...p}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    );
  if (name === 'help')
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  return null;
}
