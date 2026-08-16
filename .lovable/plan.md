# GymSync Build Plan (Gymnion)

## Overview
A mobile-first gym management platform with multi-role dashboards (Super Admin, Gym Admin, Member), QR-based attendance, and automated revenue tracking.

## Technology Stack
- **Frontend**: TanStack Start v1 (React 19, Vite 7)
- **Styling**: Tailwind CSS v4
- **Backend/Database**: Lovable Cloud (Supabase)
- **Auth**: Supabase Auth (Google + Email/Gym Code)
- **Payments**: Razorpay integration (proposed)
- **Integrations**: Google Sheets for attendance backups

## Desktop Optimization Strategy
The goal is to enhance the landing page for desktop users without compromising the mobile experience.

### 1. Navigation
- Standardize the sticky capsule navigation for wider screens.
- Ensure proper spacing and hover states.

### 2. Hero Section
- Scale the background image parallax effect for larger viewports.
- Optimize typography (`text-[clamp(...)]`) for desktop readability.
- Reposition the Revenue Card overlay for a balanced composition (potentially shifting it to the right side on desktop while keeping the text on the left).

### 3. Features Section
- Utilize the `lg:flex-row` layout more effectively.
- Ensure the sticky header on desktop feels natural and doesn't overlap content.
- Increase the scale of mockups/cards for desktop view.

### 4. "How It Works" & "Collect with Confidence"
- Adjust the timeline layout for desktop. On mobile, it's a single vertical column. On desktop, we can expand the width and refine the alignment of the 01-04 markers.
- Fix the `translate-x` and `left` offsets that were specifically tuned for mobile.
- Use `lg:grid` where appropriate to place text and mockups side-by-side.

### 5. Pricing Section
- Change from a single column vertical stack to a side-by-side `lg:grid-cols-2` layout for the Basic and Standard plans.
- Center the pricing section on the screen for desktop users.

## Implementation Steps
1. **Analyze existing breakpoints**: Review current `md:` and `lg:` classes in `src/routes/index.tsx`.
2. **Apply Desktop-specific styles**:
   - Hero: Adjust layout to a 2-column feel on `lg:`.
   - Features: Refine the side-by-side layout.
   - Timeline: Correct marker positions for wide screens using `lg:` specific offsets.
   - Pricing: Transition to grid layout.
3. **Validation**: Test responsiveness across multiple viewports.
