# YEZ BEE FASHION 🐝✨

> **Premium Luxury Women's Clothing Ecommerce Platform**

A production-ready, full-stack luxury ecommerce application built with Next.js 14, TypeScript, Tailwind CSS, MongoDB, and Express. Designed to emotionally impress users within 5 seconds and maximize trust, engagement, and conversions.

---

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router, SSR, ISR)
- **TypeScript** (strict mode)
- **Tailwind CSS** (custom luxury design system)
- **Framer Motion** (premium animations)
- **GSAP** (advanced animations)
- **Lenis** (smooth scrolling)
- **Zustand** (state management)
- **React Query** (server state)
- **React Hook Form + Zod** (form validation)
- **Lucide React** (icons)

### Backend
- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Razorpay** (payments)
- **Cloudinary** (media)
- **Redis** (caching)
- **Nodemailer** (emails)

---

## 📁 Project Structure

```
yezbee-fashion/
├── frontend/                    # Next.js 14 Application
│   ├── public/                  # Static assets (logos, favicon)
│   └── src/
│       ├── app/                 # App Router pages
│       │   ├── page.tsx         # Home page
│       │   ├── category/[slug]/ # Category listing
│       │   ├── product/[slug]/  # Product detail
│       │   ├── cart/            # Shopping cart
│       │   ├── checkout/        # One-page checkout
│       │   ├── account/         # User dashboard
│       │   ├── wishlist/        # Wishlist
│       │   ├── compare/         # Product comparison
│       │   ├── search/          # Search results
│       │   ├── admin/           # Admin dashboard
│       │   └── ...
│       ├── components/
│       │   ├── ui/              # Design system (20 components)
│       │   ├── layout/          # Layout components
│       │   ├── home/            # Home page sections
│       │   ├── product/         # Product components
│       │   ├── cart/            # Cart components
│       │   ├── account/         # Account components
│       │   └── admin/           # Admin components
│       ├── hooks/               # Custom React hooks
│       ├── store/               # Zustand stores
│       ├── providers/           # React context providers
│       ├── lib/                 # Utilities, API client, SEO
│       ├── types/               # TypeScript interfaces
│       └── styles/              # Global CSS & design tokens
│
└── backend/                     # Express API Server
    └── src/
        ├── config/              # DB, Cloudinary, Redis, Email
        ├── models/              # Mongoose schemas
        ├── controllers/         # Route handlers
        ├── routes/              # API routes
        ├── middleware/          # Auth, validation, upload
        └── utils/               # Helpers, constants
```

---

## 🎨 Design System

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| Gold | `#C9A84C` | Primary, CTAs, accents |
| Gold Light | `#E8D48B` | Highlights |
| Gold Dark | `#A8882E` | Hover states |
| Champagne | `#F5E6C8` | Backgrounds, borders |
| Warm White | `#FAF7F2` | Page background |
| Dark | `#1A1A1A` | Headers, footers |
| Emerald | `#2D6A4F` | Success states |
| Soft Red | `#E74C3C` | Errors, urgency |

### Typography
- **Display:** Playfair Display (headings, hero text)
- **Body:** Inter (paragraphs, navigation, body copy)

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Setup environment
cp backend/.env.example backend/.env

# Run development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## 📄 License

All rights reserved. YEZ BEE FASHION © 2026
#   Y E Z - B E E  
