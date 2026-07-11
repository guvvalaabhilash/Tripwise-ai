/**
 * HoloGlobe — Dense dot-map globe.
 * • India faces the viewer on load (preset position)
 * • Full 360° drag rotation on any axis
 * • Inertia / momentum after drag release
 * • Auto slow-spin when idle
 * • Pure Three.js — no R3F, no peer-dep issues
 * • Floating labels for features
 */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ─── Coordinate helper ─────────────────────────────────────────────────────────
function ll(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const th  = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(th),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(th),
  )
}

// Great-circle arc between two lat/lng points
function arc(
  from: [number, number], to: [number, number], r = 1.025, seg = 80
): THREE.Vector3[] {
  const a    = ll(from[0], from[1], r)
  const b    = ll(to[0],   to[1],   r)
  const lift = a.distanceTo(b) * 0.28
  return Array.from({ length: seg + 1 }, (_, i) => {
    const t = i / seg
    const v = new THREE.Vector3().lerpVectors(a, b, t).normalize()
    v.multiplyScalar(r + lift * Math.sin(Math.PI * t))
    return v
  })
}

// ─── Land bounding rectangles [minLat, maxLat, minLng, maxLng] ────────────────
const LAND_RECTS: [number, number, number, number][] = [
  [36, 71, -10, 32],   // Europe west
  [36, 71,  32, 42],   // Europe east
  [-35, 38, -18, 52],  // Africa
  [10, 78,  42, 68],   // Middle East / Central Asia
  [10, 55, 100, 148],  // East/SE Asia
  [15, 55, 148, 180],  // East Asia far
  [-10, 28, 95, 148],  // SE Asia islands
  [50, 78,  68, 180],  // Siberia
  [15, 72, -170, -50], // North America
  [-56, 12, -82, -34], // South America
  [-44, -10, 112, 154],// Australia
  [30, 46, 128, 146],  // Japan
  [50, 59, -10,   2],  // UK / Ireland
  [60, 84, -56, -18],  // Greenland
]

// India bounding box — drawn gold/orange
const INDIA_BOX: [number, number, number, number] = [6, 37, 68, 98]

const INDIA_CENTER: [number, number] = [20.6, 78.9]
const ROUTES: [number, number][] = [
  [25.2,  55.3],  // Dubai
  [ 1.35,103.8],  // Singapore
  [51.5,  -0.12], // London
  [35.7, 139.7],  // Tokyo
  [48.9,   2.35], // Paris
  [-33.9, 151.2], // Sydney
]

// Floating labels around the globe
const GLOBE_LABELS = [
  { text: 'AI Trip Planning', lat: 35, lng: 45, color: '#5c7cfa' },
  { text: 'Expense Tracking', lat: -15, lng: 85, color: '#22d3ee' },
  { text: 'Smart Budget', lat: 45, lng: 120, color: '#8b5cf6' },
  { text: 'Live Collaboration', lat: -25, lng: 30, color: '#f59e0b' },
]

// India's longitude = 78.9°. We want it to face the camera (z+ direction).
// The ll() function maps lng=78.9 → theta = (78.9+180)*π/180 ≈ 4.53 rad
// For India to face +Z we need the globe pre-rotated so that point faces forward.
// Pre-rotation Y = -(theta - π/2) keeps it centred.
const INDIA_LNG   = 78.9
const INDIA_THETA = (INDIA_LNG + 180) * (Math.PI / 180) // ~4.533 rad
// Offset so India faces the camera at start
const INIT_ROT_Y  = -(INDIA_THETA - Math.PI / 2)        // ≈ -3.0 rad


// ─── Build dense dot-map geometry ─────────────────────────────────────────────
function buildDotMap() {
  const worldPts: number[] = []
  const indiaPts: number[] = []
  const step = 1.0  // degrees — finer = denser

  for (let lat = -90; lat <= 90; lat += step) {
    // Longitude step widens near poles to keep uniform density
    const cosLat = Math.max(Math.cos(lat * Math.PI / 180), 0.08)
    const lngStep = step / cosLat

    for (let lng = -180; lng <= 180; lng += lngStep) {
      const isIndia = (
        lat >= INDIA_BOX[0] && lat <= INDIA_BOX[1] &&
        lng >= INDIA_BOX[2] && lng <= INDIA_BOX[3]
      )
      if (isIndia) {
        const v = ll(
          lat + (Math.random() - 0.5) * 0.45,
          lng + (Math.random() - 0.5) * 0.45,
          1.003,
        )
        indiaPts.push(v.x, v.y, v.z)
        continue
      }
      const isLand = LAND_RECTS.some(
        ([mla, mxa, mlo, mxo]) => lat >= mla && lat <= mxa && lng >= mlo && lng <= mxo
      )
      if (isLand) {
        const v = ll(
          lat + (Math.random() - 0.5) * 0.35,
          lng + (Math.random() - 0.5) * 0.35,
          1.002,
        )
        worldPts.push(v.x, v.y, v.z)
      }
    }
  }

  return {
    worldArr: new Float32Array(worldPts),
    indiaArr: new Float32Array(indiaPts),
  }
}

