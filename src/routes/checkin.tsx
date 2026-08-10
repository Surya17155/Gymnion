import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServerFn } from '@tanstack/react-start';
import { recordAttendance, getMyAttendanceStatus } from '@/lib/members.functions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { z } from 'zod';
import { Scanner } from '@yudiel/react-qr-scanner';

export const Route = createFileRoute('/checkin')({
  validateSearch: (search) => z.object({
    gym: z.string().optional(),
    code: z.string().optional(),
    scan: z.string().optional()
  }).parse(search),
  component: CheckInPage,
});

function CheckInPage() {
  const { gym: gymId, code: gymCode, scan: shouldScan } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [scannedGymId, setScannedGymId] = useState<string | null>(null);
  const [scannedGymCode, setScannedGymCode] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  const recordAttendanceFn = useServerFn(recordAttendance);
  const getStatusFn = useServerFn(getMyAttendanceStatus);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
      if (!session) {
        const currentUrl = window.location.pathname + window.location.search;
        navigate({ to: '/auth/login', search: { redirect: currentUrl } });
      }
    });
  }, [navigate]);

  const effectiveGymId = gymId || scannedGymId;

  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['my-attendance-status', effectiveGymId],
    queryFn: () => getStatusFn({ data: { gymId: effectiveGymId! } }),
    enabled: !!effectiveGymId && !!session,
  });

  const mutation = useMutation({
    mutationFn: async (action: 'in' | 'out') => {
      return recordAttendanceFn({ 
        data: { 
          gymId: effectiveGymId!, 
          action, 
          code: gymCode || scannedGymCode || undefined 
        } 
      });
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['my-attendance-status', effectiveGymId] });
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      // Keep showing the status screen with the new data for a moment
      setTimeout(() => navigate({ to: '/dashboard/m' }), 4000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Attendance recording failed");
    }
  });

  const handleScan = useCallback((result: any) => {
    if (!result || !result[0]?.rawValue) return;
    
    try {
      const url = new URL(result[0].rawValue);
      const params = new URLSearchParams(url.search);
      const gId = params.get('gym');
      const gCode = params.get('code');
      
      if (gId) {
        setScannedGymId(gId);
        if (gCode) setScannedGymCode(gCode);
        toast.success("QR Scanned successfully!");
      } else {
        toast.error("Invalid QR Code: Gym ID missing");
      }
    } catch (e) {
      // If not a URL, try to parse as JSON or raw string
      toast.error("Invalid QR Code format");
    }
  }, []);

  const handleAction = () => {
    if (!effectiveGymId) return;
    const action = statusData?.status === 'in' ? 'out' : 'in';
    mutation.mutate(action);
  };

  // Automatically trigger action if we scanned a valid QR and have status
  useEffect(() => {
    if (effectiveGymId && statusData && !mutation.isPending && !mutation.isSuccess) {
      handleAction();
      // Reset shouldScan once we've triggered the action
      if (shouldScan) {
        navigate({ to: '/checkin', search: { gym: effectiveGymId, code: gymCode || scannedGymCode || undefined }, replace: true });
      }
    }
  }, [effectiveGymId, statusData]);

  if (loadingSession || (session && effectiveGymId && isLoadingStatus)) {
    return (
      <div className="min-h-screen bg-[#121411] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isCheckedIn = statusData?.status === 'in';

  return (
    <div className="min-h-screen bg-[#121411] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E] mb-4">
        <span className="material-symbols-outlined text-[32px]">
          {isCheckedIn ? 'logout' : 'login'}
        </span>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold italic tracking-tight uppercase text-white">
          {mutation.isSuccess 
            ? (isCheckedIn ? 'Check In Success' : 'Check Out Success')
            : (effectiveGymId && statusData && !shouldScan ? (isCheckedIn ? 'Checking Out...' : 'Checking In...') : 'Scanning QR Code')}
        </h1>
        <div className="flex flex-col gap-1">
          <p className="text-[#C0C2B8] max-w-[280px] mx-auto">
            {mutation.isSuccess 
              ? `You have successfully ${isCheckedIn ? 'checked in' : 'checked out'}.`
              : (effectiveGymId && statusData && !shouldScan
                  ? (isCheckedIn ? 'Recording your exit...' : 'Recording your entry...')
                  : 'Scan your gym\'s QR code to record attendance.')}
          </p>
          {mutation.isSuccess && (
            <p className="text-[#B7FF1E] font-mono text-sm font-bold">
              {format(new Date(), 'hh:mm:ss a')}
            </p>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm aspect-square bg-[#1e201d] border border-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden">
        {mutation.isSuccess ? (
          <div className="flex flex-col items-center gap-6 z-10 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-[#B7FF1E] flex items-center justify-center shadow-[0_0_30px_rgba(183,255,30,0.4)]">
              <span className="material-symbols-outlined text-[#293500] text-[48px]">check_circle</span>
            </div>
            <div className="text-center">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#C0C2B8] mb-1">Status Updated</p>
              <p className="text-white font-bold text-xl">{isCheckedIn ? 'Entrance Authorized' : 'Exit Recorded'}</p>
            </div>
          </div>
        ) : (!effectiveGymId || shouldScan) ? (
          <div className="w-full h-full relative">
            <Scanner
              onScan={handleScan}
              onError={(error) => {
                console.error(error);
                toast.error("Camera access denied or error occurred");
              }}
              styles={{
                container: { width: '100%', height: '100%' }
              }}
            />
            <div className="absolute inset-0 border-2 border-[#B7FF1E] rounded-3xl pointer-events-none animate-pulse">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#B7FF1E] shadow-[0_0_15px_#B7FF1E] animate-scan" />
            </div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-radial-gradient from-[#B7FF1E]/10 to-transparent opacity-20" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className={`w-48 h-48 border-2 border-[#B7FF1E] animate-pulse rounded-2xl flex items-center justify-center`}>
                <div className="w-12 h-12 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          </>
        )}
      </div>

      {effectiveGymId && !shouldScan && (
        <div className="w-full max-w-sm py-4">
           <div className="flex items-center justify-center gap-2 text-[#B7FF1E] animate-pulse">
             <span className="material-symbols-outlined">sync</span>
             <span className="font-bold uppercase tracking-widest text-xs">Processing...</span>
           </div>
        </div>
      )}

      <Link to="/dashboard/m" className="text-sm text-[#C0C2B8] hover:text-white transition-colors">
        Go to Home
      </Link>

      <style>{`
        @keyframes scan {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}

