# Nexus Commerce

A **production-grade, multi-tenant, white-label e-commerce boilerplate** built with Next.js 16, TypeScript, Tailwind CSS v4, Prisma, and NextAuth. Clone it, configure it, and deploy a complete bilingual (Arabic/English) store for any client in under an hour.

---

## ✨ Why Nexus Commerce?

Unlike single-purpose templates, Nexus is designed as a **multi-client foundation**. Every architectural decision serves one goal:

> **Build once, customize fast for any client.**

- **🏪 Dynamic Business Modes:** Toggle between `RETAIL` (Shop + Cart) and `RESTAURANT` (Menu + Reserve) with a single environment variable.
- **🌍 First-Class i18n:** Full Arabic (RTL) and English (LTR) support, with locale-aware routing, emails, and admin dashboards.
- **🎨 White-Label Ready:** Branding, colors, logos, and contact info are all managed from the database, not code.
- **🔐 Production Security:** NextAuth v5, Stripe Webhook verification, server-side price recalculations, and cascade-safe database operations.
- **📚 Self-Documenting:** Every phase of the build is documented in `docs/` with architectural decisions, difficulties, and cheat sheets.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme inline` + CSS variables) |
| Database | PostgreSQL via Supabase (Prisma 7 + `@prisma/adapter-pg`) |
| Auth | NextAuth v5 (Auth.js) with Credentials provider |
| Payments | Stripe Checkout + Webhooks |
| Emails | React Email + Resend |
| State | Zustand (with `persist`) |
| i18n | next-intl |
| Icons | lucide-react |

---

## 🏛️ Architecture

Nexus enforces a strict separation of concerns to prevent code rot when customizing for a new client.

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Locale-aware routing (en, ar)
│   │   ├── admin/          # Protected admin dashboard
│   │   ├── products/       # Product detail pages
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Stripe checkout flow
│   │   └── orders/         # Order success & tracking
│   └── api/
│       ├── auth/           # NextAuth handler
│       └── webhooks/       # Stripe webhook receiver
│
├── features/               # Domain modules (plug-and-play)
│   ├── admin/              # Admin CRUD actions & queries
│   ├── auth/               # Auth actions
│   ├── cart/               # Zustand cart store
│   ├── checkout/           # Checkout server actions
│   └── products/           # Product queries & components
│
└── shared/                 # Core layer (untouchable across clients)
    ├── config/             # storeConfig (feature flags, tiers)
    ├── i18n/               # Routing, request, navigation
    ├── lib/                # Prisma, Stripe, Auth, Email, utils
    └── ui/                 # Reusable primitives (Button, Input, Navbar, etc.)
```

### Core vs. Domain

- **Core Layer** (`src/shared/*`): Authentication, UI primitives, database client, email system. **Never** contains business logic.
- **Domain Layer** (`src/features/*`): Business logic per module (products, cart, orders). Deleting a feature folder must not break the Core.

