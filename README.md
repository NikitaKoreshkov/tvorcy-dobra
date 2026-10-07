# 🌟 ТворцыДобра: Благотворительная платформа для пожертвований

**Платформа объединяет НКО, благотворителей и волонтёров через современный интерфейс.** 

## 🚀 Особенности

- **Монетизация проектов НКО** — безопасные платежи через Stripe/PayPal/ЮKassa
- **Прозрачность отчислений** — 5% комиссия платформы на обслуживание
- **Дашборд для НКО** — аналитика пожертвований, управление проектами
- **Админ панель** — модерация организаций, верификация документов
- **Multi-currency support** — ₽, $, €, KZT
- **SEO optimized** — метаданные, Open Graph, structured data

<!-- Screenshots will be added from .github/assets/ -->
<p align="center">
  <img src=".github/assets/homepage.jpg" alt="Главная страница - подборка проектов" width="600"/>
  <br/><small>Главная страница с каруселью проектов и фильтрацией</small>
</p>

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS 10, PostgreSQL, Prisma ORM, TypeORM |
| **Payment** | Stripe API, PayPal SDK, ЮKassa integration |
| **Auth** | JWT + Refresh Tokens, OAuth2 (Google, VK, Yandex) |
| **Analytics** | ClickHouse for donations tracking, Metabase dashboards |
| **Deployment** | Docker Compose, Vercel (FE), Railway (BE) |

---

## 📦 Quick Start

```bash
# Клонирование
git clone https://github.com/NikitaKoreshkov/donate.git
cd donate

# Установка зависимостей (frontend + backend)
npm run install:all

# Запуск development окружения
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Production setup

#### Backend (.env):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secure_password_here
DB_NAME=tvorcy_dobra
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=AaB12...
JWT_SECRET=your-secret-key-minimum-32-chars
CORS_ORIGINS=http://localhost:3000,https://tvorcydobra.ru
```

#### Frontend (.env):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=https://tvorcydobra.ru
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXX
```

---

## 🏗 Project Structure

```
donate/
├── frontend/                     # Next.js 14 application
│   ├── app/                      # App Router pages
│   │   ├── (auth)/               # Login/register flows
│   │   ├── (public)/             # Public landing pages
│   │   ├── ngo-dashboard/        # NGO analytics dashboard
│   │   ├── donation/[projectId]/ # Single project donation page
│   │   └── api/                  # Next.js API routes
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── donation/             # Donation form, progress bar
│   │   └── ngo/                  # NGO dashboard widgets
│   ├── lib/
│   │   ├── stripe.ts             # Stripe client-side integration
│   │   ├── api-client.ts         # Axios instance with interceptors
│   │   └── utils.ts              # Currency formatting, helpers
│   └── public/images/            # Hero banners, NGO logos
│
├── backend/                      # NestJS 10 application
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/             # JWT auth, OAuth strategies
│   │   │   ├── ngo/              # NGO CRUD, verification
│   │   │   ├── projects/         # Projects, categories, tags
│   │   │   ├── donations/        # Payment processing, webhooks
│   │   │   └── admin/            # Moderation, platform settings
│   │   ├── common/
│   │   │   ├── decorators/       # Roles, validation pipes
│   │   │   └── filters/          # Global exception filters
│   │   └── main.ts               # Entry point
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   └── test/                     # Integration tests
│
└── docker-compose.yml            # Development environment
```

---

## 🎯 Key Features Implementation

### 1. **Donation Flow**

```typescript
// Frontend: Donor selects amount and payment method
<DonationForm
  projectId={id}
  onDonate={handleDonation}
  predefinedAmounts={[500, 1000, 5000]} // RUB
/>

// Backend: Process payment via Stripe
@Post('donate/:projectId')
async createDonation(
  @Body() dto: CreateDonationDto,
  @Req() req: Request
) {
  const session = await this.stripeService.createCheckoutSession(
    dto.projectId,
    dto.amount,
    dto.paymentMethod,
    req.user.id
  );
  
  return { sessionId: session.id, url: session.url };
}
```

### 2. **NGO Dashboard**

Real-time analytics showing:
- Total donations (₽, $, €)
- Monthly recurring revenue (MRR)
- Active vs completed projects
- Top donors leaderboard
- Geographic distribution of donors

### 3. **Admin Moderation Queue**

Pending NGOs awaiting verification:
- ✅ Organization registration documents
- ✅ Tax exemption certificate
- ✅ Bank account details
- ✅ Project proposal samples

---

## 🔐 Security Measures

- **Rate limiting**: 100 requests/min per IP on donation endpoints
- **CSRF protection**: Double-submit cookie pattern
- **Input sanitization**: DOMPurify for HTML in project descriptions
- **SQL injection prevention**: Parameterized queries via Prisma
- ** XSS filtering**: Content Security Policy headers
- **Payment security**: PCI-DSS compliance via Stripe Elements

---

## 📊 Analytics & Reporting

Platform tracks:
- Conversion rate (view → donation)
- Average donation amount by currency
- Retention rate (repeat donors)
- NGO success metrics (funding goals achieved)

Exports to ClickHouse for ML-based fraud detection.

---

## 🧪 Testing

```bash
# Unit tests (Jest)
npm run test:backend
npm run test:frontend

# E2E tests (Playwright)
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 🚢 Deployment

### Docker Compose (local production-like)
```bash
docker-compose up -d
# Services: PostgreSQL, Backend, Frontend, Adminer UI
```

### Vercel (Frontend only)
```bash
vercel deploy --prod
# Environment variables required:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Railway (Backend)
```bash
railway up
# Auto-deploys with environment variables injected
```

---

## 📄 License

MIT License © 2026 ТворцыДобра

*All donations processed through secure payment gateways. Platform reserves right to refuse suspicious transactions.*

---

**💝 Help those in need - Every donation matters!**
