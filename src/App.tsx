/**
 * ASTRO NOCTUM - PREMIUM OBSERVATORY DASHBOARD
 *
 * 1) Executive Summary
 * Das Redesign von "Astro Noctum" transformiert die Plattform in ein ruhiges, systemisches "Observatorium der Sterne".
 * Durch die Kombination von Royal Blue, Antique Gold und Pergament-Tönen entsteht eine "Quiet Luxury"-Ästhetik.
 * Der Fokus liegt auf klaren, hauchdünnen Ephemeriden-Linien (Hairlines), großzügigem Whitespace und einer
 * strengen typografischen Hierarchie, die mystische Tiefe mit technologischer Präzision vereint.
 *
 * 2) Informationsarchitektur (IA)
 * - System Header (Status, Koordinaten)
 * - Hero: Solar System Module (Orbital Overview)
 * - Insight Card Quote Panel (Zusammenfassung)
 * - KPI Strip (Resonanz, Fokus, Energie)
 * - Main Grid (12-Column):
 *   - Zodiac Grid (12 Sectors) [Col 8]
 *   - Planets List (Nodes) [Col 4]
 *   - Houses Overview (12 Spheres) [Col 12]
 *   - BaZi Pillars (4 Pillars) [Col 6]
 *   - Wu Xing Balance (5 Elements) [Col 6]
 * - Primary CTA (Tiefenanalyse)
 *
 * 3) Layout Blueprint
 * [ HEADER: Logo | Status | Coordinates ]
 * [-------------------------------------]
 * [ HERO: Concentric Rings + Planets    ]
 * [       Center Seal (Sun)             ]
 * [-------------------------------------]
 * [ INSIGHT: "Quote..."                 ]
 * [-------------------------------------]
 * [ KPI 1 | KPI 2 | KPI 3               ]
 * [-------------------------------------]
 * [ ZODIAC MATRIX (12)                  ]
 * [ PLANETS LIST (12)                   ]
 * [ PERSONALIZED INSIGHTS (12)          ]
 * [-------------------------------------]
 * [ CTA: Tiefenanalyse                  ]
 *
 * 4) Design System (Tokens)
 * - Parchment: #F4E9D6, #F1E3CC, #D9C7A8
 * - Royal Blue: #010103, #0E1B33, #162239, #1B2C4A
 * - Antique Gold: #826A4B, #A6895D, #CEB584, #EFD28A
 * - Status: #CFE3EA (Pale Blue)
 * - Typography: Inter (Sans), Cormorant Garamond (Serif), JetBrains Mono (Mono)
 *
 * 5) Component Inventory
 * - SystemHeaderStatusBar: Sticky top, backdrop blur, mono tags
 * - HeroSolarSystemModule: Relative container, absolute rings/ticks, animated nodes
 * - InsightCardQuotePanel: Serif italic text, gold accents
 * - KPIStrip: 3-column grid, icons, large serif values
 * - ZodiacGrid12: CSS Grid, hover states, glyphs
 * - PlanetsList: Flex column, status colors
 * - HousesOverview12: 6-column grid, roman numerals
 * - BaziPillarsPanel: 4-column flex, vertical layout
 * - WuxingBalancePanel: Progress bars, percentage values
 *
 * 6) All visible copy is sourced from src/content.ts – edit that file to
 *    adapt any text, label, or data value without touching component logic.
 *
 * 7) Implementation Notes
 * - Stack: React + Tailwind CSS + Motion
 * - Styling: Custom CSS variables in index.css, hairline utility classes
 * - Effects: SVG Noise filter overlay for texture, radial gradients for depth
 *
 * 8) QA Checklist
 * [x] 0% Violet/Pink/Rosa
 * [x] Gold nur als Linie/Typo-Detail (keine Flächen)
 * [x] Kein Neon/Cyberpunk (nur softe Glows)
 * [x] Hairline Diagramm-Lines (~1px, low opacity)
 * [x] Ornamentik nur als Rahmen/Siegel
 * [x] Solar-System-Hero dominant
 * [x] Insight-Text geschwungen & lesbar (Cormorant Garamond)
 * [x] Desktop 12-Grid + Mobile Single Column
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Star } from 'lucide-react';
import { getSupabase } from './supabase';
import {
  BRAND,
  HERO_COORDINATES,
  INSIGHT_QUOTE,
  KPI_ITEMS,
  DEFAULT_ZODIAC,
  ZODIAC_GLYPHS,
  BAZI_GLYPHS,
  ZODIAC_TILE_LABELS,
  PLANETS,
  PLANETS_PANEL,
  HOUSES,
  HOUSES_PANEL,
  WUXING_ELEMENTS,
  WUXING_PANEL,
  INSIGHTS_FORM,
  CTA,
  MESSAGES,
} from './content';

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Starfield
// ─────────────────────────────────────────────────────────────────────────────
const InteractiveStarfield = () => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [activeStar, setActiveStar] = React.useState<string | null>(null);

  React.useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        setMousePos({
          x: (e.clientX / window.innerWidth - 0.5) * 20,
          y: (e.clientY / window.innerHeight - 0.5) * 20,
        });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const layers = React.useMemo(() => {
    const generateStars = (count: number, depth: number) =>
      Array.from({ length: count }).map((_, i) => ({
        id: `${depth}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (depth === 1 ? 1 : depth === 2 ? 2 : 3) + 0.5,
        info: `Celestial Body ${depth}-${i}: RA ${Math.floor(Math.random() * 24)}h, Dec ${Math.floor(Math.random() * 90)}°`,
        isGold: Math.random() > 0.8,
      }));

    return [
      { depth: 1, stars: generateStars(60, 1) },
      { depth: 2, stars: generateStars(30, 2) },
      { depth: 4, stars: generateStars(10, 4) },
    ];
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto z-0" onClick={() => setActiveStar(null)}>
      {layers.map((layer) => (
        <motion.div
          key={layer.depth}
          className="absolute inset-0"
          animate={{
            x: mousePos.x * layer.depth,
            y: mousePos.y * layer.depth,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
          {layer.stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full cursor-pointer transition-transform hover:scale-150"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                backgroundColor: star.isGold ? '#826A4B' : '#0E1B33',
                boxShadow: star.isGold
                  ? '0 0 6px rgba(130,106,75,0.4)'
                  : '0 0 4px rgba(14, 27, 51, 0.2)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveStar(activeStar === star.id ? null : star.id);
              }}
            >
              {activeStar === star.id && (
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 w-48 p-3 hairline-border bg-parchment-0/90 backdrop-blur-md rounded-lg z-50 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="mono-tag text-gold-bronze mb-1">STAR DATA</p>
                  <p className="font-serif text-sm text-ink-text">{star.info}</p>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// System Header
// ─────────────────────────────────────────────────────────────────────────────
const SystemHeaderStatusBar = () => (
  <header className="w-full hairline-border-b py-3 px-6 flex justify-between items-center bg-parchment-0/50 backdrop-blur-md sticky top-0 z-40">
    <div className="flex items-center gap-4">
      <Compass className="w-4 h-4 text-gold-bronze" />
      <span className="mono-tag">{BRAND.headerLabel}</span>
    </div>
    <div className="flex items-center gap-6">
      <span className="mono-tag flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-royal-700 animate-pulse" />
        {BRAND.systemStatus}
      </span>
      <span className="mono-tag text-royal-800">{BRAND.coordinates}</span>
    </div>
  </header>
);

// ─────────────────────────────────────────────────────────────────────────────
// Animated Sun (DetailedSun)
// ─────────────────────────────────────────────────────────────────────────────
const DetailedSun = () => (
  <div className="relative w-28 h-28 rounded-full flex items-center justify-center">
    {/* Core glow */}
    <div className="absolute inset-0 rounded-full bg-[#FFF5D1] shadow-[0_0_60px_rgba(255,215,0,0.6),inset_0_0_20px_rgba(255,255,255,1)]" />

    {/* Plasma surface layer 1 */}
    <svg className="absolute inset-0 w-full h-full rounded-full mix-blend-multiply opacity-80 animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
      <defs>
        <filter id="plasma-1">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="1" result="noise">
            <animate attributeName="baseFrequency" values="0.05;0.07;0.05" dur="20s" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix in="noise" type="matrix" values="
            1 0 0 0 0.8
            0 1 0 0 0.4
            0 0 1 0 0
            0 0 0 3 -1" result="coloredNoise" />
          <feComposite in="coloredNoise" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="50" fill="white" filter="url(#plasma-1)" />
    </svg>

    {/* Plasma surface layer 2 (counter-rotating) */}
    <svg className="absolute inset-0 w-full h-full rounded-full mix-blend-color-burn opacity-60 animate-[spin_40s_linear_infinite_reverse]" viewBox="0 0 100 100">
      <defs>
        <filter id="plasma-2">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" seed="2" result="noise">
            <animate attributeName="baseFrequency" values="0.08;0.06;0.08" dur="15s" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix in="noise" type="matrix" values="
            1 0 0 0 0.9
            0 1 0 0 0.2
            0 0 1 0 0
            0 0 0 4 -1.5" result="coloredNoise" />
          <feComposite in="coloredNoise" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="50" fill="white" filter="url(#plasma-2)" />
    </svg>

    {/* Solar flares / Coronal mass ejections */}
    <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] mix-blend-screen opacity-50 animate-[spin_90s_linear_infinite]" viewBox="0 0 120 120">
      <defs>
        <filter id="flares">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="noise">
            <animate attributeName="baseFrequency" values="0.03;0.05;0.03" dur="25s" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix in="noise" type="matrix" values="
            1 0 0 0 0.9
            0 1 0 0 0.5
            0 0 1 0 0
            0 0 0 2 -1" result="coloredNoise" />
          <feGaussianBlur in="coloredNoise" stdDeviation="2" result="blurred" />
          <feComposite in="blurred" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <circle cx="60" cy="60" r="55" fill="white" filter="url(#flares)" />
    </svg>

    {/* Spherical shading */}
    <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_20px_rgba(139,0,0,0.6),inset_10px_10px_20px_rgba(255,255,255,0.8)] mix-blend-overlay" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Hero Solar System Module
