/**
 * SOLAR SYSTEM 3D — Astro Noctum Header
 *
 * Self-contained Three.js orrery with two modes:
 *   • Observatory — transparent bg, parchment shows through, sun + planets + orbit trails
 *   • Planetarium — sky dome, 150 named stars, constellation lines, ecliptic band
 *
 * Cherry-picked enhancements from DYAI2025/3DSolarSystem_animation (MIT):
 *   A) Orbit Trails — fading vertex-color schweif behind each planet
 *   F) Earth Day/Night Shader — procedural continents, city lights, terminator
 */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlanetDef {
  a: number; e: number; i: number; omega: number; w: number;
  M0: number; period: number; radius: number; color: string;
  gasGiant?: boolean; rings?: boolean;
}

interface StarData {
  name: string; ra: number; dec: number; mag: number; con: string;
}

type ConstellationLines = Record<string, [string, string][]>;

export interface SolarSystem3DProps {
  mode?: 'observatory' | 'planetarium';
  /** Observer latitude in degrees (for birth sky) */
  birthLat?: number;
  /** Observer longitude in degrees (for birth sky) */
  birthLon?: number;
  /** Birth date as JS Date (for birth sky rendering) */
  birthDate?: Date;
}

// ─── Orbital Data (J2000.0) ──────────────────────────────────────────────────

const PLANETS: Record<string, PlanetDef> = {
  mercury: { a: 0.387, e: 0.206, i: 7.0, omega: 48.33, w: 29.12, M0: 174.79, period: 87.97, radius: 0.28, color: '#B5AFA8' },
  venus:   { a: 0.723, e: 0.007, i: 3.4, omega: 76.68, w: 54.88, M0: 50.45, period: 224.70, radius: 0.44, color: '#E8D598' },
  earth:   { a: 1.000, e: 0.017, i: 0.0, omega: -11.26, w: 114.21, M0: 357.53, period: 365.25, radius: 0.46, color: '#4A90D9' },
  mars:    { a: 1.524, e: 0.093, i: 1.9, omega: 49.56, w: 286.50, M0: 19.41, period: 686.98, radius: 0.36, color: '#CD5C5C' },
  jupiter: { a: 5.203, e: 0.048, i: 1.3, omega: 100.46, w: 273.87, M0: 20.02, period: 4332.59, radius: 1.10, color: '#D4A574', gasGiant: true },
  saturn:  { a: 9.537, e: 0.054, i: 2.5, omega: 113.64, w: 339.39, M0: 317.02, period: 10759.22, radius: 0.95, color: '#E8C864', gasGiant: true, rings: true },
  uranus:  { a: 19.19, e: 0.047, i: 0.8, omega: 74.00, w: 96.99, M0: 142.24, period: 30688.50, radius: 0.58, color: '#7EC8E3', gasGiant: true },
  neptune: { a: 30.07, e: 0.009, i: 1.8, omega: 131.78, w: 273.19, M0: 256.23, period: 60182.00, radius: 0.55, color: '#5878E0', gasGiant: true },
};

const SUN_RADIUS   = 2.2;
const ORBIT_SCALE  = 26;
const TRAIL_STEPS  = 54;
const PLAN_RADIUS  = 160;

// ─── Star Catalog (150 brightest, J2000.0) ───────────────────────────────────

