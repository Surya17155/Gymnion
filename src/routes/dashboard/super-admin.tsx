import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/super-admin')({
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  return (
    <div className="bg-[#0D0F0C] text-[#e3e3dd] min-h-screen relative overflow-x-hidden pb-16 font-sans">
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(213,255,64,0.1) 0%, rgba(13,15,12,0) 70%)'
        }}
      />
      
      {/* Desktop Navigation Drawer */}
      <nav className="hidden md:flex flex-col h-full py-6 fixed bg-[#121411] border-r border-white/5 shadow-xl left-0 w-64 z-40">
        <div className="px-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#333532] overflow-hidden border border-white/10">
            <img alt="Admin User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfpQiHw9eCz0Vfy49eiA0qy2qGQf0tU5YGnHR_ucD6e-Z--zxkUk7Qqk0MlfZD8qxTvR3DV5X3K9COobOzRS9lUgXYI9lNP9jxrvuW4LsVlJOzOiFPPfywBx3wBHTVxtXvNbWK9AlfRe2CIVuRnKmA4RWVdGbvI9LKPnQLZAR9qw1I3BX_R2Mrs7z-kMnTelX0N83e0d6UsCAiLf24MffWxaJIw2irmcYRtDoCGtf2oM8GiQT1Ig" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#B7FF1E]">Gym Admin</h2>
            <p className="text-xs text-[#C0C2B8]">Global Head</p>
            <p className="text-[11px] font-semibold text-[#858A7D] mt-1">V.1.0.4</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <a className="bg-[#B7FF1E] text-[#1a1c19] rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm font-semibold translate-x-1 transition-transform shadow-[0_0_15px_rgba(183,255,30,0.3)]" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>dashboard</span>
            Dashboard
          </a>
          <a className="text-[#C0C2B8] hover:text-white hover:bg-[#333532] transition-colors mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm font-semibold" href="#">
            <span className="material-symbols-outlined">group</span>
            Members
          </a>
          <a className="text-[#C0C2B8] hover:text-white hover:bg-[#333532] transition-colors mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm font-semibold" href="#">
            <span className="material-symbols-outlined">how_to_reg</span>
            Attendance
          </a>
          <a className="text-[#C0C2B8] hover:text-white hover:bg-[#333532] transition-colors mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm font-semibold" href="#">
            <span className="material-symbols-outlined">receipt_long</span>
            Payments
          </a>
          <a className="text-[#C0C2B8] hover:text-white hover:bg-[#333532] transition-colors mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm font-semibold" href="#">
            <span className="material-symbols-outlined">layers</span>
            Fee Plans
          </a>
          <a className="text-[#C0C2B8] hover:text-white hover:bg-[#333532] transition-colors mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm font-semibold" href="#">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 relative z-10 w-full max-w-[480px] mx-auto md:max-w-none flex flex-col pt-6 px-5">
        <div className="md:hidden flex items-center mb-8">
          <h1 className="text-[22px] font-bold text-white">Dashboard</h1>
          <div className="flex-1"></div>
          <div className="w-10 h-10 rounded-full bg-[#333532] border border-white/10 overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-[#C0C2B8]">person</span>
          </div>
        </div>

        <header className="hidden md:flex justify-between items-center px-8 h-20 w-full border-b border-white/5 bg-[#121411]/80 backdrop-blur-md sticky top-0 z-30 mb-8">
          <h1 className="text-[22px] font-bold">Platform Overview</h1>
          <button className="bg-[#B7FF1E] text-[#1a1c19] text-sm font-normal px-4 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(183,255,30,0.2)]">
            <span className="material-symbols-outlined text-[18px]">add</span>Invite Gym
          </button>
        </header>

        <div className="flex flex-col gap-6 md:p-8 md:max-w-6xl md:mx-auto w-full pb-20">
          {/* Action Queue */}
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[#e3e3dd]">Who Needs My Attention</h2>
              <button className="md:hidden bg-[#B7FF1E] text-[#1a1c19] text-[10px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(183,255,30,0.15)] active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[14px]">add</span>Invite Gym
              </button>
            </div>

            <div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0">
              {/* Pending Approvals */}
              <div className="snap-start shrink-0 w-[280px] bg-[#151714]/80 backdrop-blur-md rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#B7FF1E]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start z-10">
                  <div className="w-10 h-10 rounded-full bg-[#292A28] flex items-center justify-center border border-[#B7FF1E]/30">
                    <span className="material-symbols-outlined text-[#B7FF1E]">assignment_ind</span>
                  </div>
                  <span className="bg-[#B7FF1E]/20 text-[#B7FF1E] px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase border border-[#B7FF1E]/20">Action Req</span>
                </div>
                <div className="z-10">
                  <p className="text-[40px] font-bold leading-none">12</p>
                  <p className="text-sm text-[#C0C2B8] mt-1">Pending Approvals</p>
                </div>
                <div className="mt-2 pt-3 border-t border-white/10 z-10">
                  <p className="text-[11px] font-semibold text-[#858A7D] truncate">Old Iron Barbell, Zenith Fit...</p>
                </div>
              </div>

              {/* Overdue Subscriptions */}
              <div className="snap-start shrink-0 w-[280px] bg-[#151714]/80 backdrop-blur-md rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden border border-white/5">
                <div className="flex justify-between items-start z-10">
                  <div className="w-10 h-10 rounded-full bg-[#292A28] flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-[#FF5964]">warning</span>
                  </div>
                </div>
                <div className="z-10">
                  <p className="text-[40px] font-bold leading-none">4</p>
                  <p className="text-sm text-[#C0C2B8] mt-1">Overdue Subscriptions</p>
                </div>
                <div className="mt-2 pt-3 border-t border-white/10 z-10">
                  <p className="text-[11px] font-semibold text-[#858A7D] truncate">Action needed to prevent churn</p>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Growth */}
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#e3e3dd]">Platform Growth</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[120px]">
                <p className="text-[11px] font-semibold text-[#858A7D]">Total Active Gyms</p>
                <div>
                  <p className="text-[28px] md:text-[32px] font-bold text-white">142</p>
                  <div className="flex items-center gap-1 mt-1 text-[#B7FF1E] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    <span>+12 this mo</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[120px]">
                <p className="text-[11px] font-semibold text-[#858A7D]">Total Members</p>
                <div>
                  <p className="text-[28px] md:text-[32px] font-bold text-white">45.2k</p>
                  <div className="flex items-center gap-1 mt-1 text-[#B7FF1E] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    <span>+2.4k this mo</span>
                  </div>
                </div>
              </div>
              <div className="col-span-2 bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-col relative overflow-hidden group">
                <div className="flex justify-between items-start z-10">
                  <div>
                    <p className="text-[11px] font-semibold text-[#858A7D]">Monthly Rec. Rev</p>
                    <p className="text-[28px] md:text-[32px] font-bold text-white mt-1">$124K</p>
                  </div>
                  <div className="bg-[#292A28] px-2 py-1 rounded text-[#B7FF1E] text-[11px] font-semibold border border-white/10 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>8.2%
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 z-0 opacity-50 group-hover:opacity-100 transition-opacity">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                    <path fill="none" stroke="#B7FF1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M0 25 L10 22 L20 24 L30 18 L40 20 L50 12 L60 15 L70 8 L80 10 L90 5 L100 2" />
                    <path d="M0 25 L10 22 L20 24 L30 18 L40 20 L50 12 L60 15 L70 8 L80 10 L90 5 L100 2 L100 30 L0 30 Z" fill="url(#mrr-gradient)" opacity="0.2" />
                    <defs>
                      <linearGradient id="mrr-gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#B7FF1E" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Gym Roster List */}
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[#e3e3dd]">Manage Gym Network</h2>
              <button className="text-[#B7FF1E] text-[11px] font-semibold flex items-center gap-1">
                Filter <span className="material-symbols-outlined text-[16px]">filter_list</span>
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#858A7D]">search</span>
              <input className="w-full bg-[#333532] border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm text-white placeholder-[#858A7D] focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E] focus:outline-none transition-colors" placeholder="Search gyms..." type="text" />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-[#333532] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#292A28] overflow-hidden flex-shrink-0 relative">
                    <img alt="Iron Forge" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDro17B8q2EfF2Tu2Cf-xTC8CxDemEYWZa3JNjArQKuJZkco2robC9TdHgInd0lKs1YykhAp4_hTKfFjGuDcITg09mAI4utpaTZFNmZfcKS2U5G9AQzhFykAFM6QbFvIsoo3jI7CFcQIJuGXn7rR5N8cp8ywq8wazDZyp-2KSScqSlFIDUakl_JxcPZ9cNmtGkfy_F57eQiSDxZdUML3h5k8FxoqZRtwg2t-DFddTf5tgLC9ddu7w" />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">Iron Forge Barbell</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#B7FF1E] shadow-[0_0_5px_#B7FF1E]"></span>
                      <span className="text-xs text-[#858A7D]">Active • Active 2h ago</span>
                    </div>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#292A28] flex items-center justify-center text-[#858A7D] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>

              <div className="bg-[#151714]/80 backdrop-blur-md border border-[#B7FF1E]/30 rounded-xl p-4 flex items-center justify-between group hover:bg-[#333532] transition-colors cursor-pointer relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B7FF1E]"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 rounded-lg bg-[#292A28] overflow-hidden flex-shrink-0 relative">
                    <img alt="Zenith" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATbxuDgObaiMldYhfEUz4tHbiEYsRMRSe3JcEewrLq01yuI07x_HLxDZZFwKCkONT2014QgjfeCnqaTa6NtICC5RpSPyBUE0BFIrDLrDrzcRtfwj_DQmYSsDvq1QNmXwk_gTPoy9X0C9P8sUHd7dww93X2m2oxzznp9C3VxdbMbXyu_jN1hiZahdwAc9EQahhep2DsMp95k_Tnv26eBDooTVd9K1V0lChclW8jEWznUf4A9rtzwg" />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">Zenith Fit Studio</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#B7FF1E]/50 animate-pulse"></span>
                      <span className="text-xs text-[#B7FF1E]">Pending Approval</span>
                    </div>
                  </div>
                </div>
                <button className="bg-[#B7FF1E]/20 text-[#B7FF1E] text-[11px] font-bold px-3 py-1.5 rounded border border-[#B7FF1E]/20 hover:bg-[#B7FF1E]/30 transition-colors">
                  Review
                </button>
              </div>
            </div>
            <button className="w-full mt-2 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-[#333532] transition-colors flex items-center justify-center gap-2">
              View All Gyms
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-[#1e201d] border-t border-white/5 shadow-lg rounded-t-xl">
        <a className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-2 scale-90 transition-all duration-200" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
          <span className="text-[11px] font-semibold mt-1">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#C0C2B8] p-2 hover:bg-[#333532] rounded-xl transition-colors" href="#">
          <span className="material-symbols-outlined">payments</span>
          <span className="text-[11px] font-semibold mt-1">Payments</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#C0C2B8] p-2 hover:bg-[#333532] rounded-xl transition-colors" href="#">
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="text-[11px] font-semibold mt-1">Scan</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#C0C2B8] p-2 hover:bg-[#333532] rounded-xl transition-colors" href="#">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[11px] font-semibold mt-1">Attendance</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#C0C2B8] p-2 hover:bg-[#333532] rounded-xl transition-colors" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[11px] font-semibold mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
}
