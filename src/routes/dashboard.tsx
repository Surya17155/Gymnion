import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <Outlet />
  );
}
