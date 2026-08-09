import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFeePlans } from '@/lib/auth.functions';

export const Route = createFileRoute('/dashboard/admin/plans')({
  component: AdminPlans,
});


function AdminPlans() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['fee_plans'],
    queryFn: () => getFeePlans(),
  });


  // Check if we are precisely on the plans list page or a sub-route
  const isPlansList = location.pathname === '/dashboard/admin/plans' || location.pathname === '/dashboard/admin/plans/';

  if (!isPlansList) {
    return <Outlet />;
  }


  return (
    <div className="bg-[#0d0f0c] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Kinetic Glow Background */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top, rgba(183, 255, 30, 0.15) 0%, transparent 70%)'
        }}
      />

      {/* Main Mobile Container */}
      <div className="max-w-[480px] mx-auto min-h-screen relative z-10 flex flex-col">
        
        {/* Top App Bar with Back Button and Centered Title */}
        <header className="flex justify-between items-center px-[20px] h-[64px] w-full sticky top-0 z-40 bg-transparent backdrop-blur-md">
          <button 
            onClick={() => navigate({ to: '/dashboard/admin/settings' })}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity text-[#B7FF1E] bg-[#1e201d]/50"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <div className="flex-1 flex justify-center pr-10">
            <h2 className="text-[20px] font-semibold tracking-[-0.015em] text-[#e3e3dd]">Fee Plans</h2>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full px-[20px] pt-[20px] pb-[100px]">
          <div className="mb-[24px]">
            <p className="text-[14px] leading-[20px] text-[#C0C2B8]">Manage your gym's membership options and pricing tiers.</p>
          </div>

          {/* Plan Cards List */}
          <div className="flex flex-col gap-[12px]">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-[#121411] border border-white/5 rounded-[16px] p-[16px] flex flex-col gap-[8px] relative overflow-hidden group cursor-pointer hover:border-[#B7FF1E]/20 transition-all shadow-[inset_0_0_20px_rgba(183,255,30,0.02)] ${!plan.is_active ? 'opacity-70' : ''}`}
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B7FF1E]/10 to-transparent"></div>
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-[#e3e3dd] mb-1">{plan.name}</h2>
                    <p className="text-[12px] leading-[18px] text-[#858A7D] line-clamp-2 pr-8">{plan.description}</p>
                  </div>
                  {/* Status Badge */}
                  <div className={`${plan.is_active ? 'bg-[#aed502]/10 border border-[#aed502]/20' : 'bg-[#292b27] border border-white/10'} rounded-full px-2 py-0.5 flex items-center gap-1 shrink-0`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${plan.is_active ? 'bg-[#A7F52A]' : 'bg-[#C0C2B8]'}`}></div>
                    <span className={`text-[9px] font-semibold ${plan.is_active ? 'text-[#A7F52A]' : 'text-[#C0C2B8]'} uppercase tracking-wider`}>
                      {plan.is_active ? 'Active' : 'Draft'}
                    </span>
                  </div>

                </div>
                <div className="flex justify-between items-end mt-2 pt-3 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-[#C0C2B8] uppercase mb-1">
                      {plan.billing_cycle} Fee
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[18px] font-semibold text-[#e3e3dd]">₹</span>
                      <span className={`text-[28px] leading-none font-bold ${plan.is_active ? 'text-[#B7FF1E]' : 'text-[#C0C2B8]'}`}>

                        {Number(plan.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={`/dashboard/admin/plans/edit/${plan.id}` as any}
                    className="w-8 h-8 rounded-full bg-[#292A28] flex items-center justify-center hover:bg-[#383a36] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#e3e3dd] text-sm">edit</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Floating Action Button (FAB) */}
        <Link 
          to="/dashboard/admin/plans/new"
          className="fixed rounded-full bg-[#B7FF1E] text-[#121411] shadow-[0_4px_20px_rgba(183,255,30,0.3)] flex items-center justify-center z-40 active:scale-95 transition-transform hover:opacity-90 bottom-24 right-6 w-14 h-14"
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>add</span>
        </Link>

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
    </div>
  );
}