import React from 'react';
import { DigimonEvolution, getVisibleEvolutions, proxyDigiUrl } from '../../services/digiApi';

interface EvolutionOverflowPanelProps {
  priorEvolutions: DigimonEvolution[];
  nextEvolutions: DigimonEvolution[];
  onSelect: (name: string) => void;
  maxEggs?: number;
}

const EvolutionColumn: React.FC<{
  title: string;
  evolutions: DigimonEvolution[];
  onSelect: (name: string) => void;
}> = ({ title, evolutions, onSelect }) => {
  if (evolutions.length === 0) return null;

  return (
    <div className="digimon-overflow-column">
      <h3 className="digimon-overflow-title">{title}</h3>
      <ul className="digimon-overflow-list">
        {evolutions.map((evo) => (
          <li key={evo.id}>
            <button
              type="button"
              className="digimon-overflow-item"
              onClick={() => onSelect(evo.digimon)}
            >
              <img src={proxyDigiUrl(evo.image)} alt="" className="digimon-overflow-thumb" />
              <span className="digimon-overflow-name">{evo.digimon}</span>
              {evo.condition && (
                <span className="digimon-overflow-condition">{evo.condition}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const EvolutionOverflowPanel: React.FC<EvolutionOverflowPanelProps> = ({
  priorEvolutions,
  nextEvolutions,
  onSelect,
  maxEggs = 12,
}) => {
  const { overflow: priorOverflow } = getVisibleEvolutions(priorEvolutions, maxEggs);
  const { overflow: nextOverflow } = getVisibleEvolutions(nextEvolutions, maxEggs);

  if (priorOverflow.length === 0 && nextOverflow.length === 0) {
    return null;
  }

  return (
    <div className="digimon-overflow-panel">
      <EvolutionColumn
        title={`Prior Evolutions (+${priorOverflow.length})`}
        evolutions={priorOverflow}
        onSelect={onSelect}
      />
      <EvolutionColumn
        title={`Next Evolutions (+${nextOverflow.length})`}
        evolutions={nextOverflow}
        onSelect={onSelect}
      />
    </div>
  );
};

export default EvolutionOverflowPanel;
