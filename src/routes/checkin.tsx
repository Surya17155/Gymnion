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
      // After successful action, clear scan state if we were scanning
      if (shouldScan) {
        setTimeout(() => navigate({ to: '/dashboard/m' }), 2000);
      }
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
    if (shouldScan && effectiveGymId && statusData && !mutation.isPending && !mutation.isSuccess) {
      handleAction();
    }
  }, [shouldScan, effectiveGymId, statusData]);

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
          {shouldScan ? 'Scanning QR Code' : 'Gym Entry'}
        </h1>
        <p className="text-[#C0C2B8] max-w-[280px] mx-auto">
          {isCheckedIn 
            ? `Checked in at ${statusData.check_in_at ? format(new Date(statusData.check_in_at), 'hh:mm a') : 'N/A'}`
            : 'Scan your gym\'s QR code to record attendance.'}
        </p>
      </div>

      <div className="w-full max-w-sm aspect-square bg-[#1e201d] border border-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden">
        {shouldScan && !effectiveGymId ? (
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
              <div className={`w-48 h-48 border-2 ${mutation.isPending ? 'border-[#B7FF1E] animate-pulse' : 'border-dashed border-[#B7FF1E]/30'} rounded-2xl flex items-center justify-center`}>
                {mutation.isPending ? (
                  <div className="w-12 h-12 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-[10px] font-bold text-[#B7FF1E] tracking-[0.2em] uppercase">
                    {effectiveGymId ? (isCheckedIn ? 'Active Session' : 'Ready') : 'Awaiting Scan'}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {effectiveGymId && (
        <button 
          onClick={handleAction}
          disabled={mutation.isPending}
          className={`w-full max-w-sm ${isCheckedIn ? 'bg-white/10 text-white' : 'bg-[#B7FF1E] text-[#293500]'} h-14 rounded-full font-bold shadow-[0_8px_30px_rgba(213,255,64,0.3)] hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50`}
        >
          {mutation.isPending ? 'Processing...' : (isCheckedIn ? 'Check Out' : 'Check In Now')}
        </button>
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

