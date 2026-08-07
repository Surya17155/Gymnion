import { createFileRoute, Link } from '@tanstack/react-router';
import { 
  LucideHome, 
  LucideCreditCard, 
  LucideScanQrCode, 
  LucideCalendarDays, 
  LucideUser, 
  LucideSettings,
  LucideUserCircle,
  LucideMail,
  LucidePhone,
  LucideMapPin
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/m/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Johan Smith',
    age: '28',
    dob: 'Oct 12, 1998',
    email: 'johan.smith@email.com',
    phone: '+91 98765 43210',
    address: '123 Fitness Lane, Sector 4, Bangalore, India',
    bio: 'Fitness enthusiast & weekend marathon runner. Pushing limits every day.'
  });

  return (
    <div className="flex justify-center min-h-screen bg-[#121411] w-full relative overflow-x-hidden font-['Poppins']">
      {/* Ambient Glow Effect */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(183, 255, 30, 0.15) 0%, rgba(183, 255, 30, 0) 70%)',
          borderRadius: '50%'
        }}
      />
      
      <main className="w-full max-w-[480px] px-5 relative z-10 flex flex-col gap-6 pt-8 pb-[120px]">
        {/* Header */}
        <header className="flex justify-between items-center w-full">
          <h1 className="text-[28px] leading-[32px] font-bold text-white tracking-tight">Profile</h1>
          <button className="w-12 h-12 rounded-full bg-[#333532] flex items-center justify-center hover:bg-[#1e201d] transition-colors border border-white/5">
            <LucideSettings className="w-6 h-6 text-[#B7FF1E]" />
          </button>
        </header>

        {/* Top Section: Avatar & Bio */}
        <section className="flex flex-col items-center text-center mt-4">
          <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#B7FF1E] to-[#83A51B] mb-6 shadow-[0_0_20px_rgba(183,255,30,0.2)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#333532] border-4 border-[#121411]">
              <img 
                alt="User Profile Picture" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
              />
            </div>
          </div>
          <h2 className="text-[22px] leading-[26px] font-bold text-white mb-2">{profile.name}</h2>
          <p className="text-[14px] leading-[20px] text-[#C0C2B8] max-w-[280px]">
            {profile.bio}
          </p>
        </section>

        {/* Information Cards */}
        <section className="flex flex-col gap-3 mt-4">
          {/* Card 1: Personal Details */}
          <div className="bg-[#121411] rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:border-[#B7FF1E]/30 transition-colors shadow-inner" style={{ boxShadow: 'inset 0 0 40px rgba(183, 255, 30, 0.05)' }}>
            <div className="flex items-center gap-3 mb-4">
              <LucideUserCircle className="w-5 h-5 text-[#B7FF1E]" />
              <h3 className="text-[18px] leading-[24px] font-semibold text-white">Personal Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] leading-[14px] font-semibold text-[#C0C2B8] uppercase tracking-wider">Name</span>
                <span className="text-[14px] leading-[20px] text-white font-medium">{profile.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] leading-[14px] font-semibold text-[#C0C2B8] uppercase tracking-wider">Age</span>
                <span className="text-[14px] leading-[20px] text-white font-medium">{profile.age}</span>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-[11px] leading-[14px] font-semibold text-[#C0C2B8] uppercase tracking-wider">Date of Birth</span>
                <span className="text-[14px] leading-[20px] text-white font-medium">{profile.dob}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Contact Information */}
          <div className="bg-[#121411] rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:border-[#B7FF1E]/30 transition-colors shadow-inner" style={{ boxShadow: 'inset 0 0 40px rgba(183, 255, 30, 0.05)' }}>
            <div className="flex items-center gap-3 mb-4">
              <LucideMail className="w-5 h-5 text-[#B7FF1E]" />
              <h3 className="text-[18px] leading-[24px] font-semibold text-white">Contact Information</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] leading-[14px] font-semibold text-[#C0C2B8] uppercase tracking-wider">Email</span>
                <span className="text-[14px] leading-[20px] text-white font-medium">{profile.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] leading-[14px] font-semibold text-[#C0C2B8] uppercase tracking-wider">Phone No.</span>
                <span className="text-[14px] leading-[20px] text-white font-medium">{profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Location */}
          <div className="bg-[#121411] rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:border-[#B7FF1E]/30 transition-colors shadow-inner" style={{ boxShadow: 'inset 0 0 40px rgba(183, 255, 30, 0.05)' }}>
            <div className="flex items-center gap-3 mb-4">
              <LucideMapPin className="w-5 h-5 text-[#B7FF1E]" />
              <h3 className="text-[18px] leading-[24px] font-semibold text-white">Location</h3>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] leading-[14px] font-semibold text-[#C0C2B8] uppercase tracking-wider">Address</span>
              <span className="text-[14px] leading-[20px] text-white font-medium leading-relaxed">
                {profile.address}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1e201d] border-t border-white/5 shadow-lg px-2 py-2 pb-safe flex justify-around items-center h-[64px] rounded-t-2xl">
        <Link to="/dashboard/m" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
          <LucideHome className="w-6 h-6 mb-1" />
          <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Home</span>
        </Link>
        
        <Link to="/dashboard/m/payments" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
          <LucideCreditCard className="w-6 h-6 mb-1" />
          <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Payments</span>
        </Link>
        
        <div className="relative -top-6">
          <button className="w-16 h-16 bg-[#B7FF1E] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(213,255,64,0.3)] border-4 border-[#1e201d] hover:scale-105 transition-transform">
            <LucideScanQrCode className="w-[30px] h-[30px] text-[#293500]" />
          </button>
        </div>
        
        <Link to="/dashboard/m/attendance" className="flex flex-col items-center justify-center text-[#C0C2B8] p-1 hover:bg-[#333532] rounded-xl min-w-[60px] transition-colors">
          <LucideCalendarDays className="w-6 h-6 mb-1" />
          <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Attendance</span>
        </Link>
        
        <Link to="/dashboard/m/profile" className="flex flex-col items-center justify-center text-[#B7FF1E] bg-[#25340D]/20 rounded-xl p-1 min-w-[60px] scale-90 transition-all duration-200">
          <LucideUser className="w-6 h-6 mb-1" />
          <span className="text-[11px] leading-[14px] font-semibold font-['Poppins']">Profile</span>
        </Link>
      </nav>
    </div>
  );
}