import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/login/')({
  beforeLoad: () => {
    // Redirect away from login to the admin dashboard for development
    throw redirect({ to: '/dashboard/admin' });
  },
  component: () => null,
});
