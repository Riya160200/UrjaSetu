/**
 * CinematicEarth — genuine Three.js spherical Earth globe for the UrjaSetu landing page.
 *
 * ROOT CAUSES FIXED (previous implementation):
 *  1. Camera at z=220 with FOV=32° → sphere subtends 54° > FOV → Earth was cropped from frame 1.
 *     Fix: camera at z=380, FOV=50° → sphere subtends ~30° → full globe visible at ~60% height.
 *  2. No Earth surface texture — ocean was solid #040D1B; only cyan India state borders visible.
 *     Fix: load equirectangular Earth texture via THREE.TextureLoader with graceful fallback.
 *  3. Approach target z=EARTH_RADIUS+8=108 drove camera to the surface — India borders filled screen.
 *     Fix: approach to z=125 then iris overlay covers the close-up before route switch.
 *
 * TEXTURE ALIGNMENT MATH:
 *  Three.js SphereGeometry UV: u=0.25→+Z (= 90°W in equirectangular).
 *  latLngToSphere: lng=0°E → +Z (raw formula puts prime meridian at +Z).
 *  So base mismatch: sphere puts 90°W at +Z, but latLngToSphere puts 0°E at +Z.
 *  Base correction: rotate sphere Y by −90° (moves 0°E from +X to +Z).
 *  India centering (same as latLngToSphere): Y −82.5°, X +22°.
 *  Total applied in YXZ order: Y = −172.5°, X = +22°.
 */

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as topojson from 'topojson-client';
import {
  EARTH_RADIUS,
  latLngToSphere,
  createCorridorCurve,
} from '../../utils/geoProjection';
import { REGIONAL_GRID_NODES, TRANSMISSION_CORRIDORS } from '../../constants/gridData';
import { RotateCcw } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CAM_INITIAL_Z = 380;   // far enough to see FULL sphere (subtends ~30° in 50° FOV)
const CAM_APPROACH_Z = 125;  // close approach above India — NOT surface; iris hides the rest
const CAM_FOV = 50;          // wide enough for full sphere + comfortable margins

// Equirectangular Earth texture — CDN-hosted, appropriately licensed (NASA Blue Marble derivative)
// Multiple fallbacks in order of reliability.
const TEXTURE_URLS = [
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg',
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
];

// Texture alignment: rotate the sphere mesh in YXZ order so that
// the equirectangular pixel at India (82.5°E, 22°N) faces +Z.
// Y = −90° (base UV correction) + −82.5° (India centering) = −172.5°
// X = +22° (India latitude centering)
const SPHERE_ROT_Y = -172.5 * (Math.PI / 180);  // −3.011 rad
const SPHERE_ROT_X =   22.0 * (Math.PI / 180);  //  0.384 rad

interface GeoData {
  type: string;
  features: Array<{
    type: string;
    properties: Record<string, string | undefined>;
    geometry: { type: string; coordinates: unknown };
  }>;
}

export interface CinematicEarthHandle {
  enterGrid: (onComplete: () => void) => void;
}

interface Props {
  onEnterComplete?: () => void;
}

// ─── Easing helpers ───────────────────────────────────────────────────────────
function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}
function easeInCubic(t: number): number {
  return t * t * t;
}

// ─── Procedural fallback texture (Canvas-based) ───────────────────────────────
function buildFallbackTexture(): THREE.CanvasTexture {
  const w = 512, h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Ocean — deep midnight blue
  ctx.fillStyle = '#071829';
  ctx.fillRect(0, 0, w, h);

  // Very rough land shapes (illustrative only) — muted teal-green blobs
  ctx.fillStyle = '#0D2B1F';
  // Eurasia
  ctx.fillRect(220, 30, 180, 100);
  ctx.fillRect(200, 60, 220, 70);
  // Africa
  ctx.fillRect(220, 110, 60, 90);
  // Americas
  ctx.fillRect(40, 30, 70, 130);
  // Australia
  ctx.fillRect(330, 130, 50, 40);

  // India highlight — subtle warm tint
  ctx.fillStyle = '#0E3428';
  ctx.fillRect(270, 70, 30, 35);

  // Slight atmosphere gradient top/bottom
  const atm = ctx.createLinearGradient(0, 0, 0, h);
  atm.addColorStop(0, 'rgba(56,189,248,0.07)');
  atm.addColorStop(0.5, 'rgba(0,0,0,0)');
  atm.addColorStop(1, 'rgba(56,189,248,0.07)');
  ctx.fillStyle = atm;
  ctx.fillRect(0, 0, w, h);

  return new THREE.CanvasTexture(canvas);
}

