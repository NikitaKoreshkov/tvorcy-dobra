# ТворцыДобра — Donation Platform for Nonprofits

**Connecting NGOs, volunteers, and donors through secure payments and transparent interface.**

## 🚀 Live Demo

- **Frontend:** https://tvorcy-dobra.vercel.app (if deployed)
- **Backend:** Available on Railway/Render with PostgreSQL
- **Demo Admin:** `admin@tvorcydobra.ru` / `demo-admin-12345`

<table>
  <tr>
    <td width="50%"><img src=".github/assets/homepage.jpg" alt="Homepage with project carousel" /></td>
    <td width="50%"><img src=".github/assets/donation-flow.jpg" alt="Donation checkout flow" /></td>
  </tr>
  <tr>
    <td width="50%"><img src=".github/assets/ngo-dashboard.jpg" alt="NGO analytics dashboard" /></td>
    <td width="50%"><img src=".github/assets/mobile-view.jpg" alt="Mobile viewport (390px)" width="300" /></td>
  </tr>
</table>

## ⚡ Features

| Feature | Description |
|---------|-------------|
| 💳 **Payment Integration** | Stripe, PayPal, ЮKassa with PCI-DSS compliance |
| 📊 **NGO Dashboard** | Real-time analytics, fund tracking, donor management |
| 🔐 **Admin Panel** | NGO verification, document moderation, platform settings |
| 🌍 **Multi-Currency** | ₽ RUB, $ USD, € EUR, ₸ KZT support |
| 📱 **Responsive Design** | Optimized for mobile, tablet, desktop |
| 🎯 **SEO Optimized** | Metadata, Open Graph, structured JSON-LD data |

---

## 🛠 Tech Stack & Architecture

### Fullstack Overview

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 14.x | App Router, Server Components |
| **UI Library** | React | 18.x | Component framework |
| **Styling** | Tailwind CSS | 3.x + shadcn/ui | Utility-first styling |
| **Backend** | NestJS | 10.x | Modular TypeScript framework |
| **ORM** | Prisma | 6.x | Type-safe database access |
| **Database** | PostgreSQL | 15.x | Primary data store |
| **Auth** | JWT + OAuth2 | - | Secure session management |
| **Payments** | Stripe/PayPal/YuKassa | API v3 | Payment processing |
| **Deployment** | Vercel/Railway | - | CI/CD pipeline |

### Frontend Structure (`frontend/`)

```
frontend/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Authentication flows
│   │   ├── login/page.tsx            # Sign-in page
│   │   ├── register/page.tsx         # User registration  
│   │   └── verify/[id]/page.tsx      # Email verification
│   ├── (public)/                     # Public marketing pages
│   │   ├── page.tsx                  # Homepage with hero, featured projects
│   │   ├── about/page.tsx            # About platform mission
│   │   └── help/page.tsx             # FAQ and support info
│   ├── ngo-dashboard/                # NGO-specific dashboard
│   │   ├── page.tsx                  # Main analytics view
│   │   ├── projects/page.tsx         # Project management
│   │   └── donations/page.tsx        # Donor transactions log
│   ├── donation/[projectId]/         # Single project page
│   │   └── page.tsx                  # Fundraising campaign with progress
│   ├── api/                          # Next.js API routes (proxy to backend)
│   └── globals.css                   # Global styles + Tailwind directives
├── components/                       # React component library
│   ├── ui/                           # shadcn/ui primitives
│   │   ├── button.tsx                # Reusable button variants
│   │   ├── card.tsx                  # Card container
│   │   ├── input.tsx                 # Form inputs
│   │   └── dialog.tsx                # Modal dialogs
│   ├── donation/                     # Donation-specific components
│   │   ├── donation-form.tsx         # Amount selection + payment method
│   │   ├── payment-methods.tsx       # Stripe Elements wrapper
│   │   ├── donation-confirmation.tsx # Post-payment receipt
│   │   └── progress-bar.tsx          # Fundraising goal visualization
│   ├── ngo/                          # NGO dashboard widgets
│   │   ├── total-donations-card.tsx  # Revenue summary
│   │   ├── monthly-trend-chart.tsx   # Recharts visualization
│   │   ├── active-projects-table.tsx # Project status list
│   │   └── top-donors-list.tsx       # Leaderboard component
│   └── layout/                       # Shared layouts
│       ├── navbar.tsx                # Navigation bar
│       ├── footer.tsx                # Footer with links
│       └── auth-provider.tsx         # Auth context provider
├── lib/                              # Utility modules
│   ├── stripe.ts                     # Stripe integration helpers
│   ├── api-client.ts                 # Axios instance with interceptors
│   ├── currency.ts                   # Multi-currency formatting
│   └── utils.ts                      # Common utilities
└── public/
    └── images/                       # Static assets (logos, banners)
```

### Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── modules/                      # Feature modules (NestJS standard)
│   │   ├── auth/                     # Authentication & authorization
│   │   │   ├── auth.controller.ts    # Login/register endpoints
│   │   │   ├── auth.service.ts       # JWT generation, OAuth strategies
│   │   │   └── guards/               # Role-based guards (user/ngo/admin)
│   │   ├── ngo/                      # NGO organization management
│   │   │   ├── ngo.controller.ts     # CRUD operations
│   │   │   ├── ngo.service.ts        # Verification logic
│   │   │   └── dto/                  # Validation DTOs
│   │   ├── projects/                 # Campaign/project management
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts   # Project lifecycle logic
│   │   │   └── categories.service.ts # Category/tag system
│   │   ├── donations/                # Payment processing module
│   │   │   ├── donations.controller.ts
│   │   │   ├── donations.service.ts  # Create transaction, webhooks
│   │   │   ├── stripe-webhook.ts     # Stripe event handler
│   │   │   ├── paypal-webhook.ts     # PayPal IPN handler
│   │   │   └── yukassa-webhook.ts    # YuKassa callback processor
│   │   └── admin/                    # Super admin panel endpoints
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts      # Moderation queue, audit logs
│   │       └── verification.pipe.ts  # NGO document validation
│   ├── common/                       # Cross-cutting concerns
│   │   ├── decorators/               # Custom decorators
│   │   │   ├── roles.decorator.ts    # @Roles('admin') helper
│   │   │   └── user.decorator.ts     # @CurrentUser() decorator
│   │   ├── filters/                  # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/                    # Validation pipes
│   │   │   └── validate-money.pipe.ts
│   │   └── interceptors/             # Response interceptors
│   ├── config/                       # Environment configuration
│   │   └── validators.ts             # Joi/Zod env var validation
│   └── main.ts                       # Entry point + global middleware
├── prisma/
│   ├── schema.prisma                 # Database schema (26 models)
│   └── migrations/                   # Migration files
└── test/                             # Integration tests
    ├── auth.e2e-spec.ts              # Login/signup E2E tests
    └── donations.e2e-spec.ts         # Payment flow tests
```

### Database Schema (Prisma)

Key models in `prisma/schema.prisma`:

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  role         Role      @default(DONOR) // DONOR | NGO_ADMIN | ADMIN
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  donations    Donation[]
}

model NgoOrganization {
  id            String   @id @default(uuid())
  name          String
  description   String
  taxCertificate String?
  verified      Boolean  @default(false)
  user          User     @relation(fields: [userId], references: [id])
  userId        String
  projects      Project[]
  donations     Donation[]
  createdAt     DateTime @default(now())
}

model Project {
  id              String   @id @default(uuid())
  title           String
  description     String
  fundraisingGoal Decimal
  currentAmount   Decimal  @default(0)
  category        String
  ngo             NgoOrganization @relation(fields: [ngoId], references: [id])
  ngoId           String
  donations       Donation[]
  images          String[]
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
}

model Donation {
  id            String    @id @default(uuid())
  amount        Decimal
  currency      Currency  @default(RUB)
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  donorId       String
  donor         User      @relation(fields: [donorId], references: [id])
  paymentMethod PaymentMethod // STRIPE | PAYPAL | YUKASSA
  status        DonationStatus @default(PENDING) // PENDING | SUCCESS | FAILED
  transactionId String?   @unique
  webhookData   Json?     @db.Json
  createdAt     DateTime  @default(now())
}

enum Role {
  DONOR
  NGO_ADMIN
  SUPER_ADMIN
}

enum Currency {
  RUB
  USD
  EUR
  KZT
}

enum PaymentMethod {
  STRIPE
  PAYPAL
  YUKASSA
}

enum DonationStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}
```

---

## 📦 Installation & Setup

### Quick Start (Development)

