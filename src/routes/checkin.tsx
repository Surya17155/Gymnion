import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServerFn } from '@tanstack/react-start';
import { recordAttendance, getMyAttendanceStatus } from '@/lib/members.functions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { z } from 'zod';

export const Route = createFileRoute('/checkin')({
  validateSearch: (search) => z.object({
    gym: z.string().optional()
  }).parse(search),
  component: CheckInPage,
});

function CheckInPage() {
  const { gym: gymId } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const recordAttendanceFn = useServerFn(recordAttendance);
  const getStatusFn = useServerFn(getMyAttendanceStatus);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
      if (!session && gymId) {
        navigate({ to: '/auth/login', search: { redirect: `/checkin?gym=${gymId}` } });
      }
    });
  }, [gymId, navigate]);

  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['my-attendance-status', gymId],
    queryFn: () => getStatusFn({ data: { gymId: gymId! } }),
    enabled: !!gymId && !!session,
  });

  const mutation = useMutation({
    mutationFn: async (action: 'in' | 'out') => {
      return recordAttendanceFn({ data: { gymId: gymId!, action } });
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['my-attendance-status', gymId] });
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Attendance recording failed");
    }
  });

  if (loadingSession || (session && isLoadingStatus)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!gymId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-xl font-bold text-white">Invalid Gym Code</h1>
        <p className="text-muted-foreground">Please scan a valid gym QR code.</p>
        <Link to="/dashboard/m" className="text-gym-accent font-bold">Back to Dashboard</Link>
      </div>
    );
  }

  const isCheckedIn = statusData?.status === 'in';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-gym-accent/10 flex items-center justify-center text-gym-accent mb-4">
        <span className="material-symbols-outlined text-[32px]">
          {isCheckedIn ? 'logout' : 'login'}
        </span>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold italic tracking-tight uppercase">Gym Entry</h1>
        <p className="text-muted-foreground max-w-[280px] mx-auto">
          {isCheckedIn 
            ? `Checked in at ${format(new Date(statusData.check_in_at!), 'hh:mm a')}`
            : 'Scan or tap below to record your attendance.'}
        </p>
      </div>

      <div className="w-full max-w-sm aspect-square bg-gym-surface-raised border border-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-hero-glow opacity-20 group-hover:opacity-30 transition-opacity" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className={`w-48 h-48 border-2 ${mutation.isPending ? 'border-gym-accent animate-pulse' : 'border-dashed border-gym-accent/30'} rounded-2xl flex items-center justify-center`}>
            {mutation.isPending ? (
              <div className="w-12 h-12 border-4 border-gym-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-[10px] font-bold text-gym-accent tracking-[0.2em] uppercase">
                {isCheckedIn ? 'Active Session' : 'Ready'}
              </span>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={() => mutation.mutate(isCheckedIn ? 'out' : 'in')}
        disabled={mutation.isPending}
        className={`w-full max-w-sm ${isCheckedIn ? 'bg-white/10 text-white' : 'bg-gym-accent text-primary'} h-14 rounded-pill font-bold shadow-[0_8px_30px_rgba(213,255,64,0.3)] hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50`}
      >
        {isCheckedIn ? 'Check Out' : 'Check In Now'}
      </button>

      <Link to="/dashboard/m" className="text-sm text-muted-foreground hover:text-white transition-colors">
        Go to Home
      </Link>
    </div>
  );
}
