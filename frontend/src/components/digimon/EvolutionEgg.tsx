import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DigimonEvolution } from '../../services/digiApi';

export type EvolutionSide = 'prior' | 'next';

const EGG_COLORS: Record<
  EvolutionSide,
  { color: string; emissive: string }
> = {
  prior: { color: '#dc2626', emissive: '#f87171' },
  next: { color: '#2563eb', emissive: '#60a5fa' },
};

interface EvolutionEggProps {
  evolution: DigimonEvolution;
  position: [number, number, number];
  side: EvolutionSide;
  texture: THREE.Texture;
  scale?: number;
  floatSpeed?: number;
  floatRotationIntensity?: number;
  onSelect: (name: string) => void;
}

const EvolutionEgg: React.FC<EvolutionEggProps> = ({
  evolution,
  position,
  side,
  texture,
  scale = 1,
  floatSpeed = 1.2,
  floatRotationIntensity = 0.15,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const colors = EGG_COLORS[side];

  useFrame(() => {
    if (groupRef.current) {
      const hoverScale = hovered ? 1.12 : 1;
      const s = scale * hoverScale;
      groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
  });

  const iconRotationY = side === 'prior' ? -Math.PI / 2 : Math.PI / 2;
  const iconOffsetX = side === 'prior' ? 0.38 : -0.38;

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={floatRotationIntensity}
      floatIntensity={0.25}
    >
      <group
        ref={groupRef}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(evolution.digimon);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh scale={[0.55, 0.72, 0.55]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial
            color={colors.color}
            emissive={colors.emissive}
            emissiveIntensity={hovered ? 0.55 : 0.2}
            transparent
            opacity={0.4}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[iconOffsetX, 0, 0]} rotation={[0, iconRotationY, 0]}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.85}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        {hovered && (
          <Html distanceFactor={10} position={[0, 0.9, 0]} center>
            <div className={`digimon-egg-tooltip digimon-egg-tooltip-${side}`}>
              <strong>{evolution.digimon}</strong>
              {evolution.condition && (
                <span className="digimon-egg-tooltip-condition">{evolution.condition}</span>
              )}
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
};

export default EvolutionEgg;
