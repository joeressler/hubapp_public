import { DigimonDetail, getDigimonImage, proxyDigiUrl } from '../../services/digiApi';

/** Collects every unique image URL for a digimon detail (center + all evolutions). */
export function collectDigimonTextureUrls(detail: DigimonDetail): string[] {
  const urls = new Set<string>();

  const center = getDigimonImage(detail);
  if (center) urls.add(center);

  for (const evo of detail.priorEvolutions) {
    urls.add(proxyDigiUrl(evo.image));
  }
  for (const evo of detail.nextEvolutions) {
    urls.add(proxyDigiUrl(evo.image));
  }

  return Array.from(urls);
}

export function getEvolutionTextureUrl(image: string): string {
  return proxyDigiUrl(image);
}
