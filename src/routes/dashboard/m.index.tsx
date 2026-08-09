import { createFileRoute } from '@tanstack/react-router';
import { MemberDashboard } from './m';

export const Route = createFileRoute('/dashboard/m/')({
  component: MemberDashboard,
});
