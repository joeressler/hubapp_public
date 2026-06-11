import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';

interface SceneLoadBridgeProps {
  onLoadStateChange: (state: { active: boolean; progress: number }) => void;
}

/** Reports drei asset loading progress to the HTML overlay outside the Canvas. */
const SceneLoadBridge: React.FC<SceneLoadBridgeProps> = ({ onLoadStateChange }) => {
  const { active, progress } = useProgress();

  useEffect(() => {
    onLoadStateChange({ active, progress });
  }, [active, progress, onLoadStateChange]);

  return null;
};

export default SceneLoadBridge;
