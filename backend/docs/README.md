# MyDesignGhar Backend Documentation & Guides

Welcome to the backend engineering documentation for **MyDesignGhar**.

---

## 1. Database Schema Layout

The database is built on **PostgreSQL** and orchestrated through **Prisma ORM**. It features 24 core tables to handle designs generation, payments, video marketplace, social challenges, and affiliate trackings.

| Schema Table Name | Purpose | Indexes / Relations |
| :--- | :--- | :--- |
| `users` | Core user identity, Clerk ID mapping (`clerkId`), role definitions. | Index on `phone`, `email` |
| `profiles` | Flat profile metadata (fullname, avatar, bio). | Cascade to `User` |
| `designs` | Tracks generated interior decoration sessions. | Index on `userId` |
| `design_images` | High-res originals, previews, watermarks, depthmaps. | Relation to `Design` |
| `purchases` | Design unlocking records mapped to Razorpay orders. | Indexes on `userId`, `designId` |
| `wallets` | Balance sheet per user. | Relation to `User` |
| `wallet_transactions` | Credits/Debits tracking deposits, payments, refunds, rewards. | Index on `walletId` |
| `consultants` | Design consultant profiles (approved/rejected status). | Relation to `User` |
| `consultant_portfolios` | Image portfolio URLs for consultants. | Index on `consultantId` |
| `consultant_availability` | Active slots calendar definition. | Multi-column index on `consultantId`, `date` |
| `consultation_bookings` | Booking logs connected to Daily.co meeting sessions. | Indexes on `userId`, `consultantId` |
| `consultation_notes` | Post-meeting notes written by consultant. | One-to-one to `ConsultationBooking` |
| `affiliate_products` | Items recommended for purchase. | Category indexing |
| `affiliate_clicks` | Clicks and redirects traffic tracker. | Indexes on product and user |
| `referrals` | Invite mapping, reward payouts. | Unique constraint on `refereeId` |
| `notifications` | In-app alerts history log. | Index on `userId` |
| `favorites` | Design bookmarks. | Composite unique `userId_designId` |
| `challenge_entries` | Design entries submitted to daily challenges. | Unique composite `userId_challengeDate` |
| `leaderboards` | Top designers scores rollups. | Unique index on `userId` |
| `badges` | Achievements and milestones unlocks. | Index on `userId` |
| `settings` | System-wide config keys. | Unique key constraint |
| `audit_logs` | Security trail logging admin bans and refunds. | Index on `createdAt` |
| `admin_users` | Admin control panel users database. | Unique username constraint |

---

## 2. Authentication Flow (Clerk Auth Integration)

Authentication is handled entirely via **Clerk**. The backend verifies session tokens using Clerk SDK and syncs user profiles lazily on requests.

### Client-Side (React/Vite)
- Wraps the app with `ClerkProvider`.
- Retrieves the fresh session token using Clerk's `session.getToken()` on every API request.
- Appends the session token as a `Bearer` token inside the `Authorization` request header via Axios.

### Server-Side (Node/Express)
- Utilizes `@clerk/express` middleware parser globally (`app.use(clerkMiddleware())`).
- Inside the secure `authenticate` middleware:
  1. Validates the session token locally via Clerk JWKS.
  2. Resolves the `sub` claim which maps to the Clerk User ID.
  3. Checks if a matching `User` record exists in PostgreSQL.
  4. If the user does not exist in our database yet (i.e. first check-in after signing up on Clerk), we **lazily synchronize** their metadata (first/last name, email, avatar, phone) into PostgreSQL, generate their referral code, and provision their initial Wallet balance.
  5. Attaches the database user object (`{ id, phone, role, referralCode }`) to `req.user` for child routes.

### API Endpoints
- `POST /auth/sync`: Explicitly synchronizes database user profiles and processes referral bonuses (award ₹150) if registering with an invite code.
- `GET /auth/me`: Verifies active session token and returns database profile metadata.

---

## 3. Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Redis Cache server

### Installing Dependencies
Inside the `/backend` directory:
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and fill in the required keys, including your Clerk secrets:
```env
CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
```

### Prisma Migrations
Sync database schema and generate type clients:
```bash
npx prisma generate
npx prisma db push
```

### Start Development Server
```bash
npm run dev
```
The server will run on `http://localhost:5000`. You can inspect interactive Swagger documentations at `http://localhost:5000/api-docs`.

---

## 4. Production Deployment Guide

1. **Database Setup**: Deploy your Postgres instance to Supabase or Neon. Connect the SSL connection string directly to `DATABASE_URL`.
2. **Clerk Production Settings**: Configure your Production keys for `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in platform dashboards.
3. **Redis & Worker instances**: Deploy BullMQ workers using `node dist/queues/workers.js` to run jobs separately from the HTTP server.
4. **PaaS Hosting**: Deploy the HTTP app to Render, Heroku, or AWS ECS. Make sure to configure the Environment variables in your platform settings dashboard.