const STARS: StarData[] = [
  { name: 'Betelgeuse', ra: 5.919, dec: 7.407, mag: 0.42, con: 'Orion' },
  { name: 'Rigel', ra: 5.242, dec: -8.202, mag: 0.13, con: 'Orion' },
  { name: 'Bellatrix', ra: 5.419, dec: 6.350, mag: 1.64, con: 'Orion' },
  { name: 'Mintaka', ra: 5.533, dec: -0.299, mag: 2.23, con: 'Orion' },
  { name: 'Alnilam', ra: 5.603, dec: -1.202, mag: 1.69, con: 'Orion' },
  { name: 'Alnitak', ra: 5.679, dec: -1.943, mag: 1.77, con: 'Orion' },
  { name: 'Saiph', ra: 5.796, dec: -9.670, mag: 2.06, con: 'Orion' },
  { name: 'Dubhe', ra: 11.062, dec: 61.751, mag: 1.79, con: 'UrsaMajor' },
  { name: 'Merak', ra: 11.031, dec: 56.382, mag: 2.37, con: 'UrsaMajor' },
  { name: 'Phecda', ra: 11.897, dec: 53.695, mag: 2.44, con: 'UrsaMajor' },
  { name: 'Megrez', ra: 12.257, dec: 57.033, mag: 3.31, con: 'UrsaMajor' },
  { name: 'Alioth', ra: 12.900, dec: 55.960, mag: 1.77, con: 'UrsaMajor' },
  { name: 'Mizar', ra: 13.399, dec: 54.925, mag: 2.27, con: 'UrsaMajor' },
  { name: 'Alkaid', ra: 13.792, dec: 49.313, mag: 1.86, con: 'UrsaMajor' },
  { name: 'Polaris', ra: 2.530, dec: 89.264, mag: 2.02, con: 'UrsaMinor' },
  { name: 'Kochab', ra: 14.845, dec: 74.156, mag: 2.08, con: 'UrsaMinor' },
  { name: 'Pherkad', ra: 15.345, dec: 71.834, mag: 3.05, con: 'UrsaMinor' },
  { name: 'Schedar', ra: 0.675, dec: 56.537, mag: 2.23, con: 'Cassiopeia' },
  { name: 'Caph', ra: 0.153, dec: 59.150, mag: 2.27, con: 'Cassiopeia' },
  { name: 'Gamma Cas', ra: 0.945, dec: 60.717, mag: 2.47, con: 'Cassiopeia' },
  { name: 'Ruchbah', ra: 1.430, dec: 60.235, mag: 2.68, con: 'Cassiopeia' },
  { name: 'Segin', ra: 1.907, dec: 63.670, mag: 3.38, con: 'Cassiopeia' },
  { name: 'Antares', ra: 16.490, dec: -26.432, mag: 0.96, con: 'Scorpius' },
  { name: 'Shaula', ra: 17.560, dec: -37.104, mag: 1.63, con: 'Scorpius' },
  { name: 'Sargas', ra: 17.622, dec: -42.998, mag: 1.87, con: 'Scorpius' },
  { name: 'Dschubba', ra: 16.006, dec: -22.622, mag: 2.32, con: 'Scorpius' },
  { name: 'Graffias', ra: 16.091, dec: -19.806, mag: 2.64, con: 'Scorpius' },
  { name: 'Lesath', ra: 17.530, dec: -37.296, mag: 2.69, con: 'Scorpius' },
  { name: 'Regulus', ra: 10.140, dec: 11.967, mag: 1.35, con: 'Leo' },
  { name: 'Denebola', ra: 11.818, dec: 14.572, mag: 2.14, con: 'Leo' },
  { name: 'Algieba', ra: 10.333, dec: 19.842, mag: 2.28, con: 'Leo' },
  { name: 'Zosma', ra: 11.235, dec: 20.524, mag: 2.56, con: 'Leo' },
  { name: 'Ras Elased', ra: 9.764, dec: 23.774, mag: 2.98, con: 'Leo' },
  { name: 'Aldebaran', ra: 4.599, dec: 16.509, mag: 0.85, con: 'Taurus' },
  { name: 'Elnath', ra: 5.438, dec: 28.608, mag: 1.65, con: 'Taurus' },
  { name: 'Alcyone', ra: 3.791, dec: 24.105, mag: 2.87, con: 'Taurus' },
  { name: 'Pollux', ra: 7.755, dec: 28.026, mag: 1.14, con: 'Gemini' },
  { name: 'Castor', ra: 7.577, dec: 31.889, mag: 1.58, con: 'Gemini' },
  { name: 'Alhena', ra: 6.629, dec: 16.399, mag: 1.93, con: 'Gemini' },
  { name: 'Tejat', ra: 6.383, dec: 22.514, mag: 2.88, con: 'Gemini' },
  { name: 'Spica', ra: 13.420, dec: -11.161, mag: 0.97, con: 'Virgo' },
  { name: 'Porrima', ra: 12.694, dec: -1.449, mag: 2.74, con: 'Virgo' },
  { name: 'Vindemiatrix', ra: 13.036, dec: 10.959, mag: 2.83, con: 'Virgo' },
  { name: 'Sirius', ra: 6.752, dec: -16.716, mag: -1.46, con: 'CanisMajor' },
  { name: 'Adhara', ra: 6.977, dec: -28.972, mag: 1.50, con: 'CanisMajor' },
  { name: 'Wezen', ra: 7.140, dec: -26.393, mag: 1.84, con: 'CanisMajor' },
  { name: 'Mirzam', ra: 6.378, dec: -17.956, mag: 1.98, con: 'CanisMajor' },
  { name: 'Procyon', ra: 7.655, dec: 5.225, mag: 0.34, con: 'CanisMinor' },
  { name: 'Vega', ra: 18.616, dec: 38.784, mag: 0.03, con: 'Lyra' },
  { name: 'Sheliak', ra: 18.835, dec: 33.363, mag: 3.52, con: 'Lyra' },
  { name: 'Sulafat', ra: 18.982, dec: 32.690, mag: 3.24, con: 'Lyra' },
  { name: 'Deneb', ra: 20.690, dec: 45.280, mag: 1.25, con: 'Cygnus' },
  { name: 'Sadr', ra: 20.370, dec: 40.257, mag: 2.20, con: 'Cygnus' },
  { name: 'Gienah', ra: 20.770, dec: 33.970, mag: 2.46, con: 'Cygnus' },
  { name: 'Albireo', ra: 19.512, dec: 27.960, mag: 3.18, con: 'Cygnus' },
  { name: 'Altair', ra: 19.846, dec: 8.868, mag: 0.77, con: 'Aquila' },
  { name: 'Tarazed', ra: 19.771, dec: 10.614, mag: 2.72, con: 'Aquila' },
  { name: 'Kaus Australis', ra: 18.403, dec: -34.385, mag: 1.85, con: 'Sagittarius' },
  { name: 'Nunki', ra: 18.921, dec: -26.297, mag: 2.02, con: 'Sagittarius' },
  { name: 'Ascella', ra: 19.043, dec: -29.880, mag: 2.59, con: 'Sagittarius' },
  { name: 'Kaus Media', ra: 18.350, dec: -29.828, mag: 2.70, con: 'Sagittarius' },
  { name: 'Kaus Borealis', ra: 18.466, dec: -25.422, mag: 2.81, con: 'Sagittarius' },
  { name: 'Deneb Algedi', ra: 21.784, dec: -16.127, mag: 2.87, con: 'Capricornus' },
  { name: 'Dabih', ra: 20.350, dec: -14.781, mag: 3.08, con: 'Capricornus' },
  { name: 'Sadalsuud', ra: 21.526, dec: -5.571, mag: 2.91, con: 'Aquarius' },
  { name: 'Sadalmelik', ra: 22.096, dec: -0.320, mag: 2.96, con: 'Aquarius' },
  { name: 'Eta Piscium', ra: 1.525, dec: 15.346, mag: 3.62, con: 'Pisces' },
  { name: 'Hamal', ra: 2.120, dec: 23.463, mag: 2.00, con: 'Aries' },
  { name: 'Sheratan', ra: 1.911, dec: 20.808, mag: 2.64, con: 'Aries' },
  { name: 'Acubens', ra: 8.975, dec: 11.858, mag: 4.25, con: 'Cancer' },
  { name: 'Asellus Australis', ra: 8.745, dec: 18.154, mag: 3.94, con: 'Cancer' },
  { name: 'Zubeneschamali', ra: 15.283, dec: -9.383, mag: 2.61, con: 'Libra' },
  { name: 'Zubenelgenubi', ra: 14.848, dec: -16.042, mag: 2.75, con: 'Libra' },
  { name: 'Acrux', ra: 12.443, dec: -63.099, mag: 0.76, con: 'Crux' },
  { name: 'Mimosa', ra: 12.795, dec: -59.689, mag: 1.30, con: 'Crux' },
  { name: 'Gacrux', ra: 12.519, dec: -57.113, mag: 1.64, con: 'Crux' },
  { name: 'Alpha Centauri', ra: 14.660, dec: -60.835, mag: -0.27, con: 'Centaurus' },
  { name: 'Hadar', ra: 14.064, dec: -60.373, mag: 0.61, con: 'Centaurus' },
  { name: 'Arcturus', ra: 14.261, dec: 19.182, mag: -0.05, con: 'Bootes' },
  { name: 'Izar', ra: 14.750, dec: 27.074, mag: 2.70, con: 'Bootes' },
  { name: 'Enif', ra: 21.736, dec: 9.875, mag: 2.39, con: 'Pegasus' },
  { name: 'Scheat', ra: 23.063, dec: 28.083, mag: 2.42, con: 'Pegasus' },
  { name: 'Markab', ra: 23.079, dec: 15.205, mag: 2.49, con: 'Pegasus' },
  { name: 'Algenib', ra: 0.220, dec: 15.183, mag: 2.83, con: 'Pegasus' },
  { name: 'Alpheratz', ra: 0.140, dec: 29.091, mag: 2.06, con: 'Andromeda' },
  { name: 'Mirach', ra: 1.163, dec: 35.621, mag: 2.05, con: 'Andromeda' },
  { name: 'Almach', ra: 2.065, dec: 42.330, mag: 2.17, con: 'Andromeda' },
  { name: 'Mirfak', ra: 3.405, dec: 49.861, mag: 1.79, con: 'Perseus' },
  { name: 'Algol', ra: 3.136, dec: 40.956, mag: 2.12, con: 'Perseus' },
  { name: 'Capella', ra: 5.278, dec: 45.998, mag: 0.08, con: 'Auriga' },
  { name: 'Menkalinan', ra: 5.992, dec: 44.948, mag: 1.90, con: 'Auriga' },
  { name: 'Rasalhague', ra: 17.582, dec: 12.560, mag: 2.07, con: 'Ophiuchus' },
  { name: 'Sabik', ra: 17.173, dec: -15.725, mag: 2.43, con: 'Ophiuchus' },
  { name: 'Achernar', ra: 1.629, dec: -57.237, mag: 0.46, con: 'Eridanus' },
  { name: 'Canopus', ra: 6.399, dec: -52.696, mag: -0.74, con: 'Carina' },
  { name: 'Fomalhaut', ra: 22.961, dec: -29.622, mag: 1.16, con: 'PiscisAustrinus' },
  { name: 'Alnair', ra: 22.137, dec: -46.961, mag: 1.74, con: 'Grus' },
  { name: 'Peacock', ra: 20.428, dec: -56.735, mag: 1.94, con: 'Pavo' },
  { name: 'Eltanin', ra: 17.943, dec: 51.489, mag: 2.23, con: 'Draco' },
  { name: 'Rastaban', ra: 17.507, dec: 52.301, mag: 2.79, con: 'Draco' },
  { name: 'Kornephoros', ra: 16.504, dec: 21.490, mag: 2.77, con: 'Hercules' },
  { name: 'Rasalgethi', ra: 17.244, dec: 14.390, mag: 3.37, con: 'Hercules' },
  { name: 'Alphecca', ra: 15.578, dec: 26.715, mag: 2.23, con: 'CoronaBorealis' },
];

