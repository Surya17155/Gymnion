import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // The dashboard route handles role-based redirection
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0F0C] p-4 font-sans">
      <div className="w-full max-w-[400px] bg-[#1a1c19] p-8 rounded-3xl border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h1>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#121411] border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#B7FF1E] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#121411] border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#B7FF1E] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B7FF1E] text-black font-semibold py-3 rounded-xl hover:bg-[#a3e618] transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="text-center">
            <a href="/auth/forgot-password" className="text-sm text-[#858A7D] hover:text-[#B7FF1E]">Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
