import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/m')({
  component: () => <div>Member Dashboard</div>,
});
