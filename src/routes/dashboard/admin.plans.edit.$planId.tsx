import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/admin/plans/edit/$planId')({
  component: EditPlanScreen,
});

function EditPlanScreen() {
  const navigate = useNavigate();
  const { planId } = useParams({ from: '/dashboard/admin/plans/edit/$planId' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    duration: '1',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchPlan = async () => {
      const { data, error } = await supabase
        .from('fee_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error || !data) {
        toast.error('Plan not found');
        navigate({ to: '/dashboard/admin/plans' });
        return;
      }

      setFormData({
        name: data.name,
        amount: data.amount.toString(),
        duration: data.billing_cycle === 'monthly' ? '1' : 
                 data.billing_cycle === 'annual' ? '12' : '1',
        description: data.description || '',
        isActive: data.is_active,
      });
    };

    fetchPlan();
  }, [planId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('fee_plans')
        .update({
          name: formData.name,
          amount: parseFloat(formData.amount),
          description: formData.description,
          billing_cycle: formData.duration === '1' ? 'monthly' : 
                         formData.duration === '12' ? 'annual' : 
                         `${formData.duration} months`,
          is_active: formData.isActive
        })
        .eq('id', planId);

      if (error) throw error;

      toast.success('Plan updated successfully!');
      navigate({ to: '/dashboard/admin/plans' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        const { error } = await supabase
          .from('fee_plans')
          .delete()
          .eq('id', planId);

        if (error) throw error;

        toast.success('Plan deleted successfully!');
        navigate({ to: '/dashboard/admin/plans' });
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete plan');
      }
    }
  };

  return (
    <div className="bg-[#0d0f0c] text-[#e3e3dd] antialiased min-h-screen flex flex-col relative overflow-x-hidden font-['Poppins']">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15), transparent 50%)'
        }}
      />

      <header className="flex justify-between items-center px-[20px] h-[64px] w-full sticky top-0 z-40 bg-transparent backdrop-blur-md">
        <button 
          onClick={() => navigate({ to: '/dashboard/admin/plans' })}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity text-[#B7FF1E] bg-[#1e201d]/50"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </button>
        <div className="flex-1 flex justify-center pr-10">
          <h2 className="text-[20px] font-semibold tracking-[-0.015em] text-[#e3e3dd]">Edit Plan</h2>
        </div>
      </header>

      <main className="flex-1 pt-4 pb-safe px-[20px] w-full max-w-[480px] mx-auto relative z-10 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full flex-1">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-[#C0C2B8] uppercase tracking-wider" htmlFor="plan-name">Plan Name</label>
              <input 
                className="bg-[#151714] border border-white/5 w-full h-[48px] rounded-xl px-4 text-[#e3e3dd] focus:outline-none focus:border-[#d5ff40] focus:ring-1 focus:ring-[#d5ff40] transition-all placeholder:text-[#858A7D]" 
                id="plan-name" 
                required 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-[11px] font-semibold text-[#C0C2B8] uppercase tracking-wider" htmlFor="amount">Amount (INR)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#858A7D]">₹</span>
                <input 
                  className="bg-[#151714] border border-white/5 w-full h-[48px] rounded-xl pl-8 pr-4 text-[#e3e3dd] focus:outline-none focus:border-[#d5ff40] focus:ring-1 focus:ring-[#d5ff40] transition-all placeholder:text-[#858A7D]" 
                  id="amount" 
                  min="0" 
                  required 
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-[11px] font-semibold text-[#C0C2B8] uppercase tracking-wider" htmlFor="duration">Duration (Months)</label>
              <div className="relative">
                <select 
                  className="bg-[#151714] border border-white/5 w-full h-[48px] rounded-xl px-4 text-[#e3e3dd] focus:outline-none focus:border-[#d5ff40] focus:ring-1 focus:ring-[#d5ff40] transition-all appearance-none" 
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#858A7D] pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-[#C0C2B8] uppercase tracking-wider" htmlFor="description">Description</label>
              <textarea 
                className="bg-[#151714] border border-white/5 w-full rounded-xl p-4 text-[#e3e3dd] focus:outline-none focus:border-[#d5ff40] focus:ring-1 focus:ring-[#d5ff40] transition-all placeholder:text-[#858A7D] min-h-[120px] resize-none" 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#151714] border border-white/5 rounded-xl mt-2">
              <div className="flex flex-col">
                <span className="text-[18px] font-semibold text-[#e3e3dd]">Set as Active</span>
                <span className="text-[12px] text-[#C0C2B8]">Available for immediate assignment</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <div className="w-11 h-6 bg-[#292A28] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d5ff40] border border-white/10"></div>
              </label>
            </div>
          </div>

          <div className="flex-grow"></div>

          <div className="pb-8 pt-6 flex flex-col gap-3">
            <button 
              disabled={loading}
              className="w-full h-[48px] bg-[#d5ff40] text-[#121411] font-semibold rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_20px_rgba(213,255,64,0.22)] uppercase tracking-wide disabled:opacity-50" 
              type="submit"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>save</span>
              {loading ? 'Saving...' : 'Update Plan'}
            </button>
            <button 
              type="button"
              onClick={handleDelete}
              className="w-full h-[48px] bg-transparent text-[#FF5964] border border-[#FF5964]/30 font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-[#FF5964]/10 active:scale-95 transition-all uppercase tracking-wide" 
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>delete</span>
              Delete Plan
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
