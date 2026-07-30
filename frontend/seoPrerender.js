/**
 * Route SEO metadata and HTML shell injection for crawlers.
 * Kept in sync with frontend/src/seo/site.ts and PageMeta usage.
 */

const SITE_ORIGIN = (
  process.env.PUBLIC_URL ||
  'https://www.josepharessler.com'
).replace(/\/$/, '');

const SITE_NAME = 'Joseph Ressler';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-image.jpg`;

const DEFAULT_DESCRIPTION =
  'Joseph Ressler — full-stack portfolio with Digimon Dex, RAG game chatbots, and cloud deployments.';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function page({ path, title, description, bodyHtml, noIndex = false, type = 'website' }) {
  return {
    path,
    title,
    description,
    bodyHtml,
    noIndex,
    type,
    image: DEFAULT_IMAGE,
    url: `${SITE_ORIGIN}${path === '/' ? '/' : path}`,
  };
}

const STATIC_PAGES = [
  page({
    path: '/',
    title: 'Joseph Ressler | Full-Stack Portfolio',
    description: DEFAULT_DESCRIPTION,
    bodyHtml: `
      <article>
        <h1>Joseph Ressler</h1>
        <p>Full-stack systems for games, AI, and interactive worlds.</p>
        <p>${escapeHtml(DEFAULT_DESCRIPTION)}</p>
        <nav aria-label="Primary pages">
          <ul>
            <li><a href="/digimon-dex">Digimon Dex</a> — interactive 3D evolution chamber</li>
            <li><a href="/games">Game Ratings</a> — shared scores and full-clear tracking</li>
            <li><a href="/chat">Game Help Bot</a> — RAG chat over game FAQ corpora</li>
            <li><a href="/Ressler_Joseph_Resume.pdf">Resume (PDF)</a></li>
          </ul>
        </nav>
        <h2>Technical focus</h2>
        <p>React, TypeScript, Python Flask and FastAPI, C# .NET, Docker, AWS, vector databases, and OpenAI integrations.</p>
      </article>
    `,
  }),
  page({
    path: '/digimon-dex',
    title: 'Digimon Dex | Joseph Ressler',
    description:
      'Explore Digimon evolutions in an interactive 3D chamber with search, lineage, and digivice-style loading.',
    bodyHtml: `
      <article>
        <h1>Digimon Dex</h1>
        <p>Interactive 3D evolution chamber with search, lineage, and digivice-style loading.</p>
        <p><a href="/">Back to Joseph Ressler portfolio</a></p>
      </article>
    `,
  }),
  page({
    path: '/games',
    title: 'Game Ratings | Joseph Ressler',
    description:
      'Browse Joseph Ressler’s rated games with scores, full-clear tracking, and community averages.',
    bodyHtml: `
      <article>
        <h1>Game Ratings</h1>
        <p>Shared game list with scores, full-clear tracking, and authenticated ratings.</p>
        <p><a href="/">Back to Joseph Ressler portfolio</a></p>
      </article>
    `,
  }),
  page({
    path: '/login',
    title: 'Log In | Joseph Ressler',
    description: 'Sign in to Joseph Ressler’s portfolio app.',
    noIndex: true,
    bodyHtml: `
      <article>
        <h1>Log In</h1>
        <p>Sign in to access protected features such as game ratings and the FAQ help bot.</p>
      </article>
    `,
  }),
  page({
    path: '/register',
    title: 'Register | Joseph Ressler',
    description: 'Create an account on Joseph Ressler’s portfolio app.',
    noIndex: true,
    bodyHtml: `
      <article>
        <h1>Register</h1>
        <p>Create an account to rate games and use the FAQ help bot.</p>
      </article>
    `,
  }),
  page({
    path: '/chat',
    title: 'Game Help Bot | Joseph Ressler',
    description:
      'RAG chat over World of Warships, World of Warcraft, and League of Legends FAQ corpora.',
    noIndex: true,
    bodyHtml: `
      <article>
        <h1>Game Help Bot</h1>
        <p>Authenticated RAG chat over WoWS, WoW, and LoL FAQ corpora with optional voice I/O.</p>
      </article>
    `,
  }),
];

function digimonPage(rawName) {
  let decoded = rawName;
  try {
    decoded = decodeURIComponent(rawName);
  } catch {
    decoded = rawName;
  }
  const safeName = escapeHtml(decoded);
  const path = `/digimon-dex/${encodeURIComponent(decoded)}`;
  return page({
    path,
    title: `${decoded} | Digimon Dex | Joseph Ressler`,
    description: `View ${decoded} in Joseph Ressler’s Digimon Dex — 3D evolution chamber with lineage and details.`,
    bodyHtml: `
      <article>
        <h1>${safeName}</h1>
        <p>${safeName} in the Digimon Dex — an interactive 3D evolution explorer.</p>
        <p><a href="/digimon-dex">Browse Digimon Dex</a> · <a href="/">Joseph Ressler portfolio</a></p>
      </article>
    `,
  });
}

function normalizePath(pathname) {
  if (!pathname) return '/';
  const noQuery = pathname.split('?')[0].split('#')[0];
  if (noQuery.length > 1 && noQuery.endsWith('/')) {
    return noQuery.slice(0, -1);
  }
  return noQuery || '/';
}

function resolvePage(pathname) {
  const path = normalizePath(pathname);
  const exact = STATIC_PAGES.find((entry) => entry.path === path);
  if (exact) return exact;

  const digimonMatch = path.match(/^\/digimon-dex\/([^/]+)$/);
  if (digimonMatch) {
    return digimonPage(digimonMatch[1]);
  }

  const rateMatch = path.match(/^\/games\/[^/]+\/rate$/);
  if (rateMatch) {
    return page({
      path,
      title: 'Rate Game | Joseph Ressler',
      description: 'Submit a game rating on Joseph Ressler’s portfolio app.',
      noIndex: true,
      bodyHtml: `
        <article>
          <h1>Rate Game</h1>
          <p>Authenticated game rating form.</p>
        </article>
      `,
    });
  }

  return page({
    path,
    title: 'Joseph Ressler | Full-Stack Portfolio',
    description: DEFAULT_DESCRIPTION,
    bodyHtml: `
      <article>
        <h1>Joseph Ressler</h1>
        <p>${escapeHtml(DEFAULT_DESCRIPTION)}</p>
        <p><a href="/">Home</a></p>
      </article>
    `,
  });
}

function replaceMetaByAttr(html, attrName, attrValue, content) {
  const pattern = new RegExp(
    `<meta\\s+${attrName}="${attrValue}"\\s+content="[^"]*"\\s*/?>`,
    'i'
  );
  const tag = `<meta ${attrName}="${attrValue}" content="${escapeHtml(content)}"/>`;
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }
  return html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    (match) => `${match}${tag}`
  );
}

