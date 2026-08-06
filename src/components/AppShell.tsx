import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function AppShell({ children, title, showBack }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <div className="w-full max-w-[480px] min-h-screen bg-background flex flex-col relative shadow-2xl">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-5 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
          <div className="w-10 h-10 flex items-center justify-start">
            {showBack && (
              <button className="w-10 h-10 rounded-full bg-gym-surface-raised flex items-center justify-center text-foreground hover:bg-gym-surface-muted transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
            )}
          </div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <div className="w-10 h-10 flex items-center justify-end">
            <button className="w-10 h-10 rounded-full bg-gym-surface-raised flex items-center justify-center text-foreground hover:bg-gym-surface-muted transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-5 pb-24">
          <div className="hero-glow absolute inset-0 pointer-events-none" />
          {children}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[440px] h-16 bg-gym-surface-raised rounded-2xl flex items-center justify-around px-2 z-50 border border-white/5 shadow-2xl backdrop-blur-xl">
          <NavItem icon="home" label="Home" active />
          <NavItem icon="calendar" label="History" />
          <div className="relative -top-6">
            <button className="w-14 h-14 rounded-full bg-gym-accent flex items-center justify-center text-primary shadow-[0_8px_20px_rgba(213,255,64,0.3)] hover:scale-105 transition-transform active:scale-95">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
            </button>
          </div>
          <NavItem icon="credit-card" label="Payments" />
          <NavItem icon="user" label="Profile" />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-gym-accent' : 'text-muted-foreground hover:text-foreground'}`}>
      <div className="w-6 h-6 flex items-center justify-center">
        {icon === 'home' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
        {icon === 'calendar' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
        {icon === 'credit-card' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>}
        {icon === 'user' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
