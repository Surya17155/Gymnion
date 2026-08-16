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
  const [filter, setFilter] = useState<'all' | 'paid' | 'overdue' | 'free'>('all');
  
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
      const isPaid = (gym.settings as any)?.payment_status === 'paid' && !isOverdue;
      
      if (filter === 'paid') return isPaid && gym.plan_tier !== 'free';
      if (filter === 'overdue') return !isPaid && gym.plan_tier !== 'free';
      if (filter === 'free') return gym.plan_tier === 'free';
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

        <section className="grid grid-cols-2 gap-3">
          {/* Main Revenue Card - Spans 2 columns */}
          <div className="col-span-2 bg-gradient-to-br from-[#1A1D18] to-[#121411] border border-[#B7FF1E]/10 rounded-2xl p-4 flex flex-col justify-between min-h-[140px] relative overflow-hidden group shadow-lg shadow-black/40">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#B7FF1E]/10 rounded-full blur-3xl group-hover:bg-[#B7FF1E]/20 transition-all duration-500"></div>
            <div className="flex justify-between items-start w-full relative z-10">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium text-[#858A7D]">Platform Revenue</span>
                <span className="text-[11px] text-[#858A7D]/60 italic font-mono uppercase tracking-wider">Total Gross Revenue</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#B7FF1E]/15 px-3 py-1 rounded-full border border-[#B7FF1E]/20 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[14px] text-[#B7FF1E] font-bold">trending_up</span>
                <span className="text-[11px] font-bold text-[#B7FF1E]">+{stats?.growth || 0}%</span>
              </div>
            </div>
            <div className="mt-4 relative z-10 flex items-baseline gap-1">
              <span className="text-[42px] font-black text-white leading-none tracking-tight">₹{stats?.totalCollected?.toLocaleString() || '0'}</span>
            </div>
          </div>

          {/* Metric Cards - 2 per row */}
          <div className="bg-[#1A1D18] border border-white/5 rounded-2xl p-3 flex flex-col justify-between min-h-[95px] shadow-md shadow-black/20">
            <div className="flex justify-between items-start">
              <span className="text-[12px] font-medium text-[#858A7D]">Free Trial</span>
              <div className="w-7 h-7 bg-[#B7FF1E]/10 rounded-lg flex items-center justify-center border border-[#B7FF1E]/10">
                <span className="material-symbols-outlined text-[#B7FF1E] text-[18px]">card_giftcard</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[26px] font-bold text-white tracking-tight">{stats?.freeTierCount || 0}</span>
              <span className="text-[10px] text-[#858A7D] font-medium uppercase tracking-tighter">Gyms</span>
            </div>
          </div>

          <div className="bg-[#1A1D18] border border-white/5 rounded-2xl p-3 flex flex-col justify-between min-h-[95px] shadow-md shadow-black/20">
            <div className="flex justify-between items-start">
              <span className="text-[12px] font-medium text-[#858A7D]">Active Paid</span>
              <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                <span className="material-symbols-outlined text-[#B7FF1E] text-[18px]">check_circle</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[26px] font-bold text-white tracking-tight">{stats?.paidCount || 0}</span>
              <span className="text-[10px] text-[#858A7D] font-medium uppercase tracking-tighter">Gyms</span>
            </div>
          </div>

          {/* Overdue card - Spans full width if needed, but keeping grid consistency */}
          <div className="col-span-2 bg-[#1A1D18] border border-[#FF5964]/20 rounded-2xl p-4 flex items-center justify-between min-h-[70px] relative overflow-hidden shadow-md shadow-black/20">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF5964]"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF5964]/10 rounded-xl flex items-center justify-center border border-[#FF5964]/20">
                <span className="material-symbols-outlined text-[#FF5964] text-[22px]">warning</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-white">Pending Payments</span>
                <span className="text-[11px] text-[#858A7D]">Action required for overdue gyms</span>
              </div>
            </div>
            <span className="text-[28px] font-black text-[#FF5964] tracking-tight">{stats?.overdueCount || 0}</span>
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
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-md text-[11px] font-semibold transition-all ${filter === 'overdue' ? 'bg-[#B7FF1E] text-black shadow-[0_2px_8px_rgba(183,255,30,0.2)]' : 'text-[#C0C2B8] hover:text-white'}`}
              >
                Pending/Overdue
              </button>
              <button 
                onClick={() => setFilter('free')}
                className={`flex-1 min-w-[80px] py-2 px-4 rounded-md text-[11px] font-semibold transition-all ${filter === 'free' ? 'bg-[#B7FF1E] text-black shadow-[0_2px_8px_rgba(183,255,30,0.2)]' : 'text-[#C0C2B8] hover:text-white'}`}
              >
                Free Trial
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
              const isPaid = (gym.settings as any)?.payment_status === 'paid' && !isOverdue;
              
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
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${gym.plan_tier === 'free' ? 'text-[#B7FF1E] bg-[#B7FF1E]/10 border-[#B7FF1E]/20' : !isPaid ? 'text-[#FF5964] bg-[#FF5964]/10 border-[#FF5964]/20' : 'text-[#B7FF1E] bg-[#B7FF1E]/10 border-[#B7FF1E]/20'}`}>
                        {gym.plan_tier === 'free' ? 'FREE TRIAL' : (isPaid ? 'PAID' : 'PENDING')}
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
