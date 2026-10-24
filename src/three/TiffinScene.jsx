import { useMemo, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/* ------------------------------------------------------------------
 *  The Tiffexx 3D tiffin carrier — fully procedural (no model files),
 *  so it loads instantly. Five enamel tiers in brand colours, a steel
 *  carrier frame and a domed lid. Scroll progress "unstacks" it to
 *  reveal the thali inside, tier by tier.
 * ------------------------------------------------------------------ */

const C = {
  maroon: '#5A140D',
  yellow: '#FFCA0F',
  orange: '#F57F28',
  steel: '#d9d4cc',
  coriander: '#3f8a2a',
}
const H = 0.62 // tier height
const R = 1 // tier radius

// bottom → top
const TIERS = [
  { id: 'rice', enamel: C.maroon },
  { id: 'dal', enamel: C.yellow },
  { id: 'sabzi', enamel: C.orange },
  { id: 'paneer', enamel: C.maroon },
  { id: 'roti', enamel: C.yellow },
]
export const TIER_LABELS = {
  rice: ['Rice', 'चावल'],
  dal: ['Dal', 'दाल'],
  sabzi: ['Sabzi', 'सब्ज़ी'],
  paneer: ['Paneer', 'पनीर'],
  roti: ['Roti + sweet', 'रोटी + मीठा'],
}

const sstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const rand = (s) => {
  // deterministic PRNG so layouts are stable between renders
  let x = Math.sin(s * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function useTierGeometry() {
  return useMemo(() => {
    const pts = [
      [0, 0],
      [R * 0.86, 0],
      [R * 0.97, 0.03],
      [R, 0.1],
      [R, H - 0.08],
      [R * 1.035, H - 0.05],
      [R * 1.035, H],
      [R * 0.95, H],
      [R * 0.95, 0.1],
      [0, 0.1],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const g = new THREE.LatheGeometry(pts, 72)
    g.computeVertexNormals()
    return g
  }, [])
}

function useRotiTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const x = c.getContext('2d')
    x.fillStyle = '#DDA866'
    x.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 70; i++) {
      const px = rand(i) * 256,
        py = rand(i + 100) * 256,
        r = 3 + rand(i + 200) * 12
      const g = x.createRadialGradient(px, py, 0, px, py, r)
      g.addColorStop(0, 'rgba(90,40,10,0.85)')
      g.addColorStop(1, 'rgba(160,90,40,0)')
      x.fillStyle = g
      x.beginPath()
      x.arc(px, py, r, 0, Math.PI * 2)
      x.fill()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

/** Scatter `count` instances on a disc and render them as one draw call. */
function Scatter({ count, radius, y, geometry, color, scale = 1, seed = 1, rough = 0.5, tilt = false }) {
  const ref = useRef()
  useEffect(() => {
    const m = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const a = rand(seed + i) * Math.PI * 2
      const r = Math.sqrt(rand(seed + i * 3.1)) * radius
      m.position.set(Math.cos(a) * r, y + rand(seed + i * 7.7) * 0.03, Math.sin(a) * r)
      m.rotation.set(tilt ? rand(i + seed) * Math.PI : 0, rand(seed + i * 5.3) * Math.PI * 2, tilt ? rand(i * 2 + seed) * 0.6 : 0)
      const s = scale * (0.75 + rand(seed + i * 1.7) * 0.5)
      m.scale.setScalar(s)
      m.updateMatrix()
      ref.current.setMatrixAt(i, m.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, radius, y, scale, seed, tilt])
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]}>
      <meshStandardMaterial color={color} roughness={rough} />
    </instancedMesh>
  )
}

function Food({ id, small }) {
  const k = small ? 0.5 : 1
  const geo = useMemo(
    () => ({
      leaf: new THREE.CircleGeometry(0.05, 5).rotateX(-Math.PI / 2),
      pea: new THREE.SphereGeometry(0.045, 8, 6),
      cube: new THREE.BoxGeometry(0.07, 0.07, 0.07),
      paneer: new THREE.BoxGeometry(0.2, 0.15, 0.2),
      grain: new THREE.CapsuleGeometry(0.018, 0.07, 2, 6).rotateZ(Math.PI / 2),
      floret: new THREE.IcosahedronGeometry(0.07, 0),
    }),
    []
  )
  const roti = useRotiTexture()
  const surface = 0.42
  const disc = (color, rough = 0.35) => (
    <mesh position={[0, surface, 0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[R * 0.95, 48]} />
      <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.4} clearcoatRoughness={0.4} />
    </mesh>
  )
  if (id === 'dal')
    return (
      <group>
        {disc('#E9A824', 0.25)}
        <Scatter count={40 * k} radius={0.85} y={surface + 0.01} geometry={geo.leaf} color={C.coriander} seed={3} />
        <Scatter count={60 * k} radius={0.85} y={surface + 0.005} geometry={geo.pea} color="#8a4a12" scale={0.35} seed={9} />
      </group>
    )
  if (id === 'sabzi')
    return (
      <group>
        {disc('#B9702A', 0.5)}
        <Scatter count={50 * k} radius={0.82} y={surface + 0.03} geometry={geo.pea} color="#6aa83a" seed={21} />
        <Scatter count={30 * k} radius={0.8} y={surface + 0.04} geometry={geo.cube} color="#F0782A" seed={33} tilt />
        <Scatter count={18 * k} radius={0.75} y={surface + 0.05} geometry={geo.floret} color="#F3E3B5" seed={44} tilt />
      </group>
    )
  if (id === 'paneer')
    return (
      <group>
        {disc('#D9532A', 0.22)}
        <Scatter count={9} radius={0.62} y={surface + 0.05} geometry={geo.paneer} color="#F1D49A" seed={51} rough={0.7} />
        <Scatter count={30 * k} radius={0.85} y={surface + 0.12} geometry={geo.leaf} color={C.coriander} seed={57} />
      </group>
    )
  if (id === 'rice')
    return (
      <group>
        {disc('#F3EBDA', 0.8)}
        <Scatter count={small ? 260 : 520} radius={0.88} y={surface + 0.02} geometry={geo.grain} color="#FBF6EA" seed={61} rough={0.6} tilt />
        <Scatter count={24 * k} radius={0.8} y={surface + 0.06} geometry={geo.leaf} color={C.coriander} seed={67} />
      </group>
    )
  // roti + gulab jamun
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.18 + i * 0.03, 0.18 + i * 0.045, -0.02 * i]} rotation={[-0.05 * i, i * 0.6, 0.04 * i]}>
          <cylinderGeometry args={[0.66, 0.66, 0.035, 40]} />
          <meshStandardMaterial map={roti} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0.62, 0.3, 0.3]}>
        <sphereGeometry args={[0.2, 32, 24]} />
        <meshPhysicalMaterial color="#6E1F0B" roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <Scatter count={10} radius={0.1} y={0.49} geometry={geo.cube} color="#9BC24A" scale={0.5} seed={81} tilt />
    </group>
  )
}

