export function getMatrixCols(count: number): number {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  if (count <= 20) return 4;
  if (count <= 40) return 5;
  if (count <= 63) return 7;
  return 8;
}

export function getMatrixSpacing(count: number, cols: number): number {
  const rows = Math.ceil(count / cols);
  const maxDim = Math.max(cols, rows);
  if (maxDim <= 3) return 1.15;
  if (maxDim <= 5) return 1.05;
  if (maxDim <= 8) return 0.98;
  if (maxDim <= 12) return 0.88;
  if (maxDim <= 16) return 0.78;
  return 0.68;
}

export function getMatrixXBase(side: 'prior' | 'next', count: number): number {
  const base = 4.6;
  const extra = count > 50 ? 1.6 : count > 30 ? 1.1 : count > 15 ? 0.55 : 0;
  return side === 'prior' ? -(base + extra) : base + extra;
}

export function getEggScale(count: number): number {
  if (count <= 12) return 1;
  if (count <= 30) return 0.88;
  if (count <= 50) return 0.76;
  return 0.65;
}

export function getMatrixPositions(
  count: number,
  side: 'prior' | 'next'
): [number, number, number][] {
  if (count === 0) return [];

  const cols = getMatrixCols(count);
  const rows = Math.ceil(count / cols);
  const spacing = getMatrixSpacing(count, cols);
  const xBase = getMatrixXBase(side, count);

  const yOffset = ((rows - 1) * spacing) / 2;
  const zOffset = ((cols - 1) * spacing) / 2;

  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push([
      xBase,
      yOffset - row * spacing,
      col * spacing - zOffset,
    ]);
  }
  return positions;
}

export function getCameraDistance(priorCount: number, nextCount: number): number {
  const priorRows = Math.ceil(priorCount / getMatrixCols(priorCount || 1));
  const nextRows = Math.ceil(nextCount / getMatrixCols(nextCount || 1));
  const maxRows = Math.max(priorRows, nextRows, 1);
  const lateralSpread = Math.max(
    Math.abs(getMatrixXBase('prior', priorCount)),
    Math.abs(getMatrixXBase('next', nextCount))
  );
  return 7 + Math.max(0, maxRows - 4) * 0.45 + Math.max(0, lateralSpread - 4.6) * 0.35;
}
