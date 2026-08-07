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
    <div className="bg-[#0D0F0C] text-[#e3e3dd] min-h-screen relative overflow-x-hidden pb-16 font-sans">
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(213,255,64,0.1) 0%, rgba(13,15,12,0) 70%)'
        }}
      />

      <main className="relative z-10 w-full max-w-[480px] mx-auto flex flex-col pt-6 px-5">
        <header className="flex items-center mb-8">
          <Link to="/dashboard/super-admin" className="w-10 h-10 rounded-full bg-[#333532] border border-white/10 flex items-center justify-center mr-4">
            <span className="material-symbols-outlined text-[#C0C2B8]">chevron_left</span>
          </Link>
          <h1 className="text-[22px] font-bold text-white">Connected Gyms</h1>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#B7FF1E]/30 border-t-[#B7FF1E] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 mb-2">
              <p className="text-[11px] font-semibold text-[#858A7D] uppercase tracking-wider">Total Network</p>
              <p className="text-3xl font-bold text-[#B7FF1E] mt-1">{gyms?.length || 0} Gyms</p>
            </div>

            {gyms?.map((gym) => (
              <div 
                key={gym.id}
                onClick={() => setSelectedGym(gym)}
                className="bg-[#151714]/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-[#333532] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#292A28] flex items-center justify-center overflow-hidden border border-white/5">
                    <span className="material-symbols-outlined text-[#858A7D]">fitness_center</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{gym.name}</h3>
                    <p className="text-[11px] text-[#858A7D] mt-1">{gym.owner_email || 'No email set'}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#858A7D] group-hover:text-[#B7FF1E] transition-colors">chevron_right</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Drawer */}
      {selectedGym && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGym(null)}></div>
          <div className="relative bg-[#1a1c19] border-t border-white/10 rounded-t-[32px] p-6 pb-12 w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-[#333532] rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#292A28] flex items-center justify-center overflow-hidden border border-[#B7FF1E]/20">
                {selectedGym.logo_url ? (
                  <img src={selectedGym.logo_url} alt={selectedGym.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[#B7FF1E] text-3xl">fitness_center</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedGym.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#B7FF1E]"></span>
                  <span className="text-xs text-[#B7FF1E] font-medium tracking-wide uppercase">Verified Partner</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Location</label>
                <div className="bg-[#0d0f0c] rounded-2xl p-4 border border-white/5 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#B7FF1E] text-xl">location_on</span>
                  <p className="text-sm text-[#e3e3dd]">{selectedGym.address || 'Address not provided'}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Admin Configuration</label>
                <div className="bg-[#0d0f0c] rounded-2xl p-4 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#858A7D]">Gym Code</span>
                    <span className="text-sm font-mono text-[#B7FF1E] font-bold">{selectedGym.gym_code || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-[#858A7D]">Joined Date</span>
                    <span className="text-sm text-[#e3e3dd]">{new Date(selectedGym.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedGym(null)}
              className="w-full mt-8 py-4 bg-[#B7FF1E] text-[#293500] font-bold rounded-2xl shadow-[0_0_20px_rgba(183,255,30,0.2)] active:scale-95 transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
