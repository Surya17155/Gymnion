import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { 
  LucideChevronLeft,
  LucideCheck,
  LucideInfo,
  LucideX
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMyProfile, getFeePlans } from '@/lib/auth.functions';
import { updateMemberPlan } from '@/lib/members.functions';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Route = createFileRoute('/dashboard/m/plans')({
  component: MemberPlansPage,
});

function MemberPlansPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const getMyProfileFn = useServerFn(getMyProfile);
  const getFeePlansFn = useServerFn(getFeePlans);
  const updatePlanFn = useServerFn(updateMemberPlan);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfileFn({ data: {} } as any),
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['gym-plans', profile?.gym_id],
    queryFn: () => getFeePlansFn({ data: { gymId: profile?.gym_id } }),
    enabled: !!profile?.gym_id,
  });

  const updatePlanMutation = useMutation({
    mutationFn: (planId: string) => updatePlanFn({ data: { memberId: profile!.id, planId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      toast.success('Plan updated successfully');
      setIsDrawerOpen(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update plan: ' + error.message);
    }
  });

  const handlePlanClick = (plan: any) => {
    setSelectedPlan(plan);
    setIsDrawerOpen(true);
  };

  if (profileLoading || plansLoading) {
    return (
      <div className="bg-[#121411] min-h-screen flex items-center justify-center text-[#B7FF1E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#C0C2B8]">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-[#121411] w-full relative overflow-x-hidden font-['Poppins'] text-[#e3e3dd]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div 
        className="fixed top-0 left-0 right-0 h-[150px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(183, 255, 30, 0.08) 0%, transparent 70%)'
        }}
      />
      
      <main className="w-full max-w-[480px] px-5 relative z-10 flex flex-col gap-6 pt-8 pb-[120px]">
        <header className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => navigate({ to: '/dashboard/m/profile' })}
            className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center border border-white/5 text-[#e3e3dd]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-white uppercase tracking-wider">GYM PLANS</h1>
            <p className="text-[12px] text-[#858A7D]">Choose the best membership for you</p>
          </div>
        </header>

        <section className="flex flex-col gap-4">
          {plans?.map((plan: any) => {
            const isSelected = profile?.fee_plan_id === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => handlePlanClick(plan)}
                className={`relative group bg-[#1e201d] rounded-2xl border border-white/5 p-5 transition-all duration-300 active:scale-[0.98] ${
                  isSelected ? 'border-[#B7FF1E]/30 shadow-[0_0_20px_rgba(183,255,30,0.05)]' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-[#B7FF1E] text-[#293500]' : 'bg-[#25340D] text-[#B7FF1E]'
                    }`}>
                      <span className="material-symbols-outlined">
                        {plan.name.toLowerCase().includes('gold') || plan.name.toLowerCase().includes('premium') ? 'workspace_premium' : 'sell'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-[16px]">{plan.name}</h3>
                        {isSelected && (
                          <span className="text-[9px] bg-[#B7FF1E]/20 text-[#B7FF1E] px-2 py-0.5 rounded-full font-black uppercase">Active</span>
                        )}
                      </div>
                      <p className="text-[18px] font-bold text-[#B7FF1E] mt-0.5">
                        ₹{plan.amount}
                        <span className="text-[10px] text-[#858A7D] font-normal ml-1">/ {plan.billing_cycle || 'month'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#858A7D] group-hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-[12px] text-[#858A7D] line-clamp-1 opacity-70">
                    {plan.description}
                  </p>
                )}
              </div>
            );
          })}

          {plans?.length === 0 && (
            <div className="text-center py-20 bg-[#1e201d] rounded-3xl border border-white/5 flex flex-col items-center">
              <span className="material-symbols-outlined text-[48px] opacity-20 block mb-3 text-[#858A7D]">payments</span>
              <p className="text-[#858A7D] text-sm font-medium">No plans available at this gym yet.</p>
            </div>
          )}
        </section>
      </main>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#1e201d] rounded-t-[32px] border-t border-white/10 z-[101] overflow-hidden"
            >
              <div className="p-6 pb-safe">
                <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#25340D] flex items-center justify-center text-[#B7FF1E]">
                      <span className="material-symbols-outlined text-[32px]">
                        {selectedPlan?.name.toLowerCase().includes('gold') || selectedPlan?.name.toLowerCase().includes('premium') ? 'workspace_premium' : 'sell'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white leading-tight">{selectedPlan?.name}</h2>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-[#B7FF1E]">₹{selectedPlan?.amount}</span>
                        <span className="text-[12px] text-[#858A7D]">/ {selectedPlan?.billing_cycle || 'month'}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-10 h-10 rounded-full bg-[#333532] flex items-center justify-center text-[#C0C2B8] border border-white/5 active:scale-90 transition-transform"
                  >
                    <LucideX className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-px bg-white/5 mb-6" />

                <div className="space-y-4 mb-8">
                  <h4 className="text-[10px] uppercase font-bold text-[#858A7D] tracking-[0.1em] ml-1">Plan Features</h4>
                  <div className="grid gap-3">
                    {selectedPlan?.description?.split('\n').filter(Boolean).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 bg-[#121411] p-3.5 rounded-xl border border-white/5">
                        <span className="material-symbols-outlined text-[#B7FF1E] text-[18px] mt-0.5">check_circle</span>
                        <p className="text-[14px] text-[#e3e3dd] font-medium">{feature.trim()}</p>
                      </div>
                    ))}
                    {!selectedPlan?.description && (
                      <div className="bg-[#121411] p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-[#858A7D] text-xs">Full access to gym facilities and equipment during operational hours.</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  disabled={profile?.fee_plan_id === selectedPlan?.id || updatePlanMutation.isPending}
                  onClick={() => updatePlanMutation.mutate(selectedPlan.id)}
                  className={`w-full py-4 rounded-2xl font-bold uppercase text-[12px] tracking-widest transition-all duration-300 shadow-xl ${
                    profile?.fee_plan_id === selectedPlan?.id
                      ? 'bg-[#333532] text-[#858A7D] cursor-not-allowed border border-white/5'
                      : 'bg-[#B7FF1E] text-[#293500] shadow-[#B7FF1E]/10 active:scale-[0.98]'
                  }`}
                >
                  {updatePlanMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-[#293500] border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : profile?.fee_plan_id === selectedPlan?.id ? (
                    'Current Plan'
                  ) : (
                    'Select Plan'
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
