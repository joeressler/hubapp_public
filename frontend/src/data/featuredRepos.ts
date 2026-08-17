export type FeaturedRepo = {
  slug: string;
  title: string;
  oneLiner: string;
  shortBlurb: string;
  longBlurb: string;
  repoUrl: string;
  ctaLabel?: string;
  heroImage?: string;
  accent?: string;
};

/** GitHub social preview image for a repository URL. */
export function getRepoOgImageUrl(repoUrl: string): string {
  try {
    const url = new URL(repoUrl);
    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    if (owner && repo) {
      return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
    }
  } catch {
    /* fall through */
  }
  return '';
}

export function getRepoVisualUrl(repo: FeaturedRepo): string {
  return repo.heroImage ?? getRepoOgImageUrl(repo.repoUrl);
}

export const featuredRepos: FeaturedRepo[] = [
  {
    slug: 'hubapp-public',
    title: 'Joseph Ressler Hub App',
    oneLiner:
      'Full-stack portfolio hub: personal landing page plus interactive Digimon Dex, LlamaIndex RAG game chat, authenticated ratings, and optional voice I/O — deployed at josepharessler.com, AWS, and Google Cloud Run.',
    shortBlurb:
      'Built to read as a working product, not a slide deck. React/TypeScript frontend with Three.js Digimon Dex, FAQ retrieval chat over WoWS/WoW/LoL corpora, and session-gated game ratings. Docker Compose runs Flask/Gunicorn, MySQL, and a FastAPI voice service behind nginx, with HttpOnly cookie auth and persisted LlamaIndex vector stores.',
    longBlurb:
      'The browser talks to Flask under /api via session cookies. Flask blueprints handle auth, games, chat, and health; MySQL stores ratings; per-corpus LlamaIndex indexes (storage_wows, storage_warcraft, storage_lol) power RAG answers. A separate FastAPI voice container (Vosk STT, TTS endpoint) keeps speech pipelines off the API workers. Key choices: cookie sessions restored on boot with GET /api/auth/check instead of bearer JWTs; offline embedding rebuilds when FAQ material changes; debug routes gated by ENABLE_DEBUG_ROUTES. Frontend owns the production SPA shell; Flask retains a static fallback for legacy deploy paths. Ops span Jenkins/GitHub Actions, AWS EC2/Lightsail TLS, and an earlier Google Cloud Run packaging.',
    repoUrl: 'https://github.com/joeressler/hubapp_public',
    ctaLabel: 'Source',
    heroImage: '/og-image.jpg',
    accent: '#38bdf8',
  },
  {
    slug: 'npc-catalog',
    title: 'NPC Catalog',
    oneLiner:
      'A self-hosted D&D Dungeon Master toolkit: campaign-scoped NPCs, locations, session notes, cloneable encounters, and interactive relationship webs; plus optional GPU AI portraits and a colocated live MBTA commuter-rail dashboard; behind dual-role session auth.',
    shortBlurb:
      'NPC Catalog is a purple Frutiger Aero web app for tabletop DMs. Campaigns hold NPCs, places, session beats, reusable encounters, and Cytoscape relationship webs. Players can log in read-only to see only items marked visible. The stack is Angular 19 + FastAPI + SQLite in Docker Compose, with nginx as the only published port, HMAC HttpOnly cookies, CSP, and login rate limits.',
    longBlurb:
      'Built as a personal, self-hosted DM catalog rather than a multi-tenant SaaS. DMs create campaigns and catalog NPCs as they invent them (aliases, alignment, faction, attitude, Markdown notes, portraits). Locations, numbered session notes with branching story beats, and cloneable encounter set-pieces sit alongside interactive relationship webs (Party node, optional PC nodes, directed/bidirectional edges). A second shared login is read-only: players never see sessions or encounters, and hidden records 404 instead of leaking existence. Optional ComfyUI + SDXL on NVIDIA GPU generates portraits and landscapes inside the Docker network. A sidecar Node service at /trains/ shows live Providence/Stoughton Commuter Rail trips (MBTA V3 + Leaflet), reusing the same session cookie. Production refuses example credentials when DEBUG=false.',
    repoUrl: 'https://github.com/joeressler/npc-catalog',
    ctaLabel: 'Source',
    accent: '#7c5cbf',
  },
];
