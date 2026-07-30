import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DigimonDetail,
  DigimonListItem,
  fetchDigimonDetail,
  fetchDigimonList,
  getEnglishDescription,
} from '../services/digiApi';
import DigimonSelector from './digimon/DigimonSelector';
import DigimonScene from './digimon/DigimonScene';
import DigimonInfoPanel from './digimon/DigimonInfoPanel';
import DigimonSceneLoader from './digimon/DigimonSceneLoader';
import PageMeta from './PageMeta';
import { truncateMetaDescription } from '../seo/site';

const DEFAULT_DIGIMON = 'Agumon';

const DigimonDex: React.FC = () => {
  const { name: urlName } = useParams<{ name?: string }>();
  const navigate = useNavigate();

  const [digimonList, setDigimonList] = useState<DigimonListItem[]>([]);
  const [detail, setDetail] = useState<DigimonDetail | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadList = async () => {
      try {
        setListLoading(true);
        setError(null);
        const list = await fetchDigimonList(controller.signal);
        if (controller.signal.aborted) return;
        setDigimonList(list);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : '';
        setError(
          message.includes('rate limit')
            ? 'Digi API rate limit reached. Please wait a few seconds and refresh.'
            : 'Failed to load Digimon list. Please try again later.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setListLoading(false);
        }
      }
    };
    loadList();
    return () => controller.abort();
  }, []);

  const loadDetail = useCallback(async (name: string, signal?: AbortSignal) => {
    try {
      setDetailLoading(true);
      setError(null);
      const data = await fetchDigimonDetail(name, signal);
      if (signal?.aborted) return;
      setDetail(data);
    } catch (err) {
      if (signal?.aborted) return;
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('rate limit')) {
        setError('Digi API rate limit reached. Please wait a few seconds and try again.');
      } else {
        setError(`Digimon not found: ${name}`);
      }
      setDetail(null);
    } finally {
      if (!signal?.aborted) {
        setDetailLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (listLoading) return;

    const target = urlName ? decodeURIComponent(urlName) : DEFAULT_DIGIMON;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      loadDetail(target, controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [urlName, listLoading, loadDetail]);

  const handleSelect = (name: string) => {
    navigate(`/digimon-dex/${encodeURIComponent(name)}`);
  };

  const activeName = detail?.name ?? (urlName ? decodeURIComponent(urlName) : DEFAULT_DIGIMON);
  const digimonDescription = truncateMetaDescription(
    detail
      ? getEnglishDescription(detail) ||
          `View ${activeName} in Joseph Ressler’s Digimon Dex — 3D evolution chamber with lineage and details.`
      : 'Explore Digimon evolutions in an interactive 3D chamber with search, lineage, and digivice-style loading.'
  );
  const digimonPath = urlName
    ? `/digimon-dex/${encodeURIComponent(decodeURIComponent(urlName))}`
    : '/digimon-dex';
  const digimonTitle = urlName
    ? `${activeName} | Digimon Dex | Joseph Ressler`
    : 'Digimon Dex | Joseph Ressler';

  if (listLoading) {
    return (
      <div className="digimon-dex-page">
        <PageMeta
          title="Digimon Dex | Joseph Ressler"
          description="Explore Digimon evolutions in an interactive 3D chamber with search, lineage, and digivice-style loading."
          path="/digimon-dex"
        />
        <h1 className="page-title">Digimon Dex</h1>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="digimon-dex-page">
      <PageMeta
        title={digimonTitle}
        description={digimonDescription}
        path={digimonPath}
      />
      <h1 className="page-title">Digimon Dex</h1>

      <DigimonSelector
        digimonList={digimonList}
        selectedName={detail?.name ?? urlName ?? DEFAULT_DIGIMON}
        onSelect={handleSelect}
        disabled={detailLoading}
      />

      {error && (
        <div className="digimon-error-banner" role="alert">
          {error}
        </div>
      )}

      {!listLoading && (detail || detailLoading) && (
        <div className="digimon-scene-layout">
          {detail ? (
            <>
              <DigimonScene
                key={detail.id}
                detail={detail}
                onSelectEvolution={handleSelect}
                externalLoading={detailLoading}
              />
              {!detailLoading && <DigimonInfoPanel detail={detail} />}
            </>
          ) : (
            <div className="digimon-canvas-wrap">
              <DigimonSceneLoader message="Initializing Digivice..." />
            </div>
          )}
        </div>
      )}

      <p className="digimon-attribution">
        Data from{' '}
        <a href="https://digi-api.com" target="_blank" rel="noopener noreferrer">
          DAPI (digi-api.com)
        </a>{' '}
        by Vinicius Brito Costa, sourced from{' '}
        <a href="https://wikimon.net" target="_blank" rel="noopener noreferrer">
          Wikimon.net
        </a>
        . Licensed under{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-SA
        </a>
        . DAPI is not affiliated with Bandai. Digimon is a registered trademark of Bandai.
      </p>
    </div>
  );
};

export default DigimonDex;
