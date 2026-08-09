import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMembers, getCurrentGymId, createMember, updateMember, deleteMember, getFeePlans } from '@/lib/auth.functions';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/admin/members')({
  component: AdminMembers,
});


function AdminMembers() {
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ full_name: '', email: '', phone: '', fee_plan_id: '' });

  const getMembersFn = useServerFn(getMembers);
  const getGymIdFn = useServerFn(getCurrentGymId);
  const createMemberFn = useServerFn(createMember);
  const updateMemberFn = useServerFn(updateMember);
  const deleteMemberFn = useServerFn(deleteMember);
  const getPlansFn = useServerFn(getFeePlans);

  const { data: gymId } = useQuery({
    queryKey: ['current-gym-id'],
    queryFn: () => getGymIdFn(),
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', gymId],
    queryFn: () => getMembersFn({ data: { gymId: gymId! } }),
    enabled: !!gymId
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['gym-plans', gymId],
    queryFn: () => getPlansFn(),
    enabled: !!gymId
  });

  const handleAddMember = async () => {
    if (!newMember.full_name || !newMember.email || !gymId) return;
    try {
      await createMemberFn({ data: { ...newMember, gym_id: gymId } });
      toast.success('Member added successfully');
      setIsAdding(false);
      setNewMember({ full_name: '', email: '', phone: '', fee_plan_id: '' });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await deleteMemberFn({ data: { id } });
      toast.success('Member deleted');
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ['members'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete member');
    }
  };


  return (
    <div className="bg-[#000000] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div 
        className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(213, 255, 64, 0.15) 0%, rgba(213, 255, 64, 0) 70%)',
          borderRadius: '50%'
        }}
      />

      <div className="max-w-[480px] mx-auto min-h-screen pb-[80px] relative z-10 flex flex-col">
        <main className="flex-1 px-[20px] pt-8 flex flex-col">
          <header className="mb-[24px]">
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white mb-1">Members</h1>
            <p className="text-[14px] leading-[20px] text-[#C0C2B8]">{members.length} Total Members</p>
          </header>

          <div className="flex gap-[12px] mb-[24px]">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8]" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
              <input 
                className="w-full h-12 bg-[#1e201d] border border-white/5 rounded-xl pl-12 pr-4 text-[14px] text-[#e3e3dd] placeholder:text-[#C0C2B8] focus:outline-none focus:border-[#D5FF40] focus:ring-1 focus:ring-[#D5FF40] transition-colors" 
                placeholder="Search members..." 
                type="text"
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="h-12 w-12 flex items-center justify-center bg-[#D5FF40] rounded-xl active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-black font-bold">add</span>
            </button>
          </div>

          <div className="flex gap-[8px] overflow-x-auto no-scrollbar mb-[24px] pb-2 -mx-[20px] px-[20px]">
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#D5FF40] text-[11px] font-semibold text-black">All</button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#292b27] text-[11px] font-semibold text-[#C0C2B8] hover:bg-[#333532] transition-colors">Active</button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#292b27] text-[11px] font-semibold text-[#C0C2B8] hover:bg-[#333532] transition-colors">Overdue</button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#292b27] text-[11px] font-semibold text-[#C0C2B8] hover:bg-[#333532] transition-colors">Pending</button>
          </div>

          <div className="flex flex-col gap-[12px]">
            {members.map((member: any) => (
              <div 
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="flex items-center p-[16px] bg-[#1e201d] border border-white/5 rounded-xl relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D5FF40]/20 to-transparent"></div>
                {member.photo_url ? (
                  <img className="w-12 h-12 rounded-full object-cover mr-4 border border-white/10" src={member.photo_url} alt={member.full_name} />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center mr-4 border border-white/10">
                    <span className="text-[18px] font-semibold text-white">{member.full_name?.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold text-white">{member.full_name}</h3>
                  <p className="text-[12px] text-[#C0C2B8]">{member.fee_plans?.name || 'No Plan'}</p>
                </div>

                <div className={`px-2 py-1 rounded border ${
                  member.status === 'active' ? 'bg-[#A7F52A]/10 border-[#A7F52A]/20 text-[#A7F52A]' :
                  member.status === 'overdue' ? 'bg-[#FF5964]/10 border-[#FF5964]/20 text-[#FF5964]' :
                  'bg-[#D5FF40]/10 border-[#D5FF40]/20 text-[#D5FF40]'
                }`}>
                  <span className="text-[11px] font-semibold uppercase">{member.status}</span>
                </div>

              </div>
            ))}
          </div>
        </main>
      </div>

      {/* DETAIL DRAWER */}
      {selectedMember && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity animate-in fade-in duration-300" 
            onClick={() => setSelectedMember(null)}
          />
          <div 
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#0D0F0C] rounded-t-3xl z-[70] flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.8)] border-t border-white/10 transform transition-transform animate-in slide-in-from-bottom duration-300" 
            style={{ maxHeight: '85vh' }}
          >
            <div className="w-full flex justify-center py-3 shrink-0" onClick={() => setSelectedMember(null)}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
            </div>
            
            <div className="px-[20px] pb-safe pt-2 overflow-y-auto no-scrollbar flex-1">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1e201d] border-2 border-[#D5FF40] shadow-[0_0_16px_rgba(213,255,64,0.2)] mb-4">
                  {selectedMember.photo_url ? (
                    <img className="w-full h-full object-cover" src={selectedMember.photo_url} alt={selectedMember.full_name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#333532]">
                      <span className="text-[32px] font-bold text-white">{selectedMember.full_name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h2 className="text-[22px] font-bold text-white text-center leading-[26px] tracking-[-0.025em]">{selectedMember.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${selectedMember.status === 'active' ? 'bg-[#A7F52A]' : 'bg-[#FF5964]'}`}></span>
                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${selectedMember.status === 'active' ? 'text-[#A7F52A]' : 'text-[#FF5964]'}`}>
                    {selectedMember.status} Member
                  </span>
                </div>
              </div>


              <div className="space-y-[12px] mb-6">
                <div className="p-4 bg-[#121411] border border-white/5 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-[100px] bg-[radial-gradient(circle_at_50%_0%,rgba(213,255,64,0.05)_0%,transparent_60%)] pointer-events-none"></div>
                  
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#C0C2B8]" style={{ fontSize: '20px' }}>mail</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#C0C2B8] uppercase font-semibold tracking-wider">Email</p>
                      <p className="text-[14px] text-white truncate">{selectedMember.email}</p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-white/5 mb-4 relative z-10"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#C0C2B8]" style={{ fontSize: '20px' }}>phone_iphone</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#C0C2B8] uppercase font-semibold tracking-wider">Phone</p>
                      <p className="text-[14px] text-white truncate">{selectedMember.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#121411] border border-white/5 rounded-xl grid grid-cols-2 gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[100px] bg-[radial-gradient(circle_at_50%_0%,rgba(213,255,64,0.05)_0%,transparent_60%)] pointer-events-none"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] text-[#C0C2B8] uppercase font-semibold tracking-wider mb-1">Age</p>
                    <p className="text-[18px] font-semibold text-white">{selectedMember.age} y/o</p>
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] text-[#C0C2B8] uppercase font-semibold tracking-wider mb-1">DOB</p>
                    <p className="text-[18px] font-semibold text-white">{selectedMember.dob}</p>
                  </div>
                  <div className="col-span-2 mt-2 relative z-10">
                    <p className="text-[10px] text-[#C0C2B8] uppercase font-semibold tracking-wider mb-1">Address</p>
                    <p className="text-[14px] text-white leading-[20px]">{selectedMember.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pb-8 relative z-10">
                <button className="w-full h-12 bg-[#1e201d] border border-white/5 rounded-full flex items-center justify-center gap-2 text-[#D5FF40] text-[11px] font-bold uppercase tracking-wider hover:bg-[#292b27] transition-all active:scale-[0.98]">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
                  View History
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px]">
        <Link 
          to="/dashboard/admin" 
          activeOptions={{ exact: true }}
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>dashboard</span>
              <span className="text-[11px] font-semibold leading-[14px]">Dashboard</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/members" 
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>group</span>
              <span className="text-[11px] font-semibold leading-[14px]">Members</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/payments"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>receipt_long</span>
              <span className="text-[11px] font-semibold leading-[14px]">Payments</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/attendance"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>event_available</span>
              <span className="text-[11px] font-semibold leading-[14px]">Attendance</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/settings"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>settings</span>
              <span className="text-[11px] font-semibold leading-[14px]">Settings</span>
            </>
          )}
        </Link>
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}