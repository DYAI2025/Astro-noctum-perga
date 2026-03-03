/**
 * Planetarium Mode Context
 *
 * Provides a global toggle between "observatory" (parchment) and "planetarium" (dark)
 * modes. Sets `data-mode` attribute on the root <html> element for CSS-driven theming.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ViewMode = 'observatory' | 'planetarium';

interface PlanetariumContextValue {
  mode: ViewMode;
  toggle: () => void;
  isPlanetarium: boolean;
}

const PlanetariumContext = createContext<PlanetariumContextValue>({
  mode: 'observatory',
  toggle: () => {},
  isPlanetarium: false,
});

export function PlanetariumProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('observatory');

  const toggle = useCallback(() => {
    setMode(prev => (prev === 'observatory' ? 'planetarium' : 'observatory'));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  return (
    <PlanetariumContext.Provider value={{ mode, toggle, isPlanetarium: mode === 'planetarium' }}>
      {children}
    </PlanetariumContext.Provider>
  );
}

export function usePlanetariumMode() {
  return useContext(PlanetariumContext);
}
