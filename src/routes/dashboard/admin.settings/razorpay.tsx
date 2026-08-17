import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails } from '@/lib/auth.functions';
import { initiateRazorpayOAuth, getRazorpayConnectionStatus, disconnectRazorpay } from '@/lib/razorpay-oauth.functions';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/admin/settings/razorpay')({
  component: AdminRazorpaySettings,
});

function AdminRazorpaySettings() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/dashboard/admin/settings/razorpay' }) as any;
  const queryClient = useQueryClient();
  
  const getGymDetailsFn = useServerFn(getGymDetails);
  const initiateOAuthFn = useServerFn(initiateRazorpayOAuth);
  const getStatusFn = useServerFn(getRazorpayConnectionStatus);
  const disconnectFn = useServerFn(disconnectRazorpay);
  
  const { data: gym, isLoading: gymLoading } = useQuery({
    queryKey: ['admin-gym-settings'],
    queryFn: () => getGymDetailsFn({ data: undefined }),
  });

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['razorpay-status'],
    queryFn: () => getStatusFn({ data: undefined }),
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    if (search.success === 'true') {
      toast.success("Razorpay account connected successfully!");
      queryClient.invalidateQueries({ queryKey: ['razorpay-status'] });
      // Clear search params
      navigate({ to: '/dashboard/admin/settings/razorpay', replace: true });
    } else if (search.error) {
      const errorMessages: Record<string, string> = {
        access_denied: "Authorization was cancelled or denied.",
        invalid_params: "Invalid response from Razorpay.",
        invalid_state: "Security verification failed. Please try again.",
        state_expired: "Session expired. Please try again.",
        token_exchange_failed: "Failed to connect your Razorpay account."
      };
      toast.error(errorMessages[search.error] || "An error occurred during connection.");
      navigate({ to: '/dashboard/admin/settings/razorpay', replace: true });
    }
  }, [search, navigate, queryClient]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await initiateOAuthFn({ data: undefined });
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error("Failed to initiate OAuth flow");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start Razorpay connection");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect your Razorpay account? Members won't be able to pay fees until you reconnect.")) return;
    
    setIsDisconnecting(true);
    try {
      await disconnectFn({ data: undefined });
      toast.success("Razorpay account disconnected");
      queryClient.invalidateQueries({ queryKey: ['razorpay-status'] });
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect Razorpay");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isLoading = gymLoading || statusLoading;

  if (isLoading) return <div className="p-8 text-center text-[#e3e3dd]">Loading...</div>;

  return (
    <div className="bg-[#121411] text-[#e3e3dd] min-h-screen font-['Poppins']">
      <div className="max-w-[480px] mx-auto p-6">
        <header className="flex items-center mb-8">
          <button onClick={() => navigate({ to: '/dashboard/admin/settings' })} className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center mr-4">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">Payment Settings</h1>
        </header>

        <div className="bg-[#1e201d] rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#25340D] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#B7FF1E]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Razorpay Integration</h3>
              <p className="text-xs text-[#858A7D]">Collect membership fees directly to your account.</p>
            </div>
          </div>

          <div className="bg-[#121411] rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[#858A7D]">Connection Status</span>
              {status?.connected ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#25340D]/30 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B7FF1E] animate-pulse"></div>
                  <span className="text-[10px] font-bold text-[#B7FF1E] uppercase tracking-wider">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Not Connected</span>
                </div>
              )}
            </div>

            {status?.connected && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#858A7D] uppercase font-bold">Account ID</span>
                  <span className="text-sm font-mono text-white">{status.accountId}</span>
                </div>
                {status.connectedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#858A7D] uppercase font-bold">Connected on</span>
                    <span className="text-xs text-white/70">{new Date(status.connectedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {!status?.connected ? (
            <div className="space-y-4">
              <p className="text-xs text-[#858A7D] leading-relaxed">
                Connect your Razorpay account to start accepting online payments from your members. You'll be redirected to Razorpay to authorize this application.
              </p>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-[#B7FF1E] text-[#293500] py-4 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-[#a6e61b] transition-colors disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#293500]/30 border-t-[#293500] rounded-full animate-spin"></span>
                    Connecting...
                  </>
                ) : (
                  'Connect Razorpay'
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full bg-[#121411] text-red-500 py-4 rounded-xl font-bold uppercase text-xs tracking-widest border border-red-500/20 hover:bg-red-500/5 transition-colors disabled:opacity-50"
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect Account'}
            </button>
          )}

          <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
            <span className="material-symbols-outlined text-[18px] text-[#B7FF1E]">info</span>
            <p className="text-[10px] text-[#858A7D] leading-relaxed">
              We use Razorpay OAuth to securely connect to your account. Your API keys and secrets are never shared with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
