import { createFileRoute, Link } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/admin/settings')({
  component: AdminSettings,
});

function AdminSettings() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Atmospheric Glow */}
      <div 
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15) 0%, rgba(12, 20, 17, 0) 70%)'
        }}
      />

      {/* Main Mobile Container */}
      <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative z-10 flex flex-col">
        <main className="flex-1 px-[20px] flex flex-col gap-[24px] py-8">
          {/* Header Section */}
          <section className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white">Settings</h1>
            <p className="text-[14px] leading-[20px] text-[#858A7D]">Manage your gym's operations.</p>
          </section>

          {/* Settings List */}
          <div className="flex flex-col gap-[12px]">
            {/* Fee Plans */}
            <Link 
              to="/dashboard/admin/plans"
              className="flex items-center p-[16px] bg-[#1e201d] rounded-2xl border border-white/5 hover:border-[#B7FF1E]/30 transition-colors group text-left w-full"
            >
              <div className="w-12 h-12 rounded-full bg-[#25340D] flex items-center justify-center mr-4 group-hover:bg-[#B7FF1E]/20 transition-colors">
                <span className="material-symbols-outlined text-[#B7FF1E]" style={{ fontVariationSettings: '"FILL" 1' }}>receipt_long</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-[#e3e3dd]">Fee Plans</h3>
                <p className="text-[12px] text-[#858A7D] mt-1">Manage membership pricing and tiers.</p>
              </div>
              <span className="material-symbols-outlined text-[#858A7D] group-hover:text-[#B7FF1E] transition-colors">chevron_right</span>
            </Link>

            {/* QR Management */}
            <button className="flex items-center p-[16px] bg-[#1e201d] rounded-2xl border border-white/5 hover:border-[#B7FF1E]/30 transition-colors group text-left w-full">
              <div className="w-12 h-12 rounded-full bg-[#25340D] flex items-center justify-center mr-4 group-hover:bg-[#B7FF1E]/20 transition-colors">
                <span className="material-symbols-outlined text-[#B7FF1E]" style={{ fontVariationSettings: '"FILL" 1' }}>qr_code_scanner</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-[#e3e3dd]">QR Management</h3>
                <p className="text-[12px] text-[#858A7D] mt-1">Access control and facility entry points.</p>
              </div>
              <span className="material-symbols-outlined text-[#858A7D] group-hover:text-[#B7FF1E] transition-colors">chevron_right</span>
            </button>

            {/* Gym Profile */}
            <button className="w-full flex items-center p-[16px] bg-[#1e201d] rounded-2xl border border-white/5 hover:border-white/10 transition-colors text-left">
              <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-[#e3e3dd]">storefront</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-[#e3e3dd]">Gym Profile</h3>
                <p className="text-[12px] text-[#858A7D] mt-1">Edit gym name, address, and details.</p>
              </div>
              <span className="material-symbols-outlined text-[#858A7D]">chevron_right</span>
            </button>

            {/* Account */}
            <button className="w-full flex items-center p-[16px] bg-[#1e201d] rounded-2xl border border-white/5 hover:border-white/10 transition-colors text-left">
              <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-[#e3e3dd]">manage_accounts</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-[#e3e3dd]">Account</h3>
                <p className="text-[12px] text-[#858A7D] mt-1">Manage admin credentials.</p>
              </div>
              <span className="material-symbols-outlined text-[#858A7D]">chevron_right</span>
            </button>

            {/* Notifications */}
            <div className="flex items-center p-[16px] bg-[#1e201d] rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-[#e3e3dd]">notifications_active</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-[#e3e3dd]">Notifications</h3>
                <p className="text-[12px] text-[#858A7D] mt-1">Alerts for payments and check-ins.</p>
              </div>
              {/* Toggle Switch */}
              <button aria-checked="true" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#83A51B] transition-colors duration-200 ease-in-out focus:outline-none" role="switch" type="button">
                <span aria-hidden="true" className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-8">
            <button 
              onClick={handleLogout}
              className="w-full h-12 rounded-full border border-[#FF5964]/30 text-[#FF5964] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FF5964]/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[#FF5964]">logout</span>
              Logout
            </button>
          </div>
        </main>
      </div>

      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px]">
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
