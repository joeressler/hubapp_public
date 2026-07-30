const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { injectPrerender } = require('./seoPrerender');
const {
  CANONICAL_ORIGIN,
  requestHost,
  isMirrorHost,
  shouldRedirectToCanonical,
  canonicalUrl,
} = require('./seoHost');
const { buildRobotsTxt, buildSitemapXml } = require('./seoSitemap');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';
const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://voice:8081';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const BUILD_DIR = path.join(__dirname, 'build');
const INDEX_HTML_PATH = path.join(BUILD_DIR, 'index.html');

let indexHtmlTemplate = null;

function loadIndexHtmlTemplate() {
  if (!indexHtmlTemplate) {
    indexHtmlTemplate = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  }
  return indexHtmlTemplate;
}

function sendPrerenderedIndex(req, res) {
  try {
    const host = requestHost(req);
    const html = injectPrerender(loadIndexHtmlTemplate(), req.path, {
      forceNoIndex: isMirrorHost(host),
    });
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Failed to prerender index HTML:', err);
    res.sendFile(INDEX_HTML_PATH);
  }
}

app.disable('x-powered-by');

app.use((req, res, next) => {
  const host = requestHost(req);

  if (shouldRedirectToCanonical(host)) {
    const target = canonicalUrl(req.path, req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
    return res.redirect(301, target);
  }

  if (isMirrorHost(host)) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }

  return next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://www.google.com', 'https://www.gstatic.com'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://digi-api.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        frameSrc: [
          'https://www.google.com',
          'https://www.gstatic.com',
          'https://store.steampowered.com',
        ],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: IS_PRODUCTION ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: IS_PRODUCTION
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
  })
);

// Voice remains proxied for ops/health, but browser transcription goes through /api.
app.use(
  '/voice',
  createProxyMiddleware({
    target: VOICE_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/digi-api',
  createProxyMiddleware({
    target: 'https://digi-api.com',
    changeOrigin: true,
    pathRewrite: { '^/digi-api': '' },
  })
);

app.get('/robots.txt', (req, res) => {
  const host = requestHost(req);
  res.type('text/plain').send(buildRobotsTxt(isMirrorHost(host)));
});

app.get('/sitemap.xml', async (req, res) => {
  const host = requestHost(req);
  if (isMirrorHost(host)) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  try {
    const xml = await buildSitemapXml();
    res
      .type('application/xml')
      .set('Cache-Control', 'public, max-age=3600')
      .send(xml);
  } catch (err) {
    console.error('Failed to build sitemap:', err);
    res.status(500).type('text/plain').send('Sitemap unavailable');
  }
});

app.use(express.static(BUILD_DIR, {
  index: false,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

app.get('*', (req, res) => {
  sendPrerenderedIndex(req, res);
});

app.listen(PORT, HOST, () => {
  console.log(`Frontend server listening on http://${HOST}:${PORT}`);
  console.log(`Canonical origin: ${CANONICAL_ORIGIN}`);
});