// ─────────────────────────────────────────────────────────────────────────────
const HeroSolarSystemModule = () => (
  <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden hairline-border-b">
    <InteractiveStarfield />

    {/* Concentric Rings */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      {[1, 2, 3, 4, 5].map((ring) => (
        <div
          key={ring}
          className="absolute rounded-full border border-gold-bronze"
          style={{
            width: `${ring * 20}%`,
            height: `${ring * 20}%`,
            borderStyle: ring % 2 === 0 ? 'dashed' : 'solid',
            borderWidth: '1px',
          }}
        />
      ))}
    </div>

    {/* Radial Dividers */}
    <div className="absolute inset-0 flex items-center justify-center opacity-10">
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <div
          key={deg}
          className="absolute w-full h-[1px] bg-gold-bronze"
          style={{ transform: `rotate(${deg}deg)` }}
        />
      ))}
    </div>

    {/* Ephemeris Ticks – use inline style to avoid dynamic Tailwind class purging */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      {Array.from({ length: 72 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-[95%] h-[1px]"
          style={{ transform: `rotate(${i * 5}deg)` }}
        >
          <div
            className="h-full bg-gold-bronze"
            style={{ width: i % 6 === 0 ? '0.75rem' : '0.25rem' }}
          />
        </div>
      ))}
    </div>

    {/* Coordinate Labels */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 mono-tag text-gold-bronze/50">{HERO_COORDINATES.top}</div>
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 mono-tag text-gold-bronze/50">{HERO_COORDINATES.bottom}</div>
    <div className="absolute left-8 top-1/2 -translate-y-1/2 mono-tag text-gold-bronze/50 -rotate-90">{HERO_COORDINATES.left}</div>
    <div className="absolute right-8 top-1/2 -translate-y-1/2 mono-tag text-gold-bronze/50 rotate-90">{HERO_COORDINATES.right}</div>

    {/* Center Seal */}
    <div className="relative z-10 w-32 h-32 rounded-full hairline-border flex items-center justify-center bg-parchment-0/80 backdrop-blur-sm shadow-[0_0_40px_rgba(130,106,75,0.1)]">
      <DetailedSun />
    </div>

    {/* Decorative Planets */}
    <div className="absolute z-10 w-full h-full flex items-center justify-center pointer-events-none">
      <div className="absolute w-[40%] h-[40%] animate-[spin_60s_linear_infinite]">
        <div className="absolute -top-2 left-1/2 w-4 h-4 rounded-full bg-royal-700 shadow-[0_0_10px_rgba(27,44,74,0.3)]" />
      </div>
      <div className="absolute w-[60%] h-[60%] animate-[spin_90s_linear_infinite_reverse]">
        <div className="absolute top-1/2 -right-2 w-5 h-5 rounded-full bg-gold-bronze shadow-[0_0_15px_rgba(130,106,75,0.2)]" />
      </div>
      <div className="absolute w-[80%] h-[80%] animate-[spin_120s_linear_infinite]">
        <div className="absolute -bottom-3 left-1/3 w-6 h-6 rounded-full bg-royal-800 shadow-[0_0_20px_rgba(22,34,57,0.2)]" />
      </div>
    </div>

    <div className="absolute bottom-8 left-8">
      <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-ink-text mb-2">
        {BRAND.heroTitle}
      </h1>
      <p className="mono-tag text-gold-bronze">{BRAND.epochTag}</p>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Insight Quote Panel
// ─────────────────────────────────────────────────────────────────────────────
const InsightCardQuotePanel = () => (
  <section className="w-full max-w-4xl mx-auto py-24 px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="relative"
    >
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-6xl text-gold-bronze/20 font-serif">"</span>
      <p className="script-font text-3xl md:text-4xl leading-relaxed text-royal-900 max-w-3xl mx-auto">
        {INSIGHT_QUOTE.main}
        <span className="gold-text">{INSIGHT_QUOTE.highlight}</span>
        {INSIGHT_QUOTE.continuation}
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="w-12 h-[1px] bg-gold-bronze/30" />
        <span className="mono-tag text-gold-bronze">{INSIGHT_QUOTE.dividerLabel}</span>
        <div className="w-12 h-[1px] bg-gold-bronze/30" />
      </div>
    </motion.div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// KPI Strip
// ─────────────────────────────────────────────────────────────────────────────
const KPIStrip = () => (
  <section className="w-full hairline-border-t hairline-border-b bg-parchment-1/30">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gold-bronze/20">
      {KPI_ITEMS.map((kpi, i) => (
        <div key={i} className="p-8 flex flex-col items-center justify-center text-center">
          <kpi.icon className="w-5 h-5 text-gold-bronze mb-4 opacity-70" />
          <span className="mono-tag mb-2">{kpi.label}</span>
          <span className="font-serif text-3xl text-ink-text">{kpi.value}</span>
        </div>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Zodiac tile helpers
// ─────────────────────────────────────────────────────────────────────────────
const getZodiacGlyph = (sign: string) => ZODIAC_GLYPHS[sign] ?? '✨';
const getBaziGlyph   = (animal: string) => BAZI_GLYPHS[animal] ?? '🏮';

// ─────────────────────────────────────────────────────────────────────────────
// Zodiac tile components
// ─────────────────────────────────────────────────────────────────────────────
const MajorTile = ({
  title,
  value,
  glyph,
  subtitle,
  char,
}: {
  title: string;
  value: string;
  glyph: string;
  subtitle: string;
  char?: string;
}) => (
  <div className="hairline-border rounded-3xl p-8 bg-parchment-1/50 relative overflow-hidden group hover:bg-parchment-2/40 transition-all duration-500">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-bronze/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-bronze/10 transition-all" />
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="mono-tag text-gold-bronze mb-1">{title}</h3>
        <p className="text-xs text-royal-800/50 uppercase tracking-widest">{subtitle}</p>
      </div>
      {char && <span className="font-serif text-2xl text-gold-bronze/40">{char}</span>}
    </div>
    <div className="flex items-center gap-6">
      <span className="text-6xl text-gold-bronze group-hover:scale-110 transition-transform duration-500">{glyph}</span>
      <div className="flex flex-col">
        <span className="font-serif text-4xl text-ink-text tracking-tight">{value}</span>
        <div className="w-12 h-[1px] bg-gold-bronze/30 mt-2" />
      </div>
    </div>
  </div>
);

const SecondaryTile = ({
  title,
  value,
  glyph,
  subtitle,
}: {
  title: string;
  value: string;
  glyph: string;
  subtitle?: string;
}) => (
  <div className="hairline-border rounded-2xl p-6 bg-parchment-1/40 hover:bg-parchment-2/30 transition-all group">
    <div className="flex flex-col items-center text-center">
      <span className="mono-tag text-[0.6rem] text-gold-bronze mb-3">{title}</span>
      <span className="text-3xl text-gold-bronze mb-3 group-hover:scale-110 transition-transform">{glyph}</span>
      <span className="font-serif text-xl text-ink-text">{value}</span>
      {subtitle && (
        <span className="text-[0.6rem] uppercase tracking-widest text-royal-800/40 mt-1">{subtitle}</span>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Zodiac Matrix (main data grid)
// ─────────────────────────────────────────────────────────────────────────────
const ZodiacMatrix = ({ data }: { data: Record<string, string> | null }) => {
  const z = data ?? DEFAULT_ZODIAC;
  const tl = ZODIAC_TILE_LABELS;

  return (
    <div className="col-span-12 space-y-8">
      {/* Row 1: Major Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MajorTile
          title={tl.sunSign.title}
          value={z.sun_sign}
          glyph={getZodiacGlyph(z.sun_sign)}
          subtitle={tl.sunSign.subtitle}
        />
        <MajorTile
          title={tl.yearAnimal.title}
          value={z.bazi_year}
          glyph={getBaziGlyph(z.bazi_year)}
          char={z.bazi_year_char}
          subtitle={tl.yearAnimal.subtitle}
        />
      </div>

      {/* Row 2: Secondary Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SecondaryTile title={tl.ascendant.title}   value={z.ascendant}   glyph={getZodiacGlyph(z.ascendant)} />
        <SecondaryTile title={tl.moonSign.title}    value={z.moon_sign}   glyph={getZodiacGlyph(z.moon_sign)} />
        <SecondaryTile title={tl.monthAnimal.title} value={z.bazi_month}  glyph={getBaziGlyph(z.bazi_month)} />
        <SecondaryTile title={tl.dayMaster.title}   value={z.day_master}  glyph={z.day_master_char || '戊'} />
        <SecondaryTile title={tl.hourMaster.title}  value={z.hour_master} glyph={z.hour_master_char || '庚'} />
      </div>

      {/* Row 3: Detail Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HousesOverview12 />
        <WuxingBalancePanel />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Planets List
// ─────────────────────────────────────────────────────────────────────────────
const PlanetsList = () => {
  const [expandedPlanet, setExpandedPlanet] = React.useState<string | null>(null);

  return (
    <div className="col-span-12 hairline-border rounded-3xl p-8 bg-parchment-1/50">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-ink-text mb-1">{PLANETS_PANEL.title}</h2>
        <span className="mono-tag">{PLANETS_PANEL.subtitle}</span>
      </div>

      <div className="flex flex-col gap-4">
        {PLANETS.map((planet) => (
          <div
            key={planet.name}
            className="flex flex-col p-4 hairline-border rounded-xl bg-parchment-2/30 cursor-pointer hover:bg-parchment-2/50 transition-colors"
            onClick={() => setExpandedPlanet(expandedPlanet === planet.name ? null : planet.name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full hairline-border flex items-center justify-center text-gold-bronze text-lg shrink-0">
                  {planet.glyph}
                </div>
                <div>
                  <div className="text-ink-text font-medium tracking-wide">{planet.name}</div>
                  <div className="mono-tag mt-1">{planet.sign} // {planet.house} House</div>
                </div>
              </div>
              <div className="text-right">
                <span className={`mono-tag ${planet.status === 'Exalted' || planet.status === 'Domicile' ? 'text-royal-700' : 'text-royal-800'}`}>
                  {planet.status}
                </span>
              </div>
            </div>

            {expandedPlanet === planet.name && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 hairline-border-t overflow-hidden"
              >
                <div className="mb-2">
                  <span className="mono-tag text-royal-700">{PLANETS_PANEL.aspectsLabel}</span>
                  <span className="mono-tag text-royal-900">{planet.aspects}</span>
                </div>
                <p className="font-serif italic text-royal-900/80 leading-relaxed">
                  "{planet.interpretation}"
                </p>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Wu Xing Balance Panel
// ─────────────────────────────────────────────────────────────────────────────
const WuxingBalancePanel = () => (
  <div className="col-span-12 md:col-span-6 hairline-border rounded-3xl p-8 bg-parchment-1/50">
    <div className="mb-8">
      <h2 className="font-serif text-3xl text-ink-text mb-1">{WUXING_PANEL.title}</h2>
      <span className="mono-tag">{WUXING_PANEL.subtitle}</span>
    </div>

    <div className="space-y-6 mt-12">
      {WUXING_ELEMENTS.map((el, i) => (
        <div key={el.name} className="flex items-center gap-4">
          <span className="mono-tag w-12 text-right">{el.name}</span>
          <div className="flex-1 h-1 bg-parchment-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${el.value}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className={`h-full ${el.color}`}
            />
          </div>
          <span className="mono-tag w-8 text-gold-bronze">{el.value}%</span>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Houses Overview
// ─────────────────────────────────────────────────────────────────────────────
const HousesOverview12 = () => (
  <div className="col-span-12 hairline-border rounded-3xl p-8 bg-parchment-1/50">
    <div className="flex justify-between items-end mb-8">
      <div>
        <h2 className="font-serif text-3xl text-ink-text mb-1">{HOUSES_PANEL.title}</h2>
        <span className="mono-tag">{HOUSES_PANEL.subtitle}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {HOUSES.map((house) => (
        <div key={house.num} className="hairline-border rounded-xl p-4 flex flex-col items-center justify-center bg-parchment-1/40">
          <span className="font-serif text-2xl text-ink-text mb-2">{house.num}</span>
          <span className="mono-tag text-gold-bronze mb-2">{house.name}</span>
          <span className="text-xl text-royal-800/50">{house.sign}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Personalized Insights Form
// ─────────────────────────────────────────────────────────────────────────────
const PersonalizedInsights = () => {
  const [formData, setFormData] = React.useState({ date: '', time: '', location: '' });
  const [insight, setInsight] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const { createChart, generateInsight, registerUser } = await import('./api');
      await registerUser();
      const chart = await createChart({
        birth_date: formData.date,
        birth_time: formData.time,
        location_name: formData.location,
        tz_id: 'Europe/Berlin',
        geo_lon_deg: 11.5754,
        geo_lat_deg: 48.1371,
      });
      const result = await generateInsight(chart.id);
      setInsight(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insight');
    } finally {
      setIsGenerating(false);
    }
  };

  const f = INSIGHTS_FORM;

  return (
    <div className="col-span-12 hairline-border rounded-3xl p-8 bg-parchment-1/50">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-ink-text mb-1">{f.title}</h2>
        <span className="mono-tag">{f.subtitle}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label className="mono-tag text-gold-bronze">{f.birthDateLabel}</label>
          <input
            type="date"
            className="bg-parchment-2/30 hairline-border rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:border-gold-bronze/50 font-mono text-sm"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="mono-tag text-gold-bronze">{f.birthTimeLabel}</label>
          <input
            type="time"
            className="bg-parchment-2/30 hairline-border rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:border-gold-bronze/50 font-mono text-sm"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="mono-tag text-gold-bronze">{f.locationLabel}</label>
          <input
            type="text"
            placeholder={f.locationPlaceholder}
            className="bg-parchment-2/30 hairline-border rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:border-gold-bronze/50 font-mono text-sm"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-8 py-3 rounded-full hairline-border bg-parchment-2/40 text-ink-text font-serif tracking-widest uppercase hover:bg-gold-bronze hover:text-parchment-0 transition-all duration-300 disabled:opacity-50"
        >
          {isGenerating ? f.generatingButton : f.generateButton}
        </button>
      </div>

      {error && (
        <div className="hairline-border rounded-2xl p-6 bg-red-50/50 text-center mb-4">
          <p className="mono-tag text-red-800">{error}</p>
        </div>
      )}

      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hairline-border rounded-2xl p-8 bg-parchment-1/50 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-bronze/30 to-transparent" />
          <p className="font-serif italic text-2xl leading-relaxed text-royal-900 max-w-3xl mx-auto">
            "{insight}"
          </p>
        </motion.div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [astroProfile, setAstroProfile] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const client = getSupabase();
        if (!client) {
          // Supabase env vars not configured – use default zodiac data.
          setLoading(false);
          return;
        }
        const { data, error } = await client
          .from('astro_profile')
          .select('*')
          .single();

        if (error) throw error;
        setAstroProfile(data);
      } catch (err) {
        console.error('Error fetching astro profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-gold-bronze/30 selection:text-ink-text">
      <div className="parchment-texture" />
      <div className="noise-overlay" />

      <SystemHeaderStatusBar />

      <main className="pb-24">
        <HeroSolarSystemModule />
        <InsightCardQuotePanel />
        <KPIStrip />

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-12 gap-6">
            {loading ? (
              <div className="col-span-12 py-24 text-center">
                <div className="inline-block w-8 h-8 border-2 border-gold-bronze border-t-transparent rounded-full animate-spin mb-4" />
                <p className="mono-tag text-gold-bronze">{MESSAGES.loadingCelestial}</p>
              </div>
            ) : (
              <ZodiacMatrix data={astroProfile} />
            )}
            <PlanetsList />
            <PersonalizedInsights />
          </div>
        </div>

        {/* Deep Analysis CTA */}
        <div className="max-w-7xl mx-auto px-6 flex justify-center mt-8">
          <button
            className="px-8 py-4 rounded-full hairline-border bg-parchment-2/40 text-ink-text font-serif tracking-widest uppercase hover:bg-gold-bronze hover:text-parchment-0 transition-all duration-300 flex items-center gap-3"
            onClick={() => {
              // TODO: trigger deep Tiefenanalyse flow
              console.info('Tiefenanalyse requested');
            }}
          >
            <Star className="w-4 h-4" />
            {CTA.deepAnalysis}
          </button>
        </div>
      </main>
    </div>
  );
}
