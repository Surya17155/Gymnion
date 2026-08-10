import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMyPayments } from '@/lib/auth.functions';
import { useMyProfile } from '@/hooks/useMyProfile';
import { format } from 'date-fns';
import { useMemo } from 'react';

export const Route = createFileRoute('/dashboard/m/payments')({
  component: MemberPayments,
});

function MemberPayments() {
  const { data: profile } = useMyProfile();
  const getPaymentsFn = useServerFn(getMyPayments);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['my-payments', profile?.id],
    queryFn: () => getPaymentsFn({ data: { memberId: profile!.id, limit: 50 } }),
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5,
  });

  const nextDue = useMemo(() => {
    if (!profile?.join_date) return 'N/A';
    const now = new Date();
    return format(new Date(now.getFullYear(), now.getMonth() + 1, 1), 'MMMM do, yyyy');
  }, [profile]);

  const upcomingAmount = useMemo(() => {
    return profile?.fee_plans?.amount || 0;
  }, [profile]);

  return (
    <div className="flex justify-center min-h-screen bg-[#121411] text-[#e3e3dd] antialiased font-['Poppins']">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div 
        className="fixed top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 25% 0%, rgba(183, 255, 30, 0.15), transparent 50%)'
        }}
      />
      
      <main className="w-full max-w-[480px] min-h-screen relative pb-[120px] flex flex-col z-10 no-scrollbar">
        <div className="flex justify-end px-5 w-full sticky top-0 z-40 h-[64px] items-center bg-transparent">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1e201d] border border-white/5 text-[#B7FF1E] hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col px-5 gap-[24px] pt-4">
          <div>
            <h2 className="text-[28px] leading-[32px] font-bold text-white tracking-tight">Payments</h2>
            <p className="text-[14px] leading-[20px] text-[#858A7D] mt-1">Manage your gym subscriptions and history</p>
          </div>

          <section>
            <div className="bg-[#1e201d] border border-white/5 rounded-2xl p-[20px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(213,255,64,0.05),transparent_70%)] pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[11px] leading-[14px] font-semibold text-[#B7FF1E] uppercase tracking-wider mb-1">Upcoming Due</p>
                  <h3 className="text-[40px] leading-[40px] font-bold text-white tracking-tighter">₹{upcomingAmount}</h3>
                </div>
                <div className="bg-[#333532] rounded-full w-10 h-10 flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-[#B7FF1E]">calendar_month</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 relative z-10">
                <span className={`w-2 h-2 rounded-full ${profile?.status === 'overdue' ? 'bg-[#FF5964]' : 'bg-[#B7FF1E]'}`}></span>
                <p className="text-[12px] leading-[18px] text-[#858A7D]">
                  Due on <span className="text-white font-semibold">{nextDue}</span>
                </p>
              </div>

              <button className="w-full h-12 bg-[#B7FF1E] text-[#293500] rounded-full text-[18px] leading-[24px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all relative z-10 shadow-[0_0_15px_rgba(183,255,30,0.3)]">
                Pay Now
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </section>
          
          <section className="flex flex-col gap-3 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[18px] font-semibold text-white">Payment History</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <p className="text-center text-[#858A7D] py-10">Loading payments...</p>
              ) : payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className="bg-[#1e201d] border border-white/5 rounded-xl p-[16px] flex items-center justify-between hover:bg-[#333532] transition-colors cursor-pointer relative overflow-hidden group">
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center ${payment.status === 'paid' ? 'text-[#B7FF1E]' : 'text-[#FF5964]'}`}>
                        <span className="material-symbols-outlined">
                          {payment.status === 'paid' ? 'check_circle' : 'schedule'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[14px] text-white font-semibold">{payment.notes || 'Plan Payment'}</p>
                        <p className="text-[12px] text-[#858A7D]">
                          {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy') : 'N/A'} • {payment.payment_method || 'UPI'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[18px] font-semibold text-white">₹{payment.amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#858A7D] py-10">No payments found</p>
              )}
            </div>
          </section>
        </div>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1e201d] border-t border-white/5 shadow-lg px-2 py-2 pb-safe flex justify-around items-center h-[64px] rounded-t-2xl">
          <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl w-[72px] h-[64px] transition-colors">
            <span className="material-symbols-outlined mb-1">home</span>
            <span className="text-[11px] leading-[14px] font-semibold">Home</span>
          </Link>
          <Link to="/dashboard/m/payments" className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-1 w-[72px] h-[64px] scale-90 transition-all duration-200">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: '"FILL" 1' }}>credit_card</span>
            <span className="text-[11px] leading-[14px] font-semibold">Payments</span>
          </Link>
          <div className="relative -top-6">
            <Link to="/checkin" search={{ gym: profile?.gym_id }} className="w-16 h-16 bg-[#B7FF1E] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(213,255,64,0.3)] border-4 border-[#1e201d] hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[30px] text-[#293500]">qr_code_scanner</span>
            </Link>
          </div>
          <Link to="/dashboard/m/attendance" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl w-[72px] h-[64px] transition-colors">
            <span className="material-symbols-outlined mb-1">calendar_month</span>
            <span className="text-[11px] leading-[14px] font-semibold">Attendance</span>
          </Link>
          <Link to="/dashboard/m/profile" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl w-[72px] h-[64px] transition-colors">
            <span className="material-symbols-outlined mb-1">person</span>
            <span className="text-[11px] leading-[14px] font-semibold">Profile</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
