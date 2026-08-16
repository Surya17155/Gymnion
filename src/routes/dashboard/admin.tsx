import { createFileRoute, Link, Outlet, useNavigate, redirect } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServerFn } from '@tanstack/react-start';
import { getAdminStats, getRecentActivity, getGymDetails } from '@/lib/auth.functions';
import { checkGymSubscription } from '@/lib/subscription.functions';
import { clearRoleCache } from '@/lib/role';
import { format } from 'date-fns';
import { createRazorpayOrder, verifySubscriptionPayment } from '@/lib/payments.functions';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: '/dashboard/admin' }
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkSubscriptionFn = useServerFn(checkGymSubscription);
  const createOrderFn = useServerFn(createRazorpayOrder);
  const verifyPaymentFn = useServerFn(verifySubscriptionPayment);

  const { data: subStatus, refetch: refetchSubscription } = useQuery({
    queryKey: ['gym-subscription-status'],
    queryFn: () => checkSubscriptionFn(),
    staleTime: 60000,
  });

  const isExpired = subStatus?.isExpired;
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!gymData?.id) return;
    
    try {
      setIsProcessingPayment(true);
      const order = await createOrderFn({ data: { planId, gymId: gymData.id } });
      
      // Simulate Razorpay Checkout
      toast.info("Opening secure payment gateway...");
      
      setTimeout(async () => {
        try {
          await verifyPaymentFn({
            data: {
              gymId: gymData.id,
              planId,
              razorpayOrderId: order.orderId,
              razorpayPaymentId: "pay_simulated_" + Math.random().toString(36).substring(7),
              razorpaySignature: "sig_simulated"
            }
          });
          toast.success("Subscription successful! Welcome to Gymnion.");
          queryClient.invalidateQueries({ queryKey: ['admin-gym-settings'] });
          queryClient.invalidateQueries({ queryKey: ['gym-subscription-status'] });
          refetchSubscription();
        } catch (err: any) {
          toast.error(err.message || "Payment verification failed");
        } finally {
          setIsProcessingPayment(false);
        }
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearRoleCache();
    window.localStorage.removeItem('tanstack-query-cache');
    window.location.replace('/');
  };

  const getStatsFn = useServerFn(getAdminStats);
  const getActivityFn = useServerFn(getRecentActivity);
  const getGymDetailsFn = useServerFn(getGymDetails);

  const { data: gymData, isLoading: isGymLoading, error: profileError } = useQuery({
    queryKey: ['admin-gym-settings'],
    queryFn: () => getGymDetailsFn({ data: undefined }),
    staleTime: 30000,
    gcTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (profileError) {
      console.error("Profile fetch error in admin dashboard:", profileError);
      const errorStr = String(profileError);
      
      let isCritical = false;
      if (errorStr.includes('Unauthorized') || errorStr.includes('401') || errorStr.includes('expired')) {
        isCritical = true;
      } else if (errorStr.includes('403') || errorStr.includes('Forbidden')) {
        isCritical = true;
      }

      if (isCritical) {
        // Clear all auth data to break the loop
        Promise.all([
          supabase.auth.signOut(),
          clearRoleCache()
        ]).finally(() => {
          window.localStorage.removeItem('tanstack-query-cache');
          window.location.replace('/');
        });
      }
    }
  }, [profileError]);


  const { data: stats, isLoading: isStatsLoading, error: statsError } = useQuery({
    queryKey: ['admin-stats', gymData?.id],
    queryFn: () => getStatsFn({ data: { gymId: gymData!.id } }),
    enabled: !!gymData?.id && !isExpired,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const { data: recentActivity, isLoading: isActivityLoading, error: activityError } = useQuery({
    queryKey: ['admin-activity', gymData?.id],
    queryFn: () => getActivityFn({ data: { gymId: gymData!.id } }),
    enabled: !!gymData?.id && !isExpired,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const isActuallyLoading = isGymLoading || (gymData?.id && (isStatsLoading || isActivityLoading));
  const hasAuthError = (statsError && String(statsError).includes('Unauthorized')) || 
                       (activityError && String(activityError).includes('Unauthorized'));

  useEffect(() => {
    if (hasAuthError) {
      console.warn("Auth error detected in stats/activity queries, signing out...");
      Promise.all([
        supabase.auth.signOut(),
        clearRoleCache()
      ]).finally(() => {
        window.localStorage.removeItem('tanstack-query-cache');
        window.location.replace('/');
      });
    }
  }, [hasAuthError, navigate]);

  if (!gymData && isGymLoading) {
    return (
      <div className="bg-[#121411] text-[#e3e3dd] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#C0C2B8]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!gymData && !isGymLoading) {
    return (
      <div className="bg-[#121411] text-[#e3e3dd] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-[#FF5964] mb-4">error</span>
        <h2 className="text-xl font-bold mb-2">Gym Not Found</h2>
        <p className="text-[#858A7D] mb-6">We couldn't find the gym associated with your account.</p>
        <button
          onClick={() => navigate({ to: '/auth/login' })}
          className="bg-[#B7FF1E] text-[#293500] px-6 py-2 rounded-full font-bold"
        >
          Return to Login
        </button>
      </div>
    );
  }


  useEffect(() => {
    if (gymData?.id) {
      const checkinUrl = `${window.location.origin}/checkin?gym=${gymData.id}&code=${gymData.gym_code || ''}`;
      QRCode.toDataURL(checkinUrl, { width: 400, margin: 2 }).then(setQrUrl);
    }
  }, [gymData]);

  useEffect(() => {
    if (!gymData?.id) return;

    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `gym_id=eq.${gymData.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats', gymData.id] });
          queryClient.invalidateQueries({ queryKey: ['admin-activity', gymData.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `gym_id=eq.${gymData.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats', gymData.id] });
          queryClient.invalidateQueries({ queryKey: ['admin-activity', gymData.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gymData?.id, queryClient]);

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${gymData?.name || 'gym'}-qr.png`;
    link.click();
  };

  const { data: activePlans } = useQuery({
    queryKey: ['global-plans-for-admin'],
    queryFn: async () => {
      // Admins might not have direct select access to global_plans via client SDK due to RLS
      // Fallback to empty array if it fails rather than crashing the whole dashboard
      try {
        const { data, error } = await supabase
          .from('global_plans')
          .select('*')
          .eq('is_active', true);
        if (error) {
          console.warn("Could not fetch global plans via client SDK:", error);
          return [];
        }
        return data;
      } catch (e) {
        console.warn("Exception fetching global plans:", e);
        return [];
      }
    },
    retry: 1,
    staleTime: 300000, // 5 minutes is plenty for plans

  });

  const currentPlan = activePlans?.find((p: any) => p.id === (gymData?.settings as any)?.plan_id);

  return (
    <div className={`bg-[#121411] text-[#e3e3dd] antialiased overflow-x-hidden min-h-screen font-['Poppins'] no-scrollbar ${showQRModal || showDropdown ? 'tab-bar-hidden' : ''}`}>
      {/* Head link for icons is already in __root.tsx, but ensuring icons are available */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Top Glow Effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15) 0%, rgba(18, 20, 17, 0) 70%)'
        }}
      />

      {/* Main Mobile Container */}
      <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative z-10 flex flex-col">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-[20px] md:px-0 h-[64px] w-full sticky top-0 z-40 bg-transparent">
          <div className="flex items-center gap-3">
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity text-[#B7FF1E] bg-[#1e201d]/50 border border-white/10 focus:outline-none overflow-hidden"
            >
              {gymData?.owner_photo_url ? (
                <img src={gymData.owner_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>person</span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1e201d] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                <Link
                  to="/dashboard/admin/account"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#C0C2B8] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Profile
                </Link>
                <Link
                  to="/dashboard/admin/plans"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#C0C2B8] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Gym Plans
                </Link>
                <Link
                  to="/dashboard/admin/qr-management"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#C0C2B8] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  QR Management
                </Link>
                <Link
                  to="/dashboard/admin/settings"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#C0C2B8] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Settings
                </Link>
                <div className="h-px bg-white/5 my-1 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#FF5964] hover:bg-white/5 transition-colors text-[14px]"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-[20px] md:px-0 flex flex-col gap-[24px] py-2">
          {/* Page Title */}
          <section className="-mt-4">
            <h2 className="text-[40px] font-bold leading-[44px] tracking-[-0.04em] text-white">Hi, {gymData?.owner_first_name || gymData?.owner_name?.split(' ')[0] || ''}</h2>
          </section>

          {/* Revenue Card (Full width) */}
          <section>
            <div className="bg-[#121411] rounded-xl p-[16px] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#B7FF1E]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] leading-[18px] text-[#858A7D] uppercase tracking-wider">Revenue (This Month)</span>
                <span className="material-symbols-outlined text-[#B7FF1E] opacity-50" style={{ fontVariationSettings: '"FILL" 0' }}>payments</span>
              </div>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-[#B7FF1E]">₹{stats?.monthRevenue.toLocaleString() || 0}</span>
                <div className="flex items-center text-[#A7F52A] text-[11px] font-semibold pb-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>+12%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Subscription/Manual Features Banner - Current Plan */}
          {(currentPlan || (gymData?.settings as any)?.manual_pricing || gymData?.plan_tier === 'free') && !isExpired && (
            <section className="bg-[#B7FF1E]/10 border border-[#B7FF1E]/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#858A7D] uppercase font-bold">Current Plan</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold">
                    {gymData?.plan_tier === 'free' ? 'Free Trial' : (currentPlan?.name || 'Manual Pricing')}
                  </p>
                  {gymData?.plan_tier === 'free' && (
                    <span className="text-[10px] bg-[#B7FF1E] text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(183,255,30,0.3)]">Free</span>
                  )}
                </div>
                {gymData?.subscription_ends_at && (
                  <p className="text-[11px] text-[#B7FF1E] font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    {gymData.plan_tier === 'free' ? 'Trial ends: ' : 'Expires: '}
                    {format(new Date(gymData.subscription_ends_at), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {(() => {
                  const settings = (gymData?.settings as any) || {};
                  const manualFeatures = settings.features;
                  
                  if (manualFeatures) {
                    return (
                      <>
                        <span 
                          className="material-symbols-outlined text-[18px]" 
                          style={{ color: manualFeatures.payment_management ? '#B7FF1E' : '#FF5964' }}
                          title="Payments"
                        >
                          payments
                        </span>
                        <span 
                          className="material-symbols-outlined text-[18px]" 
                          style={{ color: manualFeatures.attendance_management ? '#B7FF1E' : '#FF5964' }}
                          title="Attendance"
                        >
                          how_to_reg
                        </span>
                        <span 
                          className="material-symbols-outlined text-[18px]" 
                          style={{ color: manualFeatures.fee_reminders ? '#B7FF1E' : '#FF5964' }}
                          title="Reminders"
                        >
                          notifications_active
                        </span>
                      </>
                    );
                  }
                  
                  // For Free Trial, show common features as enabled or based on plan if selected
                  const featuresToShow = currentPlan?.features || [
                    { name: 'Payment Management', enabled: true },
                    { name: 'Attendance Management', enabled: true },
                    { name: 'Fee Reminders', enabled: true }
                  ];

                  return Array.isArray(featuresToShow) && (featuresToShow as any[]).slice(0, 3).map((f: any, i: number) => {
                    const isEnabled = typeof f === 'string' ? true : f.enabled;
                    const featureName = typeof f === 'string' ? f.toLowerCase() : (f.name || '').toLowerCase();
                    
                    let icon = 'check_circle';
                    if (featureName.includes('payment')) icon = 'payments';
                    else if (featureName.includes('attendance')) icon = 'how_to_reg';
                    else if (featureName.includes('reminder')) icon = 'notifications_active';

                    return (
                      <span 
                        key={i} 
                        className="material-symbols-outlined text-[18px]" 
                        style={{ 
                          color: isEnabled ? '#B7FF1E' : '#FF5964'
                        }}
                        title={typeof f === 'string' ? f : f.name}
                      >
                        {icon}
                      </span>
                    );
                  });
                })()}
              </div>
            </section>
          )}

          {/* Subscription Expired Warning & Plan Picker */}
          {isExpired && (
            <section className="flex flex-col gap-4">
              <div className="bg-[#FF5964]/10 border border-[#FF5964]/30 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF5964]"></div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#FF5964]">warning</span>
                  <div>
                    <h3 className="text-white font-bold text-sm">Subscription Expired</h3>
                    <p className="text-[11px] text-[#858A7D]">Please select a plan to continue using Gymnion.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {activePlans?.map((plan: any) => (
                  <button
                    key={plan.id}
                    disabled={isProcessingPayment}
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full bg-[#1e201d] border border-[#B7FF1E]/20 hover:border-[#B7FF1E]/50 rounded-2xl p-5 text-left transition-all group flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-white font-bold">{plan.name}</h4>
                      <p className="text-[#B7FF1E] font-bold text-lg mt-1">₹{plan.price / 100}<span className="text-[10px] text-[#858A7D] ml-1 uppercase">/ month</span></p>
                    </div>
                    <div className="bg-[#B7FF1E] text-black h-10 px-4 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wider group-hover:scale-105 transition-transform">
                      {isProcessingPayment ? 'Wait...' : 'Subscribe'}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* QR Quick Action - Link to QR Management */}
          <section>
            <Link 
              to="/dashboard/admin/qr-management"
              className="w-full bg-[#1e201d] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-[#252724] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#B7FF1E]/10 flex items-center justify-center text-[#B7FF1E]">
                  <span className="material-symbols-outlined">qr_code_2</span>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold">Gym QR Code</h3>
                  <p className="text-[12px] text-[#858A7D]">Members scan this to check in</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#858A7D] group-hover:text-white transition-colors">arrow_forward_ios</span>
            </Link>
          </section>

          {/* KPI Grid */}
          <section className="grid grid-cols-2 gap-3">
            {/* Revenue Card moved up */}

            {/* Member Status Card */}
            <div className="bg-[#121411] rounded-xl p-[16px] border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[12px] leading-[18px] text-[#858A7D] mb-3">Member Status</span>
              {/* Progress Ring */}
              <div className="relative w-20 h-20 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-[#292A28]" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-[#B7FF1E]" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="60" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-semibold text-white">{stats ? Math.round((stats.todayCheckins / 200) * 100) : 0}%</span>
                </div>
              </div>
              <div className="flex justify-between w-full text-[11px] font-semibold">
                <span className="text-[#C0C2B8]">{stats?.todayCheckins || 0} In</span>
                <span className="text-[#B7FF1E]">{stats?.currentlyIn || 0} Now</span>
              </div>
            </div>

            {/* Overdue Members Card */}
            <div className="bg-[#121411] rounded-xl p-[16px] border border-[#FF5964]/30 flex flex-col items-start justify-between relative overflow-hidden animate-pulse">
              <div className="absolute inset-0 bg-[#FF5964]/5"></div>
              <div className="relative z-10 w-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[12px] leading-[18px] text-[#FF5964]">Overdue</span>
                  <span className="material-symbols-outlined text-[#FF5964] opacity-80" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
                </div>
                <span className="text-[40px] leading-[40px] font-bold tracking-[-0.04em] text-white block mb-1">{stats?.overdueCount || 0}</span>
                <span className="text-[11px] font-semibold text-[#C0C2B8]">Members unpaid</span>
              </div>
            </div>
          </section>

          {/* Quick Actions removed from dashboard as requested, keeping other sections */}

          {/* Recent Activity */}
          <section className={isExpired ? 'opacity-50 grayscale' : ''}>
            <div className="flex justify-between items-center mb-[12px]">
              <h3 className="text-[18px] font-semibold text-white">Recent Activity</h3>
              <span className="text-[11px] font-semibold text-[#B7FF1E] cursor-pointer">View All</span>
            </div>
            <div className="bg-[#121411] rounded-xl border border-white/5 overflow-hidden">
              {recentActivity?.map((activity, i) => (
                <div key={i} className="p-[16px] border-b border-white/5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'payment' ? 'text-[#B7FF1E]' : 'text-[#C0C2B8]'} bg-[#1e201d]`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {activity.type === 'payment' ? 'payments' : 'login'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-white"><span className="font-semibold">{activity.member_name}</span> {activity.action}</p>
                    <p className="text-[11px] font-semibold text-[#858A7D]">
                      {format(new Date(activity.timestamp!), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentActivity || recentActivity.length === 0) && (
                <div className="p-8 text-center text-[#858A7D] text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </section>
        </main>

        {/* QR Modal */}
        {showQRModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQRModal(false)}></div>
            <div className="bg-[#1e201d] w-full max-w-sm rounded-3xl border border-white/10 p-6 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Gym QR Code</h3>
                <button onClick={() => setShowQRModal(false)} className="text-[#858A7D] hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="bg-white p-4 rounded-2xl mb-6">
                {qrUrl ? (
                  <img src={qrUrl} alt="Gym QR" className="w-full aspect-square object-contain" />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDownloadQR}
                  className="w-full bg-[#B7FF1E] text-[#293500] h-12 rounded-full font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">download</span>
                  Download PNG
                </button>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className="w-full text-[#858A7D] h-10 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className={`bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe rounded-t-md max-w-[480px] transition-transform duration-300 nav-bar-transition`}>
        <Link 
          to="/dashboard/admin"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          preload="intent"
          disabled={!!isExpired}
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>dashboard</span>
              <span className="text-[11px] font-semibold leading-[14px]">Dashboard</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/admin/members"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          preload="intent"
          disabled={!!isExpired}
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>group</span>
              <span className="text-[11px] font-semibold leading-[14px]">Members</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/admin/payments"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          preload="intent"
          disabled={!!isExpired}
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>receipt_long</span>
              <span className="text-[11px] font-semibold leading-[14px]">Payments</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/admin/attendance"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          preload="intent"
          disabled={!!isExpired}
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>event_available</span>
              <span className="text-[11px] font-semibold leading-[14px]">Attendance</span>
            </>
          )}
        </Link>
        
        <Link 
          to="/dashboard/admin/settings"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
          preload="intent"
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>settings</span>
              <span className="text-[11px] font-semibold leading-[14px]">Settings</span>
            </>
          )}
        </Link>
      </nav>
    </div>
  );
}
