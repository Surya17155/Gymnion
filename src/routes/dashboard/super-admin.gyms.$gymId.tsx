import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAllGymsServer, updateGymStatus, extendSubscription } from "@/lib/super-admin.functions";
import { toast } from "sonner";
import { useState } from 'react';
import { format } from 'date-fns';

export const Route = createFileRoute('/dashboard/super-admin/gyms/$gymId')({
  component: GymDetailScreen,
});

function GymDetailScreen() {
  const { gymId } = Route.useParams();
  const queryClient = useQueryClient();
  const getGymsFn = useServerFn(getAllGymsServer);
  const updateStatusFn = useServerFn(updateGymStatus);
  const extendSubFn = useServerFn(extendSubscription);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: gymsData, isLoading } = useQuery({
    queryKey: ['super-admin-gyms'],
    queryFn: () => getGymsFn({ data: { limit: 100 } }),
  });

  const gym = gymsData?.gyms?.find((g: any) => g.id === gymId);

  const handleStatusUpdate = async (newStatus: 'approved' | 'suspended') => {
    setIsUpdating(true);
    try {
      await updateStatusFn({ data: { gymId, status: newStatus } });
      toast.success(`Gym status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExtend = async (months: number) => {
    setIsUpdating(true);
    try {
      await extendSubFn({ data: { gymId, months } });
      toast.success(`Subscription extended by ${months} month(s)`);
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to extend subscription");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B7FF1E]/20 border-t-[#B7FF1E] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#0A0B0A] p-6 text-center">
        <p className="text-[#858A7D] mb-4">Gym not found</p>
        <Link to="/dashboard/super-admin/gyms" className="text-[#B7FF1E]">Go back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0A] antialiased pb-10 glow-top overflow-x-hidden">
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
          <h1 className="text-[20px] font-bold text-white">Gym Details</h1>
        </div>

        {/* Profile Card */}
        <section className="bg-[#121411] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#B7FF1E]/10 rounded-full blur-3xl"></div>
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-[#1e201d] flex items-center justify-center border border-[#B7FF1E]/20 text-[#B7FF1E] mb-4">
              <span className="material-symbols-outlined text-[48px]">fitness_center</span>
            </div>
            <h2 className="text-[24px] font-bold text-white">{gym.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${gym.status === 'suspended' ? 'bg-[#FF5964]' : 'bg-[#B7FF1E]'}`}></div>
              <span className="text-[12px] text-[#B7FF1E] font-bold tracking-widest uppercase">{gym.status}</span>
            </div>
          </div>
        </section>

        {/* Details Grid */}
        <div className="grid gap-4">
          <div className="bg-[#121411] border border-white/5 rounded-2xl p-5">
            <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-4">Core Information</label>
            <div className="space-y-4">
              <DetailRow icon="fingerprint" label="Gym Code" value={gym.gym_code} highlight />
              <DetailRow icon="subscriptions" label="Current Plan" value={gym.global_plans?.name || 'Manual Pricing'} />
              <DetailRow 
                icon="calendar_today" 
                label="Subscription Ends" 
                value={gym.subscription_ends_at ? format(new Date(gym.subscription_ends_at), 'PPP') : 'N/A'} 
              />
            </div>
          </div>

          <div className="bg-[#121411] border border-white/5 rounded-2xl p-5">
            <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-4">Administrator</label>
            <div className="space-y-4">
              <DetailRow icon="person" label="Name" value={gym.owner_name} />
              <DetailRow icon="mail" label="Email" value={gym.owner_email} />
              <DetailRow icon="call" label="Phone" value={gym.owner_phone} />
            </div>
          </div>

          <div className="bg-[#121411] border border-white/5 rounded-2xl p-5">
            <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block mb-4">Actions</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                disabled={isUpdating}
                onClick={() => handleStatusUpdate(gym.status === 'suspended' ? 'approved' : 'suspended')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] transition-all active:scale-95 ${gym.status === 'suspended' ? 'bg-[#B7FF1E] text-black shadow-[0_8px_16px_rgba(183,255,30,0.2)]' : 'bg-[#FF5964]/10 text-[#FF5964] border border-[#FF5964]/20'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{gym.status === 'suspended' ? 'check_circle' : 'block'}</span>
                {gym.status === 'suspended' ? 'Activate Gym' : 'Suspend Gym'}
              </button>
              <button 
                disabled={isUpdating}
                onClick={() => handleExtend(1)}
                className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-[13px] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                +30 Days
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ icon, label, value, highlight }: { icon: string, label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#858A7D]">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] text-[#858A7D] uppercase font-bold tracking-tighter">{label}</p>
        <p className={`text-[15px] font-medium ${highlight ? 'text-[#B7FF1E] font-mono font-bold' : 'text-white'}`}>{value || 'Not provided'}</p>
      </div>
    </div>
  );
}
