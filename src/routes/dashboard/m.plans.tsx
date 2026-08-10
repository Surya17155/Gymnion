import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { 
  LucideChevronLeft,
  LucideCreditCard,
  LucideCheck,
  LucideInfo
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMyProfile, getFeePlans } from '@/lib/auth.functions';
import { updateMemberPlan } from '@/lib/members.functions';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/m/plans')({
  component: MemberPlansPage,
});

function MemberPlansPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    },
    onError: (error: any) => {
      toast.error('Failed to update plan: ' + error.message);
    }
  });

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
    <div className="flex justify-center min-h-screen bg-[#121411] w-full relative overflow-x-hidden font-['Poppins']">
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(183, 255, 30, 0.15) 0%, rgba(183, 255, 30, 0) 70%)', borderRadius: '50%' }}
      />
      
      <main className="w-full max-w-[480px] px-5 relative z-10 flex flex-col gap-6 pt-8 pb-[120px]">
        <header className="flex items-center gap-4">
          <button 
            onClick={() => navigate({ to: '/dashboard/m/profile' })}
            className="w-10 h-10 rounded-full bg-[#333532] flex items-center justify-center border border-white/5 text-[#C0C2B8]"
          >
            <LucideChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[24px] font-bold text-white">Gym Plans</h1>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {plans?.map((plan: any) => {
              const isSelected = profile?.fee_plan_id === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => !isSelected && updatePlanMutation.mutate(plan.id)}
                  disabled={updatePlanMutation.isPending}
                  className={`relative w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[#B7FF1E]/10 border-[#B7FF1E] shadow-[0_0_15px_rgba(183,255,30,0.1)]' 
                      : 'bg-[#1e201d] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {isSelected && (
                      <div className="bg-[#B7FF1E] rounded-full p-1 flex items-center justify-center">
                        <LucideCheck className="w-3 h-3 text-[#121411]" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-[#B7FF1E]">₹{plan.amount}</span>
                    <span className="text-xs text-[#858A7D]">/ {plan.billing_cycle || 'month'}</span>
                  </div>

                  {plan.description && (
                    <p className="text-sm text-[#C0C2B8] line-clamp-2">{plan.description}</p>
                  )}
                  
                  {updatePlanMutation.isPending && !isSelected && (
                    <div className="absolute inset-0 bg-[#121411]/50 rounded-2xl flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              );
            })}

            {plans?.length === 0 && (
              <div className="text-center py-12 bg-[#1e201d] rounded-2xl border border-white/5">
                <LucideCreditCard className="w-12 h-12 text-[#333532] mx-auto mb-3" />
                <p className="text-[#C0C2B8]">No plans available at this gym.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
