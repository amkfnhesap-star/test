# SkillSeekers — Premium AI-Native Services Marketplace

A production-quality services marketplace inspired by TaskRabbit, Thumbtack, and Fiverr, built with a premium AI-native experience.

## Tech Stack

- **Next.js 15** — App Router, Server Components, TypeScript
- **Tailwind CSS** — Custom design system with dark mode
- **Framer Motion** — Smooth animations throughout
- **Supabase** — Auth, database, real-time features
- **Stripe** — Secure payment processing
- **Recharts** — Analytics charts in dashboards
- **Lucide React** — Icon system

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
cd skillseekers
npm install
```

### Environment Setup

```bash
cp .env.local.example .env.local
```

Fill in your keys:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
- `STRIPE_SECRET_KEY` — from Stripe dashboard

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with all sections |
| `/login` | Login page |
| `/register` | Registration with role selection |
| `/search` | Search & filter providers |
| `/providers/[id]` | Provider profile page |
| `/book/[serviceId]` | Multi-step booking flow |
| `/dashboard` | Customer dashboard |
| `/dashboard/bookings` | Customer booking history |
| `/dashboard/messages` | Real-time chat |
| `/provider/dashboard` | Provider overview + analytics |
| `/provider/jobs` | Job requests management |
| `/provider/earnings` | Earnings + payout tracking |
| `/admin` | Admin panel (overview, users, verifications) |

## Features

### Customer
- AI-powered smart search with animated placeholders
- Filter by category, rating, price, availability
- Grid/list view toggle for search results
- Multi-step booking wizard (Service → Schedule → Payment → Confirm)
- Real-time chat with providers
- Dashboard with stats, upcoming bookings, messages

### Provider
- Toggle availability in real-time
- Accept/decline job requests
- Earnings dashboard with Recharts graphs
- Payout tracking with progress indicator
- Job request management queue

### Platform
- Dark/light mode with smooth transitions
- Fully responsive (mobile-first)
- AI matching suggestion UI
- Trust & safety section
- Auto-scrolling testimonials marquee
- Glassmorphism design elements
- Framer Motion page/component animations

### Admin
- Platform overview with revenue charts
- Provider/user management table
- Verification queue with approve/reject
- Dispute management
- Platform health metrics

## Design System

- **Primary color:** Indigo 500 (`#6366f1`)
- **Accent:** Violet 600 (`#7c3aed`)
- **Dark bg:** Zinc 950 (`#09090b`)
- **Border radius:** 12-24px (rounded-2xl)
- **Typography:** Inter via Google Fonts
- **Animations:** Framer Motion with `whileInView` scroll triggers

## Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, Register
│   ├── admin/              # Admin panel
│   ├── book/[serviceId]/   # Booking flow
│   ├── dashboard/          # Customer dashboard
│   ├── provider/           # Provider dashboard
│   ├── providers/[id]/     # Provider profile
│   └── search/             # Search page
├── components/
│   ├── home/               # Homepage sections
│   ├── layout/             # Navbar, Footer, ThemeProvider
│   └── ui/                 # Reusable UI components
├── data/                   # Dummy data
├── lib/                    # Supabase, Stripe, utils
└── types/                  # TypeScript interfaces
```

## Monetization

- **10% platform commission** on all bookings
- Featured provider subscriptions (coming soon)
- Priority listing upgrades (coming soon)
- AI-powered premium matching (coming soon)
