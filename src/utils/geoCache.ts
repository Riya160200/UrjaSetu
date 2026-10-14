/**
 * Geo data preloader and in-memory cache.
 * Allows CinematicEarth and IndiaGrid3D to share parsed GeoJSON objects,
 * eliminating redundant network roundtrips and guaranteeing zero-latency map initialization.
 */

export interface GeoCacheData {
  indiaStates: any | null;
  worldLand: any | null;
}

let cachedIndiaStates: any = null;
let cachedWorldLand: any = null;
let preloadPromise: Promise<[any, any]> | null = null;

export function preloadGeoData(): Promise<[any, any]> {
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = Promise.all([
    fetch('/india-states.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        cachedIndiaStates = data;
        return data;
      })
      .catch((err) => {
        console.warn('Failed to load /india-states.geojson:', err);
        return null;
      }),
    fetch('/world-land-110m.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        cachedWorldLand = data;
        return data;
      })
      .catch((err) => {
        console.warn('Failed to load /world-land-110m.json:', err);
        return null;
      }),
  ]);

  return preloadPromise;
}

export function getCachedGeoData(): GeoCacheData {
  return {
    indiaStates: cachedIndiaStates,
    worldLand: cachedWorldLand,
  };
}
