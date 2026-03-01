# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro Noctum is a premium astrology observatory dashboard built with React 19 + Vite + Tailwind CSS v4. Originally scaffolded from Google AI Studio. It combines Western astrology (zodiac, planets, houses) with Chinese metaphysics (BaZi pillars, Wu Xing elements) in a "Quiet Luxury" visual language.

## Commands

```bash
npm run dev       # Dev server on localhost:3000 (0.0.0.0)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # Type check only (tsc --noEmit)
npm run clean     # Remove dist/
```

Environment: copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`.

## Architecture

**Single-file app**: All components live in `src/App.tsx` (~730 lines). No routing, no global state management. React hooks only (`useState`, `useEffect`, `useMemo`).

**Component hierarchy** (top to bottom in the page):
1. `SystemHeaderStatusBar` — sticky header with status + coordinates
2. `HeroSolarSystemModule` — 60vh hero with orbital rings, animated planets, `InteractiveStarfield` (parallax + clickable stars), `DetailedSun` (multi-layer SVG with plasma effects)
3. `InsightCardQuotePanel` — serif quote with gold accents
4. `KPIStrip` — 3 metrics (Resonanz/Fokus/Energie)
5. Main 12-column grid containing: `ZodiacGrid12`, `PlanetsList` (expandable), `HousesOverview12`, `BaziPillarsPanel`, `WuxingBalancePanel`
6. `PersonalizedInsights` — form with simulated AI generation (Gemini wired but not yet active)

**Entry points**: `index.html` → `src/main.tsx` → `src/App.tsx`

## Design System

Strict "Quiet Luxury" aesthetic — no neon, no violet/pink, no cyberpunk. Gold is used only for lines and typography, never as fills.

**Color tokens** (defined in `src/index.css` via `@theme`):
- Parchment: `parchment-0` (#F4E9D6), `parchment-1`, `parchment-2`
- Royal Blue: `royal-950` through `royal-700`
- Antique Gold: `gold-bronze` (#826A4B), `gold-antique`, `gold-champagne`, `gold-highlight`

**Typography**: Inter (UI), Cormorant Garamond (headings/mystical), JetBrains Mono (data labels)

**Custom utility classes** in `index.css`: `.hairline-border*` (1px gold 30% opacity), `.gold-text`, `.gold-highlight`, `.script-font`, `.mono-tag`, `.parchment-texture`

## Tech Stack

- **React 19** with `react-jsx` transform (no `import React` needed)
- **Vite 6** with `@tailwindcss/vite` plugin and `@vitejs/plugin-react`
- **Tailwind CSS v4** — uses `@theme` directive, not `tailwind.config.js`
- **Motion** (Framer Motion v12) — parallax, spring physics, whileInView triggers
- **lucide-react** — icon library
- **Path alias**: `@/` resolves to project root

## Key Patterns

- **Parallax starfield**: `InteractiveStarfield` uses `requestAnimationFrame` + mouse tracking across 3 depth layers (60/30/10 stars). Stars are memoized via `useMemo`.
- **SVG animation**: `DetailedSun` uses `feTurbulence` + `feColorMatrix` filters for plasma effects with CSS spin animations at varying speeds/directions.
- **Responsive grid**: 12-column on desktop, collapses to single-column on mobile. Tailwind breakpoints `md:` and `lg:`.
- **Expandable sections**: `PlanetsList` uses motion height transitions with `overflow: hidden`.

## Gemini AI Integration

`@google/genai` is installed and `GEMINI_API_KEY` is exposed via `vite.config.ts` `define`. The `PersonalizedInsights` component currently simulates responses with a 1.5s delay — actual Gemini calls are not yet wired.
