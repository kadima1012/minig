import React, { useMemo, useState, useCallback } from "react";
import { TcHexData } from "@minigames/shared";
import { axialToPixel, calculateBounds } from "../../../domain/value-objects/HexGrid";
import { HexTile } from "./HexTile";

interface HexMapProps {
  hexes: TcHexData[];
  myUserId: string;
  onHexClick: (hexId: string) => void;
  isInDuel: boolean;
}

const HEX_SIZE = 40;
const PADDING = 20;

export function HexMap({ hexes, myUserId, onHexClick, isInDuel }: HexMapProps) {
  const [selectedHexId, setSelectedHexId] = useState<string | null>(null);

  // My territory IDs
  const myTerritoryIds = useMemo(
    () => new Set(hexes.filter((h) => h.ownerId === myUserId).map((h) => h.id)),
    [hexes, myUserId]
  );

  // Build neighbor map from hex data (reconstruct adjacency)
  const neighborMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    // Build coord lookup
    const coordToId = new Map<string, string>();
    for (const hex of hexes) {
      coordToId.set(`${hex.q},${hex.r}`, hex.id);
    }

    const dirs = [
      { dq: 1, dr: 0 }, { dq: 1, dr: -1 }, { dq: 0, dr: -1 },
      { dq: -1, dr: 0 }, { dq: -1, dr: 1 }, { dq: 0, dr: 1 },
    ];

    for (const hex of hexes) {
      const neighbors = new Set<string>();
      for (const d of dirs) {
        const nId = coordToId.get(`${hex.q + d.dq},${hex.r + d.dr}`);
        if (nId) neighbors.add(nId);
      }
      map.set(hex.id, neighbors);
    }
    return map;
  }, [hexes]);

  // Visible hex IDs (own territories + their neighbors)
  const visibleHexIds = useMemo(() => {
    const visible = new Set<string>();
    for (const myId of myTerritoryIds) {
      visible.add(myId);
      const neighbors = neighborMap.get(myId);
      if (neighbors) {
        for (const nId of neighbors) {
          visible.add(nId);
        }
      }
    }
    return visible;
  }, [myTerritoryIds, neighborMap]);

  // Attackable hex IDs
  const attackableHexIds = useMemo(() => {
    if (isInDuel) return new Set<string>();
    const attackable = new Set<string>();
    for (const myId of myTerritoryIds) {
      const neighbors = neighborMap.get(myId);
      if (!neighbors) continue;
      for (const nId of neighbors) {
        if (!myTerritoryIds.has(nId)) {
          attackable.add(nId);
        }
      }
    }
    return attackable;
  }, [myTerritoryIds, neighborMap, isInDuel]);

  // Calculate viewport
  const bounds = useMemo(() => calculateBounds(hexes, HEX_SIZE), [hexes]);

  const viewBox = useMemo(
    () =>
      `${bounds.minX - PADDING} ${bounds.minY - PADDING} ${bounds.width + PADDING * 2} ${bounds.height + PADDING * 2}`,
    [bounds]
  );

  const handleHexClick = useCallback(
    (hexId: string) => {
      if (!attackableHexIds.has(hexId)) return;
      setSelectedHexId(hexId);
      onHexClick(hexId);
    },
    [attackableHexIds, onHexClick]
  );

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={viewBox}
        className="w-full h-full max-h-[70vh]"
        preserveAspectRatio="xMidYMid meet"
      >
        {hexes.map((hex) => {
          const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
          return (
            <HexTile
              key={hex.id}
              hex={hex}
              cx={x}
              cy={y}
              size={HEX_SIZE}
              isOwn={myTerritoryIds.has(hex.id)}
              isAttackable={attackableHexIds.has(hex.id)}
              isSelected={selectedHexId === hex.id}
              isFogged={!visibleHexIds.has(hex.id)}
              onClick={() => handleHexClick(hex.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}
