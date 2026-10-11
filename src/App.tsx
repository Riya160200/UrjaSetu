import { useState, useRef, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './components/landing/LandingPage';
import type { NavItemId } from './types';

/**
 * App — top-level router and transition orchestrator.
 *
 * The cinematic landing-to-dashboard journey works like this:
 *   1. LandingPage is mounted (view === 'landing').
 *   2. User clicks "Enter the Grid" → LandingPage triggers CinematicEarth.enterGrid().
 *   3. Three.js camera zooms toward India over ~2.2 s.
 *   4. Near the end of that zoom the CinematicEarth overlays its own full-canvas iris fade.
 *   5. Simultaneously, LandingPage calls onExplore() — which we receive here.
 *   6. Here we also apply a page-level CSS veil (.cinematic-veil → .visible) so the
 *      view switch from 'landing' → 'app' is completely hidden behind it.
 *   7. After the React re-render has committed (dashboard is mounted), we lift the veil
 *      using a rAF + short timeout so the dashboard fades in elegantly.
 */
export function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeItem, setActiveItem] = useState<NavItemId>('overview');

  // DOM ref for the full-viewport veil element — updated via className, never via React state,
  // so the transition never triggers an extra re-render at a critical moment.
  const veilRef = useRef<HTMLDivElement>(null);

  const handleExplore = useCallback(() => {
    const veil = veilRef.current;

    // 1. Activate the veil (CSS transition handles the opacity animation)
    if (veil) {
      veil.classList.add('visible');
    }

    // 2. Switch view after one rAF so the veil paint lands before the DOM swap
    requestAnimationFrame(() => {
      setView('app');

      // 3. Lift the veil once the dashboard has rendered (two frames + small buffer)
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (veil) veil.classList.remove('visible');
        }, 180);
      });
    });
  }, []);

  return (
    <>
      {/* Full-viewport dark cinematic veil — sits above everything during transition */}
      <div ref={veilRef} className="cinematic-veil" aria-hidden="true" />

      {view === 'landing' ? (
        <LandingPage onExplore={handleExplore} />
      ) : (
        <AppShell
          activeItem={activeItem}
          onSelectItem={setActiveItem}
          onReturnToLanding={() => setView('landing')}
        />
      )}
    </>
  );
}

export default App;
