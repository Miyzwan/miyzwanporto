'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

// --- Constants ---
const COLORS = {
  purple: new THREE.Color('#8b5cf6'),
  blue: new THREE.Color('#3b82f6'),
  pink: new THREE.Color('#ec4899'),
}

interface PanelConfig {
  label: string
  position: [number, number, number]
  size: [number, number, number]
  floatSpeed: number
  floatIntensity: number
  scrollX: number
  scrollY: number
  icon: string
}

const panelData: PanelConfig[] = [
  { label: 'iOS Developer', position: [-2.5, 1.5, -3], size: [1.8, 0.6, 0.05], floatSpeed: 1.5, floatIntensity: 0.6, scrollX: 0, scrollY: 2, icon: '📱' },
  { label: 'SwiftUI', position: [2.8, -0.5, -4], size: [1.4, 0.5, 0.05], floatSpeed: 1.2, floatIntensity: 0.5, scrollX: 0, scrollY: -1.5, icon: '🖥' },
  { label: 'Machine Learning', position: [-2, -1.8, -5], size: [1.6, 0.55, 0.05], floatSpeed: 1.0, floatIntensity: 0.4, scrollX: -1.8, scrollY: 0, icon: '🤖' },
  { label: 'AR / VR', position: [3, 2, -2.5], size: [1.2, 0.5, 0.05], floatSpeed: 1.8, floatIntensity: 0.7, scrollX: 2, scrollY: 0, icon: '🥽' },
]

const PARTICLE_POSITIONS = (() => {
  const count = 2000
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const palette = [COLORS.purple, COLORS.blue, COLORS.pink]

  for (let i = 0; i < count; i++) {
    const radius = 2 + Math.random() * 10
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    pos[i * 3 + 2] = radius * Math.cos(phi)

    const c = palette[Math.floor(Math.random() * 3)].clone()
    c.multiplyScalar(0.5 + Math.random() * 0.5)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  return { pos, col }
})()

// --- Particle Cloud (atmospheric nebula inspired by sui.io) ---
function ParticleCloud({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const { pos: positions, col: colors } = PARTICLE_POSITIONS

  useFrame((_state, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * (0.05 + scrollProgress * 0.15)
    groupRef.current.rotation.x += delta * 0.008
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06 + scrollProgress * 0.04}
          sizeAttenuation
          transparent
          opacity={0.3 + scrollProgress * 0.2}
          vertexColors
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

// --- Wireframe Background (subtle network geometry) ---
function WireframeBackground({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * (0.1 + scrollProgress * 0.6)
    meshRef.current.rotation.y += delta * (0.15 + scrollProgress * 0.5)
    const s = 1 + scrollProgress * 0.4
    meshRef.current.scale.setScalar(s)
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
    mat.opacity = 0.12 + scrollProgress * 0.15
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -6]}>
      <torusGeometry args={[3.5, 0.05, 32, 64]} />
      <meshPhysicalMaterial
        color="#8b5cf6"
        transparent
        opacity={0.12}
        wireframe
        emissive="#3b82f6"
        emissiveIntensity={0.08}
      />
    </mesh>
  )
}

// --- Glass Panel (dark glassmorphism card inspired by sui.io) ---
function GlassPanel({ config, scrollProgress }: { config: PanelConfig; scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const basePos = useMemo(() => new THREE.Vector3(...config.position), [config.position])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.x = basePos.x + scrollProgress * config.scrollX * 2
    groupRef.current.position.y = basePos.y + scrollProgress * config.scrollY * 2
    groupRef.current.rotation.z = scrollProgress * 0.15 * Math.sign(config.scrollX || 1)
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = 0.5 + scrollProgress * 0.15
    }
  })

  const [w, h, d] = config.size
  const floatIntensity = config.floatIntensity + scrollProgress * 0.3

  return (
    <group ref={groupRef} position={config.position}>
      <Float speed={config.floatSpeed} rotationIntensity={0.08} floatIntensity={floatIntensity}>
        {/* Main glass card */}
        <RoundedBox ref={meshRef} args={config.size} radius={0.05} smoothness={4}>
          <meshPhysicalMaterial
            color="#1a1a2e"
            transparent
            opacity={0.5}
            metalness={0.3}
            roughness={0.2}
            envMapIntensity={0.8}
            side={THREE.DoubleSide}
            clearcoat={0.1}
            clearcoatRoughness={0.3}
          />
        </RoundedBox>

        {/* Border glow (thin edge wireframe) */}
        <mesh>
          <boxGeometry args={config.size} />
          <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.12} />
        </mesh>

        {/* Icon badge */}
        <Text
          position={[-w / 2 + 0.12, h / 2 - 0.12, 0.03]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {config.icon}
        </Text>

        {/* Label */}
        <Text
          position={[0, -h / 2 - 0.15, 0]}
          fontSize={0.08}
          color="#8b5cf6"
          anchorX="center"
          anchorY="middle"
        >
          {config.label}
        </Text>
      </Float>
    </group>
  )
}

// --- Scene Content ---
function SceneContent({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1
      target.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useFrame((_state, delta) => {
    current.current.x += (target.current.x - current.current.x) * 0.05
    current.current.y += (target.current.y - current.current.y) * 0.05
    if (groupRef.current) {
      groupRef.current.position.x = current.current.x * 1.2
      groupRef.current.position.y = current.current.y * 1.2
    }
  })

  return (
    <group ref={groupRef}>
      <ParticleCloud scrollProgress={scrollProgress} />
      <WireframeBackground scrollProgress={scrollProgress} />
      {panelData.map((p) => (
        <GlassPanel key={p.label} config={p} scrollProgress={scrollProgress} />
      ))}
      <ambientLight intensity={0.3} />
      <pointLight position={[6, 6, 6]} intensity={1.0} color="#8b5cf6" />
      <pointLight position={[-6, -4, -3]} intensity={0.8} color="#3b82f6" />
    </group>
  )
}

// --- Exported Scene ---
export default function Scene3D({ scrollProgress = 0, opacity = 0.9 }: { scrollProgress?: number; opacity?: number }) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
      >
        <Environment preset="city" />
        <SceneContent scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  )
}