```bash
# Clone repository
git clone https://github.com/NikitaKoreshkov/tvorcy-dobra.git
cd tvorcy-dobra

# Install all dependencies (frontend + backend + dev tools)
npm run install:all

# Start development environment (both frontend and backend)
npm run dev

# Services available at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

### Manual Setup (Advanced)

#### 1️⃣ Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Apply database migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Start backend server
npm run start:dev
```

#### 2️⃣ Frontend Setup

```bash
cd frontend

# Copy environment template  
cp .env.example .env

# Edit .env with API endpoint and payment keys
nano .env

# Start frontend dev server
npm run dev
```

### Environment Variables Reference

#### Backend (`.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=tvorcy_dobra

# JWT Configuration
JWT_SECRET=super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=another-secret-key-for-refresh-tokens
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
PAYPAL_CLIENT_ID=AaB12YourPayPalClientIdHere
PAYPAL_CLIENT_SECRET=YourPayPalClientSecretHere
PAYPAL_MODE=sandbox

YUKASSA_STORE_ID=your_yukassa_store_id
YUKASSA_SIGNATURE=your_yukassa_signature_key
YUKASSA_WORKFLOW_URL=https://yookassa.ru/api

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://tvorcydobra.ru

# Application
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug
```

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Payment Keys (publishable only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AaB12YourPayPalClientIdHere

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_YANDEX_METRICA_ID=XXXXXXXXXX

# Branding
NEXT_PUBLIC_SITE_NAME=ТворцыДобра
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_DESCRIPTION=Благотворительная платформа для пожертвований
```

---

## 🎯 Key Workflows

### 1. Complete Donation Flow

```typescript
// Step 1: Donor selects donation amount (custom or predefined)
<DonationForm
  projectId={id}
  amount={5000}
  currency="RUB"
/>

// Step 2: Donor chooses payment method
const paymentMethod = await selectPaymentMethod(); // 'stripe' | 'paypal' | 'yukassa'

// Step 3: Redirect to payment gateway
if (paymentMethod === 'stripe') {
  const { sessionId } = await fetch('/api/donations/create-session', {
    method: 'POST',
    body: JSON.stringify({ projectId, amount }),
  });
  window.location.href = await stripe.redirectToCheckout({ sessionId });
}

// Step 4: Webhook handles completion
@PostWebhook('/stripe')
handleStripeWebhook(@Body() body: Buffer) {
  const event = stripe.webhooks.constructEvent(
    body,
    this.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const donation = await this.donationsService.markAsSuccess(event.data.object.id);
    // Send confirmation email to donor
    // Update project progress
    // Add donor to leaderboard
  }
}
```

### 2. NGO Onboarding Flow

```typescript
// NGO registers and submits documents
@Post('ngos')
async createNgo(@Body() dto: CreateNgoDto, @Req() req: Request) {
  const ngo = await this.ngoService.create({
    ...dto,
    userId: req.user.id,
    verified: false,
  });

  // Upload verification documents
  await this.storageService.uploadDocuments(dto.documents);

  return ngo;
}

// Admin reviews submission
@Get('admin/pending-ngos')
async getPendingNgos(@Query() filters: PendingFilters) {
  const pending = await this.adminService.findPendingNgos(filters);
  
  return pending.map(ngo => ({
    id: ngo.id,
    name: ngo.name,
    documents: ngo.documents,
    createdAt: ngo.createdAt,
  }));
}

// Approve NGO (becomes verified)
@Post('admin/ngos/:id/approve')
async approveNgo(@Param('id') id: string) {
  const ngo = await this.ngoService.verify(id);
  
  // Notify NGO via email
  await this.emailService.sendVerificationApproved(ngo.userId);
  
  return ngo;
}
```

### 3. Real-Time Analytics Dashboard

```typescript
// Fetch aggregated data using ClickHouse or PostgreSQL aggregation
@Get('dashboard/analytics')
async getAnalytics(@Req() req: Request) {
  const ngoId = await this.ngoService.getOwnerId(req.user.id);

  // Get total donations by currency
  const totals = await this.donationsService.getTotalByCurrency(ngoId);
  
  // Get monthly trend (last 12 months)
  const trend = await this.donationsService.getMonthlyTrend(ngoId, 12);
  
  // Get top 10 donors
  const topDonors = await this.donationsService.getTopDonors(ngoId, 10);
  
  // Get active vs completed projects
  const projects = await this.projectsService.getStatusDistribution(ngoId);

  return {
    revenue: totals.reduce((sum, t) => sum + Number(t.amount), 0),
    trend,
    topDonors,
    projects,
    lastUpdated: new Date().toISOString(),
  };
}
```

