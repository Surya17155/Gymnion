import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getPlatformStats } from '@/lib/super-admin.functions';

export const Route = createFileRoute('/dashboard/super-admin')({
  component: SuperAdminLayout,
});

function SuperAdminLayout() {
  const { pathname } = useLocation();
  const isExact = pathname === '/dashboard/super-admin' || pathname === '/dashboard/super-admin/';
  
  if (!isExact) return <Outlet />;

  return (
    <div className="bg-[#0D0F0C] text-[#e3e3dd] min-h-screen relative overflow-x-hidden font-sans no-scrollbar">
      <Outlet />
      
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-0 w-full z-[100] flex justify-around items-center px-4 py-2 pb-safe rounded-t-[20px] max-w-[480px] left-1/2 -translate-x-1/2">
        <Link 
          to="/dashboard/super-admin/"
          activeOptions={{ exact: true }}
          preload="intent"
          className="flex flex-col items-center justify-center w-[64px] h-[52px] rounded-xl"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-0.5 text-[22px]" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0', color: isActive ? '#B7FF1E' : '#C0C2B8' }}>home</span>
              <span className="text-[10px] font-semibold leading-tight" style={{ color: isActive ? '#B7FF1E' : '#C0C2B8' }}>Home</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/super-admin/payments"
          preload="intent"
          className="flex flex-col items-center justify-center w-[64px] h-[52px] rounded-xl"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-0.5 text-[22px]" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0', color: isActive ? '#B7FF1E' : '#C0C2B8' }}>payments</span>
              <span className="text-[10px] font-semibold leading-tight" style={{ color: isActive ? '#B7FF1E' : '#C0C2B8' }}>Payments</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/super-admin/plans"
          preload="intent"
          className="flex flex-col items-center justify-center w-[64px] h-[52px] rounded-xl"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-0.5 text-[22px]" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0', color: isActive ? '#B7FF1E' : '#C0C2B8' }}>layers</span>
              <span className="text-[10px] font-semibold leading-tight" style={{ color: isActive ? '#B7FF1E' : '#C0C2B8' }}>Plans</span>
            </>
          )}
        </Link>

        <Link 
          to="/dashboard/super-admin/gyms"
          preload="intent"
          className="flex flex-col items-center justify-center w-[64px] h-[52px] rounded-xl"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-0.5 text-[22px]" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0', color: isActive ? '#B7FF1E' : '#C0C2B8' }}>fitness_center</span>
              <span className="text-[10px] font-semibold leading-tight" style={{ color: isActive ? '#B7FF1E' : '#C0C2B8' }}>Gyms</span>
            </>
          )}
        </Link>
      </nav>
    </div>
  );
}

export function SuperAdminDashboard() {
  const statsFn = useServerFn(getPlatformStats);
  const { data: stats, isLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => statsFn(),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#0D0F0C]">
      <div className="w-8 h-8 border-2 border-[#B7FF1E]/20 border-t-[#B7FF1E] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pb-16">
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(213,255,64,0.1) 0%, rgba(13,15,12,0) 70%)'
        }}
      />
      
      <main className="md:ml-64 relative z-10 w-full max-w-[480px] mx-auto md:max-w-none flex flex-col pt-6 px-5">
        <div className="md:hidden flex items-center mb-8">
          <h1 className="text-[22px] font-bold text-white">Dashboard</h1>
          <div className="flex-1"></div>
          <div className="w-10 h-10 rounded-full bg-[#333532] border border-white/10 overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-[#C0C2B8]">person</span>
          </div>
        </div>

        <header className="hidden md:flex justify-between items-center px-8 h-20 w-full border-b border-white/5 bg-[#121411]/80 backdrop-blur-md sticky top-0 z-30 mb-8">
          <h1 className="text-[22px] font-bold">Platform Overview</h1>
          <Link to="/dashboard/super-admin/gyms" className="bg-[#B7FF1E] text-[#1a1c19] text-sm font-normal px-4 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(183,255,30,0.2)]">
            <span className="material-symbols-outlined text-[18px]">add</span>Invite Gym
          </Link>
        </header>

        <div className="flex flex-col gap-6 md:p-8 md:max-w-6xl md:mx-auto w-full pb-20">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#e3e3dd]">Platform Growth</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[120px]">
                <p className="text-[11px] font-semibold text-[#858A7D]">Total Active Gyms</p>
                <div>
                  <p className="text-[28px] md:text-[32px] font-bold text-white">{stats?.totalGyms}</p>
                  <div className="flex items-center gap-1 mt-1 text-[#B7FF1E] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    <span>+{stats?.newGymsThisMonth} this mo</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[120px]">
                <p className="text-[11px] font-semibold text-[#858A7D]">Total Members</p>
                <div>
                  <p className="text-[28px] md:text-[32px] font-bold text-white">{stats?.totalMembers}</p>
                </div>
              </div>
              <div className="bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[120px]">
                <p className="text-[11px] font-semibold text-[#858A7D]">Monthly Rec. Rev</p>
                <div>
                  <p className="text-[28px] md:text-[32px] font-bold text-white">₹{stats?.mrr}</p>
                </div>
              </div>
              <div className="bg-[#151714]/80 backdrop-blur-md border border-[#FF5964]/30 rounded-xl p-4 flex flex-col justify-between min-h-[120px]">
                <p className="text-[11px] font-semibold text-[#FF5964]">Overdue</p>
                <div>
                  <p className="text-[28px] md:text-[32px] font-bold text-[#FF5964]">{stats?.overdueSubscriptions}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[#e3e3dd]">Quick Navigation</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <Link to="/dashboard/super-admin/gyms" className="bg-[#121411] border border-white/5 rounded-xl p-4 flex flex-col gap-2 hover:bg-[#1e201d] transition-colors">
                  <span className="material-symbols-outlined text-[#B7FF1E]">fitness_center</span>
                  <span className="text-sm font-semibold text-white">Manage Gyms</span>
               </Link>
               <Link to="/dashboard/super-admin/plans" className="bg-[#121411] border border-white/5 rounded-xl p-4 flex flex-col gap-2 hover:bg-[#1e201d] transition-colors">
                  <span className="material-symbols-outlined text-[#B7FF1E]">layers</span>
                  <span className="text-sm font-semibold text-white">Subscription Plans</span>
               </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
