import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/m')({
  component: MemberDashboard,
});

function MemberDashboard() {
  return (
    <div className="space-y-6 pt-4 relative z-10">
      {/* Welcome & Quick Stats */}
      <section className="bg-gym-accent rounded-2xl p-6 text-primary overflow-hidden relative group">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold leading-tight mb-1">Hello, Member!</h2>
          <p className="text-sm font-medium mb-4 opacity-90">Keep pushing your limits today.</p>
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold opacity-70">Next Due</p>
              <p className="text-lg font-bold">Aug 15</p>
            </div>
            <div className="w-px h-10 bg-primary/20" />
            <div>
              <p className="text-[10px] uppercase font-bold opacity-70">Attendance</p>
              <p className="text-lg font-bold">12 Days</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-full opacity-20 pointer-events-none">
           <svg viewBox="0 0 100 100" fill="currentColor"><circle cx="80" cy="50" r="40" /></svg>
        </div>
      </section>

      {/* Main Actions */}
      <section className="grid grid-cols-2 gap-3">
        <button className="bg-gym-surface-raised border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-gym-surface-muted transition-colors group">
          <div className="w-10 h-10 rounded-full bg-gym-accent/10 flex items-center justify-center text-gym-accent group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <span className="text-xs font-bold">Payments</span>
        </button>
        <button className="bg-gym-surface-raised border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-gym-surface-muted transition-colors group">
          <div className="w-10 h-10 rounded-full bg-gym-accent/10 flex items-center justify-center text-gym-accent group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          </div>
          <span className="text-xs font-bold">Calendar</span>
        </button>
      </section>

      {/* Profile/Membership Info */}
      <section className="bg-gym-surface-raised border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Membership</h3>
          <span className="px-2 py-0.5 bg-gym-accent/20 text-gym-accent rounded text-[10px] font-bold">PRO PLAN</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-subtle">Status</span>
            <span className="font-bold text-gym-accent">Active</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-subtle">Joined</span>
            <span className="font-bold text-foreground">Jan 12, 2024</span>
          </div>
        </div>
      </section>

      {/* Recent Activity placeholder */}
      <section className="space-y-4">
         <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
         <div className="bg-gym-surface-raised rounded-2xl p-4 border border-white/5 text-center py-8">
            <p className="text-subtle text-xs">No recent activity to show.</p>
         </div>
      </section>
    </div>
  );
}