---

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode is fine)
- A [Resend](https://resend.com) account (or use the `console` provider)

### 2. Clone & Install

```bash
git clone https://github.com/your-username/nexus-commerce-boilerplate.git my-client-store
cd my-client-store
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STORE_NAME="Nexus Commerce"
NEXT_PUBLIC_BUSINESS_TYPE=RETAIL       # or RESTAURANT
NEXT_PUBLIC_STORE_TIER=ENTERPRISE      # or BASIC, PRO
NEXT_PUBLIC_CURRENCY="USD"

# Database (Supabase)
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://...pooler.supabase.com:5432/postgres"

# Auth
AUTH_SECRET="generate-a-32-char-random-string"

# Supabase (client)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Email
EMAIL_PROVIDER="console"               # or "resend"
RESEND_API_KEY=""
EMAIL_FROM="Nexus Commerce <noreply@yourdomain.com>"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Set Up the Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

The seed creates 2 categories, 4 demo products, and an admin user:
- **Email:** `admin@nexus.com`
- **Password:** `password123`

**⚠️ Change these credentials before going live.**

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📚 Documentation

The entire build process is documented in the `docs/` folder as beautiful HTML reports:

| Phase | Title | Description |
|-------|-------|-------------|
| 01 | [Design System](./docs/phase-01-design-system.html) | Tailwind v4 tokens & Layout |
| 02 | [Data Fetching](./docs/phase-02-data-fetching.html) | Prisma + Shop Page |
| 03 | [Secure Checkout](./docs/phase-03-secure-checkout.html) | Zod + Server Actions |
| 04 | [Product Details](./docs/phase-04-product-details.html) | Dynamic routes with variants |
| 05 | [Order Tracking](./docs/phase-05-order-tracking.html) | Emails + Status timeline |
| 06 | [Admin Dashboard](./docs/phase-06-admin-dashboard.html) | NextAuth v5 + RBAC |
| 07 | [Stripe Checkout](./docs/phase-07-stripe-checkout.html) | Payment + Webhooks |
| 08 | [Admin Products](./docs/phase-08-admin-products.html) | Product CRUD |
| 09 | [Categories](./docs/phase-09-categories.html) | Safe deletion + RTL tables |
| 10 | [Staff Management](./docs/phase-10-staff-management.html) | User CRUD + Self-protection |
| 11 | [Dashboard Analytics](./docs/phase-11-dashboard-analytics.html) | Metrics + CSS charts |
| 12 | [Settings & Deployment](./docs/phase-12-settings-deployment.html) | White-label branding + Production launch |

Each report includes **architectural decisions**, **difficulties & fixes**, a **white-label checklist**, and a **developer cheat-sheet** for future reference.

---

## 🎨 White-Labeling for a Client

Because Nexus is a boilerplate, you can deploy a new store per client in four phases:

### Phase A: Clone & Configure (15 min)
1. `git clone` into a new repository
2. Update `.env` with the client's Supabase, Stripe, and Resend credentials
3. Set `NEXT_PUBLIC_STORE_NAME` and `NEXT_PUBLIC_BUSINESS_TYPE`

### Phase B: Brand Customization (30 min)
1. Update CSS variables in `src/app/globals.css` (primary/accent colors)
2. Replace `public/logo.svg` with the client's logo
3. Update `messages/en.json` and `messages/ar.json` for brand-specific copy

### Phase C: Data Seeding (10 min)
1. Update `prisma/seed.ts` with the client's categories and products
2. Update the default admin email/password in `prisma/seed.ts`
3. Run `npx prisma migrate deploy && npx prisma db seed`

### Phase D: Deploy & Handoff (20 min)
1. Deploy to Vercel (see Phase 12 report)
2. Configure the Stripe Webhook in the Stripe Dashboard
3. Log in as the client admin and verify the Settings page
4. Hand off credentials

---

## 🚀 Deploying to Production

See the full step-by-step deployment guide in [Phase 12](./docs/phase-12-settings-deployment.html#deployment). Key highlights:

1. Deploy to Vercel
2. Set all environment variables in the Vercel dashboard
3. Run `npx prisma migrate deploy` against production
4. Configure the Stripe webhook URL: `https://your-domain.com/api/webhooks/stripe`
5. Update `AUTH_SECRET` and `STRIPE_*` keys to **live mode**
6. Verify a real $1 order end-to-end

---

## 🔒 Security Notes

- **Never trust client prices.** The `createOrder` and Stripe webhook re-fetch prices from the database.
- **Webhook idempotency.** Stripe can send the same event twice. The webhook checks for existing `stripeSessionId` before creating an order.
- **Cascade protection.** `Product.category` uses `onDelete: Restrict`. Categories with products cannot be deleted.
- **Self-protection.** Admins cannot delete, demote, or disable their own account.
- **AUTH_SECRET must be 32+ characters** in production.

---

## 📁 Environment Variables Checklist

When launching a new client site, verify all of these are set:

- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_STORE_NAME`
- [ ] `NEXT_PUBLIC_BUSINESS_TYPE`
- [ ] `NEXT_PUBLIC_CURRENCY`
- [ ] `DATABASE_URL` & `DIRECT_URL`
- [ ] `AUTH_SECRET` (32+ random chars)
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RESEND_API_KEY` & `EMAIL_FROM`
- [ ] `STRIPE_SECRET_KEY` (live mode)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live mode)
- [ ] `STRIPE_WEBHOOK_SECRET` (from live Stripe Dashboard)

---

## 🤝 Contributing

This is a personal commercial boilerplate. If you find a bug or have a suggestion, feel free to open an issue.

---

## 📜 License

**Commercial License.** This boilerplate is designed to be customized and deployed for multiple clients.

You may **not**:

- ❌ Use it for client projects
- ❌ Modify it for any client
- ❌ Sell the resulting applications to clients
- ❌ Resell the boilerplate itself as a template
- ❌ Redistribute the source code publicly

---

## 📞 Support

For questions about customizing Nexus Commerce for a specific client, refer to the `docs/` folder first — most common issues and architectural decisions are documented there.

---

Built with ❤️ and a lot of patience.
```