import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export default function CarModel({ isProblem = false }: { isProblem?: boolean }) {
  const carRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (carRef.current) {
      // Smooth floating effect
      carRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      
      if (isProblem) {
        carRef.current.position.x = Math.sin(state.clock.elapsedTime * 20) * 0.05;
      } else {
        // Slow elegant rotation
        carRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      }
    }
  });

  return (
    <group ref={carRef}>
      {/* Car Body - Premium Metallic Paint */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 0.6, 4]} />
        <meshPhysicalMaterial 
          color={isProblem ? "#ef4444" : "#f97316"} 
          metalness={0.8} 
          roughness={0.15} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
        />
      </mesh>
      
      {/* Car Cabin - Dark Glass */}
      <mesh position={[0, 1.1, -0.2]} castShadow>
        <boxGeometry args={[1.8, 0.6, 2]} />
        <meshPhysicalMaterial 
          color="#000000" 
          metalness={0.9} 
          roughness={0.05} 
          transmission={0.9} // Glass effect
          thickness={0.5}
          ior={1.5}
        />
      </mesh>

      {/* Wheels */}
      <Wheel position={[-1.1, 0.3, 1.2]} />
      <Wheel position={[1.1, 0.3, 1.2]} />
      <Wheel position={[-1.1, 0.3, -1.2]} />
      <Wheel position={[1.1, 0.3, -1.2]} />
    </group>
  );
}

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
      <meshPhysicalMaterial color="#111" metalness={0.6} roughness={0.7} />
    </mesh>
  );
}
