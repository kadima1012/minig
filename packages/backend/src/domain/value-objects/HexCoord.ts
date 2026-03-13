// Axial coordinate system for hex grids (flat-top orientation)
// Reference: https://www.redblobgames.com/grids/hexagons/

export interface AxialCoord {
  q: number;
  r: number;
}

// Six neighbor directions in axial coordinates
const HEX_DIRECTIONS: AxialCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function getNeighborCoords(coord: AxialCoord): AxialCoord[] {
  return HEX_DIRECTIONS.map((d) => ({ q: coord.q + d.q, r: coord.r + d.r }));
}

export function axialDistance(a: AxialCoord, b: AxialCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

export function coordKey(coord: AxialCoord): string {
  return `${coord.q},${coord.r}`;
}

/**
 * Generate a hex grid with the given radius (number of rings around center).
 * Radius 3 produces 37 hexes.
 */
export function generateHexCoords(radius: number): AxialCoord[] {
  const coords: AxialCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      coords.push({ q, r });
    }
  }
  return coords;
}
