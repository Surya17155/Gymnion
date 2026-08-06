import { useState, ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
  showBack?: boolean;
}

export function AppShell({ children, title = "GymSync", showNav = true, showBack = false }: AppShellProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-gym-accent selection:text-primary">
      {/* Mobile container - strictly 480px max */}
      <div className="mx-auto max-w-[480px] min-h-screen border-x border-white/5 relative flex flex-col shadow-2xl">
        
        {/* Background Glow Effect */}
        <div className="fixed inset-0 pointer-events-none hero-glow opacity-50 z-0" />
        
        {/* Header - Sticky */}
        {showNav && (
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              {showBack ? (
                <button className="w-10 h-10 rounded-full bg-gym-surface-raised flex items-center justify-center text-foreground hover:bg-gym-surface-muted transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
              ) : (
                <div className="w-8 h-8 bg-gym-accent rounded-lg flex items-center justify-center text-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6.5 6.5 11 11"/><path d="m21 21-1.5-1.5"/><path d="m3 3 1.5 1.5"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
                  </svg>
                </div>
              )}
              <h1 className="font-bold text-lg tracking-tight">{title}</h1>
            </div>
            
            <button className="w-10 h-10 rounded-full bg-gym-surface-raised flex items-center justify-center hover:bg-gym-surface-muted transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </button>
          </header>
        )}

        {/* Main Content */}
        <main className={`flex-1 relative z-10 ${showNav ? 'px-6 pb-28' : ''}`}>
          {children}
        </main>

        {/* Navigation - Fixed Bottom */}
        {showNav && (
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[440px] h-16 bg-gym-surface-raised/90 backdrop-blur-xl rounded-2xl flex items-center justify-around px-2 z-50 border border-white/5 shadow-2xl">
            <NavItem to="/" icon="home" label="Home" active={isActive('/')} />
            <NavItem to="/dashboard" icon="activity" label="Stats" active={location.pathname.startsWith('/dashboard')} />
            
            {/* Center Check-in Action */}
            <Link to="/checkin" className="relative -top-6 w-14 h-14 bg-gym-accent rounded-full flex items-center justify-center text-primary shadow-[0_8px_20px_rgba(213,255,64,0.4)] active:scale-95 transition-transform hover:bg-gym-accent-bright">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h1v1H7z"/><path d="M7 12h1v1H7z"/><path d="M7 16h1v1H7z"/><path d="M12 7h1v1h-1z"/><path d="M12 12h1v1h-1z"/><path d="M12 16h1v1h-1z"/><path d="M16 7h1v1h-1z"/><path d="M16 12h1v1h-1z"/><path d="M16 16h1v1h-1z"/>
              </svg>
            </Link>

            <NavItem to="/auth/login" icon="credit-card" label="Pay" active={isActive('/pay')} />
            <NavItem to="/auth/login" icon="user" label="Profile" active={isActive('/profile')} />
          </nav>
        )}
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string; icon: string; label: string; active?: boolean }) {
  const icons: Record<string, any> = {
    home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    'credit-card': <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>,
    user: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  };

  return (
    <Link to={to} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-gym-accent' : 'text-subtle hover:text-foreground'}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icons[icon]}
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </Link>
  );
}
