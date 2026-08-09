import { createFileRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/dashboard/m')({
  component: MemberDashboard,
});

function MemberDashboardLayout() {
  return <Outlet />;
}

export function MemberDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
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
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="flex justify-center min-h-screen bg-[#121411] text-[#e3e3dd] antialiased font-['Poppins']">


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
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="flex justify-center min-h-screen bg-[#121411] text-[#e3e3dd] antialiased font-['Poppins']">
      {/* Ensure Google Material Symbols are loaded */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
  return (
    <div className="flex justify-center min-h-screen bg-[#121411] text-[#e3e3dd] antialiased font-['Poppins']">
      {/* Ensure Google Material Symbols are loaded */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
          {/* Global ambient glow */}
          <div 
            className="fixed top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% -20%, rgba(183, 255, 30, 0.15), transparent 70%)'
            }}
          />
          
          <main className="w-full max-w-[480px] min-h-screen relative pb-[100px] flex flex-col z-10 no-scrollbar">
            {/* Top App Bar */}
            <header className="flex justify-between items-center px-5 h-[80px] w-full sticky top-0 z-40 bg-transparent pt-6">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-[18px] leading-[24px] font-semibold text-white">Hi, Johan</h1>
                  <p className="text-[14px] leading-[20px] text-[#C0C2B8]">Ready to crush it today?</p>
                </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-white/20 transition-colors focus:outline-none"
                >
                  <img 
                    alt="Profile avatar" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuACajaR2PjILkSEOoatycCJ36DX_-AVsZnEodZIF4WU9HcJM2MkjXI2qDWN0odA1lIrrhCgSk2rNd_WNw8L5jOa3wK0ypjzmgHTwBjlD48-xJ7Pa4gnBHM6Dym0FJiTEYF42jQugxJ2xQWYX5HcwRUK-RGVETvhKLNOdwY5yW6j9rA8jlooFx5CczVg0yjGKDzyTd9_cqhGeblF-vY4--0YoxCJxwxrUmpx0lRH0Q4zriAz0tIGdA" 
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1e201d] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-white/5 transition-colors text-[14px]"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </header>

            <div className="px-5 flex flex-col gap-6 mt-6">
              {/* Primary Payment Card */}
              <section className="bg-[#1e201d] rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#aed502]/10 rounded-full blur-2xl"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h2 className="text-[12px] leading-[18px] text-[#C0C2B8] uppercase tracking-wider mb-1">Last Payment</h2>
                    <div className="flex items-end gap-2">
                      <span className="text-[40px] leading-[40px] font-bold text-white tracking-tight">₹1,200</span>
                      <span className="text-[12px] leading-[18px] text-[#C0C2B8] mb-1">/ May 1st</span>
                    </div>
                  </div>
                  <div className="bg-[#333532] rounded-full p-2 border border-white/5 flex items-center justify-center w-10 h-10">
                    <span className="material-symbols-outlined text-[#B7FF1E]">receipt_long</span>
                  </div>
                </div>

                <div className="bg-[#121411] rounded-xl p-4 flex justify-between items-center border border-white/5 relative z-10">
                  <div>
                    <h3 className="text-[12px] leading-[18px] text-[#C0C2B8] mb-0.5">Next Due</h3>
                    <p className="text-[18px] leading-[24px] font-semibold text-white">June 1st</p>
                  </div>
                  <button className="bg-[#B7FF1E] text-[#293500] text-[18px] leading-[24px] font-semibold px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(183,255,30,0.3)]">
                    Pay Now
                  </button>
                </div>
              </section>

              {/* Attendance Section */}
              <section className="bg-[#1e201d] rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-[18px] leading-[24px] font-semibold text-white">This Month's Attendance</h2>
                  <div className="flex flex-col items-end">
                    <span className="text-[40px] leading-[40px] font-bold text-[#B7FF1E] tracking-tight">18</span>
                    <span className="text-[11px] leading-[14px] font-semibold text-[#B7FF1E] uppercase tracking-wider">Days</span>
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
                  <h2 className="text-[18px] leading-[24px] font-semibold text-white">Recent Activity</h2>
                  <button className="text-[12px] leading-[18px] text-[#B7FF1E] hover:underline">View All</button>
                </div>

                <div className="bg-[#1e201d] rounded-xl p-4 flex items-center gap-4 border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center text-[#B7FF1E]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>history</span>
                  </div>
                  <div>
                    <h3 className="text-[18px] leading-[24px] font-semibold text-white">Today</h3>
                    <p className="text-[12px] leading-[18px] text-[#C0C2B8]">06:45 PM Check-in</p>
                  </div>
                </div>

                <div className="bg-[#1e201d] rounded-xl p-4 flex items-center gap-4 border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center text-[#C0C2B8]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>history</span>
                  </div>
                  <div>
                    <h3 className="text-[18px] leading-[24px] font-semibold text-white">Yesterday</h3>
                    <p className="text-[12px] leading-[18px] text-[#C0C2B8]">07:12 AM Check-in</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Bottom Nav Bar */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1e201d] border-t border-white/5 shadow-lg px-2 py-2 pb-safe flex justify-around items-center h-[64px] rounded-t-2xl">
              <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-1 w-[72px] h-[64px] scale-90 transition-all duration-200">
                <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
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

export const Route = createFileRoute('/dashboard/m')({
  component: MemberDashboardLayout,
});