function Tier({ tier, geometry, small }) {
  return (
    <group>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial color={tier.enamel} roughness={0.22} metalness={0.05} clearcoat={1} clearcoatRoughness={0.06} side={THREE.DoubleSide} />
      </mesh>
      {/* steel rim */}
      <mesh position={[0, H - 0.01, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[R * 1.0, 0.028, 10, 72]} />
        <meshStandardMaterial color={C.steel} metalness={1} roughness={0.18} />
      </mesh>
      <Food id={tier.id} small={small} />
    </group>
  )
}

function Lid() {
  return (
    <group>
      <mesh position={[0, 0, 0]} scale={[1, 0.42, 1]}>
        <sphereGeometry args={[R * 1.035, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={C.maroon} roughness={0.2} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[R * 1.03, 0.03, 10, 72]} />
        <meshStandardMaterial color={C.steel} metalness={1} roughness={0.18} />
      </mesh>
      {/* carry handle */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.46, 0.045, 14, 48, Math.PI]} />
        <meshStandardMaterial color={C.steel} metalness={1} roughness={0.15} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.46, 0.39, 0]}>
          <sphereGeometry args={[0.075, 16, 12]} />
          <meshStandardMaterial color={C.yellow} metalness={0.4} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

const FLOATERS = [
  // rice grains, coriander leaves, spice seeds — drifting around the tiffin
  { geo: () => new THREE.CapsuleGeometry(0.035, 0.13, 3, 8), color: '#FBF3E1', n: 16, rough: 0.6 },
  { geo: () => new THREE.CircleGeometry(0.12, 6), color: '#4c9a2a', n: 12, rough: 0.7, side: THREE.DoubleSide },
  { geo: () => new THREE.SphereGeometry(0.05, 10, 8), color: '#E2702A', n: 12, rough: 0.4 },
  { geo: () => new THREE.SphereGeometry(0.035, 8, 6), color: '#FFCA0F', n: 10, rough: 0.4 },
]

function Floaters({ kind, k, cx, reduced, seed }) {
  const ref = useRef()
  const geo = useMemo(() => kind.geo(), [kind])
  const n = Math.max(4, Math.round(kind.n * k))
  const data = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const j = seed * 100 + i
        return {
          a: rand(j) * Math.PI * 2,
          r: 1.9 + rand(j + 1) * 2.4,
          y: (rand(j + 2) - 0.5) * 5,
          z: -0.6 - rand(j + 3) * 3,
          v: (0.04 + rand(j + 4) * 0.08) * (rand(j + 5) > 0.5 ? 1 : -1),
          spin: 0.3 + rand(j + 6) * 1.2,
          s: 0.7 + rand(j + 7) * 0.8,
        }
      }),
    [n, seed]
  )
  const m = useMemo(() => new THREE.Object3D(), [])
  const x = useRef(cx.current)
  useFrame(({ clock }, dt) => {
    const t = reduced ? 0 : clock.elapsedTime
    x.current = THREE.MathUtils.damp(x.current, cx.current, 3, Math.min(dt, 0.05))
    data.forEach((d, i) => {
      const a = d.a + t * d.v
      m.position.set(x.current + Math.cos(a) * d.r, d.y + Math.sin(t * 0.5 + i) * 0.2, d.z + Math.sin(a) * 0.6)
      m.rotation.set(t * d.spin + i, t * d.spin * 0.6, i)
      m.scale.setScalar(d.s)
      m.updateMatrix()
      ref.current.setMatrixAt(i, m.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[geo, undefined, n]}>
      <meshStandardMaterial color={kind.color} roughness={kind.rough} side={kind.side || THREE.FrontSide} />
    </instancedMesh>
  )
}

function Particles({ small, reduced, cx }) {
  return FLOATERS.map((kind, i) => <Floaters key={i} kind={kind} k={small ? 0.35 : 1} cx={cx} reduced={reduced} seed={i + 1} />)
}

function Tiffin({ progressRef, pointerRef, small, reduced, onActive, labels, cx }) {
  const root = useRef()
  const spin = useRef()
  const tiers = useRef([])
  const lid = useRef()
  const shadow = useRef()
  const anchor = useMemo(() => new THREE.Vector3(), [])
  const lastActive = useRef(-2)
  const geometry = useTierGeometry()
  const { viewport, camera, size } = useThree()

  const shadowTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const x = c.getContext('2d')
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])

  const stackH = TIERS.length * H

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    const p = progressRef.current
    const explode = sstep(0.1, 0.3, p) * (1 - sstep(0.86, 0.97, p))
    const narrow = viewport.aspect < 0.9

    // where the whole object sits: right of the headline in the hero, centred when unstacked
    const heroX = narrow ? 0 : Math.min(2.5, viewport.width * 0.22)
    const heroY = narrow ? -2.8 : -1.3
    const heroS = narrow ? 0.42 : 0.74
    const exS = narrow ? 0.42 : 0.58
    const exX = narrow ? 0 : Math.min(1.5, viewport.width * 0.12)
    const tx = THREE.MathUtils.lerp(heroX, exX, explode)
    cx.current = tx
    const ty = THREE.MathUtils.lerp(heroY, narrow ? -2.25 : -1.7, explode)
    const ts = THREE.MathUtils.lerp(heroS, exS, explode)
    const d = (cur, to, l = 5) => THREE.MathUtils.damp(cur, to, l, dt)
    root.current.position.x = d(root.current.position.x, tx)
    root.current.position.y = d(root.current.position.y, ty)
    root.current.scale.setScalar(d(root.current.scale.x, ts))

    // tilt toward the viewer when open so you can see inside each tier
    const px = reduced ? 0 : pointerRef.current.x
    const py = reduced ? 0 : pointerRef.current.y
    root.current.rotation.x = d(root.current.rotation.x, 0.12 + explode * 0.42 + py * 0.12)
    root.current.rotation.z = d(root.current.rotation.z, -0.06 * (1 - explode) + px * 0.05)
    const idle = reduced ? 0 : state.clock.elapsedTime * 0.35
    const targetSpin = THREE.MathUtils.lerp(idle + px * 0.6, Math.sin(state.clock.elapsedTime * 0.4) * 0.25 * (reduced ? 0 : 1) - 0.35, explode)
    spin.current.rotation.y = d(spin.current.rotation.y, targetSpin, 3)

    // which tier is "talking" (top tier first, matching the overlay copy)
    const hold = (p - 0.3) / (0.84 - 0.3)
    const active = explode > 0.6 && hold >= 0 && hold <= 1 ? TIERS.length - 1 - Math.min(TIERS.length - 1, Math.floor(hold * TIERS.length)) : -1
    if (active !== lastActive.current) {
      lastActive.current = active
      onActive?.(active)
    }

    const gap = 0.62
    tiers.current.forEach((t, i) => {
      if (!t) return
      const y = i * (H + gap * explode)
      t.position.y = d(t.position.y, y, 7)
      const isA = i === active
      t.position.z = d(t.position.z, isA ? 0.35 : 0, 6)
      t.position.x = d(t.position.x, isA ? (i % 2 ? 0.12 : -0.12) : 0, 6)
      const lab = labels.current[i]
      if (lab) {
        // project the label anchor (beside the tier) to screen space
        const side = i % 2 ? -1 : 1
        anchor.set(side * 1.6, H * 0.5, 0)
        t.localToWorld(anchor)
        anchor.project(camera)
        const sx = (anchor.x * 0.5 + 0.5) * size.width
        const sy = (-anchor.y * 0.5 + 0.5) * size.height
        lab.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(${side < 0 ? '-100%' : '0'}, -50%)`
        const o = explode < 0.5 || narrow ? 0 : active === -1 ? 0.9 : isA ? 1 : 0.35
        lab.style.opacity = o.toFixed(2)
        lab.classList.toggle('is-active', isA)
      }
    })
    const lidY = stackH + gap * explode * TIERS.length + explode * 0.25
    lid.current.position.y = d(lid.current.position.y, lidY, 7)
    lid.current.rotation.z = d(lid.current.rotation.z, explode * -0.35, 5)
    lid.current.position.x = d(lid.current.position.x, explode * 0.5, 5)
    shadow.current.material.opacity = 0.9 * (1 - explode * 0.6)
  })

  return (
    <group ref={root} position={[small ? 0 : 2, -1, 0]} scale={0.9}>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0, -0.05, 0]}>
        <planeGeometry args={[3.6, 3.6]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>
      <group ref={spin}>
        {TIERS.map((t, i) => (
          <group key={t.id} ref={(el) => (tiers.current[i] = el)} position-y={i * H}>
            <Tier tier={t} geometry={geometry} small={small} />
          </group>
        ))}
        <group ref={lid} position-y={stackH}>
          <Lid />
        </group>
      </group>
    </group>
  )
}

/** Studio reflections for the glossy enamel + steel, generated locally (no HDR download). */
function Env() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => (env.dispose(), pmrem.dispose())
  }, [gl, scene])
  return null
}

export default function TiffinScene({ progressRef, pointerRef, small, reduced, onActive, onReady }) {
  const wrap = useRef()
  const labels = useRef([])
  const cx = useRef(2)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' })
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={wrap} className="tiffin-canvas" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, small ? 1.5 : 2]}
        gl={{ antialias: !small, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 32, position: [0, 0.4, 10] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          onReady?.()
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#fff1d6" />
        <directionalLight position={[-5, 2, -2]} intensity={1.1} color="#ffb35c" />
        <pointLight position={[0, -2, 4]} intensity={8} color="#ff8a3d" distance={12} />
        <Env />
        <Tiffin progressRef={progressRef} pointerRef={pointerRef} small={small} reduced={reduced} onActive={onActive} labels={labels} cx={cx} />
        <Particles small={small} reduced={reduced} cx={cx} />
      </Canvas>
      <div className="tier-labels">
        {TIERS.map((t, i) => (
          <div key={t.id} ref={(el) => (labels.current[i] = el)} className={`tier-label ${i % 2 ? 'is-left' : ''}`} style={{ opacity: 0 }}>
            <span className="tier-label-num">0{TIERS.length - i}</span>
            <span className="tier-label-name">{TIER_LABELS[t.id][0]}</span>
            <span className="tier-label-hi" lang="hi">
              {TIER_LABELS[t.id][1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
