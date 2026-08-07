import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/admin/attendance')({
  component: AdminAttendance,
});

function AdminAttendance() {
  return (
    <div className="bg-[#0d0f0c] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      {/* Head link for icons is already in __root.tsx, but ensuring icons are available */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Atmospheric Glow */}
      <div 
        className="fixed top-0 left-0 right-0 h-96 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% -20%, rgba(213, 255, 64, 0.15) 0%, transparent 70%)'
        }}
      />

      {/* Main Content Canvas */}
      <main className="pb-[100px] min-h-screen relative w-full max-w-[480px] mx-auto overflow-x-hidden z-10">
        <div className="px-[20px] flex flex-col gap-[24px] pt-4">
          {/* Header Section */}
          <div>
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-[#e3e3dd] mb-1">Attendance</h1>
            <p className="text-[12px] leading-[18px] text-[#C0C2B8]">Real-time activity & occupancy</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121411] rounded-xl p-[16px] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#333532] group-hover:bg-[#B7FF1E] transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[12px] leading-[18px] text-[#C0C2B8]">Today's Total</span>
                <span className="material-symbols-outlined text-[#C0C2B8] text-lg">calendar_today</span>
              </div>
              <div className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-[#e3e3dd]">412</div>
            </div>
            <div className="bg-[#121411] rounded-xl p-[16px] border border-[#B7FF1E]/20 relative overflow-hidden group shadow-[0_4px_24px_rgba(213,255,64,0.05)]">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#B7FF1E]"></div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[12px] leading-[18px] text-[#C0C2B8]">Currently in Gym</span>
                <div className="w-2 h-2 rounded-full bg-[#B7FF1E] animate-pulse mt-1"></div>
              </div>
              <div className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-[#B7FF1E]">84</div>
            </div>
          </div>

          {/* Recent Activity */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-[18px] font-semibold text-[#e3e3dd]">Recent Activity</h2>
            </div>
            <div className="bg-[#121411] rounded-xl p-[16px] border border-white/5 flex items-center gap-4">
              <div className="relative">
                <img 
                  className="w-12 h-12 rounded-full object-cover border border-white/10" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6ycThK8sJq0Eqvuk7OoTEeh8tdN7MwzSfbm_itlG_EZ3Tt4srxsObEm87ixZ2-Ae0a0rrXp0JjsiB2JCNF11mbLE4VxBRcfpjT3DckzA02pJd8Y6GdvvqY64sRR81jK4zctIa8GD5GXIVkbUSzj4qJt-NaMR3vbO-lu6-cOBG0NE_Mg-ofQKweX6G-pUyjE-6nqD-uSOnu4KGZ797ilYog4yCZL1GVrpCuAQYUDVRlKGm-K7u_A" 
                  alt="Sarah Jenkins"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#121411] flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-[10px] text-[#B7FF1E]" style={{ fontVariationSettings: '"FILL" 1' }}>login</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] leading-[20px] font-semibold text-[#e3e3dd]">Sarah Jenkins</h3>
                <p className="text-[12px] leading-[18px] text-[#C0C2B8]">Checked in</p>
              </div>
              <div className="text-right">
                <span className="text-[12px] leading-[18px] text-[#B7FF1E] block">Just now</span>
                <span className="text-[11px] font-semibold text-[#858A7D]">09:42 AM</span>
              </div>
            </div>
          </section>

          {/* Detailed Attendance List */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-[18px] font-semibold text-[#e3e3dd]">Live Log</h2>
              <button className="text-[11px] font-semibold text-[#C0C2B8] flex items-center gap-1 hover:text-[#e3e3dd] transition-colors">
                Filter <span className="material-symbols-outlined text-sm">filter_list</span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {/* Active Member */}
              <div className="bg-[#121411] rounded-lg p-3 border border-white/5 flex items-center gap-3">
                <img 
                  className="w-10 h-10 rounded-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuChnQFN5VWL0LvRWDn0zRqhkdhN1olxjBM2k2vAFu6x3odeqKeuxUIH9H-MO13nrZ8mxg5dKv7BQgQJALGAHlf6LP-zs2pj57P6VSaZKiz0v8cyzjzsGKPQkwMI6ZNm32qVPGERvzi6MSsH_25mXwTn4tDb_Xc3Jvv-YoNkDQt7Nt7x1ZsbFizC-zpFV_Xs7v01EmiaQ4NI-eaylxVVvvfia49OTgths1elhvXPPdpgO_LVVceK0g" 
                  alt="Marcus Thorne"
                />
                <div className="flex-1">
                  <h3 className="text-[14px] leading-[20px] text-[#e3e3dd]">Marcus Thorne</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF1E]"></span>
                    <span className="text-[11px] font-semibold text-[#B7FF1E] uppercase">Active</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] leading-[18px] text-[#C0C2B8] block">In: 08:15 AM</span>
                  <span className="text-[11px] font-semibold text-[#858A7D]">1h 27m</span>
                </div>
              </div>
              {/* Completed Visit */}
              <div className="bg-[#121411] rounded-lg p-3 border border-white/5 flex items-center gap-3 opacity-75">
                <img 
                  className="w-10 h-10 rounded-full object-cover grayscale" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQYbFXOCso-25FY7kMpQ0gOEavFj2pwVeQFcrI27Y0fa5x6xXiRj3J7T6c7Zws6p7sKa6AbIEBLfGtS3U7q3Jc9js8Mg29LXPHu1nIbQ1QM9Az3SoLBF_BO4ogxJn-sA43f5BF_5ZJBTzOn_QWQnV6RgMF3O9FXS0k_RDY1SKfJXeFCdiGTtkFNLrj8qGu_w2Mp06PwdWl3S6wnDYILrrg_bnXDLp0h7XDqZj8HHzkhHxAQQJBRA" 
                  alt="Elena Rostova"
                />
                <div className="flex-1">
                  <h3 className="text-[14px] leading-[20px] text-[#e3e3dd]">Elena Rostova</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#333532]"></span>
                    <span className="text-[11px] font-semibold text-[#C0C2B8] uppercase">Completed</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] leading-[18px] text-[#C0C2B8] block">In: 06:30 AM</span>
                  <span className="text-[11px] font-semibold text-[#858A7D]">Out: 08:10 AM</span>
                </div>
              </div>
              {/* Completed Visit */}
              <div className="bg-[#121411] rounded-lg p-3 border border-white/5 flex items-center gap-3 opacity-75">
                <div className="w-10 h-10 rounded-full bg-[#333532] flex items-center justify-center text-[#C0C2B8] text-[11px] font-semibold">
                  DJ
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] leading-[20px] text-[#e3e3dd]">David Jung</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#333532]"></span>
                    <span className="text-[11px] font-semibold text-[#C0C2B8] uppercase">Completed</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] leading-[18px] text-[#C0C2B8] block">In: 06:05 AM</span>
                  <span className="text-[11px] font-semibold text-[#858A7D]">Out: 07:45 AM</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px] left-1/2 -translate-x-1/2">
        <Link 
          to="/dashboard/admin"
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