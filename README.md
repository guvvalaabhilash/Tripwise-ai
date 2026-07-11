# TripWise AI — Frontend (Phase 1)

Premium AI-powered trip planning, budget management, and expense sharing application. **Frontend only** — no backend, Supabase, or API integration yet.

## Quick Start

```bash
cd tripwise-ai
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** — glassmorphism design system
- **Framer Motion** — animations and transitions
- **Recharts** — animated charts
- **React Router v7** — routing
- **Lucide React** — icons

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, destinations, testimonials |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password reset |
| `/verify-otp` | OTP verification |
| `/dashboard` | Main dashboard |
| `/trip-planner` | Multi-step trip creation wizard |
| `/trips/:id` | Trip details with itinerary, budget, expenses |
| `/expenses` | Expense management with charts and modals |
| `/split` | Expense splitting and settlements |
| `/ai-chat` | AI travel assistant (mock responses) |
| `/profile` | User profile and saved destinations |
| `/settings` | Theme, notifications, language, privacy |

## Project Structure

```
src/
├── app/           # App root and routing
├── components/    # Reusable UI and domain components
├── layouts/       # Sidebar, Navbar, Auth layout
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utils and mock data
├── services/      # API service placeholders (Phase 2)
├── constants/     # App constants
├── types/         # TypeScript interfaces
└── styles/        # Global CSS and design tokens
```

## Design System

- **Primary:** Royal Blue (`#3b5bdb`)
- **Accent:** Cyan (`#22d3ee`)
- **Background:** Dark Navy (`#0a0f1e`)
- **Typography:** Inter, Plus Jakarta Sans, Poppins
- **Effects:** Glassmorphism, frosted cards, soft glows, smooth gradients

## Phase 2 Integration Points

- `src/services/` — Replace mock data calls with Supabase/API
- `src/lib/mockData.ts` — Swap for real data fetching
- Auth pages — Connect to authentication provider
- AI Chat — Connect to AI backend service

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
