/**
 * Host / origin helpers for canonical SEO.
 * Canonical site is always www; aws/gcr mirrors stay live but noindex.
 */

const CANONICAL_ORIGIN = (
  process.env.PUBLIC_URL ||
  process.env.CANONICAL_ORIGIN ||
  'https://www.josepharessler.com'
).replace(/\/$/, '');

const CANONICAL_HOST = (() => {
  try {
    return new URL(CANONICAL_ORIGIN).host.toLowerCase();
  } catch {
    return 'www.josepharessler.com';
  }
})();

const APEX_HOST = (process.env.SEO_APEX_HOST || 'josepharessler.com').toLowerCase();

const MIRROR_HOSTS = new Set(
  (process.env.SEO_MIRROR_HOSTS || 'aws.josepharessler.com,gcr.josepharessler.com')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

function requestHost(req) {
  const raw = req.get('x-forwarded-host') || req.get('host') || '';
  return raw.split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');
}

function isLocalDevHost(host) {
  return (
    !host ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local')
  );
}

function isMirrorHost(host) {
  return MIRROR_HOSTS.has(host);
}

function shouldRedirectToCanonical(host) {
  if (isLocalDevHost(host) || isMirrorHost(host)) {
    return false;
  }
  if (host === APEX_HOST) {
    return true;
  }
  // Non-www / unexpected production hosts that share the apex domain.
  if (host.endsWith(`.${APEX_HOST}`) && host !== CANONICAL_HOST && !isMirrorHost(host)) {
    return true;
  }
  return false;
}

function canonicalUrl(pathname = '/', search = '') {
  const path = !pathname || pathname === '' ? '/' : pathname;
  const normalized =
    path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return `${CANONICAL_ORIGIN}${normalized === '/' ? '/' : normalized}${search || ''}`;
}

module.exports = {
  CANONICAL_ORIGIN,
  CANONICAL_HOST,
  APEX_HOST,
  MIRROR_HOSTS,
  requestHost,
  isLocalDevHost,
  isMirrorHost,
  shouldRedirectToCanonical,
  canonicalUrl,
};