---

## 🔒 Security Measures

### Payment Security

- **PCI-DSS Compliance**: All card data handled via Stripe Elements (no sensitive data touches servers)
- **Webhook Signature Verification**: Validates Stripe/PayPal/YuKassa webhook signatures before processing
- **Double-Entry Validation**: Transaction amount checked against expected value from payment gateway

### Application Security

- **Rate Limiting**: 100 requests/min per IP on donation endpoints, 20 requests/min on admin routes
- **CSRF Protection**: Double-submit cookie pattern on all state-changing operations
- **Input Sanitization**: DOMPurify for HTML in project descriptions, Zod for type validation
- **SQL Injection Prevention**: Parameterized queries exclusively via Prisma ORM
- **XSS Filtering**: Content Security Policy headers (`default-src 'self'`, `script-src 'none'`)

### Session Management

- **Short-lived Access Tokens**: JWT expires after 15 minutes
- **Refresh Token Rotation**: New refresh token issued on each use, old revoked immediately
- **Secure Cookies**: `HttpOnly`, `Secure`, `SameSite=strict` flags enforced

---

## 🧪 Testing Strategy

```bash
# Unit tests (Jest) - covers services, controllers, utilities
npm run test:unit

# E2E tests (Playwright) - covers complete donation flows
npm run test:e2e

# Test coverage report
npm run test:coverage

# Run specific test file
npm run test:e2e -- donations.spec.ts
```

Test coverage targets:
- **Services**: ≥ 80%
- **Controllers**: ≥ 60%
- **API Endpoints**: ≥ 70%

---

## 🚀 Deployment Guide

### Docker Compose (Production-like Local Setup)

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tvorcy_dobra
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/tvorcy_dobra
      NODE_ENV: production
    ports:
      - "3001:3001"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

### Vercel (Frontend Only)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.tvorcydobra.ru`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXX`
4. Deploy automatically on push to `main`

**Recommended Build Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

### Railway (Backend)

1. Deploy directly from GitHub → Railway
2. Add PostgreSQL addon service
3. Configure environment variables:
   - `DATABASE_URL` (auto-provided by Railway)
   - `STRIPE_SECRET_KEY`
   - `PAYPAL_CLIENT_ID`
   - `JWT_SECRET`
4. Auto-deploys on every push

---

## 📊 Monitoring & Analytics

### Platform Metrics Tracked

- **Conversion Rate**: Views → Donations (% target: ≥ 3%)
- **Average Donation**: By currency and platform average: ₽5,000 / $75 / €65
- **Donor Retention**: Repeat donors within 30 days (target: ≥ 25%)
- **NGO Success Rate**: Projects reaching 100%+ goal (target: ≥ 60%)
- **Payment Failure Rate**: Failed transactions (target: ≤ 2%)

### Analytics Pipeline

Raw donation events → ClickHouse (OLAP) → Metabase dashboards:

1. **Aggregation Jobs** (每晚 runs): Calculate daily stats from raw events
2. **Real-Time Widgets**: WebSocket connection for live donation notifications
3. **Export**: CSV/PDF reports for NGO admins scheduled weekly

---

## 📄 Legal & Compliance

- **Terms of Service**: Platform reserves right to refuse suspicious transactions
- **Privacy Policy**: GDPR-compliant data handling, user can request deletion
- **Cookie Policy**: Essential cookies only (no tracking without consent)
- **Payment Terms**: 5% platform fee deducted from successful donations

---

## 👥 Contributing

We welcome contributions! Please follow these steps:

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with commits
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit Pull Request with detailed description

**Commit Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation updates
- `refactor:` Code refactoring (no behavior change)
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 📬 Contact

- **Email:** support@tvorcydobra.ru
- **Telegram:** @tvorcydobra_support
- **Website:** https://tvorcydobra.ru

---

**💝 Every donation matters — thank you for supporting our mission!**

*© 2026 ТворцыДavra. Powered by Next.js, NestJS, and passion for good.*

<!-- Screenshots will be added manually from local capture -->
<p align="center">
  <img src=".github/assets/screenshots.png" alt="Platform screenshots montage" style="border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);" />
</p>
