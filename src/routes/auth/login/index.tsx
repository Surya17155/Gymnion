import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAuthUserRole, getGymByCode } from "@/lib/auth.functions";

export const Route = createFileRoute('/auth/login/')({
  component: AuthPage,
});


function AuthPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    password: '',
    gymCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const name = e.target.name;

    if (name === 'dob') {
      // Remove non-digits
      const digits = value.replace(/\D/g, '');
      let formatted = '';
      
      if (digits.length > 0) {
        formatted += digits.substring(0, 2);
        if (digits.length > 2) {
          formatted += '/' + digits.substring(2, 4);
          if (digits.length > 4) {
            formatted += '/' + digits.substring(4, 8);
          }
        }
      }
      value = formatted;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;

      if (data.session) {
        const role = await getAuthUserRole();
        if (role === 'super_admin') {
          await navigate({ to: '/dashboard/super-admin' });
        } else if (role === 'admin') {
          await navigate({ to: '/dashboard/admin' });
        } else {
          await navigate({ to: '/dashboard/m' });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Verify Gym Code
      const gym = await getGymByCode({ data: { gym_code: formData.gymCode } });
      if (!gym) {
        throw new Error('Invalid GYM code. Please check with your GYM admin.');
      }

      // 2. Auth Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            dob: formData.dob,
            address: formData.address,
            gym_id: gym.id
          }
        }
      });

      if (error) throw error;
      setErrorMsg('Check your email for the confirmation link!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0d0f0c] text-[#e3e3dd] min-h-screen flex flex-col items-center justify-center p-5 font-sans antialiased overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#25340D]/20 to-transparent pointer-events-none z-0"></div>
      <main className="w-full max-w-[390px] relative z-10 flex flex-col min-h-full">
        <header className="flex flex-col items-center justify-center mb-8 mt-12 relative z-10">
          <div className="w-20 h-20 mb-4 relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#333532] border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(183,255,30,0.1)]">
              <span className="material-symbols-outlined text-[#B7FF1E] text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>fitness_center</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center">
            Gym<span className="text-[#B7FF1E]">Sync</span>
          </h1>
          <p className="text-xs text-[#858A7D] mt-1 text-center font-normal">Power your performance.</p>
        </header>

        <div className="bg-[#333532] p-1 rounded-full flex relative w-full mb-6 border border-white/5 shadow-inner z-10">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#B7FF1E] rounded-full transition-all duration-300 ease-in-out ${authMode === 'signin' ? 'left-1' : 'left-[calc(50%+1px)]'}`}
          ></div>
          <button 
            onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center z-10 text-sm font-semibold transition-colors duration-300 ${authMode === 'signin' ? 'text-[#293500]' : 'text-[#C0C2B8]'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center z-10 text-sm font-semibold transition-colors duration-300 ${authMode === 'signup' ? 'text-[#293500]' : 'text-[#C0C2B8]'}`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className={`text-center text-xs mb-4 p-3 rounded-xl border ${errorMsg.includes('confirm') ? 'text-[#B7FF1E] border-[#B7FF1E]/20 bg-[#B7FF1E]/5' : 'text-[#FF5964] border-[#FF5964]/20 bg-[#FF5964]/5'}`}>
            {errorMsg}
          </div>
        )}

        <div className="relative w-full z-10 space-y-4">
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); authMode === 'signin' ? handleSignIn() : handleSignUp(); }}>
            {authMode === 'signup' && (
              <>
                {/* Order: Name, Email, Phone, DOB, Address, Password, Gym Code */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">person</span>
                    <input name="fullName" autoComplete="name" value={formData.fullName} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your full name" required type="text" />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#C0C2B8] px-1 font-normal">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">mail</span>
                <input name="email" autoComplete="email" value={formData.email} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your email" required type="email" />
              </div>
            </div>

            {authMode === 'signup' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">call</span>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your phone number" required type="tel" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Date of Birth</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">calendar_today</span>
                    <input name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="DD/MM/YYYY" required type="text" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">location_on</span>
                    <input name="address" value={formData.address} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your address" required type="text" />
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#C0C2B8] px-1 font-normal">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">lock</span>
                <input name="password" autoComplete={authMode === 'signin' ? "current-password" : "new-password"} value={formData.password} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your password" required type="password" />
              </div>
            </div>

            {authMode === 'signup' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#C0C2B8] px-1 font-normal">GYM Code</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">qr_code</span>
                  <input name="gymCode" value={formData.gymCode} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter GYM provided code" required type="text" />
                </div>
              </div>
            )}

            {authMode === 'signin' && (
              <div className="flex justify-end mt-1 mb-2">
                <a className="text-xs text-[#858A7D] hover:text-[#B7FF1E] transition-colors font-normal" href="#">Forgot Password?</a>
              </div>
            )}

             <button 
                disabled={loading}
                className="w-full h-[48px] bg-[#B7FF1E] text-[#293500] text-sm font-semibold rounded-full shadow-[0_0_20px_rgba(183,255,30,0.2)] hover:opacity-90 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2" 
                type="submit">
              {loading && <span className="w-4 h-4 border-2 border-[#293500]/30 border-t-[#293500] rounded-full animate-spin"></span>}
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}