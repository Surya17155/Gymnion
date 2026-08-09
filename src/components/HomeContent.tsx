import { useState } from "react";
import { Link } from "@tanstack/react-router";
import gymHeroAsset from "@/assets/gym-hero.png.asset.json";

export function LoginDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-gym-surface-raised rounded-t-[32px] p-8 z-[70] shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col gap-6 border-t border-white/10">
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-2" />
        
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">Get Started</h3>
          <p className="text-sm text-muted-foreground">Choose how you want to use GymSync</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/auth/login"
            search={{ redirect: undefined }}
            className="group relative flex flex-col gap-1 p-5 bg-background border border-white/5 rounded-2xl hover:border-gym-accent/50 transition-all active:scale-[0.98]"
            onClick={onClose}
          >
            <span className="text-lg font-bold text-foreground group-hover:text-gym-accent transition-colors">Join as Member</span>
            <span className="text-xs text-muted-foreground">Check in, track workouts, and pay fees.</span>
          </Link>

          <Link 
            to="/auth/login"
            search={{ redirect: undefined }}
            className="group relative flex flex-col gap-1 p-5 bg-background border border-white/5 rounded-2xl hover:border-gym-accent/50 transition-all active:scale-[0.98]"
            onClick={onClose}
          >
            <span className="text-lg font-bold text-foreground group-hover:text-gym-accent transition-colors">Join as Admin</span>
            <span className="text-xs text-muted-foreground">Manage your gym, members, and revenue.</span>
          </Link>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mt-2"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

export function HomeContent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Hero Image - Full screen background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={gymHeroAsset.url} 
          alt="GymSync Hero" 
          className="w-full h-full object-cover"
        />
        {/* Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-16 gap-10">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gym-accent/20 border border-gym-accent/30 backdrop-blur-md">
             <div className="w-2 h-2 rounded-full bg-gym-accent animate-pulse" />
             <span className="text-[10px] font-black text-gym-accent uppercase tracking-[0.2em]">Pulse AI Gym</span>
          </div>
          
          <h1 className="text-6xl font-black italic tracking-tighter leading-[0.85] text-white drop-shadow-2xl">
            STRONGER<br />
            <span className="text-gym-accent">MEMBERS.</span><br />
            SMARTER<br />
            MANAGEMENT.
          </h1>
          
          <p className="text-sm text-subtle/90 max-w-[280px] leading-relaxed font-medium">
            GymSync helps gym owners track attendance, manage members, and grow their business.
          </p>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-full bg-gym-accent text-primary h-16 rounded-pill font-black text-lg hover:bg-gym-accent-bright transition-all shadow-[0_16px_32px_rgba(213,255,64,0.3)] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider"
        >
          Get Started
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>

      <LoginDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
