import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from 'react';
import { useServerFn } from "@tanstack/react-start";
import { createGymWithAdmin } from "@/lib/gyms.functions";
import { getSubscriptionPlans } from "@/lib/plans.functions";
import { toast } from "sonner";

export const Route = createFileRoute('/dashboard/super-admin/gyms/add')({
  component: AddGymScreen,
});

function AddGymScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createGymFn = useServerFn(createGymWithAdmin);
  const getPlansFn = useServerFn(getSubscriptionPlans);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => getPlansFn(),
  });

  const [newGym, setNewGym] = useState({
    name: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
    gymCode: '',
    planId: ''
  });

  const generateGymCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewGym(prev => ({ ...prev, gymCode: code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createGymFn({ data: newGym });
      toast.success("Gym and Admin created successfully!");
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
      navigate({ to: '/dashboard/super-admin/gyms' });
    } catch (err: any) {
      toast.error(err.message || "Failed to create gym");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0A0B0A] antialiased pb-10 glow-top overflow-x-hidden ${isSubmitting ? 'tab-bar-hidden' : ''}`}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        .glow-top {
          background: radial-gradient(circle at top, rgba(183, 255, 30, 0.05) 0%, transparent 50%);
        }
      `}</style>

      <main className="max-w-[480px] mx-auto pt-6 px-5 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard/super-admin/gyms"
            className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center text-[#e3e3dd] active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-[20px] font-bold text-white">Add New Gym</h1>
          <p className="text-[12px] text-[#858A7D]">hello</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gym Info Section */}
          <section className="bg-[#121411] border border-white/5 rounded-2xl p-5 space-y-4">
            <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block">Gym Information</label>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[11px] text-[#858A7D] ml-1">Gym Name</p>
                <input 
                  required
                  placeholder="e.g. Energy Zone Fitness"
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                  value={newGym.name}
                  onChange={e => setNewGym(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] text-[#858A7D] ml-1">Address</p>
                <input 
                  required
                  placeholder="e.g. Sector 17, Chandigarh"
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                  value={newGym.address}
                  onChange={e => setNewGym(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] text-[#858A7D] ml-1">Gym Code</p>
                  <div className="relative">
                    <input 
                      required
                      placeholder="CODE"
                      className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#B7FF1E] font-mono font-bold tracking-widest focus:border-[#B7FF1E] outline-none transition-colors"
                      value={newGym.gymCode}
                      onChange={e => setNewGym(prev => ({ ...prev, gymCode: e.target.value.toUpperCase() }))}
                    />
                    <button 
                      type="button"
                      onClick={generateGymCode}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#B7FF1E] hover:bg-[#B7FF1E]/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] text-[#858A7D] ml-1">Subscription Plan</p>
                  <select 
                    required
                    className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors appearance-none"
                    value={newGym.planId}
                    onChange={e => setNewGym(prev => ({ ...prev, planId: e.target.value }))}
                  >
                    <option value="">Select Plan</option>
                    {plans?.map((plan: any) => (
                      <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Admin Details Section */}
          <section className="bg-[#121411] border border-white/5 rounded-2xl p-5 space-y-4">
            <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block">Administrator Details</label>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[11px] text-[#858A7D] ml-1">Admin Full Name</p>
                <input 
                  required
                  placeholder="e.g. John Doe"
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                  value={newGym.ownerName}
                  onChange={e => setNewGym(prev => ({ ...prev, ownerName: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] text-[#858A7D] ml-1">Admin Email</p>
                <input 
                  required
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                  value={newGym.ownerEmail}
                  onChange={e => setNewGym(prev => ({ ...prev, ownerEmail: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] text-[#858A7D] ml-1">Admin Phone</p>
                  <input 
                    required
                    type="tel"
                    placeholder="9876543210"
                    className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                    value={newGym.ownerPhone}
                    onChange={e => setNewGym(prev => ({ ...prev, ownerPhone: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] text-[#858A7D] ml-1">Admin Password</p>
                  <input 
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                    value={newGym.ownerPassword}
                    onChange={e => setNewGym(prev => ({ ...prev, ownerPassword: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </section>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#B7FF1E] text-black text-[16px] font-bold rounded-2xl shadow-[0_12px_24px_rgba(183,255,30,0.15)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined">add_circle</span>
            )}
            Register Gym
          </button>
        </form>
      </main>
    </div>
  );
}
