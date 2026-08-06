import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="py-6 space-y-8">
      {/* Phase Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Phase 6 — Payments</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Monthly fee cycle generation → paid/pending/overdue dashboard → manual (cash/UPI) payment recording → Razorpay connect for the gym → member Pay Now with hosted checkout → verified webhook updating payment status → receipts and admin notification.
        </p>
      </div>
      
      {/* Attendance Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-5 rounded-3xl bg-gym-surface-raised border border-white/5 space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-gym-accent group-hover:scale-110 transition-transform">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">In Gym Now</span>
          <div className="text-3xl font-black">18</div>
        </div>
        <div className="p-5 rounded-3xl bg-gym-surface-raised border border-white/5 space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-gym-accent group-hover:scale-110 transition-transform">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today's Visits</span>
          <div className="text-3xl font-black text-gym-accent">42</div>
        </div>
      </div>

      {/* Contribution Calendar Placeholder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Gym Usage (Last 30 Days)</h3>
        </div>
        <div className="p-5 rounded-3xl bg-gym-surface-raised border border-white/5 overflow-hidden">
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 28 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-sm flex-shrink-0 ${
                  i % 7 === 0 ? 'bg-gym-accent' : 
                  i % 5 === 0 ? 'bg-gym-accent/60' : 
                  i % 3 === 0 ? 'bg-gym-accent/30' : 'bg-gym-surface-muted'
                }`} 
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[9px] font-bold text-subtle uppercase">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-sm bg-gym-surface-muted" />
              <div className="w-2 h-2 rounded-sm bg-gym-accent/30" />
              <div className="w-2 h-2 rounded-sm bg-gym-accent/60" />
              <div className="w-2 h-2 rounded-sm bg-gym-accent" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Live Activity</h3>
        <div className="space-y-3">
          {[
            { name: 'Arjun Singh', action: 'Checked In', time: '2m ago', active: true },
            { name: 'Priya Sharma', action: 'Checked Out', time: '15m ago', active: false },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gym-surface-raised border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activity.active ? 'bg-gym-accent animate-pulse' : 'bg-muted-foreground'}`} />
                <div>
                  <div className="text-sm font-bold">{activity.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{activity.action}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-subtle">{activity.time}</span>
            </div>
          ))}
          <button className="w-full py-3 text-[10px] font-bold text-gym-accent uppercase tracking-widest border border-dashed border-gym-accent/20 rounded-2xl hover:bg-gym-accent/5 transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
}

