/**
 * Planetarium Toggle Button
 *
 * Floating pill that switches between Observatory (☀) and Planetarium (🌙) modes.
 */

import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlanetariumMode } from '../hooks/usePlanetariumMode';

export default function PlanetariumToggle() {
  const { mode, toggle, isPlanetarium } = usePlanetariumMode();

  return (
    <button
      onClick={toggle}
      className="mode-toggle-btn fixed top-4 right-6 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-md transition-all duration-500"
      aria-label={`Switch to ${isPlanetarium ? 'Observatory' : 'Planetarium'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          className="flex items-center"
        >
          {isPlanetarium ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </motion.span>
      </AnimatePresence>
      <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase">
        {isPlanetarium ? 'OBSERVATORY' : 'PLANETARIUM'}
      </span>
    </button>
  );
}
