/**
 * ASTRO NOCTUM – CENTRALIZED CONTENT CONFIGURATION
 *
 * Edit this single file to adapt every visible text string, data value,
 * label, and dataset across the entire dashboard. All components read
 * from this module so changes propagate automatically.
 */

import { Activity, Eye, Zap, LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Brand & Header
// ─────────────────────────────────────────────────────────────────────────────
export const BRAND = {
  headerLabel: 'ASTRO NOCTUM // OBSERVATORY',
  systemStatus: 'SYSTEM ONLINE',
  coordinates: 'LAT: 48.1371° N // LON: 11.5754° E',
  heroTitle: 'Astro Noctum',
  epochTag: 'ORBITAL OVERVIEW // EPOCH 2026',
};

// Coordinate labels around the hero orbital ring
export const HERO_COORDINATES = {
  top: '0° ARIES',
  bottom: '180° LIBRA',
  left: '90° CANCER',
  right: '270° CAPRICORN',
};

// ─────────────────────────────────────────────────────────────────────────────
// Insight Quote Panel
// ─────────────────────────────────────────────────────────────────────────────
export const INSIGHT_QUOTE = {
  main: 'Die Konstellationen flüstern von einer Zeit des Übergangs.',
  highlight: ' Saturns Präsenz im zehnten Haus',
  continuation:
    ' fordert Struktur, während die fließenden Wasser des Wu Xing zur Anpassung mahnen.',
  dividerLabel: 'SYNTHESIS',
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI Strip
// ─────────────────────────────────────────────────────────────────────────────
export interface KPIItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

export const KPI_ITEMS: KPIItem[] = [
  { label: 'RESONANZ', value: '87%',      icon: Activity },
  { label: 'FOKUS',    value: 'ZENITH',   icon: Eye },
  { label: 'ENERGIE',  value: 'STEIGEND', icon: Zap },
];

// ─────────────────────────────────────────────────────────────────────────────
// Zodiac & BaZi – Default data (shown before a chart is generated)
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_ZODIAC = {
  sun_sign:       'Aries',
  bazi_year:      'Dragon',
  bazi_year_char: '甲辰',
  ascendant:      'Gemini',
  moon_sign:      'Cancer',
  bazi_month:      'Snake',
  bazi_month_char: '巳',
  day_master:      'Earth',
  day_master_char: '戊',
  hour_master:     'Metal',
  hour_master_char: '庚',
};

// ─────────────────────────────────────────────────────────────────────────────
// Glyph lookup maps
// ─────────────────────────────────────────────────────────────────────────────
export const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈',  Taurus: '♉',     Gemini: '♊',      Cancer: '♋',
  Leo: '♌',    Virgo: '♍',      Libra: '♎',        Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export const BAZI_GLYPHS: Record<string, string> = {
  Rat: '子',    Ox: '丑',    Tiger: '寅', Rabbit: '卯',
  Dragon: '辰', Snake: '巳', Horse: '午', Goat: '未',
  Monkey: '申', Rooster: '酉', Dog: '戌', Pig: '亥',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tile labels inside ZodiacMatrix
// ─────────────────────────────────────────────────────────────────────────────
export const ZODIAC_TILE_LABELS = {
  sunSign:      { title: 'SUN SIGN',      subtitle: 'Western Astrology' },
  yearAnimal:   { title: 'YEAR ANIMAL',   subtitle: 'BaZi / Chinese' },
  ascendant:    { title: 'ASCENDANT' },
  moonSign:     { title: 'MOON SIGN' },
  monthAnimal:  { title: 'MONTH ANIMAL' },
  dayMaster:    { title: 'DAY MASTER' },
  hourMaster:   { title: 'HOUR MASTER' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Planetary Nodes
// ─────────────────────────────────────────────────────────────────────────────
export interface Planet {
  name: string;
  glyph: string;
  status: string;
  house: string;
  sign: string;
  aspects: string;
  interpretation: string;
}

export const PLANETS: Planet[] = [
  {
    name: 'Sun', glyph: '☉', status: 'Exalted', house: '10th', sign: 'Aries',
    aspects: 'Trine Mars, Sextile Jupiter',
    interpretation:
      'A period of strong vitality and clear purpose. Your core identity aligns seamlessly with your public roles and ambitions.',
  },
  {
    name: 'Moon', glyph: '☽', status: 'Detriment', house: '4th', sign: 'Cancer',
    aspects: 'Square Venus',
    interpretation:
      'Emotional depths are stirred. Seek comfort in your roots, but be mindful of overindulgence in seeking harmony.',
  },
  {
    name: 'Mercury', glyph: '☿', status: 'Domicile', house: '1st', sign: 'Gemini',
    aspects: 'Conjunct Ascendant',
    interpretation:
      'Your mind is sharp and communicative. A perfect time for intellectual pursuits and expressing your ideas clearly.',
  },
  {
    name: 'Venus', glyph: '♀', status: 'Fall', house: '7th', sign: 'Taurus',
    aspects: 'Opposite Pluto',
    interpretation:
      'Intense relational dynamics. Transformative experiences in partnerships demand honesty and vulnerability.',
  },
  {
    name: 'Mars', glyph: '♂', status: 'Peregrine', house: '12th', sign: 'Leo',
    aspects: 'Trine Sun',
    interpretation:
      'Hidden drives and subconscious actions. Channel your fiery energy into spiritual or behind-the-scenes creative work.',
  },
];

export const PLANETS_PANEL = {
  title: 'Planetary Nodes',
  subtitle: 'CURRENT POSITIONS & ASPECTS',
  aspectsLabel: 'ASPECTS: ',
};

// ─────────────────────────────────────────────────────────────────────────────
// Astrological Houses
// ─────────────────────────────────────────────────────────────────────────────
export interface House {
  num: string;
  name: string;
  sign: string;
}

export const HOUSES: House[] = [
  { num: 'I',    name: 'Self',    sign: '♈' },
  { num: 'II',   name: 'Value',   sign: '♉' },
  { num: 'III',  name: 'Mind',    sign: '♊' },
  { num: 'IV',   name: 'Roots',   sign: '♋' },
  { num: 'V',    name: 'Joy',     sign: '♌' },
  { num: 'VI',   name: 'Duty',    sign: '♍' },
  { num: 'VII',  name: 'Others',  sign: '♎' },
  { num: 'VIII', name: 'Depth',   sign: '♏' },
  { num: 'IX',   name: 'Truth',   sign: '♐' },
  { num: 'X',    name: 'Legacy',  sign: '♑' },
  { num: 'XI',   name: 'Network', sign: '♒' },
  { num: 'XII',  name: 'Spirit',  sign: '♓' },
];

export const HOUSES_PANEL = {
  title: 'Astrological Houses',
  subtitle: 'MUNDANE SPHERES',
};

// ─────────────────────────────────────────────────────────────────────────────
// Wu Xing / Five Elements
// ─────────────────────────────────────────────────────────────────────────────
export interface WuxingElement {
  name: string;
  value: number;
  color: string;
}

export const WUXING_ELEMENTS: WuxingElement[] = [
  { name: 'Wood',  value: 30, color: 'bg-[#4A6B53]' },
  { name: 'Fire',  value: 45, color: 'bg-[#8B3A3A]' },
  { name: 'Earth', value: 15, color: 'bg-[#826A4B]' },
  { name: 'Metal', value: 5,  color: 'bg-[#9CA3AF]' },
  { name: 'Water', value: 5,  color: 'bg-[#1B2C4A]' },
];

export const WUXING_PANEL = {
  title: 'Wu Xing',
  subtitle: 'FIVE ELEMENTS BALANCE',
};

// ─────────────────────────────────────────────────────────────────────────────
// Personalized Insights form & CTA
// ─────────────────────────────────────────────────────────────────────────────
export const INSIGHTS_FORM = {
  title: 'Personalized Insights',
  subtitle: 'NATAL CHART SYNTHESIS',
  birthDateLabel: 'BIRTH DATE',
  birthTimeLabel: 'BIRTH TIME',
  locationLabel: 'LOCATION',
  locationPlaceholder: 'e.g. Munich, DE',
  generateButton: 'GENERATE SYNTHESIS',
  generatingButton: 'CALCULATING ALIGNMENTS...',
};

export const CTA = {
  deepAnalysis: 'Tiefenanalyse',
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading / system messages
// ─────────────────────────────────────────────────────────────────────────────
export const MESSAGES = {
  loadingCelestial: 'Synchronizing with Celestial Data...',
};
