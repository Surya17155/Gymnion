import { createFileRoute, Link } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/super-admin/gyms')({
  component: SuperAdminGyms,
});

function SuperAdminGyms() {
  const [selectedGym, setSelectedGym] = useState<any>(null);

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

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
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
        {/* Top Header */}
        <header className="flex items-center px-[20px] h-[64px] w-full sticky top-0 z-40 bg-[#121411]/80 backdrop-blur-md">
          <Link to="/dashboard/super-admin" className="w-10 h-10 rounded-full bg-[#1e201d]/50 flex items-center justify-center mr-4 text-[#B7FF1E]">
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
          <h2 className="text-[20px] font-bold text-white">Gym Network</h2>
        </header>

        <main className="flex-1 px-[20px] flex flex-col gap-[20px] py-2">
          {/* Summary Card */}
          <section>
            <div className="bg-[#121411] rounded-2xl p-[20px] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#B7FF1E]/5 opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] leading-[18px] text-[#858A7D] uppercase tracking-wider">Total Connected Gyms</span>
                <span className="material-symbols-outlined text-[#B7FF1E] opacity-50">fitness_center</span>
              </div>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-[#B7FF1E]">{gyms?.length || 0}</span>
                <div className="flex items-center text-[#A7F52A] text-[11px] font-semibold pb-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </section>

          {/* Search */}
          <section>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#858A7D]">search</span>
              <input 
                className="w-full bg-[#1e201d]/50 border border-white/5 rounded-2xl h-[52px] pl-12 pr-4 text-sm text-white placeholder-[#858A7D] focus:border-[#B7FF1E]/50 focus:outline-none transition-all" 
                placeholder="Search gyms by name or code..." 
                type="text" 
              />
            </div>
          </section>

          {/* List */}
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-[16px] font-semibold text-white">All Gyms</h3>
              <span className="text-[11px] font-semibold text-[#858A7D] uppercase tracking-wider">{gyms?.length || 0} Results</span>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-[#B7FF1E]/20 border-t-[#B7FF1E] rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {gyms?.map((gym) => (
                  <div 
                    key={gym.id}
                    onClick={() => setSelectedGym(gym)}
                    className="bg-[#121411] rounded-2xl p-[16px] border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1e201d] flex items-center justify-center border border-white/5 text-[#B7FF1E]">
                        <span className="material-symbols-outlined text-2xl">fitness_center</span>
                      </div>
                      <div>
                        <h4 className="text-[16px] font-semibold text-white leading-tight">{gym.name}</h4>
                        <p className="text-[12px] text-[#858A7D] mt-1">Code: <span className="text-[#B7FF1E] font-mono">{gym.gym_code || '---'}</span></p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#858A7D] group-hover:text-white transition-colors">chevron_right</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Detail Drawer */}
      {selectedGym && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end px-0">
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
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#858A7D] uppercase font-bold">Phone</p>
                      <p className="text-[14px] text-white font-medium">{selectedGym.owner_phone || 'Not provided'}</p>
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
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>home</span>
              <span className="text-[11px] font-semibold leading-[14px]">Home</span>
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
  );
}
