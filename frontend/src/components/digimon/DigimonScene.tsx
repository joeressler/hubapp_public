import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { DigimonDetail } from '../../services/digiApi';
import DigimonSceneLoader from './DigimonSceneLoader';
import SceneLoadBridge from './SceneLoadBridge';
import DigimonChamber from './DigimonChamber';
import SceneDigimonModels from './SceneDigimonModels';
import { collectDigimonTextureUrls } from './digimonTextures';
import { getCameraDistance } from './matrixLayout';

interface DigimonSceneProps {
  detail: DigimonDetail;
  onSelectEvolution: (name: string) => void;
  externalLoading?: boolean;
}

interface SceneContentProps extends DigimonSceneProps {
  onLoadStateChange: (state: { active: boolean; progress: number }) => void;
}

const SceneContent: React.FC<SceneContentProps> = ({
  detail,
  onSelectEvolution,
  onLoadStateChange,
}) => {
  const cameraZ = getCameraDistance(
    detail.priorEvolutions.length,
    detail.nextEvolutions.length
  );

  return (
    <>
      <SceneLoadBridge onLoadStateChange={onLoadStateChange} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 6]} intensity={0.5} color="#bae6fd" />

      <DigimonChamber />

      <Suspense fallback={null}>
        <SceneDigimonModels detail={detail} onSelectEvolution={onSelectEvolution} />
      </Suspense>

      <OrbitControls
        enablePan
        panSpeed={1.4}
        screenSpacePanning
        enableDamping
        dampingFactor={0.08}
        minDistance={cameraZ * 0.5}
        maxDistance={cameraZ * 2.2}
        maxPolarAngle={Math.PI / 1.65}
        minPolarAngle={Math.PI / 8}
        autoRotate
        autoRotateSpeed={0.3}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </>
  );
};

const DigimonScene: React.FC<DigimonSceneProps> = ({
  detail,
  onSelectEvolution,
  externalLoading = false,
}) => {
  const cameraZ = getCameraDistance(
    detail.priorEvolutions.length,
    detail.nextEvolutions.length
  );

  const [textureLoad, setTextureLoad] = useState({ active: true, progress: 0 });

  useEffect(() => {
    setTextureLoad({ active: true, progress: 0 });
    const urls = collectDigimonTextureUrls(detail);
    urls.forEach((url) => useTexture.preload(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset preload when selected digimon changes
  }, [detail.id]);

  const handleLoadStateChange = useCallback(
    (state: { active: boolean; progress: number }) => {
      setTextureLoad(state);
    },
    []
  );

  const showLoader = externalLoading || textureLoad.active;
  const loaderMessage = externalLoading
    ? `Scanning ${detail.name}...`
    : 'Rendering digivolution matrix...';
  const loaderProgress = externalLoading ? undefined : textureLoad.progress;

  return (
    <div className="digimon-canvas-wrap">
      {showLoader && (
        <DigimonSceneLoader progress={loaderProgress} message={loaderMessage} />
      )}
      <p className="digimon-scene-hint">
        Drag to rotate · Right-click or two-finger drag to pan · Scroll to zoom
      </p>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#060b14']} />
        <SceneContent
          detail={detail}
          onSelectEvolution={onSelectEvolution}
          onLoadStateChange={handleLoadStateChange}
        />
      </Canvas>
    </div>
  );
};

export default DigimonScene;