// ─── Orbital ring builder ──────────────────────────────────────────────────────
interface OrbitData {
  group:     THREE.Group
  speed:     number
  nodeCount: number
  radius:    number
  nodeBuf:   Float32Array
  nodeAttr:  THREE.BufferAttribute
}

function makeOrbit(
  parent: THREE.Object3D,
  radius: number, tiltX: number, tiltZ: number,
  speed: number, color: number, opacity: number,
  nodeCount: number, nodeSize: number,
): OrbitData {
  const group = new THREE.Group()
  group.rotation.x = tiltX
  group.rotation.z = tiltZ

  // Ring line (closed loop)
  const ringPts: THREE.Vector3[] = []
  for (let i = 0; i <= 320; i++) {
    const a = (i / 320) * Math.PI * 2
    ringPts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
  }
  group.add(new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(ringPts),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  ))

  // Nodes that travel along the ring
  const nodeBuf  = new Float32Array(nodeCount * 3)
  const nodeGeo  = new THREE.BufferGeometry()
  const nodeAttr = new THREE.BufferAttribute(nodeBuf, 3)
  nodeGeo.setAttribute('position', nodeAttr)
  group.add(new THREE.Points(nodeGeo,
    new THREE.PointsMaterial({
      color,
      size: nodeSize,
      transparent: true,
      opacity: Math.min(opacity * 2.8, 1.0),
      sizeAttenuation: true,
    }),
  ))

  parent.add(group)
  return { group, speed, nodeCount, radius, nodeBuf, nodeAttr }
}

// ─── Component ─────────────────────────────────────────────────────────────────
interface HoloGlobeProps { className?: string }

