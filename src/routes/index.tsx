import { motion, useScroll, useTransform } from "framer-motion";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAuthUserRole } from "@/lib/auth.functions";
import logoAsset from "@/assets/gymnion-logo-new.png.asset.json";
import heroBgAsset from "@/assets/landing-bg-new.png.asset.json";
import { TextReveal } from "@/components/ui/text-reveal-animation";
import featuresBgAsset from "@/assets/features-bg.png.asset.json";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const role = await getAuthUserRole();
      if (role === 'super_admin') throw redirect({ to: '/dashboard/super-admin' });
      if (role === 'admin' || role === 'gym_admin') throw redirect({ to: '/dashboard/admin' });
      if (role === 'member') throw redirect({ to: '/dashboard/m' });
    }
  },
  component: LandingPage,
});

function LandingPage() {
  const { scrollY } = useScroll();
  const navBackground = useTransform(scrollY, [0, 100], ["rgba(16, 19, 17, 0)", "rgba(16, 19, 17, 0.95)"]);
  const bgY = useTransform(scrollY, [0, 500], [0, -50]);

  // Metric props (would come from CMS or API in real app)
  const monthLabel = "This month";
  const monthlyRevenue = "₹1,84,500";
  const feeCollectionRate = "86%";

  return (
    <div className="min-h-screen bg-[#101311] text-[#F8FAF7] overflow-x-hidden">
      {/* Sticky Nav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
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
      <section className="relative min-h-[100svh] flex flex-col pt-24 overflow-hidden">

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
          <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay for contrast */}
        </motion.div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col flex-1 px-6 max-w-7xl mx-auto w-full pt-8 md:pt-16">
          <div className="max-w-[800px]">
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="text-[clamp(2.8rem,10vw,4.5rem)] font-bold leading-[1.05] mb-4 tracking-tighter">
                Run your gym <br />
                with <span className="text-[#C8FF38] inline-block"><TextReveal word="clarity." /></span>
              </h1>
            </motion.div>

            <motion.p 
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="text-base md:text-lg text-[#AAB2AA] mb-4 max-w-[320px] leading-snug"
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
              {/* Top Section */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex flex-col">
                  <span className="text-[#A0A0A0] text-[13px] font-medium mb-1 tracking-wide uppercase">This month</span>
                  <h2 className="text-4xl font-bold tracking-tight text-[#F8FAF7]">₹1,84,500</h2>
                </div>
                {/* Circular Progress Ring */}
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

              {/* Divider */}
              <div className="h-[1px] bg-white/10 w-full mb-5" />

              {/* Bottom Section */}
              <div className="flex justify-between items-end h-[70px]">
                {/* Left: Bar Chart */}
                <div className="flex items-end space-x-2.5 h-full pb-1">
                  <div className="w-5 h-[30%] bg-gradient-to-t from-[#D5FF40]/20 to-[#D5FF40] rounded-sm opacity-80"></div>
                  <div className="w-5 h-[60%] bg-gradient-to-t from-[#D5FF40]/20 to-[#D5FF40] rounded-sm opacity-90"></div>
                  <div className="w-5 h-[90%] bg-gradient-to-t from-[#D5FF40]/20 to-[#D5FF40] rounded-sm shadow-[0_0_15px_rgba(213,255,64,0.3)]"></div>
                </div>
                
                {/* Right: Linear Progress */}
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
          <div className="relative z-10 w-full px-6 max-w-7xl mx-auto pb-12 md:pb-20 mt-auto">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="flex justify-center md:justify-start"
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


      {/* Trust Strip */}
      <section className="bg-[#F4F6F1] py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-[#151916]">
          {["Member-first operations", "Payments in one place", "Clear daily visibility"].map((point) => (
            <div key={point} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#C8FF38]/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#C8FF38]" />
              </div>
              <span className="font-bold text-lg">{point}</span>
            </div>
          ))}
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
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit">
              <h2 className="text-5xl font-black leading-tight mb-6">Everything your gym needs to keep moving.</h2>
              <p className="text-xl text-[#AAB2AA]">A focused system for the work that happens before, during, and after every class.</p>
            </div>
            
            <div className="lg:w-2/3 space-y-24">

            {/* Feature A */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-8 bg-[#181D19]">
                <img 
                  src="https://images.unsplash.com/photo-1571902251103-d71b5633faa7?q=80&w=2070&auto=format&fit=crop" 
                  alt="Class scheduling" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-3xl font-bold mb-4">Class scheduling</h3>
              <p className="text-xl text-[#AAB2AA]">Publish sessions, manage capacity, and keep trainers and members in sync.</p>
            </motion.div>

            {/* Feature B */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#181D19] p-12 rounded-2xl border border-white/5"
            >
              <h3 className="text-3xl font-bold mb-4">Member management</h3>
              <p className="text-xl text-[#AAB2AA] mb-12">See every member’s activity, membership status, notes, and next action in one profile.</p>
              <div className="h-64 rounded-xl bg-[#101311] border border-white/10 p-6 flex flex-col gap-4 overflow-hidden relative">
                <div className="flex items-center gap-4 opacity-40">
                  <div className="w-10 h-10 rounded-full bg-[#181D19]" />
                  <div className="space-y-2">
                    <div className="w-32 h-3 bg-[#181D19] rounded" />
                    <div className="w-20 h-2 bg-[#181D19] rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[#C8FF38]/10 border border-[#C8FF38]/20 translate-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#C8FF38]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#C8FF38]" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-40 h-3 bg-[#C8FF38]/30 rounded" />
                    <div className="w-24 h-2 bg-[#C8FF38]/20 rounded" />
                  </div>
                  <div className="ml-auto px-3 py-1 rounded-full bg-[#C8FF38] text-[#101311] text-[10px] font-bold">ACTIVE</div>
                </div>
                <div className="flex items-center gap-4 opacity-40">
                  <div className="w-10 h-10 rounded-full bg-[#181D19]" />
                  <div className="space-y-2">
                    <div className="w-28 h-3 bg-[#181D19] rounded" />
                    <div className="w-36 h-2 bg-[#181D19] rounded" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature C & D */}
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="aspect-square rounded-2xl bg-[#C8FF38] p-12 mb-8 flex flex-col justify-end text-[#101311]">
                   <div className="w-16 h-1 bg-[#101311]/20 mb-6" />
                   <h3 className="text-3xl font-black mb-4">Payments that stay on track</h3>
                </div>
                <p className="text-lg text-[#AAB2AA]">Handle subscriptions, renewals, and payment status without chasing spreadsheets.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-8 bg-[#181D19]">
                  <img 
                    src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop" 
                    alt="Analytics" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-3xl font-bold mb-4">Your gym, visible at a glance</h3>
                <p className="text-lg text-[#AAB2AA]">Make better daily decisions with a clear view of attendance, activity, and revenue.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


















      {/* Product Journey */}
      <section className="py-24 bg-[#101311]">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-5xl font-black mb-6">From first check-in to lasting loyalty.</h2>
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar gap-8 px-6 md:px-[calc((100vw-1280px)/2+24px)] pb-12">
          {[
            { title: "Welcome members", desc: "Fast check-in and a clear member profile.", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070" },
            { title: "Fill every class", desc: "Schedules, capacity, and reminders.", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070" },
            { title: "Keep payments current", desc: "Transparent subscription status.", img: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070" },
            { title: "Grow with clarity", desc: "Operational insights for better decisions.", img: "https://images.unsplash.com/photo-1590233649088-e81e1b1ffecb?q=80&w=2070" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="flex-shrink-0 w-80 md:w-[400px] h-[500px] rounded-2xl overflow-hidden relative group"
            >
              <img src={item.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
                <h4 className="text-2xl font-bold mb-2">{item.title}</h4>
                <p className="text-[#AAB2AA]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#F4F6F1] text-[#151916]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black mb-8">Simple plans for every stage of growth.</h2>
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className="font-medium text-[#AAB2AA]">Monthly</span>
            <div className="w-14 h-8 bg-[#151916] rounded-full p-1 flex items-center cursor-pointer">
              <div className="w-6 h-6 bg-[#C8FF38] rounded-full" />
            </div>
            <span className="font-medium">Annual <span className="text-[#B6F028] ml-2">Save 20%</span></span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="p-10 rounded-2xl bg-white border border-[#151916]/5 flex flex-col items-start text-left">
              <h3 className="text-2xl font-bold mb-2">Basic</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">Rs. 999</span>
                <span className="text-[#AAB2AA]">/mo</span>
              </div>
              <ul className="space-y-4 mb-12 text-[#AAB2AA]">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Up to 100 members</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Attendance management</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Payment Management</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Email support</li>
              </ul>
              <button className="w-full py-4 rounded-full border-2 border-[#151916] font-bold mt-auto hover:bg-[#151916] hover:text-white transition-colors">Choose Basic</button>
            </div>

            <div className="p-10 rounded-2xl bg-[#101311] text-[#F8FAF7] border border-white/10 flex flex-col items-start text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-[#C8FF38] text-[#101311] text-xs font-black py-1.5 text-center">MOST POPULAR</div>
              <h3 className="text-2xl font-bold mb-2 mt-4">Pro</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">Rs. 1999</span>
                <span className="text-[#AAB2AA]">/mo</span>
              </div>
              <ul className="space-y-4 mb-12 text-[#AAB2AA]">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Up to 500 members</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Everything in Basic</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Automated reminders</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Priority Support</li>
              </ul>
              <button className="w-full py-4 rounded-full bg-[#C8FF38] text-[#101311] font-bold mt-auto hover:bg-[#B6F028] transition-colors">Start Pro</button>
            </div>

            <div className="p-10 rounded-2xl bg-white border border-[#151916]/5 flex flex-col items-start text-left">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">Custom</span>
              </div>
              <ul className="space-y-4 mb-12 text-[#AAB2AA]">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Unlimited members</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Custom branding</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> Dedicated account manager</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#C8FF38]" /> API Access</li>
              </ul>
              <button className="w-full py-4 rounded-full border-2 border-[#151916] font-bold mt-auto hover:bg-[#151916] hover:text-white transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Contact */}
      <footer className="py-24 bg-[#101311] text-[#AAB2AA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 mb-24">
            <div>
              <h2 className="text-5xl font-black text-[#F8FAF7] mb-8 leading-tight">Ready to run a better gym?</h2>
              <p className="text-xl mb-12">Tell us about your gym and we’ll help you choose the right starting point.</p>
              <div className="space-y-6 text-[#F8FAF7]">
                <p className="flex items-center gap-4 text-lg"><span className="w-6 h-[1px] bg-[#C8FF38]" /> hello@gymnion.com</p>
                <p className="flex items-center gap-4 text-lg"><span className="w-6 h-[1px] bg-[#C8FF38]" /> +91 98765 43210</p>
              </div>
            </div>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input type="text" placeholder="Name" className="w-full bg-[#181D19] border border-white/10 rounded-xl p-4 text-[#F8FAF7] focus:border-[#C8FF38] outline-none" />
                <input type="email" placeholder="Work email" className="w-full bg-[#181D19] border border-white/10 rounded-xl p-4 text-[#F8FAF7] focus:border-[#C8FF38] outline-none" />
              </div>
              <input type="text" placeholder="Gym name" className="w-full bg-[#181D19] border border-white/10 rounded-xl p-4 text-[#F8FAF7] focus:border-[#C8FF38] outline-none" />
              <textarea placeholder="Message" rows={4} className="w-full bg-[#181D19] border border-white/10 rounded-xl p-4 text-[#F8FAF7] focus:border-[#C8FF38] outline-none resize-none"></textarea>
              <button className="w-full py-4 rounded-full bg-[#C8FF38] text-[#101311] font-bold hover:bg-[#B6F028] transition-colors">Send message</button>
            </form>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
            <div className="flex items-center gap-4">
              <img src={logoAsset.url} alt="Gymnion" className="h-6 opacity-50" />
              <span>© 2026 Gymnion. All rights reserved.</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#F8FAF7]">Features</a>
              <a href="#" className="hover:text-[#F8FAF7]">Pricing</a>
              <a href="#" className="hover:text-[#F8FAF7]">About</a>
              <a href="#" className="hover:text-[#F8FAF7]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
