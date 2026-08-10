import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/m/payments')({
  component: MemberPayments,
});

function MemberPayments() {
  return (
    <div className="flex justify-center min-h-screen bg-[#121411] text-[#e3e3dd] antialiased font-['Poppins']">
      {/* Material Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Global ambient glow */}
      <div 
        className="fixed top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 25% 0%, rgba(183, 255, 30, 0.15), transparent 50%)'
        }}
      />
      
      <main className="w-full max-w-[480px] min-h-screen relative pb-[120px] flex flex-col z-10">
        {/* Top App Bar */}
        <div className="flex justify-end px-5 w-full sticky top-0 z-40 h-[64px] items-center">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1e201d] border border-white/5 text-[#B7FF1E] hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col px-5 gap-[24px]">
          {/* Header */}
          <div>
            <h2 className="text-[28px] leading-[32px] font-bold text-white tracking-tight">Payments</h2>
            <p className="text-[14px] leading-[20px] text-[#858A7D] mt-1">hello</p>
          </div>

          {/* Upcoming Payment Card */}
          <section>
            <div className="bg-[#1e201d] border border-white/5 rounded-2xl p-[20px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(213,255,64,0.05),transparent_70%)] pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[11px] leading-[14px] font-semibold text-[#B7FF1E] uppercase tracking-wider mb-1">Upcoming Due</p>
                  <h3 className="text-[40px] leading-[40px] font-bold text-white tracking-tighter">₹1,200</h3>
                </div>
                <div className="bg-[#333532] rounded-full w-10 h-10 flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-[#B7FF1E]">calendar_month</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 relative z-10">
                <span className="w-2 h-2 rounded-full bg-[#FF5964]"></span>
                <p className="text-[12px] leading-[18px] text-[#858A7D]">
                  Due on <span className="text-white font-semibold">June 1st, 2026</span>
                </p>
              </div>

              <button className="w-full h-12 bg-[#B7FF1E] text-[#293500] rounded-full text-[18px] leading-[24px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all relative z-10 shadow-[0_0_15px_rgba(183,255,30,0.3)]">
                Pay Now
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </section>

          {/* Gym Plans carousel would go here - keeping simple for focus on icons/layout */}
          
          {/* Payment History List */}
          <section className="flex flex-col gap-3 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[18px] font-semibold text-white">Payment History</h3>
              <button className="text-[#B7FF1E] text-[11px] font-semibold uppercase tracking-wider">View All</button>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="bg-[#1e201d] border border-white/5 rounded-xl p-[16px] flex items-center justify-between hover:bg-[#333532] transition-colors cursor-pointer relative overflow-hidden group">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center text-[#B7FF1E]">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <p className="text-[14px] text-white font-semibold">Standard Plan</p>
                    <p className="text-[12px] text-[#858A7D]">May 1st, 2026 • Paid via UPI</p>
                  </div>
                </div>
                <span className="text-[18px] font-semibold text-white">₹1,200</span>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Nav Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1e201d] border-t border-white/5 shadow-lg px-2 py-2 pb-safe flex justify-around items-center h-[64px] rounded-t-2xl">
          <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl w-[72px] h-[64px] transition-colors">
            <span className="material-symbols-outlined mb-1">home</span>
            <span className="text-[11px] leading-[14px] font-semibold">Home</span>
          </Link>
          
          <Link to="/dashboard/m/payments" className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-1 w-[72px] h-[64px] scale-90 transition-all duration-200">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: '"FILL" 1' }}>credit_card</span>
            <span className="text-[11px] leading-[14px] font-semibold">Payments</span>
          </Link>
          
          <div className="relative -top-6">
            <button className="w-16 h-16 bg-[#B7FF1E] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(213,255,64,0.3)] border-4 border-[#1e201d] hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[30px] text-[#293500]">qr_code_scanner</span>
            </button>
          </div>
          
          <Link to="/dashboard/m/attendance" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl w-[72px] h-[64px] transition-colors">
            <span className="material-symbols-outlined mb-1">calendar_month</span>
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
