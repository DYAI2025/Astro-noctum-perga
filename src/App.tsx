/**
 * ASTRO NOCTUM - PREMIUM OBSERVATORY DASHBOARD
 *
 * Stack: React 19 + Tailwind CSS v4 + Motion
 * Data:  BAFE /calculate/chart → real planetary positions, BaZi, Wu Xing, houses
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Activity, Eye, Zap } from 'lucide-react';
import type { BAFEChartResponse } from './types';
import { getUserId } from './api';
import SolarSystem3D from './components/SolarSystem3D';
import {
  BRAND,
  HERO_COORDINATES,
  INSIGHT_QUOTE,
  PLANETS_PANEL,
  HOUSES_PANEL,
  INSIGHTS_FORM,
  ZODIAC_GLYPHS,
  BAZI_GLYPHS
} from './content';

const STEM_CHARS: Record<string, string> = {
  Wood_Yang: '甲', Wood_Yin: '乙',
  Fire_Yang: '丙', Fire_Yin: '丁',
  Earth_Yang: '戊', Earth_Yin: '己',
  Metal_Yang: '庚', Metal_Yin: '辛',
  Water_Yang: '壬', Water_Yin: '癸'
};

const BRANCH_CHARS: Record<string, string> = {
  Rat: '子', Ox: '丑', Tiger: '寅', Rabbit: '卯',
  Dragon: '辰', Snake: '巳', Horse: '午', Goat: '未',
  Monkey: '申', Rooster: '酉', Dog: '戌', Pig: '亥'
};

const MAIN_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const getZodiacGlyph = (sign: string) => ZODIAC_GLYPHS[sign] ?? '✦';
const getBaziGlyph = (animal: string) => BAZI_GLYPHS[animal] ?? '✦';
const degToSignName = (deg: number) => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(((deg % 360) + 360) % 360 / 30)] || 'Aries';
};

const getPlanetHouse = (deg: number, houses: Record<string, number>): string => {
  const HOUSE_ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  for (let i = 1; i <= 12; i++) {
    const nextI = i === 12 ? 1 : i + 1;
    const currentCusp = houses[String(i)] ?? 0;
    const nextCusp = houses[String(nextI)] ?? 360;
    if (nextCusp > currentCusp) {
      if (deg >= currentCusp && deg < nextCusp) return HOUSE_ROMAN[i-1];
    } else {
      if (deg >= currentCusp || deg < nextCusp) return HOUSE_ROMAN[i-1];
    }
  }
  return 'I';
};

const normalizeWuxingToUI = (wuxing: any) => {
  if (!wuxing) return [];
  return [
    { name: 'Wood', value: wuxing.Wood || 0, color: 'bg-[#4A6B53]' },
    { name: 'Fire', value: wuxing.Fire || 0, color: 'bg-[#8B3A3A]' },
    { name: 'Earth', value: wuxing.Earth || 0, color: 'bg-[#826A4B]' },
    { name: 'Metal', value: wuxing.Metal || 0, color: 'bg-[#9CA3AF]' },
    { name: 'Water', value: wuxing.Water || 0, color: 'bg-[#1B2C4A]' }
  ];
};

const agentIds = ((import.meta as any).env?.VITE_ELEVENLABS_AGENT_IDS ?? (import.meta as any).env?.VITE_ELEVENLABS_AGENT_ID ?? "agent_xyz")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

const agentLabels = ((import.meta as any).env?.VITE_ELEVENLABS_AGENT_LABELS ?? "Astro Expert")
  .split(",")
  .map((s: string) => s.trim());

// Interactive Starfield Component
const InteractiveStarfield = () => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [activeStar, setActiveStar] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  const starsStyle = React.useMemo(() => {
    return layers.flatMap(l => l.stars).map(star => `
      .star-${star.id} {
        left: ${star.x}%;
        top: ${star.y}%;
        width: ${star.size}px;
        height: ${star.size}px;
        background-color: ${star.isGold ? '#826A4B' : '#0E1B33'};
        box-shadow: ${star.isGold ? '0 0 6px rgba(130,106,75,0.4)' : '0 0 4px rgba(14, 27, 51, 0.2)'};
      }
    `).join('\n');
  }, [layers]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto z-0" onClick={() => setActiveStar(null)}>
      <style dangerouslySetInnerHTML={{ __html: starsStyle }} />
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
              className={`absolute rounded-full cursor-pointer transition-transform hover:scale-150 star-${star.id}`}
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
          className={`absolute rounded-full border border-gold-bronze ring-${ring}`}
        />
      ))}
    </div>

    {/* Radial Dividers */}
    <div className="absolute inset-0 flex items-center justify-center opacity-10">
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <div
          key={deg}
          className={`absolute w-full h-[1px] bg-gold-bronze radial-${deg}`}
        />
      ))}
    </div>

    {/* Ephemeris Ticks – use inline style to avoid dynamic Tailwind class purging */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      {Array.from({ length: 72 }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-[95%] h-[1px] tick-${i}`}
        >
          <div
            className={`h-full bg-gold-bronze tick-inner-${i}`}
          />
        </div>
      ))}
    </div>

    {/* Coordinate Labels */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 mono-tag text-gold-bronze/50">{HERO_COORDINATES.top}</div>
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 mono-tag text-gold-bronze/50">{HERO_COORDINATES.bottom}</div>
    <div className="absolute left-8 top-1/2 -translate-y-1/2 mono-tag text-gold-bronze/50 -rotate-90">{HERO_COORDINATES.left}</div>
    <div className="absolute right-8 top-1/2 -translate-y-1/2 mono-tag text-gold-bronze/50 rotate-90">{HERO_COORDINATES.right}</div>

    {/* Zodiac cardinal labels — pointer-events-none so drag passes to canvas */}
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 mono-tag text-gold-bronze/40">0° ARIES</div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 mono-tag text-gold-bronze/40">180° LIBRA</div>
      <div className="absolute left-6 top-1/2 -translate-y-1/2 mono-tag text-gold-bronze/40 -rotate-90">90° CANCER</div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 mono-tag text-gold-bronze/40 rotate-90">270° CAPRICORN</div>
    </div>

    {/* Title — bottom-left, pointer-events-none */}
    <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
      <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-ink-text mb-2">Astro Noctum</h1>
      <p className="mono-tag text-gold-bronze">ORBITAL OVERVIEW // EPOCH 2026</p>
    </div>
  </section>
);

// ─── Insight Quote ───────────────────────────────────────────────────────────

const InsightCardQuotePanel = () => (
  <section className="w-full max-w-4xl mx-auto py-24 px-6 text-center">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="relative">
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

// ─── KPI Strip ───────────────────────────────────────────────────────────────

const KPIStrip = ({ chartData }: { chartData?: BAFEChartResponse | null }) => {
  const harmony = chartData?.wuxing.harmony_index;
  const sunSign = chartData?.positions.find(p => p.name === 'Sun')?.sign_name ?? 'Aries';

  const kpis = [
    { label: 'SONNENZEICHEN', value: getZodiacGlyph(sunSign), sub: sunSign.toUpperCase(), icon: null },
    { label: 'RESONANZ', value: harmony != null ? `${Math.round(harmony * 100)}%` : '87%', icon: Activity },
    { label: 'FOKUS',    value: chartData?.wuxing.dominant_planet.toUpperCase() ?? 'ZENITH',   icon: Eye },
    { label: 'ENERGIE',  value: chartData?.wuxing.dominant_bazi.toUpperCase()   ?? 'STEIGEND', icon: Zap },
  ];

  return (
    <section className="w-full hairline-border-y bg-parchment-1/30">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-y-0 divide-x divide-gold-bronze/20">
        {kpis.map((kpi, i) => (
          <div key={i} className={`p-8 flex flex-col items-center justify-center text-center ${i < kpis.length - 1 ? 'hairline-border-r' : ''}`}>
            {kpi.icon
              ? <kpi.icon className="w-5 h-5 text-gold-bronze mb-4 opacity-70" />
              : <span className="text-2xl text-gold-bronze mb-4 leading-none">{kpi.value}</span>
            }
            <span className="mono-tag mb-2">{kpi.label}</span>
            {kpi.icon
              ? <span className="font-serif text-3xl text-ink-text">{kpi.value}</span>
              : <span className="font-serif text-xl text-ink-text tracking-wide">{kpi.sub}</span>
            }
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Tile Components ─────────────────────────────────────────────────────────

const MajorTile = ({ title, value, glyph, subtitle, char }: { title: string; value: string; glyph: string; subtitle: string; char?: string }) => (
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

const SecondaryTile = ({ title, value, glyph, subtitle }: { title: string; value: string; glyph: string; subtitle?: string }) => (
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

// ─── Zodiac Matrix ───────────────────────────────────────────────────────────

const DEFAULT_ZODIAC = {
  sun_sign: 'Aries', moon_sign: 'Cancer', ascendant: 'Gemini',
  bazi_year: 'Dragon',  bazi_year_char:  '甲辰',
  bazi_month: 'Snake',  bazi_month_char: '巳',
  day_master: 'Earth',  day_master_char:  '戊',
  hour_master: 'Metal', hour_master_char: '庚',
};

const ZodiacMatrix = ({ chartData }: { chartData?: BAFEChartResponse | null }) => {
  let z = DEFAULT_ZODIAC;

  if (chartData) {
    const { positions, bazi, angles } = chartData;
    const sun  = positions.find(p => p.name === 'Sun');
    const moon = positions.find(p => p.name === 'Moon');
    const { year, month, day, hour } = bazi.pillars;
    z = {
      sun_sign:        sun?.sign_name  ?? 'Aries',
      moon_sign:       moon?.sign_name ?? 'Cancer',
      ascendant:       degToSignName(angles['Ascendant'] ?? 0),
      bazi_year:       year.animal,
      bazi_year_char:  (STEM_CHARS[year.stem]   ?? '') + (BRANCH_CHARS[year.branch]   ?? ''),
      bazi_month:      month.animal,
      bazi_month_char: (STEM_CHARS[month.stem]  ?? '') + (BRANCH_CHARS[month.branch]  ?? ''),
      day_master:      day.stem,
      day_master_char: STEM_CHARS[day.stem]  ?? '戊',
      hour_master:     hour.stem,
      hour_master_char: STEM_CHARS[hour.stem] ?? '庚',
    };
  }

  return (
    <div className="col-span-12 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MajorTile title="SUN SIGN"    value={z.sun_sign}   glyph={getZodiacGlyph(z.sun_sign)}   subtitle="Western Astrology" />
        <MajorTile title="YEAR ANIMAL" value={z.bazi_year}  glyph={getBaziGlyph(z.bazi_year)}   char={z.bazi_year_char} subtitle="BaZi / Chinese" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SecondaryTile title="ASCENDANT"    value={z.ascendant}   glyph={getZodiacGlyph(z.ascendant)} />
        <SecondaryTile title="MOON SIGN"    value={z.moon_sign}   glyph={getZodiacGlyph(z.moon_sign)} />
        <SecondaryTile title="MONTH ANIMAL" value={z.bazi_month}  glyph={getBaziGlyph(z.bazi_month)} />
        <SecondaryTile title="DAY MASTER"   value={z.day_master}  glyph={z.day_master_char} />
        <SecondaryTile title="HOUR MASTER"  value={z.hour_master} glyph={z.hour_master_char} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HousesOverview12 chartData={chartData} />
        <WuxingBalancePanel chartData={chartData} />
      </div>
    </div>
  );
};

// ─── Planets List ────────────────────────────────────────────────────────────

const DEMO_PLANETS = [
  { name: 'Sun',     glyph: '☉', status: 'Exalted',   house: '10th', sign: 'Aries',  aspects: 'Trine Mars, Sextile Jupiter', interpretation: 'A period of strong vitality and clear purpose. Your core identity aligns seamlessly with your public roles and ambitions.' },
  { name: 'Moon',    glyph: '☽', status: 'Detriment', house: '4th',  sign: 'Cancer', aspects: 'Square Venus',                 interpretation: 'Emotional depths are stirred. Seek comfort in your roots, but be mindful of overindulgence in seeking harmony.' },
  { name: 'Mercury', glyph: '☿', status: 'Domicile',  house: '1st',  sign: 'Gemini', aspects: 'Conjunct Ascendant',           interpretation: 'Your mind is sharp and communicative. A perfect time for intellectual pursuits and expressing your ideas clearly.' },
  { name: 'Venus',   glyph: '♀', status: 'Fall',      house: '7th',  sign: 'Taurus', aspects: 'Opposite Pluto',               interpretation: 'Intense relational dynamics. Transformative experiences in partnerships demand honesty and vulnerability.' },
  { name: 'Mars',    glyph: '♂', status: 'Peregrine', house: '12th', sign: 'Leo',    aspects: 'Trine Sun',                    interpretation: 'Hidden drives and subconscious actions. Channel your fiery energy into spiritual or behind-the-scenes creative work.' },
];

const PlanetsList = ({ chartData }: { chartData?: BAFEChartResponse | null }) => {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const planets = chartData
    ? chartData.positions
        .filter(p => MAIN_PLANETS.includes(p.name))
        .map(p => ({
          name: p.name,
          glyph: PLANET_GLYPHS[p.name] ?? '✦',
          status: p.is_retrograde ? 'Retrograde' : 'Direct',
          house: getPlanetHouse(p.longitude_deg, chartData.houses),
          sign: p.sign_name,
          aspects: `${p.degree_in_sign?.toFixed(2) ?? '?'}° ${p.sign_name}`,
          interpretation: p.is_retrograde
            ? `${p.name} bewegt sich retrograd bei ${p.degree_in_sign?.toFixed(1) ?? '?'}° ${p.sign_name} — eine Zeit der Vertiefung und inneren Schau.`
            : `${p.name} steht direkt bei ${p.degree_in_sign?.toFixed(1) ?? '?'}° ${p.sign_name} und entfaltet seine volle Strahlkraft.`,
        }))
    : DEMO_PLANETS;

  return (
    <div className="col-span-12 hairline-border rounded-3xl p-8 bg-parchment-1/50">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-ink-text mb-1">{PLANETS_PANEL.title}</h2>
        <span className="mono-tag">{PLANETS_PANEL.subtitle}</span>
      </div>
      <div className="flex flex-col gap-4">
        {planets.map((planet, i) => (
          <div key={i} className="flex flex-col p-4 hairline-border rounded-xl bg-parchment-2/30 cursor-pointer hover:bg-parchment-2/50 transition-colors"
            onClick={() => setExpanded(expanded === planet.name ? null : planet.name)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full hairline-border flex items-center justify-center text-gold-bronze text-lg shrink-0">{planet.glyph}</div>
                <div>
                  <div className="text-ink-text font-medium tracking-wide">{planet.name}</div>
                  <div className="mono-tag mt-1">{planet.sign} // {planet.house} House</div>
                </div>
              </div>
              <span className={`mono-tag ${planet.status === 'Exalted' || planet.status === 'Domicile' || planet.status === 'Direct' ? 'text-royal-700' : 'text-royal-800'}`}>
                {planet.status}
              </span>
            </div>
            {expanded === planet.name && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 hairline-border-t overflow-hidden">
                <div className="mb-2">
                  <span className="mono-tag text-royal-700">POSITION: </span>
                  <span className="mono-tag text-royal-900">{planet.aspects}</span>
                </div>
                <p className="font-serif italic text-royal-900/80 leading-relaxed">"{planet.interpretation}"</p>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Wu Xing Balance ─────────────────────────────────────────────────────────

const DEMO_ELEMENTS = [
  { name: 'Wood',  value: 30, color: 'bg-[#4A6B53]' },
  { name: 'Fire',  value: 45, color: 'bg-[#8B3A3A]' },
  { name: 'Earth', value: 15, color: 'bg-[#826A4B]' },
  { name: 'Metal', value: 5,  color: 'bg-[#9CA3AF]' },
  { name: 'Water', value: 5,  color: 'bg-[#1B2C4A]' },
];

const WuxingBalancePanel = ({ chartData }: { chartData?: BAFEChartResponse | null }) => {
  const elements = chartData ? normalizeWuxingToUI(chartData.wuxing.from_bazi) : DEMO_ELEMENTS;

  return (
    <div className="col-span-12 md:col-span-6 hairline-border rounded-3xl p-8 bg-parchment-1/50">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-ink-text mb-1">Wu Xing</h2>
        <span className="mono-tag">FIVE ELEMENTS BALANCE</span>
      </div>
      <div className="space-y-6 mt-12">
        {elements.map((el, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="mono-tag w-12 text-right">{el.name}</span>
            <div className="flex-1 h-1 bg-parchment-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${el.value}%` }}
                viewport={{ once: true }}
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
};

