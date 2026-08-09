import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getAuthUserRole } from "@/lib/auth.functions";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const role = await getAuthUserRole();
      if (role === 'super_admin') throw redirect({ to: '/dashboard/super-admin' });
      if (role === 'gym_admin') throw redirect({ to: '/dashboard/admin' });
      if (role) throw redirect({ to: '/dashboard/m' });
    }
  },
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#121411] text-[#e3e3dd] flex flex-col items-center justify-center p-6">
      <div className="w-24 h-24 rounded-3xl bg-[#1e201d] border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(183,255,30,0.15)]">
        <span className="material-symbols-outlined text-[#B7FF1E] text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>fitness_center</span>
      </div>
      <h1 className="text-4xl font-bold mb-2">Gym<span className="text-[#B7FF1E]">Sync</span></h1>
      <p className="text-[#858A7D] mb-12">'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                            
                                            No, nothing has happened so far; the functionality is still broken. Please check using my superadmin email and password and verify in the backend whether any error is visible that is preventing me from logging in or accessing the dashboard. Determine the issue. Earlier it was working well, but now I don’t know what the problem is. Please restore the functionality to its previous state, as it was working before.</p>
      
      <button 
        onClick={() => navigate({ to: "/auth/login" })}
        className="w-full max-w-[300px] h-[52px] bg-[#B7FF1E] text-[#121411] font-bold rounded-full shadow-[0_0_20px_rgba(183,255,30,0.2)] hover:opacity-90 active:scale-95 transition-all"
      >
        Get Started
      </button>
    </div>
  );
}
