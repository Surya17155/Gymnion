import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '@/lib/plans.functions';
import { setGymManualPricing } from '@/lib/super-admin.functions';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type GlobalPlan = Tables<'global_plans'>;
type Gym = Tables<'gyms'>;

export const Route = createFileRoute('/dashboard/super-admin/plans')({
  component: SuperAdminPlans,
});

function SuperAdminPlans() {
  const queryClient = useQueryClient();
  const [isAddingOverride, setIsAddingOverride] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGymForOverride, setSelectedGymForOverride] = useState<any>(null);
  const [customMonthlyPrice, setCustomMonthlyPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [overrideForm, setOverrideForm] = useState({
    payment_management: false,
    attendance_management: false,
    fee_reminders: false,
    member_limit: ''
  });

  const getPlansFn = useServerFn(getSubscriptionPlans);
  const createPlanFn = useServerFn(createSubscriptionPlan);
  const updatePlanFn = useServerFn(updateSubscriptionPlan);
  const deletePlanFn = useServerFn(deleteSubscriptionPlan);
  const setManualPricingFn = useServerFn(setGymManualPricing);

  const { data: globalPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['global-plans'],
    queryFn: () => getPlansFn(),
  });

  const { data: gyms } = useQuery({
    queryKey: ['super-admin-gyms-for-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const filteredGymsForSearch = gyms?.filter((gym: Gym) => 
    gym.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    gym.gym_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddOverride = async () => {
    if (!selectedGymForOverride || !customMonthlyPrice) {
      toast.error("Please select a gym and enter a price");
      return;
    }

    setIsSubmitting(true);
    try {
      await setManualPricingFn({
        data: {
          gymId: selectedGymForOverride.id,
          manualPricing: parseFloat(customMonthlyPrice),
          features: {
            payment_management: overrideForm.payment_management,
            attendance_management: overrideForm.attendance_management,
            fee_reminders: overrideForm.fee_reminders,
            member_limit: overrideForm.member_limit ? parseInt(overrideForm.member_limit.toString()) : null
          }
        }
      });

      toast.success(`Manual pricing set for ${selectedGymForOverride.name}`);
      setIsAddingOverride(false);
      setSelectedGymForOverride(null);
      setCustomMonthlyPrice('');
      setSearchQuery('');
      queryClient.invalidateQueries({ queryKey: ['gyms-with-overrides'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to set manual pricing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan({
      ...plan,
      features: plan.features || []
    });
    setIsEditingPlan(true);
  };

  const handleUpdatePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlan) return;
    
    console.log('Starting handleUpdatePlan', { selectedPlan });
    setIsSubmitting(true);
    
    try {
      if (!selectedPlan.name || !selectedPlan.price) {
        toast.error("Please provide a plan name and price");
        setIsSubmitting(false);
        return;
      }
      
      const planData = {
        name: selectedPlan.name,
        price: Math.round(parseFloat(selectedPlan.price.toString()) * 100),
        features: (selectedPlan.features || []).map((f: any) => {
          if (typeof f === 'string') {
            return { name: f, enabled: true };
          }
          return { name: f.name, enabled: !!f.enabled };
        }),
        member_limit: selectedPlan.member_limit ? parseInt(selectedPlan.member_limit.toString()) : null,
        is_active: selectedPlan.is_active !== false
      };

      console.log('Prepared planData', planData);

      let error;
      const isNewPlan = !selectedPlan.id || (typeof selectedPlan.id === 'string' && selectedPlan.id.startsWith('new-'));
      
      if (!isNewPlan) {
        console.log('Updating existing plan', selectedPlan.id);
        await updatePlanFn({
          data: {
            id: selectedPlan.id,
            ...planData
          }
        });
      } else {
        console.log('Inserting new plan');
        await createPlanFn({ data: planData });
      }
      
      toast.success(isNewPlan ? "Plan created successfully" : "Plan updated successfully");
      setIsEditingPlan(false);
      setSelectedPlan(null);
      await queryClient.invalidateQueries({ queryKey: ['global-plans'] });
    } catch (err: any) {
      console.error('Catch block error:', err);
      toast.error(err.message || "Failed to save plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: gymsWithOverrides } = useQuery({
    queryKey: ['gyms-with-overrides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .not('settings', 'is', null);
      if (error) throw error;
      return data?.filter((g: Gym) => (g.settings as any)?.manual_pricing !== undefined) || [];
    }
  });

  return (
    <div className={`flex-1 overflow-y-auto h-full w-full relative z-0 pb-24 md:pb-8 ${isAddingOverride || isEditingPlan ? 'tab-bar-hidden' : ''}`}>
      {/* Atmospheric Glow */}
      <div className="fixed top-0 left-0 w-full h-96 bg-[#c9f232]/10 blur-[100px] pointer-events-none rounded-full -translate-y-1/2 z-0"></div>
      
      <div className="max-w-[480px] mx-auto w-full pt-12 px-5 md:px-0 relative z-10">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#e3e3dd] leading-tight">
            Subscription<br/>
            <span className="text-[#c9f232]">Management</span>
          </h1>
          <p className="text-sm text-[#C0C2B8] mt-2 font-medium">Manage global tiers and gym-specific overrides.</p>
        </div>

        {/* Zone 1: Global Subscription Plans */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#e3e3dd]">Global Plans</h2>
            <button 
              data-testid="add-new-plan-btn"
              onClick={() => {
                setSelectedPlan({ 
                  id: `new-${Date.now()}`, 
                  name: '', 
                  price: '', 
                  member_limit: '',
                  features: [
                    { name: 'attendance_management', label: 'Attendance Management', enabled: false },
                    { name: 'payment_management', label: 'Payment Management', enabled: false },
                    { name: 'fee_reminders', label: 'Fee Reminders', enabled: false }
                  ]
                });
                setIsEditingPlan(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9f232] rounded-full text-black text-[10px] font-bold uppercase tracking-wider hover:bg-[#aed502] transition-colors shadow-[0_4px_12px_rgba(201,242,50,0.2)]"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add New
            </button>
          </div>
          <div className="space-y-3">
            {isLoadingPlans ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 bg-[#121411] border border-white/5 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : globalPlans?.map((plan: any) => (
              <div 
                key={plan.id}
                className={`bg-[#121411] border border-white/5 rounded-xl p-4 relative overflow-hidden group ${
                  plan.name.toLowerCase() === 'unlimited' ? 'bg-[#c9f232]/10 border-[#c9f232]/30' : ''
                }`}
              >
                {plan.name.toLowerCase() === 'unlimited' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c9f232]/20 to-transparent pointer-events-none"></div>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#383a36]/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className={`text-[22px] font-bold ${plan.name.toLowerCase() === 'unlimited' ? 'text-[#c9f232]' : 'text-[#e3e3dd]'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-[40px] font-bold tracking-tighter ${plan.name.toLowerCase() === 'unlimited' ? 'text-[#e3e3dd]' : 'text-[#c9f232]'}`}>
                        ₹{plan.price / 100}
                      </span>
                      <span className="text-xs text-[#C0C2B8]">/mo</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    plan.name.toLowerCase() === 'unlimited' 
                      ? 'bg-[#c9f232] shadow-[0_0_15px_rgba(201,242,50,0.3)]' 
                      : 'bg-[#1e201d] border border-white/10'
                  }`}>
                    <span className={`material-symbols-outlined ${
                      plan.name.toLowerCase() === 'unlimited' ? 'text-[#576c00]' : 'text-[#C0C2B8]'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {plan.name.toLowerCase() === 'unlimited' ? 'bolt' : 'star'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 relative z-10">
                  {[
                    { name: 'attendance_management', label: 'Attendance Management' },
                    { name: 'payment_management', label: 'Payment Management' },
                    { name: 'fee_reminders', label: 'Fee Reminders' }
                  ].map((feat) => {
                    const featureObj = plan.features?.find((f: any) => f.name === feat.name);
                    const isEnabled = featureObj ? featureObj.enabled : false;
                    
                    return (
                      <li key={feat.name} className={`flex items-center gap-3 text-sm group cursor-pointer ${
                        plan.name.toLowerCase() === 'unlimited' ? 'text-[#e3e3dd]' : 'text-[#C0C2B8]'
                      }`}
                      onClick={async () => {
                        const currentFeatures = Array.isArray(plan.features) ? plan.features : [];
                        const newFeatures = currentFeatures.map((f: any) => {
                          if (typeof f === 'string') return { name: f, enabled: true };
                          return f;
                        });
                        
                        const idx = newFeatures.findIndex((f: any) => f.name === feat.name);
                        if (idx >= 0) {
                          newFeatures[idx] = { ...newFeatures[idx], enabled: !isEnabled };
                        } else {
                          newFeatures.push({ name: feat.name, enabled: true });
                        }
                        
                        try {
                          await updatePlanFn({
                            data: {
                              id: plan.id,
                              features: newFeatures
                            }
                          });
                          queryClient.invalidateQueries({ queryKey: ['global-plans'] });
                          toast.success("Feature updated");
                        } catch (err: any) {
                          toast.error(err.message || "Failed to update feature");
                        }
                      }}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ 
                          fontVariationSettings: "'FILL' 1",
                          color: isEnabled ? '#c9f232' : '#FF5964'
                        }}>
                          {isEnabled ? 'check_circle' : 'cancel'}
                        </span>
                        {feat.label}
                      </li>
                    );
                  })}
                  {plan.member_limit && (
                    <li className={`flex items-center gap-3 text-sm ${plan.name.toLowerCase() === 'unlimited' ? 'text-[#e3e3dd]' : 'text-[#C0C2B8]'}`}>
                      <span className="material-symbols-outlined text-sm text-[#c9f232]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                      Limit: {plan.member_limit} Members
                    </li>
                  )}
                </ul>

                <button 
                  onClick={() => handleEditPlan({ ...plan, price: (plan.price / 100).toString(), member_limit: plan.member_limit?.toString() || '' })}
                  className={`w-full h-12 text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-2 relative z-10 ${
                    plan.name.toLowerCase() === 'unlimited'
                      ? 'bg-[#c9f232] text-[#576c00] hover:bg-[#aed502] shadow-[0_4px_20px_rgba(201,242,50,0.2)]'
                      : 'bg-[#383a36] text-[#c9f232] hover:bg-[#333532] border border-[#c9f232]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit Plan
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Zone 2: Gym Overrides */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#e3e3dd]">Gym Overrides</h2>
            <button 
              onClick={() => setIsAddingOverride(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9f232]/10 border border-[#c9f232]/30 rounded-full text-[#c9f232] text-[10px] font-bold uppercase tracking-wider hover:bg-[#c9f232]/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Manual Pricing
            </button>
          </div>
          <div className="space-y-3">
            {gymsWithOverrides?.length === 0 && (
              <div className="bg-[#121411] border border-white/5 rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-[#383a36] text-[40px] mb-2 block">receipt_long</span>
                <p className="text-sm text-[#858A7D]">No manual pricing overrides set yet.</p>
              </div>
            )}
            
            {gymsWithOverrides?.map((gym) => {
              const currentPrice = (gym.settings as any)?.manual_pricing;
              return (
                <div key={gym.id} className="bg-[#121411] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#383a36] flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-[#858A7D]">fitness_center</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#e3e3dd]">{gym.name}</h3>
                        <p className="text-xs text-[#C0C2B8]">Manual Pricing Enabled</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedGymForOverride(gym);
                          setCustomMonthlyPrice(currentPrice?.toString() || '');
                          const settings = gym.settings as any;
                          const features = settings?.features || {};
                        setOverrideForm({
                          payment_management: !!features.payment_management,
                          attendance_management: !!features.attendance_management,
                          fee_reminders: !!features.fee_reminders,
                          member_limit: features.member_limit?.toString() || ''
                        });
                          setIsAddingOverride(true);
                        }}
                        className="text-[#c9f232] p-2 hover:bg-[#c9f232]/10 rounded-lg transition-colors"
                        title="Edit Override"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Remove manual pricing for ${gym.name}?`)) {
                            try {
                              const newSettings = { ...(gym.settings as any) };
                              delete newSettings.manual_pricing;
                              delete newSettings.features;
                              
                              const { error } = await supabase
                                .from('gyms')
                                .update({ settings: newSettings })
                                .eq('id', gym.id);

                              if (error) throw error;
                              toast.success(`Manual pricing removed for ${gym.name}`);
                              queryClient.invalidateQueries({ queryKey: ['gyms-with-overrides'] });
                              queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
                            } catch (err: any) {
                              toast.error(err.message || "Failed to remove manual pricing");
                            }
                          }
                        }}
                        className="text-[#FF5964] p-2 hover:bg-[#FF5964]/10 rounded-lg transition-colors"
                        title="Remove Override"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Add/Edit Override Drawer */}
      {isAddingOverride && (
        <>
          <style>{`
            nav { transform: translateY(100%); pointer-events: none; }
          `}</style>
          <div 
            className="fixed inset-0 bg-black/60 z-[99998] animate-in fade-in duration-300"
            onClick={() => {
              if (!isSubmitting) {
                setIsAddingOverride(false);
                setSelectedGymForOverride(null);
              }
            }}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#121411] border-t border-white/10 rounded-t-[32px] p-6 pb-safe z-[99999] animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c9f232]/10 flex items-center justify-center text-[#c9f232]">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-white">Manual Pricing Override</h3>
                  <p className="text-[12px] text-[#858A7D]">Set custom rates and features for a gym</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {!selectedGymForOverride ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#858A7D] uppercase tracking-wider">Select Gym</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#858A7D] text-[20px]">search</span>
                    <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-14 bg-[#1e201d] border border-white/10 rounded-2xl pl-10 pr-4 text-white font-medium outline-none focus:border-[#c9f232] transition-colors"
                      placeholder="Search for a gym..."
                    />
                  </div>
                  {searchQuery && filteredGymsForSearch && filteredGymsForSearch.length > 0 && (
                    <div className="max-h-40 overflow-y-auto mt-2 bg-[#1e201d] border border-white/10 rounded-xl divide-y divide-white/5">
                      {filteredGymsForSearch.map(gym => (
                        <div 
                          key={gym.id}
                          onClick={() => {
                            setSelectedGymForOverride(gym);
                            setSearchQuery('');
                          }}
                          className="p-3 hover:bg-white/5 cursor-pointer text-[#e3e3dd] text-sm font-medium"
                        >
                          {gym.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-[#c9f232]">fitness_center</span>
                     <span className="text-white font-bold">{selectedGymForOverride.name}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedGymForOverride(null)}
                    className="text-[10px] font-bold text-[#FF5964] uppercase tracking-widest"
                  >
                    Change
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#858A7D] uppercase tracking-wider">Pricing Amount (₹/mo)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-white font-bold">₹</span>
                  </div>
                  <input 
                    type="number"
                    value={customMonthlyPrice}
                    onChange={(e) => setCustomMonthlyPrice(e.target.value)}
                    className="w-full h-14 bg-[#1e201d] border border-white/10 rounded-2xl pl-10 pr-4 text-white font-bold text-[18px] outline-none focus:border-[#c9f232] transition-colors"
                    placeholder="0.00"
                  />
                </div>
                </div>

                <div 
                  onClick={() => setOverrideForm(prev => ({ ...prev, fee_reminders: !prev.fee_reminders }))}
                  className="flex items-center justify-between p-4 bg-[#1e201d] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${overrideForm.fee_reminders ? 'text-[#c9f232]' : 'text-[#858A7D]'}`}>notifications_active</span>
                    <span className="text-[14px] font-medium text-white">Fee Reminders</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${overrideForm.fee_reminders ? 'bg-[#c9f232]' : 'bg-[#333532]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${overrideForm.fee_reminders ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#858A7D] uppercase tracking-wider">Gym Member Limit</label>
                  <input 
                    type="number"
                    value={overrideForm.member_limit}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, member_limit: e.target.value }))}
                    className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-2xl px-4 text-white font-medium outline-none focus:border-[#c9f232] transition-colors"
                    placeholder="Unlimited"
                  />
                </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#858A7D] uppercase tracking-wider">Features Access</label>
                
                <div 
                  onClick={() => setOverrideForm(prev => ({ ...prev, payment_management: !prev.payment_management }))}
                  className="flex items-center justify-between p-4 bg-[#1e201d] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${overrideForm.payment_management ? 'text-[#c9f232]' : 'text-[#858A7D]'}`}>payments</span>
                    <span className="text-[14px] font-medium text-white">Payment Management</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${overrideForm.payment_management ? 'bg-[#c9f232]' : 'bg-[#333532]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${overrideForm.payment_management ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div 
                  onClick={() => setOverrideForm(prev => ({ ...prev, attendance_management: !prev.attendance_management }))}
                  className="flex items-center justify-between p-4 bg-[#1e201d] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${overrideForm.attendance_management ? 'text-[#c9f232]' : 'text-[#858A7D]'}`}>qr_code_scanner</span>
                    <span className="text-[14px] font-medium text-white">Attendance Management</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${overrideForm.attendance_management ? 'bg-[#c9f232]' : 'bg-[#333532]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${overrideForm.attendance_management ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setIsAddingOverride(false);
                    setSelectedGymForOverride(null);
                  }}
                  className="flex-1 h-14 bg-white/5 text-[#858A7D] font-bold rounded-2xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={handleAddOverride}
                  className="flex-[2] h-14 bg-[#c9f232] text-black font-bold rounded-2xl shadow-[0_8px_20px_rgba(201,242,50,0.2)] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (selectedGymForOverride?.settings?.manual_pricing ? 'Update Override' : 'Add Override')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Plan Modal */}
      {isEditingPlan && selectedPlan && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <style>{`
            nav { transform: translateY(100%); pointer-events: none; }
          `}</style>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[99998]" onClick={() => !isSubmitting && setIsEditingPlan(false)}></div>
          <div className="relative bg-[#121411] border-t border-white/10 rounded-t-[16px] p-6 pb-safe w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto z-[99999]">
            <div className="w-12 h-1.5 bg-[#1e201d] rounded-full mx-auto mb-6"></div>
            
            <h2 className="text-[20px] font-bold text-white mb-6">
              {selectedPlan.id ? `Edit ${selectedPlan.name} Plan` : 'Add New Plan'}
            </h2>

            <form 
              onSubmit={handleUpdatePlan}
              className="space-y-6"
            >
              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Plan Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Premium"
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] font-bold focus:border-[#c9f232] outline-none"
                  value={selectedPlan.name}
                  onChange={e => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Monthly Price (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-lg font-semibold text-[#C0C2B8]">₹</span>
                  </div>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl pl-8 pr-4 text-[#e3e3dd] font-bold focus:border-[#c9f232] outline-none"
                    value={selectedPlan.price}
                    onChange={e => setSelectedPlan({ ...selectedPlan, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Member Limit (Optional)</label>
                <input 
                  type="number"
                  placeholder="e.g. 100"
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] font-bold focus:border-[#c9f232] outline-none"
                  value={selectedPlan.member_limit || ''}
                  onChange={e => setSelectedPlan({ ...selectedPlan, member_limit: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Features Access</label>
                
                {[
                  { name: 'attendance_management', label: 'Attendance Management', icon: 'qr_code_scanner' },
                  { name: 'payment_management', label: 'Payment Management', icon: 'payments' },
                  { name: 'fee_reminders', label: 'Fee Reminders', icon: 'notifications_active' }
                ].map((feat) => {
                  const currentFeatures = Array.isArray(selectedPlan.features) ? selectedPlan.features : [];
                  const featureObj = currentFeatures.find((f: any) => (typeof f === 'string' ? f : f.name) === feat.name) || { name: feat.name, enabled: false };
                  const isEnabled = typeof featureObj === 'string' ? true : !!featureObj.enabled;

                  return (
                    <div 
                      key={feat.name}
                      onClick={() => {
                        const newFeatures = [...(selectedPlan.features || [])];
                        const idx = newFeatures.findIndex((f: any) => f.name === feat.name);
                        if (idx >= 0) {
                          newFeatures[idx] = { ...newFeatures[idx], enabled: !isEnabled };
                        } else {
                          newFeatures.push({ name: feat.name, label: feat.label, enabled: true });
                        }
                        setSelectedPlan({ ...selectedPlan, features: newFeatures });
                      }}
                      className="flex items-center justify-between p-4 bg-[#1e201d] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${isEnabled ? 'text-[#c9f232]' : 'text-[#858A7D]'}`}>{feat.icon}</span>
                        <span className="text-[14px] font-medium text-white">{feat.label}</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isEnabled ? 'bg-[#c9f232]' : 'bg-[#333532]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditingPlan(false)}
                    className="flex-1 py-3 bg-[#1e201d] text-[#858A7D] text-[14px] font-bold rounded-xl active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3 bg-[#c9f232] text-black text-[14px] font-bold rounded-xl shadow-[0_8px_16px_rgba(201,242,50,0.15)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>}
                    Save Changes
                  </button>
                </div>
                {selectedPlan.id && !selectedPlan.id.toString().startsWith('new-') && (
                  <button 
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
                        setIsSubmitting(true);
                        try {
                          await deletePlanFn({ data: { id: selectedPlan.id } });
                          toast.success("Plan deleted successfully");
                          setIsEditingPlan(false);
                          setSelectedPlan(null);
                          queryClient.invalidateQueries({ queryKey: ['global-plans'] });
                        } catch (err: any) {
                          toast.error(err.message || "Failed to delete plan");
                        } finally {
                          setIsSubmitting(false);
                        }
                      }
                    }}
                    className="w-full py-3 bg-[#FF5964]/10 text-[#FF5964] text-[14px] font-bold rounded-xl hover:bg-[#FF5964]/20 active:scale-95 transition-all"
                  >
                    Delete Plan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
