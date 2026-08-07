import { createFileRoute, Link } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/super-admin/gyms')({
  component: SuperAdminGyms,
});

function SuperAdminGyms() {
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: gyms, isLoading } = useQuery({
    queryKey: ['super-admin-gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const filteredGyms = gyms?.filter(gym => 
    gym.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    gym.gym_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins'] pb-[96px] glow-top">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
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
        {/* Hero Metric Card */}
        <section className="bg-[#121411] border border-white/5 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#B7FF1E]/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div className="flex flex-col gap-2">
              <h2 className="text-[18px] font-semibold text-[#858A7D]">Total Connected Gyms</h2>
              <div className="text-[40px] font-bold text-[#e3e3dd]">{gyms?.length || 0}</div>
            </div>
            <button className="w-12 h-12 rounded-full bg-[#B7FF1E] text-black flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(183,255,30,0.3)] active:scale-95">
              <span className="material-symbols-outlined font-bold text-[28px]">add</span>
            </button>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="flex flex-col gap-3">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#858A7D]">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl pl-10 pr-4 text-[#e3e3dd] focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E] transition-colors placeholder:text-[#858A7D] outline-none" 
              placeholder="Search gyms..." 
              type="text"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button className="px-4 py-1.5 rounded-full bg-[#B7FF1E] text-black text-[11px] font-semibold whitespace-nowrap">All Gyms</button>
            <button className="px-4 py-1.5 rounded-full bg-[#1e201d] text-[#C0C2B8] text-[11px] font-semibold border border-white/5 whitespace-nowrap">Approved</button>
            <button className="px-4 py-1.5 rounded-full bg-[#1e201d] text-[#C0C2B8] text-[11px] font-semibold border border-white/5 whitespace-nowrap">Pending Review</button>
          </div>
        </section>

        {/* Gallery / List */}
        <section className="flex flex-col gap-3 pb-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-[#B7FF1E]/20 border-t-[#B7FF1E] rounded-full animate-spin"></div>
            </div>
          ) : (
            filteredGyms?.map((gym) => (
              <div 
                key={gym.id}
                onClick={() => setSelectedGym(gym)}
                className="bg-[#121411] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-[#B7FF1E]/30 transition-colors cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-xl bg-[#333532] flex-shrink-0 overflow-hidden border border-white/5 relative">
                  <div className="w-full h-full bg-[#1e201d] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#858A7D] text-[32px]">fitness_center</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-[18px] font-semibold text-[#e3e3dd]">{gym.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#B7FF1E]"></div>
                    <span className="text-[12px] text-[#C0C2B8]">Code: {gym.gym_code || '---'}</span>
                  </div>
                </div>
                <div className="text-[#858A7D] group-hover:text-[#B7FF1E] transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Detail Drawer */}
      {selectedGym && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGym(null)}></div>
          <div className="relative bg-[#121411] border-t border-white/10 rounded-t-[32px] p-6 pb-12 w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-[#1e201d] rounded-full mx-auto mb-8"></div>
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-[#1e201d] flex items-center justify-center border border-[#B7FF1E]/20 text-[#B7FF1E]">
                <span className="material-symbols-outlined text-4xl">fitness_center</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedGym.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#B7FF1E]"></span>
                  <span className="text-[11px] text-[#B7FF1E] font-bold tracking-widest uppercase">Verified Partner</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-[0.15em] block mb-3">Administrator Details</label>
                <div className="bg-[#1e201d]/30 rounded-2xl p-4 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#858A7D] uppercase font-bold">Name</p>
                      <p className="text-[14px] text-white font-medium">{selectedGym.owner_name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#858A7D] uppercase font-bold">Email</p>
                      <p className="text-[14px] text-white font-medium">{selectedGym.owner_email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-[0.15em] block mb-3">Gym Configuration</label>
                <div className="bg-[#1e201d]/30 rounded-2xl p-4 border border-white/5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#858A7D] uppercase font-bold mb-1">Gym Code</p>
                    <p className="text-[18px] font-bold text-[#B7FF1E] font-mono tracking-wider">{selectedGym.gym_code || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#858A7D] uppercase font-bold mb-1">Join Date</p>
                    <p className="text-[14px] text-white font-medium">{new Date(selectedGym.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedGym(null)}
              className="w-full mt-10 py-[18px] bg-[#B7FF1E] text-black text-[16px] font-bold rounded-2xl shadow-[0_12px_24px_rgba(183,255,30,0.15)] active:scale-95 transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px] left-1/2 -translate-x-1/2">
        <Link 
          to="/dashboard/super-admin"
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
          to="/dashboard/super-admin"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>payments</span>
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
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>fitness_center</span>
              <span className="text-[11px] font-semibold leading-[14px]">Gyms</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/super-admin"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>calendar_today</span>
              <span className="text-[11px] font-semibold leading-[14px]">Attendance</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/super-admin"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>person</span>
              <span className="text-[11px] font-semibold leading-[14px]">Profile</span>
            </>
          )}
        </Link>
      </nav>
    </div>
  );
}
