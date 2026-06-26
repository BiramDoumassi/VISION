import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { Plane, Ship, AlertTriangle, TrendingUp, Database, Zap, Activity } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ll2v(lat, lng, r = 1) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function arcPoints(aLat, aLng, bLat, bLng, height = 0.35, n = 60) {
  const a = ll2v(aLat, aLng);
  const b = ll2v(bLat, bLng);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    p.normalize().multiplyScalar(1 + height * 4 * t * (1 - t));
    pts.push(p);
  }
  return pts;
}

// ─── Static simulation data ───────────────────────────────────────────────────

const FLIGHTS = Array.from({ length: 600 }, (_, i) => ({
  id: i, lat: (Math.random() - 0.5) * 160,
  lng: (Math.random() - 0.5) * 360, alt: Math.random() * 0.04 + 0.012,
}));

const SHIPS = (() => {
  const lanes = [
    [5, 105, 12, 40], [50, 2, 12, 30], [10, 55, 18, 50],
    [35, -5, 18, 45], [-30, -20, 20, 60], [25, -90, 12, 35],
    [35, 130, 15, 50], [-10, -80, 18, 45],
  ];
  return Array.from({ length: 700 }, () => {
    const [clat, clng, ls, lw] = lanes[Math.floor(Math.random() * lanes.length)];
    return { lat: clat + (Math.random() - 0.5) * ls, lng: clng + (Math.random() - 0.5) * lw };
  });
})();

const ALERTS = [
  { lat: 26.3, lng: 56.1, label: "Détroit d'Hormuz" },
  { lat: 36.2, lng: 37.1, label: 'Levant' },
  { lat: 15.5, lng: -87.2, label: 'Caraïbes' },
  { lat: 50.4, lng: 30.5, label: 'Europe Est' },
  { lat: -8.5, lng: 115.2, label: 'Indonésie' },
];

const AIR_CORRIDORS = [
  [51.5, -0.1, 40.7, -74.0], [35.7, 139.7, 34.1, -118.2], [25.2, 55.3, 51.5, -0.1],
  [1.4, 103.8, 51.5, -0.1], [22.3, 114.2, 51.5, -0.1], [48.9, 2.3, 40.7, -74.0],
  [52.4, 4.9, 40.7, -74.0], [35.7, 139.7, 22.3, 114.2],
];

const ECONOMIC_ARCS = [
  [40.7, -74.0, 51.5, -0.1, 3], [35.7, 139.7, 37.8, -122.4, 3],
  [51.5, -0.1, 48.9, 2.3, 2], [22.3, 114.2, 51.5, -0.1, 3],
  [22.3, 114.2, 1.4, 103.8, 2], [1.4, 103.8, 51.5, -0.1, 3],
  [40.7, -74.0, 22.3, 114.2, 2], [-33.9, 151.2, 35.7, 139.7, 2],
  [19.4, -99.1, 40.7, -74.0, 2], [-23.6, -46.6, 51.5, -0.1, 1],
  [25.2, 55.3, 22.3, 114.2, 2], [28.6, 77.2, 22.3, 114.2, 2],
];

