import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/super-admin')({
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  return (
    <div className="flex justify-center min-h-screen bg-[#121411]">
      <div 
        className="fixed top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% -20%, rgba(183, 255, 30, 0.15), transparent 70%)'
        }}
      />
      <main className="w-full max-w-[480px] min-h-screen relative flex flex-col z-10 px-5">
        <div className="py-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Phase 3 — Super Admin</h2>
        <p className="text-sm text-muted-foreground">
          Dashboard (gyms, members, MRR, pending count) → Pending approvals (approve/reject + email) → All gyms table → Gym detail (metadata only, no member PII) → suspend/reactivate.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 rounded-2xl bg-gym-surface-raised border border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-gym-accent">
            <div className="w-10 h-10 rounded-full bg-gym-accent/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              </svg>
            </div>
            <h3 className="font-bold text-lg">Super Admin Overview</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This module will manage platform-wide gym registrations, subscription approvals, and system health monitoring.
          </p>
          <div className="pt-2">
            <button className="bg-gym-accent text-primary px-6 py-2 rounded-pill font-bold text-sm">
              View Pending Approvals
            </button>
          </div>
        </div>
      </div>
      </div>
      </main>
    </div>
  );
}
