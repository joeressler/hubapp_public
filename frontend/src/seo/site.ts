/** Site-wide SEO constants. Keep URLs aligned with seoPrerender.js. */
export const SITE_ORIGIN = 'https://www.josepharessler.com';
export const SITE_NAME = 'Joseph Ressler';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.jpg`;
export const DEFAULT_DESCRIPTION =
  'Joseph Ressler — full-stack portfolio with Digimon Dex, RAG game chatbots, and cloud deployments.';

/** Keep meta descriptions within a typical SERP length. */
export function truncateMetaDescription(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}
