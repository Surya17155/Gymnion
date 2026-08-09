import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAllGymsServer, getPlatformRevenue } from "@/lib/super-admin.functions";
import { useState, useMemo } from "react";
import { format } from "date-fns";

export const Route = createFileRoute('/dashboard/super-admin/payments')({
  component: SuperAdminPayments,
});

function SuperAdminPayments() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'paid' | 'overdue'>('all');
  
  const getRevenueFn = useServerFn(getPlatformRevenue);
  const getAllGymsFn = useServerFn(getAllGymsServer);

  const { data: stats } = useQuery({
    queryKey: ['super-admin-revenue-stats'],
    queryFn: () => getRevenueFn()
  });

  const { data: gymsData, isLoading } = useQuery({
    queryKey: ['super-admin-payments-gyms', search],
    queryFn: () => getAllGymsFn({ data: { search, limit: 100 } })
  });

  const now = new Date();

  const filteredGyms = useMemo(() => {
    if (!gymsData?.gyms) return [];
    
    return gymsData.gyms.filter(gym => {
      const isOverdue = gym.subscription_ends_at ? new Date(gym.subscription_ends_at) < now : true;
      const isPaid = (gym.settings as any)?.payment_status === 'paid' || (!isOverdue && gym.subscription_ends_at);
      
      if (filter === 'paid') return isPaid;
      if (filter === 'overdue') return !isPaid;
      return true;
    });
  }, [gymsData, filter, now]);

  return (
    <div className="antialiased overflow-x-hidden pb-[72px] glow-top">
      <style>{`
        .glow-top {
          background: radial-gradient(circle at top, rgba(183, 255, 30, 0.1) 0%, transparent 50%);
        }
      `}</style>
      
      <main className="max-w-[480px] mx-auto pt-6 px-5 flex flex-col gap-5">
        <section>
          <h1 className="text-[24px] font-bold text-white leading-tight">Platform Revenue</h1>
        </section>

        <section className="grid grid-cols-1 gap-3">
          <div className="bg-[#121411] border border-white/5 rounded-xl p-3 flex flex-col justify-between min-h-[110px] relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#B7FF1E]/5 rounded-full blur-2xl group-hover:bg-[#B7FF1E]/10 transition-colors"></div>
            <div className="flex justify-between items-start w-full relative z-10">
              <span className="text-[13px] text-[#858A7D]">Total Collected</span>
              <div className="flex items-center gap-1 bg-[#B7FF1E]/10 px-2 py-0.5 rounded-full border border-[#B7FF1E]/20">
                <span className="material-symbols-outlined text-[12px] text-[#B7FF1E]">trending_up</span>
                <span className="text-[10px] font-semibold text-[#B7FF1E]">+{stats?.growth || 0}%</span>
              </div>
            </div>
            <div className="mt-2 relative z-10">
              <span className="text-[32px] font-bold text-white leading-none">₹{stats?.totalCollected?.toLocaleString() || '0'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121411] border border-white/5 rounded-xl p-3 flex flex-col justify-center min-h-[80px]">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] text-[#858A7D]">Paid Gyms</span>
                <span className="material-symbols-outlined text-[#858A7D] text-base">check_circle</span>
              </div>
              <span className="text-[20px] font-bold text-white">{stats?.paidCount || 0}</span>
            </div>
            <div className="bg-[#121411] border border-[#FF5964]/30 rounded-xl p-3 flex flex-col justify-center relative overflow-hidden min-h-[80px]">
              <div className="absolute inset-0 bg-[#FF5964]/5"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] text-[#858A7D]">Overdue</span>
                  <span className="material-symbols-outlined text-[#FF5964] text-base">warning</span>
                </div>
                <span className="text-[20px] font-bold text-[#FF5964]">{stats?.overdueCount || 0}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#858A7D]">search</span>
            <input 
              className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl pl-10 pr-4 text-white placeholder:text-[#858A7D] focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E] outline-none transition-all" 
              placeholder="Search gyms..." 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex p-1 bg-[#292A28] rounded-lg overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 min-w-[80px] py-2 px-4 rounded-md text-[11px] font-semibold transition-all ${filter === 'all' ? 'bg-[#B7FF1E] text-black shadow-[0_2px_8px_rgba(183,255,30,0.2)]' : 'text-[#C0C2B8] hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('paid')}
              className={`flex-1 min-w-[80px] py-2 px-4 rounded-md text-[11px] font-semibold transition-all ${filter === 'paid' ? 'bg-[#B7FF1E] text-black shadow-[0_2px_8px_rgba(183,255,30,0.2)]' : 'text-[#C0C2B8] hover:text-white'}`}
            >
              Paid
            </button>
            <button 
              onClick={() => setFilter('overdue')}
              className={`flex-1 min-w-[120px] py-2 px-4 rounded-md text-[11px] font-semibold transition-all ${filter === 'overdue' ? 'bg-[#B7FF1E] text-black shadow-[0_2px_8px_rgba(183,255,30,0.2)]' : 'text-[#C0C2B8] hover:text-white'}`}
            >
              Pending/Overdue
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          {isLoading ? (
            <div className="py-10 text-center text-[#858A7D]">Loading gyms...</div>
          ) : filteredGyms.length === 0 ? (
            <div className="py-10 text-center text-[#858A7D]">No gyms found matching criteria.</div>
          ) : (
            filteredGyms.map((gym) => {
              const isOverdue = gym.subscription_ends_at ? new Date(gym.subscription_ends_at) < now : true;
              const isPaid = (gym.settings as any)?.payment_status === 'paid' || (!isOverdue && gym.subscription_ends_at);
              
              const manualPrice = (gym.settings as any)?.manual_pricing;
              const planName = manualPrice ? `Manual Pricing: ₹${manualPrice}` : ((gym as any).global_plans?.name || 'Standard Plan');
              
              return (
                <div key={gym.id} className={`bg-[#121411] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-colors cursor-pointer group ${!isPaid ? 'border-l-2 border-l-[#FF5964]' : ''}`}>
                  <div className="w-12 h-12 rounded-lg bg-[#292A28] flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[#B7FF1E]/30 transition-colors">
                    <span className="material-symbols-outlined text-white">fitness_center</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[18px] font-semibold text-white truncate pr-2">{gym.name}</h3>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${!isPaid ? 'text-[#FF5964] bg-[#FF5964]/10 border-[#FF5964]/20' : 'text-[#B7FF1E] bg-[#B7FF1E]/10 border-[#B7FF1E]/20'}`}>
                        {isPaid ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#C0C2B8] truncate">{planName}</p>
                    <p className={`text-[11px] font-semibold mt-1 ${!isPaid ? 'text-[#FF5964]' : 'text-[#858A7D]'}`}>
                      {!isPaid 
                        ? `Due: ${gym.subscription_ends_at ? format(new Date(gym.subscription_ends_at), "MMM dd, yyyy") : 'Immediate'}` 
                        : `Valid Until: ${gym.subscription_ends_at ? format(new Date(gym.subscription_ends_at), "MMM dd, yyyy") : 'N/A'}`
                      }
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#858A7D] group-hover:text-[#B7FF1E] transition-colors">chevron_right</span>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
