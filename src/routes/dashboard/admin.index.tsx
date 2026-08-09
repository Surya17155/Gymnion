import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from './admin';
import { getAdminStats, getRecentActivity, getGymDetails } from '@/lib/auth.functions';

export const Route = createFileRoute('/dashboard/admin/')({
  component: AdminDashboard,
  loader: async ({ context }) => {
    // Preload data needed for the dashboard
    const gym = await context.queryClient.ensureQueryData({
      queryKey: ['admin-gym-settings'],
      queryFn: () => getGymDetails({ data: {} })
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
  }
});
