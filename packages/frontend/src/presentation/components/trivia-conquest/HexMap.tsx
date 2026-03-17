import React, { useMemo, useState, useCallback } from "react";
import { TcHexData, TcHexSelectedData } from "@minigames/shared";
import { axialToPixel, calculateBounds } from "../../../domain/value-objects/HexGrid";
import { HexTile } from "./HexTile";

interface HexMapProps {
  hexes: TcHexData[];
  myUserId: string;
  onHexClick: (hexId: string) => void;
  isInDuel: boolean;
  /** Planning mode: which hexes can this player attack */
  isPlanning?: boolean;
  attackableHexIds?: string[];
  /** Currently selected hex by this player during planning */
  mySelectedHexId?: string | null;
  /** All players' selections during planning */
  hexSelections?: TcHexSelectedData[];
}

const HEX_SIZE = 62;
const PADDING = 28;

export function HexMap({
  hexes,
  myUserId,
  onHexClick,
  isInDuel,
  isPlanning = false,
  attackableHexIds: planningAttackableIds,
  mySelectedHexId,
  hexSelections = [],
}: HexMapProps) {
  const [selectedHexId, setSelectedHexId] = useState<string | null>(null);

  // My territory IDs
  const myTerritoryIds = useMemo(
    () => new Set(hexes.filter((h) => h.ownerId === myUserId).map((h) => h.id)),
    [hexes, myUserId]
  );

  // Build neighbor map from hex data
  const neighborMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
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

  // Attackable hex IDs — depends on mode
  const attackableHexIds = useMemo(() => {
    if (isInDuel) return new Set<string>();

    if (isPlanning && planningAttackableIds) {
      // During planning, use server-provided list but exclude hexes already selected by others
      const takenByOthers = new Set(
        hexSelections
          .filter(s => s.userId !== myUserId)
          .map(s => s.hexId)
      );
      const attackable = new Set<string>();
      for (const hexId of planningAttackableIds) {
        if (!takenByOthers.has(hexId)) {
          attackable.add(hexId);
        }
      }
      return attackable;
    }

    // Default: compute from neighbor map (for non-planning phases)
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
  }, [myTerritoryIds, neighborMap, isInDuel, isPlanning, planningAttackableIds, hexSelections, myUserId]);

  // Hex selections lookup: hexId -> selection data
  const selectionsByHex = useMemo(() => {
    const map = new Map<string, TcHexSelectedData>();
    for (const sel of hexSelections) {
      map.set(sel.hexId, sel);
    }
    return map;
  }, [hexSelections]);

  // Calculate viewport
  const bounds = useMemo(() => calculateBounds(hexes, HEX_SIZE), [hexes]);

  const viewBox = useMemo(
    () =>
      `${bounds.minX - PADDING} ${bounds.minY - PADDING} ${bounds.width + PADDING * 2} ${bounds.height + PADDING * 2}`,
    [bounds]
  );

  const handleHexClick = useCallback(
    (hexId: string) => {
      if (isPlanning) {
        // During planning: select/deselect
        if (attackableHexIds.has(hexId) || hexId === mySelectedHexId) {
          onHexClick(hexId);
        }
        return;
      }

      if (!attackableHexIds.has(hexId)) return;
      setSelectedHexId(hexId);
      onHexClick(hexId);
    },
    [attackableHexIds, onHexClick, isPlanning, mySelectedHexId]
  );

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={viewBox}
        className="w-full h-full max-h-[70vh]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Map background */}
        <rect
          x={bounds.minX - PADDING}
          y={bounds.minY - PADDING}
          width={bounds.width + PADDING * 2}
          height={bounds.height + PADDING * 2}
          fill="#c8ccb8"
          rx={8}
        />
        {hexes.map((hex) => {
          const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
          const selection = selectionsByHex.get(hex.id);
          const isMySelection = mySelectedHexId === hex.id;
          const isTakenByOther = selection && selection.userId !== myUserId;

          return (
            <HexTile
              key={hex.id}
              hex={hex}
              cx={x}
              cy={y}
              size={HEX_SIZE}
              isOwn={myTerritoryIds.has(hex.id)}
              isAttackable={attackableHexIds.has(hex.id) && !isMySelection}
              isSelected={isPlanning ? isMySelection : selectedHexId === hex.id}
              isFogged={!visibleHexIds.has(hex.id)}
              onClick={() => handleHexClick(hex.id)}
              isPlanning={isPlanning}
              planningSelection={isTakenByOther ? selection : undefined}
            />
          );
        })}
      </svg>
    </div>
  );
}
