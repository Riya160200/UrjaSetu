/**
 * CinematicEarth — genuine Three.js spherical Earth globe for the UrjaSetu landing page.
 *
 * Implements:
 *  - Full spherical Earth viewed from deep space with correct geographic mapping
 *  - Atmospheric Rayleigh blue rim & specular lighting
 *  - High-res Earth texture with multi-layer fallback (local bundled -> CDN -> procedural canvas)
 *  - Recognizable and prominently positioned India (centered on +Z axis)
 *  - Restrained cyan grid-intelligence nodes and transmission corridors
 *  - True 3D camera approach toward India on "Enter the Grid" CTA, naturally growing beyond viewport
 *  - Seamless crossfade into the national dashboard once ready
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
import { preloadGeoData } from '../../utils/geoCache';
import { RotateCcw } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CAM_INITIAL_Z = 340;   // subtends ~34° in 50° FOV (~68% canvas height) — full globe with elegant margins
const CAM_APPROACH_Z = 122;  // close approach above India (r=100 -> only 22 units above surface)
const CAM_FOV = 50;

// Equirectangular Earth textures:
// 1. Local pre-bundled NASA Blue Marble derivative (instant, works offline)
// 2. High-speed jsDelivr CDN
// 3. Unpkg CDN
// 4. Raw GitHub fallback
const TEXTURE_URLS = [
  '/textures/earth-blue-marble.jpg',
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
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInCubic(t: number): number {
  return t * t * t;
}

// ─── Procedural fallback texture (Canvas-based) ───────────────────────────────
function buildFallbackTexture(): THREE.CanvasTexture {
  const w = 1024, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
  oceanGrad.addColorStop(0, '#04101e');
  oceanGrad.addColorStop(0.5, '#07182b');
  oceanGrad.addColorStop(1, '#04101e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // Muted landmass silhouettes
  ctx.fillStyle = '#0b261b';
  // Eurasia
  ctx.beginPath();
  ctx.ellipse(620, 150, 240, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  // Africa
  ctx.beginPath();
  ctx.ellipse(540, 290, 75, 110, 0, 0, Math.PI * 2);
  ctx.fill();
  // Americas
  ctx.beginPath();
  ctx.ellipse(220, 170, 90, 110, 0, 0, Math.PI * 2);
  ctx.ellipse(280, 360, 65, 110, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(820, 350, 70, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle atmospheric edge bands
  const atm = ctx.createLinearGradient(0, 0, 0, h);
  atm.addColorStop(0, 'rgba(56,189,248,0.12)');
  atm.addColorStop(0.3, 'rgba(0,0,0,0)');
  atm.addColorStop(0.7, 'rgba(0,0,0,0)');
  atm.addColorStop(1, 'rgba(56,189,248,0.12)');
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
    const globeGroupRef = useRef<THREE.Group | null>(null);

    const [webGLError, setWebGLError] = useState(false);
    const [loading, setLoading] = useState(true);

    const onEnterCompleteRef = useRef(onEnterComplete);
    useEffect(() => {
      onEnterCompleteRef.current = onEnterComplete;
    }, [onEnterComplete]);

    const approachRef = useRef<{
      active: boolean;
      startTime: number;
      duration: number;
      startCamPos: THREE.Vector3;
      targetCamPos: THREE.Vector3;
      startGlobeRotY: number;
      onComplete: () => void;
    } | null>(null);

    const prefersReducedMotion =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    // Write iris overlay opacity directly to DOM for 60fps performance
    const setOverlayDOM = useCallback((opacity: number) => {
      const el = overlayRef.current;
      if (!el) return;
      el.style.opacity = String(opacity);
      el.style.display = opacity > 0.001 ? 'block' : 'none';
    }, []);

    // Public handle for LandingPage to trigger cinematic approach
    useImperativeHandle(ref, () => ({
      enterGrid(onComplete: () => void) {
        if (approachRef.current?.active) return;
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        const globeGroup = globeGroupRef.current;

        if (!camera || !controls || !globeGroup) {
          onComplete();
          return;
        }

        if (prefersReducedMotion) {
          setOverlayDOM(1);
          setTimeout(onComplete, 350);
          return;
        }

        controls.enabled = false;
        approachRef.current = {
          active: true,
          startTime: performance.now(),
          duration: 2500,
          startCamPos: camera.position.clone(),
          targetCamPos: new THREE.Vector3(0, 0, CAM_APPROACH_Z),
          startGlobeRotY: globeGroup.rotation.y,
          onComplete,
        };
      },
    }));

    const handleResetToIndia = useCallback(() => {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      const globeGroup = globeGroupRef.current;
      if (!cam || !ctrl || !globeGroup) return;

      cam.position.set(0, 0, CAM_INITIAL_Z);
      cam.up.set(0, 1, 0);
      globeGroup.rotation.set(0, 0, 0);
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
      } catch (e) {
        console.error('WebGL init failed:', e);
        // Defer state update out of synchronous effect execution
        setTimeout(() => {
          setWebGLError(true);
          setLoading(false);
        }, 0);
        return;
      }

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      rendererRef.current = renderer;

      // ── Scene ────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();

      // ── Camera ───────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(CAM_FOV, width / height, 0.1, 2000);
      cameraRef.current = camera;
      camera.position.set(0, 0, CAM_INITIAL_Z);
      camera.up.set(0, 1, 0);

      // ── Orbit Controls ───────────────────────────────────────────────────
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.45;
      controls.zoomSpeed = 0.6;
      controls.enablePan = false;
      controls.minDistance = 160;
      controls.maxDistance = 600;
      controls.minPolarAngle = Math.PI * 0.12;
      controls.maxPolarAngle = Math.PI * 0.88;
      controls.target.set(0, 0, 0);
      controlsRef.current = controls;

      // ── Lighting ────────────────────────────────────────────────────────
      // Deep space ambient fill
      scene.add(new THREE.AmbientLight(0x0a162b, 2.2));

      // Primary sun — directional warm keylight
      const sun = new THREE.DirectionalLight(0xfff7ee, 3.8);
      sun.position.set(-90, 100, 130);
      scene.add(sun);

      // Cyan atmospheric rim light (eastern side)
      const rim = new THREE.DirectionalLight(0x38bdf8, 2.2);
      rim.position.set(110, -30, 70);
      scene.add(rim);

      // Subtle southern hemisphere fill
      const fill = new THREE.DirectionalLight(0x13305c, 1.2);
      fill.position.set(0, -110, -90);
      scene.add(fill);

      // Approach pulse light
      const approachLight = new THREE.PointLight(0x38bdf8, 0, 120);
      approachLight.position.set(0, 0, EARTH_RADIUS + 12);
      scene.add(approachLight);

      // ── Starfield ────────────────────────────────────────────────────────
      const starGeom = new THREE.BufferGeometry();
      const starCount = 900;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        const r = 450 + Math.random() * 450;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        starPos[i]     = r * Math.sin(p) * Math.cos(t);
        starPos[i + 1] = r * Math.sin(p) * Math.sin(t);
        starPos[i + 2] = r * Math.cos(p);
      }
      starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      scene.add(
        new THREE.Points(
          starGeom,
          new THREE.PointsMaterial({
            color: 0xcfd9e8,
            size: 1.0,
            transparent: true,
            opacity: 0.65,
          })
        )
      );

      // ── Globe group ──────────────────────────────────────────────────────
      const globeGroup = new THREE.Group();
      globeGroupRef.current = globeGroup;
      scene.add(globeGroup);

      // ── Earth surface sphere with texture ────────────────────────────────
      const earthGeom = new THREE.SphereGeometry(EARTH_RADIUS, 72, 56);
      const earthMesh = new THREE.Mesh(
        earthGeom,
        new THREE.MeshPhongMaterial({
          color: 0x1f4e79, // base ocean color while texture paints
          shininess: 12,
          specular: new THREE.Color(0x16335a),
        })
      );
      earthMesh.setRotationFromEuler(
        new THREE.Euler(SPHERE_ROT_X, SPHERE_ROT_Y, 0, 'YXZ')
      );
      globeGroup.add(earthMesh);

      // Load texture with failover cascade
      const loader = new THREE.TextureLoader();
      let textureLoadIdx = 0;
      const tryNextTexture = () => {
        if (textureLoadIdx >= TEXTURE_URLS.length) {
          const fallback = buildFallbackTexture();
          (earthMesh.material as THREE.MeshPhongMaterial).map = fallback;
          (earthMesh.material as THREE.MeshPhongMaterial).color.setHex(0xffffff);
          (earthMesh.material as THREE.MeshPhongMaterial).needsUpdate = true;
          setLoading(false);
          return;
        }
        const url = TEXTURE_URLS[textureLoadIdx++];
        loader.load(
          url,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            const mat = earthMesh.material as THREE.MeshPhongMaterial;
            mat.map = tex;
            mat.color.setHex(0xffffff);
            mat.needsUpdate = true;
            setLoading(false);
          },
          undefined,
          () => tryNextTexture()
        );
      };
      tryNextTexture();

      // ── Atmospheric halo ─────────────────────────────────────────────────
      // Inner cyan Rayleigh atmosphere
      const innerAtmo = new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_RADIUS + 2.5, 64, 48),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.08,
          side: THREE.BackSide,
          depthWrite: false,
        })
      );
      globeGroup.add(innerAtmo);

      // Outer auroral glow
      const outerAtmo = new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_RADIUS + 6.5, 48, 36),
        new THREE.MeshBasicMaterial({
          color: 0x0284c7,
          transparent: true,
          opacity: 0.035,
          side: THREE.BackSide,
          depthWrite: false,
        })
      );
      globeGroup.add(outerAtmo);

      // ── Geographic overlay layer ─────────────────────────────────────────
      const overlayGroup = new THREE.Group();
      globeGroup.add(overlayGroup);

      const pulsingRings: THREE.Mesh[] = [];
      const flowParticles: Array<{
        curve: THREE.Curve<THREE.Vector3>;
        mesh: THREE.Mesh;
        speed: number;
        offset: number;
      }> = [];

      // Preload shared geo data and draw overlays
      preloadGeoData()
        .then(([indiaData, worldData]) => {
          // World coastlines — subtle oceanic boundary lines
          if (worldData?.objects?.land) {
            const land = topojson.feature(worldData, worldData.objects.land) as unknown as {
              features: Array<{ geometry: { type: string; coordinates: unknown } }>;
            };
            land.features?.forEach((f) => {
              const geom = f.geometry;
              type LngLat = [number, number];
              const coordsList =
                geom.type === 'Polygon'
                  ? [geom.coordinates as LngLat[][]]
                  : (geom.coordinates as LngLat[][][]);
              coordsList.forEach((poly) => {
                const ring = poly[0];
                if (!ring || ring.length < 3) return;
                const pts = ring.map((pt: LngLat) =>
                  latLngToSphere(pt[0], pt[1], EARTH_RADIUS, 0.3)
                );
                globeGroup.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(pts),
                    new THREE.LineBasicMaterial({
                      color: 0x1d3d63,
                      transparent: true,
                      opacity: 0.35,
                    })
                  )
                );
              });
            });
          }

          // India state borders — crisp electric cyan overlay
          if ((indiaData as GeoData)?.features) {
            (indiaData as GeoData).features.forEach((feat) => {
              const geom = feat.geometry;
              type LngLat = [number, number];
              const polys =
                geom.type === 'Polygon'
                  ? [geom.coordinates as LngLat[][]]
                  : (geom.coordinates as LngLat[][][]);
              polys.forEach((poly) => {
                const outer = poly[0];
                if (!outer || outer.length < 3) return;
                const pts = outer.map((pt: LngLat) =>
                  latLngToSphere(pt[0], pt[1], EARTH_RADIUS, 1.2)
                );
                overlayGroup.add(
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(pts),
                    new THREE.LineBasicMaterial({
                      color: 0x38bdf8,
                      transparent: true,
                      opacity: 0.75,
                    })
                  )
                );
              });
            });
          }

          // Regional grid intelligence nodes
          REGIONAL_GRID_NODES.forEach((node) => {
            const pos = latLngToSphere(node.lng, node.lat, EARTH_RADIUS, 1.9);
            const nodeObj = new THREE.Group();
            nodeObj.position.copy(pos);
            nodeObj.quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              pos.clone().normalize()
            );

            // Beacon octahedron
            const beacon = new THREE.Mesh(
              new THREE.OctahedronGeometry(0.24),
              new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x38bdf8,
                emissiveIntensity: 0.95,
                metalness: 0.85,
              })
            );
            beacon.position.z = 0.2;
            nodeObj.add(beacon);

            // Pulsing ring
            const ring = new THREE.Mesh(
              new THREE.RingGeometry(0.3, 0.46, 24),
              new THREE.MeshBasicMaterial({
                color: 0xb8ff65,
                transparent: true,
                opacity: 0.65,
                side: THREE.DoubleSide,
              })
            );
            ring.position.z = 0.08;
            nodeObj.add(ring);
            pulsingRings.push(ring);
            overlayGroup.add(nodeObj);
          });

          // Inter-regional transmission corridors
          const nodeMap = new Map(REGIONAL_GRID_NODES.map((n) => [n.id, n]));
          TRANSMISSION_CORRIDORS.slice(0, 8).forEach((corr, idx) => {
            const from = nodeMap.get(corr.fromNodeId);
            const to = nodeMap.get(corr.toNodeId);
            if (!from || !to) return;
            const p1 = latLngToSphere(from.lng, from.lat, EARTH_RADIUS, 2.1);
            const p2 = latLngToSphere(to.lng, to.lat, EARTH_RADIUS, 2.1);
            const curve = createCorridorCurve(p1, p2, 2.6);
            overlayGroup.add(
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)),
                new THREE.LineBasicMaterial({
                  color: corr.voltageKV === 800 ? 0xb8ff65 : 0x38bdf8,
                  transparent: true,
                  opacity: 0.5,
                })
              )
            );
            const particle = new THREE.Mesh(
              new THREE.SphereGeometry(0.14, 6, 6),
              new THREE.MeshBasicMaterial({
                color: corr.voltageKV === 800 ? 0xb8ff65 : 0x38bdf8,
              })
            );
            overlayGroup.add(particle);
            flowParticles.push({
              curve,
              mesh: particle,
              speed: 0.2 + (idx % 3) * 0.05,
              offset: (idx * 0.22) % 1,
            });
          });

          setLoading(false);
        })
        .catch(() => setLoading(false));

      // ── Resize Observer ──────────────────────────────────────────────────
      const resizeObs = new ResizeObserver((entries) => {
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

        // Camera approach execution
        const approach = approachRef.current;
        if (approach?.active) {
          const progress = Math.min((now - approach.startTime) / approach.duration, 1);
          const t = easeInOutCubic(progress);

          // Interpolate camera position directly toward India
          camera.position.lerpVectors(approach.startCamPos, approach.targetCamPos, t);
          controls.target.set(0, 0, 0);

          // Smoothly align globe rotation to 0 so India is perfectly centered
          globeGroup.rotation.y = approach.startGlobeRotY * (1 - t);

          // Restrained atmospheric cyan pulses
          const pulseIntensity = Math.sin(progress * Math.PI);
          approachLight.intensity = pulseIntensity * 3.8;
          innerAtmo.material.opacity = 0.08 + pulseIntensity * 0.08;

          // Iris veil overlay during last 32% of approach
          if (progress >= 0.68) {
            const iriProgress = easeInCubic((progress - 0.68) / 0.32);
            setOverlayDOM(iriProgress);
          }

          if (progress >= 1) {
            approach.active = false;
            setTimeout(() => {
              onEnterCompleteRef.current?.();
              approach.onComplete();
            }, 80);
          }
        } else {
          controls.update();
          approachLight.intensity = 0;

          // Subtle idle orbit
          if (!prefersReducedMotion) {
            globeGroup.rotation.y += 0.0001;
          }
        }

        // Pulse beacons + flow particles
        if (!prefersReducedMotion) {
          const s = 1.0 + 0.25 * Math.sin(elapsed * 2.4);
          pulsingRings.forEach((r) => r.scale.set(s, s, 1));
          flowParticles.forEach((fp) => {
            const pt = (elapsed * fp.speed + fp.offset) % 1;
            fp.mesh.position.copy(fp.curve.getPoint(pt));
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
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
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
              WebGL context is currently unavailable. The federated grid intelligence dashboard
              is still fully accessible — click &quot;Enter the Grid&quot; to proceed.
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
        style={{ minHeight: '420px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        />

        {/* Coordinated iris overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            display: 'none',
            opacity: 0,
            background:
              'radial-gradient(ellipse at center, rgba(4,16,32,0.98) 0%, rgba(2,8,18,1) 68%)',
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
            title="Reset camera to default view"
            aria-label="Reset camera to default Earth view"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>RESET VIEW</span>
          </button>
        </div>

        {/* Anchor indicator */}
        <div className="absolute bottom-5 left-5 z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-[#050D18]/85 px-3 py-1.5 rounded-lg border border-[#0F1E2E] backdrop-blur-sm pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          <span>ANCHOR: 82.5°E 22.0°N — INDIA GRID</span>
        </div>
      </div>
    );
  }
);

CinematicEarth.displayName = 'CinematicEarth';
