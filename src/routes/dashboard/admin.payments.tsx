import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getPaymentsDashboard, recordManualPayment, getCurrentGymId, getMembers } from '@/lib/auth.functions';
import { checkGymSubscription } from '@/lib/subscription.functions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const Route = createFileRoute('/dashboard/admin/payments')({
  component: PaymentsDashboard,
  loader: async ({ context }) => {
    const gymId = await context.queryClient.ensureQueryData({
      queryKey: ['current-gym-id'],
      queryFn: () => getCurrentGymId({ data: undefined })
    });
    if (gymId) {
      await Promise.all([
        context.queryClient.ensureQueryData({
          queryKey: ['admin-payments', gymId, 'all'],
          queryFn: () => getPaymentsDashboard({ data: { gymId, status: 'all' } })
        }),
        context.queryClient.ensureQueryData({
          queryKey: ['members', gymId],
          queryFn: () => getMembers({ data: { gymId } })
        })
      ]);
    }
  }
});

function PaymentsDashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ member_id: '', amount: 0, notes: '' });

  const getPaymentsFn = useServerFn(getPaymentsDashboard);
  const recordPaymentFn = useServerFn(recordManualPayment);
  const getGymIdFn = useServerFn(getCurrentGymId);
  const getMembersFn = useServerFn(getMembers);
  const checkSubscriptionFn = useServerFn(checkGymSubscription);

  const { data: gymId } = useQuery({
    queryKey: ['current-gym-id'],
    queryFn: () => getGymIdFn({ data: undefined }),
  });

  const { data: subStatus } = useQuery({
    queryKey: ['gym-subscription-status', gymId],
    queryFn: () => checkSubscriptionFn({ data: undefined }),
    enabled: !!gymId,
  });

  const isExpired = subStatus?.isExpired;

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments', gymId, filter],
    queryFn: () => getPaymentsFn({ data: { gymId: gymId!, status: filter } }),
    enabled: !!gymId,
    staleTime: 60000,
    gcTime: Infinity,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', gymId],
    queryFn: () => getMembersFn({ data: { gymId: gymId! } }),
    enabled: !!gymId
  });

  const handleRecordPayment = async () => {
    if (!newPayment.member_id || !newPayment.amount || !gymId) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      await recordPaymentFn({ data: { ...newPayment, gym_id: gymId } });
      toast.success('Payment recorded successfully');
      setIsRecording(false);
      setMemberSearchTerm('');
      setNewPayment({ member_id: '', amount: 0, notes: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment');
    }
  };

  return (
    <div className={`min-h-screen bg-[#0D0F0C] text-[#e3e3dd] font-['Poppins'] pb-32 ${isRecording ? 'tab-bar-hidden' : ''} ${isExpired ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
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
            <h1 className="text-[32px] font-bold leading-[32px] tracking-[-0.04em] text-white mb-2">Payments</h1>
            <p className="text-[14px] leading-[20px] text-[#C0C2B8]">Manage gym revenue</p>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-[#121411] rounded-xl p-1 flex border border-white/5">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 h-10 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-[#D5FF40] text-black' : 'text-[#858A7D]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('paid')}
              className={`flex-1 h-10 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${filter === 'paid' ? 'bg-[#D5FF40] text-black' : 'text-[#858A7D]'}`}
            >
              Paid
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`flex-1 h-10 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${filter === 'pending' ? 'bg-[#D5FF40] text-black' : 'text-[#858A7D]'}`}
            >
              Pending
            </button>
          </div>
          <button 
            onClick={() => setIsRecording(true)}
            className="h-12 w-12 flex items-center justify-center bg-[#D5FF40] rounded-xl active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-black font-bold">add</span>
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="px-6 md:px-0 space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-[#858A7D]">Loading payments...</div>
        ) : (
          payments.map((payment: any) => (
            <div 
              key={payment.id}
              className="bg-[#121411] rounded-2xl p-4 border border-white/5 flex items-center gap-4 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 ${
                payment.status === 'paid' ? 'text-[#D5FF40] bg-[#D5FF40]/5' : 'text-[#FF5964] bg-[#FF5964]/5'
              }`}>
                <span className="material-symbols-outlined text-[24px]">
                  {payment.status === 'paid' ? 'check_circle' : 'schedule'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-[15px] text-white truncate">{payment.members?.full_name}</h3>
                  <span className="text-[15px] font-bold text-white">₹{payment.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[12px] text-[#858A7D] font-medium truncate">
                    {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        {(!isLoading && payments.length === 0) && (
          <div className="text-center py-12 text-[#858A7D]">No payments found</div>
        )}
      </div>

      {/* RECORD PAYMENT DRAWER */}
      {isRecording && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]" 
            onClick={() => setIsRecording(false)}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#0D0F0C] rounded-t-3xl z-[999] p-6 border-t border-white/10">
            <h2 className="text-[22px] font-bold text-white mb-6">Record Payment</h2>
            <div className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Select Member</label>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 text-white focus:border-[#D5FF40] outline-none"
                    placeholder="Search member by name..."
                    value={memberSearchTerm}
                    onChange={e => {
                      setMemberSearchTerm(e.target.value);
                      setIsMemberDropdownOpen(true);
                    }}
                    onFocus={() => setIsMemberDropdownOpen(true)}
                  />
                  {isMemberDropdownOpen && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-[#1e201d] border border-white/10 rounded-xl max-h-[200px] overflow-y-auto z-[1001] shadow-2xl">
                      {members
                        .filter((m: any) => 
                          m.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase())
                        )
                        .map((member: any) => (
                          <div 
                            key={member.id}
                            className="px-4 py-3 hover:bg-[#D5FF40]/10 cursor-pointer text-white text-[14px] border-b border-white/5 last:border-0"
                            onClick={() => {
                              setNewPayment(prev => ({ 
                                ...prev, 
                                member_id: member.id,
                                amount: member.fee_plans?.amount || 0 
                              }));
                              setMemberSearchTerm(member.full_name);
                              setIsMemberDropdownOpen(false);
                            }}
                          >
                            <div className="font-bold">{member.full_name}</div>
                            {member.fee_plans && (
                              <div className="text-[10px] text-[#858A7D] uppercase font-bold tracking-tight">
                                Plan: {member.fee_plans.name} (₹{member.fee_plans.amount})
                              </div>
                            )}
                          </div>
                        ))}
                      {members.filter((m: any) => m.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-[#858A7D] text-[12px] italic">No members found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Plan & Amount (₹)</label>
                <div className="w-full h-12 bg-[#1e201d] border border-white/10 rounded-xl px-4 flex items-center text-white">
                  {newPayment.member_id ? (
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-bold text-[14px]">
                        {members.find((m: any) => m.id === newPayment.member_id)?.fee_plans?.name || 'Manual Amount'}
                      </span>
                      <span className="text-[#D5FF40] font-bold">₹{newPayment.amount}</span>
                    </div>
                  ) : (
                    <span className="text-[#858A7D] text-[14px]">Select a member to see plan</span>
                  )}
                </div>
                {newPayment.member_id && !members.find((m: any) => m.id === newPayment.member_id)?.fee_plans && (
                   <input 
                     type="number"
                     className="w-full h-10 mt-2 bg-white/5 border border-white/5 rounded-lg px-3 text-[13px] text-white focus:border-[#D5FF40] outline-none"
                     placeholder="Enter manual amount"
                     value={newPayment.amount || ''}
                     onChange={e => setNewPayment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                   />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#858A7D] font-bold uppercase tracking-wider">Notes</label>
                <textarea 
                  className="w-full h-20 bg-[#1e201d] border border-white/10 rounded-xl p-4 text-white focus:border-[#D5FF40] outline-none resize-none"
                  value={newPayment.notes}
                  onChange={e => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Payment for current month..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setIsRecording(false);
                    setMemberSearchTerm('');
                  }}
                  className="flex-1 h-14 bg-white/5 text-[#858A7D] font-bold rounded-2xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRecordPayment}
                  className="flex-1 h-14 bg-[#D5FF40] text-black font-bold rounded-2xl shadow-[0_8px_20px_rgba(213,255,64,0.2)] active:scale-95 transition-all"
                >
                  Record
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className={`bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-[10] flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px] transition-transform duration-300 nav-bar-transition`}>
        <Link 
          to="/dashboard/admin" 
          activeOptions={{ exact: true }}
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          disabled={!!isExpired}
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
          disabled={!!isExpired}
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
          disabled={!!isExpired}
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
          disabled={!!isExpired}
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
    </div>
  );
}
