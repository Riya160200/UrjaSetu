import * as THREE from 'three';

// Standard geographic center of Indian sub-continental grid mesh
export const INDIA_CENTER_LNG = 82.5;
export const INDIA_CENTER_LAT = 22.0;

// Sphere radius for 3D curved Earth mode
export const EARTH_RADIUS = 100;

/**
 * Projects (lng, lat) to 3D Cartesian coordinates on a sphere centered at origin,
 * with India (82.5°E, 22.0°N) facing directly toward +Z and North aligned with +Y.
 */
export function latLngToSphere(
  lng: number,
  lat: number,
  radius: number = EARTH_RADIUS,
  altitude: number = 0
): THREE.Vector3 {
  const r = radius + altitude;
  
  // Standard spherical globe coordinates (North is +Y, East is +X, Prime Meridian is +Z)
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;

  const pos = new THREE.Vector3(
    r * Math.cos(phi) * Math.sin(lambda),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.cos(lambda)
  );

  // Exact geographic rotation:
  // 1. Spin around Y-axis by -82.5° (rotates India's central meridian to Prime Meridian facing +Z)
  pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), -INDIA_CENTER_LNG * (Math.PI / 180));
  // 2. Tilt around X-axis by +22.0° (brings India's central latitude 22°N to the center line facing +Z)
  pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), INDIA_CENTER_LAT * (Math.PI / 180));

  return pos;
}

/**
 * Projects (lng, lat) to 2.5D planar coordinates centered at (0, 0)
 */
export function latLngToPlanar(
  lng: number,
  lat: number,
  scale: number = 2.4,
  altitude: number = 0
): THREE.Vector3 {
  // Equidistant Cylindrical / Equirectangular projection with standard parallel at India central latitude (22.0°N)
  // Preserves true 1:1 metric distance ratio: 1° of longitude at 22°N is cos(22°) of 1° of latitude.
  const cosStandardParallel = Math.cos((INDIA_CENTER_LAT * Math.PI) / 180);
  const x = (lng - INDIA_CENTER_LNG) * cosStandardParallel * scale;
  const y = (lat - INDIA_CENTER_LAT) * scale;
  const z = altitude;

  return new THREE.Vector3(x, y, z);
}

/**
 * Generates an elevated 3D quadratic bezier curve between two geographic positions
 */
export function createCorridorCurve(
  start: THREE.Vector3,
  end: THREE.Vector3,
  elevation: number = 3.2
): THREE.QuadraticBezierCurve3 {
  // Calculate mid point
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  // Distance between nodes determines arc height
  const dist = start.distanceTo(end);
  const actualElevation = elevation * Math.min(Math.max(dist / 20, 0.4), 1.8);

  // Elevation vector points outwards from origin (for spherical) or +Z (for planar)
  const normal = mid.clone().normalize();
  mid.add(normal.multiplyScalar(actualElevation));

  return new THREE.QuadraticBezierCurve3(start, mid, end);
}
