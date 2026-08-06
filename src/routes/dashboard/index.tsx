import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div className="py-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Select a module to continue</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 rounded-2xl bg-gym-surface-raised border border-white/5 space-y-2">
          <h3 className="font-bold">Welcome to GymSync</h3>
          <p className="text-sm text-muted-foreground">Your role-based dashboard will appear here once your account is verified.</p>
        </div>
      </div>
    </div>
  );
}
