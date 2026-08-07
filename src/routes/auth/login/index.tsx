import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAuthUserRole } from "@/lib/auth.functions";

export const Route = createFileRoute('/auth/login/')({
  component: AuthPage,
});


function AuthPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="bg-[#0d0f0c] text-[#e3e3dd] min-h-screen flex flex-col items-center justify-center p-5 font-sans antialiased overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#25340D]/20 to-transparent pointer-events-none z-0"></div>
      <main className="w-full max-w-[390px] relative z-10 flex flex-col min-h-full">
        <header className="flex flex-col items-center justify-center mb-8 mt-12 relative z-10">
          <div className="w-20 h-20 mb-4 relative flex items-center justify-center">
            {/* Logo placeholder - assuming logo should be above the name */}
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
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-3 text-center z-10 text-sm font-semibold transition-colors duration-300 ${authMode === 'signin' ? 'text-[#293500]' : 'text-[#C0C2B8]'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-3 text-center z-10 text-sm font-semibold transition-colors duration-300 ${authMode === 'signup' ? 'text-[#293500]' : 'text-[#C0C2B8]'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="relative w-full z-10 space-y-4">
          <form className="flex flex-col gap-3">
            {authMode === 'signup' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">person</span>
                    <input className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your full name" required type="text" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">call</span>
                    <input className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your phone number" required type="tel" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Date of Birth</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">calendar_today</span>
                    <input className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="DD/MM/YYYY" required type="date" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[#C0C2B8] px-1 font-normal">Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">location_on</span>
                    <input className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your address" required type="text" />
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#C0C2B8] px-1 font-normal">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">mail</span>
                <input className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your email" required type="email" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#C0C2B8] px-1 font-normal">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C2B8] material-symbols-outlined text-xl">lock</span>
                <input className="w-full bg-[#1a1c19] text-[#e3e3dd] text-sm border border-white/10 rounded-xl px-4 py-3 pl-12 h-[48px] focus:outline-none focus:border-[#B7FF1E] focus:ring-1 focus:ring-[#B7FF1E]/50 transition-all placeholder:text-[#C0C2B8]" placeholder="Enter your password" required type="password" />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B7FF1E] text-[11px] font-bold uppercase" type="button">Show</button>
              </div>
            </div>
            {authMode === 'signin' && (
              <div className="flex justify-end mt-1 mb-2">
                <a className="text-xs text-[#858A7D] hover:text-[#B7FF1E] transition-colors font-normal" href="#">Forgot Password?</a>
              </div>
            )}
             <button 
                onClick={async () => {
                  if (authMode === 'signin') {
                   // This is a placeholder for the login logic that should exist.
                   // Assuming standard Supabase auth flow.
                   const { data, error } = await supabase.auth.signInWithPassword({
                      email: 'surya.17155@gmail.com',
                      password: 'password' // Dummy
                   });
                   
                   if (data.session) {
                     const role = await getAuthUserRole();
                     if (role === 'super_admin') navigate({ to: '/dashboard/super-admin' });
                     else if (role === 'admin') navigate({ to: '/dashboard/admin' });
                      else navigate({ to: '/dashboard/m' });
                    }
                  } else {
                    // Placeholder for signup logic
                    console.log('Signup clicked');
                  }
                }}
                className="w-full h-[48px] bg-[#B7FF1E] text-[#293500] text-sm font-semibold rounded-full shadow-[0_0_20px_rgba(183,255,30,0.2)] hover:opacity-90 active:scale-95 transition-all mt-2" 
                type="button">
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
            <div className="mt-6 flex flex-col items-center">
              <div className="flex items-center w-full mb-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="px-4 text-xs text-[#858A7D] font-normal">or continue with</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>
              <div className="flex gap-4 w-full">
                <button className="flex-1 h-[48px] bg-[#333532] border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-[#383a36] transition-colors" type="button">
                  <svg className="w-5 h-5 text-[#e3e3dd]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
                  </svg>
                </button>
                <button className="flex-1 h-[48px] bg-[#333532] border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-[#383a36] transition-colors" type="button">
                  <svg className="w-5 h-5 text-[#e3e3dd]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M15.688,18.062 c-0.635-0.122-1.396-0.342-2.152-0.563c-0.218-0.063-0.419-0.038-0.573,0.061c-0.161,0.104-0.279,0.278-0.33,0.479 c-0.117,0.476-0.28,1.002-0.457,1.527c-0.162,0.475-0.613,0.781-1.109,0.781H10.96c-0.496,0-0.947-0.306-1.109-0.781 c-0.177-0.525-0.34-1.051-0.457-1.527c-0.052-0.201-0.169-0.375-0.33-0.479c-0.154-0.099-0.355-0.124-0.573-0.061 c-0.756,0.221-1.518,0.44-2.152,0.563C6.01,18.125,5.659,17.886,5.556,17.56c-0.233-0.748-0.417-1.463-0.536-2.122 c-0.119-0.665,0.068-1.282,0.497-1.637c0.416-0.346,0.909-0.519,1.47-0.519h0.016c0.551,0,1.077-0.162,1.524-0.47 c0.407-0.28,0.72-0.686,0.89-1.155c0.358-0.985,0.793-2.029,1.265-3.076c0.238-0.528,0.756-0.865,1.339-0.865h0.817 c0.584,0,1.102,0.336,1.339,0.865c0.472,1.047,0.907,2.091,1.265,3.076c0.17,0.469,0.482,0.875,0.89,1.155 c0.447,0.308,0.973,0.47,1.524,0.47h0.016c0.562,0,1.054,0.173,1.47,0.519c0.429,0.355,0.615,0.972,0.497,1.637 c-0.118,0.658-0.303,1.374-0.536,2.122C18.341,17.886,17.99,18.125,15.688,18.062z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