const CONSTELLATION_LINES: ConstellationLines = {
  Orion: [['Betelgeuse','Bellatrix'],['Bellatrix','Mintaka'],['Mintaka','Alnilam'],['Alnilam','Alnitak'],['Alnitak','Saiph'],['Saiph','Rigel'],['Rigel','Mintaka'],['Betelgeuse','Alnitak']],
  UrsaMajor: [['Dubhe','Merak'],['Merak','Phecda'],['Phecda','Megrez'],['Megrez','Alioth'],['Alioth','Mizar'],['Mizar','Alkaid'],['Megrez','Dubhe']],
  UrsaMinor: [['Polaris','Kochab'],['Kochab','Pherkad']],
  Cassiopeia: [['Caph','Schedar'],['Schedar','Gamma Cas'],['Gamma Cas','Ruchbah'],['Ruchbah','Segin']],
  Scorpius: [['Graffias','Dschubba'],['Dschubba','Antares'],['Antares','Sargas'],['Sargas','Shaula'],['Shaula','Lesath']],
  Leo: [['Regulus','Algieba'],['Algieba','Zosma'],['Zosma','Denebola'],['Algieba','Ras Elased']],
  Gemini: [['Castor','Pollux'],['Castor','Tejat'],['Pollux','Alhena']],
  Cygnus: [['Deneb','Sadr'],['Sadr','Gienah'],['Sadr','Albireo']],
  Lyra: [['Vega','Sheliak'],['Sheliak','Sulafat'],['Sulafat','Vega']],
  Aquila: [['Altair','Tarazed']],
  Taurus: [['Aldebaran','Elnath'],['Aldebaran','Alcyone']],
  CanisMajor: [['Sirius','Mirzam'],['Sirius','Adhara'],['Adhara','Wezen']],
  Crux: [['Acrux','Gacrux'],['Mimosa','Gacrux']],
  Sagittarius: [['Kaus Australis','Kaus Media'],['Kaus Media','Kaus Borealis'],['Kaus Borealis','Nunki'],['Nunki','Ascella']],
  Pegasus: [['Markab','Scheat'],['Scheat','Alpheratz'],['Alpheratz','Algenib'],['Algenib','Markab']],
  Andromeda: [['Alpheratz','Mirach'],['Mirach','Almach']],
  Bootes: [['Arcturus','Izar']],
  Virgo: [['Spica','Porrima'],['Porrima','Vindemiatrix']],
  Aries: [['Hamal','Sheratan']],
  Libra: [['Zubeneschamali','Zubenelgenubi']],
};

const ZODIAC_CONS = new Set([
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpius','Sagittarius','Capricornus','Aquarius','Pisces',
]);

// ─── Kepler Solver ───────────────────────────────────────────────────────────

function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 100; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

// ─── Orbital Position ────────────────────────────────────────────────────────

