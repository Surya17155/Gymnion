import { createFileRoute, Link } from '@tanstack/react-router';
import { LucideCalendarDays, LucideChevronRight, LucideCreditCard, LucideHome, Bell, LucideScanQrCode, LucideUser, LucideCheckCircle2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard/m/payments')({
  component: MemberPayments,
});

function MemberPayments() {
  return (
    <div className="flex justify-center min-h-screen bg-[#121411] overflow-x-hidden">
      {/* Global ambient glow */}
      <div 
        className="fixed top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 25% 0%, rgba(183, 255, 30, 0.15), transparent 50%)'
        }}
      />
      
      <main className="w-full max-w-[480px] min-h-screen relative pb-[120px] flex flex-col z-10 overflow-x-hidden">
        {/* Top App Bar (Mobile View) */}
        <div className="flex justify-end px-5 w-full sticky top-0 z-40 h-12 items-center">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1e201d] border border-white/5 text-[#B7FF1E] hover:opacity-80 transition-opacity active:scale-95 transition-transform mt-2 relative z-10">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-5 gap-6">
          {/* Header */}
          <div>
            <h2 className="text-[clamp(24px,7vw,28px)] leading-tight font-bold text-white font-['Poppins'] tracking-tight break-words">Payments</h2>
            <p className="text-[clamp(11px,3.5vw,12px)] leading-relaxed text-[#858A7D] mt-1 font-['Poppins']">Manage your gym subscriptions and history</p>
          </div>

          {/* Upcoming Payment Card */}
          <section>
            <div className="bg-[#1e201d] border border-white/5 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(213,255,64,0.05),transparent_70%)] pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[clamp(9px,3vw,11px)] leading-none font-semibold text-[#B7FF1E] uppercase tracking-wider mb-1 font-['Poppins']">Upcoming Due</p>
                  <h3 className="text-[clamp(32px,10vw,40px)] leading-none font-bold text-white font-['Poppins'] tracking-tighter truncate">₹1,200</h3>
                </div>
                <div className="bg-[#333532] rounded-full w-10 h-10 flex items-center justify-center border border-white/5">
                  <LucideCalendarDays className="w-5 h-5 text-[#B7FF1E]" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 relative z-10">
                <span className="w-2 h-2 rounded-full bg-[#FF5964]"></span>
                <p className="text-[12px] leading-[18px] text-[#858A7D] font-['Poppins']">
                  Due on <span className="text-white font-semibold">June 1st, 2026</span>
                </p>
              </div>

              <button className="w-full h-12 bg-[#B7FF1E] text-[#293500] rounded-full text-[18px] leading-[24px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all relative z-10 font-['Poppins'] shadow-[0_0_15px_rgba(183,255,30,0.3)]">
                Pay Now
                <LucideChevronRight className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Gym Plans Carousel */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins']">Gym Plans</h3>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5 snap-x">
              {/* Standard Plan Card */}
              <div className="min-w-[260px] xs:min-w-[280px] bg-[#1e201d] border border-white/5 rounded-2xl p-5 snap-center relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at left top, rgba(213, 255, 64, 0.05), transparent 60%)' }}></div>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[22px] leading-[26px] font-bold text-white font-['Poppins']">Standard</h4>
                    <span className="text-[11px] leading-[14px] font-semibold bg-[#333532] text-[#C0C2B8] px-2 py-1 rounded-md font-['Poppins'] uppercase">Monthly</span>
                  </div>
                  <p className="text-[12px] leading-[18px] text-[#858A7D] mb-4 font-['Poppins']">Access to all gym equipment and locker rooms.</p>
                  <div className="mb-6">
                    <span className="text-[32px] leading-[36px] font-bold text-white font-['Poppins']">₹1,200</span>
                    <span className="text-[#858A7D] text-[12px] leading-[18px] font-['Poppins']">/mo</span>
                  </div>
                </div>
                <button className="w-full h-10 bg-[#333532] text-[#B7FF1E] rounded-full text-[11px] leading-[14px] font-semibold border border-white/10 hover:bg-[#333532]/80 transition-colors active:scale-95 font-['Poppins'] uppercase tracking-wider">
                  Select Plan
                </button>
              </div>

              {/* Elite Plan Card */}
              <div className="min-w-[260px] xs:min-w-[280px] bg-[#1e201d] border border-[#B7FF1E]/20 rounded-2xl p-5 snap-center relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at left top, rgba(213, 255, 64, 0.05), transparent 60%)' }}></div>
                <div className="absolute top-0 right-0 bg-[#B7FF1E] text-[#293500] text-[9px] leading-[12px] font-semibold px-3 py-1 rounded-bl-lg uppercase tracking-widest font-['Poppins'] shadow-[0_0_10px_rgba(183,255,30,0.2)]">
                  Popular
                </div>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[22px] leading-[26px] font-bold text-white font-['Poppins']">Elite</h4>
                    <span className="text-[11px] leading-[14px] font-semibold bg-[#333532] text-[#C0C2B8] px-2 py-1 rounded-md mt-1 font-['Poppins'] uppercase">Quarterly</span>
                  </div>
                  <p className="text-[12px] leading-[18px] text-[#858A7D] mb-4 font-['Poppins']">Standard + AI Coach, Sauna, and priority booking.</p>
                  <div className="mb-6">
                    <span className="text-[32px] leading-[36px] font-bold text-white font-['Poppins']">₹3,000</span>
                    <span className="text-[#858A7D] text-[12px] leading-[18px] font-['Poppins']">/3mo</span>
                  </div>
                </div>
                <button className="w-full h-10 bg-[#333532] text-[#B7FF1E] rounded-full text-[11px] leading-[14px] font-semibold border border-white/10 hover:bg-[#333532]/80 transition-colors active:scale-95 font-['Poppins'] uppercase tracking-wider">
                  Select Plan
                </button>
              </div>
            </div>
          </section>

          {/* Payment History List */}
          <section className="flex flex-col gap-3 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins']">Payment History</h3>
              <button className="text-[#B7FF1E] text-[11px] leading-[14px] font-semibold hover:opacity-80 font-['Poppins'] uppercase tracking-wider">View All</button>
            </div>
            
            <div className="flex flex-col gap-2">
              {/* Transaction 1 */}
              <div className="bg-[#1e201d] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-[#333532] transition-colors cursor-pointer relative overflow-hidden group">
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to right, rgba(213, 255, 64, 0.03), transparent)' }}></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center text-[#B7FF1E]">
                    <LucideCheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[14px] leading-[20px] text-white font-semibold font-['Poppins']">Standard Plan</p>
                    <p className="text-[12px] leading-[18px] text-[#858A7D] font-['Poppins']">May 1st, 2026 • Paid via UPI</p>
                  </div>
                </div>
                <span className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins'] relative z-10">₹1,200</span>
              </div>

              {/* Transaction 2 */}
              <div className="bg-[#1e201d] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-[#333532] transition-colors cursor-pointer relative overflow-hidden group">
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to right, rgba(213, 255, 64, 0.03), transparent)' }}></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center text-[#B7FF1E]">
                    <LucideCheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[14px] leading-[20px] text-white font-semibold font-['Poppins']">Standard Plan</p>
                    <p className="text-[12px] leading-[18px] text-[#858A7D] font-['Poppins']">Apr 1st, 2026 • Paid via Card</p>
                  </div>
                </div>
                <span className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins'] relative z-10">₹1,200</span>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Nav Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1e201d] border-t border-white/5 shadow-lg px-2 py-2 pb-safe flex justify-around items-center h-[64px] rounded-t-2xl">
          <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
            <LucideHome className="w-6 h-6 mb-1" />
            <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Home</span>
          </Link>
          
          <Link to="/dashboard/m/payments" className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-1 min-w-[60px] scale-90 transition-all duration-200">
            <LucideCreditCard className="w-6 h-6 mb-1" />
            <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Payments</span>
          </Link>
          
          <div className="relative -top-6">
            <button className="w-16 h-16 bg-[#B7FF1E] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(213,255,64,0.3)] border-4 border-[#1e201d] hover:scale-105 transition-transform">
              <LucideScanQrCode className="w-[30px] h-[30px] text-[#293500]" />
            </button>
          </div>
          
          <Link to="/dashboard/m/attendance" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
            <LucideCalendarDays className="w-6 h-6 mb-1" />
            <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Attendance</span>
          </Link>
          
          <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
            <LucideUser className="w-6 h-6 mb-1" />
            <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Profile</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}