// Flat-top hex geometry utilities
// Reference: https://www.redblobgames.com/grids/hexagons/

export interface PixelPoint {
  x: number;
  y: number;
}

/**
 * Convert axial coordinates to pixel center (flat-top orientation)
 */
export function axialToPixel(q: number, r: number, size: number): PixelPoint {
  const x = size * ((3 / 2) * q);
  const y = size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r);
  return { x, y };
}

/**
 * Get the 6 corner points of a flat-top hexagon
 */
export function hexCorners(cx: number, cy: number, size: number): PixelPoint[] {
  const corners: PixelPoint[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    corners.push({
      x: cx + size * Math.cos(angleRad),
      y: cy + size * Math.sin(angleRad),
    });
  }
  return corners;
}

/**
 * Convert corner points to SVG polygon points string
 */
export function cornersToPointsString(corners: PixelPoint[]): string {
  return corners.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * Calculate the bounding box for a set of hex centers
 */
export function calculateBounds(
  hexes: Array<{ q: number; r: number }>,
  size: number
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const hex of hexes) {
    const { x, y } = axialToPixel(hex.q, hex.r, size);
    minX = Math.min(minX, x - size);
    maxX = Math.max(maxX, x + size);
    minY = Math.min(minY, y - size);
    maxY = Math.max(maxY, y + size);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
