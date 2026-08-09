import { createFileRoute, useNavigate, Link, Navigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails, getGymAccessPoints, createAccessPoint, deleteAccessPoint } from '@/lib/auth.functions';
import { regenerateGymQR } from '@/lib/gyms.functions';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export const Route = createFileRoute('/dashboard/admin/qr-management')({
  component: QRManagement,
});

function QRManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getGymDetailsFn = useServerFn(getGymDetails);
  const getAccessPointsFn = useServerFn(getGymAccessPoints);
  const createAccessPointFn = useServerFn(createAccessPoint);
  const deleteAccessPointFn = useServerFn(deleteAccessPoint);
  const regenerateQR = useServerFn(regenerateGymQR);
  
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newPointName, setNewPointName] = useState('');

  const { data: gym, isLoading: isGymLoading } = useQuery({
    queryKey: ['admin-gym-details'],
    queryFn: () => getGymDetailsFn({ data: {} }),
  });

  useEffect(() => {
    if (gym?.id) {
      const checkinUrl = `${window.location.origin}/checkin?gym=${gym.id}&code=${gym.gym_code || ''}`;
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

  const accessPoints = rawAccessPoints || [];

  const createMutation = useMutation({
    mutationFn: (name: string) => createAccessPointFn({ data: { gymId: gym!.id, name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-access-points'] });
      setIsDrawerOpen(false);
      setNewPointName('');
      toast.success('Access point created');
    },
    onError: () => toast.error('Failed to create access point')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccessPointFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-access-points'] });
      toast.success('Access point deleted');
    },
    onError: () => toast.error('Failed to delete access point')
  });

  const handleCreatePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointName.trim()) return;
    createMutation.mutate(newPointName);
  };

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
              <span className="text-[#858A7D]">Last scanned: Just now</span>
              <span className="text-white font-semibold">{attendanceCount || 0} scans today</span>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-3">
              <h3 className="text-[18px] font-semibold text-white">Active Access Points</h3>
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="text-[#B7FF1E] text-[11px] font-bold uppercase flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                New
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {accessPoints.map((point: any) => (
                <div 
                  key={point.id}
                  className={`bg-[#121411] p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-[#1e201d] transition-colors group relative overflow-hidden`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B7FF1E] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-[#1e201d] flex items-center justify-center text-[#B7FF1E] border border-white/5`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>{point.icon || 'door_front'}</span>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white mb-1">{point.name}</h4>
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className={`w-1.5 h-1.5 rounded-full bg-[#A7F52A]`}></span>
                        <span className={'text-[#858A7D]'}>Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[18px] font-semibold text-white">0</div>
                      <div className="text-[10px] text-[#858A7D] uppercase font-semibold">scans today</div>
                    </div>
                    <button 
                      onClick={() => deleteMutation.mutate(point.id)}
                      className="w-8 h-8 rounded-full bg-[#1e201d] flex items-center justify-center text-[#FF5964] border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
              {accessPoints.length === 0 && (
                <div className="py-8 text-center text-[#858A7D] text-sm border border-dashed border-white/10 rounded-xl">
                  No custom access points created yet.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Add Access Point Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="bg-[#1e201d] w-full max-w-[480px] rounded-3xl border border-white/10 relative z-10 animate-in slide-in-from-bottom duration-300 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">New Access Point</h3>
              <form onSubmit={handleCreatePoint} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#858A7D] ml-1">Area Name</label>
                  <input 
                    required
                    autoFocus
                    type="text" 
                    value={newPointName}
                    onChange={(e) => setNewPointName(e.target.value)}
                    placeholder="e.g. Cardio Zone"
                    className="bg-[#121411] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#B7FF1E] focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 bg-[#333532] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest border border-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 bg-[#B7FF1E] text-[#293500] py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-[#B7FF1E]/10 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save Point'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
