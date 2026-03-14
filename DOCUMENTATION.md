# ChaseThePay — Complete Documentation

AI-powered invoice chasing: connects to Stripe, pulls overdue invoices, and sends AI-generated reminder emails to customers.

---

## Table of Contents

1. [Architecture & Tech Stack](#architecture--tech-stack)
2. [Environment Variables](#environment-variables)
3. [Database Schema](#database-schema)
4. [API Routes Reference](#api-routes-reference)
5. [User Flows](#user-flows)
6. [Plans & Limits](#plans--limits)
7. [Cron Jobs](#cron-jobs)
8. [Webhooks](#webhooks)
9. [Edge Cases & Test Scenarios](#edge-cases--test-scenarios)

---

## Architecture & Tech Stack

- **Framework:** Next.js (App Router)
- **Auth:** Supabase Auth (email/password)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe Connect (OAuth), Stripe Checkout (Pro subscription)
- **Email:** Resend
- **AI:** OpenAI (chase message generation)
- **Analytics:** Mixpanel (optional)

### Key Paths

| Purpose | Path |
|---------|------|
| Settings / plan | `app/api/settings/route.ts` |
| Chase execution logic | `lib/chase.ts` |
| Manual Chase button | `app/api/chases/send/route.ts` |
| Scan cron (pull overdue invoices) | `app/api/cron/scan/route.ts` |
| Auto-chase cron | `app/api/cron/auto-chase/route.ts` |
| Stripe OAuth callback | `app/api/accounts/callback/route.ts` |
| Stripe webhook | `app/api/webhooks/stripe/route.ts` |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes (prod) | Stripe webhook signing secret |
| `STRIPE_CLIENT_ID` | Yes | Stripe Connect OAuth client ID |
| `NEXT_PUBLIC_STRIPE_KEY` | Yes | Stripe publishable key (client) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key (server/cron) |
| `RESEND_API_KEY` | Yes | Resend API key for sending emails |
| `EMAIL_FROM` | No | From address for all chase emails (e.g. `hello@chasethepay.com`). Domain must be verified in Resend. Fallback: `noreply@resend.dev` |
| `OPENAI_API_KEY` | Yes | OpenAI API key for chase message generation |
| `CRON_SECRET` | Yes (prod) | Secret for cron endpoints; generate: `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL (e.g. `https://yoursite.com`) |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | No | Mixpanel token (optional) |

### Dev-Only (Optional)

| Variable | Description |
|----------|-------------|
| `DEV_SKIP_OPENAI=true` | Use template message instead of OpenAI |
| `DEV_EMAIL_OVERRIDE=you@example.com` | Override recipient for all chase emails (Resend sandbox) |
| `DEV_INCLUDE_FUTURE_DUE=true` | Scan includes future-due invoices |

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `accounts` | Stripe Connect linked accounts (`user_id`, `stripe_account_id`) |
| `invoices` | Synced Stripe invoices; `status`: open, paid, void |
| `chases` | Email chase log (`invoice_id`, `message`, `sent_at`, `status`) |
| `settings` | Per-user config: `sender_name`, `ai_tone`, `chase_frequency`, `max_chases`, `plan`, `stripe_customer_id` (note: `from_email` column exists but is unused; all emails use `EMAIL_FROM`) |
| `user_marketing` | Denormalized metrics: `chases_used_count`, `stripe_connected`, `is_paid`, `total_recovered_cents`, etc. |

### Enums

- `InvoiceStatus`: `open` \| `paid` \| `void`
- `ChaseFrequency`: `1min` \| `1day` \| `3days` \| `weekly` (UI shows 1day, 3days, weekly)
- `AITone`: `friendly` \| `professional` \| `firm`
- `Plan`: `free` \| `pro` \| `test`

### Migrations

Apply with `supabase db push` (or via dashboard). Order:

1. `20250303000000_initial_schema.sql`
2. `20260304000000_add_1min_frequency.sql`
3. `20260306000000_enable_realtime_invoices.sql`
4. `20260307000000_add_sender_name_to_settings.sql`
5. `20260308000000_add_test_plan.sql`
6. `20260309000000_user_marketing.sql`
7. `20260310000000_add_1day_frequency.sql`
8. `20260311000000_waitlist.sql`
9. `20260312000000_cron_status.sql`
10. `20260313000000_remove_test_plan_is_paid.sql`
11. `20260314000000_chases_delete_policy.sql`
12. `20260315000000_protect_settings_plan.sql`

---

## API Routes Reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/callback` | No | Placeholder; Supabase handles auth internally |
| GET | `/auth/callback` | No | OAuth callback: exchanges code for session, creates `settings` if missing, redirects to `/dashboard` or `next` |

### Accounts (Stripe Connect)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/accounts/connect` | Yes | Returns Stripe OAuth URL |
| GET | `/api/accounts/callback` | No | OAuth callback: stores account, syncs marketing, redirects to settings |
| POST | `/api/accounts/disconnect` | Yes | Disconnects Stripe account |

### Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/settings` | Yes | Returns settings + `stripeConnected`, `stripeAccountId`. Creates settings if missing; plan = `test` if `settings` count &lt; 50, else `free` |
| POST | `/api/settings` | Yes | Upserts settings (validated via `settingsUpdateSchema`) |

### Invoices

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/invoices` | Yes | Lists open invoices for user's accounts |
| POST | `/api/invoices/scan` | Yes | Manual scan: pulls overdue invoices from Stripe for connected accounts |
| POST | `/api/invoices/sync` | Yes | Syncs invoice status (paid/void) from Stripe |

### Chases

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/chases/send` | Yes | Sends one chase for `invoiceId`. Returns `FREE_LIMIT_REACHED` (403) when free limit hit |

### Billing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/billing/checkout` | Yes | Creates Stripe Checkout session for Pro ($9.99/mo), redirects to settings on success |

### Cron (Protected by `CRON_SECRET`)

| Method | Path | Headers | Schedule | Description |
|--------|------|---------|----------|-------------|
| GET | `/api/cron/scan` | `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>` | Every 15 min | Pulls overdue invoices from Stripe, syncs paid status |
| GET | `/api/cron/auto-chase` | Same | Hourly | Sends chases per user frequency, max_chases, and plan limits |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/stripe` | Handles `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`. Enable "Events on Connected accounts" for `invoice.paid` (merchant invoices). |
| POST | `/api/webhooks/email` | Resend webhook (optional) |

### Marketing & Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/marketing/track` | Yes | Tracks marketing event |
| POST | `/api/marketing/survey-sent` | Yes | Marks survey as sent |
| GET | `/api/analytics` | Yes | Returns analytics (if implemented) |

### Dev (Consider disabling in prod)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/dev/clear-invoices` | Yes | Clears invoices |
| GET | `/api/dev/stripe-invoices` | Yes | Lists open invoices from Stripe |

---

## User Flows

### 1. Sign Up / Login

- **Sign up:** `POST /auth/v1/signup` (Supabase) with email + password; `emailRedirectTo` = `/auth/callback`
- **Auth callback:** Exchanges code for session, creates `settings` row if none; redirects to `/dashboard` or `next` param
- **Login:** `POST /auth/v1/token` (Supabase) → redirect to dashboard or `redirect` param

### 1b. Password Reset

- **Forgot password:** User enters email on `/forgot-password` → `resetPasswordForEmail()` with `redirectTo` = `/auth/callback?next=/reset-password`
- **Email:** Supabase sends reset link; user clicks → Supabase redirects to `/auth/callback?code=...&next=/reset-password`
- **Auth callback:** Exchanges code, redirects to `/reset-password` with session
- **Reset password:** User sets new password on `/reset-password` → `updateUser({ password })` → sign out → redirect to `/login?reset=success`
- **Supabase:** Add `https://yoursite.com/auth/callback` to Auth → URL Configuration → Redirect URLs

### 2. Onboarding

1. User lands on dashboard; if no Stripe account, sees “Connect Stripe”
2. Click Connect → `POST /api/accounts/connect` → redirect to Stripe OAuth
3. Stripe redirects to `/api/accounts/callback?code=...&state=<signed-token>`
   - `state` is a signed token (HMAC, 10 min expiry); `CRON_SECRET` is used for signing to prevent account-linking attacks.
4. Callback stores account, syncs `user_marketing`, redirects to `/settings?stripe=success`
5. User configures `sender_name`, `chase_frequency`, `max_chases` (sender name is used in chase emails and as the display name in the recipient's inbox)

### 3. Invoice Scan

- **Manual:** Refresh button → `POST /api/invoices/scan` → fetches overdue open invoices from Stripe
- **Cron:** `GET /api/cron/scan` every 15 min does the same for all accounts

### 4. Send Chase (Manual)

1. User clicks Chase on an invoice
2. `POST /api/chases/send` with `{ invoiceId }`
3. `executeChase()` in `lib/chase.ts` runs checks (plan, limits, frequency, max_chases) and sends email
4. If free limit reached → returns `FREE_LIMIT_REACHED` → UI shows upgrade modal

### 5. Upgrade to Pro

1. User hits free limit or clicks “Upgrade” in settings
2. `POST /api/billing/checkout` → Stripe Checkout
3. Success URL: `/settings?checkout=success`
4. `checkout.session.completed` webhook stores `stripe_customer_id` in `settings` (from `client_reference_id` + `session.customer`)
5. `customer.subscription.updated` sets `plan = "pro"` (matches `stripe_customer_id`)

---

## Plans & Limits

| Plan | How Assigned | Chases | Notes |
|------|--------------|--------|-------|
| `test` | First 50 users (count of `settings` at first settings creation) | Unlimited | Free for life |
| `free` | Users 51+ | 10 per calendar month | Resets monthly |
| `pro` | After successful Stripe subscription | Unlimited | $9.99/mo |

### Chase Rules (in `lib/chase.ts`)

- Invoice must be `open` and have `customer_email`
- `chase_count` &lt; `max_chases`
- Last chase &gt; frequency ago (1day / 3days / weekly); `last_chased_at` rounded to minute for comparison
- Free plan: total chases this month across all invoices ≤ 10
- Pro/test: no monthly cap

### Chase Email Sender

- **From address:** Always `EMAIL_FROM` env var (e.g. `hello@chasethepay.com`). Domain must be verified in Resend.
- **Display name:** User's `sender_name` from settings. Format: `"Acme Corp" <hello@chasethepay.com>`
- Users cannot set a custom from email; this avoids Resend verification issues for per-user domains.

---

## Cron Jobs

### Scan (`/api/cron/scan`)

- **Schedule:** Every 15 min (`*/15 * * * *`)
- **Auth:** `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>`
- **Actions:**
  - For each account: list Stripe `open` invoices with `amount_remaining > 0`, `due_date` in the past
  - Upsert into `invoices`
  - For each open invoice: fetch from Stripe; if `paid`, update `status`, `recovered_at`

### Auto-Chase (`/api/cron/auto-chase`)

- **Schedule:** Hourly (`0 * * * *`)
- **Auth:** Same as scan
- **Actions:**
  - For each account, get settings (max_chases, chase_frequency, plan)
  - Find open invoices with `customer_email`, below max_chases, and past frequency cutoff
  - `last_chased_at` is rounded to the minute for frequency comparison (avoids hourly drift)
  - Apply free-plan monthly limit (10 chases/month)
  - Call `executeChase()` for each eligible invoice

---

## Webhooks

### Stripe (`/api/webhooks/stripe`)

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Update `settings.stripe_customer_id` from `client_reference_id` (user_id) + `session.customer` |
| `invoice.paid` | Set `invoices.recovered_at`, `status = paid`; sync `user_marketing` |
| `customer.subscription.updated` | If `status === "active"` → `plan = "pro"`, else `plan = "free"`; sync marketing |
| `customer.subscription.deleted` | `plan = "free"`; sync marketing |

**Config:** Point Stripe webhook to `https://yoursite.com/api/webhooks/stripe`, use `STRIPE_WEBHOOK_SECRET`. Select "Connected and v2 accounts" so `invoice.paid` events from merchant Stripe accounts are received.

---

## Edge Cases & Test Scenarios

### Auth & Onboarding

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 1 | Sign up as user #1–50 | `plan = "test"` on first settings fetch | Create new user, ensure settings count &lt; 50 |
| 2 | Sign up as user #51+ | `plan = "free"` | Seed 50 settings rows, create 51st user |
| 3 | Auth callback with invalid code | Redirect to `/login?error=auth` | Use `/auth/callback?code=bad` |
| 4 | Access `/dashboard` unauthenticated | Redirect to `/login?redirect=/dashboard` | Log out, visit `/dashboard` |
| 5 | Forgot password, request reset | Email sent, success screen | Visit `/forgot-password`, enter email |
| 6 | Reset password with valid link | New password set, redirect to login | Click link in reset email, set password |
| 7 | Reset password with invalid/expired link | "Invalid or expired link" message | Visit `/reset-password` without session |

### Stripe Connect

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 5 | Connect Stripe success | Account stored, redirect to `/settings?stripe=success` | Complete OAuth flow |
| 6 | Connect Stripe error/cancel | Redirect to `/settings?stripe=error` | Abort OAuth or use invalid code |
| 7 | Connect with same Stripe account twice | Upsert succeeds, no duplicate | Re-connect same Stripe account |

### Invoices

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 8 | Scan with no connected account | 400 "No Stripe account connected" | User with no account, POST `/api/invoices/scan` |
| 9 | Invoice with no `customer_email` | Not chased (skipped) | Create Stripe invoice without email, run scan |
| 10 | Invoice `amount_remaining = 0` | Skipped in scan | Stripe invoice with 0 remaining |
| 11 | Invoice due in future | Skipped in cron scan; included in manual if `DEV_INCLUDE_FUTURE_DUE=true` | Create future-due invoice |
| 12 | Invoice paid in Stripe, open in DB | Scan sync updates to `paid` | Pay invoice in Stripe, run scan |

### Chase Limits

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 13 | Free user, 10 chases this month | Next chase returns `FREE_LIMIT_REACHED` | Send 10 chases in same month, try 11th |
| 14 | Free user, new month | Can send up to 10 again | Wait for next month or mock date |
| 15 | Pro user | No monthly limit | Subscribe, send > 10 chases |
| 16 | Test user | No monthly limit | Use invited user (plan = test) |
| 17 | Chase at `max_chases` | `executeChase` returns error "Max chases reached" | Set `max_chases = 3`, send 3, try 4th |
| 18 | Chase before frequency | Skipped (e.g. 3days not elapsed) | Send chase, try again next day |

### Chase Logic

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 19 | Invoice `status != "open"` | Not chased | Mark invoice `void`, try chase |
| 20 | Chase another user’s invoice | 403 Forbidden | Use `invoiceId` from different user |
| 21 | Invalid `invoiceId` (bad UUID) | 400 validation error | POST with `invoiceId: "bad"` |
| 22 | Valid UUID, non-existent invoice | 404 | POST with random UUID |
| 23 | OpenAI failure | Chase fails, returns error | Set invalid `OPENAI_API_KEY` or use `DEV_SKIP_OPENAI` |
| 24 | Resend failure | Chase fails, no chase row | Use invalid `RESEND_API_KEY` |

### Billing & Webhooks

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 25 | Upgrade to Pro | Checkout session created, redirect to Stripe | Click Upgrade, complete checkout |
| 26 | Subscription canceled | Webhook sets `plan = "free"` | Cancel in Stripe dashboard |
| 27 | Invoice paid (customer pays) | `invoice.paid` sets `recovered_at`, `status = paid` | Pay invoice in Stripe, trigger webhook |
| 28 | Webhook with invalid signature | 400 | POST raw body with wrong secret |
| 29 | Webhook without `stripe-signature` | 400 | Omit header |

### Cron

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 30 | Cron without `CRON_SECRET` | 403 | `curl /api/cron/scan` |
| 31 | Cron with wrong secret | 403 | `curl -H "Authorization: Bearer wrong"` |
| 32 | Cron with valid secret | 200, `{ ok: true, scanned, synced }` | `curl -H "x-cron-secret: $CRON_SECRET"` |

### Settings

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 37 | Update `chase_frequency` to `1min` | Allowed by schema (DB supports it) | POST `{ chase_frequency: "1min" }` (if UI allows) |
| 38 | `max_chases` &gt; 20 | 400 (validation) | POST `{ max_chases: 21 }` |

### Email & Dev

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 39 | `DEV_EMAIL_OVERRIDE` set | All chase emails go to override address (dev only) | Set env, send chase |
| 40 | `EMAIL_FROM` + `sender_name` set | Chase uses `"Sender Name" <EMAIL_FROM>` | Set both, send chase |
| 41 | No `EMAIL_FROM` | Uses `noreply@resend.dev` as from address | Clear env, send chase |

### Realtime

| # | Scenario | Expected | How to Test |
|---|----------|----------|-------------|
| 42 | Invoice paid (webhook) | Dashboard updates if realtime enabled | Pay in Stripe, watch dashboard |

---

## Quick Test Commands

```bash
# Cron scan (replace SECRET with your CRON_SECRET)
curl -H "x-cron-secret: YOUR_CRON_SECRET" https://yoursite.com/api/cron/scan

# Cron auto-chase
curl -H "x-cron-secret: YOUR_CRON_SECRET" https://yoursite.com/api/cron/auto-chase

```

---

## Vercel Deployment

1. Set all env vars in Vercel (including `EMAIL_FROM` for custom domain, e.g. `hello@chasethepay.com`).
2. Add cron routes in `vercel.json`:
   - `/api/cron/scan` — `*/15 * * * *`
   - `/api/cron/auto-chase` — `0 * * * *`
3. Configure Stripe webhook to `https://your-domain.com/api/webhooks/stripe`. Enable "Connected and v2 accounts" for `invoice.paid`.
4. Add Stripe Connect redirect URI: `https://your-domain.com/api/accounts/callback` (Stripe Dashboard → Settings → Connect → OAuth).
5. Ensure `NEXT_PUBLIC_APP_URL` matches production URL.
6. Verify your domain in Resend to send from `EMAIL_FROM`.