// ─── Houses Overview ─────────────────────────────────────────────────────────

const HOUSE_NAMES = ['Self','Value','Mind','Roots','Joy','Duty','Others','Depth','Truth','Legacy','Network','Spirit'];
const HOUSE_ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const DEMO_HOUSE_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const HousesOverview12 = ({ chartData }: { chartData?: BAFEChartResponse | null }) => {
  const houses = HOUSE_ROMAN.map((num, i) => {
    const sign = chartData ? degToSignName(chartData.houses[String(i + 1)] ?? 0) : null;
    return { num, name: HOUSE_NAMES[i], glyph: sign ? getZodiacGlyph(sign) : DEMO_HOUSE_GLYPHS[i] };
  });

  return (
    <div className="col-span-12 hairline-border rounded-3xl p-8 bg-parchment-1/50">
      <div className="flex justify-between items-end mb-8">
      <div>
        <h2 className="font-serif text-3xl text-ink-text mb-1">{HOUSES_PANEL.title}</h2>
        <span className="mono-tag">{HOUSES_PANEL.subtitle}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {houses.map((house, i) => (
          <div key={i} className="hairline-border rounded-xl p-4 flex flex-col items-center justify-center bg-parchment-1/40">
            <span className="font-serif text-2xl text-ink-text mb-2">{house.num}</span>
            <span className="mono-tag text-gold-bronze mb-2">{house.name}</span>
            <span className="text-xl text-royal-800/50">{house.glyph}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

// ─── Personalized Insights Form ───────────────────────────────────────────────

const PersonalizedInsights = ({
  onChartGenerated,
}: {
  onChartGenerated: (data: BAFEChartResponse) => void;
}) => {
  const [formData, setFormData] = React.useState({
    date: '',
    time: '',
    location: '',
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [insight, setInsight] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleGenerate = async () => {
    // ── Validation ─────────────────────────────────────────────────────────
    if (!formData.date || !formData.time || !formData.location) {
      setError('Please fill in all required fields: birth date, time, and location.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { createChart, generateInsight, registerUser, geocodeLocation } = await import('./api');
      await registerUser();

      // ── Geocode location string → real lat/lon ──────────────────────────
      const { lat, lon } = await geocodeLocation(formData.location);

      const chart = await createChart({
        birth_date:    formData.date,
        birth_time:    formData.time,
        location_name: formData.location,
        tz_id:         formData.tz,
        geo_lon_deg:   lon,
        geo_lat_deg:   lat,
      });

      // ── Propagate real chart data to all dashboard panels ───────────────
      if (chart.chart_data) {
        onChartGenerated(chart.chart_data as unknown as BAFEChartResponse);
      }

      const result = await generateInsight(chart.id);
      setInsight(result.content);

      try {
        const { upsertAstroProfile } = await import('./supabase');
        if (chart.chart_data) {
          const bazi = (chart.chart_data as any).bazi.pillars;
          const sun = (chart.chart_data as any).positions.find((p: any) => p.name === 'Sun');
          const moon = (chart.chart_data as any).positions.find((p: any) => p.name === 'Moon');
          const ascendantDeg = (chart.chart_data as any).angles?.Ascendant || 0;
          
          await upsertAstroProfile({
            user_id: getUserId(),
            sun_sign: sun?.sign_name,
            moon_sign: moon?.sign_name,
            ascendant: degToSignName(ascendantDeg),
            bazi_year: bazi?.year?.animal,
            bazi_year_char: (STEM_CHARS[bazi?.year?.stem] || '') + (BRANCH_CHARS[bazi?.year?.branch] || ''),
            bazi_month: bazi?.month?.animal,
            bazi_month_char: (STEM_CHARS[bazi?.month?.stem] || '') + (BRANCH_CHARS[bazi?.month?.branch] || ''),
            day_master: bazi?.day?.stem,
            day_master_char: STEM_CHARS[bazi?.day?.stem] || '',
            hour_master: bazi?.hour?.stem,
            hour_master_char: STEM_CHARS[bazi?.hour?.stem] || '',
            astro_json: { bafe: chart.chart_data, interpretation: result.content },
            astro_computed_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('Profile upsert failed', e);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insight');
    } finally {
      setIsGenerating(false);
    }
  };

  const f = INSIGHTS_FORM;

  return (
    <div id="insights-section" className="col-span-12 hairline-border rounded-3xl p-8 bg-parchment-1/50">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-ink-text mb-1">{f.title}</h2>
        <span className="mono-tag">{f.subtitle}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Birth Date */}
        <div className="flex flex-col gap-2">
          <label htmlFor="input-date" className="mono-tag text-gold-bronze">BIRTH DATE <span className="text-red-700 font-sans">*</span></label>
          <input id="input-date" title="Birth Date" type="date" value={formData.date} onChange={set('date')}
            className="bg-parchment-2/30 hairline-border rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:border-gold-bronze/50 font-mono text-sm" />
        </div>
        {/* Birth Time */}
        <div className="flex flex-col gap-2">
          <label htmlFor="input-time" className="mono-tag text-gold-bronze">BIRTH TIME <span className="text-red-700 font-sans">*</span></label>
          <input id="input-time" title="Birth Time" type="time" value={formData.time} onChange={set('time')}
            className="bg-parchment-2/30 hairline-border rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:border-gold-bronze/50 font-mono text-sm" />
        </div>
        {/* Location */}
        <div className="flex flex-col gap-2">
          <label htmlFor="input-location" className="mono-tag text-gold-bronze">BIRTH LOCATION <span className="text-red-700 font-sans">*</span></label>
          <input id="input-location" title="Birth Location" type="text" placeholder="e.g. Munich, DE" value={formData.location} onChange={set('location')}
            className="bg-parchment-2/30 hairline-border rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:border-gold-bronze/50 font-mono text-sm" />
        </div>
        {/* Timezone */}
        <div className="flex flex-col gap-2">
          <label htmlFor="tz-input" className="mono-tag text-gold-bronze">TIMEZONE</label>
          <input id="tz-input" title="Timezone" placeholder="e.g. Europe/Berlin" type="text" value={formData.tz} onChange={set('tz')}
            className="bg-parchment-2/30 hairline-border rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:border-gold-bronze/50 font-mono text-sm" />
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="hairline-border rounded-2xl p-8 bg-parchment-1/50 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-bronze/30 to-transparent" />
          <p className="font-serif italic text-2xl leading-relaxed text-royal-900 max-w-3xl mx-auto">"{insight}"</p>
        </motion.div>
      )}
    </div>
  );
};

// ─── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  const [chartData, setChartData] = useState<BAFEChartResponse | null>(null);
  const [selectedAgent, setSelectedAgent] = useState(agentIds[0] || '');

  React.useEffect(() => {
    // Inject ElevenLabs web component script once
    const scriptId = 'elevenlabs-convai-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-gold-bronze/30 selection:text-ink-text">
      <div className="parchment-texture" />
      <div className="noise-overlay" />

      <SystemHeaderStatusBar />

      <main className="pb-24">
        <HeroSolarSystemModule />
        <InsightCardQuotePanel />
        <KPIStrip chartData={chartData} />

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-12 gap-6">
            <ZodiacMatrix chartData={chartData} />
          </div>
          <PlanetsList chartData={chartData} />
        </div>
      </main>

      {/* Floating Agent Selector */}
      {selectedAgent && agentIds.length > 1 && (
        <div className="fixed bottom-24 right-6 z-50 bg-parchment-1/90 backdrop-blur-md hairline-border rounded-xl p-3 shadow-xl transition-all hover:bg-parchment-0">
          <label className="block text-[10px] font-mono tracking-widest text-gold-bronze mb-1 opacity-80">CONSULTING AGENT</label>
          <select 
            title="Select Astrologer"
            className="bg-transparent text-royal-900 text-sm font-serif font-medium outline-none cursor-pointer w-full"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            {agentIds.map((id, idx) => (
              <option key={id} value={id}>{agentLabels[idx] || `Agent ${idx + 1}`}</option>
            ))}
          </select>
        </div>
      )}

      {/* ElevenLabs Widget */}
      {selectedAgent && React.createElement('elevenlabs-convai', { 'agent-id': selectedAgent })}
    </div>
  );
}
