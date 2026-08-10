import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAllGymsServer, updateGymStatus, extendSubscription, updateGymDetails, updateGymAdminDetails } from "@/lib/super-admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useRef } from 'react';
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
  const updateGymFn = useServerFn(updateGymDetails);
  const updateAdminFn = useServerFn(updateGymAdminDetails);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingSection, setEditingSection] = useState<'gym' | 'admin' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: gymsData, isLoading } = useQuery({
    queryKey: ['super-admin-gyms'],
    queryFn: () => getGymsFn({ data: { limit: 100 } }),
  });

  const gym = gymsData?.gyms?.find((g: any) => g.id === gymId);

  const [editGymData, setEditGymData] = useState({
    name: '',
    address: '',
    gymCode: ''
  });

  const [editAdminData, setEditAdminData] = useState({
    ownerFirstName: '',
    ownerLastName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: ''
  });

  // Initialize edit data when gym is loaded
  useState(() => {
    if (gym) {
      setEditGymData({
        name: gym.name || '',
        address: (gym as any).address || '',
        gymCode: gym.gym_code || ''
      });
      setEditAdminData({
        ownerFirstName: (gym as any).owner_first_name || '',
        ownerLastName: (gym as any).owner_last_name || '',
        ownerName: gym.owner_name || '',
        ownerEmail: gym.owner_email || '',
        ownerPhone: gym.owner_phone || ''
      });
    }
  });

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

  const handleUpdateGym = async () => {
    setIsUpdating(true);
    try {
      await updateGymFn({ data: { gymId, ...editGymData } });
      toast.success("Gym details updated");
      setEditingSection(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update gym");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAdmin = async () => {
    setIsUpdating(true);
    try {
      await updateAdminFn({ data: { gymId, ...editAdminData } });
      toast.success("Admin details updated");
      setEditingSection(null);
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update admin");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${gymId}-${Math.random()}.${fileExt}`;
      const filePath = `admin-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gym-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gym-assets')
        .getPublicUrl(filePath);

      await updateGymFn({ data: { gymId, ownerPhotoUrl: publicUrl } });
      toast.success("Admin photo updated");
      queryClient.invalidateQueries({ queryKey: ['super-admin-gyms'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
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

  const hasPlan = !!gym.global_plans?.name;

  return (
    <div className={`min-h-screen bg-[#0A0B0A] antialiased ${editingSection ? 'tab-bar-hidden' : 'pb-10'} glow-top overflow-x-hidden relative`}>
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
          <p className="text-[12px] text-[#858A7D]">{"\n"}</p>
        </div>

        {/* Profile Card */}
        <section className="bg-[#121411] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#B7FF1E]/10 rounded-full blur-3xl"></div>
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative group">
              <div 
                className={`w-24 h-24 rounded-2xl bg-[#1e201d] flex items-center justify-center border border-[#B7FF1E]/20 text-[#B7FF1E] mb-4 overflow-hidden relative ${editingSection === 'gym' ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (editingSection === 'gym') {
                    fileInputRef.current?.click();
                  }
                }}
              >
                {(gym as any).owner_photo_url ? (
                  <img src={(gym as any).owner_photo_url} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[48px]">person</span>
                )}
                {editingSection === 'gym' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
            
            <div className="flex items-center gap-2 group">
              {editingSection === 'gym' ? (
                <div className="w-full space-y-3 px-4">
                  <input 
                    className="w-full h-10 bg-[#1e201d] border border-white/10 rounded-lg px-3 text-white text-center text-[20px] font-bold outline-none focus:border-[#B7FF1E]"
                    value={editGymData.name}
                    onChange={e => setEditGymData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input 
                    placeholder="Address"
                    className="w-full h-8 bg-[#1e201d] border border-white/10 rounded-lg px-3 text-[#858A7D] text-center text-[12px] outline-none focus:border-[#B7FF1E]"
                    value={editGymData.address}
                    onChange={e => setEditGymData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center relative">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[24px] font-bold text-white">{gym.name}</h2>
                    <button 
                      onClick={() => {
                        setEditingSection('gym');
                        setEditGymData({
                          name: gym.name || '',
                          address: (gym as any).address || '',
                          gymCode: gym.gym_code || ''
                        });
                      }}
                      className="text-[#858A7D] hover:text-[#B7FF1E] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                  <p className="text-[12px] text-[#858A7D] mt-1">{(gym as any).address || 'No address set'}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${gym.status === 'suspended' ? 'bg-[#FF5964]' : 'bg-[#B7FF1E]'}`}></div>
              <span className="text-[12px] text-[#B7FF1E] font-bold tracking-widest uppercase">{gym.status}</span>
            </div>
          </div>
        </section>

        {/* Details Grid */}
        <div className="grid gap-4">
          <div className="bg-[#121411] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block">Core Information</label>
              <button 
                onClick={() => {
                  setEditingSection('gym');
                  setEditGymData({
                    name: gym.name || '',
                    address: (gym as any).address || '',
                    gymCode: gym.gym_code || ''
                  });
                }}
                className="text-[#B7FF1E] flex items-center gap-1 active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span className="text-[11px] font-bold">Edit</span>
              </button>
            </div>
            <div className="space-y-4">
              {editingSection === 'gym' ? (
                <div className="space-y-3">
                   <div className="space-y-1">
                    <p className="text-[10px] text-[#858A7D] font-bold">GYM CODE</p>
                    <input 
                      className="w-full h-10 bg-[#1e201d] border border-white/10 rounded-lg px-3 text-[#B7FF1E] font-mono font-bold outline-none focus:border-[#B7FF1E]"
                      value={editGymData.gymCode}
                      onChange={e => setEditGymData(prev => ({ ...prev, gymCode: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>
              ) : (
                <DetailRow icon="fingerprint" label="Gym Code" value={gym.gym_code} highlight />
              )}
              
              <DetailRow 
                icon="subscriptions" 
                label="Current Plan" 
                value={(gym.settings as any)?.manual_pricing ? `Manual (₹${(gym.settings as any).manual_pricing})` : (gym.global_plans?.name || 'no plan')} 
              />
              <DetailRow 
                icon="calendar_today" 
                label="Subscription Ends" 
                value={(hasPlan || (gym.settings as any)?.manual_pricing) && gym.subscription_ends_at ? format(new Date(gym.subscription_ends_at), 'PPP') : 'N/A'} 
              />
            </div>
          </div>

          <div className="bg-[#121411] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-bold text-[#858A7D] uppercase tracking-widest block">Administrator</label>
              <button 
                onClick={() => {
                  setEditingSection('admin');
                  setEditAdminData({
                    ownerFirstName: (gym as any).owner_first_name || '',
                    ownerLastName: (gym as any).owner_last_name || '',
                    ownerName: gym.owner_name || '',
                    ownerEmail: gym.owner_email || '',
                    ownerPhone: gym.owner_phone || ''
                  });
                }}
                className="text-[#B7FF1E] flex items-center gap-1 active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span className="text-[11px] font-bold">Edit</span>
              </button>
            </div>
            <div className="space-y-4">
              {editingSection === 'admin' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#858A7D] font-bold">FIRST NAME</p>
                      <input 
                        className="w-full h-10 bg-[#1e201d] border border-white/10 rounded-lg px-3 text-white outline-none focus:border-[#B7FF1E]"
                        value={editAdminData.ownerFirstName}
                        onChange={e => {
                          const newFirstName = e.target.value;
                          setEditAdminData(prev => ({ ...prev, ownerFirstName: newFirstName, ownerName: `${newFirstName} ${prev.ownerLastName}`.trim() }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#858A7D] font-bold">LAST NAME</p>
                      <input 
                        className="w-full h-10 bg-[#1e201d] border border-white/10 rounded-lg px-3 text-white outline-none focus:border-[#B7FF1E]"
                        value={editAdminData.ownerLastName}
                        onChange={e => {
                          const newLastName = e.target.value;
                          setEditAdminData(prev => ({ ...prev, ownerLastName: newLastName, ownerName: `${prev.ownerFirstName} ${newLastName}`.trim() }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#858A7D] font-bold">EMAIL</p>
                    <input 
                      className="w-full h-10 bg-[#1e201d] border border-white/10 rounded-lg px-3 text-white outline-none focus:border-[#B7FF1E]"
                      value={editAdminData.ownerEmail}
                      onChange={e => setEditAdminData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#858A7D] font-bold">PHONE</p>
                    <input 
                      className="w-full h-10 bg-[#1e201d] border border-white/10 rounded-lg px-3 text-white outline-none focus:border-[#B7FF1E]"
                      value={editAdminData.ownerPhone}
                      onChange={e => setEditAdminData(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <DetailRow icon="person" label="First Name" value={(gym as any).owner_first_name} />
                  <DetailRow icon="person" label="Last Name" value={(gym as any).owner_last_name} />
                  <DetailRow icon="mail" label="Email" value={gym.owner_email} />
                  <DetailRow icon="call" label="Phone" value={gym.owner_phone} />
                </>
              )}
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
                className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-[13px] active:scale-95 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                +30 Days
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {editingSection && (
        <>
          <style>{`
            nav { transform: translateY(100%); pointer-events: none; }
          `}</style>
          <div 
            className="fixed inset-0 bg-black/60 z-[99998] animate-in fade-in duration-300"
            onClick={() => setEditingSection(null)}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 py-6 pb-safe bg-[#121411] border-t border-white/10 rounded-t-[32px] z-[99999] animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex gap-3">
            <button 
              onClick={() => setEditingSection(null)}
              className="flex-1 py-3 bg-[#1e201d] text-[#858A7D] rounded-xl font-bold text-[14px] active:scale-95 transition-all border border-white/5"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (editingSection === 'gym') handleUpdateGym();
                else handleUpdateAdmin();
              }}
              disabled={isUpdating}
              className="flex-1 py-3 bg-[#B7FF1E] text-black rounded-xl font-bold text-[14px] active:scale-95 transition-all shadow-[0_8px_16px_rgba(183,255,30,0.2)]"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value, highlight }: { icon: string, label: string, value: string | null | undefined, highlight?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#858A7D]">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-[#858A7D] uppercase font-bold tracking-tighter">{label}</p>
        <p className={`text-[15px] font-medium truncate ${highlight ? 'text-[#B7FF1E] font-mono font-bold' : 'text-white'}`}>{value || 'Not provided'}</p>
      </div>
    </div>
  );
}
