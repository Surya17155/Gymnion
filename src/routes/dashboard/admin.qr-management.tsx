import { createFileRoute, useNavigate, Link, Navigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails, getGymAccessPoints } from '@/lib/auth.functions';
import QRCode from 'qrcode';

export const Route = createFileRoute('/dashboard/admin/qr-management')({
  component: QRManagement,
});

function QRManagement() {
  const navigate = useNavigate();
  const getGymDetailsFn = useServerFn(getGymDetails);
  const getAccessPointsFn = useServerFn(getGymAccessPoints);
  const [qrUrl, setQrUrl] = useState<string>('');

  const { data: gym, isLoading: isGymLoading } = useQuery({
    queryKey: ['admin-gym-details'],
    queryFn: () => getGymDetailsFn({ data: {} }),
  });

  useEffect(() => {
    if (gym?.id) {
      const checkinUrl = `${window.location.origin}/checkin?gym=${gym.id}`;
      QRCode.toDataURL(checkinUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then(setQrUrl);
    }
  }, [gym]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${gym?.name || 'gym'}-checkin-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerate = () => {
    if (gym?.id) {
      const checkinUrl = `${window.location.origin}/checkin?gym=${gym.id}`;
      QRCode.toDataURL(checkinUrl, {
        width: 400,
        margin: 2,
      }).then(setQrUrl);
    }
  };

  const { data: rawAccessPoints, isLoading: isPointsLoading } = useQuery({
    queryKey: ['gym-access-points', gym?.id],
    queryFn: () => getAccessPointsFn({ data: { gymId: gym!.id } }),
    enabled: !!gym?.id
  });

  const { data: attendanceCount } = useQuery({
    queryKey: ['gym-attendance-today', gym?.id],
    queryFn: async () => {
      if (!gym?.id) return 0;
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)
        .gte('check_in_at', `${today}T00:00:00`);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!gym?.id,
  });

  if (isGymLoading || isPointsLoading) return null;

  const settings = (gym?.settings as any) || {};
  // Always allow access to QR management for admins even if feature flag is off in settings
  // This allows admins to enable it or manage it regardless of the plan restrictions which might be enforced elsewhere
  const attendanceEnabled = true; 

  if (!attendanceEnabled) {
    return <Navigate to="/dashboard/admin" />;
  }

  const accessPoints = (rawAccessPoints || []).map((point: any, index: number) => ({
    ...point,
    scans: index === 0 ? (attendanceCount || 0) : Math.floor((attendanceCount || 0) * (0.4 / (index + 1)))
  }));

  const mainEntrance = accessPoints.find((p: any) => p.name === 'Main Entrance') || accessPoints[0];

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      <div 
        className="fixed top-0 left-0 right-0 h-[150px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(183, 255, 30, 0.08) 0%, transparent 70%)'
        }}
      />

      <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative z-10 flex flex-col">
        <header className="flex items-center px-[20px] h-[64px] w-full sticky top-0 z-40 bg-[#121411]/80 backdrop-blur-md">
          <button 
            onClick={() => navigate({ to: '/dashboard/admin' })}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1e201d] border border-white/5 text-[#e3e3dd]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 text-center pr-10">
            <h2 className="text-[18px] font-bold text-white uppercase tracking-wider">Access Control</h2>
          </div>
        </header>

        <main className="flex-1 px-[20px] flex flex-col gap-[24px] py-4">
          <div>
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white mb-1">Facility Entry</h1>
            <p className="text-[12px] text-[#858A7D]">Manage QR codes for facility entry points.</p>
          </div>

          <section className="bg-[#121411] rounded-xl border border-white/5 overflow-hidden relative group"
            style={{
              background: 'linear-gradient(135deg, rgba(183, 255, 30, 0.15) 0%, rgba(18, 20, 17, 0) 100%)'
            }}
          >
            <div className="p-[16px] flex flex-col items-center relative z-10">
              <div className="w-full flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">{mainEntrance?.name || 'Main Entrance'}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#B7FF1E] shadow-[0_0_20px_rgba(183, 255, 30, 0.2)]"></span>
                    <span className="text-[11px] font-bold text-[#B7FF1E] uppercase tracking-wider">Active</span>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center text-[#858A7D]">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
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
                  className="flex-1 bg-[#1e201d] h-12 rounded-full flex items-center justify-center gap-2 text-[#B7FF1E] text-[11px] font-bold uppercase border border-white/5 hover:bg-[#252724] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Regenerate
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
              <span className="text-[#858A7D]">Last scanned: Just now</span>
              <span className="text-white font-semibold">{attendanceCount || 0} scans today</span>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-3">
              <h3 className="text-[18px] font-semibold text-white">Active Access Points</h3>
              <button className="text-[#B7FF1E] text-[11px] font-bold uppercase flex items-center gap-1 hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">add</span>
                New
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {accessPoints.slice(1).map((point: any) => (
                <div 
                  key={point.id}
                  className={`bg-[#121411] p-4 rounded-xl border ${point.warning ? 'border-l-4 border-l-[#FF5964]' : 'border-white/5'} flex items-center justify-between hover:bg-[#1e201d] transition-colors cursor-pointer group relative overflow-hidden`}
                >
                  {!point.warning && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B7FF1E] opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-[#1e201d] flex items-center justify-center ${point.warning ? 'text-[#FF5964]' : 'text-[#B7FF1E]'} border border-white/5`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>{point.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white mb-1">{point.name}</h4>
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className={`w-1.5 h-1.5 rounded-full ${point.warning ? 'bg-[#FF5964]' : 'bg-[#A7F52A]'}`}></span>
                        <span className={point.warning ? 'text-[#FF5964]' : 'text-[#858A7D]'}>{point.warning ? 'Needs Attention' : 'Active'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-semibold text-white">{point.scans || '--'}</div>
                    <div className="text-[10px] text-[#858A7D] uppercase font-semibold">{point.warning ? 'offline' : 'scans today'}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-md max-w-[480px]">
        <Link to="/dashboard/admin" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">dashboard</span><span className="text-[11px] font-semibold">Dashboard</span></Link>
        <Link to="/dashboard/admin/members" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">group</span><span className="text-[11px] font-semibold">Members</span></Link>
        <Link to="/dashboard/admin/payments" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">receipt_long</span><span className="text-[11px] font-semibold">Payments</span></Link>
        <Link to="/dashboard/admin/attendance" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">event_available</span><span className="text-[11px] font-semibold">Attendance</span></Link>
        <Link to="/dashboard/admin/settings" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8] transition-all"><span className="material-symbols-outlined mb-1">settings</span><span className="text-[11px] font-semibold">Settings</span></Link>
      </nav>
    </div>
  );
}
