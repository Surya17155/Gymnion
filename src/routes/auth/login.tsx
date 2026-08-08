import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: search.redirect as string | undefined
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const redirectPath = (search as any).redirect || '/dashboard';

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate({ to: redirectPath });
      }
    };
    checkSession();
  }, [navigate, redirectPath]);

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
      if (data.session) navigate({ to: redirectPath });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in');
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
          <button onClick={() => setAuthMode('signin')} className={`flex-1 py-3 text-center z-10 text-sm font-semibold transition-colors duration-300 ${authMode === 'signin' ? 'text-[#293500]' : 'text-[#C0C2B8]'}`}>Sign In</button>
          <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 text-center z-10 text-sm font-semibold transition-colors duration-300 ${authMode === 'signup' ? 'text-[#293500]' : 'text-[#C0C2B8]'}`}>Sign Up</button>
        </div>

        {errorMsg && <div className="text-center text-xs mb-4 p-3 rounded-xl border text-[#FF5964] border-[#FF5964]/20 bg-[#FF5964]/5">{errorMsg}</div>}

        <form className="flex flex-col gap-3" onSubmit={handleSignIn}>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#C0C2B8] px-1 font-normal">Email Address</label>
            <input name="email" id="email" autoComplete="username" value={formData.email} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Enter your email" required type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#C0C2B8] px-1 font-normal">Password</label>
            <input name="password" id="password" autoComplete="current-password" value={formData.password} onChange={handleChange} className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 h-[48px] focus:outline-none focus:border-[#B7FF1E] transition-all" placeholder="Enter your password" required type="password" />
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
