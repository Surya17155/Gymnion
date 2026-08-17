import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails } from '@/lib/auth.functions';
import { updateGymRazorpayAccount } from '@/lib/members-payments.functions';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/admin/settings/razorpay')({
  component: AdminRazorpaySettings,
});

function AdminRazorpaySettings() {
  const navigate = useNavigate();
  const getGymDetailsFn = useServerFn(getGymDetails);
  const updateAccountFn = useServerFn(updateGymRazorpayAccount);
  
  const { data: gym, isLoading } = useQuery({
    queryKey: ['admin-gym-settings'],
    queryFn: () => getGymDetailsFn({ data: undefined }),
  });

  const [accountId, setAccountId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (gym?.razorpay_account_id) {
      setAccountId(gym.razorpay_account_id);
    }
  }, [gym]);

  const handleSave = async () => {
    if (!gym?.id) return;
    setIsSaving(true);
    try {
      await updateAccountFn({ data: { gymId: gym.id, accountId } });
      toast.success("Razorpay account ID updated successfully");
      navigate({ to: '/dashboard/admin/settings' });
    } catch (err: any) {
      toast.error(err.message || "Failed to update Razorpay settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-[#e3e3dd]">Loading...</div>;

  return (
    <div className="bg-[#121411] text-[#e3e3dd] min-h-screen font-['Poppins']">
      <div className="max-w-[480px] mx-auto p-6">
        <header className="flex items-center mb-8">
          <button onClick={() => navigate({ to: '/dashboard/admin/settings' })} className="w-10 h-10 rounded-full bg-[#1e201d] flex items-center justify-center mr-4">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">Razorpay Integration</h1>
        </header>

        <div className="bg-[#1e201d] rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#25340D] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#B7FF1E]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Direct Payments</h3>
              <p className="text-xs text-[#858A7D]">Receive member fees directly to your Razorpay account.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#858A7D] uppercase font-bold ml-1">Razorpay Merchant ID / Account ID</label>
            <input 
              type="text" 
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. acc_xxxxxxxxxxxxxx"
              className="bg-[#121411] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#B7FF1E] focus:outline-none font-mono tracking-wider"
            />
            <p className="text-[10px] text-[#858A7D] mt-2 italic">
              Find this in your Razorpay Dashboard {'>'} Settings {'>'} API Keys or Account Details.
            </p>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#B7FF1E] text-[#293500] py-4 rounded-xl font-bold uppercase text-xs tracking-widest disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Integrate Razorpay'}
          </button>
        </div>
      </div>
    </div>
  );
}
