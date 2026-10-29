'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EmotionState } from '@/lib/emotion';

interface AvatarMeshProps {
  emotion: EmotionState;
  isSpeaking: boolean;
}

function AvatarHead({ emotion, isSpeaking }: AvatarMeshProps) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  // Animation state for smooth interpolation
  const currentRotZ = useRef(0);
  const currentSmile = useRef(0);
  const currentMouthOpen = useRef(0.1);

  useFrame((state, delta) => {
    const targetTilt = emotion.weights.headTilt;
    currentRotZ.current = THREE.MathUtils.lerp(currentRotZ.current, targetTilt, delta * 5);
    
    if (headRef.current) {
      headRef.current.rotation.z = currentRotZ.current;
      // Gentle idle breathing / floating
      headRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1) * 0.1;
    }

    // Mouth animation when speaking
    if (isSpeaking) {
      const speechFactor = (Math.sin(state.clock.elapsedTime * 25) + 1) * 0.5;
      currentMouthOpen.current = THREE.MathUtils.lerp(currentMouthOpen.current, 0.2 + speechFactor * 0.3, delta * 15);
    } else {
      const targetSmileVal = emotion.weights.smile;
      currentSmile.current = THREE.MathUtils.lerp(currentSmile.current, targetSmileVal, delta * 5);
      currentMouthOpen.current = THREE.MathUtils.lerp(currentMouthOpen.current, 0.05 + Math.max(0, currentSmile.current * 0.1), delta * 5);
    }

    if (mouthRef.current) {
      mouthRef.current.scale.y = Math.max(0.05, currentMouthOpen.current * 3);
      mouthRef.current.scale.x = 1 + (emotion.weights.smile * 0.5);
    }

    // Eyebrows reaction
    if (leftBrowRef.current && rightBrowRef.current) {
      const browOffset = emotion.weights.browRaise * 0.15;
      leftBrowRef.current.position.y = 0.45 + browOffset;
      rightBrowRef.current.position.y = 0.45 + browOffset;
    }

    // Mood lighting color transition
    if (glowLightRef.current) {
      glowLightRef.current.color.set(emotion.weights.color);
    }
  });

  return (
    <group ref={headRef}>
      {/* Mood Light */}
      <pointLight ref={glowLightRef} position={[0, 1, 2]} intensity={2.5} distance={5} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />

      {/* Head Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color="#fbcfe8" 
          roughness={0.3} 
          metalness={0.1}
          emissive={emotion.weights.color}
          emissiveIntensity={emotion.intensity * 0.15}
        />
      </mesh>

      {/* Left Eye */}
      <group position={[-0.35, 0.2, 0.85]}>
        <mesh ref={leftEyeRef}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.07, 32, 32]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.1} />
        </mesh>
      </group>

      {/* Right Eye */}
      <group position={[0.35, 0.2, 0.85]}>
        <mesh ref={rightEyeRef}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.07, 32, 32]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.1} />
        </mesh>
      </group>

      {/* Left Eyebrow */}
      <mesh ref={leftBrowRef} position={[-0.35, 0.45, 0.88]} rotation={[0, 0, emotion.weights.browRaise * 0.3]}>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color="#4c1d95" roughness={0.5} />
      </mesh>

      {/* Right Eyebrow */}
      <mesh ref={rightBrowRef} position={[0.35, 0.45, 0.88]} rotation={[0, 0, -emotion.weights.browRaise * 0.3]}>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color="#4c1d95" roughness={0.5} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0, 0.98]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.1, 0.2, 32]} />
        <meshStandardMaterial color="#f472b6" roughness={0.4} />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.4, 0.85]}>
        <boxGeometry args={[0.35, 0.1, 0.1]} />
        <meshStandardMaterial color="#be185d" roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function AvatarCanvas({ emotion, isSpeaking }: AvatarMeshProps) {
  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 shadow-2xl border border-indigo-500/30">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <AvatarHead emotion={emotion} isSpeaking={isSpeaking} />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
      </Canvas>
    </div>
  );
}
