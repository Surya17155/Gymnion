import { createFileRoute } from '@tanstack/react-router';
import { SuperAdminGyms } from './super-admin.gyms';

export const Route = createFileRoute('/dashboard/super-admin/gyms/')({
  component: SuperAdminGyms,
});