export default function HoloGlobe({ className = '' }: HoloGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLDivElement | null)[]>(
    GLOBE_LABELS.map(() => null)
  )

  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true, powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping   = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.8
    el.appendChild(renderer.domElement)

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 3.4)

    // ── Scene & lights ────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0x1a3a5a, 2.0))

    const keyLight = new THREE.DirectionalLight(0x77aaff, 4.5)
    keyLight.position.set(3, 5, 3)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x4477cc, 2.0)
    rimLight.position.set(-4, -2, -3)
    scene.add(rimLight)

    const bottomLight = new THREE.PointLight(0x2244aa, 1.5, 10)
    bottomLight.position.set(0, -4, 0)
    scene.add(bottomLight)

    // ── Globe group ───────────────────────────────────────────────────────────
    const globeGroup = new THREE.Group()
    // Preset: India faces the camera. X tilt for "view from slightly above"
    globeGroup.rotation.x  = 0.22
    globeGroup.rotation.y  = INIT_ROT_Y
    scene.add(globeGroup)

    // Earth texture base with accurate geography
    const textureLoader = new THREE.TextureLoader()
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    const bumpTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png')
    
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 72, 72),
      new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.015,
        color: 0x3a5a7c,
        emissive: 0x0a2a4a,
        emissiveIntensity: 0.5,
        shininess: 12,
      }),
    ))

    // ── Dot map overlay (subtle dots on top of texture) ───────────────────────
    const { worldArr, indiaArr } = buildDotMap()

    const worldGeo = new THREE.BufferGeometry()
    worldGeo.setAttribute('position', new THREE.BufferAttribute(worldArr, 3))
    globeGroup.add(new THREE.Points(worldGeo,
      new THREE.PointsMaterial({
        color: 0x4488ff, size: 0.008,
        transparent: true, opacity: 0, sizeAttenuation: true,
      }),
    ))

    // ── India fill — glowing orange dots ────────────────────────────────────
    const indiaGeo = new THREE.BufferGeometry()
    indiaGeo.setAttribute('position', new THREE.BufferAttribute(indiaArr, 3))
    const indiaPointsMat = new THREE.PointsMaterial({
      color: 0xff7722, size: 0.022,
      transparent: true, opacity: 0.92, sizeAttenuation: true,
    })
    globeGroup.add(new THREE.Points(indiaGeo, indiaPointsMat))

    // ── India glow overlay — translucent sphere patch over India ─────────────
    // Build a custom BufferGeometry from the India bounding region
    // by sampling a dense grid of triangles on the sphere surface
    {
      const verts: number[] = []
      const step = 0.6 // degrees
      const R = 1.004  // just above the globe surface
      for (let lat = INDIA_BOX[0]; lat < INDIA_BOX[1]; lat += step) {
        for (let lng = INDIA_BOX[2]; lng < INDIA_BOX[3]; lng += step) {
          // Two triangles per cell — only emit if at least one corner is "land-ish"
          const corners = [
            ll(lat,        lng,        R),
            ll(lat + step, lng,        R),
            ll(lat + step, lng + step, R),
            ll(lat,        lng + step, R),
          ]
          // tri 1
          verts.push(...corners[0].toArray(), ...corners[1].toArray(), ...corners[2].toArray())
          // tri 2
          verts.push(...corners[0].toArray(), ...corners[2].toArray(), ...corners[3].toArray())
        }
      }
      const overlayGeo = new THREE.BufferGeometry()
      overlayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3))
      overlayGeo.computeVertexNormals()
      const indiaOverlayMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.13,
        side: THREE.FrontSide,
        depthWrite: false,
      })
      const overlayMesh = new THREE.Mesh(overlayGeo, indiaOverlayMat)
      globeGroup.add(overlayMesh)

      // Store ref for pulse animation
      ;(globeGroup as THREE.Group & { _indiaMat?: THREE.MeshBasicMaterial; _indiaPtsMat?: THREE.PointsMaterial })._indiaMat = indiaOverlayMat
    }
    ;(globeGroup as THREE.Group & { _indiaPtsMat?: THREE.PointsMaterial })._indiaPtsMat = indiaPointsMat

    // ── Route arcs ────────────────────────────────────────────────────────────
    const routeParticles: Array<{
      pts: THREE.Vector3[]; mesh: THREE.Mesh; progress: number; speed: number
    }> = []

    for (const dest of ROUTES) {
      const pts   = arc(INDIA_CENTER, dest, 1.022, 80)
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts)
      globeGroup.add(new THREE.Line(arcGeo,
        new THREE.LineBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.32 }),
      ))
      const destDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.013, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.85 }),
      )
      destDot.position.copy(ll(dest[0], dest[1], 1.018))
      globeGroup.add(destDot)

      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.017, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      )
      globeGroup.add(particle)
      routeParticles.push({ pts, mesh: particle, progress: Math.random(), speed: 0.06 + Math.random() * 0.045 })
    }

    // ── Orbital rings ─────────────────────────────────────────────────────────
    const orbits: OrbitData[] = [
      makeOrbit(globeGroup, 1.40, 0.28,  0.08, 0.10, 0x55aaff, 0.60, 5, 0.032),
      makeOrbit(globeGroup, 1.32, 1.05,  0.38, 0.07, 0x3388ff, 0.42, 3, 0.028),
      makeOrbit(globeGroup, 1.22, -0.55, 0.72, 0.15, 0x4499cc, 0.30, 4, 0.022),
      makeOrbit(globeGroup, 1.58, 0.65, -0.35, 0.045,0x2266bb, 0.20, 2, 0.024),
      makeOrbit(globeGroup, 1.34, -1.20, 0.15, 0.12, 0x3377cc, 0.24, 3, 0.020),
    ]
    const orbitProgress = orbits.map(() => Math.random() * Math.PI * 2)

    // ── 360° drag rotation ────────────────────────────────────────────────────
    // We track pointer delta to rotate the globe on both axes freely.
    let isDragging   = false
    let prevX        = 0
    let prevY        = 0
    let velX         = 0   // angular velocity X (pitch)
    let velY         = 0   // angular velocity Y (yaw)
    let autoSpin     = true // auto-spin when not dragging
    let dragTimeoutId: ReturnType<typeof setTimeout> | null = null

    // Current Euler stored separately so we can accumulate freely
    let rotY = INIT_ROT_Y
    let rotX = 0.22

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      autoSpin   = false
      prevX = e.clientX
      prevY = e.clientY
      velX  = 0
      velY  = 0
      renderer.domElement.style.cursor = 'grabbing'
      if (dragTimeoutId) clearTimeout(dragTimeoutId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      // Sensitivity — full drag across canvas = ~2 full rotations feels natural
      const sens = 0.006
      velY =  dx * sens
      velX =  dy * sens
      rotY += velY
      rotX += velX
      // Clamp vertical rotation so globe doesn't flip fully upside-down
      rotX = Math.max(-1.1, Math.min(1.1, rotX))
      globeGroup.rotation.y = rotY
      globeGroup.rotation.x = rotX
      prevX = e.clientX
      prevY = e.clientY
    }

    const onPointerUp = () => {
      isDragging = false
      renderer.domElement.style.cursor = 'grab'
      // Resume auto-spin after 2.5 s of inactivity
      dragTimeoutId = setTimeout(() => { autoSpin = true }, 2500)
    }

    // Attach to canvas so drag only works on the globe
    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.style.pointerEvents = 'auto'
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup',   onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize, { passive: true })

    // ── Animation loop ────────────────────────────────────────────────────────
    let raf  = 0
    let last = performance.now()
    let hidden = false
    const onVisibility = () => { hidden = document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    const INERTIA_DECAY = 0.88  // momentum friction per frame
    const AUTO_SPIN_SPD = Math.PI * 2 / 90  // full rotation in 90 s

    // Label positions cache
    const labelVectors = GLOBE_LABELS.map(l => ll(l.lat, l.lng, 1.08))

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (hidden) { renderer.render(scene, camera); return }

      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // Update label positions directly on DOM
      labelVectors.forEach((v, i) => {
        const labelEl = labelRefs.current[i]
        if (!labelEl) return
        const cloned = v.clone()
        cloned.applyEuler(globeGroup.rotation)
        cloned.project(camera)
        const x = (cloned.x * 0.5 + 0.5) * el.clientWidth
        const y = (-(cloned.y * 0.5) + 0.5) * el.clientHeight
        const visible = cloned.z < 1
        labelEl.style.left = `${x}px`
        labelEl.style.top = `${y}px`
        labelEl.style.opacity = visible ? '1' : '0'
      })

      if (!prefersReduced) {
        if (!isDragging) {
          // Inertia — decay velocity and keep rotating
          velY *= INERTIA_DECAY
          velX *= INERTIA_DECAY

          if (autoSpin) {
            // Auto-spin gradually blends in once velocity is small
            const blendedSpin = AUTO_SPIN_SPD * dt
            rotY += blendedSpin + velY
          } else {
            rotY += velY
          }
          rotX += velX
          rotX  = Math.max(-1.1, Math.min(1.1, rotX))
          globeGroup.rotation.y = rotY
          globeGroup.rotation.x = rotX
        }

        // Gentle float bob
        globeGroup.position.y = Math.sin(now * 0.00038) * 0.07

        // India overlay pulse
        const g = globeGroup as THREE.Group & { _indiaMat?: THREE.MeshBasicMaterial; _indiaPtsMat?: THREE.PointsMaterial }
        if (g._indiaMat) {
          g._indiaMat.opacity = 0.10 + Math.sin(now * 0.0018) * 0.06
        }
        if (g._indiaPtsMat) {
          g._indiaPtsMat.opacity = 0.80 + Math.sin(now * 0.0018 + 1.2) * 0.15
        }

        // Route particles
        for (const r of routeParticles) {
          if (r.pts && r.pts.length > 0) {
            r.progress = (r.progress + r.speed * dt) % 1
            const idx  = Math.min(Math.floor(r.progress * r.pts.length), r.pts.length - 1)
            const pt = r.pts[idx]
            if (pt) r.mesh.position.copy(pt)
          }
        }

        // Orbit nodes
        for (let i = 0; i < orbits.length; i++) {
          const o = orbits[i]
          o.group.rotation.y += o.speed * dt
          orbitProgress[i]   += o.speed * dt * 0.55
          for (let j = 0; j < o.nodeCount; j++) {
            const a = (j / o.nodeCount) * Math.PI * 2 + orbitProgress[i]
            o.nodeBuf[j * 3]     = Math.cos(a) * o.radius
            o.nodeBuf[j * 3 + 1] = 0
            o.nodeBuf[j * 3 + 2] = Math.sin(a) * o.radius
          }
          o.nodeAttr.needsUpdate = true
        }
      }

      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf)
      if (dragTimeoutId) clearTimeout(dragTimeoutId)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup',   onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ background: 'transparent', position: 'relative' }}
      role="img"
      aria-label="Interactive 3D globe with India highlighted"
    >
      {GLOBE_LABELS.map((label, i) => (
        <div
          key={label.text}
          ref={el => { labelRefs.current[i] = el }}
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            <div
              className="w-2 h-2 rounded-full mb-1 mx-auto"
              style={{
                background: label.color,
                boxShadow: `0 0 12px ${label.color}, 0 0 24px ${label.color}`,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
              style={{
                background: `rgba(10, 15, 30, 0.85)`,
                border: `1px solid ${label.color}40`,
                color: label.color,
                backdropFilter: 'blur(8px)',
                boxShadow: `0 0 20px ${label.color}30`,
              }}
            >
              {label.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
