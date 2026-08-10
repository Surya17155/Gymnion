import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminDashboard } from './admin';
import { getAdminStats, getRecentActivity, getGymDetails } from '@/lib/auth.functions';

export const Route = createFileRoute('/dashboard/admin/')({
  component: AdminDashboard,
  loader: async ({ context }) => {
    try {
      // Preload data needed for the dashboard
      const gym = await context.queryClient.ensureQueryData({
        queryKey: ['admin-gym-settings'],
        queryFn: () => getGymDetails({ data: undefined })
      });
      
      if (gym?.id) {
        await Promise.all([
          context.queryClient.ensureQueryData({
            queryKey: ['admin-stats', gym.id],
            queryFn: () => getAdminStats({ data: { gymId: gym.id } })
          }),
          context.queryClient.ensureQueryData({
            queryKey: ['admin-activity', gym.id],
            queryFn: () => getRecentActivity({ data: { gymId: gym.id } })
          })
        ]);
      }
    } catch (error: any) {
      const errorStr = String(error);
      if (errorStr.includes('Unauthorized') || errorStr.includes('401') || errorStr.includes('expired')) {
        console.warn("Unauthorized in admin dashboard loader, redirecting to login");
        throw redirect({
          to: '/auth/login',
          search: { 
            redirect: '/dashboard/admin',
            error: encodeURIComponent("Your session has expired. Please sign in again.")
          }
        });
      }
      // Re-throw if it's not an auth error, so the error boundary can catch it
      throw error;
    }
  }
});