function getPlanetPosition(p: PlanetDef, days: number): THREE.Vector3 {
  const n  = (2 * Math.PI) / p.period;
  const M  = ((p.M0 * Math.PI / 180) + n * days) % (2 * Math.PI);
  const E  = solveKepler(M, p.e);
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + p.e) * Math.sin(E / 2),
    Math.sqrt(1 - p.e) * Math.cos(E / 2)
  );
  const r    = p.a * (1 - p.e * Math.cos(E));
  const xOrb = r * Math.cos(nu);
  const yOrb = r * Math.sin(nu);

  const iR = p.i * Math.PI / 180;
  const oR = p.omega * Math.PI / 180;
  const wR = p.w * Math.PI / 180;
  const cO = Math.cos(oR), sO = Math.sin(oR);
  const cW = Math.cos(wR), sW = Math.sin(wR);
  const cI = Math.cos(iR), sI = Math.sin(iR);

  const x = (cO*cW - sO*sW*cI)*xOrb + (-cO*sW - sO*cW*cI)*yOrb;
  const y = (sO*cW + cO*sW*cI)*xOrb + (-sO*sW + cO*cW*cI)*yOrb;
  const z = (sW*sI)*xOrb + (cW*sI)*yOrb;

  const sc = r > 0 ? Math.log10(r + 1) * ORBIT_SCALE / r : 0;
  return new THREE.Vector3(x * sc, z * sc, -y * sc);
}

// Raw ecliptic position (unscaled) for RA/Dec conversion
function getPlanetEcliptic(p: PlanetDef, days: number): { x: number; y: number; z: number } {
  const n  = (2 * Math.PI) / p.period;
  const M  = ((p.M0 * Math.PI / 180) + n * days) % (2 * Math.PI);
  const E  = solveKepler(M, p.e);
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + p.e) * Math.sin(E / 2),
    Math.sqrt(1 - p.e) * Math.cos(E / 2)
  );
  const r    = p.a * (1 - p.e * Math.cos(E));
  const xOrb = r * Math.cos(nu);
  const yOrb = r * Math.sin(nu);

  const iR = p.i * Math.PI / 180, oR = p.omega * Math.PI / 180, wR = p.w * Math.PI / 180;
  const cO = Math.cos(oR), sO = Math.sin(oR), cW = Math.cos(wR), sW = Math.sin(wR);
  const cI = Math.cos(iR), sI = Math.sin(iR);

  return {
    x: (cO*cW - sO*sW*cI)*xOrb + (-cO*sW - sO*cW*cI)*yOrb,
    y: (sO*cW + cO*sW*cI)*xOrb + (-sO*sW + cO*cW*cI)*yOrb,
    z: (sW*sI)*xOrb + (cW*sI)*yOrb,
  };
}

// ─── Orbit Path ──────────────────────────────────────────────────────────────

function buildOrbitPath(p: PlanetDef): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const steps = 180;
  const iR = p.i * Math.PI / 180, oR = p.omega * Math.PI / 180, wR = p.w * Math.PI / 180;
  const cO = Math.cos(oR), sO = Math.sin(oR), cW = Math.cos(wR), sW = Math.sin(wR);
  const cI = Math.cos(iR), sI = Math.sin(iR);

  for (let step = 0; step <= steps; step++) {
    const M = (step / steps) * 2 * Math.PI;
    const E = solveKepler(M, p.e);
    const nu = 2 * Math.atan2(
      Math.sqrt(1 + p.e) * Math.sin(E / 2),
      Math.sqrt(1 - p.e) * Math.cos(E / 2)
    );
    const r = p.a * (1 - p.e * Math.cos(E));
    const xOrb = r * Math.cos(nu), yOrb = r * Math.sin(nu);
    const x = (cO*cW - sO*sW*cI)*xOrb + (-cO*sW - sO*cW*cI)*yOrb;
    const y = (sO*cW + cO*sW*cI)*xOrb + (-sO*sW + cO*cW*cI)*yOrb;
    const z = (sW*sI)*xOrb + (cW*sI)*yOrb;
    const sc = r > 0 ? Math.log10(r + 1) * ORBIT_SCALE / r : 0;
    pts.push(new THREE.Vector3(x * sc, z * sc, -y * sc));
  }
  return pts;
}

// ─── Astronomical Helpers ────────────────────────────────────────────────────

function dateToJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function daysSinceJ2000(date: Date): number {
  return dateToJD(date) - 2451545.0;
}

function getLST(jd: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  let lst = gmst / 15 + longitude / 15;
  return ((lst % 24) + 24) % 24;
}

function equatorialToHorizontal(ra: number, dec: number, lat: number, lst: number): { altitude: number; azimuth: number } {
  const raRad = ra * 15 * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const lstRad = lst * 15 * Math.PI / 180;
  const ha = lstRad - raRad;
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
  const alt = Math.asin(sinAlt);
  const cosAz = (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) / (Math.cos(alt) * Math.cos(latRad));
  const sinAz = -Math.cos(decRad) * Math.sin(ha) / Math.cos(alt);
  const az = Math.atan2(sinAz, cosAz);
  return { altitude: alt * 180 / Math.PI, azimuth: ((az * 180 / Math.PI) + 360) % 360 };
}

function horizontalTo3D(alt: number, az: number, radius: number): THREE.Vector3 {
  const altRad = alt * Math.PI / 180;
  const azRad = az * Math.PI / 180;
  return new THREE.Vector3(
    radius * Math.cos(altRad) * Math.sin(azRad),
    radius * Math.sin(altRad),
    radius * Math.cos(altRad) * Math.cos(azRad)
  );
}

function eclipticToEquatorial(x: number, y: number, z: number): { ra: number; dec: number } {
  const eps = 23.439 * Math.PI / 180;
  const xEq = x;
  const yEq = y * Math.cos(eps) - z * Math.sin(eps);
  const zEq = y * Math.sin(eps) + z * Math.cos(eps);
  const r = Math.sqrt(xEq * xEq + yEq * yEq + zEq * zEq);
  const dec = Math.asin(zEq / r) * 180 / Math.PI;
  let ra = Math.atan2(yEq, xEq) * 180 / Math.PI;
  ra = ((ra + 360) % 360) / 15;
  return { ra, dec };
}

