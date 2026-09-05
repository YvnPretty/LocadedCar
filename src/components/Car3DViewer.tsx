"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

interface AbstractCarProps {
  color: string;
}

function AbstractCar({ color }: AbstractCarProps) {
  const group = useRef<THREE.Group>(null);

  // Animación opcional sutil
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02;
    }
  });

  return (
    <group ref={group}>
      {/* Chasis principal */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.4, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Cabina (Cristal / Techo) */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.4, 2.0]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Ruedas */}
      {[
        [-1, 0.2, 1.3],
        [1, 0.2, 1.3],
        [-1, 0.2, -1.3],
        [1, 0.2, -1.3],
      ].map((pos, index) => (
        <mesh key={index} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
          <meshStandardMaterial color="#222222" roughness={0.8} />
        </mesh>
      ))}

      {/* Faros delanteros */}
      <mesh position={[-0.6, 0.45, 2.11]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.6, 0.45, 2.11]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>

      {/* Luces traseras */}
      <mesh position={[-0.6, 0.45, -2.11]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.6, 0.45, -2.11]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

export default function Car3DViewer({ color = "#ff0000" }: { color?: string }) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [5, 3, 5], fov: 45 }}>
        {/* Iluminación */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, -5]} intensity={1} color="#ffffff" />
        
        {/* Entorno HDRI para reflejos metálicos */}
        <Environment preset="city" />

        {/* Modelo del Auto */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <AbstractCar color={color} />
        </Float>

        {/* Sombra de contacto en el piso */}
        <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={2} color="#000000" position={[0, -0.05, 0]} />

        {/* Controles para rotar (autoRotate activado) */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={1}
          maxPolarAngle={Math.PI / 2 - 0.05} // Evita ir por debajo del suelo
        />
      </Canvas>
    </div>
  );
}
