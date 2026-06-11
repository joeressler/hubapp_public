import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DigimonListItem, proxyDigiUrl } from '../../services/digiApi';

interface DigimonSelectorProps {
  digimonList: DigimonListItem[];
  selectedName: string;
  onSelect: (name: string) => void;
  disabled?: boolean;
}

const DigimonSelector: React.FC<DigimonSelectorProps> = ({
  digimonList,
  selectedName,
  onSelect,
  disabled = false,
}) => {
  const [query, setQuery] = useState(selectedName);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selectedName);
  }, [selectedName]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return digimonList;
    return digimonList.filter((d) => d.name.toLowerCase().includes(q));
  }, [digimonList, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    setQuery(name);
    setOpen(false);
    onSelect(name);
  };

  return (
    <div className="digimon-selector" ref={containerRef}>
      <input
        type="text"
        className="digimon-selector-input form-control"
        value={query}
        disabled={disabled}
        placeholder="Search Digimon..."
        role="combobox"
        aria-controls="digimon-listbox"
        aria-expanded={open}
        aria-autocomplete="list"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        aria-label="Search Digimon"
      />
      {open && !disabled && (
        <ul id="digimon-listbox" className="digimon-selector-dropdown crystal-card" role="listbox">
          {filtered.length === 0 ? (
            <li className="digimon-selector-item digimon-selector-empty">No matches</li>
          ) : (
            filtered.map((d) => (
              <li
                key={d.id}
                role="option"
                aria-selected={d.name === selectedName}
                className={`digimon-selector-item${d.name === selectedName ? ' selected' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(d.name)}
              >
                <img src={proxyDigiUrl(d.image)} alt="" className="digimon-selector-thumb" />
                <span>{d.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default DigimonSelector;
