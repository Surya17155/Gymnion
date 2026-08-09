import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from './admin';

export const Route = createFileRoute('/dashboard/admin/')({
  component: AdminDashboard,
});
