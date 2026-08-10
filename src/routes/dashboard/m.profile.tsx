import { createFileRoute, Link } from '@tanstack/react-router';
import { 
  LucideHome, 
  LucideCreditCard, 
  LucideScanQrCode, 
  LucideCalendarDays, 
  LucideUser, 
  LucideSettings,
  LucideUserCircle,
  LucideMail,
  LucidePhone,
  LucideMapPin,
  LucidePencil,
  LucideCamera,
  LucideCheck,
  LucideX
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMyProfile, updateMyProfile } from '@/lib/auth.functions';

export const Route = createFileRoute('/dashboard/m/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const getMyProfileFn = useServerFn(getMyProfile);
  const updateMyProfileFn = useServerFn(updateMyProfile);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfileFn({ data: {} } as any),
  });

  const [tempProfile, setTempProfile] = useState<any>({});
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  
  useEffect(() => {
    if (profile) setTempProfile(profile);
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateMyProfileFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      setIsEditingPersonal(false);
      setIsEditingContact(false);
      setIsEditingLocation(false);
    }
  });

  if (isLoading) return <div className="bg-[#121411] min-h-screen flex items-center justify-center text-[#B7FF1E]">Loading...</div>;

  return (
    <div className="flex justify-center min-h-screen bg-[#121411] w-full relative overflow-x-hidden font-['Poppins']">
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(183, 255, 30, 0.15) 0%, rgba(183, 255, 30, 0) 70%)', borderRadius: '50%' }}
      />
      
      <main className="w-full max-w-[480px] px-5 relative z-10 flex flex-col gap-6 pt-8 pb-[120px]">
        <header className="flex items-center w-full bg-transparent">
          <h1 className="text-[28px] leading-[32px] font-bold text-white tracking-tight">Profile</h1>
        </header>

        <section className="flex flex-col items-center text-center mt-4 relative">
          <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#B7FF1E] to-[#83A51B] mb-6 shadow-[0_0_20px_rgba(183,255,30,0.2)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#333532] border-4 border-[#121411]">
              <img alt="Profile" className="w-full h-full object-cover" src={profile?.photo_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'} />
            </div>
          </div>
          <h2 className="text-[22px] leading-[26px] font-bold text-white mb-2">{profile?.full_name}</h2>
          <p className="text-[14px] leading-[20px] text-[#C0C2B8] max-w-[280px]">Member</p>
        </section>

        <section className="flex flex-col gap-3 mt-4">
          {/* Personal Details Card */}
          <div className="bg-[#121411] rounded-2xl p-4 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <LucideUserCircle className="w-5 h-5 text-[#B7FF1E]" />
                <h3 className="text-[18px] font-semibold text-white">Personal Details</h3>
              </div>
              {!isEditingPersonal && (
                <button onClick={() => setIsEditingPersonal(true)} className="text-[#B7FF1E] p-1"><LucidePencil className="w-4 h-4" /></button>
              )}
            </div>

            {isEditingPersonal ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#C0C2B8] uppercase font-bold">First Name</label>
                    <input type="text" value={tempProfile.first_name || ''} onChange={(e) => setTempProfile({...tempProfile, first_name: e.target.value})} className="bg-[#1e201d] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-[#B7FF1E] outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#C0C2B8] uppercase font-bold">Last Name</label>
                    <input type="text" value={tempProfile.last_name || ''} onChange={(e) => setTempProfile({...tempProfile, last_name: e.target.value})} className="bg-[#1e201d] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-[#B7FF1E] outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setTempProfile(profile); setIsEditingPersonal(false); }} className="text-white text-xs font-bold px-3 py-1 bg-[#333532] rounded-lg">Cancel</button>
                  <button onClick={() => updateMutation.mutate({ first_name: tempProfile.first_name, last_name: tempProfile.last_name, full_name: `${tempProfile.first_name} ${tempProfile.last_name}` })} className="text-[#121411] text-xs font-bold px-3 py-1 bg-[#B7FF1E] rounded-lg">Save</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-[11px] text-[#C0C2B8] uppercase font-bold">First Name</span><div className="text-white text-sm">{profile?.first_name}</div></div>
                <div><span className="text-[11px] text-[#C0C2B8] uppercase font-bold">Last Name</span><div className="text-white text-sm">{profile?.last_name}</div></div>
              </div>
            )}
          </div>

          {/* Contact Details Card */}
          <div className="bg-[#121411] rounded-2xl p-4 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <LucideMail className="w-5 h-5 text-[#B7FF1E]" />
                <h3 className="text-[18px] font-semibold text-white">Contact Information</h3>
              </div>
              {!isEditingContact && (
                <button onClick={() => setIsEditingContact(true)} className="text-[#B7FF1E] p-1"><LucidePencil className="w-4 h-4" /></button>
              )}
            </div>

            {isEditingContact ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#C0C2B8] uppercase font-bold">Phone</label>
                  <input type="text" value={tempProfile.phone || ''} onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})} className="bg-[#1e201d] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-[#B7FF1E] outline-none" />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setTempProfile(profile); setIsEditingContact(false); }} className="text-white text-xs font-bold px-3 py-1 bg-[#333532] rounded-lg">Cancel</button>
                  <button onClick={() => updateMutation.mutate({ phone: tempProfile.phone })} className="text-[#121411] text-xs font-bold px-3 py-1 bg-[#B7FF1E] rounded-lg">Save</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div><span className="text-[11px] text-[#C0C2B8] uppercase font-bold">Email</span><div className="text-white text-sm">{profile?.email}</div></div>
                <div><span className="text-[11px] text-[#C0C2B8] uppercase font-bold">Phone</span><div className="text-white text-sm">{profile?.phone || 'Not provided'}</div></div>
              </div>
            )}
          </div>
          {/* Gym Plans Section */}
          <div className="bg-[#121411] rounded-2xl p-4 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <LucideCreditCard className="w-5 h-5 text-[#B7FF1E]" />
                <h3 className="text-[18px] font-semibold text-white">Subscription</h3>
              </div>
              <Link to="/dashboard/m/plans" className="text-[#B7FF1E] text-xs font-bold px-3 py-1 bg-[#333532] rounded-lg">View Plans</Link>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#C0C2B8] uppercase font-bold">Current Plan</span>
              <div className="text-white text-sm flex items-center justify-between">
                <span>{profile?.fee_plans?.name || 'No plan selected'}</span>
                {profile?.fee_plans && <span className="text-[#B7FF1E] font-bold">₹{profile.fee_plans.amount}</span>}
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#1e201d] border-t border-white/5 px-2 py-2 flex justify-around items-center h-[64px] rounded-t-2xl z-40">
        <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 rounded-xl min-w-[60px]"><LucideHome className="w-6 h-6 mb-1" /><span className="text-[11px] font-semibold">Home</span></Link>
        <Link to="/dashboard/m/payments" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 rounded-xl min-w-[60px]"><LucideCreditCard className="w-6 h-6 mb-1" /><span className="text-[11px] font-semibold">Payments</span></Link>
        <div className="relative -top-6"><button className="w-16 h-16 bg-[#B7FF1E] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(213,255,64,0.3)] border-4 border-[#1e201d]"><LucideScanQrCode className="w-[30px] h-[30px] text-[#293500]" /></button></div>
        <Link to="/dashboard/m/attendance" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 rounded-xl min-w-[60px]"><LucideCalendarDays className="w-6 h-6 mb-1" /><span className="text-[11px] font-semibold">Attendance</span></Link>
        <Link to="/dashboard/m/profile" className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-1 min-w-[60px] scale-90"><LucideUser className="w-6 h-6 mb-1" /><span className="text-[11px] font-semibold">Profile</span></Link>
      </nav>
    </div>
  );
}
