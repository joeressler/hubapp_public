import React from 'react';

interface DigimonSceneLoaderProps {
  progress?: number;
  message?: string;
}

const DigimonSceneLoader: React.FC<DigimonSceneLoaderProps> = ({
  progress = 0,
  message = 'Digivolving data...',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="digimon-scene-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="digimon-scene-loader-digivice">
        <div className="digimon-scene-loader-ring digimon-scene-loader-ring-outer" />
        <div className="digimon-scene-loader-ring digimon-scene-loader-ring-mid" />
        <div className="digimon-scene-loader-ring digimon-scene-loader-ring-inner" />
        <div className="digimon-scene-loader-core">
          <div className="digimon-scene-loader-egg digimon-scene-loader-egg-prior" />
          <div className="digimon-scene-loader-egg digimon-scene-loader-egg-center" />
          <div className="digimon-scene-loader-egg digimon-scene-loader-egg-next" />
        </div>
      </div>
      <p className="digimon-scene-loader-message">{message}</p>
      <div className="digimon-scene-loader-bar-track">
        <div
          className="digimon-scene-loader-bar-fill"
          style={{ width: `${clampedProgress || 8}%` }}
        />
      </div>
      {clampedProgress > 0 && (
        <span className="digimon-scene-loader-percent">{Math.round(clampedProgress)}%</span>
      )}
    </div>
  );
};

export default DigimonSceneLoader;
