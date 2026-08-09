import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) alert(error.message);
    else {
      alert('Password updated successfully');
      navigate({ to: '/auth/login', search: { redirect: "" } });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0F0C] p-4 font-sans">
      <div className="w-full max-w-[400px] bg-[#1a1c19] p-8 rounded-3xl border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full bg-[#121411] border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#B7FF1E] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B7FF1E] text-black font-semibold py-3 rounded-xl hover:bg-[#a3e618] transition-colors"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
