import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="py-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Phase 4 — Gym Admin core</h2>
        <p className="text-sm text-muted-foreground">
          Dashboard cards + live activity feed → Fee plans CRUD → Members list with search/filters → Add/edit member (photo upload, invite email) → Member detail with attendance calendar and payment history.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-gym-surface-raised border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Members</span>
          <div className="text-xl font-bold">124</div>
        </div>
        <div className="p-4 rounded-2xl bg-gym-surface-raised border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Today's Revenue</span>
          <div className="text-xl font-bold text-gym-accent">₹4,500</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          <button className="flex items-center justify-between p-4 rounded-2xl bg-gym-surface-raised border border-white/5 hover:bg-gym-surface-muted transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gym-accent/10 flex items-center justify-center text-gym-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
                </svg>
              </div>
              <div>
                <div className="font-bold group-hover:text-gym-accent transition-colors">Add New Member</div>
                <div className="text-[10px] text-muted-foreground">Create profile & send invite</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>

          <button className="flex items-center justify-between p-4 rounded-2xl bg-gym-surface-raised border border-white/5 hover:bg-gym-surface-muted transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gym-accent/10 flex items-center justify-center text-gym-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <div className="font-bold group-hover:text-gym-accent transition-colors">Manage Fee Plans</div>
                <div className="text-[10px] text-muted-foreground">Monthly, Quarterly, Yearly</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
