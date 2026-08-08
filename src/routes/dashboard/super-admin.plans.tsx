import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/super-admin/plans')({
  component: SuperAdminPlans,
});

function SuperAdminPlans() {
  return (
    <div className="flex-1 overflow-y-auto h-full w-full relative z-10 pb-24 md:pb-8">
      {/* Atmospheric Glow */}
      <div className="fixed top-0 left-0 w-full h-96 bg-[#c9f232]/10 blur-[100px] pointer-events-none rounded-full -translate-y-1/2 z-0"></div>
      
      <div className="max-w-[480px] mx-auto w-full pt-12 px-5 md:px-0 relative z-10">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#e3e3dd] leading-tight">
            Subscription<br/>
            <span className="text-[#c9f232]">Management</span>
          </h1>
          <p className="text-sm text-[#C0C2B8] mt-2 font-medium">Manage global tiers and gym-specific overrides.</p>
        </div>

        {/* Zone 1: Global Subscription Plans */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#e3e3dd]">Global Plans</h2>
            <button className="text-[11px] font-bold text-[#c9f232] hover:opacity-80 transition-opacity uppercase tracking-wider">Add New</button>
          </div>
          <div className="space-y-3">
            {/* Standard Plan Card */}
            <div className="bg-[#121411] border border-white/5 rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#383a36]/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="text-[22px] font-bold text-[#e3e3dd]">Standard</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[40px] font-bold text-[#c9f232] tracking-tighter">₹500</span>
                    <span className="text-xs text-[#C0C2B8]">/mo</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-[#C0C2B8]" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6 relative z-10">
                <li className="flex items-center gap-3 text-sm text-[#C0C2B8]">
                  <span className="material-symbols-outlined text-[#c9f232] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Attendance Tracking
                </li>
                <li className="flex items-center gap-3 text-sm text-[#C0C2B8]">
                  <span className="material-symbols-outlined text-[#c9f232] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Payment Management
                </li>
                <li className="flex items-center gap-3 text-sm text-[#C0C2B8]">
                  <span className="material-symbols-outlined text-[#c9f232] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Member Directory
                </li>
              </ul>
              <button className="w-full h-12 bg-[#383a36] text-[#c9f232] text-xs font-bold rounded-full hover:bg-[#333532] transition-colors flex items-center justify-center gap-2 relative z-10 border border-[#c9f232]/20">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Plan
              </button>
            </div>
            
            {/* Unlimited Plan Card */}
            <div className="bg-[#c9f232]/10 border border-[#c9f232]/30 rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c9f232]/20 to-transparent pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="text-[22px] font-bold text-[#c9f232]">Unlimited</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[40px] font-bold text-[#e3e3dd] tracking-tighter">₹999</span>
                    <span className="text-xs text-[#C0C2B8]">/mo</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#c9f232] flex items-center justify-center shadow-[0_0_15px_rgba(201,242,50,0.3)]">
                  <span className="material-symbols-outlined text-[#576c00]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6 relative z-10">
                <li className="flex items-center gap-3 text-sm text-[#e3e3dd]">
                  <span className="material-symbols-outlined text-[#c9f232] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  All Standard Features
                </li>
                <li className="flex items-center gap-3 text-sm text-[#e3e3dd]">
                  <span className="material-symbols-outlined text-[#c9f232] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  AI Diet & Workout Plans
                </li>
                <li className="flex items-center gap-3 text-sm text-[#e3e3dd]">
                  <span className="material-symbols-outlined text-[#c9f232] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Priority Support
                </li>
              </ul>
              <button className="w-full h-12 bg-[#c9f232] text-[#576c00] text-xs font-bold rounded-full hover:bg-[#aed502] transition-colors flex items-center justify-center gap-2 relative z-10 shadow-[0_4px_20px_rgba(201,242,50,0.2)]">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Plan
              </button>
            </div>
          </div>
        </section>

        {/* Zone 2: Gym Overrides */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#e3e3dd]">Gym Overrides</h2>
            <span className="material-symbols-outlined text-[#C0C2B8] text-sm">filter_list</span>
          </div>
          <div className="space-y-3">
            {/* Gym 1 */}
            <div className="bg-[#121411] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <div className="w-12 h-12 rounded-lg bg-[#383a36] flex items-center justify-center overflow-hidden">
                  <img className="w-full h-full object-cover opacity-80" alt="Iron Paradise" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAB2FBT_uUOVSJnbsHzlUYnHYfITXh47U3Ci08hoai9Ai8mxL6B0I3MQyaQEv2w6qe_Hq1LyTTAQil1UxvvxnsxaNFOz_8SuFoLVvzNp5xeZXryn_-uXZCLA0dDu-rk8vGz8iejk32AxVE2qRa3tvbw_69N8AnpuMNVI8yY0kC8B40lqmMEHRAfk3zEGfLyWXt0lb9XWUUraIvPauRj3kMmm83-ayUaC2Qk_tUQKxRZ_6kluh4gg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#e3e3dd]">Iron Paradise</h3>
                  <p className="text-xs text-[#C0C2B8]">Standard Plan</p>
                </div>
              </div>
              <div className="space-y-4 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#C0C2B8]">Attendance Tracking</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-[#333532] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9f232] peer-checked:after:bg-[#576c00]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#C0C2B8]">Payments Module</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-[#333532] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9f232] peer-checked:after:bg-[#576c00]"></div>
                  </label>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#858A7D] block mb-1 uppercase tracking-wider">Custom Price Override</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-lg font-semibold text-[#C0C2B8]">₹</span>
                    </div>
                    <input className="w-full h-12 bg-[#1a1c19] border border-white/10 rounded-xl pl-8 pr-4 text-white font-bold focus:border-[#c9f232] outline-none" placeholder="500" type="number" />
                  </div>
                </div>
              </div>
              <button className="w-full py-3 bg-[#c9f232] text-[#576c00] text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                Update Settings
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
