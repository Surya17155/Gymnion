import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails, getFeePlans, createFeePlan, updateFeePlan, deleteFeePlan } from '@/lib/auth.functions';
import { useState } from 'react';
import { format } from 'date-fns';

export const Route = createFileRoute('/dashboard/admin/plans')({
  component: GymPlans,
});

function GymPlans() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billing_cycle: 'monthly',
    description: ''
  });

  const getGymDetailsFn = useServerFn(getGymDetails);
  const getFeePlansFn = useServerFn(getFeePlans);
  const createFeePlanFn = useServerFn(createFeePlan);
  const updateFeePlanFn = useServerFn(updateFeePlan);
  const deleteFeePlanFn = useServerFn(deleteFeePlan);

  const { data: gym } = useQuery({
    queryKey: ['admin-gym-details'],
    queryFn: () => getGymDetailsFn({ data: {} }),
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['gym-fee-plans', gym?.id],
    queryFn: () => getFeePlansFn({ data: { gymId: gym?.id } }),
    enabled: !!gym?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createFeePlanFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-fee-plans'] });
      setIsDrawerOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateFeePlanFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-fee-plans'] });
      setIsDrawerOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeePlanFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-fee-plans'] });
      setIsDrawerOpen(false);
      setEditingPlan(null);
      setIsDeleting(false);
    }
  });

  const resetForm = () => {
    setFormData({ name: '', amount: '', billing_cycle: 'monthly', description: '' });
    setEditingPlan(null);
    setIsDeleting(false);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      amount: plan.amount.toString(),
      billing_cycle: plan.billing_cycle || 'monthly',
      description: plan.description || ''
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      gym_id: gym.id
    };

    if (editingPlan) {
      updateMutation.mutate({ ...payload, id: editingPlan.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div 
        className="fixed top-0 left-0 right-0 h-[150px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(183, 255, 30, 0.08) 0%, transparent 70%)'
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
            <h2 className="text-[18px] font-bold text-white uppercase tracking-wider">GYM PRICING</h2>
            <p className="text-[12px] text-[#858A7D]">Manage membership options for your gym.</p>
          </div>
        </header>

        <main className="flex-1 px-[20px] flex flex-col gap-[24px] py-4">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white mb-1">{"\n"}</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="py-20 text-center text-[#858A7D]">Loading plans...</div>
            ) : plans?.length === 0 ? (
              <div className="py-20 text-center text-[#858A7D]">
                <span className="material-symbols-outlined text-[48px] opacity-20 block mb-2">payments</span>
                No plans created yet.
              </div>
            ) : (
              plans?.map((plan: any) => (
                <div key={plan.id} className="bg-[#1e201d] p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#25340D] flex items-center justify-center text-[#B7FF1E]">
                      <span className="material-symbols-outlined">sell</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{plan.name}</h3>
                      <p className="text-[12px] text-[#858A7D]">₹{plan.amount} / {plan.billing_cycle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(plan)}
                      className="w-10 h-10 rounded-full bg-[#121411] flex items-center justify-center text-[#B7FF1E] border border-white/5 active:bg-[#25340D]/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        
        <button 
          onClick={() => { resetForm(); setIsDrawerOpen(true); }}
          className="fixed bottom-[90px] right-6 bg-[#B7FF1E] w-14 h-14 rounded-full flex items-center justify-center text-[#293500] shadow-[0_8px_24px_rgba(183,255,30,0.3)] hover:scale-105 active:scale-95 transition-all z-[60]"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>

      {/* Add/Edit Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="bg-[#1e201d] w-full max-w-[480px] rounded-3xl border border-white/10 relative z-10 animate-in slide-in-from-bottom duration-300 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#858A7D] ml-1">Plan Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Monthly Gold"
                    className="bg-[#121411] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#B7FF1E] focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#858A7D] ml-1">Amount (₹)</label>
                    <input 
                      required
                      type="number" 
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="999"
                      className="bg-[#121411] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#B7FF1E] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#858A7D] ml-1">Billing Cycle</label>
                    <select 
                      value={formData.billing_cycle}
                      onChange={(e) => setFormData({...formData, billing_cycle: e.target.value})}
                      className="bg-[#121411] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#B7FF1E] focus:outline-none appearance-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half-yearly">Half Yearly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#858A7D] ml-1">Description (Optional)</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Features of this plan..."
                    className="bg-[#121411] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#B7FF1E] focus:outline-none h-24 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 bg-[#333532] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest border border-white/5"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1 bg-[#B7FF1E] text-[#293500] py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-[#B7FF1E]/10 disabled:opacity-50"
                    >
                      {editingPlan ? 'Save Changes' : 'Create Plan'}
                    </button>
                  </div>
                  
                  {editingPlan && (
                    <button 
                      type="button"
                      onClick={() => {
                        if (isDeleting) {
                          deleteMutation.mutate(editingPlan.id);
                        } else {
                          setIsDeleting(true);
                          setTimeout(() => setIsDeleting(false), 3000);
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                        isDeleting ? 'bg-[#FF5964] text-white' : 'text-[#FF5964]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isDeleting ? 'warning' : 'delete'}
                      </span>
                      {isDeleting ? 'Sure?' : 'Delete Plan'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Nav Bottom */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px]">
        <Link to="/dashboard/admin" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">dashboard</span><span className="text-[11px] font-semibold">Dashboard</span></Link>
        <Link to="/dashboard/admin/members" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">group</span><span className="text-[11px] font-semibold">Members</span></Link>
        <Link to="/dashboard/admin/payments" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">receipt_long</span><span className="text-[11px] font-semibold">Payments</span></Link>
        <Link to="/dashboard/admin/attendance" className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl text-[#C0C2B8]"><span className="material-symbols-outlined mb-1">event_available</span><span className="text-[11px] font-semibold">Attendance</span></Link>
        <Link to="/dashboard/admin/settings" activeProps={{className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90'}} className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl"><span className="material-symbols-outlined mb-1">settings</span><span className="text-[11px] font-semibold">Settings</span></Link>
      </nav>
    </div>
  );
}