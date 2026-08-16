import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAuthUserRole } from "@/lib/auth.functions";
import logoAsset from "@/assets/gymnion-logo-new.png.asset.json";
import heroBgAsset from "@/assets/landing-bg-new.png.asset.json";
import { TextReveal } from "@/components/ui/text-reveal-animation";
import featuresBgAsset from "@/assets/features-bg.png.asset.json";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, -50]);
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.1 });

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth check error:", error);
          return;
        }

        if (session) {
          console.log("Session found, fetching role...");
          const role = await getAuthUserRole();
          console.log("Role found:", role);
          
          if (role === 'super_admin') {
            window.location.replace('/dashboard/super-admin');
          } else if (role === 'admin' || role === 'gym_admin') {
            window.location.replace('/dashboard/admin');
          } else if (role === 'member') {
            window.location.replace('/dashboard/m');
          }
        }
      } catch (err) {
        console.error("Unexpected auth check error:", err);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#101311] text-[#F8FAF7] overflow-x-hidden">
      {/* Sticky Nav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-[#101311]/80 backdrop-blur-md border border-white/10 rounded-full px-6 h-16 flex items-center justify-between shadow-2xl"
        >
          <div className="flex items-center gap-2.5">
            <img src={logoAsset.url} alt="Logo" className="h-8 w-auto" />
            <span className="text-lg font-bold tracking-tight">Gymnion</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#AAB2AA]">
            <a href="#features" className="hover:text-[#C8FF38]">Features</a>
            <a href="#pricing" className="hover:text-[#C8FF38]">Pricing</a>
            <a href="#about" className="hover:text-[#C8FF38]">About</a>
            <a href="#contact" className="hover:text-[#C8FF38]">Contact</a>
            <Link to="/auth/login" className="bg-[#C8FF38] text-[#101311] px-5 py-2 rounded-full font-bold hover:bg-[#B6F028] text-xs uppercase tracking-wider">
              Get Started
            </Link>
          </div>
          <button className="md:hidden text-[#F8FAF7] p-2">
            <Menu size={20} />
          </button>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col pt-24 overflow-hidden">
        {/* Background Layer */}
        <motion.div 
          style={{ y: bgY }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={heroBgAsset.url} 
            alt="" 
            className="w-full h-full object-cover object-[center_top]"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center flex-1 px-6 max-w-7xl mx-auto w-full pt-8 md:pt-16">
          <div className="max-w-[800px] lg:w-1/2">
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="text-[clamp(2.8rem,10vw,4.5rem)] font-bold leading-[1.05] mb-4 tracking-tighter text-center lg:text-left">
                Run your gym <br />
                with <span className="text-[#C8FF38] inline-block"><TextReveal word="clarity." /></span>
              </h1>
            </motion.div>
            <motion.p 
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="text-base md:text-lg text-[#AAB2AA] mb-4 max-w-[320px] lg:max-w-[450px] leading-snug mx-auto lg:mx-0 text-center lg:text-left"
            >
              Track attendance, payments, fees, and revenue <br className="hidden sm:block" />
              in one clear dashboard.
            </motion.p>
          </div>

          {/* Central Revenue Card */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex-1 flex items-center justify-center px-6"
          >
            <div className="w-full max-w-[340px] p-5 rounded-[24px] border-2 border-[#D5FF40]/40 bg-transparent backdrop-blur-[2px]">
              <div className="flex justify-between items-start mb-5">
                <div className="flex flex-col">
                  <span className="text-[#A0A0A0] text-[13px] font-medium mb-1 tracking-wide uppercase">This month</span>
                  <h2 className="text-4xl font-bold tracking-tight text-[#F8FAF7]">₹1,84,500</h2>
                </div>
                <svg className="w-16 h-16 flex-shrink-0 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="14" fill="transparent"></circle>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#D5FF40" 
                    strokeWidth="14" 
                    fill="transparent" 
                    strokeDasharray="251.2" 
                    strokeDashoffset="35.168" 
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 8px rgba(213, 255, 64, 0.4))" }}
                  ></circle>
                </svg>
              </div>
              <div className="h-[1px] bg-white/10 w-full mb-5" />
              <div className="flex justify-between items-end h-[70px]">
                <div className="flex items-end space-x-2.5 h-full pb-1">
                  <div className="w-5 h-[30%] bg-gradient-to-t from-[#D5FF40]/20 to-[#D5FF40] rounded-sm opacity-80"></div>
                  <div className="w-5 h-[60%] bg-gradient-to-t from-[#D5FF40]/20 to-[#D5FF40] rounded-sm opacity-90"></div>
                  <div className="w-5 h-[90%] bg-gradient-to-t from-[#D5FF40]/20 to-[#D5FF40] rounded-sm shadow-[0_0_15px_rgba(213,255,64,0.3)]"></div>
                </div>
                <div className="flex flex-col items-end justify-end pb-1 w-[48%]">
                  <div className="text-sm font-medium mb-2.5">
                    <span className="text-[#D5FF40] font-bold">86%</span>
                    <span className="text-[#A0A0A0] ml-1.5">fees collected</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D5FF40] rounded-full shadow-[0_0_10px_rgba(213,255,64,0.4)]" style={{ width: '86%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <div className="relative z-10 w-full px-6 max-w-7xl mx-auto pb-12 md:pb-20 mt-auto lg:px-0">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="flex justify-center lg:justify-start"
            >
              <Link 
                to="/auth/login" 
                className="inline-flex items-center gap-2 bg-[#C8FF38] text-[#101311] px-6 h-[46px] rounded-xl font-bold text-base hover:bg-[#B6F028] transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(200,255,56,0.2)]"
              >
                Get started <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Features */}
      <section id="features" className="relative py-24 overflow-hidden">
        {/* Features Background Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src={featuresBgAsset.url} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
            <div className="lg:w-1/2">
              <p className="text-[#9a9a9a] font-semibold text-[11px] uppercase tracking-widest mb-2">BUILT FOR DAILY OPERATIONS</p>
              <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-6">
                Two essentials<br />One <span className="text-[#d5ff40] whitespace-nowrap">clear system</span>.
              </h2>
              <p className="text-[#9a9a9a] text-lg md:text-xl leading-relaxed max-w-[480px]">
                Gymnion keeps attendance and member payments visible, accurate, and easy to act on.
              </p>
            </div>
            
            <div className="lg:w-1/2 flex flex-col md:flex-row gap-8 items-start">
              {/* Attendance Card */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full max-w-sm rounded-xl p-6 border border-[#d5ff40]/30 bg-[#151515] shadow-[inset_0_0_15px_rgba(213,255,64,0.05)] relative overflow-hidden group"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg border border-[#d5ff40] flex items-center justify-center text-[#d5ff40] shrink-0">
                    <svg className="w-6 h-6 fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                      <rect height="18" rx="2" ry="2" width="18" x="3" y="3"></rect>
                      <path d="M9 12l2 2 4-4"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold leading-tight mb-2 text-[#f0f2eb]">Attendance that<br/>stays accurate.</h3>
                    <p className="text-sm text-[#9a9a9a] leading-snug">See who checked in, who missed today, and what needs attention.</p>
                  </div>
                </div>

                <div className="bg-[#111111] rounded-xl border border-[#2a2a2a] overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-[#2a2a2a]">
                    <span className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wider">Status</span>
                    <span className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wider">Check-Ins Today</span>
                  </div>
                  <div className="flex flex-col">
                    {[
                      { initials: "AR", time: "9:12 AM", status: "present" },
                      { initials: "MS", time: "8:45 AM", status: "present" },
                      { initials: "RK", time: "Absent", status: "absent" }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-[#2a2a2a] last:border-0">
                        <div className="w-1/3">
                          <div className="w-8 h-8 rounded-full bg-[#1a1c19] flex items-center justify-center text-xs font-medium text-[#f0f2eb]">{row.initials}</div>
                        </div>
                        <div className="w-1/3 flex justify-center">
                          {row.status === 'present' ? (
                            <svg className="w-5 h-5 text-[#d5ff40] fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M9 12l2 2 4-4"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#9a9a9a] fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="8" x2="16" y1="12" y2="12"></line>
                            </svg>
                          )}
                        </div>
                        <div className={`flex justify-end items-center gap-2 w-1/3 text-sm ${row.status === 'present' ? 'text-[#f0f2eb]' : 'text-[#9a9a9a]'}`}>
                          <span>{row.time}</span>
                          <svg className="w-4 h-4 text-[#9a9a9a] fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-4 py-4">
                    <span className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wider">Total Check-Ins</span>
                    <span className="text-xl font-bold text-[#d5ff40]">24</span>
                  </div>
                </div>
              </motion.div>

              {/* Payments Card */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-sm rounded-xl p-6 border border-[#d5ff40]/30 bg-[#151515] shadow-[inset_0_0_15px_rgba(213,255,64,0.05)] relative overflow-hidden group"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg border border-[#d5ff40] flex items-center justify-center text-[#d5ff40] shrink-0">
                    <svg className="w-6 h-6 fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                      <rect height="14" rx="2" ry="2" width="18" x="3" y="5"></rect>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold leading-tight mb-2 text-[#f0f2eb]">Payments that<br/>stay on track.</h3>
                    <p className="text-sm text-[#9a9a9a] leading-snug">Track collected fees, pending payments, and overdue memberships in one place.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1 bg-[#111111] rounded-xl border border-[#2a2a2a] p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d5ff40]"></span>
                        <span className="text-[#f0f2eb] font-medium">Paid</span>
                      </div>
                      <span className="text-[#d5ff40] font-medium">64</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-[#2a2a2a] pt-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffc107]"></span>
                        <span className="text-[#f0f2eb] font-medium">Pending</span>
                      </div>
                      <span className="text-[#ffc107] font-medium">18</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-[#2a2a2a] pt-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d4f]"></span>
                        <span className="text-[#f0f2eb] font-medium">Overdue</span>
                      </div>
                      <span className="text-[#ff4d4f] font-medium">7</span>
                    </div>
                  </div>

                  <div className="w-28 h-28 relative flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" fill="none" r="45" stroke="#222" strokeWidth="8"></circle>
                      {/* Overdue (Red) */}
                      <circle className="origin-center rotate-[15deg]" cx="50" cy="50" fill="none" r="45" stroke="#ff4d4f" strokeDasharray="20 262.6" strokeDashoffset="0" strokeWidth="8"></circle>
                      {/* Pending (Yellow) */}
                      <circle className="origin-center rotate-[15deg]" cx="50" cy="50" fill="none" r="45" stroke="#ffc107" strokeDasharray="40 242.6" strokeDashoffset="-22" strokeWidth="8"></circle>
                      {/* Paid (Green) */}
                      <circle className="origin-center rotate-[15deg]" cx="50" cy="50" fill="none" r="45" stroke="#d5ff40" strokeDasharray="190 92.6" strokeDashoffset="-64" strokeLinecap="round" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] font-medium text-[#9a9a9a] leading-tight uppercase tracking-widest mt-1">Collection<br/>Progress</span>
                      <div className="text-2xl font-bold text-[#d5ff40] leading-none flex items-baseline">
                        73<span className="text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 bg-[#000000] overflow-hidden">
        {/* Atmospheric Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_30%,rgba(213,255,64,0.15)_0%,transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(213,255,64,0.1)_0%,transparent_50%)] pointer-events-none"></div>

        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none overflow-hidden">
          <svg className="absolute -top-20 -right-20 w-[400px] h-[400px] opacity-40" viewBox="0 0 100 100">
            <circle cx="100" cy="0" fill="none" r="40" stroke="#B7FF1E" strokeWidth="0.2"></circle>
            <circle cx="100" cy="0" fill="none" r="60" stroke="#B7FF1E" strokeWidth="0.1"></circle>
            <circle cx="100" cy="0" fill="none" r="80" stroke="#B7FF1E" strokeWidth="0.05"></circle>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none overflow-hidden">
          <svg className="absolute -bottom-20 -left-20 w-[400px] h-[400px] opacity-40" viewBox="0 0 100 100">
            <circle cx="0" cy="100" fill="none" r="40" stroke="#B7FF1E" strokeWidth="0.2"></circle>
            <circle cx="0" cy="100" fill="none" r="60" stroke="#B7FF1E" strokeWidth="0.1"></circle>
            <circle cx="0" cy="100" fill="none" r="80" stroke="#B7FF1E" strokeWidth="0.05"></circle>
          </svg>
        </div>

        <main className="relative z-10 px-6 max-w-md lg:max-w-7xl mx-auto lg:translate-x-0 -translate-x-[0.32rem]">
          {/* Header Section */}
          <header className="mb-12 lg:mb-20 lg:text-center">
            <p className="text-[#c3c8be] text-xs tracking-wider uppercase mb-3 font-medium">How it works</p>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-4 text-white">
              Start simple.<br />
              Stay <span className="text-[#d5ff40]">organised.</span>
            </h1>
            <p className="text-[#c3c8be] text-base lg:text-xl leading-relaxed pr-4 lg:pr-0 lg:max-w-2xl lg:mx-auto">
              Set up your member list, then keep every daily check-in clear and current.
            </p>
          </header>

          {/* Timeline Section */}
          <div className="relative lg:grid lg:grid-cols-2 lg:gap-x-24 lg:gap-y-32">
            {/* Continuous vertical line */}
            <div className="absolute left-[1.25rem] lg:left-1/2 lg:-translate-x-1/2 top-8 bottom-[-9rem] w-[2px] bg-[#B7FF1E] shadow-[0_0_10px_#B7FF1E] z-0"></div>

            {/* Step 1 */}
            <section className="relative pl-14 lg:pl-0 lg:text-right lg:pr-20 mb-16 lg:mb-0">
              {/* Number Badge */}
              <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 top-1 lg:top-8 w-10 h-10 rounded-full bg-[#121411] border-2 border-[#d5ff40] flex items-center justify-center shadow-[0_0_20px_2px_rgba(213,255,64,0.15)] z-10">
                <span className="text-[#d5ff40] font-bold text-lg">01</span>
              </div>
              <div className="mb-6 lg:mt-8">
                {/* Person Add Icon */}
                <div className="text-[#B7FF1E] mb-4 lg:flex lg:justify-end">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2 lg:text-3xl">Add your members</h2>
                <p className="text-[#c3c8be] text-sm lg:text-base leading-relaxed pr-2 lg:pr-0 lg:max-w-sm lg:ml-auto">
                  Create clear member profiles with the details your gym needs.
                </p>
              </div>
...
            {/* Step 2 */}
            <section className="relative pl-14 lg:pl-20 mb-16 lg:mb-0">
              {/* Number Badge */}
              <div className="absolute left-0 lg:left-0 lg:-translate-x-1/2 top-1 lg:top-8 w-10 h-10 rounded-full bg-[#121411] border-2 border-[#d5ff40] flex items-center justify-center shadow-[0_0_20px_2px_rgba(213,255,64,0.15)] z-10">
                <span className="text-[#d5ff40] font-bold text-lg">02</span>
              </div>
              <div className="mb-6 lg:mt-8">
                {/* Calendar Icon */}
                <div className="text-[#B7FF1E] mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect height="18" rx="2" ry="2" width="18" x="3" y="4"></rect>
                    <line x1="16" x2="16" y1="2" y2="6"></line>
                    <line x1="8" x2="8" y1="2" y2="6"></line>
                    <line x1="3" x2="21" y1="10" y2="10"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2 lg:text-3xl">Record daily attendance</h2>
                <p className="text-[#c3c8be] text-sm lg:text-base leading-relaxed pr-2 lg:pr-0 lg:max-w-sm">
                  Mark check-ins in seconds and spot missed visits immediately.
                </p>
              </div>
              {/* UI Mockup Card 2 */}
              <div className="bg-[#1e201d] rounded-2xl border border-[#B7FF1E] shadow-[0_0_15px_rgba(183,255,30,0.3)] overflow-hidden">
                {/* Card Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-[#c3c8be] text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect height="18" rx="2" ry="2" width="18" x="3" y="4"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    <span>16 May 2025</span>
                  </div>
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {/* Card Body */}
                <div className="p-4 space-y-4">
                  {/* Attendance Item Checked */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#121411] border border-white/10 flex items-center justify-center text-[#d5ff40] font-medium text-sm">AT</div>
                      <div className="h-2 w-16 bg-white/20 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#c3c8be]">07:12</span>
                      <div className="w-8 h-8 rounded-md border border-[#d5ff40] flex items-center justify-center bg-[#d5ff40]/10">
                        <svg className="w-5 h-5 text-[#d5ff40]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Attendance Item Checked */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#121411] border border-white/10 flex items-center justify-center text-[#d5ff40] font-medium text-sm">RK</div>
                      <div className="h-2 w-16 bg-white/20 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#c3c8be]">07:08</span>
                      <div className="w-8 h-8 rounded-md border border-[#d5ff40] flex items-center justify-center bg-[#d5ff40]/10">
                        <svg className="w-5 h-5 text-[#d5ff40]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Attendance Item Unchecked */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#121411] border border-white/10 flex items-center justify-center text-[#d5ff40] font-medium text-sm opacity-50">JM</div>
                      <div className="h-2 w-14 bg-white/10 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/20">—</span>
                      <div className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center bg-[#121411]">
                        <div className="w-3 h-0.5 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </section>

      {/* Continuation: Collect with Confidence Section */}
      <section className="relative py-24 lg:py-48 bg-[#000000] overflow-hidden border-t border-white/5">
        {/* Background Effects matching the provided code */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80">
            <svg className="absolute -top-20 -right-20 w-[400px] h-[400px] opacity-40" viewBox="0 0 100 100">
              <circle cx="100" cy="0" fill="none" r="40" stroke="#B7FF1E" strokeWidth="0.2"></circle>
              <circle cx="100" cy="0" fill="none" r="60" stroke="#B7FF1E" strokeWidth="0.1"></circle>
              <circle cx="100" cy="0" fill="none" r="80" stroke="#B7FF1E" strokeWidth="0.05"></circle>
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 w-80 h-80">
            <svg className="absolute -bottom-20 -left-20 w-[400px] h-[400px] opacity-40" viewBox="0 0 100 100">
              <circle cx="0" cy="100" fill="none" r="40" stroke="#B7FF1E" strokeWidth="0.2"></circle>
              <circle cx="0" cy="100" fill="none" r="60" stroke="#B7FF1E" strokeWidth="0.1"></circle>
              <circle cx="0" cy="100" fill="none" r="80" stroke="#B7FF1E" strokeWidth="0.05"></circle>
            </svg>
          </div>
        </div>

        <main className="max-w-md lg:max-w-7xl mx-auto relative pt-12 pb-24 px-4 translate-x-8 lg:translate-x-0">
          {/* Timeline line connecting only points 03 and 04 */}
          <div className="absolute left-[0.25rem] lg:left-1/2 lg:-translate-x-1/2 top-[290px] lg:top-[380px] bottom-16 w-[2px] bg-[#B7FF1E] z-0 shadow-[0_0_10px_#B7FF1E]"></div>

          {/* BEGIN: Header Section */}
          <header className="relative z-10 mb-12 lg:mb-24 flex flex-col items-center px-6 -translate-x-8 lg:translate-x-0">
            {/* Pill Badge */}
            <div className="inline-flex items-center justify-center px-6 py-2 rounded-full border border-[#B7FF1E]/50 bg-[#0F1115]/80 backdrop-blur-sm mb-6 text-[10px] font-bold tracking-[0.2em] text-[#B7FF1E] uppercase shadow-[0_0_15px_rgba(183,255,30,0.2)]">
              Keep the day moving
            </div>
            {/* Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-4 tracking-tight text-white text-center">
              Collect with <br />
              <span className="text-[#B7FF1E] drop-shadow-[0_0_15px_rgba(183,255,30,0.6)]">confidence.</span>
            </h1>
            {/* Subheadline */}
            <p className="text-[#c3c8be] text-base lg:text-xl font-medium leading-relaxed pr-0 text-center lg:max-w-2xl">
              Follow every membership payment and understand how your gym is performing.
            </p>
          </header>

          {/* BEGIN: Main Content Area (Cards & Timeline) */}
          <div className="relative pr-8 pl-12 lg:grid lg:grid-cols-2 lg:gap-x-24 lg:gap-y-32 lg:pr-0 lg:pl-0">

            
            {/* BEGIN: Card 03 (Track every payment) */}
            <div className="relative mb-16 lg:mb-0 lg:text-right lg:pr-20">
              {/* Step Number */}
              <div className="absolute left-[-78px] lg:left-full lg:ml-[-20px] lg:-translate-x-1/2 top-[-8px] w-10 h-10 rounded-full bg-[#0F1115] border-2 border-[#B7FF1E] flex items-center justify-center text-[#B7FF1E] font-bold text-base z-20 shadow-[0_0_15px_rgba(183,255,30,0.6),inset_0_0_10px_rgba(183,255,30,0.2)]">
                03
              </div>

              <div className="bg-gradient-to-br from-[#111317] to-black rounded-[20px] border border-[#B7FF1E] p-6 relative z-10 shadow-[0_0_20px_rgba(183,255,30,0.2)]">
                {/* Card Header */}
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 rounded-xl border border-[#B7FF1E]/40 flex items-center justify-center bg-[#16191D]/50 shadow-[0_0_15px_rgba(183,255,30,0.15)] shrink-0 mr-4">
                    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <rect height="14" rx="2" stroke="#B7FF1E" strokeWidth="1.5" width="20" x="2" y="5"></rect>
                      <path d="M2 10H22" stroke="#B7FF1E" strokeWidth="1.5"></path>
                      <rect fill="#B7FF1E" height="2" rx="0.5" width="4" x="6" y="14"></rect>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Track every payment</h2>
                    <p className="text-sm text-gray-400 leading-tight">See collected fees, pending renewals, and overdue memberships at a glance.</p>
                  </div>
                </div>
                {/* Status List */}
                <div className="space-y-3">
                  {/* Paid Row */}
                  <div className="bg-[#1C2026] rounded-xl p-4 flex items-center border border-white/5">
                    <div className="w-3 h-3 rounded-full bg-[#B7FF1E] shadow-[0_0_8px_#B7FF1E] mr-3"></div>
                    <span className="text-white font-medium text-sm w-20">Paid</span>
                    <div className="flex-1 flex gap-2">
                      <div className="h-2 bg-gray-700/50 rounded-full w-16"></div>
                      <div className="h-2 bg-gray-700/50 rounded-full w-10"></div>
                    </div>
                    <div className="h-3 bg-[#B7FF1E] rounded-full w-12 shadow-[0_0_10px_#B7FF1E]"></div>
                  </div>
                  {/* Pending Row */}
                  <div className="bg-[#1C2026] rounded-xl p-4 flex items-center border border-yellow-500/20 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] mr-3"></div>
                    <span className="text-white font-medium text-sm w-20">Pending</span>
                    <div className="flex-1 flex gap-2">
                      <div className="h-2 bg-gray-700/50 rounded-full w-12"></div>
                      <div className="h-2 bg-gray-700/50 rounded-full w-8"></div>
                    </div>
                    <div className="h-3 bg-yellow-400 rounded-full w-12 shadow-[0_0_10px_rgba(250,204,21,0.6)]"></div>
                  </div>
                  {/* Overdue Row */}
                  <div className="bg-[#1C2026] rounded-xl p-4 flex items-center border border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] mr-3"></div>
                    <span className="text-white font-medium text-sm w-20">Overdue</span>
                    <div className="flex-1 flex gap-2">
                      <div className="h-2 bg-gray-700/50 rounded-full w-14"></div>
                      <div className="h-2 bg-gray-700/50 rounded-full w-8"></div>
                    </div>
                    <div className="h-3 bg-red-400 rounded-full w-12 shadow-[0_0_10px_rgba(248,113,113,0.6)]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* BEGIN: Card 04 (Review your revenue) */}
            <div className="relative lg:pl-20">
              {/* Step Number */}
              <div className="absolute left-[-78px] lg:left-0 lg:-translate-x-1/2 top-[-8px] w-10 h-10 rounded-full bg-[#0F1115] border-2 border-[#B7FF1E] flex items-center justify-center text-[#B7FF1E] font-bold text-base z-20 shadow-[0_0_15px_rgba(183,255,30,0.6),inset_0_0_10px_rgba(183,255,30,0.2)]">
                04
              </div>

              <div className="bg-gradient-to-br from-[#111317] to-black rounded-[20px] border border-[#B7FF1E] p-6 relative z-10 shadow-[0_0_20px_rgba(183,255,30,0.2)]">
                {/* Card Header */}
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 rounded-xl border border-[#B7FF1E]/40 flex items-center justify-center bg-[#16191D]/50 shadow-[0_0_15px_rgba(183,255,30,0.15)] shrink-0 mr-4">
                    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <rect height="6" rx="1" stroke="#B7FF1E" strokeWidth="1.5" width="4" x="4" y="14"></rect>
                      <rect height="10" rx="1" stroke="#B7FF1E" strokeWidth="1.5" width="4" x="10" y="10"></rect>
                      <rect height="16" rx="1" stroke="#B7FF1E" strokeWidth="1.5" width="4" x="16" y="4"></rect>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Review your revenue</h2>
                    <p className="text-sm text-gray-400 leading-tight">Use a clear monthly view to make better decisions for your gym.</p>
                  </div>
                </div>
                {/* Charts Area */}
                <div className="flex gap-4 mb-4">
                  {/* Bar Chart Block */}
                  <div className="flex-1 bg-[#1C2026] border border-white/5 rounded-xl p-4 flex flex-col justify-end h-32 relative overflow-hidden">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="w-full h-px bg-gray-500"></div>
                      <div className="w-full h-px bg-gray-500"></div>
                      <div className="w-full h-px bg-gray-500"></div>
                    </div>
                    {/* Bars */}
                    <div className="flex items-end justify-between gap-1.5 h-20 relative z-10">
                      <div className="w-full bg-gray-700/50 rounded-t-sm h-[30%]"></div>
                      <div className="w-full bg-gray-700/50 rounded-t-sm h-[50%]"></div>
                      <div className="w-full bg-lime-500 rounded-t-sm h-[80%] shadow-[0_0_10px_rgba(132,204,22,0.4)]"></div>
                      <div className="w-full bg-gray-700/50 rounded-t-sm h-[40%]"></div>
                      <div className="w-full bg-gray-700/50 rounded-t-sm h-[60%]"></div>
                      <div className="w-full bg-[#B7FF1E] rounded-t-sm h-[100%] shadow-[0_0_15px_#B7FF1E]"></div>
                      <div className="w-full bg-gray-700/50 rounded-t-sm h-[45%]"></div>
                    </div>
                  </div>
                  {/* Donut Chart Block */}
                  <div className="w-24 bg-[#1C2026] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                    <div className="relative w-12 h-12">
                      <svg className="w-full h-full drop-shadow-[0_0_8px_#B7FF1E]" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" fill="none" r="16" stroke="#1F2937" strokeWidth="4"></circle>
                        <circle cx="18" cy="18" fill="none" r="16" stroke="#B7FF1E" strokeDasharray="75 100" strokeLinecap="round" strokeWidth="4" transform="rotate(-90 18 18)"></circle>
                      </svg>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B7FF1E]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    </div>
                  </div>
                </div>
                {/* Bottom Mini Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#1C2026] border border-white/5 rounded-xl p-3">
                      <div className="w-full h-2 bg-gray-700/50 rounded-full mb-2"></div>
                      <div className="w-2/3 h-1.5 bg-gray-700/30 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


        </main>
      </section>



      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#121411] text-[#e3e3dd] border-t border-white/5">
        <div className="max-w-[480px] lg:max-w-7xl mx-auto px-6">
          <header className="flex flex-col gap-2 mb-12 lg:mb-20 lg:text-center">
            <span className="text-[11px] font-semibold text-[#858A7D] uppercase tracking-[0.2em]">Pricing</span>
            <h2 className="text-3xl md:text-6xl font-bold text-white leading-tight">
              Simple plans.<br/>
              Built for your <span className="text-[#B7FF1E]">gym.</span>
            </h2>
            <p className="text-sm lg:text-xl text-[#858A7D] mt-2 leading-relaxed lg:max-w-2xl lg:mx-auto">
              Choose the plan that fits your gym today, then grow when you are ready.
            </p>
          </header>

          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:max-w-5xl lg:mx-auto gap-4 lg:gap-8">
            {/* Basic Card */}
            <div className="bg-[#1e201d] rounded-2xl p-6 border border-white/5 relative overflow-hidden transition-all duration-300 hover:border-[#B7FF1E]/30">
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-white">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₹999</span>
                  <span className="text-xs text-[#858A7D]">/ month</span>
                </div>
                <p className="text-xs text-[#858A7D] border-b border-white/5 pb-4">
                  The essentials for a well-run gym.
                </p>
                <ul className="flex flex-col gap-3 pt-2">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#B7FF1E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-sm text-white">Attendance management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#B7FF1E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-sm text-white">Payment integration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#B7FF1E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-sm text-white">Up to 100 members</span>
                  </li>
                </ul>
                <button className="w-full h-12 rounded-full border border-[#B7FF1E] text-[#B7FF1E] text-xs font-bold mt-4 transition-all hover:bg-[#B7FF1E]/10 active:scale-[0.98]">
                  Choose Basic
                </button>
              </div>
            </div>

            {/* Standard Card */}
            <div className="bg-[#1e201d] rounded-2xl p-6 border-2 border-[#B7FF1E] relative overflow-hidden shadow-[0_0_30px_rgba(183,255,30,0.15)] transition-all duration-300">
              <div className="flex flex-col gap-4">
                <div className="bg-[#B7FF1E] text-[#293500] text-[10px] font-black px-3 py-1 rounded-full w-max mb-2 tracking-wider">
                  MOST POPULAR
                </div>
                <h3 className="text-xl font-bold text-white">Standard</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₹1,499</span>
                  <span className="text-xs text-[#858A7D]">/ month</span>
                </div>
                <p className="text-xs text-[#858A7D] border-b border-white/5 pb-4">
                  More room to grow, with support when you need it.
                </p>
                <ul className="flex flex-col gap-3 pt-2">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#B7FF1E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-sm text-white">Everything in Basic</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#B7FF1E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-sm text-white">Up to 500 members</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#B7FF1E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-sm text-white">Fee reminders for members</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#B7FF1E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-sm text-white">Priority support</span>
                  </li>
                </ul>
                <button className="w-full h-12 rounded-full bg-[#B7FF1E] text-[#293500] text-xs font-bold mt-4 transition-all hover:bg-[#83A51B] active:scale-[0.98] shadow-[0_0_15px_rgba(183,255,30,0.3)]">
                  Choose Standard
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xs text-[#858A7D]">
              Change your plan whenever your gym needs change.
            </p>
          </div>
        </div>
      </section>

      {/* CTA & Contact */}
      <section id="contact" className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1e201d] border border-[#B7FF1E]/20 rounded-[32px] p-8 md:p-16 relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#B7FF1E]/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#B7FF1E]/5 blur-[100px] rounded-full" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter leading-[1.1]">
                    Ready to run a <br />
                    <span className="text-[#B7FF1E]">better gym?</span>
                  </h2>
                  <p className="text-lg text-[#858A7D] mb-10 max-w-md leading-relaxed">
                    Join the gyms that choose clarity over chaos. Start your journey with Gymnion today.
                  </p>
                </motion.div>

                <div className="space-y-6">
                  <motion.a 
                    href="mailto:surya.17155@gmail.com"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#B7FF1E]/10 flex items-center justify-center group-hover:bg-[#B7FF1E] transition-all duration-300">
                      <svg className="w-5 h-5 text-[#B7FF1E] group-hover:text-[#293500]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#858A7D] font-bold">Email us</p>
                      <p className="text-white font-medium">surya.17155@gmail.com</p>
                    </div>
                  </motion.a>

                  <motion.a 
                    href="tel:+919389903074"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#B7FF1E]/10 flex items-center justify-center group-hover:bg-[#B7FF1E] transition-all duration-300">
                      <svg className="w-5 h-5 text-[#B7FF1E] group-hover:text-[#293500]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#858A7D] font-bold">Call us</p>
                      <p className="text-white font-medium">+91 9389903074</p>
                    </div>
                  </motion.a>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-black/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl"
              >
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#858A7D] font-bold ml-1">Name</label>
                      <input type="text" placeholder="Your Name" className="w-full bg-[#181D19] border border-white/5 rounded-xl p-3 text-white focus:border-[#B7FF1E] outline-none text-sm transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#858A7D] font-bold ml-1">Email</label>
                      <input type="email" placeholder="work@gym.com" className="w-full bg-[#181D19] border border-white/5 rounded-xl p-3 text-white focus:border-[#B7FF1E] outline-none text-sm transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#858A7D] font-bold ml-1">Gym Name</label>
                    <input type="text" placeholder="The Iron Hub" className="w-full bg-[#181D19] border border-white/5 rounded-xl p-3 text-white focus:border-[#B7FF1E] outline-none text-sm transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#858A7D] font-bold ml-1">Message</label>
                    <textarea placeholder="Tell us about your needs..." rows={3} className="w-full bg-[#181D19] border border-white/5 rounded-xl p-3 text-white focus:border-[#B7FF1E] outline-none text-sm transition-all resize-none"></textarea>
                  </div>
                  <button className="w-full py-4 rounded-xl bg-[#B7FF1E] text-[#293500] font-bold hover:bg-[#83A51B] transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(183,255,30,0.15)] mt-2">
                    Send message
                  </button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="pb-12 pt-0 text-[#858A7D]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] uppercase tracking-widest font-bold">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <img src={logoAsset.url} alt="Gymnion" className="h-4 opacity-50" />
                <span className="opacity-50">Gymnion</span>
              </div>
              <span className="opacity-30 tracking-normal">© 2026</span>
            </div>
            <div className="flex gap-8">
              <a href="#features" className="hover:text-[#B7FF1E] transition-colors">Features</a>
              <a href="#pricing" className="hover:text-[#B7FF1E] transition-colors">Pricing</a>
              <a href="#about" className="hover:text-[#B7FF1E] transition-colors">About</a>
              <a href="#contact" className="hover:text-[#B7FF1E] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

