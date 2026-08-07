import { createFileRoute, Link } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute('/dashboard/super-admin/payments')({
  component: SuperAdminPayments,
});

function SuperAdminPayments() {
  const { data: gyms } = useQuery({
    queryKey: ['super-admin-payments-gyms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gyms').select('*');
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins'] pb-[96px] glow-top">
      <style>{`
        .glow-top {
          background: radial-gradient(circle at top, rgba(183, 255, 30, 0.1) 0%, transparent 50%);
        }
      `}</style>
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#121411] max-w-[480px] mx-auto left-0 right-0">
        <div className="flex justify-between items-center px-5 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#333532] overflow-hidden border border-white/10">
              <img 
                alt="Admin Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFJ9tldG3zq9aiXfnJObpWRNrC7c5uCu8MSeZQL9M08-g3tgM66h5Pmu7rOgskdaQdX6DH75MJYKn-NxlLOJsyn2qc9DLtDb1GejaOW4j1W9Y06IPPkqZBoMPRxKGddRc6TtIMCnc_bf035OZslm_0EQGqoHg0YKV7sBs3eTUZno-ehogQBEbrJwwjS4EWJHfiw6AeoYFnrEbdwyKXvGxcoDSWJh5mABbmtBqJpnxRHnbPIgZrKw" 
              />
            </div>
            <h1 className="text-[22px] font-bold tracking-tighter text-[#B7FF1E]">GymSync</h1>
          </div>
          <button aria-label="Notifications" className="w-10 h-10 flex items-center justify-center text-[#B7FF1E] transition-all active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="max-w-[480px] mx-auto pt-16 px-5 flex flex-col gap-6 mt-6">
        {/* Header Section */}
        <section>
          <h1 className="text-[28px] font-bold text-white mb-1 leading-tight">Platform Revenue</h1>
          <p className="text-[14px] text-[#858A7D]">August 2026 Collections</p>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 gap-3">
          <div className="bg-[#121411] border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#B7FF1E]/5 rounded-full blur-2xl group-hover:bg-[#B7FF1E]/10 transition-colors"></div>
            <div className="flex justify-between items-start w-full relative z-10">
              <span className="text-[14px] text-[#858A7D]">Total Collected</span>
              <div className="flex items-center gap-1 bg-[#B7FF1E]/10 px-2 py-1 rounded-full border border-[#B7FF1E]/20">
                <span className="material-symbols-outlined text-[14px] text-[#B7FF1E]">trending_up</span>
                <span className="text-[11px] font-semibold text-[#B7FF1E]">+15%</span>
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <span className="text-[40px] font-bold text-white leading-none">₹42,500</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121411] border border-white/5 rounded-xl p-4 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] text-[#858A7D]">Paid Gyms</span>
                <span className="material-symbols-outlined text-[#858A7D] text-lg">check_circle</span>
              </div>
              <span className="text-[22px] font-bold text-white">38</span>
            </div>
            <div className="bg-[#121411] border border-[#FF5964]/30 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[#FF5964]/5"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[12px] text-[#858A7D]">Overdue</span>
                  <span className="material-symbols-outlined text-[#FF5964] text-lg">warning</span>
                </div>
                <span className="text-[22px] font-bold text-[#FF5964]">4</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Controls */}
        <section className="flex flex-col gap-3">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#858A7D]">search</span>
            <input 
              className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl pl-10 pr-4 text-white placeholder:text-[#858A7D] focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E] outline-none transition-all" 
              placeholder="Search gyms, plans..." 
              type="text" 
            />
          </div>
          <div className="flex p-1 bg-[#292A28] rounded-lg overflow-x-auto scrollbar-hide">
            <button className="flex-1 min-w-[100px] py-2 px-4 rounded-md bg-[#B7FF1E] text-black text-[11px] font-semibold transition-all shadow-[0_2px_8px_rgba(183,255,30,0.2)]">All</button>
            <button className="flex-1 min-w-[100px] py-2 px-4 rounded-md text-[#C0C2B8] hover:text-white text-[11px] font-semibold transition-all">Paid</button>
            <button className="flex-1 min-w-[120px] py-2 px-4 rounded-md text-[#C0C2B8] hover:text-white text-[11px] font-semibold transition-all">Pending/Overdue</button>
          </div>
        </section>

        {/* List of Gyms */}
        <section className="flex flex-col gap-2">
          {gyms?.map((gym, idx) => (
            <div key={gym.id} className={`bg-[#121411] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-colors cursor-pointer group ${idx === 2 ? 'border-l-2 border-l-[#FF5964]' : ''}`}>
              <div className="w-12 h-12 rounded-lg bg-[#292A28] flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[#B7FF1E]/30 transition-colors">
                <span className="material-symbols-outlined text-white">fitness_center</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[18px] font-semibold text-white truncate pr-2">{gym.name}</h3>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${idx === 2 ? 'text-[#FF5964] bg-[#FF5964]/10 border-[#FF5964]/20' : 'text-[#B7FF1E] bg-[#B7FF1E]/10 border-[#B7FF1E]/20'}`}>
                    {idx === 2 ? 'OVERDUE' : 'PAID'}
                  </span>
                </div>
                <p className="text-[12px] text-[#C0C2B8] truncate">Standard Plan (₹499)</p>
                <p className={`text-[11px] font-semibold mt-1 ${idx === 2 ? 'text-[#FF5964]' : 'text-[#858A7D]'}`}>
                  {idx === 2 ? 'Due: Aug 05, 2026' : 'Paid on: Aug 02, 2026'}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#858A7D] group-hover:text-[#B7FF1E] transition-colors">chevron_right</span>
            </div>
          ))}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe rounded-t-[24px] max-w-[480px] left-1/2 -translate-x-1/2">
        <Link 
          to="/dashboard/super-admin"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0', color: isActive ? '#B7FF1E' : '#C0C2B8' }}>home</span>
              <span className="text-[11px] font-semibold leading-[14px]">Home</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/super-admin/payments"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0', color: isActive ? '#B7FF1E' : '#C0C2B8' }}>payments</span>
              <span className="text-[11px] font-semibold leading-[14px]">Payments</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/super-admin/gyms"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0', color: isActive ? '#B7FF1E' : '#C0C2B8' }}>fitness_center</span>
              <span className="text-[11px] font-semibold leading-[14px]">Gyms</span>
            </>
          )}
        </Link>
      </nav>
    </div>
  );
}
