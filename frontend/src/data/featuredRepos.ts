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
  {
    slug: 'warhammer-graph',
    title: 'warhammer-graph',
    oneLiner:
      'Graph-backed Warhammer retrieval work that evolved from an all-in-one llama.cpp GGUF desktop ambition into a focused library for MCP-backed reasoning.',
    shortBlurb:
      'I originally aimed for a huge single app that could load llama.cpp GGUF models, embed passages locally, and drive retrieval with an oversized smart-selecting system prompt. Trimming that scope down into a library for an MCP made the project much more practical and, in testing, more accurate.',
    longBlurb:
      'The first version chased an everything-in-one-box experience: local GGUF model loading through llama.cpp, passage embedding, and a very large prompt meant to choose the right context every time. That taught me a lot, but it also showed how much complexity was fighting the actual retrieval problem. Narrowing the project into a library that backs an MCP let me separate concerns, reduce prompt sprawl, and lean on the MCP flow for better tool use and reasoning. The result has demonstrated noticeably stronger answer quality and accuracy than the earlier monolithic approach.',
    repoUrl: 'https://github.com/joeressler/warhammer-graph',
    ctaLabel: 'Source',
    accent: '#a855f7',
  },
  {
    slug: 'crawlsim',
    title: 'CrawlSim',
    oneLiner:
      'An RC crawler simulation focused on vehicle articulation, terrain interaction, and the hard lessons of suspension modeling.',
    shortBlurb:
      'CrawlSim became a deep dive into getting rock-crawler suspension to feel believable. A big turning point was struggling through independent suspension behavior and then reworking the sim around a straight-axle setup that better matched the kind of crawler dynamics I wanted.',
    longBlurb:
      'This project was less about flashy rendering and more about the unpleasantly specific details of suspension physics. I spent a lot of time trying to make an independent suspension model behave in a way that still felt like a capable crawler, but the handling never lined up with the target feel. Moving over to a straight-axle suspension model was both a technical and design reset: it simplified the assumptions, matched the domain better, and gave the simulation a much more convincing articulation profile over uneven terrain.',
    repoUrl: 'https://github.com/joeressler/CrawlSim',
    ctaLabel: 'Source',
    accent: '#f97316',
  },
  {
    slug: 'heat-url',
    title: 'heat-url',
    oneLiner:
      'A Mojo URL utility library published through the Modular community channel as reusable plumbing for parsing and handling web addresses.',
    shortBlurb:
      'heat-url is one of my Mojo libraries that made it into the official Modular community channel. It focuses on practical URL handling so other Mojo projects can rely on a lightweight shared building block instead of rewriting parsing logic.',
    longBlurb:
      'I built heat-url to cover the sort of everyday URL parsing and manipulation work that quickly becomes annoying boilerplate when every project re-implements it slightly differently. Publishing it through the official Modular community channel turned it from a one-off utility into a shared library other Mojo developers can actually depend on. It is intentionally small in scope: dependable web-address handling rather than an overgrown framework.',
    repoUrl: 'https://github.com/joeressler/heat-url',
    ctaLabel: 'Source',
    accent: '#ef4444',
  },
  {
    slug: 'flare-routegen',
    title: 'flare-routegen',
    oneLiner:
      'A Mojo routing library in the official Modular community channel that recreates Flask-style route ergonomics without custom decorators.',
    shortBlurb:
      'flare-routegen grew out of wanting Flask-like route decorators in Mojo, even though the environment did not allow custom decorators. The library explores a route-generation pattern that preserves that ergonomic spirit while fitting the language constraints.',
    longBlurb:
      'The motivating problem here was simple to describe and awkward to solve: I wanted the convenience and readability of Flask-style route decorators, but Mojo did not permit custom decorators in the way that design would normally need. flare-routegen was my attempt to recover that developer experience by generating routing structures through a different mechanism that still felt lightweight to use. Like heat-url, it is published in the official Modular community channel as a practical library rather than just an experiment living in one app.',
    repoUrl: 'https://github.com/joeressler/flare-routegen',
    ctaLabel: 'Source',
    accent: '#22c55e',
  },
  {
    slug: 'rc-garage',
    title: 'RC Garage',
    oneLiner:
      'A concept for an RC enthusiast social platform centered on sharing builds, community activity, and hobby-specific profiles.',
    shortBlurb:
      'RC Garage was my attempt to sketch out a social media platform specifically for RC enthusiasts. The product idea made sense to me, but the practical reality was that I did not have the capital to host and operate it at the scale a social app would need.',
    longBlurb:
      'This repository captures an idea I still like a lot: a social platform for radio-control hobbyists that treats builds, upgrades, and meetups as first-class content instead of forcing the community onto generic social sites. The challenge was never just the app itself; it was the cost and operational overhead of hosting, moderating, and sustaining a real social product. RC Garage represents that tension between a domain-specific product vision and the very real infrastructure budget needed to make it viable.',
    repoUrl: 'https://github.com/joeressler/rc-garage',
    ctaLabel: 'Source',
    accent: '#06b6d4',
  },
];