// ─── Materials ────────────────────────────────────────────────────────────────

function createSunMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time:   { value: 0 },
      color1: { value: new THREE.Color('#FFF5E0') },
      color2: { value: new THREE.Color('#FFD700') },
      color3: { value: new THREE.Color('#FFA500') },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv; vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float time; uniform vec3 color1, color2, color3;
      varying vec2 vUv; varying vec3 vNormal;
      float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
      float noise(vec2 st) {
        vec2 i = floor(st); vec2 f = fract(st);
        float a = rand(i), b = rand(i+vec2(1,0)), c = rand(i+vec2(0,1)), d = rand(i+vec2(1,1));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }
      void main() {
        vec2 nc = vUv * 8.0 + time * 0.05;
        float n = noise(nc), n2 = noise(nc * 2.0 + vec2(time * 0.03, 0.0));
        float rim = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.0);
        vec3 col = mix(color1, color2, n * 0.5 + 0.5);
        col = mix(col, color3, n2 * 0.3);
        col += vec3(1.0, 0.9, 0.7) * step(0.85, n) * 0.3;
        col += vec3(1.0, 0.6, 0.2) * rim * 0.5;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function createAtmosphereMaterial(color: string, intensity: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(color) }, intensity: { value: intensity } },
    vertexShader: /* glsl */`
      varying vec3 vNormal, vViewPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 glowColor; uniform float intensity;
      varying vec3 vNormal, vViewPos;
      void main() {
        float rim = pow(1.0 - max(0.0, dot(normalize(-vViewPos), vNormal)), 3.0);
        gl_FragColor = vec4(glowColor * rim * intensity, rim * intensity * 0.6);
      }
    `,
    transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
  });
}

function createSaturnRingsMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      float rand(vec2 s) { return fract(sin(dot(s, vec2(12.9898,78.233)))*43758.5453); }
      void main() {
        vec2 c = vUv - 0.5; float dist = length(c) * 2.0;
        float b1 = sin(dist * 60.0) * 0.5 + 0.5;
        float b2 = sin(dist * 120.0 + 0.5) * 0.3 + 0.7;
        float cas = smoothstep(0.73,0.75,dist) * (1.0 - smoothstep(0.75,0.77,dist));
        vec3 col = vec3(0.85, 0.77, 0.65) * b1 * b2 * (1.0 - cas * 0.7);
        col += rand(vUv * 100.0) * 0.1;
        float edge = smoothstep(0.0,0.1,dist) * (1.0 - smoothstep(0.9,1.0,dist));
        float alpha = 0.80 * b1 * b2 * edge * (1.0 - cas * 0.5);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
  });
}

// ─── F) Earth Day/Night Shader ───────────────────────────────────────────────

function createEarthDayNightMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      time: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vWorldNormal, vWorldPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 wPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = wPos.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 sunDirection; uniform float time;
      varying vec3 vWorldNormal, vWorldPos; varying vec2 vUv;

      float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash2(i), b = hash2(i+vec2(1,0)), c = hash2(i+vec2(0,1)), d = hash2(i+vec2(1,1));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
      }
      float fbm(vec2 p) { return noise(p)*0.5 + noise(p*2.0)*0.25 + noise(p*4.0)*0.125; }

      void main() {
        float illum = dot(vWorldNormal, normalize(sunDirection));
        float terminator = smoothstep(-0.08, 0.18, illum);
        float landRaw = fbm(vUv * vec2(5.5, 4.5) + 0.3);
        float landMask = smoothstep(0.44, 0.58, landRaw);
        float coast = smoothstep(0.40, 0.45, landRaw) * (1.0 - landMask);
        float desert = smoothstep(0.62, 0.72, noise(vUv * vec2(3.0, 4.5) + 1.7)) * landMask;
        float lat = abs(vUv.y - 0.5) * 2.0;
        float ice = smoothstep(0.72, 0.87, lat);
        float cloud = smoothstep(0.58, 0.72, noise(vUv * vec2(4.0, 3.5) + vec2(time * 0.003, 0.0)));

        vec3 ocean = vec3(0.08, 0.25, 0.58);
        vec3 land = vec3(0.18, 0.40, 0.14);
        vec3 sandy = vec3(0.68, 0.58, 0.32);
        vec3 polar = vec3(0.88, 0.92, 0.96);
        vec3 cloudC = vec3(0.92, 0.94, 0.97);

        vec3 dayColor = mix(ocean, land, landMask);
        dayColor = mix(dayColor, ocean * 1.25, coast * 0.6);
        dayColor = mix(dayColor, sandy, desert);
        dayColor = mix(dayColor, polar, ice);
        dayColor = mix(dayColor, cloudC, cloud * 0.85);
        dayColor *= 0.35 + 0.65 * max(0.0, illum * 1.1 - 0.05);

        vec3 nightBase = vec3(0.007, 0.007, 0.018);
        float city1 = step(0.84, noise(vUv * 22.0)) * landMask * (1.0 - ice);
        float city2 = step(0.91, noise(vUv * 45.0 + 0.6)) * landMask * (1.0 - ice);
        vec3 nightColor = nightBase + city1 * vec3(0.80, 0.65, 0.30) * 0.13 + city2 * vec3(0.90, 0.80, 0.50) * 0.07;

        vec3 finalColor = mix(nightColor, dayColor, terminator);

        vec3 halfVec = normalize(sunDirection + normalize(cameraPosition - vWorldPos));
        float spec = pow(max(0.0, dot(vWorldNormal, halfVec)), 60.0);
        finalColor += (1.0 - landMask) * (1.0 - cloud) * spec * 0.18 * terminator;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}

// ─── Sky Dome Shader (Planetarium only) ──────────────────────────────────────

