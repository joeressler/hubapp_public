import React, { useMemo } from 'react';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

const FLOOR_Y = -3.2;
const CEILING_Y = 8.6;
const CHAMBER_HEIGHT = CEILING_Y - FLOOR_Y;
const PILLAR_CENTER_Y = (FLOOR_Y + CEILING_Y) / 2;

const DigimonChamber: React.FC = () => {
  const pillarPositions: [number, number, number][] = useMemo(
    () => [
      [-10, PILLAR_CENTER_Y, -8],
      [10, PILLAR_CENTER_Y, -8],
      [-10, PILLAR_CENTER_Y, 8],
      [10, PILLAR_CENTER_Y, 8],
    ],
    []
  );

  return (
    <group>
      <fog attach="fog" args={['#060b14', 5, 28]} />

      <Grid
        position={[0, FLOOR_Y, 0]}
        args={[1, 1]}
        cellSize={0.75}
        cellThickness={0.5}
        cellColor="#1a3a5c"
        sectionSize={3.75}
        sectionThickness={1}
        sectionColor="#38bdf8"
        fadeDistance={32}
        fadeStrength={2.2}
        infiniteGrid
      />

      <mesh position={[0, (FLOOR_Y + CEILING_Y) / 2, 0]}>
        <cylinderGeometry args={[16, 16, CHAMBER_HEIGHT + 0.4, 64, 1, true]} />
        <meshStandardMaterial
          color="#060d18"
          emissive="#0c4a6e"
          emissiveIntensity={0.12}
          side={THREE.BackSide}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {pillarPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.14, 0.2, CHAMBER_HEIGHT, 8]} />
          <meshStandardMaterial
            color="#1e293b"
            emissive="#38bdf8"
            emissiveIntensity={0.45}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEILING_Y, 0]}>
        <ringGeometry args={[9.5, 13.5, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEILING_Y - 0.05, 0]}>
        <ringGeometry args={[12.8, 13.6, 64]} />
        <meshStandardMaterial
          color="#1e3a5f"
          emissive="#0ea5e9"
          emissiveIntensity={0.35}
          roughness={0.4}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEILING_Y - 0.08, 0]}>
        <circleGeometry args={[9.2, 48]} />
        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight position={[0, CEILING_Y - 0.5, 0]} intensity={0.9} color="#38bdf8" distance={22} />
      <pointLight position={[-8, 2, 0]} intensity={0.35} color="#f87171" distance={18} />
      <pointLight position={[8, 2, 0]} intensity={0.35} color="#60a5fa" distance={18} />
    </group>
  );
};

export default DigimonChamber;
