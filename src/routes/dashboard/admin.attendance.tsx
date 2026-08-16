import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getAttendanceDashboard, getCurrentGymId } from '@/lib/auth.functions';
import { getGymAttendanceData } from '@/lib/attendance.functions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export const Route = createFileRoute('/dashboard/admin/attendance')({
  component: AttendanceDashboard,
  loader: async ({ context }) => {
    const gymId = await context.queryClient.ensureQueryData({
      queryKey: ['current-gym-id'],
      queryFn: () => getCurrentGymId({ data: undefined })
    });
    if (gymId) {
      await context.queryClient.ensureQueryData({
        queryKey: ['admin-attendance', gymId],
        queryFn: () => getAttendanceDashboard({ data: { gymId } })
      });
    }
  }
});

function AttendanceDashboard() {
  const [tab, setTab] = useState<'today' | 'currently_in' | 'all'>('today');
  const [isExporting, setIsExporting] = useState(false);
  const getAttendanceFn = useServerFn(getAttendanceDashboard);
  const getGymIdFn = useServerFn(getCurrentGymId);
  const getGymAttendanceDataFn = useServerFn(getGymAttendanceData);
  const queryClient = useQueryClient();

  const { data: gymId } = useQuery({
    queryKey: ['current-gym-id'],
    queryFn: () => getGymIdFn(),
  });

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['admin-attendance', gymId],
    queryFn: () => getAttendanceFn({ data: { gymId: gymId! } }),
    enabled: !!gymId,
    staleTime: 60000,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (!gymId) return;

    const channel = supabase
      .channel('admin-attendance-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `gym_id=eq.${gymId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-attendance', gymId] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats', gymId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gymId, queryClient]);

  const getList = () => {
    if (!attendanceData) return [];
    if (tab === 'today') return attendanceData.today_log;
    if (tab === 'currently_in') return attendanceData.currently_in;
    return attendanceData.all_visits;
  };

  const list = getList();

  const handleExport = async () => {
    if (!gymId) return;
    setIsExporting(true);
    try {
      const data = await getGymAttendanceDataFn({ data: { gymId } });
      
      if (!data || data.length === 0) {
        toast.info("No attendance records to export");
        return;
      }

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Customize column widths
      const wscols = [
        { wch: 12 }, // Date
        { wch: 15 }, // Month-Year
        { wch: 20 }, // Member Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 12 }, // Check-in
        { wch: 12 }, // Check-out
        { wch: 12 }  // Status
      ];
      worksheet['!cols'] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      
      // Generate filename
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const filename = `GymSync_Attendance_${dateStr}.xlsx`;
      
      // Download
      XLSX.writeFile(workbook, filename);
      
      toast.success("Attendance report downloaded successfully");
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F0C] text-[#e3e3dd] font-['Poppins'] pb-32">
      {/* Top Glow Effect */}
      <div 
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15) 0%, rgba(18, 20, 17, 0) 70%)'
        }}
      />

      {/* Header */}
      <div className="p-6 md:px-0 pb-2 sticky top-0 z-40 bg-transparent">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-[32px] font-bold leading-[32px] tracking-[-0.04em] text-white mb-2">Attendance</h1>
            <p className="text-[14px] leading-[20px] text-[#C0C2B8]">Real-time tracking</p>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#D5FF40] text-black px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">{isExporting ? 'sync' : 'export_notes'}</span>
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>

        {/* Status Pills */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-[#121411] rounded-xl p-1 flex border border-white/5">
            <button 
              onClick={() => setTab('today')}
              className={`flex-1 h-10 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${tab === 'today' ? 'bg-[#D5FF40] text-black' : 'text-[#858A7D]'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setTab('currently_in')}
              className={`flex-1 h-10 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${tab === 'currently_in' ? 'bg-[#D5FF40] text-black' : 'text-[#858A7D]'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setTab('all')}
              className={`flex-1 h-10 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${tab === 'all' ? 'bg-[#D5FF40] text-black' : 'text-[#858A7D]'}`}
            >
              Recent
            </button>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="px-6 md:px-0 space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-[#858A7D]">Loading attendance...</div>
        ) : (
          list.map((visit: any) => (
            <div 
              key={visit.id}
              className="bg-[#121411] rounded-2xl p-4 border border-white/5 flex items-center gap-4 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#1e201d] flex items-center justify-center border border-white/10 overflow-hidden">
                {visit.members?.full_name ? (
                  <span className="text-[14px] font-bold text-[#D5FF40]">
                    {visit.members.full_name.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[#858A7D]">person</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-[15px] text-white truncate">{visit.members?.full_name}</h3>
                  <div className="flex gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.05em] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e]">
                      IN
                    </span>
                    {visit.check_out_at && (
                      <span className="text-[9px] font-black uppercase tracking-[0.05em] px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444]">
                        OUT
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#858A7D] font-medium">
                  <span className="material-symbols-outlined text-[14px]">login</span>
                  <span className="text-[#22c55e]">{visit.check_in_at ? format(new Date(visit.check_in_at), 'hh:mm a') : 'N/A'}</span>
                  {visit.check_out_at && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[#3d3f3b]" />
                      <span className="material-symbols-outlined text-[14px]">logout</span>
                      <span className="text-[#ef4444]">{format(new Date(visit.check_out_at), 'hh:mm a')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {(!isLoading && list.length === 0) && (
          <div className="text-center py-12 text-[#858A7D]">No records found</div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-[#1e201d] border-t border-white/5 shadow-lg bottom-0 fixed left-1/2 -translate-x-1/2 w-full z-[10] flex justify-around items-center px-4 py-2 pb-safe rounded-t-xl max-w-[480px] transition-transform duration-300 nav-bar-transition">
        <Link 
          to="/dashboard/admin" 
          activeOptions={{ exact: true }}
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
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
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>how_to_reg</span>
              <span className="text-[11px] font-semibold leading-[14px]">Attendance</span>
            </>
          )}
        </Link>
        <Link 
          to="/dashboard/admin/settings"
          activeProps={{ className: 'text-[#B7FF1E] bg-[#25340D]/20 scale-90' }}
          inactiveProps={{ className: 'text-[#C0C2B8]' }}
          className="flex flex-col items-center justify-center w-[72px] h-[64px] rounded-xl transition-all duration-200"
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
