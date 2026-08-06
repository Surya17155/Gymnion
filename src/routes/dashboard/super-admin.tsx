import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/super-admin')({
  component: () => <div>Super Admin Dashboard</div>,
});
