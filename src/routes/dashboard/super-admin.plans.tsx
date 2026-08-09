import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '@/lib/plans.functions';
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
  const [selectedGymForOverride, setSelectedGymForOverride] = useState<Gym | null>(null);
  const [customMonthlyPrice, setCustomMonthlyPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualFeatures, setManualFeatures] = useState<any[]>(['']);

  const getPlansFn = useServerFn(getSubscriptionPlans);
  const createPlanFn = useServerFn(createSubscriptionPlan);
  const updatePlanFn = useServerFn(updateSubscriptionPlan);
  const deletePlanFn = useServerFn(deleteSubscriptionPlan);

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
      const currentSettings = (selectedGymForOverride.settings as Record<string, any>) || {};
      const newSettings = { 
        ...currentSettings, 
        manual_pricing: parseFloat(customMonthlyPrice) 
      };

      const { error } = await supabase
        .from('gyms')
        .update({ settings: newSettings })
        .eq('id', selectedGymForOverride.id);

      if (error) throw error;

      toast.success(`Manual pricing set for ${selectedGymForOverride.name}`);
      setIsAddingOverride(false);
      setSelectedGymForOverride(null);
      setCustomMonthlyPrice('');
      setSearchQuery('');
      queryClient.invalidateQueries({ queryKey: ['gyms-with-overrides'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to set manual pricing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setManualFeatures(plan.features || ['']);
    setIsEditingPlan(true);
  };

  const handleUpdatePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlan) return;
    
    console.log('Starting handleUpdatePlan', { selectedPlan, manualFeatures });
    setIsSubmitting(true);
    
    try {
      if (!selectedPlan.name || !selectedPlan.price) {
        toast.error("Please provide a plan name and price");
        setIsSubmitting(false);
        return;
      }
      
      const cleanedFeatures = manualFeatures.filter((f: any) => {
        const text = typeof f === 'string' ? f : f.name;
        return text && text.trim() !== '';
      }).map((f: any) => {
        if (typeof f === 'string') return { name: f, enabled: true };
        return { name: f.name, enabled: f.enabled !== false };
      });

      const planData = {
        name: selectedPlan.name,
        price: Math.round(parseFloat(selectedPlan.price.toString()) * 100),
        features: cleanedFeatures as any,
        is_active: selectedPlan.is_active !== false,
        updated_at: new Date().toISOString()
      };

      console.log('Prepared planData', planData);

      let error;
      const isNewPlan = !selectedPlan.id || (typeof selectedPlan.id === 'string' && selectedPlan.id.startsWith('new-'));
      
      if (!isNewPlan) {
        console.log('Updating existing plan', selectedPlan.id);
        await updatePlanFn({
          id: selectedPlan.id,
          ...planData
        });
      } else {
        console.log('Inserting new plan');
        await createPlanFn(planData);
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
    <div className="flex-1 overflow-y-auto h-full w-full relative z-10 pb-24 md:pb-8">
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
                setSelectedPlan({ id: `new-${Date.now()}`, name: '', price: '' });
                setManualFeatures(['']);
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
                  {plan.features?.map((feature: any, idx: number) => {
                    const isEnabled = typeof feature === 'string' ? true : feature.enabled;
                    const text = typeof feature === 'string' ? feature : feature.name;
                    
                    return (
                      <li key={idx} className={`flex items-center gap-3 text-sm group cursor-pointer ${
                        plan.name.toLowerCase() === 'unlimited' ? 'text-[#e3e3dd]' : 'text-[#C0C2B8]'
                      }`}
                      onClick={() => {
                        const updatedFeatures = [...plan.features];
                        if (typeof updatedFeatures[idx] === 'string') {
                           updatedFeatures[idx] = { name: updatedFeatures[idx], enabled: false };
                        } else {
                           updatedFeatures[idx] = { ...updatedFeatures[idx], enabled: !isEnabled };
                        }
                        
                        supabase.from('global_plans').update({ features: updatedFeatures as any }).eq('id', plan.id).then(() => {
                          queryClient.invalidateQueries({ queryKey: ['global-plans'] });
                        });
                      }}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ 
                          fontVariationSettings: "'FILL' 1",
                          color: isEnabled ? '#c9f232' : '#FF5964'
                        }}>
                          {isEnabled ? 'check_circle' : 'cancel'}
                        </span>
                        {text}
                      </li>
                    );
                  })}
                </ul>

                <button 
                  onClick={() => handleEditPlan({ ...plan, price: (plan.price / 100).toString() })}
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
            
            {gymsWithOverrides?.map((gym) => (
              <div key={gym.id} className="bg-[#121411] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <div className="w-12 h-12 rounded-lg bg-[#383a36] flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined text-[#858A7D]">fitness_center</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#e3e3dd]">{gym.name}</h3>
                    <p className="text-xs text-[#C0C2B8]">Manual Pricing Enabled</p>
                  </div>
                </div>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#858A7D] block mb-1 uppercase tracking-wider">Manual Pricing (Monthly)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="text-lg font-semibold text-[#C0C2B8]">₹</span>
                      </div>
                      <input 
                        className="w-full h-12 bg-[#1a1c19] border border-white/10 rounded-xl pl-8 pr-4 text-white font-bold focus:border-[#c9f232] outline-none" 
                        defaultValue={(gym.settings as any)?.manual_pricing}
                        type="number" 
                        onBlur={async (e) => {
                          const newPrice = parseFloat(e.target.value);
                          if (!isNaN(newPrice)) {
                            await supabase.from('gyms').update({
                              settings: { ...(gym.settings as any), manual_pricing: newPrice }
                            }).eq('id', gym.id);
                            toast.success("Price updated");
                            queryClient.invalidateQueries({ queryKey: ['gyms-with-overrides'] });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 bg-[#c9f232] text-[#576c00] text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Update Settings
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Manual Pricing Modal */}
      {isAddingOverride && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddingOverride(false)}></div>
          <div className="relative bg-[#121411] border-t border-white/10 rounded-t-[32px] p-6 pb-24 w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-[#1e201d] rounded-full mx-auto mb-6"></div>
            
            <h2 className="text-[20px] font-bold text-white mb-6">Add Manual Pricing</h2>

            <div className="space-y-5">
              {!selectedGymForOverride ? (
                <div className="space-y-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#858A7D]">search</span>
                    <input 
                      autoFocus
                      className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl pl-10 pr-4 text-[#e3e3dd] focus:border-[#c9f232] outline-none transition-colors" 
                      placeholder="Search existing gym..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {filteredGymsForSearch?.map(gym => (
                      <button 
                        key={gym.id}
                        onClick={() => setSelectedGymForOverride(gym)}
                        className="w-full p-3 bg-[#1e201d] border border-white/5 rounded-xl flex items-center justify-between text-left hover:border-[#c9f232]/30 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{gym.name}</p>
                          <p className="text-[10px] text-[#858A7D] uppercase tracking-wider">{gym.gym_code}</p>
                        </div>
                        <span className="material-symbols-outlined text-[#858A7D]">add_circle</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="bg-[#c9f232]/10 border border-[#c9f232]/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#c9f232] font-bold uppercase tracking-wider mb-0.5">Selected Gym</p>
                      <p className="text-base font-bold text-white">{selectedGymForOverride.name}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedGymForOverride(null)}
                      className="text-[#858A7D] hover:text-white"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Manual Monthly Price (₹)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="text-lg font-semibold text-[#C0C2B8]">₹</span>
                      </div>
                      <input 
                        required
                        type="number"
                        placeholder="e.g. 750"
                        className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl pl-8 pr-4 text-[#e3e3dd] font-bold focus:border-[#c9f232] outline-none"
                        value={customMonthlyPrice}
                        onChange={e => setCustomMonthlyPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddingOverride(false)}
                      className="flex-1 py-4 bg-[#1e201d] text-[#858A7D] text-[15px] font-bold rounded-2xl"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddOverride}
                      disabled={isSubmitting || !customMonthlyPrice}
                      className="flex-[2] py-4 bg-[#c9f232] text-black text-[15px] font-bold rounded-2xl shadow-[0_12px_24px_rgba(201,242,50,0.15)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>}
                      Set Pricing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditingPlan && selectedPlan && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsEditingPlan(false)}></div>
          <div className="relative bg-[#121411] border-t border-white/10 rounded-t-[32px] p-6 pb-24 w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
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
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Features (Click icon to toggle)</label>
                <div className="space-y-2">
                  {manualFeatures.map((feature: any, idx: number) => {
                    const isEnabled = typeof feature === 'string' ? true : feature.enabled;
                    const text = typeof feature === 'string' ? feature : feature.name;
                    
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-[#1e201d] border border-white/5 p-3 rounded-xl">
                        <button 
                          type="button"
                          onClick={() => {
                            const newFeatures = [...manualFeatures];
                            if (typeof newFeatures[idx] === 'string') {
                              newFeatures[idx] = { name: newFeatures[idx], enabled: false };
                            } else {
                              newFeatures[idx] = { ...newFeatures[idx], enabled: !isEnabled };
                            }
                            setManualFeatures(newFeatures);
                          }}
                          className="transition-transform active:scale-90"
                        >
                          <span className="material-symbols-outlined text-sm" style={{ 
                            fontVariationSettings: "'FILL' 1",
                            color: isEnabled ? '#c9f232' : '#FF5964'
                          }}>
                            {isEnabled ? 'check_circle' : 'cancel'}
                          </span>
                        </button>
                        <input 
                          type="text"
                          className="text-sm text-[#e3e3dd] bg-transparent border-none outline-none flex-1"
                          value={text}
                          placeholder="Feature name..."
                          onChange={e => {
                            const newFeatures = [...manualFeatures];
                            if (typeof newFeatures[idx] === 'string') {
                              newFeatures[idx] = e.target.value;
                            } else {
                              newFeatures[idx] = { ...newFeatures[idx], name: e.target.value };
                            }
                            setManualFeatures(newFeatures);
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newFeatures = manualFeatures.filter((_, i) => i !== idx);
                            setManualFeatures(newFeatures.length > 0 ? newFeatures : ['']);
                          }}
                          className="text-[#858A7D] hover:text-white"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    );
                  })}
                  <button 
                    type="button"
                    onClick={() => setManualFeatures([...manualFeatures, ''])}
                    className="w-full py-2 border border-dashed border-white/10 rounded-xl text-[10px] font-bold text-[#858A7D] uppercase tracking-wider hover:border-[#c9f232]/30 transition-colors"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditingPlan(false)}
                  className="flex-1 py-4 bg-[#1e201d] text-[#858A7D] text-[15px] font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-[#c9f232] text-black text-[15px] font-bold rounded-2xl shadow-[0_12px_24px_rgba(201,242,50,0.15)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
