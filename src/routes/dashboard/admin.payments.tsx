import { createFileRoute, Link, Navigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/dashboard/admin/payments')({
  component: AdminPayments,
});

function AdminPayments() {
  const { data: gymData, isLoading } = useQuery({
    queryKey: ['admin-gym-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: roleData } = await supabase.from('user_roles').select('gym_id').eq('user_id', user.id).maybeSingle();
      if (!roleData?.gym_id) return null;
      const { data: gym } = await supabase.from('gyms').select('*').eq('id', roleData.gym_id).maybeSingle();
      return gym;
    }
  });

  if (isLoading) return null;

  const settings = (gymData?.settings as any) || {};
  const paymentEnabled = settings.features?.payment_management !== false;

  if (!paymentEnabled) {
    return <Navigate to="/dashboard/admin" />;
  }

  return (
    <div className="bg-[#0D0F0C] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins']">
      {/* Head link for icons is already in __root.tsx, but ensuring icons are available */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Top Glow Effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-[400px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(213, 255, 64, 0.15) 0%, transparent 70%)'
        }}
      />

      {/* Main Mobile Container */}
      <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative z-10 flex flex-col">
        <main className="flex-1 px-[20px] flex flex-col gap-[24px] pt-[24px]">
          {/* Page Header */}
          <section className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[-0.03em] text-white">Payments</h1>
            <p className="text-[14px] leading-[20px] text-[#858A7D]">Revenue Tracking & Collections</p>
          </section>

          {/* Revenue Telemetry Card */}
          <section className="bg-[rgba(18,20,17,0.6)] backdrop-blur-[12px] rounded-xl p-[16px] border border-white/5 flex flex-col gap-[12px] relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#B7FF1E]/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <span className="text-[12px] leading-[18px] text-[#858A7D] uppercase tracking-wider font-semibold">Total Revenue (Month)</span>
              <span className="material-symbols-outlined text-[#858A7D] text-[18px]">monitoring</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-[#B7FF1E]">₹42,500</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[#A7F52A] text-[14px]">trending_up</span>
                <span className="text-[12px] leading-[18px] text-[#A7F52A]">+12.4%</span>
                <span className="text-[12px] leading-[18px] text-[#858A7D] ml-1">vs last month</span>
              </div>
            </div>
          </section>

          {/* Filter Tabs */}
          <section className="flex bg-[#1e201d] rounded-full p-1 border border-white/5">
            <button className="flex-1 py-2 rounded-full text-[11px] font-semibold text-[#858A7D] hover:text-[#e3e3dd] transition-colors">Paid</button>
            <button className="flex-1 py-2 rounded-full text-[11px] font-semibold text-[#858A7D] hover:text-[#e3e3dd] transition-colors">Pending</button>
            <button className="flex-1 py-2 rounded-full text-[11px] font-semibold bg-[#B7FF1E] text-[#293500] shadow-[0_0_15px_rgba(183,255,30,0.3)] transition-all">Overdue</button>
          </section>

          {/* Critically Overdue Section */}
          <section className="flex flex-col gap-[12px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF5964] animate-pulse shadow-[0_0_8px_rgba(255,89,100,0.8)]"></div>
              <h2 className="text-[18px] font-semibold text-[#FF5964]">Critically Overdue</h2>
              <span className="text-[12px] leading-[18px] text-[#FF5964]/70 ml-auto font-medium">2+ Months</span>
            </div>
            
            <div className="border border-white/5 rounded-xl p-[16px] flex items-center justify-between gap-3 bg-[#1a1c19]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#FF5964]/30">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7q5DaCI3dHVAyjrs3epeZyzZsDutBe3a1PfpumrewoOSXFpXjtgqi2N5s-bMgrc9MAyYoXMfcEQ7PsrxvY_bkryNjNpwm61X7pLg4awH7ZhL4_ah1HUy5XGG5Qp-qU-Yv0vY2RgoI13Mh6_LFcOdUTjOlY41-KmcE0qNqqmonnEAQWcVsdS4mSDc0VhEgeWSgpLfP3HeFyBEIXr7clH2WwePp7zlWjliBZotMoDcixSOy-f26xQ" alt="Marcus" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] leading-[20px] text-[#e3e3dd] font-semibold">Marcus Vance</span>
                  <span className="text-[11px] leading-[14px] text-[#FF5964] mt-0.5 font-semibold">3 Months Unpaid</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[18px] font-semibold text-[#e3e3dd]">₹20,000</span>
                <button className="bg-[#1e201d] hover:bg-[#383a36] border border-white/10 text-[#e3e3dd] text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                  Remind
                </button>
              </div>
            </div>
          </section>

          {/* Standard Overdue List */}
          <section className="flex flex-col gap-[8px]">
            <h2 className="text-[18px] font-semibold text-[#e3e3dd] mb-2 mt-2">Recent Overdue</h2>
            
            {[
              { name: 'Sarah Jenkins', date: 'Oct 15', amount: '₹6,500', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-yKO58Y9zQjt2sMaG34f4GoHvQpHvRVPPpGrwacfnB0cH7ez41Wc9l0FUXhg2fBr6jZNF4SPxHoLaEhvFRt3_PxVFZ15c-YZaVlPPZiu1GzuXEC6eTQzDFC60_PBEVztXduyk-2ZmOsyb9320Lcx45mmXt4ZlsQhhnxfyrmDeMQxSEH0tLKF-xrfo8xqZmdWcawdFT-OU7Q8hkJdmfhMLrkY1aiJvVP-M8NClVgWoIGOcX8YB9g' },
              { name: 'David Chen', date: 'Oct 18', amount: '₹10,000', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgeW0n_j5ah-tOX4mW2keMTOgt6lvkeivxZNzCUW9VBlGza4lhJfRMF__p1UuLoWU_PisH8vvdSv_bzVrbNdGBg9EQuSSyy56vwUyCQyW2y5xUIrw0wH7J6LZ1yNZoYqD4pV4oSkPFJ8AaaJpaXZZy6dHdOBrRFpxQo3BwomPs8VC1TX-1tWPk8jBiAiXzfcCQP9-E1-dU3w3YbkuUQ4B11yzxadJGDwqjwtmSXqVLK2Bv3TLr0A' },
              { name: 'Elena Rostova', date: 'Oct 20', amount: '₹6,500', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE0ya5iZyJg2KXKfJGedC_EdMwD3Zlwqzdy5BHsjafdPMfk6CzNQjvps80OxV1XCj9e_oyVRfHAH32VuQEpqum3OMJDnnyZfjdjpXwPYR4CbWqGsrhQrUYMZdnKe4RO5LFit6NDzWWbvKczYZC0iwsglEFnO8q-rxUHWv1Z2zL4qX8DBVoNWBkbaqMXcGFr6tdmKqoaBkG7mhE4NerTriarunFlTgtK-lbLGnrT_0SrucPCjH2Lg' }
            ].map((member, i) => (
              <div key={i} className="bg-[rgba(18,20,17,0.6)] backdrop-blur-[12px] border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] leading-[20px] text-[#e3e3dd] font-medium">{member.name}</span>
                    <span className="text-[12px] leading-[18px] text-[#858A7D]">Due: {member.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[14px] leading-[20px] text-[#e3e3dd] font-semibold">{member.amount}</span>
                  <span className="text-[11px] leading-[14px] text-[#FFB4AB] mt-0.5 px-2 py-0.5 bg-[#93000A]/30 rounded-sm font-semibold uppercase">Overdue</span>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>

      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px] left-1/2 -translate-x-1/2">
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
    </div>
  );
}
