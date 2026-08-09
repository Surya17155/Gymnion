import { createFileRoute, Link } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from 'react';
import { useServerFn } from "@tanstack/react-start";
import { createGymWithAdmin } from "@/lib/gyms.functions";
import { getAllGymsServer, updateGymStatus, extendSubscription } from "@/lib/super-admin.functions";
import { getSubscriptionPlans } from "@/lib/plans.functions";
import { toast } from "sonner";

export const Route = createFileRoute('/dashboard/super-admin/gyms')({
  component: SuperAdminGyms,
});

function SuperAdminGyms() {
  const queryClient = useQueryClient();
  const createGymFn = useServerFn(createGymWithAdmin);
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [isAddingGym, setIsAddingGym] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const getGymsFn = useServerFn(getAllGymsServer);
  const getPlansFn = useServerFn(getSubscriptionPlans);
  const updateStatusFn = useServerFn(updateGymStatus);
  const extendSubFn = useServerFn(extendSubscription);

  const { data: gymsData, isLoading } = useQuery({
    queryKey: ['super-admin-gyms', searchQuery, statusFilter],
    queryFn: () => getGymsFn({ data: { search: searchQuery, status: statusFilter } }),
  });

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => getPlansFn(),
  });

  const gyms = gymsData?.gyms;

  // New Gym Form State
  const [newGym, setNewGym] = useState({
    name: '',
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

  const handleAddGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createGymFn({ data: newGym });
      toast.success("Gym and Admin created successfully!");
      setIsAddingGym(false);
      setNewGym({
        name: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerPhone: '',
        gymCode: '',
        planId: ''
      });
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create gym");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGyms = gyms?.filter(gym => 
    gym.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    gym.gym_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="antialiased pb-[72px] glow-top min-h-screen overflow-x-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <style>{`
        .glow-top {
          background: radial-gradient(circle at top, rgba(183, 255, 30, 0.1) 0%, transparent 50%);
        }
      `}</style>

      {/* Main Canvas */}
      <main className="max-w-[480px] mx-auto pt-6 px-5 flex flex-col gap-5">
        {/* Header Section */}
        <section>
          <h1 className="text-[24px] font-bold text-white leading-tight">Gym Network</h1>
        </section>

        {/* Hero Metric Card */}
        <section className="bg-[#121411] border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#B7FF1E]/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div className="flex flex-col gap-1">
              <h2 className="text-[14px] font-semibold text-[#858A7D]">Total Connected Gyms</h2>
              <div className="text-[32px] font-bold text-[#e3e3dd] leading-none">{gyms?.length || 0}</div>
            </div>
            <button 
              onClick={() => setIsAddingGym(true)}
              className="w-10 h-10 rounded-full bg-[#B7FF1E] text-black flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(183,255,30,0.3)] active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined font-bold text-[24px]">add</span>
            </button>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="flex flex-col gap-3">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#858A7D]">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl pl-10 pr-4 text-[#e3e3dd] focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E] transition-colors placeholder:text-[#858A7D] outline-none" 
              placeholder="Search gyms..." 
              type="text"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${statusFilter === 'all' ? 'bg-[#B7FF1E] text-black' : 'bg-[#1e201d] text-[#C0C2B8] border border-white/5'}`}
            >
              All Gyms
            </button>
            <button 
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${statusFilter === 'approved' ? 'bg-[#B7FF1E] text-black' : 'bg-[#1e201d] text-[#C0C2B8] border border-white/5'}`}
            >
              Approved
            </button>
            <button 
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${statusFilter === 'pending' ? 'bg-[#B7FF1E] text-black' : 'bg-[#1e201d] text-[#C0C2B8] border border-white/5'}`}
            >
              Pending Review
            </button>
            <button 
              onClick={() => setStatusFilter('suspended')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${statusFilter === 'suspended' ? 'bg-[#B7FF1E] text-black' : 'bg-[#1e201d] text-[#C0C2B8] border border-white/5'}`}
            >
              Suspended
            </button>
          </div>
        </section>

        {/* Gallery / List */}
        <section className="flex flex-col gap-3 pb-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-[#B7FF1E]/20 border-t-[#B7FF1E] rounded-full animate-spin"></div>
            </div>
          ) : (
            gyms?.map((gym: any) => (
              <Link 
                key={gym.id}
                to="/dashboard/super-admin/gyms/$gymId"
                params={{ gymId: gym.id }}
                className="bg-[#121411] border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:border-[#B7FF1E]/30 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#333532] flex-shrink-0 overflow-hidden border border-white/5 relative">
                  <div className="w-full h-full bg-[#1e201d] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#858A7D] text-[24px]">fitness_center</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-[16px] font-semibold text-[#e3e3dd]">{gym.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${gym.status === 'suspended' ? 'bg-[#FF5964]' : gym.status === 'pending' ? 'bg-yellow-500' : 'bg-[#B7FF1E]'}`}></div>
                    <span className="text-[11px] text-[#C0C2B8]">Code: {gym.gym_code || '---'} • {gym.global_plans?.name || 'No Plan'}</span>
                  </div>
                </div>
                <div className="text-[#858A7D] group-hover:text-[#B7FF1E] transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Add Gym Modal */}
      {isAddingGym && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddingGym(false)}></div>
          <div className="relative bg-[#121411] border-t border-white/10 rounded-t-[32px] p-6 pb-12 w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
            <div className="w-12 h-1.5 bg-[#1e201d] rounded-full mx-auto mb-6"></div>
            
            <h2 className="text-[20px] font-bold text-white mb-6">Add New Gym</h2>

            <form onSubmit={handleAddGym} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Gym Information</label>
                  <input 
                    required
                    placeholder="Gym Name"
                    className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                    value={newGym.name}
                    onChange={e => setNewGym(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <input 
                      required
                      placeholder="Gym Code"
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
                
                <div>
                  <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Subscription Plan</label>
                  <select 
                    required
                    className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors appearance-none"
                    value={newGym.planId}
                    onChange={e => setNewGym(prev => ({ ...prev, planId: e.target.value }))}
                  >
                    <option value="">Select a Plan</option>
                    {plans?.map((plan: any) => (
                      <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price / 100}/mo</option>
                    ))}
                  </select>
                </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-2">Admin Details</label>
                  <div className="space-y-3">
                    <input 
                      required
                      placeholder="Admin Full Name"
                      className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                      value={newGym.ownerName}
                      onChange={e => setNewGym(prev => ({ ...prev, ownerName: e.target.value }))}
                    />
                    <input 
                      required
                      type="email"
                      placeholder="Admin Email"
                      className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                      value={newGym.ownerEmail}
                      onChange={e => setNewGym(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    />
                    <input 
                      required
                      type="tel"
                      placeholder="Admin Phone"
                      className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                      value={newGym.ownerPhone}
                      onChange={e => setNewGym(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    />
                    <input 
                      required
                      type="password"
                      placeholder="Admin Password"
                      className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-[#e3e3dd] focus:border-[#B7FF1E] outline-none transition-colors"
                      value={newGym.ownerPassword}
                      onChange={e => setNewGym(prev => ({ ...prev, ownerPassword: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddingGym(false)}
                  className="flex-1 py-4 bg-[#1e201d] text-[#858A7D] text-[15px] font-bold rounded-2xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-[#B7FF1E] text-black text-[15px] font-bold rounded-2xl shadow-[0_12px_24px_rgba(183,255,30,0.15)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>}
                  Create Gym
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedGym && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGym(null)}></div>
          <div className="relative bg-[#121411] border-t border-white/10 rounded-t-[32px] p-6 pb-12 w-full max-w-[480px] mx-auto animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-[#1e201d] rounded-full mx-auto mb-8"></div>
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-[#1e201d] flex items-center justify-center border border-[#B7FF1E]/20 text-[#B7FF1E]">
                <span className="material-symbols-outlined text-4xl">fitness_center</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedGym.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#B7FF1E]"></span>
                  <span className="text-[11px] text-[#B7FF1E] font-bold tracking-widest uppercase">Verified Partner</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-[0.15em] block mb-3">Administrator Details</label>
                <div className="bg-[#1e201d]/30 rounded-2xl p-4 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#858A7D] uppercase font-bold">Name</p>
                      <p className="text-[14px] text-white font-medium">{selectedGym.owner_name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#858A7D] uppercase font-bold">Email</p>
                      <p className="text-[14px] text-white font-medium">{selectedGym.owner_email || 'Not provided'}</p>
                    </div>
                  </div>
                  {selectedGym.owner_phone && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#858A7D] uppercase font-bold">Phone</p>
                        <p className="text-[14px] text-white font-medium">{selectedGym.owner_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-[0.15em] block mb-3">Subscription Status</label>
                <div className="bg-[#1e201d]/30 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#C0C2B8]">Ends At:</span>
                    <span className="text-xs text-white font-medium">
                      {selectedGym.subscription_ends_at ? new Date(selectedGym.subscription_ends_at).toLocaleDateString() : 'No subscription'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        try {
                          await extendSubFn({ data: { gymId: selectedGym.id, months: 1 } });
                          toast.success("Subscription extended by 1 month");
                          queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
                          setSelectedGym(null);
                        } catch (err: any) {
                          toast.error(err.message || "Failed to extend");
                        }
                      }}
                      className="flex-1 py-2 bg-[#B7FF1E]/10 border border-[#B7FF1E]/30 rounded-xl text-[#B7FF1E] text-[10px] font-bold uppercase"
                    >
                      Extend 1 Mo
                    </button>
                    {selectedGym.status === 'approved' ? (
                      <button 
                        onClick={async () => {
                          try {
                            await updateStatusFn({ data: { gymId: selectedGym.id, status: 'suspended' } });
                            toast.success("Gym suspended");
                            queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
                            setSelectedGym(null);
                          } catch (err: any) {
                            toast.error(err.message || "Failed to suspend");
                          }
                        }}
                        className="flex-1 py-2 bg-[#FF5964]/10 border border-[#FF5964]/30 rounded-xl text-[#FF5964] text-[10px] font-bold uppercase"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button 
                        onClick={async () => {
                          try {
                            await updateStatusFn({ data: { gymId: selectedGym.id, status: 'approved' } });
                            toast.success("Gym reactivated");
                            queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
                            setSelectedGym(null);
                          } catch (err: any) {
                            toast.error(err.message || "Failed to activate");
                          }
                        }}
                        className="flex-1 py-2 bg-[#B7FF1E]/10 border border-[#B7FF1E]/30 rounded-xl text-[#B7FF1E] text-[10px] font-bold uppercase"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-[0.15em] block mb-3">Gym Configuration</label>
                <div className="bg-[#1e201d]/30 rounded-2xl p-4 border border-white/5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#858A7D] uppercase font-bold mb-1">Gym Code</p>
                    <p className="text-[18px] font-bold text-[#B7FF1E] font-mono tracking-wider">{selectedGym.gym_code || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#858A7D] uppercase font-bold mb-1">Join Date</p>
                    <p className="text-[14px] text-white font-medium">{selectedGym.created_at ? new Date(selectedGym.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedGym(null)}
              className="w-full mt-10 py-[18px] bg-[#B7FF1E] text-black text-[16px] font-bold rounded-2xl shadow-[0_12px_24px_rgba(183,255,30,0.15)] active:scale-95 transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
