import { createFileRoute, useNavigate, Link, Navigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails, getGymAccessPoints } from '@/lib/auth.functions';
import QRCode from 'qrcode';

export const Route = createFileRoute('/dashboard/admin/settings/qr-management')({
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
    // For now just re-trigger effect, but could rotate gym_code if needed
    if (gym?.id) {
      const checkinUrl = `${window.location.origin}/checkin?gym=${gym.id}`;
      QRCode.toDataURL(checkinUrl, {
        width: 400,
        margin: 2,
      }).then(setQrUrl);
    }
  };

  const { data: rawAccessPoints, isLoading: isPointsLoading } = useQuery({
...
...
              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-lg mb-6 shadow-[0_0_30px_rgba(183,255,30,0.15)] relative">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#121411]/20"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#121411]/20"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#121411]/20"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#121411]/20"></div>
                
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

            {/* Stats Bar */}
            <div className="bg-[#1e201d]/50 border-t border-white/5 py-3 px-[16px] flex justify-between items-center text-[12px]">
              <span className="text-[#858A7D]">Last scanned: Just now</span>
              <span className="text-white font-semibold">{attendanceCount || 0} scans today</span>
            </div>
          </section>

          {/* Access Points List */}
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

      {/* Bottom Nav */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-md max-w-[480px]">
        <Link to="/dashboard/admin" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">dashboard</span><span className="text-[11px] font-semibold">Dashboard</span></Link>
        <Link to="/dashboard/admin/members" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">group</span><span className="text-[11px] font-semibold">Members</span></Link>
        <Link to="/dashboard/admin/payments" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">receipt_long</span><span className="text-[11px] font-semibold">Payments</span></Link>
        <Link to="/dashboard/admin/attendance" className="flex flex-col items-center justify-center w-[96px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">event_available</span><span className="text-[11px] font-semibold">Attendance</span></Link>
      </nav>
    </div>
  );
}