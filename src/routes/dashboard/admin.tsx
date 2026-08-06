import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="py-6 space-y-8">
      {/* Phase Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Phase 8 — Reminders, exports, polish</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Single + bulk payment reminders, CSV exports (members / payments / attendance with date range), in-app notification bell, empty/loading/error states, accessibility pass, SEO metadata per route.
        </p>
      </div>
      
      {/* Payment Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-5 rounded-3xl bg-gym-surface-raised border border-white/5 space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-gym-accent group-hover:scale-110 transition-transform">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending</span>
          <div className="text-3xl font-black">₹12,400</div>
        </div>
        <div className="p-5 rounded-3xl bg-gym-surface-raised border border-white/5 space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-gym-accent group-hover:scale-110 transition-transform">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Received</span>
          <div className="text-3xl font-black text-gym-accent">₹48,200</div>
        </div>
      </div>

      {/* Payment Actions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Payment Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          <button className="flex items-center justify-between p-5 rounded-3xl bg-gym-surface-raised border border-white/5 hover:bg-gym-surface-muted transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gym-accent/10 flex items-center justify-center text-gym-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <div className="font-bold group-hover:text-gym-accent transition-colors">Record Payment</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Cash / UPI / Transfer</div>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>

          <button className="flex items-center justify-between p-5 rounded-3xl bg-gym-surface-raised border border-white/5 hover:bg-gym-surface-muted transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gym-accent/10 flex items-center justify-center text-gym-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div>
                <div className="font-bold group-hover:text-gym-accent transition-colors">Razorpay Connect</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Online Payment Setup</div>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Recent Transactions</h3>
        <div className="space-y-3">
          {[
            { name: 'Arjun Singh', action: 'Monthly Fee', amount: '₹2,500', time: '2m ago', status: 'paid' },
            { name: 'Priya Sharma', action: 'Personal Training', amount: '₹5,000', time: '1h ago', status: 'pending' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gym-surface-raised border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${tx.status === 'paid' ? 'bg-gym-accent' : 'bg-yellow-500'}`} />
                <div>
                  <div className="text-sm font-bold">{tx.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{tx.action}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">{tx.amount}</div>
                <div className="text-[10px] font-bold text-subtle uppercase">{tx.time}</div>
              </div>
            </div>
          ))}
          <button className="w-full py-3 text-[10px] font-bold text-gym-accent uppercase tracking-widest border border-dashed border-gym-accent/20 rounded-2xl hover:bg-gym-accent/5 transition-colors">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}

