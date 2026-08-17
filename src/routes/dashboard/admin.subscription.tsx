import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails } from '@/lib/auth.functions';
import { checkGymSubscription } from '@/lib/subscription.functions';
import { createRazorpayOrder, verifySubscriptionPayment } from '@/lib/payments.functions';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/admin/subscription')({
  component: SubscriptionManagement,
});

function SubscriptionManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const getGymDetailsFn = useServerFn(getGymDetails);
  const checkSubscriptionFn = useServerFn(checkGymSubscription);
  const createOrderFn = useServerFn(createRazorpayOrder);
  const verifyPaymentFn = useServerFn(verifySubscriptionPayment);

  const { data: gymData, isLoading: isGymLoading } = useQuery({
    queryKey: ['admin-gym-settings'],
    queryFn: () => getGymDetailsFn({ data: undefined }),
  });

  const { data: subStatus } = useQuery({
    queryKey: ['gym-subscription-status'],
    queryFn: () => checkSubscriptionFn(),
  });

  const { data: activePlans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['global-plans-for-admin-sub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const currentPlanId = (gymData?.settings as any)?.plan_id || gymData?.subscription_plan_id;
  const currentPlan = activePlans?.find((p: any) => p.id === currentPlanId);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan || !gymData?.id) return;
    
    setShowConfirmModal(false);
    setIsProcessing(true);
    
    try {
      const order = await createOrderFn({ data: { planId: selectedPlan.id, gymId: gymData.id } });
      
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        await new Promise((resolve) => {
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Gymnion",
        description: `Subscription for ${gymData.name} - ${selectedPlan.name}`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await verifyPaymentFn({
              data: {
                gymId: gymData.id,
                planId: selectedPlan.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              }
            });
            toast.success(`Successfully subscribed to ${selectedPlan.name}!`);
            queryClient.invalidateQueries({ queryKey: ['admin-gym-settings'] });
            queryClient.invalidateQueries({ queryKey: ['gym-subscription-status'] });
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: gymData.owner_name,
          email: gymData.owner_email,
          contact: (gymData as any).phone
        },
        theme: { color: "#B7FF1E" },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  if (isGymLoading || isPlansLoading) {
    return (
      <div className="bg-[#121411] text-[#e3e3dd] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`bg-[#121411] text-[#e3e3dd] antialiased min-h-screen font-['Poppins'] ${showConfirmModal ? 'tab-bar-hidden' : ''}`}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div 
        className="fixed top-0 left-0 right-0 h-[200px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.12) 0%, rgba(18, 20, 17, 0) 70%)'
        }}
      />

      <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative z-10 flex flex-col">
        <header className="flex items-center px-[20px] h-[64px] w-full sticky top-0 z-40 bg-transparent">
          <button 
            onClick={() => navigate({ to: '/dashboard/admin/settings' })}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1e201d] border border-white/5 text-[#e3e3dd]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 text-center pr-10">
            <h2 className="text-[18px] font-bold text-white uppercase tracking-wider">SUBSCRIPTION</h2>
          </div>
        </header>

        <main className="flex-1 px-[20px] flex flex-col gap-[24px] py-4">
          {/* Active Plan Card */}
          <section className="bg-[#1e201d] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B7FF1E]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <p className="text-[10px] text-[#858A7D] uppercase font-bold tracking-widest mb-4">Current Subscription</p>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {gymData?.plan_tier === 'free' ? 'Free Trial' : (currentPlan?.name || 'Standard Tier')}
                </h3>
                {subStatus?.subscriptionEndsAt && (
                  <p className="text-sm text-[#B7FF1E] mt-1 font-medium">
                    {gymData?.plan_tier === 'free' ? 'Trial ends ' : 'Expires '}
                    {format(new Date(subStatus.subscriptionEndsAt), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#B7FF1E]/10 border border-[#B7FF1E]/20 flex items-center justify-center text-[#B7FF1E]">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {gymData?.plan_tier === 'free' ? 'schedule' : 'verified'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 text-[10px] text-[#858A7D] font-bold uppercase tracking-tighter">
              <span className={`px-3 py-1 rounded-full border ${subStatus?.isExpired ? 'bg-[#FF5964]/10 border-[#FF5964]/20 text-[#FF5964]' : 'bg-[#B7FF1E]/10 border-[#B7FF1E]/20 text-[#B7FF1E]'}`}>
                {subStatus?.isExpired ? 'Expired' : 'Active'}
              </span>
              <span className="px-3 py-1 rounded-full border border-white/5 bg-white/5">
                {gymData?.plan_tier === 'free' ? '1st Month Free' : 'Paid Plan'}
              </span>
            </div>
          </section>

          {/* All Plans */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white ml-2">Available Plans</h2>
            <div className="flex flex-col gap-3">
              {activePlans?.map((plan: any) => {
                const isCurrent = plan.id === currentPlanId;
                const isExpanded = expandedPlanId === plan.id;
                
                return (
                  <div 
                    key={plan.id} 
                    className={`bg-[#1e201d] rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isCurrent ? 'border-[#B7FF1E]/30 shadow-[0_0_20px_rgba(183,255,30,0.05)]' : 'border-white/5'
                    }`}
                  >
                    <div 
                      className="p-5 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isCurrent ? 'bg-[#B7FF1E] text-[#293500]' : 'bg-[#25340D] text-[#B7FF1E]'
                        }`}>
                          <span className="material-symbols-outlined">
                            {plan.name.toLowerCase().includes('gold') ? 'workspace_premium' : 'stars'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white">{plan.name}</h3>
                            {isCurrent && <span className="text-[9px] bg-[#B7FF1E]/20 text-[#B7FF1E] px-2 py-0.5 rounded-full font-black uppercase">Current</span>}
                          </div>
                          <p className="text-sm font-bold text-[#B7FF1E]">₹{plan.price / 100}<span className="text-[10px] text-[#858A7D] font-normal">/month</span></p>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="h-px bg-white/5 mb-4"></div>
                        <ul className="space-y-3 mb-6">
                          {plan.features?.map((f: any, idx: number) => {
                            const isEnabled = typeof f === 'string' ? true : !!f.enabled;
                            const label = typeof f === 'string' ? f.replace(/_/g, ' ') : (f.label || f.name.replace(/_/g, ' '));
                            return (
                              <li key={idx} className="flex items-center gap-3 text-xs text-[#C0C2B8] capitalize">
                                <span className={`material-symbols-outlined text-[16px] ${isEnabled ? 'text-[#B7FF1E]' : 'text-[#858A7D]'}`}>
                                  {isEnabled ? 'check_circle' : 'cancel'}
                                </span>
                                {label}
                              </li>
                            );
                          })}
                          {plan.member_limit && (
                            <li className="flex items-center gap-3 text-xs text-[#C0C2B8]">
                              <span className="material-symbols-outlined text-[16px] text-[#B7FF1E]">groups</span>
                              Up to {plan.member_limit} Members
                            </li>
                          )}
                        </ul>
                        {!isCurrent && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlanSelect(plan);
                            }}
                            className="w-full bg-[#B7FF1E] text-[#293500] py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-[#B7FF1E]/10 active:scale-95 transition-transform"
                          >
                            Subscribe Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowConfirmModal(false)}></div>
          <div className="bg-[#1e201d] w-full max-w-[400px] rounded-[32px] border border-white/10 relative z-10 overflow-hidden p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-[#B7FF1E]/10 border border-[#B7FF1E]/20 flex items-center justify-center text-[#B7FF1E] mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">payments</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Confirm Subscription</h3>
            <p className="text-[#858A7D] text-sm leading-relaxed mb-8">
              Are you sure you want to proceed with the <span className="text-white font-bold">{selectedPlan?.name}</span> subscription for <span className="text-[#B7FF1E] font-bold">₹{selectedPlan?.price / 100}</span>?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmPayment}
                className="w-full bg-[#B7FF1E] text-[#293500] py-4 rounded-2xl font-bold uppercase text-xs tracking-widest"
              >
                Continue to Payment
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="w-full bg-white/5 text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest border border-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#B7FF1E] font-bold animate-pulse">Initializing Payment...</p>
        </div>
      )}
    </div>
  );
}
