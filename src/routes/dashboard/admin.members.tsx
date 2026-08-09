import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMembers, getCurrentGymId, createMember, deleteMember, getFeePlans } from '@/lib/auth.functions';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/admin/members')({
  component: MembersDashboard,
});

function MembersDashboard() {
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ full_name: '', email: '', phone: '', fee_plan_id: '' });

  const getMembersFn = useServerFn(getMembers);
  const getGymIdFn = useServerFn(getCurrentGymId);
  const createMemberFn = useServerFn(createMember);
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
    if (!newMember.full_name || !newMember.email || !gymId) {
      toast.error('Please fill in required fields');
      return;
    }
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
    <div className="min-h-screen bg-[#0D0F0C] text-[#e3e3dd] font-['Poppins'] pb-32">
      {/* Top Glow Effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15) 0%, rgba(18, 20, 17, 0) 70%)'
        }}
      />

      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-[32px] font-bold leading-[32px] tracking-[-0.04em] text-white mb-2">Members</h1>
            <p className="text-[14px] leading-[20px] text-[#C0C2B8]">{members.length} Total Members</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#858A7D] text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              className="w-full h-12 bg-[#1e201d] border border-white/5 rounded-xl pl-12 pr-4 text-[14px] text-white placeholder:text-[#858A7D] outline-none focus:border-[#D5FF40]/30 transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="h-12 w-12 flex items-center justify-center bg-[#D5FF40] rounded-xl active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-black font-bold">add</span>
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="px-6 space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-[#858A7D]">Loading members...</div>
        ) : (
          members.map((member: any) => (
            <div 
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-[#121411] rounded-2xl p-4 border border-white/5 flex items-center gap-4 active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#1e201d] flex items-center justify-center border border-white/10 overflow-hidden">
                {member.full_name ? (
                  <span className="text-[14px] font-bold text-[#D5FF40]">
                    {member.full_name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[#858A7D]">person</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-[15px] text-white truncate">{member.full_name}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-[0.05em] px-2 py-0.5 rounded-full ${
                    member.payment_status === 'paid' ? 'bg-[#D5FF40]/10 text-[#D5FF40]' : 'bg-[#FF5964]/10 text-[#FF5964]'
                  }`}>
                    {member.payment_status || 'Pending'}
                  </span>
                </div>
                <p className="text-[12px] text-[#858A7D] font-medium truncate">
                  {member.fee_plans?.name || 'No Plan'}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#3d3f3b]">chevron_right</span>
            </div>
          ))
        )}
      </div>

      {/* MEMBER DETAILS DRAWER */}
      {selectedMember && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
            onClick={() => setSelectedMember(null)}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#0D0F0C] rounded-t-[32px] z-[70] px-6 pt-2 pb-safe border-t border-white/10 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto my-4" />
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-[#1e201d] border-4 border-white/5 flex items-center justify-center mb-4 overflow-hidden relative group">
                <span className="text-[32px] font-bold text-[#D5FF40]">
                  {selectedMember.full_name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <h2 className="text-[24px] font-bold text-white mb-1">{selectedMember.full_name}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e201d] rounded-full border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${selectedMember.payment_status === 'paid' ? 'bg-[#D5FF40]' : 'bg-[#FF5964]'}`} />
                <span className="text-[11px] font-bold text-[#C0C2B8] uppercase tracking-wider">{selectedMember.payment_status || 'Pending'}</span>
              </div>
            </div>

            <div className="space-y-6 mb-8 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121411] p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-1">Fee Plan</p>
                  <p className="text-[14px] text-white font-bold">{selectedMember.fee_plans?.name || 'Standard'}</p>
                </div>
                <div className="bg-[#121411] p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-1">Renewal</p>
                  <p className="text-[14px] text-white font-bold">12 Jun 2024</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-[#121411] rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#858A7D]">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-[14px] text-white font-semibold">{selectedMember.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#121411] rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#858A7D]">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-[14px] text-white font-semibold">{selectedMember.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pb-8 relative z-10">
                <button 
                  onClick={() => handleDelete(selectedMember.id)}
                  className="w-full h-12 bg-white/5 border border-white/5 rounded-full flex items-center justify-center gap-2 text-[#FF5964] text-[11px] font-bold uppercase tracking-wider hover:bg-[#FF5964]/10 transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  Delete Member
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ADD MEMBER DRAWER */}
      {isAdding && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
            onClick={() => setIsAdding(false)}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#0D0F0C] rounded-t-3xl z-[70] p-6 border-t border-white/10 animate-in slide-in-from-bottom duration-300">
            <h2 className="text-[22px] font-bold text-white mb-6">Add New Member</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Full Name</label>
                <input 
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-white focus:border-[#D5FF40] outline-none"
                  value={newMember.full_name}
                  onChange={e => setNewMember(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Email Address</label>
                <input 
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-white focus:border-[#D5FF40] outline-none"
                  value={newMember.email}
                  onChange={e => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Phone Number</label>
                <input 
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-white focus:border-[#D5FF40] outline-none"
                  value={newMember.phone}
                  onChange={e => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Fee Plan</label>
                <select 
                  className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-white focus:border-[#D5FF40] outline-none appearance-none"
                  value={newMember.fee_plan_id}
                  onChange={e => setNewMember(prev => ({ ...prev, fee_plan_id: e.target.value }))}
                >
                  <option value="">Select a plan</option>
                  {plans.map((plan: any) => (
                    <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.amount}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 h-14 bg-white/5 text-[#858A7D] font-bold rounded-2xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddMember}
                  className="flex-[2] h-14 bg-[#D5FF40] text-black font-bold rounded-2xl shadow-[0_8px_20px_rgba(213,255,64,0.2)] active:scale-95 transition-all"
                >
                  Create Member
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
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>how_to_reg</span>
              <span className="text-[11px] font-semibold leading-[14px]">Attendance</span>
            </>
          )}
        </Link>
      </nav>
    </div>
  );
}
