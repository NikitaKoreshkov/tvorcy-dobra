# 🌟 ТворцыДобра — Благотворительная платформа для пожертвований

**Объединяем НКО, волонтёров и жертвователей через безопасные платежи и прозрачный интерфейс.**

## 💝 Ключевые возможности

- **Безопасные платежи**: Stripe, PayPal, ЮKassa интеграция
- **Дашборд для НКО**: аналитика пожертвований, управление проектами  
- **Админ панель**: модерация организаций, верификация документов
- **Multi-currency**: ₽, $, €, KZT поддержка
- **SEO optimized**: метаданные, Open Graph, structured data

<table>
  <tr>
    <td width="50%"><img src=".github/assets/homepage.jpg" alt="Главная страница" /></td>
    <td width="50%"><img src=".github/assets/donation.jpg" alt="Страница пожертвования" /></td>
  </tr>
  <tr>
    <td width="50%"><img src=".github/assets/dashboard.jpg" alt="NGO дашборд" /></td>
    <td width="50%"><img src=".github/assets/mobile.jpg" alt="Мобильная версия" width="250" /></td>
  </tr>
</table>

## 🛠 Tech Stack

| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS 10, PostgreSQL, Prisma ORM, JWT auth |
| Payment | Stripe API, PayPal SDK, ЮKassa integration |
| Deployment | Docker Compose, Vercel (FE), Railway (BE) |

## 📦 Quick Start

```bash
# Clone repository
git clone https://github.com/NikitaKoreshkov/donate.git
cd donate

# Install all dependencies
npm run install:all

# Start development environment
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

See `.env.example` for configuration details.

## 🏗 Project Structure

```
donate/
├── frontend/                 # Next.js 14 application
│   ├── app/                  # App Router pages
│   │   ├── (auth)/           # Login/register flows
│   │   ├── ngo-dashboard/    # NGO analytics dashboard
│   │   └── donation/[id]/    # Donation page
│   └── components/           # React components
├── backend/                  # NestJS 10 application
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # JWT + OAuth strategies
│   │   │   ├── donations/    # Payment processing
│   │   │   └── admin/        # Moderation
│   │   └── prisma/           # Database schema
└── docker-compose.yml        # Development setup
```

## 🔐 Security

- Rate limiting on donation endpoints
- CSRF protection via double-submit cookies  
- PCI-DSS compliance via Stripe Elements
- SQL injection prevention via Prisma ORM

## 📊 Analytics

Platform tracks conversion rates, average donation amounts, donor retention, and NGO success metrics with ClickHouse integration.

---

**💝 Help those in need - Every donation matters!**

*© 2026 ТворцыДобра. All rights reserved.*
