import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GymSync | Pulse AI Gym" },
      { name: "description", content: "Design system preview for GymSync platform." },
      { property: "og:title", content: "GymSync | Pulse AI Gym" },
      { property: "og:description", content: "Design system preview for GymSync platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell title="GymSync Preview">
      <div className="space-y-8 pt-4 relative z-10">
        {/* Hero Section */}
        <section className="bg-gym-accent rounded-2xl p-6 text-primary overflow-hidden relative group">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold leading-tight mb-2">Build your best self with AI.</h2>
            <p className="text-sm font-medium mb-4 opacity-90">Personalized plans that evolve with your performance.</p>
            <button className="bg-primary text-gym-accent px-5 py-2.5 rounded-pill text-sm font-bold flex items-center gap-2 group-hover:scale-105 transition-transform">
              Start Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-full opacity-20 pointer-events-none">
             <svg viewBox="0 0 100 100" fill="currentColor"><circle cx="80" cy="50" r="40" /></svg>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard label="Steps" value="8,432" unit="steps" progress={0.7} />
          <StatCard label="Calories" value="1,240" unit="kcal" progress={0.5} />
          <StatCard label="Heart" value="72" unit="bpm" progress={0.4} pulse />
        </section>

        {/* Phase Section - The target of the visual edit */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Phase</h3>
          <div className="bg-gym-surface-raised rounded-xl p-5 border border-white/5 shadow-xl">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              Enable Lovable Cloud. Then in a single migration, create the complete database schema for GymSync.

              {"\n\n"}Tables (all with RLS enabled):
              {"\n\n"}1. user_roles: id (uuid PK, refs auth.users), role (enum: super_admin, gym_admin, member), gym_id (uuid, nullable, refs gyms), created_at
              {"\n\n"}2. gyms: id (uuid PK), name (text, required), address (text), phone (text), owner_user_id (uuid, refs auth.users), status (enum: pending, approved, suspended, default pending), razorpay_account_id (text, nullable), subscription_tier (text, default 'standard'), created_at, approved_at (nullable), approved_by (nullable)
              {"\n\n"}3. gym_admins: id (uuid PK), gym_id (uuid FK refs gyms), user_id (uuid refs auth.users), created_at
              {"\n\n"}4. fee_plans: id (uuid PK), gym_id (uuid FK), name (text, required), amount_paise (integer, >0), description (text), is_active (boolean, default true), created_at
              {"\n\n"}5. members: id (uuid PK), gym_id (uuid FK), user_id (uuid, nullable, refs auth.users — null until invite accepted), full_name (text, required), phone (text, required), email (text, required), photo_url (text, nullable), fee_plan_id (uuid, nullable, refs fee_plans), status (enum: invited, active, inactive, default invited), join_date (date, default CURRENT_DATE), invite_token (uuid, nullable), invite_expires_at (timestamptz, nullable), deleted_at (timestamptz, nullable), created_at. UNIQUE(gym_id, email), UNIQUE(gym_id, phone).
              {"\n\n"}6. attendance: id (uuid PK), gym_id (uuid FK), member_id (uuid FK), check_in_at (timestamptz, default now()), check_out_at (timestamptz, nullable), source (enum: qr, manual, default qr), created_at. Index on (member_id, check_in_at).
              {"\n\n"}7. attendance_audit: id (bigserial PK), attendance_id (uuid FK), actor_id (uuid refs auth.users), action (text), before (jsonb), after (jsonb), created_at.
              {"\n\n"}8. payments: id (uuid PK), gym_id (uuid FK), member_id (uuid FK), fee_month (date, first day of month), amount_paise (integer), status (enum: pending, paid, failed, refunded, default pending), source (enum: razorpay, manual, default razorpay), razorpay_order_id (text, nullable), razorpay_payment_id (text, nullable), payment_method (text, nullable), paid_at (timestamptz, nullable), recorded_by (uuid, nullable, refs auth.users), note (text, nullable), created_at. Index on (member_id, fee_month). UNIQUE index on razorpay_payment_id WHERE NOT NULL.

              {"\n\n"}Security-definer function: has_role(check_user_id uuid, check_role text) returns boolean.
              {"\n\n"}RLS policies:
              {"\n\n"}- user_roles: a user can SELECT their own row only
              {"\n\n"}- gyms: SELECT allowed if user is super_admin OR user has gym_admin role for that gym_id; UPDATE allowed only for that gym's admin
              {"\n\n"}- fee_plans, members, attendance, payments: SELECT/INSERT/UPDATE/DELETE allowed only for the gym_admin whose role has the matching gym_id; members can SELECT their own row in members table
              {"\n\n"}- Super Admin has NO SELECT policy on members, attendance, or payments (cannot read PII)

              {"\n\n"}Grant table-level permissions to authenticated role. Add updated_at trigger to all tables.
              {"\n\n"}After the migration runs, show me the schema in the Lovable Cloud UI and confirm RLS is enabled on every table.
            </p>
          </div>
        </section>

        {/* Buttons & Primitives */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">UI Primitives</h3>
          <div className="space-y-3">
            <button className="w-full bg-gym-accent text-primary h-12 rounded-pill font-bold hover:bg-gym-accent-bright transition-colors shadow-[0_8px_20px_rgba(213,255,64,0.2)]">
              Primary Button
            </button>
            <button className="w-full bg-gym-surface-raised text-gym-accent h-12 rounded-pill font-bold border border-white/5 hover:bg-gym-surface-muted transition-colors">
              Secondary Button
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gym-accent text-primary rounded-pill text-[10px] font-bold">ACTIVE</span>
            <span className="px-3 py-1 bg-gym-surface-raised text-muted-foreground rounded-pill text-[10px] font-bold border border-white/5">COMPLETED</span>
            <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-pill text-[10px] font-bold border border-destructive/20">ALERT</span>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Input field..." 
              className="w-full h-12 bg-gym-surface-raised rounded-md px-4 border border-white/5 text-sm focus:outline-none focus:border-gym-accent/50 transition-colors placeholder:text-subtle text-foreground"
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Workouts</h3>
             <button className="text-[10px] font-bold text-gym-accent hover:underline">VIEW ALL</button>
           </div>
           
           <div className="space-y-3">
             <WorkoutItem title="Leg Day Intensity" duration="45 min" intensity="High" />
             <WorkoutItem title="HIIT Cardio Blast" duration="30 min" intensity="Moderate" />
           </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, unit, progress, pulse = false }: { label: string; value: string; unit: string; progress: number; pulse?: boolean }) {
  return (
    <div className="bg-card rounded-md p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gym-surface-muted" />
          <circle 
            cx="24" 
            cy="24" 
            r="20" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="transparent" 
            strokeDasharray={125.6} 
            strokeDashoffset={125.6 * (1 - progress)} 
            className="text-gym-accent" 
          />
        </svg>
        {pulse && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-destructive rounded-full animate-ping" />
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-foreground">{value}</div>
        <div className="text-[8px] font-medium text-muted-foreground">{unit}</div>
      </div>
    </div>
  );
}

function WorkoutItem({ title, duration, intensity }: { title: string; duration: string; intensity: string }) {
  return (
    <div className="bg-gym-surface-raised rounded-md p-4 flex items-center justify-between border border-white/5 hover:bg-gym-surface-muted transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gym-accent/10 flex items-center justify-center text-gym-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6.5 6.5 11 11"/><path d="m21 21-1.5-1.5"/><path d="m3 3 1.5 1.5"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground group-hover:text-gym-accent transition-colors">{title}</h4>
          <p className="text-[10px] font-medium text-muted-foreground">{duration} • {intensity} Intensity</p>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </div>
  );
}
