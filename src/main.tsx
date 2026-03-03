import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PlanetariumProvider } from './hooks/usePlanetariumMode';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlanetariumProvider>
      <App />
    </PlanetariumProvider>
  </StrictMode>,
);
