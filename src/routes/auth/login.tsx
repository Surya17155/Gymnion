import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getRoleForUser, clearRoleCache, homeForRole } from "@/lib/role";
import { completeSignup } from "@/lib/members.functions";
import { getGymByCode } from "@/lib/auth.functions";
import { toast } from "sonner";


export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search['redirect'] as string) || undefined,
      error: (search['error'] as string) || undefined
    } as { redirect?: string; error?: string }
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const redirectPath = search['redirect'] || '/dashboard';


  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(search.error || '');

  useEffect(() => {
    if (search.error) {
      const decodedError = decodeURIComponent(search.error);
      if (decodedError !== "Your session has expired. Please sign in again.") {
        toast.error(decodedError);
      }
    }
  }, [search.error]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Double check token validity
        const expiresAt = session.expires_at || 0;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt > now + 60) { // More than 60s remaining
          const role = await getRoleForUser(session.user.id);
          const home = homeForRole(role) || '/dashboard';
          console.log("Valid session found on login page, redirecting to:", home);
          navigate({ to: home });
        } else {
          console.log("Session expired or near expiry, staying on login");
          await supabase.auth.signOut();
          clearRoleCache();
        }
      }
    };
    checkSession();
  }, [navigate, redirectPath]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    password: '',
    gymCode: ''
  });

  const [gymCodeError, setGymCodeError] = useState('');
  const [gymName, setGymName] = useState('');

  const lookupGym = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setGymCodeError('');
      setGymName('');
      return null;
    }
    const data = await getGymByCode({ data: { gym_code: trimmed } });
    if (!data) {
      setGymCodeError('Invalid code');
      setGymName('');
      return null;
    }
    setGymCodeError('');
    setGymName(data.name);
    return data;
  };

  const validateGymCode = async () => {
    await lookupGym(formData.gymCode);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const name = e.target.name;

    if (name === 'gymCode') {
      setGymCodeError('');
      setGymName('');
    }

    if (name === 'dob') {
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


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const email = emailInput?.value || formData.email;
      const password = passwordInput?.value || formData.password;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session) {
        clearRoleCache();
        window.localStorage.removeItem('tanstack-query-cache');
        
        // Parallelize role fetching and a small delay for safety
        const [role] = await Promise.all([
          getRoleForUser(data.session.user.id),
          new Promise(resolve => setTimeout(resolve, 100))
        ]);

        const home = homeForRole(role) || '/dashboard';
        console.log("Login successful, role:", role, "redirecting to:", home);
        window.location.replace(home);
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const gym = await lookupGym(formData.gymCode);
      if (!gym) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            dob: formData.dob,
            address: formData.address,
            gym_code: formData.gymCode.trim(),
            gym_id: gym.id,
          }
        }
      });


      if (error) throw error;
      if (data.session) {
        // Call completeSignup as a fallback in case the trigger was slow or failed
        // Belt + Suspenders approach requested
        try {
          await completeSignup({
            data: {
              userId: data.session.user.id,
              gymId: gym.id,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              dob: formData.dob,
              address: formData.address
            }
          });
        } catch (signupErr) {
          console.error("Manual signup completion failed (might have been handled by trigger):", signupErr);
        }

        clearRoleCache();
        navigate({ to: '/dashboard/m' });
      } else {
        toast.success('Sign up successful! Please check your email to confirm your account.');
      }
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
          <h1 className="text-3xl font-bold text-center">Gym<span className="text-[#B7FF1E]">Sync</span></h1>
        </header>

        <div className="bg-[#333532] p-1 rounded-full flex relative w-full mb-6 border border-white/5 shadow-inner z-10">
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#B7FF1E] rounded-full transition-all duration-300 ease-in-out ${authMode === 'signin' ? 'left-1' : 'left-[calc(50%+1px)]'}`}></div>
          <button type="button" onClick={() => setAuthMode('signin')} className={`flex-1 py-3 text-center z-10 text-sm font-semibold transition-colors duration-300 ${authMode === 'signin' ? 'text-[#293500]' : 'text-[#C0C2B8]'}`}>Sign In</button>
          <button type="button" onClick={() => setAuthMode('signup')} className={`flex-1 py-3 text-center z-10 text-sm font-semibold transition-colors duration-300 ${authMode === 'signup' ? 'text-[#293500]' : 'text-[#C0C2B8]'}`}>Sign Up</button>
        </div>

        {errorMsg && <div className="text-center text-xs mb-4 p-3 rounded-xl border text-[#FF5964] border-[#FF5964]/20 bg-[#FF5964]/5">{errorMsg}</div>}

        <form className="flex flex-col gap-3" onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp}>
          {authMode === 'signup' && (
            <>
              <div className="flex gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">First Name</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="First Name" required type="text" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Last Name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Last Name" type="text" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#C0C2B8] px-1 font-normal">Email Address</label>
                <input name="email" id="email" autoComplete="username" value={formData.email} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Enter your email" required type="email" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#C0C2B8] px-1 font-normal">Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Enter your phone number" required type="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#C0C2B8] px-1 font-normal">Gym Address</label>
                <input name="address" value={formData.address} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Enter gym address" required type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#C0C2B8] px-1 font-normal">Date of Birth (DD/MM/YYYY)</label>
                <input name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="DD/MM/YYYY" required type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#C0C2B8] px-1 font-normal">Phone Number (Alternative)</label>
                <input name="phoneAlt" className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Enter alternative phone" type="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#C0C2B8] px-1 font-normal">Gym Code</label>
                <input name="gymCode" value={formData.gymCode} onChange={handleChange} onBlur={validateGymCode} className={`w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border rounded-xl px-4 py-3 h-[48px] focus:outline-none transition-all ${gymCodeError ? 'border-[#FF5964] focus:border-[#FF5964]' : 'border-white/10 focus:border-[#B7FF1E]'}`} placeholder="Enter gym code" required type="text" />
                {gymCodeError && <span className="text-[11px] text-[#FF5964] px-1">{gymCodeError}</span>}
                {gymName && !gymCodeError && <span className="text-[11px] text-[#B7FF1E] px-1">{gymName}</span>}
              </div>
            </>
          )}
          {authMode === 'signin' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#C0C2B8] px-1 font-normal">Email Address</label>
              <input name="email" id="email" autoComplete="username" value={formData.email} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Enter your email" required type="email" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#C0C2B8] px-1 font-normal">Password</label>
            <input name="password" id="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} value={formData.password} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Enter your password" required type="password" />
          </div>
          {authMode === 'signin' && (
            <div className="flex justify-end mt-1 mb-2">
              <a className="text-xs text-[#858A7D] hover:text-[#B7FF1E] transition-colors font-normal" href="/auth/forgot-password">Forgot Password?</a>
            </div>
          )}
          <button disabled={loading} className="w-full h-[48px] bg-[#B7FF1E] text-[#293500] text-sm font-semibold rounded-full shadow-[0_0_20px_rgba(183,255,30,0.2)] hover:opacity-90 active:scale-95 transition-all mt-2" type="submit">
            {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

      </main>
    </div>
  );
}
