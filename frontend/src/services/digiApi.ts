const BASE_URL = '/digi-api/api/v1';

/** DAPI public limit: 15 requests per 10 seconds (stay slightly under). */
const RATE_LIMIT_MAX = 14;
const RATE_LIMIT_WINDOW_MS = 10_000;
const MIN_REQUEST_INTERVAL_MS = 750;

const LIST_CACHE_KEY = 'digimon-list-cache';
const LIST_CACHE_TS_KEY = 'digimon-list-cache-ts';
const DETAIL_CACHE_PREFIX = 'digimon-detail-';
const LIST_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DETAIL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function proxyDigiUrl(url: string): string {
  if (url.startsWith('https://digi-api.com')) {
    return url.replace('https://digi-api.com', '/digi-api');
  }
  return url;
}

export interface DigimonListItem {
  id: number;
  name: string;
  href: string;
  image: string;
}

export interface DigimonEvolution {
  id: number;
  digimon: string;
  condition: string;
  image: string;
  url: string;
}

export interface DigimonDetail {
  id: number;
  name: string;
  xAntibody: boolean;
  images: { href: string; transparent: boolean }[];
  levels: { id: number; level: string }[];
  types: { id: number; type: string }[];
  attributes: { id: number; attribute: string }[];
  fields: { id: number; field: string; image: string }[];
  releaseDate: string;
  descriptions: { origin: string; language: string; description: string }[];
  skills: { id: number; skill: string; translation: string; description: string }[];
  priorEvolutions: DigimonEvolution[];
  nextEvolutions: DigimonEvolution[];
}

interface PaginatedResponse {
  content: DigimonListItem[];
  pageable: {
    currentPage: number;
    elementsOnPage: number;
    totalElements: number;
    totalPages: number;
    previousPage: string | null;
    nextPage: string | null;
  };
}

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

const detailMemoryCache = new Map<string, DigimonDetail>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const requestTimestamps: number[] = [];
let lastRequestAt = 0;
let queueChain: Promise<void> = Promise.resolve();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pruneTimestamps(now: number): void {
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] >= RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
}

async function waitForRateLimitSlot(): Promise<void> {
  const now = Date.now();
  pruneTimestamps(now);

  const sinceLast = now - lastRequestAt;
  if (sinceLast < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - sinceLast);
  }

  pruneTimestamps(Date.now());
  if (requestTimestamps.length >= RATE_LIMIT_MAX) {
    const oldest = requestTimestamps[0];
    const waitMs = RATE_LIMIT_WINDOW_MS - (Date.now() - oldest) + 50;
    if (waitMs > 0) {
      await sleep(waitMs);
    }
    pruneTimestamps(Date.now());
  }
}

function scheduleRateLimited<T>(task: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    await waitForRateLimitSlot();
    requestTimestamps.push(Date.now());
    lastRequestAt = Date.now();
    return task();
  };

  const result = queueChain.then(run, run);
  queueChain = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

function parseRetryAfterMs(response: Response): number | null {
  const header = response.headers.get('Retry-After');
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

async function apiFetch(url: string, signal?: AbortSignal): Promise<Response> {
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await scheduleRateLimited(() =>
      fetch(url, { signal, headers: { Accept: 'application/json' } })
    );

    if (response.status !== 429) {
      return response;
    }

    if (attempt === maxAttempts - 1) {
      throw new Error('Digi API rate limit exceeded. Please wait a moment and try again.');
    }

    const retryAfter = parseRetryAfterMs(response) ?? Math.min(10_000, 1000 * 2 ** attempt);
    await sleep(retryAfter);
  }

  throw new Error('Digi API request failed');
}

function readLocalCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.cachedAt > ttlMs) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeLocalCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — memory cache still helps within session
  }
}

function detailCacheKey(idOrName: string | number): string {
  return String(idOrName).toLowerCase();
}

async function fetchPage(page: number, pageSize: number, signal?: AbortSignal): Promise<PaginatedResponse> {
  const response = await apiFetch(`${BASE_URL}/digimon?page=${page}&pageSize=${pageSize}`, signal);
  if (!response.ok) {
    throw new Error(`Failed to fetch digimon list (page ${page})`);
  }
  return response.json();
}

