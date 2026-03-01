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
 * [ ZODIAC GRID (8) | PLANETS LIST (4)  ]
 * [ HOUSES OVERVIEW (12)                ]
 * [ BAZI PILLARS (6)| WU XING (6)       ]
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
 * 6) Copy Deck (DE)
 * - Title: Astro Noctum
 * - Tags: SYSTEM ONLINE, ORBITAL OVERVIEW // EPOCH 2026, CELESTIAL ARCHITECTURE
 * - Insight: "Die Konstellationen flüstern von einer Zeit des Übergangs. Saturns Präsenz im zehnten Haus fordert Struktur, während die fließenden Wasser des Wu Xing zur Anpassung mahnen."
 * 
 * 7) Implementation Notes
 * - Stack: React + Tailwind CSS + Framer Motion
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

import React from 'react';
import { motion } from 'motion/react';
import { Compass, Moon, Sun, Star, Activity, Eye, Zap } from 'lucide-react';

const InteractiveStarfield = () => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [activeStar, setActiveStar] = React.useState<number | null>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stars = React.useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    depth: Math.random() * 3 + 1,
    info: `Celestial Body ${i + 1}: RA ${Math.floor(Math.random() * 24)}h, Dec ${Math.floor(Math.random() * 90)}°`
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-parchment-1 cursor-pointer hover:bg-gold-highlight transition-colors"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            boxShadow: '0 0 4px rgba(241, 227, 204, 0.4)'
          }}
          animate={{
            x: mousePos.x * star.depth,
            y: mousePos.y * star.depth,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          onClick={() => setActiveStar(activeStar === star.id ? null : star.id)}
        >
          {activeStar === star.id && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 p-3 hairline-border bg-royal-950/90 backdrop-blur-md rounded-lg z-50">
              <p className="mono-tag text-gold-antique mb-1">STAR DATA</p>
              <p className="font-serif text-sm text-parchment-0">{star.info}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

const SystemHeaderStatusBar = () => (
  <header className="w-full hairline-border-b py-3 px-6 flex justify-between items-center bg-royal-950/50 backdrop-blur-md sticky top-0 z-40">
    <div className="flex items-center gap-4">
      <Compass className="w-4 h-4 text-gold-antique" />
      <span className="mono-tag">ASTRO NOCTUM // OBSERVATORY</span>
    </div>
    <div className="flex items-center gap-6">
      <span className="mono-tag flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-status-pale-blue animate-pulse"></span>
        SYSTEM ONLINE
      </span>
      <span className="mono-tag text-parchment-2">LAT: 48.1371° N // LON: 11.5754° E</span>
    </div>
  </header>
);

const HeroSolarSystemModule = () => (
  <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden hairline-border-b">
    <InteractiveStarfield />
    
    {/* Concentric Rings */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      {[1, 2, 3, 4, 5].map((ring) => (
        <div 
          key={ring}
          className="absolute rounded-full border border-gold-antique"
          style={{ 
            width: `${ring * 20}%`, 
            height: `${ring * 20}%`,
            borderStyle: ring % 2 === 0 ? 'dashed' : 'solid',
            borderWidth: '1px'
          }}
        />
      ))}
    </div>
    
    {/* Radial Dividers */}
    <div className="absolute inset-0 flex items-center justify-center opacity-10">
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <div 
          key={deg}
          className="absolute w-full h-[1px] bg-gold-antique"
          style={{ transform: `rotate(${deg}deg)` }}
        />
      ))}
    </div>

    {/* Ephemeris Ticks */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      {Array.from({ length: 72 }).map((_, i) => (
        <div 
          key={i}
          className="absolute w-[95%] h-[1px]"
          style={{ transform: `rotate(${i * 5}deg)` }}
        >
          <div className={`w-${i % 6 === 0 ? '3' : '1'} h-full bg-gold-antique`} />
        </div>
      ))}
    </div>

    {/* Coordinate Labels */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 mono-tag text-gold-antique/50">0° ARIES</div>
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 mono-tag text-gold-antique/50">180° LIBRA</div>
    <div className="absolute left-8 top-1/2 -translate-y-1/2 mono-tag text-gold-antique/50 -rotate-90">90° CANCER</div>
    <div className="absolute right-8 top-1/2 -translate-y-1/2 mono-tag text-gold-antique/50 rotate-90">270° CAPRICORN</div>

    {/* Center Seal */}
    <div className="relative z-10 w-32 h-32 rounded-full hairline-border flex items-center justify-center bg-royal-950/80 backdrop-blur-sm shadow-[0_0_40px_rgba(166,137,93,0.1)]">
      <Sun className="w-12 h-12 text-gold-highlight" />
    </div>

    {/* Planets (Decorative) */}
    <div className="absolute z-10 w-full h-full flex items-center justify-center pointer-events-none">
      <div className="absolute w-[40%] h-[40%] animate-[spin_60s_linear_infinite]">
        <div className="absolute -top-2 left-1/2 w-4 h-4 rounded-full bg-status-pale-blue shadow-[0_0_10px_rgba(207,227,234,0.5)]" />
      </div>
      <div className="absolute w-[60%] h-[60%] animate-[spin_90s_linear_infinite_reverse]">
        <div className="absolute top-1/2 -right-2 w-5 h-5 rounded-full bg-gold-antique shadow-[0_0_15px_rgba(166,137,93,0.4)]" />
      </div>
      <div className="absolute w-[80%] h-[80%] animate-[spin_120s_linear_infinite]">
        <div className="absolute -bottom-3 left-1/3 w-6 h-6 rounded-full bg-parchment-2 shadow-[0_0_20px_rgba(217,199,168,0.3)]" />
      </div>
    </div>

    <div className="absolute bottom-8 left-8">
      <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-parchment-0 mb-2">
        Astro Noctum
      </h1>
      <p className="mono-tag text-gold-antique">ORBITAL OVERVIEW // EPOCH 2026</p>
    </div>
  </section>
);

const InsightCardQuotePanel = () => (
  <section className="w-full max-w-4xl mx-auto py-24 px-6 text-center">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="relative"
    >
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-6xl text-gold-antique/20 font-serif">"</span>
      <p className="script-font text-3xl md:text-4xl leading-relaxed text-parchment-1 max-w-3xl mx-auto">
        Die Konstellationen flüstern von einer Zeit des Übergangs. 
        <span className="gold-text"> Saturns Präsenz im zehnten Haus</span> fordert Struktur, 
        während die fließenden Wasser des Wu Xing zur Anpassung mahnen.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="w-12 h-[1px] bg-gold-antique/30" />
        <span className="mono-tag text-gold-antique">SYNTHESIS</span>
        <div className="w-12 h-[1px] bg-gold-antique/30" />
      </div>
    </motion.div>
  </section>
);

const KPIStrip = () => (
  <section className="w-full hairline-border-y bg-royal-900/30">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gold-antique/20">
      {[
        { label: "RESONANZ", value: "87%", icon: Activity },
        { label: "FOKUS", value: "ZENITH", icon: Eye },
        { label: "ENERGIE", value: "STEIGEND", icon: Zap }
      ].map((kpi, i) => (
        <div key={i} className="p-8 flex flex-col items-center justify-center text-center">
          <kpi.icon className="w-5 h-5 text-gold-antique mb-4 opacity-70" />
          <span className="mono-tag mb-2">{kpi.label}</span>
          <span className="font-serif text-3xl text-parchment-0">{kpi.value}</span>
        </div>
      ))}
    </div>
  </section>
);

const ZodiacGrid12 = () => {
  const signs = [
    { name: "Aries", glyph: "♈", element: "Fire" },
    { name: "Taurus", glyph: "♉", element: "Earth" },
    { name: "Gemini", glyph: "♊", element: "Air" },
    { name: "Cancer", glyph: "♋", element: "Water" },
    { name: "Leo", glyph: "♌", element: "Fire" },
    { name: "Virgo", glyph: "♍", element: "Earth" },
    { name: "Libra", glyph: "♎", element: "Air" },
    { name: "Scorpio", glyph: "♏", element: "Water" },
    { name: "Sagittarius", glyph: "♐", element: "Fire" },
    { name: "Capricorn", glyph: "♑", element: "Earth" },
    { name: "Aquarius", glyph: "♒", element: "Air" },
    { name: "Pisces", glyph: "♓", element: "Water" },
  ];

  return (
    <div className="col-span-12 lg:col-span-8 hairline-border rounded-3xl p-8 bg-royal-900/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-antique/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-serif text-3xl text-parchment-0 mb-1">Zodiac Matrix</h2>
          <span className="mono-tag">CELESTIAL ARCHITECTURE</span>
        </div>
        <span className="mono-tag text-parchment-2 border border-gold-antique/30 px-3 py-1 rounded-full">12 SECTORS</span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {signs.map((sign, i) => (
          <div key={i} className="hairline-border rounded-xl p-4 flex flex-col items-center justify-center aspect-square hover:bg-royal-800/50 transition-colors cursor-default group">
            <span className="text-3xl text-gold-antique mb-2 group-hover:text-gold-highlight transition-colors">{sign.glyph}</span>
            <span className="mono-tag text-parchment-1 mb-1">{sign.name}</span>
            <span className="text-[0.55rem] uppercase tracking-widest text-parchment-2/50">{sign.element}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanetsList = () => {
  const planets = [
    { name: "Sun", glyph: "☉", status: "Exalted", house: "10th" },
    { name: "Moon", glyph: "☽", status: "Detriment", house: "4th" },
    { name: "Mercury", glyph: "☿", status: "Domicile", house: "1st" },
    { name: "Venus", glyph: "♀", status: "Fall", house: "7th" },
    { name: "Mars", glyph: "♂", status: "Peregrine", house: "12th" },
  ];

  return (
    <div className="col-span-12 lg:col-span-4 hairline-border rounded-3xl p-8 bg-royal-900/20">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-parchment-0 mb-1">Planetary Nodes</h2>
        <span className="mono-tag">CURRENT POSITIONS</span>
      </div>

      <div className="flex flex-col gap-4">
        {planets.map((planet, i) => (
          <div key={i} className="flex items-center justify-between p-4 hairline-border rounded-xl bg-royal-950/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full hairline-border flex items-center justify-center text-gold-antique text-lg">
                {planet.glyph}
              </div>
              <div>
                <div className="text-parchment-0 font-medium tracking-wide">{planet.name}</div>
                <div className="mono-tag mt-1">{planet.house} House</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`mono-tag ${planet.status === 'Exalted' || planet.status === 'Domicile' ? 'text-status-pale-blue' : 'text-parchment-2'}`}>
                {planet.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BaziPillarsPanel = () => {
  const pillars = [
    { title: "YEAR", stem: "Wood", branch: "Dragon", char: "甲辰" },
    { title: "MONTH", stem: "Fire", branch: "Snake", char: "丁巳" },
    { title: "DAY", stem: "Earth", branch: "Horse", char: "戊午" },
    { title: "HOUR", stem: "Metal", branch: "Monkey", char: "庚申" },
  ];

  return (
    <div className="col-span-12 md:col-span-6 hairline-border rounded-3xl p-8 bg-royal-900/20">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-parchment-0 mb-1">BaZi Pillars</h2>
        <span className="mono-tag">FOUR PILLARS OF DESTINY</span>
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {pillars.map((pillar, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="mono-tag mb-4 text-gold-antique">{pillar.title}</span>
            <div className="w-full hairline-border rounded-2xl py-8 flex flex-col items-center justify-center bg-royal-950/50 gap-4">
              <span className="text-3xl font-serif text-parchment-0">{pillar.char[0]}</span>
              <div className="w-4 h-[1px] bg-gold-antique/30" />
              <span className="text-3xl font-serif text-parchment-0">{pillar.char[1]}</span>
            </div>
            <div className="mt-4 flex flex-col items-center gap-1">
              <span className="text-xs text-parchment-1 uppercase tracking-wider">{pillar.stem}</span>
              <span className="text-xs text-parchment-2 uppercase tracking-wider">{pillar.branch}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WuxingBalancePanel = () => {
  const elements = [
    { name: "Wood", value: 30, color: "bg-[#4A6B53]" },
    { name: "Fire", value: 45, color: "bg-[#8B3A3A]" },
    { name: "Earth", value: 15, color: "bg-[#826A4B]" },
    { name: "Metal", value: 5, color: "bg-[#9CA3AF]" },
    { name: "Water", value: 5, color: "bg-[#1B2C4A]" },
  ];

  return (
    <div className="col-span-12 md:col-span-6 hairline-border rounded-3xl p-8 bg-royal-900/20">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-parchment-0 mb-1">Wu Xing</h2>
        <span className="mono-tag">FIVE ELEMENTS BALANCE</span>
      </div>

      <div className="space-y-6 mt-12">
        {elements.map((el, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="mono-tag w-12 text-right">{el.name}</span>
            <div className="flex-1 h-1 bg-royal-950 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${el.value}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className={`h-full ${el.color}`}
              />
            </div>
            <span className="mono-tag w-8 text-gold-antique">{el.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HousesOverview12 = () => {
  const houses = [
    { num: "I", name: "Self", sign: "♈" },
    { num: "II", name: "Value", sign: "♉" },
    { num: "III", name: "Mind", sign: "♊" },
    { num: "IV", name: "Roots", sign: "♋" },
    { num: "V", name: "Joy", sign: "♌" },
    { num: "VI", name: "Duty", sign: "♍" },
    { num: "VII", name: "Others", sign: "♎" },
    { num: "VIII", name: "Depth", sign: "♏" },
    { num: "IX", name: "Truth", sign: "♐" },
    { num: "X", name: "Legacy", sign: "♑" },
    { num: "XI", name: "Network", sign: "♒" },
    { num: "XII", name: "Spirit", sign: "♓" },
  ];

  return (
    <div className="col-span-12 hairline-border rounded-3xl p-8 bg-royal-900/20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-serif text-3xl text-parchment-0 mb-1">Astrological Houses</h2>
          <span className="mono-tag">MUNDANE SPHERES</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {houses.map((house, i) => (
          <div key={i} className="hairline-border rounded-xl p-4 flex flex-col items-center justify-center bg-royal-950/30">
            <span className="font-serif text-2xl text-parchment-0 mb-2">{house.num}</span>
            <span className="mono-tag text-gold-antique mb-2">{house.name}</span>
            <span className="text-xl text-parchment-2/50">{house.sign}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanetDetails = () => {
  const planets = [
    { name: "Sun", glyph: "☉", sign: "Aries", house: "10th", aspects: "Trine Mars, Sextile Jupiter", interpretation: "A period of strong vitality and clear purpose. Your core identity aligns seamlessly with your public roles and ambitions." },
    { name: "Moon", glyph: "☽", sign: "Cancer", house: "4th", aspects: "Square Venus", interpretation: "Emotional depths are stirred. Seek comfort in your roots, but be mindful of overindulgence in seeking harmony." },
    { name: "Mercury", glyph: "☿", sign: "Gemini", house: "1st", aspects: "Conjunct Ascendant", interpretation: "Your mind is sharp and communicative. A perfect time for intellectual pursuits and expressing your ideas clearly." },
    { name: "Venus", glyph: "♀", sign: "Taurus", house: "7th", aspects: "Opposite Pluto", interpretation: "Intense relational dynamics. Transformative experiences in partnerships demand honesty and vulnerability." },
    { name: "Mars", glyph: "♂", sign: "Leo", house: "12th", aspects: "Trine Sun", interpretation: "Hidden drives and subconscious actions. Channel your fiery energy into spiritual or behind-the-scenes creative work." },
  ];

  return (
    <div className="col-span-12 hairline-border rounded-3xl p-8 bg-royal-900/20">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-parchment-0 mb-1">Planetary Dignities & Aspects</h2>
        <span className="mono-tag">DETAILED CELESTIAL ANALYSIS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planets.map((p, i) => (
          <div key={i} className="hairline-border rounded-xl p-6 bg-royal-950/30 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full hairline-border flex items-center justify-center text-gold-antique text-2xl shrink-0">
                {p.glyph}
              </div>
              <div>
                <div className="text-parchment-0 font-medium text-lg">{p.name}</div>
                <div className="mono-tag text-parchment-2">{p.sign} // {p.house} House</div>
              </div>
            </div>
            <div className="mb-4">
              <span className="mono-tag text-status-pale-blue">ASPECTS: </span>
              <span className="mono-tag text-parchment-1">{p.aspects}</span>
            </div>
            <div className="flex-1">
              <p className="font-serif italic text-parchment-1/80 leading-relaxed text-lg">
                "{p.interpretation}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PersonalizedInsights = () => {
  const [formData, setFormData] = React.useState({ date: '', time: '', location: '' });
  const [insight, setInsight] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setInsight(`Based on your alignment at ${formData.location || 'your birthplace'} on ${formData.date || 'your birth date'}, the current transit of Jupiter forms a harmonious trine with your natal Sun. This indicates a period of profound personal growth and expansion. The celestial architecture suggests focusing your energies on long-term visions rather than immediate gains.`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="col-span-12 hairline-border rounded-3xl p-8 bg-royal-900/20">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-parchment-0 mb-1">Personalized Insights</h2>
        <span className="mono-tag">NATAL CHART SYNTHESIS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label className="mono-tag text-gold-antique">BIRTH DATE</label>
          <input 
            type="date" 
            className="bg-royal-950/50 hairline-border rounded-xl px-4 py-3 text-parchment-0 focus:outline-none focus:border-gold-antique/50 font-mono text-sm"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="mono-tag text-gold-antique">BIRTH TIME</label>
          <input 
            type="time" 
            className="bg-royal-950/50 hairline-border rounded-xl px-4 py-3 text-parchment-0 focus:outline-none focus:border-gold-antique/50 font-mono text-sm"
            value={formData.time}
            onChange={e => setFormData({...formData, time: e.target.value})}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="mono-tag text-gold-antique">LOCATION</label>
          <input 
            type="text" 
            placeholder="e.g. Munich, DE"
            className="bg-royal-950/50 hairline-border rounded-xl px-4 py-3 text-parchment-0 focus:outline-none focus:border-gold-antique/50 font-mono text-sm"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
          />
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-8 py-3 rounded-full hairline-border bg-royal-900/50 text-parchment-0 font-serif tracking-widest uppercase hover:bg-gold-antique hover:text-royal-950 transition-all duration-300 disabled:opacity-50"
        >
          {isGenerating ? 'CALCULATING ALIGNMENTS...' : 'GENERATE SYNTHESIS'}
        </button>
      </div>

      {insight && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hairline-border rounded-2xl p-8 bg-royal-950/40 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-antique/30 to-transparent" />
          <p className="font-serif italic text-2xl leading-relaxed text-parchment-1 max-w-3xl mx-auto">
            "{insight}"
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <div className="relative min-h-screen selection:bg-gold-antique/30 selection:text-parchment-0">
      <div className="parchment-texture" />
      <div className="noise-overlay" />
      
      <SystemHeaderStatusBar />
      
      <main className="pb-24">
        <HeroSolarSystemModule />
        <InsightCardQuotePanel />
        <KPIStrip />
        
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-12 gap-6">
            <ZodiacGrid12 />
            <PlanetsList />
            <PlanetDetails />
            <HousesOverview12 />
            <BaziPillarsPanel />
            <WuxingBalancePanel />
            <PersonalizedInsights />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex justify-center mt-8">
          <button className="px-8 py-4 rounded-full hairline-border bg-royal-900/50 text-parchment-0 font-serif tracking-widest uppercase hover:bg-gold-antique hover:text-royal-950 transition-all duration-300 flex items-center gap-3">
            <Star className="w-4 h-4" />
            Tiefenanalyse
          </button>
        </div>
      </main>
    </div>
  );
}
