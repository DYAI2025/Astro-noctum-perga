/**
 * SOLAR SYSTEM 3D — Astro Noctum Header
 *
 * Self-contained Three.js orrery for the hero header.
 * Adapted from DYAI2025/3DSolarSystem_animation (MIT).
 *
 * Design intent: transparent background, parchment shows through.
 * Camera: mostly top-down ("looking into a pipe") with subtle 3D perspective.
 * Rendered: Sun + 8 planets + orbit lines + Saturn rings. NO stars, NO sky dome.
 */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlanetDef {
  a: number;       // semi-major axis (AU)
  e: number;       // eccentricity
  i: number;       // inclination (deg)
  omega: number;   // longitude of ascending node (deg)
  w: number;       // argument of perihelion (deg)
  M0: number;      // mean anomaly at J2000 (deg)
  period: number;  // orbital period (days)
  radius: number;  // display radius (scene units)
  color: string;   // hex color
  gasGiant?: boolean;
  rings?: boolean;
}

// ─── Orbital Data (J2000.0 elements — from DYAI2025 repo) ───────────────────

const PLANETS: Record<string, PlanetDef> = {
  mercury: { a: 0.387,  e: 0.206, i: 7.0,  omega:  48.33, w:  29.12, M0: 174.79, period:   87.97, radius: 0.28, color: '#B5AFA8' },
  venus:   { a: 0.723,  e: 0.007, i: 3.4,  omega:  76.68, w:  54.88, M0:  50.45, period:  224.70, radius: 0.44, color: '#E8D598' },
  earth:   { a: 1.000,  e: 0.017, i: 0.0,  omega: -11.26, w: 114.21, M0: 357.53, period:  365.25, radius: 0.46, color: '#4A90D9' },
  mars:    { a: 1.524,  e: 0.093, i: 1.9,  omega:  49.56, w: 286.50, M0:  19.41, period:  686.98, radius: 0.36, color: '#CD5C5C' },
  jupiter: { a: 5.203,  e: 0.048, i: 1.3,  omega: 100.46, w: 273.87, M0:  20.02, period: 4332.59, radius: 1.10, color: '#D4A574', gasGiant: true },
  saturn:  { a: 9.537,  e: 0.054, i: 2.5,  omega: 113.64, w: 339.39, M0: 317.02, period:10759.22, radius: 0.95, color: '#E8C864', gasGiant: true, rings: true },
  uranus:  { a: 19.19,  e: 0.047, i: 0.8,  omega:  74.00, w:  96.99, M0: 142.24, period:30688.50, radius: 0.58, color: '#7EC8E3', gasGiant: true },
  neptune: { a: 30.07,  e: 0.009, i: 1.8,  omega: 131.78, w: 273.19, M0: 256.23, period:60182.00, radius: 0.55, color: '#5878E0', gasGiant: true },
};

const SUN_RADIUS   = 2.2;
const ORBIT_SCALE  = 26;   // log-compressed distance multiplier

// ─── Kepler Solver (Newton-Raphson) ──────────────────────────────────────────

function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 100; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

// ─── Planet 3D Position (Keplerian mechanics) ─────────────────────────────────

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

  const sc = Math.log10(r + 1) * ORBIT_SCALE / r;
  return new THREE.Vector3(x * sc, z * sc, -y * sc);
}

// ─── Orbit Path (parametric ellipse) ─────────────────────────────────────────