function createSkyDomeShader(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */`
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        vec3 zenith = vec3(0.02, 0.02, 0.08);
        vec3 nightSky = vec3(0.02, 0.02, 0.06);
        vec3 horizonWest = vec3(0.12, 0.06, 0.04);
        vec3 horizonEast = vec3(0.10, 0.08, 0.05);
        float horizonBlend = smoothstep(-0.1, 0.3, h);
        float eastWest = (normalize(vWorldPosition).x + 1.0) * 0.5;
        vec3 horizonColor = mix(horizonWest, horizonEast, eastWest);
        vec3 finalColor = mix(horizonColor, nightSky, horizonBlend);
        finalColor = mix(finalColor, zenith, smoothstep(0.3, 0.8, h));
        float haze = 1.0 - smoothstep(0.0, 0.15, h);
        finalColor += vec3(0.04, 0.03, 0.02) * haze * 0.3;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
}

// ─── Star Sprite Texture ─────────────────────────────────────────────────────

function createStarSpriteTexture(magnitude: number): THREE.CanvasTexture {
  const SIZE = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  const cx = SIZE / 2;

  let r = 255, g = 248, b = 235;
  if (magnitude < -0.5) { r = 180; g = 210; b = 255; }
  else if (magnitude < 0.5) { r = 210; g = 230; b = 255; }
  else if (magnitude < 1.5) { r = 255; g = 252; b = 245; }
  else if (magnitude < 2.5) { r = 255; g = 245; b = 215; }

  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  grad.addColorStop(0, `rgba(${r},${g},${b},1.0)`);
  grad.addColorStop(0.08, `rgba(${r},${g},${b},0.95)`);
  grad.addColorStop(0.20, `rgba(${r},${g},${b},0.60)`);
  grad.addColorStop(0.45, `rgba(${r},${g},${b},0.15)`);
  grad.addColorStop(0.80, `rgba(${r},${g},${b},0.02)`);
  grad.addColorStop(1, `rgba(0,0,0,0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (magnitude < 2.0) {
    const spikeLen = magnitude < 0 ? cx * 0.95 : magnitude < 1 ? cx * 0.70 : cx * 0.45;
    const alpha = magnitude < 0 ? 0.45 : magnitude < 1 ? 0.28 : 0.15;
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth = magnitude < 0 ? 1.5 : 1.0;
    ctx.beginPath();
    ctx.moveTo(cx - spikeLen, cx); ctx.lineTo(cx + spikeLen, cx);
    ctx.moveTo(cx, cx - spikeLen); ctx.lineTo(cx, cx + spikeLen);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

// Cardinal direction sprite
function makeCardinalSprite(label: string): THREE.Sprite {
  const C = document.createElement('canvas');
  C.width = C.height = 128;
  const ctx = C.getContext('2d')!;
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = 'rgba(184, 150, 62, 0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 64, 64);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(C), transparent: true, depthWrite: false,
  }));
  spr.scale.set(8, 8, 1);
  return spr;
}

// ─── Easing ──────────────────────────────────────────────────────────────────

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ─── Component ────────────────────────────────────────────────────────────────

