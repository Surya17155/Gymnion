import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from 'react';
import { useServerFn } from "@tanstack/react-start";
import { createGymWithAdmin } from "@/lib/gyms.functions";
import { getAllGymsServer, updateGymStatus, extendSubscription, setGymManualPricing } from "@/lib/super-admin.functions";
import { getSubscriptionPlans } from "@/lib/plans.functions";
import { toast } from "sonner";

export const Route = createFileRoute('/dashboard/super-admin/gyms')({
  component: SuperAdminGymsLayout,
});

function SuperAdminGymsLayout() {
  return <Outlet />;
}

export function SuperAdminGyms() {
  const queryClient = useQueryClient();
  const createGymFn = useServerFn(createGymWithAdmin);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGymForPricing, setSelectedGymForPricing] = useState<any>(null);
  const [isUpdatingPricing, setIsUpdatingPricing] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    amount: '',
    payment_management: false,
    attendance_management: false
  });

  const getGymsFn = useServerFn(getAllGymsServer);
  const getPlansFn = useServerFn(getSubscriptionPlans);
  const updateStatusFn = useServerFn(updateGymStatus);
  const extendSubFn = useServerFn(extendSubscription);
  const setManualPricingFn = useServerFn(setGymManualPricing);

  useEffect(() => {
    if (selectedGymForPricing) {
      const settings = selectedGymForPricing.settings || {};
      const features = settings.features || {};
      setPricingForm({
        amount: settings.manual_pricing?.toString() || '',
        payment_management: !!features.payment_management,
        attendance_management: !!features.attendance_management
      });
    }
  }, [selectedGymForPricing]);

  const handleSavePricing = async () => {
    if (!selectedGymForPricing) return;
    setIsUpdatingPricing(true);
    try {
      await setManualPricingFn({
        data: {
          gymId: selectedGymForPricing.id,
          manualPricing: pricingForm.amount ? parseFloat(pricingForm.amount) : null,
          features: {
            payment_management: pricingForm.payment_management,
            attendance_management: pricingForm.attendance_management
          }
        }
      });
      toast.success("Pricing settings updated successfully");
      setSelectedGymForPricing(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update pricing");
    } finally {
      setIsUpdatingPricing(false);
    }
  };

  const { data: gymsData, isLoading } = useQuery({
    queryKey: ['super-admin-gyms', searchQuery, statusFilter],
    queryFn: () => getGymsFn({ data: { search: searchQuery, status: statusFilter } }),
  });

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => getPlansFn(),
  });

  const gyms = gymsData?.gyms;


  const filteredGyms = gyms?.filter(gym => 
    gym.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    gym.gym_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="antialiased pb-[72px] glow-top min-h-screen overflow-x-hidden relative z-0">
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
              onClick={() => navigate({ to: '/dashboard/super-admin/gyms/add' })}
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
              <div 
                key={gym.id}
                className="bg-[#121411] border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:border-[#B7FF1E]/30 transition-colors cursor-pointer group relative"
              >
                <Link 
                  to="/dashboard/super-admin/gyms/$gymId"
                  params={{ gymId: gym.id }}
                  preload="intent"
                  className="flex-1 flex items-center gap-3"
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
                      <span className="text-[11px] text-[#C0C2B8]">Code: {gym.gym_code || '---'} • {gym.global_plans?.name || (gym.settings?.manual_pricing ? 'Manual' : 'No Plan')}</span>
                    </div>
                  </div>
                </Link>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedGymForPricing(gym);
                    }}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#858A7D] hover:text-[#B7FF1E] transition-colors"
                    title="Manual Pricing"
                  >
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                  </button>
                  <Link 
                    to="/dashboard/super-admin/gyms/$gymId"
                    params={{ gymId: gym.id }}
                    className="text-[#858A7D] group-hover:text-[#B7FF1E] transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Manual Pricing Drawer */}
      {selectedGymForPricing && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-[9998] animate-in fade-in duration-300"
            onClick={() => setSelectedGymForPricing(null)}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#121411] border-t border-white/10 rounded-t-[32px] p-6 pb-safe z-[9999] animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-white">Manual Pricing</h3>
                <p className="text-[12px] text-[#858A7D]">{selectedGymForPricing.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#858A7D] uppercase tracking-wider">Pricing Amount (₹/mo)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-white font-bold">₹</span>
                  </div>
                  <input 
                    type="number"
                    value={pricingForm.amount}
                    onChange={(e) => setPricingForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full h-14 bg-[#1e201d] border border-white/10 rounded-2xl pl-10 pr-4 text-white font-bold text-[18px] outline-none focus:border-[#B7FF1E] transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#858A7D] uppercase tracking-wider">Features Access</label>
                
                <div 
                  onClick={() => setPricingForm(prev => ({ ...prev, payment_management: !prev.payment_management }))}
                  className="flex items-center justify-between p-4 bg-[#1e201d] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${pricingForm.payment_management ? 'text-[#B7FF1E]' : 'text-[#858A7D]'}`}>payments</span>
                    <span className="text-[14px] font-medium text-white">Payment Management</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${pricingForm.payment_management ? 'bg-[#B7FF1E]' : 'bg-[#333532]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pricingForm.payment_management ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div 
                  onClick={() => setPricingForm(prev => ({ ...prev, attendance_management: !prev.attendance_management }))}
                  className="flex items-center justify-between p-4 bg-[#1e201d] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${pricingForm.attendance_management ? 'text-[#B7FF1E]' : 'text-[#858A7D]'}`}>qr_code_scanner</span>
                    <span className="text-[14px] font-medium text-white">Attendance Management</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${pricingForm.attendance_management ? 'bg-[#B7FF1E]' : 'bg-[#333532]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pricingForm.attendance_management ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setSelectedGymForPricing(null)}
                  className="flex-1 h-14 bg-white/5 text-[#858A7D] font-bold rounded-2xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isUpdatingPricing}
                  onClick={handleSavePricing}
                  className="flex-[2] h-14 bg-[#B7FF1E] text-black font-bold rounded-2xl shadow-[0_8px_20px_rgba(183,255,30,0.2)] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdatingPricing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Gym Modal Removed */}
    </div>
  );
}

export const GymsIndexRoute = SuperAdminGyms;
