import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/admin/members')({
  component: AdminMembers,
});

function AdminMembers() {
  return (
    <div className="bg-[#000000] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      {/* Head link for icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Top Glow Effect */}
      <div 
        className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(213, 255, 64, 0.15) 0%, rgba(213, 255, 64, 0) 70%)',
          borderRadius: '50%'
        }}
      />

      {/* Main Mobile Container */}
      <div className="max-w-[480px] mx-auto min-h-screen pb-[80px] relative z-10 flex flex-col">
        <main className="flex-1 px-[20px] pt-8 flex flex-col">
          {/* Header Section */}
          <header className="mb-[24px]">
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white mb-1">Members</h1>
            <p className="text-[14px] leading-[20px] text-[#C0C2B8]">214 Total Active</p>
          </header>

          {/* Search & Filter */}
          <div className="flex gap-[12px] mb-[24px]">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8]" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
              <input 
                className="w-full h-12 bg-[#1e201d] border border-white/5 rounded-xl pl-12 pr-4 text-[14px] text-[#e3e3dd] placeholder:text-[#C0C2B8] focus:outline-none focus:border-[#D5FF40] focus:ring-1 focus:ring-[#D5FF40] transition-colors" 
                placeholder="Search members..." 
                type="text"
              />
            </div>
            <button className="h-12 w-12 flex items-center justify-center bg-[#1e201d] border border-white/5 rounded-xl hover:border-[#D5FF40] transition-colors">
              <span className="material-symbols-outlined text-[#e3e3dd]" style={{ fontVariationSettings: "'FILL' 0" }}>tune</span>
            </button>
          </div>

          {/* Status Chips */}
          <div className="flex gap-[8px] overflow-x-auto no-scrollbar mb-[24px] pb-2 -mx-[20px] px-[20px]">
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#D5FF40] text-[11px] font-semibold text-black">All</button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#292b27] text-[11px] font-semibold text-[#C0C2B8] hover:bg-[#333532] transition-colors">Active</button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#292b27] text-[11px] font-semibold text-[#C0C2B8] hover:bg-[#333532] transition-colors">Overdue</button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#292b27] text-[11px] font-semibold text-[#C0C2B8] hover:bg-[#333532] transition-colors">Pending</button>
          </div>

          {/* Member List */}
          <div className="flex flex-col gap-[12px]">
            {/* Member Card 1 */}
            <div className="flex items-center p-[16px] bg-[#1e201d] border border-white/5 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D5FF40]/20 to-transparent"></div>
              <img className="w-12 h-12 rounded-full object-cover mr-4 border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt3aoaHw9zAi0mZ5ng_BUkvX67DgJTDioId_IIe5NWUfNPO2WomkLP_dJ0LoLhTXj5Gt8H9bA-2oVroOdlI7UNLaKD-zl7xGkWiyDIvZwxfp7KthwAEd2zUqqozSlns2lFlX82i4A-bHsyRyyNTyNimOYKCGcP4UTeToDsMTGOJaxH6b7IaUIaSkeHkfWrC04y1QqCgx-pAGs_iCCMWiqVQejhKfkzDcbPqPVve0PGWCSBCMf6XA" alt="Aman Gupta" />
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-white">Aman Gupta</h3>
                <p className="text-[12px] text-[#C0C2B8]">Annual Pro Plan</p>
              </div>
              <div className="px-2 py-1 rounded bg-[#A7F52A]/10 border border-[#A7F52A]/20">
                <span className="text-[11px] font-semibold text-[#A7F52A] uppercase">Active</span>
              </div>
            </div>

            {/* Member Card 2 */}
            <div className="flex items-center p-[16px] bg-[#1e201d] border border-white/5 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D5FF40]/20 to-transparent"></div>
              <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center mr-4 border border-white/10">
                <span className="text-[18px] font-semibold text-white">SR</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-white">Sarah Rogers</h3>
                <p className="text-[12px] text-[#C0C2B8]">Monthly Basic</p>
              </div>
              <div className="px-2 py-1 rounded bg-[#FF5964]/10 border border-[#FF5964]/20">
                <span className="text-[11px] font-semibold text-[#FF5964] uppercase">Overdue</span>
              </div>
            </div>

            {/* Member Card 3 */}
            <div className="flex items-center p-[16px] bg-[#1e201d] border border-white/5 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D5FF40]/20 to-transparent"></div>
              <img className="w-12 h-12 rounded-full object-cover mr-4 border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBMjJN_vnBHvBtY7WdsVcVf59Ti6HI-2HCgSCXSjVwXhwlQKYiUtfrZpUB3798BMZfrtv5LT83x7xOJjOhVsOX1Pb4MwUimnMhW9lEUiAxox9CDOXjWS6YJyBccuTSCIka12l6_T85qwolTfQVbusNGefs_aogZUY9U6o4JRMmDtglDaCbCBADrr2sgXXbCbng5BjWm_mWfkoCymaOesemkaZywvcCDlkLwGqbgPP1GLfrbqehMg" alt="Priya Sharma" />
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-white">Priya Sharma</h3>
                <p className="text-[12px] text-[#C0C2B8]">Quarterly Elite</p>
              </div>
              <div className="px-2 py-1 rounded bg-[#A7F52A]/10 border border-[#A7F52A]/20">
                <span className="text-[11px] font-semibold text-[#A7F52A] uppercase">Active</span>
              </div>
            </div>

            {/* Member Card 4 */}
            <div className="flex items-center p-[16px] bg-[#1e201d] border border-white/5 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D5FF40]/20 to-transparent"></div>
              <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center mr-4 border border-white/10">
                <span className="text-[18px] font-semibold text-white">MK</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-white">Michael Kim</h3>
                <p className="text-[12px] text-[#C0C2B8]">Day Pass</p>
              </div>
              <div className="px-2 py-1 rounded bg-[#D5FF40]/10 border border-[#D5FF40]/20">
                <span className="text-[11px] font-semibold text-[#D5FF40] uppercase">Pending</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px] left-1/2 -translate-x-1/2">
        <Link 
          to="/dashboard/admin" 
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
        <button className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200 text-[#C0C2B8] hover:text-white">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: '"FILL" 0' }}>receipt_long</span>
          <span className="text-[11px] font-semibold leading-[14px]">Payments</span>
        </button>
        <button className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200 text-[#C0C2B8] hover:text-white">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: '"FILL" 0' }}>how_to_reg</span>
          <span className="text-[11px] font-semibold leading-[14px]">Attendance</span>
        </button>
        <button className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200 text-[#C0C2B8] hover:text-white">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: '"FILL" 0' }}>settings</span>
          <span className="text-[11px] font-semibold leading-[14px]">Settings</span>
        </button>
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