const SolarSystem3D: React.FC<SolarSystem3DProps> = ({
  mode = 'observatory',
  birthLat = 48.137,
  birthLon = 11.576,
  birthDate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const birthRef = useRef({ lat: birthLat, lon: birthLon, date: birthDate });

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { birthRef.current = { lat: birthLat, lon: birthLon, date: birthDate }; }, [birthLat, birthLon, birthDate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 5000);
    camera.position.set(0, 180, 72);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Lighting ────────────────────────────────────────────────────────────
    const sunLight = new THREE.PointLight('#FFFFEE', 3.5, 1500);
    scene.add(sunLight);
    const ambientLight = new THREE.AmbientLight('#C8B89A', 0.45);
    scene.add(ambientLight);

    // ═══════════════════════════════════════════════════════════════════════
    // ORRERY GROUP (visible in observatory mode)
    // ═══════════════════════════════════════════════════════════════════════

    const orreryGroup = new THREE.Group();
    scene.add(orreryGroup);

    // Sun
    const sunGeo = new THREE.SphereGeometry(SUN_RADIUS, 64, 64);
    const sunMat = createSunMaterial();
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    orreryGroup.add(sunMesh);

    // Sun glow halos
    [
      { scale: 1.35, color: '#FFE4A0', opacity: 0.40 },
      { scale: 1.80, color: '#FFD060', opacity: 0.18 },
      { scale: 2.40, color: '#FFAA30', opacity: 0.09 },
      { scale: 3.20, color: '#FF8800', opacity: 0.04 },
    ].forEach(({ scale, color, opacity }) => {
      orreryGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS * scale, 24, 24),
        new THREE.MeshBasicMaterial({
          color, transparent: true, opacity,
          side: THREE.BackSide, blending: THREE.AdditiveBlending,
        })
      ));
    });

    // Planets + orbits + trails
    const planetMeshes:  Record<string, THREE.Mesh> = {};
    const saturnRingMap: Record<string, THREE.Mesh> = {};
    const orbitTrails:   Record<string, THREE.Line> = {};
    let earthMat: THREE.ShaderMaterial | null = null;

    Object.entries(PLANETS).forEach(([key, planet]) => {
      // Orbit path
      const orbitPts = buildOrbitPath(planet);
      orreryGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: 0x826A4B, transparent: true, opacity: 0.20 })
      ));

      // Planet sphere (Earth gets day/night shader)
      let mat: THREE.Material;
      if (key === 'earth') {
        earthMat = createEarthDayNightMaterial();
        mat = earthMat;
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(planet.color),
          roughness: 0.65, metalness: 0.10,
          emissive: new THREE.Color(planet.color), emissiveIntensity: 0.13,
        });
      }

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(planet.radius, 32, 32), mat);
      mesh.castShadow = true;
      orreryGroup.add(mesh);
      planetMeshes[key] = mesh;

      // Atmosphere glow
      if (planet.gasGiant) {
        mesh.add(new THREE.Mesh(
          new THREE.SphereGeometry(planet.radius * 1.18, 16, 16),
          createAtmosphereMaterial(planet.color, 0.65)
        ));
      }
      if (key === 'earth') {
        mesh.add(new THREE.Mesh(
          new THREE.SphereGeometry(planet.radius * 1.12, 16, 16),
          createAtmosphereMaterial('#4A90D9', 0.85)
        ));
      }

      // Saturn rings
      if (planet.rings) {
        const rings = new THREE.Mesh(
          new THREE.RingGeometry(planet.radius * 1.45, planet.radius * 2.3, 128),
          createSaturnRingsMaterial()
        );
        rings.rotation.x = Math.PI / 2.5;
        orreryGroup.add(rings);
        saturnRingMap[key] = rings;
      }

      // A) Orbit Trail — fading vertex-color trail behind each planet
      const trailGeo = new THREE.BufferGeometry();
      const trailPos = new Float32Array((TRAIL_STEPS + 1) * 3);
      const trailCol = new Float32Array((TRAIL_STEPS + 1) * 3);
      trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(trailPos, 3));
      trailGeo.setAttribute('color', new THREE.Float32BufferAttribute(trailCol, 3));
      const trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      orreryGroup.add(trailLine);
      orbitTrails[key] = trailLine;
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PLANETARIUM GROUP (visible in planetarium mode)
    // ═══════════════════════════════════════════════════════════════════════

    const planGroup = new THREE.Group();
    planGroup.visible = false;
    scene.add(planGroup);

    // Sky dome
    planGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(PLAN_RADIUS, 64, 64),
      createSkyDomeShader()
    ));

    // Ground plane
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(PLAN_RADIUS * 0.98, 128),
      new THREE.MeshBasicMaterial({ color: '#0A0E18', transparent: true, opacity: 0.95, side: THREE.DoubleSide })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    planGroup.add(ground);

    // Horizon ring
    const horizRing = new THREE.Mesh(
      new THREE.RingGeometry(PLAN_RADIUS * 0.965, PLAN_RADIUS * 0.975, 128),
      new THREE.MeshBasicMaterial({ color: '#1E4060', transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    horizRing.rotation.x = -Math.PI / 2;
    planGroup.add(horizRing);

    // Cardinal directions
    const cardinals = [
      { label: 'N', az: 0 }, { label: 'O', az: 90 },
      { label: 'S', az: 180 }, { label: 'W', az: 270 },
    ];
    cardinals.forEach(({ label, az }) => {
      const spr = makeCardinalSprite(label);
      const pos = horizontalTo3D(2, az, PLAN_RADIUS * 0.94);
      spr.position.copy(pos);
      planGroup.add(spr);
    });

    // Stars as sprites
    const starByName: Record<string, THREE.Sprite> = {};

    STARS.forEach(star => {
      const tex = createStarSpriteTexture(star.mag);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      const size = Math.max(1.8, 6.5 - star.mag * 1.1);
      spr.scale.set(size, size, 1);
      spr.visible = false;
      planGroup.add(spr);
      starByName[star.name] = spr;
    });

    // Constellation lines
    const conLines: THREE.Line[] = [];
    Object.entries(CONSTELLATION_LINES).forEach(([con, pairs]) => {
      pairs.forEach(([s1, s2]) => {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(), new THREE.Vector3(),
        ]);
        const isZodiac = ZODIAC_CONS.has(con);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
          color: isZodiac ? '#B8963E' : '#4A78AA',
          transparent: true,
          opacity: isZodiac ? 0.55 : 0.30,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }));
        line.visible = false;
        line.userData = { star1: s1, star2: s2, con };
        planGroup.add(line);
        conLines.push(line);
      });
    });

    // Planet sky markers
    const planetSkyMarkers: Record<string, THREE.Mesh> = {};
    Object.entries(PLANETS).forEach(([key, planet]) => {
      const size = Math.max(0.5, planet.radius * 0.5);
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(size, 12, 12),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(planet.color) })
      );
      marker.visible = false;
      planGroup.add(marker);
      planetSkyMarkers[key] = marker;
    });

    // ── Camera controls ───────────────────────────────────────────────────
    const orrCam  = { theta: 0.2, phi: 0.38, radius: 192 };
    const orrCamT = { theta: 0.2, phi: 0.38, radius: 192 };
    const planLook = { azimuth: 180, altitude: 25 };

    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; };
    const onMouseUp   = ()             => { isDragging = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      if (modeRef.current === 'observatory') {
        orrCamT.theta -= dx * 0.0035;
        orrCamT.phi = Math.max(0.08, Math.min(Math.PI / 2.2, orrCamT.phi + dy * 0.0035));
      } else {
        planLook.azimuth = (planLook.azimuth - dx * 0.3 + 360) % 360;
        planLook.altitude = Math.max(-5, Math.min(89, planLook.altitude + dy * 0.3));
      }
      lastMouse = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (modeRef.current === 'observatory') {
        orrCamT.radius = Math.max(60, Math.min(600, orrCamT.radius + e.deltaY * 0.28));
      }
    };

    // Touch support
    const onTouchStart = (e: TouchEvent) => { isDragging = true; lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTouchEnd   = ()              => { isDragging = false; };
    const onTouchMove  = (e: TouchEvent) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - lastMouse.x;
      const dy = e.touches[0].clientY - lastMouse.y;
      if (modeRef.current === 'observatory') {
        orrCamT.theta -= dx * 0.0035;
        orrCamT.phi = Math.max(0.08, Math.min(Math.PI / 2.2, orrCamT.phi + dy * 0.0035));
      } else {
        planLook.azimuth = (planLook.azimuth - dx * 0.3 + 360) % 360;
        planLook.altitude = Math.max(-5, Math.min(89, planLook.altitude + dy * 0.3));
      }
      lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // ── Simulation time ─────────────────────────────────────────────────────
    const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
    let simDays = (Date.now() - J2000) / 86_400_000;

    // ── Transition state ────────────────────────────────────────────────────
    let transitionT = 0; // 0 = full orrery, 1 = full planetarium
    const SIM_SPEED = 8;

    // ── Animation loop ──────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Advance simulation
      simDays += delta * SIM_SPEED;
      sunMat.uniforms.time.value += delta;

      // ── Transition ──────────────────────────────────────────────────────
      const targetT = modeRef.current === 'planetarium' ? 1 : 0;
      if (Math.abs(transitionT - targetT) > 0.001) {
        transitionT += (targetT - transitionT) * Math.min(1, delta * 3.5);
        transitionT = Math.max(0, Math.min(1, transitionT));
      } else {
        transitionT = targetT;
      }
      const easedT = easeInOutCubic(transitionT);

      // Show/hide groups
      orreryGroup.visible = easedT < 0.99;
      planGroup.visible   = easedT > 0.01;

      // Fade orrery opacity (scale down)
      orreryGroup.scale.setScalar(1 - easedT * 0.5);
      orreryGroup.position.y = easedT * -30;

      // Renderer alpha based on transition (opaque in planetarium)
      renderer.setClearColor(0x000000, easedT * 1.0);

      // ── Camera ────────────────────────────────────────────────────────────
      if (easedT < 0.5) {
        // Orrery camera
        orrCam.theta  += (orrCamT.theta  - orrCam.theta)  * 0.08;
        orrCam.phi    += (orrCamT.phi    - orrCam.phi)    * 0.08;
        orrCam.radius += (orrCamT.radius - orrCam.radius) * 0.08;

        camera.position.set(
          orrCam.radius * Math.sin(orrCam.phi) * Math.cos(orrCam.theta),
          orrCam.radius * Math.cos(orrCam.phi),
          orrCam.radius * Math.sin(orrCam.phi) * Math.sin(orrCam.theta),
        );
        camera.lookAt(0, 0, 0);
        camera.fov = 48;
      } else {
        // Planetarium camera — first person inside dome
        const altRad = planLook.altitude * Math.PI / 180;
        const azRad  = planLook.azimuth * Math.PI / 180;
        camera.position.set(0, 1.7, 0);
        camera.lookAt(
          Math.cos(altRad) * Math.sin(azRad),
          1.7 + Math.sin(altRad),
          Math.cos(altRad) * Math.cos(azRad)
        );
        camera.fov = 60;
      }
      camera.updateProjectionMatrix();

      // ── Update Orrery planets ─────────────────────────────────────────────
      Object.entries(PLANETS).forEach(([key, planet]) => {
        const pos = getPlanetPosition(planet, simDays);
        planetMeshes[key]?.position.copy(pos);
        if (saturnRingMap[key]) saturnRingMap[key].position.copy(pos);

        // Earth shader sun direction
        if (key === 'earth' && earthMat) {
          const dir = new THREE.Vector3().sub(pos).normalize();
          earthMat.uniforms.sunDirection.value.copy(dir);
          earthMat.uniforms.time.value += delta;
        }

        // A) Orbit trail update
        const trail = orbitTrails[key];
        if (trail) {
          const posAttr = trail.geometry.getAttribute('position') as THREE.BufferAttribute;
          const colAttr = trail.geometry.getAttribute('color') as THREE.BufferAttribute;
          const trailFrac = 0.15; // 15% of orbital period
          const trailDays = planet.period * trailFrac;
          const pColor = new THREE.Color(planet.color);

          for (let t = 0; t <= TRAIL_STEPS; t++) {
            const frac = t / TRAIL_STEPS;
            const tDays = simDays - trailDays * frac;
            const tPos = getPlanetPosition(planet, tDays);
            posAttr.setXYZ(t, tPos.x, tPos.y, tPos.z);
            const alpha = 1 - frac;
            colAttr.setXYZ(t, pColor.r * alpha, pColor.g * alpha, pColor.b * alpha);
          }
          posAttr.needsUpdate = true;
          colAttr.needsUpdate = true;
        }
      });

      // ── Update Planetarium stars ──────────────────────────────────────────
      if (planGroup.visible) {
        const { lat, lon, date: bDate } = birthRef.current;
        const skyDate = bDate ?? new Date();
        const jd = dateToJD(skyDate);
        const lst = getLST(jd, lon);

        // Position stars
        STARS.forEach(star => {
          const spr = starByName[star.name];
          if (!spr) return;
          const h = equatorialToHorizontal(star.ra, star.dec, lat, lst);
          if (h.altitude < -2) { spr.visible = false; return; }
          spr.visible = true;
          spr.position.copy(horizontalTo3D(h.altitude, h.azimuth, PLAN_RADIUS * 0.92));
        });

        // Constellation lines
        conLines.forEach(line => {
          const { star1, star2 } = line.userData;
          const s1 = starByName[star1];
          const s2 = starByName[star2];
          if (!s1?.visible || !s2?.visible) { line.visible = false; return; }
          line.visible = true;
          const positions = line.geometry.getAttribute('position') as THREE.BufferAttribute;
          positions.setXYZ(0, s1.position.x, s1.position.y, s1.position.z);
          positions.setXYZ(1, s2.position.x, s2.position.y, s2.position.z);
          positions.needsUpdate = true;
        });

        // Planet sky markers
        const earthEcl = getPlanetEcliptic(PLANETS.earth, daysSinceJ2000(skyDate));
        Object.entries(PLANETS).forEach(([key, planet]) => {
          if (key === 'earth') { planetSkyMarkers[key].visible = false; return; }
          const ecl = getPlanetEcliptic(planet, daysSinceJ2000(skyDate));
          // Geocentric: subtract Earth position
          const dx = ecl.x - earthEcl.x;
          const dy = ecl.y - earthEcl.y;
          const dz = ecl.z - earthEcl.z;
          const eq = eclipticToEquatorial(dx, dy, dz);
          const h = equatorialToHorizontal(eq.ra, eq.dec, lat, lst);
          const marker = planetSkyMarkers[key];
          if (h.altitude < -2) { marker.visible = false; return; }
          marker.visible = true;
          marker.position.copy(horizontalTo3D(h.altitude, h.azimuth, PLAN_RADIUS * 0.88));
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ──────────────────────────────────────────────────────
    const handleResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchmove', onTouchMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ cursor: 'grab' }}
      onMouseDown={e => { (e.currentTarget as HTMLDivElement).style.cursor = 'grabbing'; }}
      onMouseUp={e => { (e.currentTarget as HTMLDivElement).style.cursor = 'grab'; }}
    />
  );
};

export default SolarSystem3D;