const LAYER_CONFIG = [
  { key: 'aviation', label: 'Aviation', dot: 'bg-white' },
  { key: 'maritime', label: 'Maritime', dot: 'bg-emerald-500' },
  { key: 'alerts', label: 'Alertes', dot: 'bg-amber-500' },
  { key: 'economicFlows', label: 'Flux Éco.', dot: 'bg-white/50' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EarthView() {
  const containerRef = useRef(null);
  const threeRef = useRef(null);
  const [layers, setLayers] = useState({ aviation: true, maritime: true, alerts: true, economicFlows: false });
  const [liveStats, setLiveStats] = useState({ flights: 9247, ships: 41382 });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Live counters
  useEffect(() => {
    const id = setInterval(() => {
      setLiveStats(prev => ({
        flights: Math.max(8900, Math.min(9600, prev.flights + Math.round((Math.random() - 0.5) * 8))),
        ships: Math.max(40000, Math.min(42000, prev.ships + Math.round((Math.random() - 0.5) * 6))),
      }));
      setLastUpdate(new Date());
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Three.js init
  useEffect(() => {
    const el = containerRef.current;
    if (!el || threeRef.current) return;

    const W = el.clientWidth || 900;
    const H = el.clientHeight || 600;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x050505, 1);
    el.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0, 2.6);

    // ── Globe sphere ──────────────────────────────────────────────
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x1a2236, emissive: 0x060b18, specular: 0x1a1a2a, shininess: 12,
    });
    const globeMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), globeMat);
    scene.add(globeMesh);

    // Texture (async — globe shows immediately without it)
    new THREE.TextureLoader().load(
      'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
      tex => { globeMat.map = tex; globeMat.needsUpdate = true; },
    );

    // Atmosphere halo
    const atmosMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.025, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x2244aa, transparent: true, opacity: 0.07, side: THREE.BackSide })
    );
    scene.add(atmosMesh);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // ── Flights (white dots) ──────────────────────────────────────
    const flightPos = new Float32Array(FLIGHTS.length * 3);
    FLIGHTS.forEach((f, i) => {
      const v = ll2v(f.lat, f.lng, 1 + f.alt);
      flightPos[i * 3] = v.x; flightPos[i * 3 + 1] = v.y; flightPos[i * 3 + 2] = v.z;
    });
    const flightGeo = new THREE.BufferGeometry();
    flightGeo.setAttribute('position', new THREE.BufferAttribute(flightPos, 3));
    const flightPoints = new THREE.Points(flightGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.007, sizeAttenuation: true, transparent: true, opacity: 0.82 })
    );
    globeMesh.add(flightPoints);

    // ── Ships (green dots) ────────────────────────────────────────
    const shipPos = new Float32Array(SHIPS.length * 3);
    SHIPS.forEach((s, i) => {
      const v = ll2v(s.lat, s.lng, 1.001);
      shipPos[i * 3] = v.x; shipPos[i * 3 + 1] = v.y; shipPos[i * 3 + 2] = v.z;
    });
    const shipGeo = new THREE.BufferGeometry();
    shipGeo.setAttribute('position', new THREE.BufferAttribute(shipPos, 3));
    const shipPoints = new THREE.Points(shipGeo,
      new THREE.PointsMaterial({ color: 0x22c55e, size: 0.005, sizeAttenuation: true, transparent: true, opacity: 0.65 })
    );
    globeMesh.add(shipPoints);

    // ── Air corridors (white semi-transparent arcs) ───────────────
    const corridorGroup = new THREE.Group();
    AIR_CORRIDORS.forEach(([aLat, aLng, bLat, bLng]) => {
      const pts = arcPoints(aLat, aLng, bLat, bLng, 0.3);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      corridorGroup.add(new THREE.Line(geo,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.13 })
      ));
    });
    globeMesh.add(corridorGroup);

    // ── Economic arcs (brighter) ──────────────────────────────────
    const ecoGroup = new THREE.Group();
    ecoGroup.visible = false;
    ECONOMIC_ARCS.forEach(([aLat, aLng, bLat, bLng]) => {
      const pts = arcPoints(aLat, aLng, bLat, bLng, 0.38);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      ecoGroup.add(new THREE.Line(geo,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 })
      ));
    });
    globeMesh.add(ecoGroup);

    // ── Alert rings ───────────────────────────────────────────────
    const alertRings = ALERTS.map(({ lat, lng }, idx) => {
      const pos = ll2v(lat, lng, 1.002);
      const normal = pos.clone().normalize();

      const rings = [];
      for (let k = 0; k < 2; k++) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.01, 0.045, 48),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
        );
        ring.position.copy(pos);
        const z = new THREE.Vector3(0, 0, 1);
        ring.quaternion.setFromUnitVectors(z, normal);
        ring.userData.phase = idx * 1.3 + k * Math.PI;
        globeMesh.add(ring);
        rings.push(ring);
      }
      return rings;
    }).flat();

    // ── Mouse controls ────────────────────────────────────────────
    let dragging = false, autoRotY = 0;
    let prev = { x: 0, y: 0 }, rotX = 0.15, rotY = 0;

    const onDown = e => { dragging = true; prev = { x: e.clientX, y: e.clientY }; };
    const onMove = e => {
      if (!dragging) return;
      rotY += (e.clientX - prev.x) * 0.005;
      rotX = Math.max(-1.2, Math.min(1.2, rotX + (e.clientY - prev.y) * 0.005));
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { dragging = false; };
    const onWheel = e => { camera.position.z = Math.max(1.5, Math.min(5, camera.position.z + e.deltaY * 0.001)); };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('wheel', onWheel, { passive: true });

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────
    let raf;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!dragging) rotY += 0.0015;
      globeMesh.rotation.set(rotX, rotY, 0);

      // Pulse alert rings
      alertRings.forEach(ring => {
        const s = (Math.sin(t * 2.2 + ring.userData.phase) + 1) / 2;
        ring.scale.setScalar(0.6 + s * 2.5);
        ring.material.opacity = 0.85 * (1 - s * 0.75);
      });

      renderer.render(scene, camera);
    };
    animate();

    threeRef.current = {
      renderer, scene, flightPoints, shipPoints, corridorGroup, ecoGroup, alertRings,
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      threeRef.current = null;
    };
  }, []);

  // Layer visibility
  useEffect(() => {
    const t = threeRef.current;
    if (!t) return;
    t.flightPoints.visible = layers.aviation;
    t.shipPoints.visible = layers.maritime;
    t.corridorGroup.visible = layers.aviation;
    t.ecoGroup.visible = layers.economicFlows;
    t.alertRings.forEach(r => { r.visible = layers.alerts; });
  }, [layers]);

  const toggleLayer = key => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Earth Intelligence" subtitle="Surveillance mondiale en temps réel" />

      <div className="p-6 flex flex-col gap-4">

        {/* ── Globe card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ height: 600, background: '#050505', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Three.js mounts here */}
          <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

          {/* Layer controls — top right */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute top-4 right-4 z-10 rounded-xl"
            style={{ background: 'rgba(5,5,5,0.85)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 14px', backdropFilter: 'none' }}
          >
            <p className="text-[9px] text-white/35 uppercase tracking-[0.15em] mb-3">Layers</p>
            <div className="space-y-2.5">
              {LAYER_CONFIG.map(({ key, label, dot }) => (
                <button key={key} onClick={() => toggleLayer(key)} className="flex items-center gap-2.5 w-full">
                  <div className={`relative w-8 h-4 rounded-full flex-shrink-0 transition-colors ${layers[key] ? 'bg-white/15' : 'bg-white/5'}`}>
                    <div className={`absolute top-0.5 h-3 w-3 rounded-full transition-all duration-200 ${dot} ${layers[key] ? 'right-0.5 opacity-100' : 'left-0.5 opacity-25'}`} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.1em] transition-colors ${layers[key] ? 'text-white/75' : 'text-white/25'}`}>{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Live analytics — bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="absolute bottom-4 right-4 z-10 rounded-xl"
            style={{ background: 'rgba(5,5,5,0.85)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 14px', minWidth: 162 }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] text-white/35 uppercase tracking-[0.15em]">Live Feed</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span className="text-[9px] text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { Icon: Plane, label: 'Vols', value: liveStats.flights.toLocaleString('fr-FR'), color: 'text-white' },
                { Icon: Ship, label: 'Navires', value: liveStats.ships.toLocaleString('fr-FR'), color: 'text-emerald-400' },
                { Icon: AlertTriangle, label: 'Alertes', value: ALERTS.length, color: 'text-amber-400' },
              ].map(({ Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3 h-3 ${color} opacity-70`} />
                    <span className="text-[10px] text-white/40">{label}</span>
                  </div>
                  <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 pt-2 border-t border-white/5">
              <p className="text-[9px] text-white/20">MAJ {lastUpdate.toLocaleTimeString('fr-FR')}</p>
            </div>
          </motion.div>

          {/* Alert zones — bottom left */}
          {layers.alerts && (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="absolute bottom-4 left-4 z-10 rounded-xl"
              style={{ background: 'rgba(5,5,5,0.85)', border: '1px solid rgba(245,158,11,0.18)', padding: '12px 14px' }}
            >
              <p className="text-[9px] text-amber-400/60 uppercase tracking-[0.15em] mb-2.5">Zones d'alerte</p>
              <div className="space-y-1.5">
                {ALERTS.map((z, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block flex-shrink-0"
                      style={{ animationDelay: `${i * 250}ms` }} />
                    <span className="text-[10px] text-white/45">{z.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Stats bar ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Datasets indexés', value: '2.4M', icon: Database },
            { label: 'Records ingérés', value: '847B', icon: Activity },
            { label: 'KG Entities', value: '12.6B', icon: TrendingUp },
            { label: 'Pipelines actifs', value: '3 891', icon: Zap, green: true },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }} className="glass rounded-xl p-4">
              <s.icon className={`w-5 h-5 mb-2 ${s.green ? 'text-emerald-400' : 'text-white/35'}`} />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/40 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
