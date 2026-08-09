import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServerFn } from '@tanstack/react-start';
import { getAdminStats, getRecentActivity, getGymDetails } from '@/lib/auth.functions';
import { format } from 'date-fns';

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/auth/login', search: { redirect: "" } });
  };

  const getStatsFn = useServerFn(getAdminStats);
  const getActivityFn = useServerFn(getRecentActivity);
  const getGymDetailsFn = useServerFn(getGymDetails);

  const { data: gymData } = useQuery({
    queryKey: ['admin-gym-settings'],
    queryFn: () => getGymDetailsFn({ data: {} })
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats', gymData?.id],
    queryFn: () => getStatsFn({ data: { gymId: gymData!.id } }),
    enabled: !!gymData?.id
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['admin-activity', gymData?.id],
    queryFn: () => getActivityFn({ data: { gymId: gymData!.id } }),
    enabled: !!gymData?.id
  });

  useEffect(() => {
    if (gymData?.id) {
      const checkinUrl = `${window.location.origin}/checkin?gym=${gymData.id}&code=${gymData.gym_code || ''}`;
      QRCode.toDataURL(checkinUrl, { width: 400, margin: 2 }).then(setQrUrl);
    }
  }, [gymData]);

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${gymData?.name || 'gym'}-qr.png`;
    link.click();
  };

  const { data: activePlans } = useQuery({
    queryKey: ['global-plans-for-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_plans')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const currentPlan = activePlans?.find((p: any) => p.id === (gymData?.settings as any)?.plan_id);

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins'] no-scrollbar">
      {/* Head link for icons is already in __root.tsx, but ensuring icons are available */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Top Glow Effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15) 0%, rgba(18, 20, 17, 0) 70%)'
        }}
      />

      {/* Main Mobile Container */}
      <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative z-10 flex flex-col">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-[20px] h-[64px] w-full sticky top-0 z-40 bg-transparent">
          <div className="flex items-center gap-3">
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity text-[#B7FF1E] bg-[#1e201d]/50 border border-white/10 focus:outline-none"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>person</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1e201d] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                <Link
                  to="/dashboard/admin/account"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#C0C2B8] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Profile
                </Link>
                <Link
                  to="/dashboard/admin/plans"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#C0C2B8] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Gym Plans
                </Link>
                <Link
                  to="/dashboard/admin/qr-management"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#C0C2B8] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  QR Management
                </Link>
                <Link
                  to="/dashboard/admin/settings"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#C0C2B8] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </Link>
                <div className="h-px bg-white/5 my-1 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#FF5964] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-[20px] flex flex-col gap-[24px] py-2">
          {/* Page Title */}
          <section className="-mt-4">
            <h2 className="text-[40px] font-bold leading-[44px] tracking-[-0.04em] text-white">Hi, {gymData?.owner_first_name || gymData?.owner_name?.split(' ')[0] || 'Admin'}</h2>
          </section>

          {/* Revenue Card (Full width) */}
          <section>
            <div className="bg-[#121411] rounded-xl p-[16px] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#B7FF1E]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] leading-[18px] text-[#858A7D] uppercase tracking-wider">Revenue (This Month)</span>
                <span className="material-symbols-outlined text-[#B7FF1E] opacity-50" style={{ fontVariationSettings: '"FILL" 0' }}>payments</span>
              </div>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-[#B7FF1E]">₹{stats?.monthRevenue.toLocaleString() || 0}</span>
                <div className="flex items-center text-[#A7F52A] text-[11px] font-semibold pb-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>+12%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Subscription/Manual Features Banner - Current Plan */}
          {(currentPlan || (gymData?.settings as any)?.manual_pricing) && (
            <section className="bg-[#B7FF1E]/10 border border-[#B7FF1E]/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#858A7D] uppercase font-bold">Current Plan</p>
                <p className="text-white font-bold">
                  {currentPlan?.name || 'Manual Pricing'}
                </p>
                {(gymData?.settings as any)?.manual_pricing && (
                  <p className="text-[12px] text-[#B7FF1E] font-medium mt-0.5">₹{(gymData?.settings as any).manual_pricing}/mo</p>
                )}
              </div>
              <div className="flex gap-2">
                {(() => {
                  const settings = (gymData?.settings as any) || {};
                  const manualFeatures = settings.features;
                  
                  if (manualFeatures) {
                    return (
                      <>
                        <span 
                          className="material-symbols-outlined text-[18px]" 
                          style={{ color: manualFeatures.payment_management ? '#B7FF1E' : '#FF5964' }}
                          title="Payments"
                        >
                          payments
                        </span>
                        <span 
                          className="material-symbols-outlined text-[18px]" 
                          style={{ color: manualFeatures.attendance_management ? '#B7FF1E' : '#FF5964' }}
                          title="Attendance"
                        >
                          how_to_reg
                        </span>
                      </>
                    );
                  }
                  
                  return Array.isArray(currentPlan?.features) && (currentPlan.features as any[]).slice(0, 3).map((f: any, i: number) => {
                    const isEnabled = typeof f === 'string' ? true : f.enabled;
                    const featureName = typeof f === 'string' ? f.toLowerCase() : (f.name || '').toLowerCase();
                    
                    let icon = 'check_circle';
                    if (featureName.includes('payment')) icon = 'payments';
                    else if (featureName.includes('attendance')) icon = 'how_to_reg';

                    return (
                      <span 
                        key={i} 
                        className="material-symbols-outlined text-[18px]" 
                        style={{ 
                          color: isEnabled ? '#B7FF1E' : '#FF5964'
                        }}
                        title={typeof f === 'string' ? f : f.name}
                      >
                        {icon}
                      </span>
                    );
                  });
                })()}
              </div>
            </section>
          )}

          {/* QR Quick Action - Link to QR Management */}
          <section>
            <Link 
              to="/dashboard/admin/qr-management"
              className="w-full bg-[#1e201d] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-[#252724] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                  <span className="material-symbols-outlined">qr_code_2</span>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold">Gym QR Code</h3>
                  <p className="text-[12px] text-[#858A7D]">Members scan this to check in</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#858A7D] group-hover:text-white transition-colors">arrow_forward_ios</span>
            </Link>
          </section>

          {/* KPI Grid */}
          <section className="grid grid-cols-2 gap-3">
            {/* Revenue Card moved up */}

            {/* Member Status Card */}
            <div className="bg-[#121411] rounded-xl p-[16px] border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[12px] leading-[18px] text-[#858A7D] mb-3">Member Status</span>
              {/* Progress Ring */}
              <div className="relative w-20 h-20 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-[#292A28]" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-[#B7FF1E]" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="60" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-semibold text-white">{stats ? Math.round((stats.todayCheckins / 200) * 100) : 0}%</span>
                </div>
              </div>
              <div className="flex justify-between w-full text-[11px] font-semibold">
                <span className="text-[#C0C2B8]">{stats?.todayCheckins || 0} In</span>
                <span className="text-[#B7FF1E]">{stats?.currentlyIn || 0} Now</span>
              </div>
            </div>

            {/* Overdue Members Card */}
            <div className="bg-[#121411] rounded-xl p-[16px] border border-[#FF5964]/30 flex flex-col items-start justify-between relative overflow-hidden animate-pulse">
              <div className="absolute inset-0 bg-[#FF5964]/5"></div>
              <div className="relative z-10 w-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[12px] leading-[18px] text-[#FF5964]">Overdue</span>
                  <span className="material-symbols-outlined text-[#FF5964] opacity-80" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
                </div>
                <span className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-white block mb-1">{stats?.overdueCount || 0}</span>
                <span className="text-[11px] font-semibold text-[#C0C2B8]">Members unpaid</span>
              </div>
            </div>
          </section>

          {/* Quick Actions removed from dashboard as requested, keeping other sections */}

          {/* Recent Activity */}
          <section>
            <div className="flex justify-between items-center mb-[12px]">
              <h3 className="text-[18px] font-semibold text-white">Recent Activity</h3>
              <span className="text-[11px] font-semibold text-[#B7FF1E] cursor-pointer">View All</span>
            </div>
            <div className="bg-[#121411] rounded-xl border border-white/5 overflow-hidden">
              {recentActivity?.map((activity, i) => (
                <div key={i} className="p-[16px] border-b border-white/5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'payment' ? 'text-[#B7FF1E]' : 'text-[#C0C2B8]'} bg-[#1e201d]`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {activity.type === 'payment' ? 'payments' : 'login'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-white"><span className="font-semibold">{activity.member_name}</span> {activity.action}</p>
                    <p className="text-[11px] font-semibold text-[#858A7D]">
                      {format(new Date(activity.timestamp!), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentActivity || recentActivity.length === 0) && (
                <div className="p-8 text-center text-[#858A7D] text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </section>
        </main>

        {/* QR Modal */}
        {showQRModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQRModal(false)}></div>
            <div className="bg-[#1e201d] w-full max-w-sm rounded-3xl border border-white/10 p-6 relative z-10 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Gym QR Code</h3>
                <button onClick={() => setShowQRModal(false)} className="text-[#858A7D] hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="bg-white p-4 rounded-2xl mb-6">
                {qrUrl ? (
                  <img src={qrUrl} alt="Gym QR" className="w-full aspect-square object-contain" />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDownloadQR}
                  className="w-full bg-[#B7FF1E] text-[#293500] h-12 rounded-full font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">download</span>
                  Download PNG
                </button>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className="w-full text-[#858A7D] h-10 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-md max-w-[480px] left-1/2 -translate-x-1/2">
        <Link 
          to="/dashboard/admin/"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
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
