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
      
      <main className="max-w-[480px] mx-auto pt-8 px-5 flex flex-col gap-6">
        <section className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-black text-white leading-tight tracking-tight">Payments</h1>
            <p className="text-[13px] text-[#858A7D] font-medium tracking-wide">Platform revenue overview</p>
          </div>
          <div className="w-10 h-10 bg-[#B7FF1E]/10 rounded-xl flex items-center justify-center border border-[#B7FF1E]/20 shadow-lg shadow-[#B7FF1E]/5">
            <span className="material-symbols-outlined text-[#B7FF1E]">account_balance_wallet</span>
          </div>
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

        <section className="flex flex-col gap-3.5">
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#858A7D] group-focus-within:text-[#B7FF1E] transition-colors">search</span>
            <input 
              className="w-full h-[52px] bg-[#1A1D18] border border-white/5 rounded-2xl pl-12 pr-4 text-[15px] text-white placeholder:text-[#858A7D]/50 focus:border-[#B7FF1E]/30 focus:ring-4 focus:ring-[#B7FF1E]/5 outline-none transition-all shadow-inner shadow-black/20" 
              placeholder="Search gyms by name..." 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 p-1.5 bg-[#1A1D18] rounded-2xl overflow-x-auto scrollbar-hide border border-white/5 shadow-inner shadow-black/20">
            {[
              { id: 'all', label: 'All' },
              { id: 'paid', label: 'Paid' },
              { id: 'overdue', label: 'Pending' },
              { id: 'free', label: 'Free Trial' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex-none min-w-[70px] py-2.5 px-4 rounded-xl text-[12px] font-bold transition-all duration-300 transform active:scale-95 ${
                  filter === tab.id 
                    ? 'bg-[#B7FF1E] text-black shadow-lg shadow-[#B7FF1E]/20 translate-y-[-1px]' 
                    : 'text-[#858A7D] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 mt-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#B7FF1E]/20 border-t-[#B7FF1E] rounded-full animate-spin"></div>
              <span className="text-[14px] text-[#858A7D] animate-pulse">Scanning gyms...</span>
            </div>
          ) : filteredGyms.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-4 bg-[#1A1D18] rounded-2xl border border-dashed border-white/10">
              <span className="material-symbols-outlined text-[48px] text-[#858A7D]/30">search_off</span>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-semibold text-white">No gyms found</span>
                <span className="text-[13px] text-[#858A7D]">Try adjusting your search or filters</span>
              </div>
            </div>
          ) : (
            filteredGyms.map((gym) => {
              const isOverdue = gym.subscription_ends_at ? new Date(gym.subscription_ends_at) < now : true;
              const isPaid = (gym.settings as any)?.payment_status === 'paid' && !isOverdue;
              
              const manualPrice = (gym.settings as any)?.manual_pricing;
              const planName = manualPrice ? `Manual Pricing: ₹${manualPrice}` : ((gym as any).global_plans?.name || 'Standard Plan');
              
              return (
                <div key={gym.id} className={`bg-[#1A1D18] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-[#B7FF1E]/30 active:scale-[0.98] transition-all duration-200 cursor-pointer group shadow-sm shadow-black/20 ${!isPaid && gym.plan_tier !== 'free' ? 'border-l-4 border-l-[#FF5964]' : 'border-l-4 border-l-transparent'}`}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#292A28] to-[#1e201d] flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[#B7FF1E]/30 transition-colors shadow-inner">
                    <span className="material-symbols-outlined text-white text-[28px]">fitness_center</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[16px] font-bold text-white truncate pr-2 tracking-tight">{gym.name}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shrink-0 tracking-tighter uppercase ${gym.plan_tier === 'free' ? 'text-[#B7FF1E] bg-[#B7FF1E]/10 border-[#B7FF1E]/20' : !isPaid ? 'text-[#FF5964] bg-[#FF5964]/10 border-[#FF5964]/20' : 'text-[#B7FF1E] bg-[#B7FF1E]/10 border-[#B7FF1E]/20'}`}>
                        {gym.plan_tier === 'free' ? 'Free' : (isPaid ? 'Paid' : 'Due')}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-[#858A7D] truncate italic">{planName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`material-symbols-outlined text-[14px] ${!isPaid && gym.plan_tier !== 'free' ? 'text-[#FF5964]' : 'text-[#B7FF1E]'}`}>event</span>
                      <p className={`text-[11px] font-bold ${!isPaid && gym.plan_tier !== 'free' ? 'text-[#FF5964]' : 'text-[#858A7D]'}`}>
                        {!isPaid && gym.plan_tier !== 'free'
                          ? `Due: ${gym.subscription_ends_at ? format(new Date(gym.subscription_ends_at), "MMM dd, yyyy") : 'Now'}` 
                          : `Expires: ${gym.subscription_ends_at ? format(new Date(gym.subscription_ends_at), "MMM dd, yyyy") : 'Lifetime'}`
                        }
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#858A7D]/40 group-hover:text-[#B7FF1E] transition-all transform group-hover:translate-x-1">chevron_right</span>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
