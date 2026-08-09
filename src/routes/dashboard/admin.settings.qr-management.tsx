import { createFileRoute, useNavigate, Link, Navigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getGymDetails } from '@/lib/auth.functions';

export const Route = createFileRoute('/dashboard/admin/settings/qr-management')({
  component: QRManagement,
});

function QRManagement() {
  const navigate = useNavigate();

  const { data: gym, isLoading } = useQuery({
    queryKey: ['admin-gym-details'],
    queryFn: () => getGymDetails(),
  });

  if (isLoading) return null;

  const settings = (gym?.settings as any) || {};
  const attendanceEnabled = settings.features?.attendance_management !== false;

  if (!attendanceEnabled) {
    return <Navigate to="/dashboard/admin" />;
  }

  const { data: attendanceCount } = useQuery({
    queryKey: ['gym-attendance-today', gym?.id],
    queryFn: async () => {
      if (!gym?.id) return 0;
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)
        .gte('check_in', `${today}T00:00:00`);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!gym?.id,
  });

  // Mock data for access points as per design
  const accessPoints = [
    { id: 1, name: 'Main Entrance', status: 'Active', scans: attendanceCount || 0, icon: 'door_front' },
    { id: 2, name: 'Cardio Zone', status: 'Active', scans: Math.floor((attendanceCount || 0) * 0.4), icon: 'directions_run' },
    { id: 3, name: 'VIP Lounge', status: 'Active', scans: Math.floor((attendanceCount || 0) * 0.1), icon: 'workspace_premium' },
    { id: 4, name: 'Pool Area', status: 'Offline', scans: '--', icon: 'warning', warning: true },
  ];

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Top Glow Effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15) 0%, rgba(12, 20, 17, 0) 70%)'
        }}
      />

      {/* Main Container */}
      <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative z-10 flex flex-col">
        {/* Header */}
        <header className="flex items-center px-[20px] h-[64px] w-full sticky top-0 z-40 bg-[#121411]/80 backdrop-blur-md">
          <button 
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1e201d] border border-white/5 text-[#e3e3dd]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 text-center pr-10">
            <h2 className="text-[18px] font-bold text-white uppercase tracking-wider">Access Control</h2>
          </div>
        </header>

        <main className="flex-1 px-[20px] flex flex-col gap-[24px] py-4">
          {/* Title & Description */}
          <section>
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white mb-2">Facility Entry</h1>
            <p className="text-[14px] leading-[20px] text-[#858A7D]">Manage QR codes for facility entry points.</p>
          </section>

          {/* Master QR Card */}
          <section className="bg-[#1e201d] rounded-2xl border border-white/5 overflow-hidden relative group">
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(183, 255, 30, 0.2) 0%, transparent 100%)'
              }}
            />
            
            <div className="p-[20px] flex flex-col items-center relative z-10">
              <div className="w-full flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Main Entrance</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#B7FF1E] animate-pulse shadow-[0_0_10px_rgba(183,255,30,0.5)]"></span>
                    <span className="text-[11px] font-bold text-[#B7FF1E] uppercase tracking-wider">Active</span>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-[#333532] flex items-center justify-center text-[#858A7D]">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-6 rounded-2xl mb-6 shadow-[0_0_40px_rgba(183,255,30,0.1)] relative">
                {/* Corners */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#121411]/20"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#121411]/20"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#121411]/20"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#121411]/20"></div>
                
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=gymsync_checkin_${gym?.gym_code || 'DEMO'}`}
                  alt="Gym Check-in QR"
                  className="w-[180px] h-[180px] object-contain"
                />
              </div>

              <div className="flex gap-3 w-full">
                <button className="flex-1 bg-[#333532] h-12 rounded-full flex items-center justify-center gap-2 text-[#B7FF1E] text-[11px] font-bold uppercase border border-white/5 hover:bg-[#40423f] transition-colors">
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Regenerate
                </button>
                <button className="flex-1 bg-[#B7FF1E] h-12 rounded-full flex items-center justify-center gap-2 text-[#293500] text-[11px] font-bold uppercase shadow-[0_0_20px_rgba(183,255,30,0.2)] hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white/5 border-t border-white/5 py-4 px-[20px] flex justify-between items-center text-[12px]">
              <span className="text-[#858A7D]">Last scanned: Just now</span>
              <span className="text-white font-semibold">{attendanceCount || 0} scans today</span>
            </div>
          </section>

          {/* Access Points List */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[18px] font-semibold text-white">Access Points</h3>
              <button className="text-[#B7FF1E] text-[11px] font-bold uppercase flex items-center gap-1 hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">add</span>
                New Point
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {accessPoints.slice(1).map((point) => (
                <div 
                  key={point.id}
                  className={`bg-[#1e201d] p-4 rounded-2xl border ${point.warning ? 'border-[#FF5964]/20' : 'border-white/5'} flex items-center justify-between hover:border-[#B7FF1E]/30 transition-all cursor-pointer group relative overflow-hidden`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${point.warning ? 'bg-[#FF5964]' : 'bg-[#B7FF1E]'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-[#333532] flex items-center justify-center ${point.warning ? 'text-[#FF5964]' : 'text-[#B7FF1E]'} border border-white/5`}>
                      <span className="material-symbols-outlined">{point.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-white mb-0.5">{point.name}</h4>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={`w-1.5 h-1.5 rounded-full ${point.warning ? 'bg-[#FF5964]' : 'bg-[#B7FF1E]'}`}></span>
                        <span className={point.warning ? 'text-[#FF5964]' : 'text-[#858A7D]'}>{point.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[16px] font-bold text-white">{point.scans}</div>
                    <div className="text-[10px] text-[#858A7D] uppercase font-semibold">Scans</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Subscribe and Fund Interface */}
          <section className="mt-4">
            <h3 className="text-[18px] font-semibold text-white mb-4">Account & Subscription</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#B7FF1E]/10 border border-[#B7FF1E]/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:bg-[#B7FF1E]/20 transition-all">
                <div className="w-12 h-12 rounded-full bg-[#B7FF1E] flex items-center justify-center text-[#293500] shadow-[0_0_15px_rgba(183,255,30,0.3)]">
                  <span className="material-symbols-outlined font-bold">subscriptions</span>
                </div>
                <div className="text-center">
                  <span className="block text-[14px] font-bold text-white">Subscribe</span>
                  <span className="text-[10px] text-[#B7FF1E] uppercase font-bold">Pro Features</span>
                </div>
              </button>
              
              <button className="bg-[#1e201d] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-[#B7FF1E]/30 transition-all">
                <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center text-[#B7FF1E]">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <div className="text-center">
                  <span className="block text-[14px] font-bold text-white">Fund Wallet</span>
                  <span className="text-[10px] text-[#858A7D] uppercase font-bold">Manual Payouts</span>
                </div>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Bottom Nav Mockup (Active Settings) */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px]">
        <Link to="/dashboard/admin" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">dashboard</span><span className="text-[11px] font-semibold">Dashboard</span></Link>
        <Link to="/dashboard/admin/members" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">group</span><span className="text-[11px] font-semibold">Members</span></Link>
        <Link to="/dashboard/admin/payments" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">receipt_long</span><span className="text-[11px] font-semibold">Payments</span></Link>
        <Link to="/dashboard/admin/attendance" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">event_available</span><span className="text-[11px] font-semibold">Attendance</span></Link>
        <Link to="/dashboard/admin/settings" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#B7FF1E] bg-[#25340D]/20 scale-90"><span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: '"FILL" 1' }}>settings</span><span className="text-[11px] font-semibold">Settings</span></Link>
      </nav>
    </div>
  );
}
