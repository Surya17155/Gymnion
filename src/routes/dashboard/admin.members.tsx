import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMembers, getCurrentGymId, createMember, deleteMember, getFeePlans } from '@/lib/auth.functions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const Route = createFileRoute('/dashboard/admin/members')({
  component: MembersDashboard,
  loader: async ({ context }) => {
    const gymId = await context.queryClient.ensureQueryData({
      queryKey: ['current-gym-id'],
      queryFn: () => getCurrentGymId({ data: undefined })
    });
    if (gymId) {
      await Promise.all([
        context.queryClient.ensureQueryData({
          queryKey: ['members', gymId],
          queryFn: () => getMembers({ data: { gymId } })
        }),
        context.queryClient.ensureQueryData({
          queryKey: ['gym-plans', gymId],
          queryFn: () => getFeePlans({ data: { gymId } })
        })
      ]);
    }
  }
});

function MembersDashboard() {
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ first_name: '', last_name: '', email: '', phone: '', fee_plan_id: '' });

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
    enabled: !!gymId,
    staleTime: 60000,
    gcTime: Infinity,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['gym-plans', gymId],
    queryFn: () => getPlansFn(),
    enabled: !!gymId
  });

  const handleAddMember = async () => {
    if (!newMember.first_name || !newMember.email || !gymId) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      await createMemberFn({ 
        data: { 
          ...newMember, 
          full_name: `${newMember.first_name} ${newMember.last_name}`.trim(),
          gym_id: gymId 
        } 
      });
      toast.success('Member added successfully');
      setIsAdding(false);
      setNewMember({ first_name: '', last_name: '', email: '', phone: '', fee_plan_id: '' });
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
    <div className={`min-h-screen bg-[#0D0F0C] text-[#e3e3dd] font-['Poppins'] pb-32 ${selectedMember || isAdding ? 'tab-bar-hidden' : ''}`}>
      {/* Top Glow Effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15) 0%, rgba(18, 20, 17, 0) 70%)'
        }}
      />

      {/* Header */}
      <div className="p-6 md:px-0 pb-2 sticky top-0 z-40 bg-transparent">
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
        </div>
      </div>

      {/* Members List */}
      <div className="px-6 space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-[#858A7D]">Loading members...</div>
        ) : (
          members.map((member: any) => {
            const currentMonth = new Date();
            const year = currentMonth.getFullYear();
            const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
            const startOfMonth = `${year}-${month}-01`;
            
            const hasPaid = member.payments?.some((p: any) => 
              p.payment_month === startOfMonth && 
              (p.status === 'paid' || p.status === 'paid_verified')
            );
            
            const status = hasPaid ? 'paid' : 'pending';

            // Calculate next due date
            let nextDue = 'N/A';
            if (member.join_date) {
              const billingDay = member.billing_day || new Date(member.join_date).getDate();
              const latestPayment = member.payments
                ?.filter((p: any) => p.status === 'paid' || p.status === 'paid_verified')
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
              
              const baseDate = latestPayment ? new Date(latestPayment.created_at) : new Date(member.join_date);
              
              // Next due is the billingDay of the month following the baseDate
              let dueYear = baseDate.getFullYear();
              let dueMonth = baseDate.getMonth();
              
              // If the current day is already past the billing day of this month, or we just made a payment
              dueMonth += 1;
              
              if (dueMonth > 11) {
                dueMonth = 0;
                dueYear++;
              }
              
              const dueDate = new Date(dueYear, dueMonth, billingDay);
              nextDue = format(dueDate, 'dd MMM yyyy');

              nextDue = format(dueDate, 'dd MMM yyyy');
            }

            return (
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
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[15px] text-white truncate mb-0.5">{member.full_name}</h3>
                    <span className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Due: {nextDue}</span>
                  </div>
                  <p className={`text-[12px] font-semibold truncate ${
                    status === 'paid' ? 'text-[#D5FF40]' : 'text-[#FF5964]'
                  }`}>
                    {status === 'paid' ? 'Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedMember && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
            onClick={() => setSelectedMember(null)}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#0D0F0C] rounded-t-[32px] z-[999] px-6 pt-2 pb-safe border-t border-white/10 no-scrollbar overflow-y-auto max-h-[90vh]">
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto my-4" />
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-[#1e201d] border-4 border-white/5 flex items-center justify-center mb-4 overflow-hidden relative group">
                <span className="text-[32px] font-bold text-[#D5FF40]">
                  {selectedMember.full_name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <h2 className="text-[24px] font-bold text-white mb-1">{selectedMember.full_name}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e201d] rounded-full border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${(() => {
                  const currentMonth = new Date();
                  const year = currentMonth.getFullYear();
                  const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                  const startOfMonth = `${year}-${month}-01`;
                  return selectedMember.payments?.some((p: any) => p.payment_month === startOfMonth && (p.status === 'paid' || p.status === 'paid_verified')) ? 'bg-[#D5FF40]' : 'bg-[#FF5964]';
                })()}`} />
                <span className="text-[11px] font-bold text-[#C0C2B8] uppercase tracking-wider">
                  {selectedMember.payments?.some((p: any) => {
                    const currentMonth = new Date();
                    const year = currentMonth.getFullYear();
                    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                    const startOfMonth = `${year}-${month}-01`;
                    return p.payment_month === startOfMonth && (p.status === 'paid' || p.status === 'paid_verified');
                  }) ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121411] p-4 rounded-2xl border border-white/5 flex flex-col justify-center min-h-[72px]">
                  <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-1">Status</p>
                  <p className={`text-[14px] font-bold ${(() => {
                    const currentMonth = new Date();
                    const year = currentMonth.getFullYear();
                    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                    const startOfMonth = `${year}-${month}-01`;
                    return selectedMember.payments?.some((p: any) => p.payment_month === startOfMonth && (p.status === 'paid' || p.status === 'paid_verified')) ? 'text-[#D5FF40]' : 'text-[#FF5964]';
                  })()}`}>
                    {selectedMember.payments?.some((p: any) => {
                      const currentMonth = new Date();
                      const year = currentMonth.getFullYear();
                      const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                      const startOfMonth = `${year}-${month}-01`;
                      return p.payment_month === startOfMonth && (p.status === 'paid' || p.status === 'paid_verified');
                    }) ? 'Paid' : 'Pending'}
                  </p>
                </div>
                <div className="bg-[#121411] p-4 rounded-2xl border border-white/5 flex flex-col justify-center min-h-[72px]">
                  <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-1">Next Due</p>
                  <p className="text-[14px] text-white font-bold">{(() => {
                    if (!selectedMember.join_date) return 'N/A';
                    const billingDay = selectedMember.billing_day || new Date(selectedMember.join_date).getDate();
                    const latestPayment = selectedMember.payments
                      ?.filter((p: any) => p.status === 'paid' || p.status === 'paid_verified')
                      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                    
                    const baseDate = latestPayment ? new Date(latestPayment.created_at) : new Date(selectedMember.join_date);
                    let dueYear = baseDate.getFullYear();
                    let dueMonth = baseDate.getMonth() + 1;
                    
                    if (dueMonth > 11) {
                      dueMonth = 0;
                      dueYear++;
                    }
                    
                    const dueDate = new Date(dueYear, dueMonth, billingDay);
                    return format(dueDate, 'dd MMM yyyy');
                  })()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-[#121411] rounded-2xl border border-white/5 min-h-[72px]">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#858A7D] flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-[14px] text-white font-semibold truncate">{selectedMember.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#121411] rounded-2xl border border-white/5 min-h-[72px]">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#858A7D] flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-[14px] text-white font-semibold truncate">{selectedMember.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#121411] rounded-2xl border border-white/5 min-h-[72px]">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#858A7D] flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <div className="min-w-0 flex-1 flex justify-between items-center pr-2">
                    <div>
                      <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-0.5">Date of Birth</p>
                      <p className="text-[14px] text-white font-semibold">{selectedMember.dob ? format(new Date(selectedMember.dob), 'dd MMM yyyy') : 'Not provided'}</p>
                    </div>
                    {selectedMember.dob && (
                      <div className="text-right">
                        <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider mb-0.5">Age</p>
                        <p className="text-[14px] text-[#D5FF40] font-bold">
                          {Math.floor((new Date().getTime() - new Date(selectedMember.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} Years
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-3">
                <div className="p-4 bg-[#121411] rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#858A7D] flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">location_on</span>
                    </div>
                    <p className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Address</p>
                  </div>
                  <p className="text-[14px] text-white font-semibold leading-relaxed">
                    {selectedMember.address || 'No address provided'}
                  </p>
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


      {/* Bottom Navigation */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-[10] flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px] transition-transform duration-300 nav-bar-transition">
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
    </div>
  );
}