function buildMetaBlock(entry) {
  const robots = entry.noIndex ? 'noindex, nofollow' : 'index, follow';

  return [
    `<title>${escapeHtml(entry.title)}</title>`,
    `<meta name="description" content="${escapeHtml(entry.description)}"/>`,
    `<meta name="robots" content="${robots}"/>`,
    `<meta property="og:type" content="${escapeHtml(entry.type)}"/>`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}"/>`,
    `<meta property="og:title" content="${escapeHtml(entry.title)}"/>`,
    `<meta property="og:description" content="${escapeHtml(entry.description)}"/>`,
    `<meta property="og:url" content="${escapeHtml(entry.url)}"/>`,
    `<meta property="og:image" content="${escapeHtml(entry.image)}"/>`,
    '<meta name="twitter:card" content="summary_large_image"/>',
    `<meta name="twitter:title" content="${escapeHtml(entry.title)}"/>`,
    `<meta name="twitter:description" content="${escapeHtml(entry.description)}"/>`,
    `<meta name="twitter:image" content="${escapeHtml(entry.image)}"/>`,
  ].join('');
}

function injectPrerender(html, pathname) {
  const entry = resolvePage(pathname);
  let next = html;

  // Prefer comment markers when present (dev / non-minified shells).
  if (next.includes('<!-- SEO_META -->')) {
    next = next.replace(
      /<!-- SEO_META -->[\s\S]*?<!-- \/SEO_META -->/,
      `<!-- SEO_META -->${buildMetaBlock(entry)}<!-- /SEO_META -->`
    );
  } else {
    next = next.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(entry.title)}</title>`);
    next = replaceMetaByAttr(next, 'name', 'description', entry.description);
    next = replaceMetaByAttr(
      next,
      'name',
      'robots',
      entry.noIndex ? 'noindex, nofollow' : 'index, follow'
    );
    next = replaceMetaByAttr(next, 'property', 'og:type', entry.type);
    next = replaceMetaByAttr(next, 'property', 'og:site_name', SITE_NAME);
    next = replaceMetaByAttr(next, 'property', 'og:title', entry.title);
    next = replaceMetaByAttr(next, 'property', 'og:description', entry.description);
    next = replaceMetaByAttr(next, 'property', 'og:url', entry.url);
    next = replaceMetaByAttr(next, 'property', 'og:image', entry.image);
    next = replaceMetaByAttr(next, 'name', 'twitter:card', 'summary_large_image');
    next = replaceMetaByAttr(next, 'name', 'twitter:title', entry.title);
    next = replaceMetaByAttr(next, 'name', 'twitter:description', entry.description);
    next = replaceMetaByAttr(next, 'name', 'twitter:image', entry.image);
  }

  const body = entry.bodyHtml.trim();
  if (next.includes('<!-- SEO_PRERENDER -->')) {
    next = next.replace(
      /<!-- SEO_PRERENDER -->[\s\S]*?<!-- \/SEO_PRERENDER -->/,
      `<!-- SEO_PRERENDER -->${body}<!-- /SEO_PRERENDER -->`
    );
  } else {
    next = next.replace(
      /(<div id="root">)([\s\S]*?)(<\/div>\s*<\/body>)/i,
      `$1${body}$3`
    );
  }

  return next;
}

module.exports = {
  SITE_ORIGIN,
  SITE_NAME,
  DEFAULT_IMAGE,
  DEFAULT_DESCRIPTION,
  resolvePage,
  injectPrerender,
  normalizePath,
};
