# Gymnion Subscription & Email Integration Plan

The goal is to provide Gym Administrators with a dedicated interface to manage their Gymnion platform subscription, view available plans, make payments via Razorpay, and receive email receipts upon successful transactions.

## User Interface Changes

### 1. Settings Panel Update
- Add a new "Subscription" tile to the `AdminSettings` page (`src/routes/dashboard/admin.settings/index.tsx`).
- This tile will lead to a new route `/dashboard/admin/subscription`.

### 2. New Subscription Management Screen
- Create `src/routes/dashboard/admin.subscription.tsx`.
- **Active Plan Display**: Show the current plan details (name, expiry date, status).
- **Plan Listing**: Fetch and display all active global plans created by the Super Admin.
- **Plan Details**: Allow admins to expand a plan to see its specific features (Member Limit, Attendance Management, etc.).
- **Subscribe/Upgrade Flow**:
    - Clicking "Subscribe" or "Change Plan" will open a confirmation dialog.
    - **Confirmation Dialog**: "Are you sure you want to proceed with the [Plan Name] subscription for ₹[Price]?" with **Cancel** and **Continue** buttons.
    - Clicking **Continue** will trigger the Razorpay payment modal.

### 3. Dashboard Cleanup
- Ensure the "Settings" button is removed from any dashboard tab bars if redundant.
- Confirm the profile icon dropdown correctly links to all management sections.
- Large greeting format: "Hi, {user_name}" with 40px font size as requested.

## Technical Implementation

### 1. Razorpay Integration Refinement
- Ensure `verifySubscriptionPayment` in `src/lib/payments.functions.ts` handles the transition between tiers correctly.
- Add metadata to the Razorpay order to facilitate receipt generation.

### 2. Email Receipt Integration
- Implement `sendPaymentReceiptEmail` server function.
- Since this is a TanStack Start app on Lovable Cloud, we'll use a server function that calls a mailing service (or a webhook like Make/Zapier if already configured, or Resend if a key is provided).
- The receipt will include: Gym Name, Plan Name, Amount Paid, Date, and Order ID.
- **Trigger**: Automatically call this function after successful payment verification in `verifySubscriptionPayment`.

### 3. Database Updates (if needed)
- The current `gyms` table already has `subscription_plan_id`, `subscription_ends_at`, and `plan_tier`.
- We will ensure `settings.plan_id` is kept in sync.

## Security & Reliability
- Verify caller roles for all subscription actions.
- Use HMAC signature verification for all Razorpay callbacks.
- Implement idempotency checks for payments to prevent double-charging.

---
*Note: To enable real emails, I will need a Resend API key or similar. I will proceed with the implementation using a mock logger first and ask for the secret if not already available.*
