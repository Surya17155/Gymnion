import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) setMessage(error.message);
    else setMessage('Check your email for the reset link.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0F0C] p-4 font-sans">
      <div className="w-full max-w-[400px] bg-[#1a1c19] p-8 rounded-3xl border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full bg-[#121411] border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#B7FF1E] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B7FF1E] text-black font-semibold py-3 rounded-xl hover:bg-[#a3e618] transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {message && <p className="text-sm text-center text-[#B7FF1E]">{message}</p>}
        </form>
      </div>
    </div>
  );
}
