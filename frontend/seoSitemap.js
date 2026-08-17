/**
 * Sitemap generation for public indexable routes.
 * Digimon detail URLs are fetched from digi-api and cached in memory.
 */

const { CANONICAL_ORIGIN, canonicalUrl } = require('./seoHost');

const DIGI_API_LIST =
  process.env.DIGI_API_LIST_URL ||
  'https://digi-api.com/api/v1/digimon?page=0&pageSize=1500';

const SITEMAP_CACHE_TTL_MS = Number(process.env.SITEMAP_CACHE_TTL_MS || 24 * 60 * 60 * 1000);

const STATIC_PATHS = ['/', '/games', '/repos', '/digimon-dex'];

let digimonCache = {
  names: /** @type {string[]} */ ([]),
  fetchedAt: 0,
  inflight: /** @type {Promise<string[]> | null} */ (null),
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, { lastmod, changefreq, priority } = {}) {
  const parts = [`    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) {
    parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  }
  if (changefreq) {
    parts.push(`    <changefreq>${escapeXml(changefreq)}</changefreq>`);
  }
  if (priority !== undefined) {
    parts.push(`    <priority>${escapeXml(String(priority))}</priority>`);
  }
  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

async function fetchDigimonNames() {
  const now = Date.now();
  if (digimonCache.names.length && now - digimonCache.fetchedAt < SITEMAP_CACHE_TTL_MS) {
    return digimonCache.names;
  }
  if (digimonCache.inflight) {
    return digimonCache.inflight;
  }

  digimonCache.inflight = (async () => {
    const names = [];
    let nextUrl = DIGI_API_LIST;
    let pages = 0;
    const maxPages = 5;

    while (nextUrl && pages < maxPages) {
      const response = await fetch(nextUrl, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Digi API list failed with ${response.status}`);
      }
      const data = await response.json();
      const content = Array.isArray(data.content) ? data.content : [];
      for (const item of content) {
        if (item && typeof item.name === 'string' && item.name.trim()) {
          names.push(item.name.trim());
        }
      }
      pages += 1;
      nextUrl = data.pageable && data.pageable.nextPage ? data.pageable.nextPage : null;
      if (nextUrl && pages < maxPages) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    const unique = [...new Set(names)].sort((a, b) => a.localeCompare(b));
    digimonCache = { names: unique, fetchedAt: Date.now(), inflight: null };
    return unique;
  })().catch((err) => {
    digimonCache.inflight = null;
    throw err;
  });

  return digimonCache.inflight;
}

async function buildSitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    urlEntry(canonicalUrl('/'), {
      lastmod: today,
      changefreq: 'weekly',
      priority: '1.0',
    }),
    urlEntry(canonicalUrl('/games'), {
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8',
    }),
    urlEntry(canonicalUrl('/digimon-dex'), {
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.9',
    }),
  ];

  try {
    const names = await fetchDigimonNames();
    for (const name of names) {
      entries.push(
        urlEntry(canonicalUrl(`/digimon-dex/${encodeURIComponent(name)}`), {
          changefreq: 'monthly',
          priority: '0.6',
        })
      );
    }
  } catch (err) {
    console.error('Sitemap Digimon fetch failed; serving static URLs only:', err.message || err);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

function buildRobotsTxt(isMirror) {
  if (isMirror) {
    return ['User-agent: *', 'Disallow: /', ''].join('\n');
  }

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /chat',
    'Disallow: /*/rate',
    '',
    `Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
}

module.exports = {
  STATIC_PATHS,
  buildSitemapXml,
  buildRobotsTxt,
  fetchDigimonNames,
};
