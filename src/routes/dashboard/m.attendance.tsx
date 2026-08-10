import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/m/attendance')({
  component: AttendanceHistory,
});

function AttendanceHistory() {
  return (
    <div className="flex justify-center min-h-screen bg-[#121411] w-full text-[#e3e3dd] antialiased font-['Poppins']">
      {/* Google Material Symbols */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Global ambient glow */}
      <div 
        className="fixed top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 25% 0%, rgba(183, 255, 30, 0.15), transparent 50%)'
        }}
      />
      
      <main className="w-full max-w-[480px] min-h-screen relative pb-[120px] flex flex-col z-10">
        {/* Header Section */}
        <header className="flex justify-between items-center px-6 pt-8 pb-4 relative">
          <h1 className="text-[28px] leading-[32px] font-bold text-white tracking-tight">Attendance</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#121411] hover:bg-[#333532] transition-colors border border-white/5 text-[#858A7D] hover:text-[#B7FF1E]">
            <span className="material-symbols-outlined">calendar_month</span>
          </button>
        </header>

        {/* Summary Stats Bento Grid */}
        <section className="px-5 py-6 grid grid-cols-2 gap-3 w-full">
          <div className="bg-[#151714] rounded-xl p-4 border border-white/5 relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(213,255,64,0.05),transparent_70%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#25340D]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-[#B7FF1E]" style={{ fontVariationSettings: '"FILL" 1' }}>local_fire_department</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[40px] leading-[40px] font-bold text-white tracking-tighter">18</span>
              <span className="text-[11px] leading-[14px] font-semibold text-[#C0C2B8] mt-1 uppercase tracking-wider">Total Days</span>
            </div>
          </div>
          <div className="bg-[#151714] rounded-xl p-4 border border-white/5 relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(213,255,64,0.05),transparent_70%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#25340D]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-[#858A7D]">timer</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[40px] leading-[40px] font-bold text-white tracking-tighter">
                1<span className="text-[18px] text-[#C0C2B8]">h</span> 15<span className="text-[18px] text-[#C0C2B8]">m</span>
              </span>
              <span className="text-[11px] leading-[14px] font-semibold text-[#C0C2B8] mt-1 uppercase tracking-wider">Avg Time</span>
            </div>
          </div>
        </section>

        {/* Recent Check-ins List */}
        <section className="px-5 pb-6 flex-1 w-full">
          <h2 className="text-[18px] leading-[24px] font-semibold text-white mb-3 flex items-center justify-between">
            Log
            <span className="text-[12px] text-[#B7FF1E] hover:underline cursor-pointer font-normal">View All</span>
          </h2>
          <div className="flex flex-col gap-2">
            {/* Log Item 1 */}
            <div className="bg-[#151714] rounded-xl p-4 border border-white/5 flex items-center justify-between hover:bg-[#1e201d] transition-colors backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(213,255,64,0.03),transparent)] pointer-events-none rounded-xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-[14px] bg-[#1e201d] flex flex-col items-center justify-center border border-white/5">
                  <span className="text-[11px] font-bold text-[#B7FF1E] uppercase">May</span>
                  <span className="text-[18px] font-bold text-white leading-none mt-1">26</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[18px] font-semibold text-white">Tuesday</span>
                </div>
              </div>
              <div className="flex flex-col items-end text-right relative z-10">
                <span className="text-[14px] text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#B7FF1E] text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>login</span>
                  18:30
                </span>
                <span className="text-[12px] text-[#858A7D] flex items-center gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  20:00
                </span>
              </div>
            </div>
            {/* Log Item 2 */}
            <div className="bg-[#151714] rounded-xl p-4 border border-white/5 flex items-center justify-between hover:bg-[#1e201d] transition-colors backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(213,255,64,0.03),transparent)] pointer-events-none rounded-xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-[14px] bg-[#1e201d] flex flex-col items-center justify-center border border-white/5">
                  <span className="text-[11px] font-bold text-[#B7FF1E] uppercase">May</span>
                  <span className="text-[18px] font-bold text-white leading-none mt-1">24</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[18px] font-semibold text-white">Sunday</span>
                </div>
              </div>
              <div className="flex flex-col items-end text-right relative z-10">
                <span className="text-[14px] text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#B7FF1E] text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>login</span>
                  06:15
                </span>
                <span className="text-[12px] text-[#858A7D] flex items-center gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  07:20
                </span>
              </div>
            </div>
            {/* Log Item 3 */}
            <div className="bg-[#151714] rounded-xl p-4 border border-white/5 flex items-center justify-between hover:bg-[#1e201d] transition-colors backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(213,255,64,0.03),transparent)] pointer-events-none rounded-xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-[14px] bg-[#1e201d] flex flex-col items-center justify-center border border-white/5">
                  <span className="text-[11px] font-bold text-[#858A7D] uppercase">May</span>
                  <span className="text-[18px] font-bold text-[#858A7D] leading-none mt-1">21</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[18px] font-semibold text-[#858A7D]">Thursday</span>
                </div>
              </div>
              <div className="flex flex-col items-end text-right relative z-10 opacity-70">
                <span className="text-[14px] text-[#858A7D] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  12:45
                </span>
                <span className="text-[12px] text-[#858A7D] flex items-center gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  13:30
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Nav Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1e201d] border-t border-white/5 shadow-lg px-2 py-2 pb-safe flex justify-around items-center h-[64px] rounded-t-2xl">
          <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl w-[72px] h-[64px] transition-colors">
            <span className="material-symbols-outlined mb-1">home</span>
            <span className="text-[11px] leading-[14px] font-semibold">Home</span>
          </Link>
          
          <Link to="/dashboard/m/payments" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl w-[72px] h-[64px] transition-colors">
            <span className="material-symbols-outlined mb-1">credit_card</span>
            <span className="text-[11px] leading-[14px] font-semibold">Payments</span>
          </Link>
          
          <div className="relative -top-6">
            <button className="w-16 h-16 bg-[#B7FF1E] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(213,255,64,0.3)] border-4 border-[#1e201d] hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[30px] text-[#293500]">qr_code_scanner</span>
            </button>
          </div>
          
          <Link to="/dashboard/m/attendance" className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-1 w-[72px] h-[64px] scale-90 transition-all duration-200">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: '"FILL" 1' }}>calendar_month</span>
            <span className="text-[11px] leading-[14px] font-semibold">Attendance</span>
          </Link>
          
          <Link to="/dashboard/m/profile" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl w-[72px] h-[64px] transition-colors">
            <span className="material-symbols-outlined mb-1">person</span>
            <span className="text-[11px] leading-[14px] font-semibold">Profile</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