function buildOrbitPath(p: PlanetDef): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const steps = 180;

  const iR = p.i * Math.PI / 180;
  const oR = p.omega * Math.PI / 180;
  const wR = p.w * Math.PI / 180;
  const cO = Math.cos(oR), sO = Math.sin(oR);
  const cW = Math.cos(wR), sW = Math.sin(wR);
  const cI = Math.cos(iR), sI = Math.sin(iR);

  for (let step = 0; step <= steps; step++) {
    const M    = (step / steps) * 2 * Math.PI;
    const E    = solveKepler(M, p.e);
    const nu   = 2 * Math.atan2(
      Math.sqrt(1 + p.e) * Math.sin(E / 2),
      Math.sqrt(1 - p.e) * Math.cos(E / 2)
    );
    const r    = p.a * (1 - p.e * Math.cos(E));
    const xOrb = r * Math.cos(nu);
    const yOrb = r * Math.sin(nu);

    const x = (cO*cW - sO*sW*cI)*xOrb + (-cO*sW - sO*cW*cI)*yOrb;
    const y = (sO*cW + cO*sW*cI)*xOrb + (-sO*sW + cO*cW*cI)*yOrb;
    const z = (sW*sI)*xOrb + (cW*sI)*yOrb;

    const sc = Math.log10(r + 1) * ORBIT_SCALE / r;
    pts.push(new THREE.Vector3(x * sc, z * sc, -y * sc));
  }
  return pts;
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
        vUv    = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float time;
      uniform vec3  color1, color2, color3;
      varying vec2  vUv;
      varying vec3  vNormal;

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
      }
      float noise(vec2 st) {
        vec2 i = floor(st); vec2 f = fract(st);
        float a = rand(i), b = rand(i+vec2(1,0)), c = rand(i+vec2(0,1)), d = rand(i+vec2(1,1));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }

      void main() {
        vec2  nc  = vUv * 8.0 + time * 0.05;
        float n   = noise(nc);
        float n2  = noise(nc * 2.0 + vec2(time * 0.03, 0.0));
        float rim = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.0);

        vec3 col = mix(color1, color2, n * 0.5 + 0.5);
        col      = mix(col, color3, n2 * 0.3);
        col     += vec3(1.0, 0.9, 0.7) * step(0.85, n) * 0.3;
        col     += vec3(1.0, 0.6, 0.2) * rim * 0.5;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function createAtmosphereMaterial(color: string, intensity: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      intensity:  { value: intensity },
    },
    vertexShader: /* glsl */`
      varying vec3 vNormal, vViewPos;
      void main() {
        vNormal  = normalize(normalMatrix * normal);
        vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3  glowColor;
      uniform float intensity;
      varying vec3  vNormal, vViewPos;
      void main() {
        float rim   = pow(1.0 - max(0.0, dot(normalize(-vViewPos), vNormal)), 3.0);
        float alpha = rim * intensity * 0.6;
        gl_FragColor = vec4(glowColor * rim * intensity, alpha);
      }
    `,
    transparent: true,
    side:        THREE.BackSide,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
  });
}

function createSaturnRingsMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      float rand(vec2 s) { return fract(sin(dot(s, vec2(12.9898,78.233)))*43758.5453); }
      void main() {
        vec2  c    = vUv - 0.5;
        float dist = length(c) * 2.0;
        float b1   = sin(dist * 60.0) * 0.5 + 0.5;
        float b2   = sin(dist * 120.0 + 0.5) * 0.3 + 0.7;
        float cas  = smoothstep(0.73,0.75,dist) * (1.0 - smoothstep(0.75,0.77,dist));
        vec3  col  = vec3(0.85, 0.77, 0.65) * b1 * b2 * (1.0 - cas * 0.7);
        col       += rand(vUv * 100.0) * 0.1;
        float edge = smoothstep(0.0,0.1,dist) * (1.0 - smoothstep(0.9,1.0,dist));
        float alpha= 0.80 * b1 * b2 * edge * (1.0 - cas * 0.5);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    side:        THREE.DoubleSide,
    depthWrite:  false,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const SolarSystem3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth  || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Camera: "looking into a pipe" – high angle, narrow FOV ───────────────
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 5000);
    camera.position.set(0, 180, 72);
    camera.lookAt(0, 0, 0);

    // ── Renderer – fully transparent so parchment shows through ───────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Lighting ──────────────────────────────────────────────────────────────
    const sunLight = new THREE.PointLight('#FFFFEE', 3.5, 1500);
    scene.add(sunLight);
    // Warm ambient so parchment-colored light hits planet dark sides gently
    const ambientLight = new THREE.AmbientLight('#C8B89A', 0.45);
    scene.add(ambientLight);

    // ── Sun ───────────────────────────────────────────────────────────────────
    const sunGeo = new THREE.SphereGeometry(SUN_RADIUS, 64, 64);
    const sunMat = createSunMaterial();
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun glow halos (warm-gold to match parchment aesthetic)
    const halos = [
      { scale: 1.35, color: '#FFE4A0', opacity: 0.40 },
      { scale: 1.80, color: '#FFD060', opacity: 0.18 },
      { scale: 2.40, color: '#FFAA30', opacity: 0.09 },
      { scale: 3.20, color: '#FF8800', opacity: 0.04 },
    ];
    halos.forEach(({ scale, color, opacity }) => {
      const geo = new THREE.SphereGeometry(SUN_RADIUS * scale, 24, 24);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side:     THREE.BackSide,
        blending: THREE.AdditiveBlending,
      });
      scene.add(new THREE.Mesh(geo, mat));
    });

    // ── Planets, orbits, rings ────────────────────────────────────────────────
    const planetMeshes:  Record<string, THREE.Mesh> = {};
    const saturnRingMap: Record<string, THREE.Mesh> = {};

    Object.entries(PLANETS).forEach(([key, planet]) => {
      // Orbit path
      const orbitPts = buildOrbitPath(planet);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const orbitMat = new THREE.LineBasicMaterial({
        color:       0x826A4B,   // gold-bronze theme token
        transparent: true,
        opacity:     0.20,
      });
      scene.add(new THREE.Line(orbitGeo, orbitMat));

      // Planet sphere
      const pGeo = new THREE.SphereGeometry(planet.radius, 32, 32);
      const pMat = new THREE.MeshStandardMaterial({
        color:             new THREE.Color(planet.color),
        roughness:         0.65,
        metalness:         0.10,
        emissive:          new THREE.Color(planet.color),
        emissiveIntensity: 0.13,
      });
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.castShadow = true;
      scene.add(mesh);
      planetMeshes[key] = mesh;

      // Gas giant atmosphere glow
      if (planet.gasGiant) {
        const aGeo = new THREE.SphereGeometry(planet.radius * 1.18, 16, 16);
        mesh.add(new THREE.Mesh(aGeo, createAtmosphereMaterial(planet.color, 0.65)));
      }

      // Earth — blue atmosphere halo
      if (key === 'earth') {
        const aGeo = new THREE.SphereGeometry(planet.radius * 1.12, 16, 16);
        mesh.add(new THREE.Mesh(aGeo, createAtmosphereMaterial('#4A90D9', 0.85)));
      }

      // Saturn rings
      if (planet.rings) {
        const rGeo  = new THREE.RingGeometry(planet.radius * 1.45, planet.radius * 2.3, 128);
        const rings = new THREE.Mesh(rGeo, createSaturnRingsMaterial());
        rings.rotation.x = Math.PI / 2.5;
        scene.add(rings);
        saturnRingMap[key] = rings;
      }
    });

    // ── Camera controls: drag to orbit, scroll to zoom ────────────────────────
    // Spherical coords (phi = polar angle from Y, theta = azimuth around Y)
    // Initial: phi ≈ 22° from top (close to overhead "pipe" view)
    const current = { theta: 0.2,  phi: 0.38, radius: 192 };
    const target  = { theta: 0.2,  phi: 0.38, radius: 192 };

    let isDragging = false;
    let lastMouse  = { x: 0, y: 0 };

    const onMouseDown  = (e: MouseEvent) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; };
    const onMouseUp    = ()              => { isDragging = false; };
    const onMouseMove  = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      target.theta -= dx * 0.0035;
      target.phi    = Math.max(0.08, Math.min(Math.PI / 2.2, target.phi + dy * 0.0035));
      lastMouse = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      target.radius = Math.max(60, Math.min(600, target.radius + e.deltaY * 0.28));
    };

    // Touch support
    const onTouchStart = (e: TouchEvent) => { isDragging = true; lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTouchEnd   = ()              => { isDragging = false; };
    const onTouchMove  = (e: TouchEvent) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - lastMouse.x;
      const dy = e.touches[0].clientY - lastMouse.y;
      target.theta -= dx * 0.0035;
      target.phi    = Math.max(0.08, Math.min(Math.PI / 2.2, target.phi + dy * 0.0035));
      lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    container.addEventListener('mousedown',  onMouseDown);
    window.addEventListener(  'mouseup',     onMouseUp);
    container.addEventListener('mousemove',  onMouseMove);
    container.addEventListener('wheel',      onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend',   onTouchEnd);
    container.addEventListener('touchmove',  onTouchMove, { passive: true });

    // ── Simulation time ───────────────────────────────────────────────────────
    // Start from real current date so planet positions match today's sky
    const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
    let simDays = (Date.now() - J2000) / 86_400_000;

    // ── Animation loop ────────────────────────────────────────────────────────
    const clock  = new THREE.Clock();
    let   rafId: number;
    const SIM_SPEED = 8; // sim-days per real second (planets visibly orbit)

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Advance simulation
      simDays += delta * SIM_SPEED;

      // Animate sun shader
      sunMat.uniforms.time.value += delta;

      // Smooth camera interpolation
      current.theta  += (target.theta  - current.theta)  * 0.08;
      current.phi    += (target.phi    - current.phi)    * 0.08;
      current.radius += (target.radius - current.radius) * 0.08;

      camera.position.set(
        current.radius * Math.sin(current.phi) * Math.cos(current.theta),
        current.radius * Math.cos(current.phi),
        current.radius * Math.sin(current.phi) * Math.sin(current.theta),
      );
      camera.lookAt(0, 0, 0);

      // Update planet positions
      Object.entries(PLANETS).forEach(([key, planet]) => {
        const pos = getPlanetPosition(planet, simDays);
        planetMeshes[key]?.position.copy(pos);
        if (saturnRingMap[key]) saturnRingMap[key].position.copy(pos);
      });

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ────────────────────────────────────────────────────────
    const handleResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize',   handleResize);
      window.removeEventListener('mouseup',  onMouseUp);
      container.removeEventListener('mousedown',  onMouseDown);
      container.removeEventListener('mousemove',  onMouseMove);
      container.removeEventListener('wheel',      onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend',   onTouchEnd);
      container.removeEventListener('touchmove',  onTouchMove);
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
      onMouseUp={  e => { (e.currentTarget as HTMLDivElement).style.cursor = 'grab'; }}
    />
  );
};

export default SolarSystem3D;
