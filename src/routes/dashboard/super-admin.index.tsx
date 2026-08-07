import { createFileRoute } from '@tanstack/react-router';
import { SuperAdminDashboard } from './super-admin';

export const Route = createFileRoute('/dashboard/super-admin/')({
  component: SuperAdminDashboard,
});
