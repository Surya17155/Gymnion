import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { LucideReceiptText, LucideHistory, LucideScanQrCode, LucideHome, LucideCreditCard, LucideCalendarDays, LucideUser } from 'lucide-react';

export const Route = createFileRoute('/dashboard/m')({
  component: MemberDashboard,
});

function MemberDashboard() {
  const location = useLocation();
  const isHome = location.pathname === '/dashboard/m' || location.pathname === '/dashboard/m/';

  return (
    <div className="flex justify-center min-h-screen bg-[#121411]">
      {/* 
          This route acts as a layout for its children (like /payments).
          If we are at the base path (/dashboard/m), we show the home content.
          Otherwise, we show the Outlet (the child route).
      */}
      
      {!isHome ? (
        <Outlet />
      ) : (
        <>
          {/* Global ambient glow */}
          <div 
            className="fixed top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% -20%, rgba(183, 255, 30, 0.15), transparent 70%)'
            }}
          />
          
          <main className="w-full max-w-[480px] min-h-screen relative pb-[100px] flex flex-col z-10">
            {/* Top App Bar */}
            <header className="flex justify-between items-center px-5 h-[80px] w-full sticky top-0 z-40 bg-transparent pt-6">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins']">Hi, Johan</h1>
                  <p className="text-[14px] leading-[20px] text-[#C0C2B8] font-['Poppins']">Ready to crush it today?</p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                <img 
                  alt="Profile avatar" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACajaR2PjILkSEOoatycCJ36DX_-AVsZnEodZIF4WU9HcJM2MkjXI2qDWN0odA1lIrrhCgSk2rNd_WNw8L5jOa3wK0ypjzmgHTwBjlD48-xJ7Pa4gnBHM6Dym0FJiTEYF42jQugxJ2xQWYX5HcwRUK-RGVETvhKLNOdwY5yW6j9rA8jlooFx5CczVg0yjGKDzyTd9_cqhGeblF-vY4--0YoxCJxwxrUmpx0lRH0Q4zriAz0tIGdA" 
                />
              </div>
            </header>

            <div className="px-5 flex flex-col gap-6 mt-6">
              {/* Primary Payment Card */}
              <section className="bg-[#1e201d] rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                {/* Inner glow effect for card */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#aed502]/10 rounded-full blur-2xl"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h2 className="text-[12px] leading-[18px] text-[#C0C2B8] uppercase tracking-wider mb-1 font-['Poppins']">Last Payment</h2>
                    <div className="flex items-end gap-2">
                      <span className="text-[40px] leading-[40px] font-bold text-white font-['Poppins'] tracking-tight">₹1,200</span>
                      <span className="text-[12px] leading-[18px] text-[#C0C2B8] mb-1 font-['Poppins']">/ May 1st</span>
                    </div>
                  </div>
                  <div className="bg-[#333532] rounded-full p-2 border border-white/5">
                    <LucideReceiptText className="w-6 h-6 text-[#B7FF1E]" />
                  </div>
                </div>

                <div className="bg-[#121411] rounded-xl p-4 flex justify-between items-center border border-white/5 relative z-10">
                  <div>
                    <h3 className="text-[12px] leading-[18px] text-[#C0C2B8] mb-0.5 font-['Poppins']">Next Due</h3>
                    <p className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins']">June 1st</p>
                  </div>
                  <button className="bg-[#B7FF1E] text-[#293500] text-[18px] leading-[24px] font-semibold px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(183,255,30,0.3)] font-['Poppins']">
                    Pay Now
                  </button>
                </div>
              </section>

              {/* Attendance Section */}
              <section className="bg-[#1e201d] rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins']">This Month's Attendance</h2>
                  <div className="flex flex-col items-end">
                    <span className="text-[40px] leading-[40px] font-bold text-[#B7FF1E] font-['Poppins'] tracking-tight">18</span>
                    <span className="text-[11px] leading-[14px] font-semibold text-[#B7FF1E] uppercase tracking-wider font-['Poppins']">Days</span>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="grid grid-cols-7 gap-2 w-fit">
                    {[...Array(30)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-[14px] h-[14px] rounded-[4px] ${i < 3 || (i > 3 && i < 7) || (i > 7 && i < 11) || (i > 11 && i < 15) || (i > 15 && i < 19) || (i > 19 && i < 23) ? 'bg-[#B7FF1E]' : 'bg-[#333532]'}`}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Recent Activity List */}
              <section className="flex flex-col gap-3">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins']">Recent Activity</h2>
                  <button className="text-[12px] leading-[18px] text-[#B7FF1E] hover:underline font-['Poppins']">View All</button>
                </div>

                <div className="bg-[#1e201d] rounded-xl p-4 flex items-center gap-4 border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center text-[#B7FF1E]">
                    <LucideHistory className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins']">Today</h3>
                    <p className="text-[12px] leading-[18px] text-[#C0C2B8] font-['Poppins']">06:45 PM Check-in</p>
                  </div>
                </div>

                <div className="bg-[#1e201d] rounded-xl p-4 flex items-center gap-4 border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center text-[#C0C2B8]">
                    <LucideHistory className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[18px] leading-[24px] font-semibold text-white font-['Poppins']">Yesterday</h3>
                    <p className="text-[12px] leading-[18px] text-[#C0C2B8] font-['Poppins']">07:12 AM Check-in</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Bottom Nav Bar */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1e201d] border-t border-white/5 shadow-lg px-2 py-2 pb-safe flex justify-around items-center h-[64px] rounded-t-2xl">
              <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-1 min-w-[60px] scale-90 transition-all duration-200">
                <LucideHome className="w-6 h-6 mb-1" />
                <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Home</span>
              </Link>
              
              <Link to="/dashboard/m/payments" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
                <LucideCreditCard className="w-6 h-6 mb-1" />
                <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Payments</span>
              </Link>
              
              <div className="relative -top-6">
                <button className="w-16 h-16 bg-[#B7FF1E] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(213,255,64,0.3)] border-4 border-[#1e201d] hover:scale-105 transition-transform">
                  <LucideScanQrCode className="w-[30px] h-[30px] text-[#293500]" />
                </button>
              </div>
              
              <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
                <LucideCalendarDays className="w-6 h-6 mb-1" />
                <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Attendance</span>
              </Link>
              
              <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
                <LucideUser className="w-6 h-6 mb-1" />
                <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Profile</span>
              </Link>
            </nav>
          </main>
        </>
      )}
    </div>
  );
}