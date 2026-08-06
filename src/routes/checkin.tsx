import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/checkin')({
  component: CheckInPage,
});

function CheckInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-gym-accent/10 flex items-center justify-center text-gym-accent mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 7v10"/><path d="M7 12h10"/>
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold italic tracking-tight">PULSE AI GYM</h1>
        <p className="text-muted-foreground max-w-[280px] mx-auto">
          Scan the gym QR code to check in or out and track your activity.
        </p>
      </div>
      <div className="w-full max-w-sm aspect-square bg-gym-surface-raised border border-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-hero-glow opacity-20 group-hover:opacity-30 transition-opacity" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-48 h-48 border-2 border-dashed border-gym-accent/30 rounded-2xl flex items-center justify-center">
            <span className="text-[10px] font-bold text-gym-accent tracking-[0.2em] uppercase">Ready to Scan</span>
          </div>
        </div>
      </div>
      <button className="w-full max-w-sm bg-gym-accent text-primary h-14 rounded-pill font-bold shadow-[0_8px_30px_rgba(213,255,64,0.3)] hover:scale-[1.02] transition-transform active:scale-95">
        Check In Now
      </button>
    </div>
  );
}
