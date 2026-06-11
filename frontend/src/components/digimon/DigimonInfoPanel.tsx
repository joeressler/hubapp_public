import React, { useState } from 'react';
import { DigimonDetail, getEnglishDescription, proxyDigiUrl } from '../../services/digiApi';

interface DigimonInfoPanelProps {
  detail: DigimonDetail;
}

const DigimonInfoPanel: React.FC<DigimonInfoPanelProps> = ({ detail }) => {
  const [showAllSkills, setShowAllSkills] = useState(false);

  const level = detail.levels.map((l) => l.level).join(', ');
  const type = detail.types.map((t) => t.type).join(', ');
  const attribute = detail.attributes.map((a) => a.attribute).join(', ');
  const description = getEnglishDescription(detail);
  const visibleSkills = showAllSkills ? detail.skills : detail.skills.slice(0, 5);

  return (
    <div className="digimon-info-panel crystal-card">
      <h2 className="digimon-info-name gradient-text">{detail.name}</h2>
      <div className="digimon-info-meta">
        {level && <span><strong>Level:</strong> {level}</span>}
        {attribute && <span><strong>Attribute:</strong> {attribute}</span>}
        {type && <span><strong>Type:</strong> {type}</span>}
        {detail.releaseDate && <span><strong>Debut:</strong> {detail.releaseDate}</span>}
        {detail.xAntibody && <span className="digimon-x-antibody">X-Antibody</span>}
      </div>

      {detail.fields.length > 0 && (
        <div className="digimon-info-fields">
          {detail.fields.map((f) => (
            <img key={f.id} src={proxyDigiUrl(f.image)} alt={f.field} title={f.field} className="digimon-field-icon" />
          ))}
        </div>
      )}

      {description && <p className="digimon-info-description">{description}</p>}

      {detail.skills.length > 0 && (
        <div className="digimon-info-skills">
          <h3>Skills</h3>
          <ul>
            {visibleSkills.map((s) => (
              <li key={s.id}>
                <strong>{s.skill}</strong>
                {s.translation && s.translation !== s.skill && ` (${s.translation})`}
                {s.description && `: ${s.description}`}
              </li>
            ))}
          </ul>
          {detail.skills.length > 5 && (
            <button
              type="button"
              className="digimon-skills-toggle neon-button"
              onClick={() => setShowAllSkills(!showAllSkills)}
            >
              {showAllSkills ? 'Show fewer' : `Show all ${detail.skills.length} skills`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DigimonInfoPanel;
