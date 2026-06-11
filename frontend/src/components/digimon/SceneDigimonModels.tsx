import React, { useMemo } from 'react';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { DigimonDetail, DigimonEvolution, getDigimonImage } from '../../services/digiApi';
import EvolutionEgg from './EvolutionEgg';
import {
  collectDigimonTextureUrls,
  getEvolutionTextureUrl,
} from './digimonTextures';
import {
  getEggScale,
  getMatrixPositions,
} from './matrixLayout';

interface SceneDigimonModelsProps {
  detail: DigimonDetail;
  onSelectEvolution: (name: string) => void;
}

function buildTextureMap(
  urls: string[],
  textures: THREE.Texture[]
): Map<string, THREE.Texture> {
  const map = new Map<string, THREE.Texture>();
  urls.forEach((url, i) => {
    const tex = textures[i];
    tex.colorSpace = THREE.SRGBColorSpace;
    map.set(url, tex);
  });
  return map;
}

const CenterDigimonFallback: React.FC = () => (
  <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4}>
    <mesh>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} />
    </mesh>
  </Float>
);

const CenterDigimonTextured: React.FC<{ texture: THREE.Texture }> = ({ texture }) => (
  <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4}>
    <mesh>
      <planeGeometry args={[2.5, 2.5]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
    </mesh>
  </Float>
);

interface EggMatrixProps {
  evolutions: DigimonEvolution[];
  side: 'prior' | 'next';
  textureMap: Map<string, THREE.Texture>;
  onSelectEvolution: (name: string) => void;
}

const EggMatrix: React.FC<EggMatrixProps> = ({
  evolutions,
  side,
  textureMap,
  onSelectEvolution,
}) => {
  const positions = useMemo(
    () => getMatrixPositions(evolutions.length, side),
    [evolutions.length, side]
  );
  const eggScale = getEggScale(evolutions.length);

  return (
    <>
      {evolutions.map((evo, i) => {
        const url = getEvolutionTextureUrl(evo.image);
        const texture = textureMap.get(url);
        if (!texture) return null;

        return (
          <EvolutionEgg
            key={`${side}-${evo.id}-${evo.digimon}-${i}`}
            evolution={evo}
            position={positions[i]}
            side={side}
            scale={eggScale}
            texture={texture}
            floatSpeed={1 + (i % 5) * 0.08}
            onSelect={onSelectEvolution}
          />
        );
      })}
    </>
  );
};

/** Loads every digimon image in one batch; Suspense waits until all are ready. */
const SceneDigimonModels: React.FC<SceneDigimonModelsProps> = ({
  detail,
  onSelectEvolution,
}) => {
  const urls = useMemo(() => collectDigimonTextureUrls(detail), [detail]);
  const loaded = useTexture(urls.length === 1 ? urls[0] : urls);
  const textureMap = useMemo(() => {
    const textures: THREE.Texture[] = Array.isArray(loaded) ? loaded : [loaded];
    return buildTextureMap(urls, textures);
  }, [urls, loaded]);

  const centerUrl = getDigimonImage(detail);
  const centerTexture = centerUrl ? textureMap.get(centerUrl) : undefined;

  return (
    <>
      {centerTexture ? (
        <CenterDigimonTextured texture={centerTexture} />
      ) : (
        <CenterDigimonFallback />
      )}
      <EggMatrix
        evolutions={detail.priorEvolutions}
        side="prior"
        textureMap={textureMap}
        onSelectEvolution={onSelectEvolution}
      />
      <EggMatrix
        evolutions={detail.nextEvolutions}
        side="next"
        textureMap={textureMap}
        onSelectEvolution={onSelectEvolution}
      />
    </>
  );
};

export default SceneDigimonModels;
