import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from 'react';
import { useServerFn } from "@tanstack/react-start";
import { createGymWithAdmin } from "@/lib/gyms.functions";
import { getAllGymsServer, updateGymStatus, extendSubscription } from "@/lib/super-admin.functions";
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
              <Link 
                key={gym.id}
                to="/dashboard/super-admin/gyms/$gymId"
                params={{ gymId: gym.id }}
                preload="intent"
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
              </Link>
            ))
          )}
        </section>
      </main>

      {/* Add Gym Modal Removed */}
    </div>
  );
}

export const GymsIndexRoute = SuperAdminGyms;
