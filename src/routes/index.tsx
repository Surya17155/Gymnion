import { motion, useScroll, useTransform } from "framer-motion";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAuthUserRole } from "@/lib/auth.functions";
import logoAsset from "@/assets/gymnion-logo.png.asset.json";

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

  return (
    <div className="min-h-screen bg-[#101311] text-[#F8FAF7]">
      {/* Sticky Nav */}
      <motion.nav 
        style={{ backgroundColor: navBackground }}
        className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent hover:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <img src={logoAsset.url} alt="Gymnion" className="h-10" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#AAB2AA]">
            <a href="#features" className="hover:text-[#C8FF38]">Features</a>
            <a href="#pricing" className="hover:text-[#C8FF38]">Pricing</a>
            <a href="#about" className="hover:text-[#C8FF38]">About</a>
            <a href="#contact" className="hover:text-[#C8FF38]">Contact</a>
            <Link to="/auth/login" className="bg-[#C8FF38] text-[#101311] px-6 py-2.5 rounded-full font-bold hover:bg-[#B6F028]">
              Get Started
            </Link>
          </div>
          <button className="md:hidden text-[#F8FAF7]">
            <Menu />
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#101311] z-20" />
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
            alt="Gym training" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-6xl md:text-8xl font-black mb-6"
          >
            Run the gym<br />your members love.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl md:text-2xl text-[#AAB2AA] mb-10 max-w-2xl mx-auto"
          >
            Gymnion brings members, classes, payments, and everyday operations into one clear workspace.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth/login" className="bg-[#C8FF38] text-[#101311] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#B6F028]">
              Get Started
            </Link>
            <a href="#features" className="flex items-center gap-2 text-[#F8FAF7] font-medium">
              Explore features <ArrowRight size={20} />
            </a>
          </motion.div>
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

      {/* Features placeholder - to be built out */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl font-black mb-16 text-center">Everything your gym needs to keep moving.</h2>
      </section>
    </div>
  );
}
