import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminLayout,
});

function AdminLayout() {
  const { pathname } = useLocation();
  const isExactAdmin = pathname === '/dashboard/admin';

  if (!isExactAdmin) {
    return <Outlet />;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
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
        <header className="flex justify-between items-center px-[20px] h-[64px] w-full sticky top-0 z-40">
          <div className="flex items-center gap-3">
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity text-[#B7FF1E] bg-[#1e201d]/50">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>person</span>
          </button>
        </header>

        <main className="flex-1 px-[20px] flex flex-col gap-[24px] py-2">
          {/* Page Title */}
          <section className="-mt-4">
            <h2 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white">Dashboard</h2>
            <p className="text-[14px] leading-[20px] text-[#C0C2B8]">Good morning, Admin</p>
          </section>

          {/* KPI Grid */}
          <section className="grid grid-cols-2 gap-3">
            {/* Revenue Card (Full width) */}
            <div className="col-span-2 bg-[#121411] rounded-xl p-[16px] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#B7FF1E]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] leading-[18px] text-[#858A7D] uppercase tracking-wider">Revenue (This Month)</span>
                <span className="material-symbols-outlined text-[#B7FF1E] opacity-50" style={{ fontVariationSettings: '"FILL" 0' }}>payments</span>
              </div>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-[#B7FF1E]">₹45,200</span>
                <div className="flex items-center text-[#A7F52A] text-[11px] font-semibold pb-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>+12%</span>
                </div>
              </div>
            </div>

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
                  <span className="text-[18px] font-semibold text-white">85%</span>
                </div>
              </div>
              <div className="flex justify-between w-full text-[11px] font-semibold">
                <span className="text-[#C0C2B8]">210 Paid</span>
                <span className="text-[#B7FF1E]">32 Pend</span>
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
                <span className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-white block mb-1">14</span>
                <span className="text-[11px] font-semibold text-[#C0C2B8]">Members unpaid</span>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h3 className="text-[18px] font-semibold text-white mb-[12px]">Quick Actions</h3>
            <div className="bg-[#B7FF1E] rounded-xl p-[16px] flex items-center justify-between shadow-[0_0_20px_rgba(183,255,30,0.1)] hover:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#B7FF1E] text-3xl" style={{ fontVariationSettings: '"FILL" 0' }}>qr_code_2</span>
                </div>
                <div>
                  <h4 className="text-[18px] font-semibold text-black">Gym QR Code</h4>
                  <p className="text-[12px] text-black/70">Show to members for check-in</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-black">chevron_right</span>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex justify-between items-center mb-[12px]">
              <h3 className="text-[18px] font-semibold text-white">Recent Activity</h3>
              <span className="text-[11px] font-semibold text-[#B7FF1E] cursor-pointer">View All</span>
            </div>
            <div className="bg-[#121411] rounded-xl border border-white/5 overflow-hidden">
              {/* Item 1 */}
              <div className="p-[16px] border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center text-[#C0C2B8]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>login</span>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] text-white"><span className="font-semibold">Aman Gupta</span> checked in</p>
                  <p className="text-[11px] font-semibold text-[#858A7D]">2 mins ago</p>
                </div>
              </div>
              {/* Item 2 */}
              <div className="p-[16px] border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center text-[#B7FF1E]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>payments</span>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] text-white"><span className="font-semibold">Sarah J.</span> paid ₹1,000</p>
                  <p className="text-[11px] font-semibold text-[#858A7D]">15 mins ago</p>
                </div>
              </div>
              {/* Item 3 */}
              <div className="p-[16px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center text-[#C0C2B8]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>login</span>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] text-white"><span className="font-semibold">Rohan Sharma</span> checked in</p>
                  <p className="text-[11px] font-semibold text-[#858A7D]">45 mins ago</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

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
