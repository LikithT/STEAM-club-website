"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { Suspense, useRef } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'

function HydrogenCar() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.5}
      floatingRange={[0, 0.5]}
    >
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.5, 4]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#FFD700"
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Car details */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.3, 3]} />
        <meshStandardMaterial 
          color="#1e3a8a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      {/* Wheels */}
      {[-1.5, 1.5].map((x, i) => (
        <group key={i}>
          {[-1.2, 1.2].map((z, j) => (
            <mesh key={j} position={[x, -0.3, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          ))}
        </group>
      ))}
    </Float>
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 2, 5]} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />
      
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD700" />
      
      <HydrogenCar />
      
      <Environment preset="night" />
      
      <EffectComposer>
        <Bloom 
          intensity={0.5}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration offset={[0.001, 0.001]} />
      </EffectComposer>
    </>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        shadows
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
            initial={{ 
              x: Math.random() * 900,
              y: 610,
              opacity: 0
            }}
            animate={{
              y: -10,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  )
}