// ─── Component ────────────────────────────────────────────────────────────────
export const CinematicEarth = forwardRef<CinematicEarthHandle, Props>(
  ({ onEnterComplete }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const animFrameIdRef = useRef<number | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    const [webGLError, setWebGLError] = useState(false);
    const [loading, setLoading] = useState(true);

    const onEnterCompleteRef = useRef(onEnterComplete);
    onEnterCompleteRef.current = onEnterComplete;

    const approachRef = useRef<{
      active: boolean;
      startTime: number;
      duration: number;
      startZ: number;
      targetZ: number;
      onComplete: () => void;
    } | null>(null);

    const prefersReducedMotion =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    // Write iris overlay opacity directly to DOM — never via setState inside rAF
    const setOverlayDOM = useCallback((opacity: number) => {
      const el = overlayRef.current;
      if (!el) return;
      el.style.opacity = String(opacity);
      el.style.display = opacity > 0.001 ? 'block' : 'none';
    }, []);

    // Public handle for LandingPage
    useImperativeHandle(ref, () => ({
      enterGrid(onComplete: () => void) {
        if (approachRef.current?.active) return;
        const camera = cameraRef.current;
        const controls = controlsRef.current;

        if (!camera || !controls) { onComplete(); return; }

        if (prefersReducedMotion) {
          setOverlayDOM(1);
          setTimeout(onComplete, 450);
          return;
        }

        controls.enabled = false;
        approachRef.current = {
          active: true,
          startTime: performance.now(),
          duration: 2600,
          startZ: camera.position.z,
          targetZ: CAM_APPROACH_Z,
          onComplete,
        };
      },
    }));

    const handleResetToIndia = useCallback(() => {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      if (!cam || !ctrl) return;
      cam.position.set(0, 0, CAM_INITIAL_Z);
      cam.up.set(0, 1, 0);
      ctrl.target.set(0, 0, 0);
      ctrl.enabled = true;
      ctrl.update();
      approachRef.current = null;
      setOverlayDOM(0);
    }, [setOverlayDOM]);

    // ── Main Three.js setup ──────────────────────────────────────────────────
    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;

      // ── Renderer ────────────────────────────────────────────────────────
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        setWebGLError(true);
        setLoading(false);
        return;
      }
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      rendererRef.current = renderer;

      // ── Scene ────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();

      // ── Camera ───────────────────────────────────────────────────────────
      // FOV=50°, camera at z=380:
      //   Angular size of sphere = 2·asin(100/380) = 30.6°
      //   Sphere fills 30.6/50 = 61% of viewport height → full globe with margins ✓
      const camera = new THREE.PerspectiveCamera(CAM_FOV, width / height, 0.1, 2000);
      cameraRef.current = camera;
      camera.position.set(0, 0, CAM_INITIAL_Z);
      camera.up.set(0, 1, 0);

      // ── Orbit Controls ───────────────────────────────────────────────────
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.4;
      controls.zoomSpeed = 0.6;
      controls.enablePan = false;
      controls.minDistance = 200;   // never closer than 100 above surface
      controls.maxDistance = 700;
      controls.minPolarAngle = Math.PI * 0.12;
      controls.maxPolarAngle = Math.PI * 0.88;
      controls.target.set(0, 0, 0);
      controlsRef.current = controls;

      // ── Lighting ────────────────────────────────────────────────────────
      // Deep space ambient
      scene.add(new THREE.AmbientLight(0x0A1830, 2.0));

      // Primary sun — warm directional, northwest of India
      const sun = new THREE.DirectionalLight(0xFFF8F0, 3.6);
      sun.position.set(-80, 90, 120);
      scene.add(sun);

      // Cyan atmospheric rim — eastern Indian Ocean
      const rim = new THREE.DirectionalLight(0x38BDF8, 1.8);
      rim.position.set(90, -40, 60);
      scene.add(rim);

      // Deep blue backfill
      const fill = new THREE.DirectionalLight(0x1A3B7A, 1.0);
      fill.position.set(0, -100, -80);
      scene.add(fill);

      // Approach glow (animated in loop)
      const approachLight = new THREE.PointLight(0x38BDF8, 0, 80);
      approachLight.position.set(0, 0, EARTH_RADIUS + 10);
      scene.add(approachLight);

      // ── Starfield ────────────────────────────────────────────────────────
      const starGeom = new THREE.BufferGeometry();
      const starCount = 800;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        const r = 500 + Math.random() * 400;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        starPos[i]     = r * Math.sin(p) * Math.cos(t);
        starPos[i + 1] = r * Math.sin(p) * Math.sin(t);
        starPos[i + 2] = r * Math.cos(p);
      }
      starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeom, new THREE.PointsMaterial({
        color: 0xCDD9E5,
        size: 0.9,
        transparent: true,
        opacity: 0.55,
      })));

      // ── Globe group ──────────────────────────────────────────────────────
      const globeGroup = new THREE.Group();
      scene.add(globeGroup);

      // ── Earth surface sphere with texture ────────────────────────────────
      const earthGeom = new THREE.SphereGeometry(EARTH_RADIUS, 72, 56);

      // The textured sphere needs to be rotated so India faces +Z.
      // Applied in YXZ order: first Y=−172.5°, then X=+22°.
      // See file header comment for the full derivation.
      const earthMesh = new THREE.Mesh(earthGeom, new THREE.MeshPhongMaterial({
        color: 0x336699,          // ocean colour shown while texture loads
        shininess: 8,
        specular: new THREE.Color(0x112244),
      }));
      earthMesh.setRotationFromEuler(
        new THREE.Euler(SPHERE_ROT_X, SPHERE_ROT_Y, 0, 'YXZ')
      );
      globeGroup.add(earthMesh);

      // Load texture cascade
      const loader = new THREE.TextureLoader();
      let textureLoadIdx = 0;
      const tryNextTexture = () => {
        if (textureLoadIdx >= TEXTURE_URLS.length) {
          // All CDNs failed — use canvas fallback
          const fallback = buildFallbackTexture();
          (earthMesh.material as THREE.MeshPhongMaterial).map = fallback;
          (earthMesh.material as THREE.MeshPhongMaterial).color.setHex(0xffffff);
          (earthMesh.material as THREE.MeshPhongMaterial).needsUpdate = true;
          return;
        }
        const url = TEXTURE_URLS[textureLoadIdx++];
        loader.load(
          url,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            const mat = earthMesh.material as THREE.MeshPhongMaterial;
            mat.map = tex;
            mat.color.setHex(0xffffff);  // let texture drive colour fully
            mat.needsUpdate = true;
            setLoading(false);
          },
          undefined,
          () => tryNextTexture()  // on error, try next URL
        );
      };
      tryNextTexture();

      // ── Atmospheric halo ─────────────────────────────────────────────────
      // Inner glow
      globeGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_RADIUS + 2.5, 64, 48),
        new THREE.MeshBasicMaterial({
          color: 0x38BDF8,
          transparent: true,
          opacity: 0.065,
          side: THREE.BackSide,
          depthWrite: false,
        })
      ));
      // Outer auroral rim
      globeGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_RADIUS + 6, 48, 36),
        new THREE.MeshBasicMaterial({
          color: 0x0284C7,
          transparent: true,
          opacity: 0.028,
          side: THREE.BackSide,
          depthWrite: false,
        })
      ));

      // ── Geographic overlay layer ─────────────────────────────────────────
      // These use latLngToSphere() which already applies India-centering rotations.
      // They render on top of the textured sphere — they are NOT rotated by SPHERE_ROT_*.
      const overlayGroup = new THREE.Group();
      globeGroup.add(overlayGroup);

      const pulsingRings: THREE.Mesh[] = [];
      const flowParticles: Array<{
        curve: THREE.Curve<THREE.Vector3>;
        mesh: THREE.Mesh;
        speed: number;
        offset: number;
      }> = [];

      Promise.all([
        fetch('/india-states.geojson').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/world-land-110m.json').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(([indiaData, worldData]) => {

        // World coastlines — very subtle so texture shows through
        if (worldData?.objects?.land) {
          const land = (topojson.feature(worldData, worldData.objects.land) as unknown) as { features: Array<{ geometry: { type: string; coordinates: unknown } }> };
          land.features?.forEach(f => {
            const geom = f.geometry;
            type LngLat = [number, number];
            const coordsList = geom.type === 'Polygon'
              ? [geom.coordinates as LngLat[][]]
              : geom.coordinates as LngLat[][][];
            coordsList.forEach(poly => {
              const ring = poly[0];
              if (!ring || ring.length < 3) return;
              const pts = ring.map((pt: LngLat) => latLngToSphere(pt[0], pt[1], EARTH_RADIUS, 0.3));
              globeGroup.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: 0x1E3A5F, transparent: true, opacity: 0.35 })
              ));
            });
          });
        }

        // India state borders — bright cyan so they read as an intelligence overlay
        if ((indiaData as GeoData)?.features) {
          (indiaData as GeoData).features.forEach(feat => {
            const geom = feat.geometry;
            type LngLat = [number, number];
            const polys = geom.type === 'Polygon'
              ? [geom.coordinates as LngLat[][]]
              : geom.coordinates as LngLat[][][];
            polys.forEach(poly => {
              const outer = poly[0];
              if (!outer || outer.length < 3) return;
              const pts = outer.map((pt: LngLat) =>
                latLngToSphere(pt[0], pt[1], EARTH_RADIUS, 1.2)
              );
              overlayGroup.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.7 })
              ));
            });
          });
        }

        // Regional grid intelligence nodes
        REGIONAL_GRID_NODES.forEach(node => {
          const pos = latLngToSphere(node.lng, node.lat, EARTH_RADIUS, 2.0);
          const nodeObj = new THREE.Group();
          nodeObj.position.copy(pos);
          nodeObj.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            pos.clone().normalize()
          );

          // Beacon octahedron
          const beacon = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.22),
            new THREE.MeshStandardMaterial({
              color: 0x38BDF8, emissive: 0x38BDF8,
              emissiveIntensity: 0.9, metalness: 0.85,
            })
          );
          beacon.position.z = 0.18;
          nodeObj.add(beacon);

          // Pulsing ring
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.28, 0.42, 20),
            new THREE.MeshBasicMaterial({
              color: 0xB8FF65, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
            })
          );
          ring.position.z = 0.06;
          nodeObj.add(ring);
          pulsingRings.push(ring);
          overlayGroup.add(nodeObj);
        });

        // Transmission arcs + flow particles
        const nodeMap = new Map(REGIONAL_GRID_NODES.map(n => [n.id, n]));
        TRANSMISSION_CORRIDORS.slice(0, 8).forEach((corr, idx) => {
          const from = nodeMap.get(corr.fromNodeId);
          const to = nodeMap.get(corr.toNodeId);
          if (!from || !to) return;
          const p1 = latLngToSphere(from.lng, from.lat, EARTH_RADIUS, 2.2);
          const p2 = latLngToSphere(to.lng, to.lat, EARTH_RADIUS, 2.2);
          const curve = createCorridorCurve(p1, p2, 2.5);
          overlayGroup.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)),
            new THREE.LineBasicMaterial({
              color: corr.voltageKV === 800 ? 0xB8FF65 : 0x38BDF8,
              transparent: true, opacity: 0.45,
            })
          ));
          const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 6, 6),
            new THREE.MeshBasicMaterial({ color: corr.voltageKV === 800 ? 0xB8FF65 : 0x38BDF8 })
          );
          overlayGroup.add(particle);
          flowParticles.push({ curve, mesh: particle, speed: 0.18 + (idx % 3) * 0.06, offset: (idx * 0.2) % 1 });
        });

        // Mark as ready if texture already loaded, else texture callback handles it
        if (!(earthMesh.material as THREE.MeshPhongMaterial).map) setLoading(false);

      }).catch(() => setLoading(false));

      // ── Resize Observer ──────────────────────────────────────────────────
      const resizeObs = new ResizeObserver(entries => {
        for (const e of entries) {
          const { width: w, height: h } = e.contentRect;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        }
      });
      resizeObs.observe(container);

      // ── Animation Loop ───────────────────────────────────────────────────
      const startTime = performance.now();
      const animate = () => {
        animFrameIdRef.current = requestAnimationFrame(animate);
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;

        // Camera approach
        const approach = approachRef.current;
        if (approach?.active) {
          const progress = Math.min((now - approach.startTime) / approach.duration, 1);

          // Camera movement: first 75% of time
          const camP = easeInOutQuart(Math.min(progress / 0.75, 1));
          // Iris overlay: last 40% of time
          const iriP = easeInCubic(Math.max((progress - 0.60) / 0.40, 0));

          const newZ = approach.startZ + (approach.targetZ - approach.startZ) * camP;
          camera.position.set(0, 0, newZ);
          controls.target.set(0, 0, 0);

          approachLight.intensity = iriP * 3.0;
          setOverlayDOM(iriP);

          if (progress >= 1) {
            approach.active = false;
            setTimeout(() => {
              onEnterCompleteRef.current?.();
              approach.onComplete();
            }, 100);
          }
        } else {
          controls.update();
          approachLight.intensity = 0;
        }

        // Subtle slow auto-rotation when idle (not approaching)
        if (!approach?.active && !prefersReducedMotion) {
          globeGroup.rotation.y += 0.00008;
        }

        // Node pulse + flow particles
        if (!prefersReducedMotion) {
          const s = 1.0 + 0.3 * Math.sin(elapsed * 2.2);
          pulsingRings.forEach(r => r.scale.set(s, s, 1));
          flowParticles.forEach(fp => {
            const t = (elapsed * fp.speed + fp.offset) % 1;
            fp.mesh.position.copy(fp.curve.getPoint(t));
          });
        }

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
        approachRef.current = null;
        resizeObs.disconnect();
        renderer.dispose();
        // Dispose geometries and materials
        scene.traverse(obj => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material?.dispose();
          }
        });
      };
    }, [prefersReducedMotion, setOverlayDOM]);

    // ── WebGL fallback ───────────────────────────────────────────────────────
    if (webGLError) {
      return (
        <div className="relative w-full h-full flex items-center justify-center p-8 bg-[#050B14]">
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#071324] border border-[#162C4A] shadow-2xl max-w-md">
            <div className="w-20 h-20 rounded-full border border-[#38BDF8] flex items-center justify-center mb-4 bg-[#0A1A30]">
              <span className="font-devanagari text-2xl font-bold text-[#38BDF8]">ऊर्जा</span>
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">
              UrjaSetu Planetary Intelligence
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              WebGL unavailable in this context. The federated grid intelligence dashboard
              is still fully accessible — click "Enter the Grid" to proceed.
            </p>
          </div>
        </div>
      );
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full select-none"
        style={{ minHeight: '400px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        />

        {/* Iris overlay — DOM ref driven, no React setState in rAF */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            display: 'none',
            opacity: 0,
            background: 'radial-gradient(ellipse at center, rgba(4,15,30,0.97) 0%, rgba(2,8,18,1) 65%)',
          }}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030712]/75 backdrop-blur-sm z-20">
            <div className="relative flex items-center justify-center w-12 h-12 mb-3">
              <div className="absolute w-full h-full border-2 border-[#1E3A5F] rounded-full" />
              <div className="absolute w-full h-full border-2 border-t-[#38BDF8] border-r-[#B8FF65] rounded-full animate-spin" />
              <span className="font-devanagari text-xs text-[#38BDF8]">ऊर्जा</span>
            </div>
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
              CALIBRATING EARTH VIEW...
            </span>
          </div>
        )}

        {/* Reset control */}
        <div className="absolute bottom-5 right-5 z-10">
          <button
            onClick={handleResetToIndia}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#071324]/90 hover:bg-[#0C1D33] border border-[#182F4E] text-slate-300 hover:text-white text-xs font-mono backdrop-blur-md transition-all shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
            title="Reset camera"
            aria-label="Reset camera to default Earth view"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>RESET VIEW</span>
          </button>
        </div>

        {/* Focal watermark */}
        <div className="absolute bottom-5 left-5 z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-600 bg-[#050D18]/80 px-2.5 py-1 rounded border border-[#0F1E2E] backdrop-blur-sm pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          <span>ANCHOR: 82.5°E 22.0°N — INDIA GRID</span>
        </div>
      </div>
    );
  }
);

CinematicEarth.displayName = 'CinematicEarth';