export async function fetchDigimonList(signal?: AbortSignal): Promise<DigimonListItem[]> {
  const cachedList = readLocalCache<DigimonListItem[]>(LIST_CACHE_KEY, LIST_CACHE_TTL_MS);
  if (cachedList) {
    try {
      sessionStorage.setItem(LIST_CACHE_KEY, JSON.stringify(cachedList));
    } catch {
      // ignore
    }
    return cachedList;
  }

  try {
    const sessionCached = sessionStorage.getItem(LIST_CACHE_KEY);
    const sessionTs = sessionStorage.getItem(LIST_CACHE_TS_KEY);
    if (sessionCached && sessionTs) {
      const age = Date.now() - Number(sessionTs);
      if (age < LIST_CACHE_TTL_MS) {
        return JSON.parse(sessionCached) as DigimonListItem[];
      }
    }
  } catch {
    // ignore
  }

  const requestKey = 'digimon-list';
  if (inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey) as Promise<DigimonListItem[]>;
  }

  const promise = (async () => {
    const pageSize = 1500;
    const firstPage = await fetchPage(0, pageSize, signal);
    let allItems = [...firstPage.content];

    const totalPages = firstPage.pageable.totalPages;
    for (let page = 1; page < totalPages; page++) {
      const pageData = await fetchPage(page, pageSize, signal);
      allItems = allItems.concat(pageData.content);
    }

    allItems.sort((a, b) => a.name.localeCompare(b.name));

    writeLocalCache(LIST_CACHE_KEY, allItems);
    try {
      sessionStorage.setItem(LIST_CACHE_KEY, JSON.stringify(allItems));
      sessionStorage.setItem(LIST_CACHE_TS_KEY, String(Date.now()));
    } catch {
      // ignore
    }

    return allItems;
  })();

  inFlightRequests.set(requestKey, promise);
  try {
    return await promise;
  } finally {
    inFlightRequests.delete(requestKey);
  }
}

export async function fetchDigimonDetail(
  idOrName: string | number,
  signal?: AbortSignal
): Promise<DigimonDetail> {
  const cacheKey = detailCacheKey(idOrName);

  const memoryHit = detailMemoryCache.get(cacheKey);
  if (memoryHit) return memoryHit;

  const localHit = readLocalCache<DigimonDetail>(DETAIL_CACHE_PREFIX + cacheKey, DETAIL_CACHE_TTL_MS);
  if (localHit) {
    detailMemoryCache.set(cacheKey, localHit);
    detailMemoryCache.set(detailCacheKey(localHit.name), localHit);
    detailMemoryCache.set(detailCacheKey(localHit.id), localHit);
    return localHit;
  }

  const requestKey = `detail-${cacheKey}`;
  if (inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey) as Promise<DigimonDetail>;
  }

  const promise = (async () => {
    const encoded = encodeURIComponent(String(idOrName));
    const response = await apiFetch(`${BASE_URL}/digimon/${encoded}`, signal);
    if (response.status === 404) {
      throw new Error(`Digimon not found: ${idOrName}`);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch digimon: ${idOrName}`);
    }
    const data = (await response.json()) as DigimonDetail;

    detailMemoryCache.set(detailCacheKey(data.name), data);
    detailMemoryCache.set(detailCacheKey(data.id), data);
    writeLocalCache(DETAIL_CACHE_PREFIX + detailCacheKey(data.name), data);
    writeLocalCache(DETAIL_CACHE_PREFIX + detailCacheKey(data.id), data);

    return data;
  })();

  inFlightRequests.set(requestKey, promise);
  try {
    return await promise;
  } finally {
    inFlightRequests.delete(requestKey);
  }
}

export function getDigimonImage(detail: DigimonDetail): string {
  const href = detail.images[0]?.href ?? '';
  return href ? proxyDigiUrl(href) : '';
}

export function getEnglishDescription(detail: DigimonDetail): string {
  const en = detail.descriptions.find((d) => d.language === 'en_us');
  return en?.description ?? detail.descriptions[0]?.description ?? '';
}

export const MAX_EGGS_PER_SIDE = 12;

export function getVisibleEvolutions(
  evolutions: DigimonEvolution[],
  max: number = MAX_EGGS_PER_SIDE
): {
  visible: DigimonEvolution[];
  overflow: DigimonEvolution[];
} {
  return {
    visible: evolutions.slice(0, max),
    overflow: evolutions.slice(max),
  };
}
