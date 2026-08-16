import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails, getCurrentGymId } from '@/lib/auth.functions';
import { regenerateGymQR } from '@/lib/gyms.functions';
import { checkGymSubscription } from '@/lib/subscription.functions';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export const Route = createFileRoute('/dashboard/admin/qr-management')({
  component: QRManagement,
  loader: async ({ context }) => {
    const gym = await context.queryClient.ensureQueryData({
      queryKey: ['admin-gym-details'],
      queryFn: () => getGymDetails({ data: undefined })
    });
    if (gym?.id) {
      const today = new Date().toISOString().split('T')[0];
      await context.queryClient.prefetchQuery({
        queryKey: ['gym-attendance-today', gym.id],
        queryFn: async () => {
          const { count } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gym.id)
            .gte('check_in_at', `${today}T00:00:00`);
          return count || 0;
        }
      });
    }
  }
});

function QRManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getGymDetailsFn = useServerFn(getGymDetails);
  const getGymIdFn = useServerFn(getCurrentGymId);
  const regenerateQR = useServerFn(regenerateGymQR);
  const checkSubscriptionFn = useServerFn(checkGymSubscription);
  
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { data: gymId } = useQuery({
    queryKey: ['current-gym-id'],
    queryFn: () => getGymIdFn({ data: undefined }),
  });

  const { data: subStatus } = useQuery({
    queryKey: ['gym-subscription-status', gymId],
    queryFn: () => checkSubscriptionFn({ data: undefined }),
    enabled: !!gymId,
  });

  const isExpired = subStatus?.isExpired;

  const { data: gym, isPending: isGymPending, error: gymError } = useQuery({
    queryKey: ['admin-gym-details'],
    queryFn: () => getGymDetailsFn({ data: undefined }),
    retry: false,
    staleTime: 60000,
  });

  const { data: attendanceCount } = useQuery({
    queryKey: ['gym-attendance-today', gym?.id],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gym!.id)
          .gte('check_in_at', `${today}T00:00:00`);
        
        if (error) {
          console.error("Supabase attendance query error:", error);
          return 0;
        }
        return count || 0;
      } catch (err) {
        console.error("Attendance query catch block:", err);
        return 0;
      }
    },
    enabled: !!gym?.id,
  });

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${gym?.name || 'gym'}-checkin-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerate = async () => {
    if (!gym?.id) return;
    try {
      setIsRegenerating(true);
      const updatedGym = await regenerateQR({ data: gym.id });
      const checkinUrl = `${window.location.origin}/checkin?gym=${updatedGym.id}&code=${updatedGym.gym_code}`;
      const url = await QRCode.toDataURL(checkinUrl, { width: 400, margin: 2 });
      setQrUrl(url);
      toast.success("Gym access code regenerated successfully!");
    } catch (error) {
      toast.error("Failed to regenerate gym code");
      console.error(error);
    } finally {
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (gym?.id && gym.gym_code) {
      const checkinUrl = `${window.location.origin}/checkin?gym=${gym.id}&code=${gym.gym_code}`;
      QRCode.toDataURL(checkinUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then(url => {
        if (active) setQrUrl(url);
      }).catch(err => {
        console.error("QR Code generation error:", err);
      });
    }
    return () => { active = false; };
  }, [gym?.id, gym?.gym_code]);

  if (isGymPending) {
    return (
      <div className="min-h-screen bg-[#0D0F0C] text-white flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#858A7D]">Loading gym details...</p>
      </div>
    );
  }

  if (gymError || !gym?.id) {
    return (
      <div className="min-h-screen bg-[#0D0F0C] text-white flex flex-col items-center justify-center p-4">
        <span className="material-symbols-outlined text-[#FF5964] text-[48px] mb-4">error</span>
        <h1 className="text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6 text-center max-w-[280px]">
          {gymError instanceof Error ? gymError.message : "We couldn't find a gym associated with your account."}
        </p>
        <button
          onClick={() => navigate({ to: '/dashboard/admin' })}
          className="bg-[#B7FF1E] text-black px-8 py-3 rounded-full font-bold active:scale-95 transition-transform"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins'] ${isRegenerating ? 'tab-bar-hidden' : ''} ${isExpired ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
      <div 
        className="fixed top-0 left-0 right-0 h-[150px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(183, 255, 30, 0.08) 0%, transparent 70%)'
        }}
      />

      <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative z-10 flex flex-col">
        <header className="flex items-center h-[64px] w-full sticky top-0 z-40 bg-transparent px-[20px] md:px-0">
          <Link 
            to="/dashboard/admin/settings" 
            className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center border border-white/5"
          >
            <span className="material-symbols-outlined text-white text-[20px]">arrow_back</span>
          </Link>
          <div className="flex-1 text-center">
            <h2 className="text-[18px] font-bold text-white uppercase tracking-wider">Access Control</h2>
            <p className="text-[12px] text-[#858A7D]">Manage QR codes for facility entry points.</p>
          </div>
        </header>

        <main className="flex-1 px-[20px] flex flex-col gap-[24px] py-4 md:px-0">
          <div>
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white mb-1">{"\n"}</h1>
          </div>

          <section className="bg-[#121411] rounded-xl border border-white/5 overflow-hidden relative group"
            style={{
              background: 'linear-gradient(135deg, rgba(183, 255, 30, 0.15) 0%, rgba(18, 20, 17, 0) 100%)'
            }}
          >
            <div className="p-[16px] flex flex-col items-center relative z-10">
              <div className="w-full flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Main Entrance</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#B7FF1E] shadow-[0_0_20px_rgba(183, 255, 30, 0.2)]"></span>
                    <span className="text-[11px] font-bold text-[#B7FF1E] uppercase tracking-wider">Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg mb-6 shadow-[0_0_30px_rgba(183, 255, 30, 0.15)] relative">
                {qrUrl ? (
                  <img 
                    src={qrUrl}
                    alt="Gym Check-in QR"
                    className="w-48 h-48 object-contain mix-blend-multiply"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleRegenerate}
                  className="flex-1 bg-[#1e201d] h-12 rounded-full flex items-center justify-center gap-2 text-[#B7FF1E] text-[11px] font-bold uppercase border border-white/5 hover:bg-[#252724] transition-colors disabled:opacity-50"
                  disabled={isRegenerating}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isRegenerating ? 'animate-spin' : ''}`}>refresh</span>
                  {isRegenerating ? 'Working...' : 'Regenerate'}
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex-1 bg-[#B7FF1E] h-12 rounded-full flex items-center justify-center gap-2 text-[#293500] text-[11px] font-bold uppercase shadow-lg hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </button>
              </div>
            </div>

            <div className="bg-[#1e201d]/50 border-t border-white/5 py-3 px-[16px] flex justify-between items-center text-[12px]">
              <span className="text-[#858A7D]">Real-time tracking</span>
              <span className="text-white font-semibold">{attendanceCount || 0} scans today</span>
            </div>
          </section>
        </main>
      </div>

      <nav className={`bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-md max-w-[480px] transition-transform duration-300 nav-bar-transition`}>
        <Link 
          to="/dashboard/admin" 
          activeOptions={{ exact: true }}
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          disabled={!!isExpired}
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>dashboard</span>
              <span className="text-[11px] font-semibold leading-[14px]">Dashboard</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/members" 
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          disabled={!!isExpired}
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>group</span>
              <span className="text-[11px] font-semibold leading-[14px]">Members</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/payments"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          disabled={!!isExpired}
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>receipt_long</span>
              <span className="text-[11px] font-semibold leading-[14px]">Payments</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/attendance"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          disabled={!!isExpired}
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>event_available</span>
              <span className="text-[11px] font-semibold leading-[14px]">Attendance</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/settings"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>settings</span>
              <span className="text-[11px] font-semibold leading-[14px]">Settings</span>
            </>
          )}
        </Link>
      </nav>
    </div>
  );
}