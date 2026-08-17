import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageMeta from './PageMeta';
import {
  FeaturedRepo,
  featuredRepos,
  getRepoVisualUrl,
} from '../data/featuredRepos';

const PAGE_DESCRIPTION =
  'Curated GitHub repositories from Joseph Ressler — self-hosted tools and full-stack projects with source links and detailed write-ups.';

type RepoVisualProps = {
  repo: FeaturedRepo;
};

const RepoVisual: React.FC<RepoVisualProps> = ({ repo }) => {
  const [imageError, setImageError] = useState(false);
  const visualUrl = getRepoVisualUrl(repo);

  return (
    <a
      className="repo-visual-link"
      href={repo.repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${repo.title} on GitHub`}
    >
      {!imageError && visualUrl ? (
        <img
          className="repo-visual-image"
          src={visualUrl}
          alt={`${repo.title} on GitHub`}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="repo-visual-fallback" aria-hidden="true">
          <span className="repo-visual-fallback-title">{repo.title}</span>
        </div>
      )}
    </a>
  );
};

const FeaturedRepos: React.FC = () => {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const toggleExpanded = (slug: string) => {
    setExpandedSlug((current) => (current === slug ? null : slug));
  };

  return (
    <div className="repos-page">
      <PageMeta
        title="Featured Repositories | Joseph Ressler"
        description={PAGE_DESCRIPTION}
        path="/repos"
      />

      <header className="repos-header">
        <h1 className="repos-title">Featured Repositories</h1>
        <p className="repos-lede">
          Curated GitHub repositories behind Joseph Ressler&apos;s portfolio — including
          this site and standalone tools. Each chapter pairs a visual with the story
          behind the build.
        </p>
      </header>

      <div className="repos-showcase">
        {featuredRepos.map((repo, index) => {
          const isExpanded = expandedSlug === repo.slug;
          const detailsId = `repo-details-${repo.slug}`;
          const indexLabel = String(index + 1).padStart(2, '0');
          const accentStyle = repo.accent
            ? ({ '--repo-accent': repo.accent } as React.CSSProperties)
            : undefined;

          return (
            <motion.article
              key={repo.slug}
              className="repo-feature"
              style={accentStyle}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <div className="repo-visual">
                <RepoVisual repo={repo} />
              </div>

              <div className="repo-story">
                <span className="repo-story-index">{indexLabel}</span>
                <h2 className="repo-story-title">{repo.title}</h2>
                <p className="repo-story-dek">{repo.oneLiner}</p>
                <p className="repo-story-body">{repo.shortBlurb}</p>

                <div
                  id={detailsId}
                  className={`repo-story-long${isExpanded ? ' is-expanded' : ''}`}
                  aria-hidden={!isExpanded}
                >
                  <div className="repo-story-long-inner">
                    <p>{repo.longBlurb}</p>
                  </div>
                </div>

                <div className="repo-story-actions">
                  <button
                    type="button"
                    className="repo-story-expand"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() => toggleExpanded(repo.slug)}
                  >
                    {isExpanded ? 'Show less' : 'Read the full story'}
                  </button>
                  <a
                    className="btn btn-primary"
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.ctaLabel ?? 'Source'}
                  </a>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedRepos;
