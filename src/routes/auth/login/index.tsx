import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';

export const Route = createFileRoute('/auth/login/')({
  component: LoginComponent,
});

function LoginComponent() {
  return (
    <AppShell title="Login">
      <div className="flex flex-col gap-6 py-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your GymSync account</p>
        </div>
        
        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              className="w-full h-12 bg-gym-surface-raised rounded-md px-4 border border-white/5 text-sm focus:outline-none focus:border-gym-accent/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full h-12 bg-gym-surface-raised rounded-md px-4 border border-white/5 text-sm focus:outline-none focus:border-gym-accent/50 transition-colors"
            />
          </div>
          
          <button className="w-full bg-gym-accent text-primary h-12 rounded-pill font-bold hover:bg-gym-accent-bright transition-all shadow-[0_8px_20px_rgba(213,255,64,0.2)] active:scale-95">
            Sign In
          </button>
        </form>
        
        <div className="flex flex-col gap-3 pt-2">
          <button className="text-xs text-center text-muted-foreground hover:text-gym-accent transition-colors">
            Forgot your password?
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
          </div>
          <button className="w-full bg-gym-surface-raised text-foreground h-12 rounded-pill font-bold border border-white/5 hover:bg-gym-surface-muted transition-all active:scale-95">
            Request Gym Admin Access
          </button>
        </div>
      </div>
    </AppShell>
  );
}
