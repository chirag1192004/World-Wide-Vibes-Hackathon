# 🎨 PERSON 2 — FRONTEND & UX ENGINEER
## CivicPulse (Atlas Edition) — Complete Implementation Guide

> **Role:** React (Next.js), MapTiler 3D, Tailwind UI, Animations
> **Workdir:** `World Wide Vibes Hackathon/hackethon_frontend/`
> **Status:** ✅ **COMPLETED**

---

## 1. PROJECT STATE

**The frontend portion of this project is fully complete.** 
The original Vite-based React app (`civicpulse/`) was deprecated in favor of a modern **Next.js 15 App Router** application (`hackethon_frontend/`). 

### Technology Stack Used:
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 + `next-themes` (Dark/Light mode)
- **Map:** MapTiler SDK (`@maptiler/sdk`) 
- **Components:** Radix UI primitives (via `shadcn/ui`)
- **Animations:** Framer Motion (`framer-motion`)
- **Charts:** Recharts (`recharts`)
- **Notifications:** Sonner (`sonner`)
- **PDF Export:** jsPDF + html2canvas
- **Icons:** Lucide React

---

## 2. DIRECTORY STRUCTURE (The Completed Work)

```
hackethon_frontend/
├── app/
│   ├── page.tsx                   ← Animated Landing Page (Globe, Particles)
│   ├── layout.tsx                 ← Root Layout (Fonts, ThemeProvider)
│   ├── globals.css                ← Core design system & map overrides
│   └── app/
│       ├── page.tsx               ← Main Dashboard (Map + Panels + Context)
│       └── layout.tsx             ← Dashboard Layout Wrapper
│
├── components/
│   ├── civic-map.tsx              ← MapTiler initialization + 3D Heatmap pillars
│   ├── entrepreneur-panel.tsx     ← Mode 1: Site Selection (Charts, Autocomplete)
│   ├── contractor-panel.tsx       ← Mode 2: B2G Procurement (Bid Gen)
│   ├── resident-panel.tsx         ← Mode 3: Civic Equity (Advocacy Gen)
│   ├── ai-chat.tsx                ← Floating Atlas AI Assistant
│   ├── address-autocomplete.tsx   ← MapTiler Geocoding Search Input
│   ├── onboarding-tour.tsx        ← 3-Step First Visit Guided Tour
│   ├── skeleton-cards.tsx         ← Loading State Shimmer UI
│   ├── score-ring.tsx             ← Animated SVG Score Indicator
│   └── ui/                        ← Extracted Radix UI internal components
│
└── lib/
    ├── utils.ts                   ← Tailwind merge (cn)
    ├── export-pdf.ts              ← jsPDF generation utility
    └── mock-data.ts               ← TypeScript interfaces & fallback data
```

---

## 3. COMPLETED FEATURES

### 1. The Core Application
- Beautiful Animated Landing page with 3D CSS globe and floating "data particles".
- Dashboard with deep routing (`/app`) and lifted global state (Location, Category, Theme).
- Keyboard shortcuts implemented: `1`, `2`, `3` to switch modes, `Esc` to close overlays.
- Seamless Dark/Light mode tracking via `next-themes`.

### 2. CivicMap Integration
- Integrated MapTiler SDK (replaced Mapbox to avoid WebGL context limits).
- Custom 3D Hexagon/Pillar extrusion for the Business Survival Heatmap.
- Click-to-analyze interaction passing coordinates up to the Dashboard state.
- Dynamic `category` filtering — map pillars change height based on the selected business type in Entrepreneur mode.

### 3. Entrepreneur Mode (Site Selection)
- Address Autocomplete utilizing MapTiler's Geocoding API with debouncing.
- 5-Year Survival Trend area chart built with `recharts`.
- Animated `ScoreRing` for the primary survival score.
- PDF Export capability for the AI-generated Location Prospectus.

### 4. Contractor Mode (B2G Procurement)
- List view of upcoming city contracts.
- Selectable contract cards with click interactions.
- AI Bid Generator UI that queries the backend `/api/generate` endpoint.
- PDF Export and Download options for generated bids.

### 5. Resident Mode (Civic Equity)
- 4-metric scorecard (Infrastructure, Permits, Safety, Equity) comparing the selected neighborhood against the wealthiest district.
- AI Advocacy Letter generator addressed to the specific local Council Member.
- Copy-to-clipboard and PDF Export tools for the output letter.

### 6. Polish & UX Enhancements
- **Atlas AI Assistant:** A floating chat panel enabling conversational data queries.
- **Onboarding Tour:** A 3-step modal with local storage persistence to guide new users.
- **Loading Skeletons:** Animated layout-matching skeletons during API fetches.
- **Toast Notifications:** Success/Error feedback loops via `sonner` across the entire app.

---

## 4. WHAT PERSON 1 AND 3 NEED TO KNOW

As the frontend is fully locked and running on port `3005`, the backend engineers MUST ensure the FastAPI server (`localhost:8000`) strictly adheres to the data structures defined in `lib/mock-data.ts`.

- The UI expects the `/api/generate` endpoint to handle a `chat` mode in addition to `entrepreneur`, `contractor`, and `resident`.
- The UI expects the `/api/heatmap` endpoint to accept a `category` query parameter (e.g., `?category=restaurant`).

No further frontend adjustments are required. The application is demo-ready.
