import React, { useMemo } from "react";
import { TcHexData } from "@minigames/shared";
import { hexCorners, cornersToPointsString } from "../../../domain/value-objects/HexGrid";

interface HexTileProps {
  hex: TcHexData;
  cx: number;
  cy: number;
  size: number;
  isOwn: boolean;
  isAttackable: boolean;
  isSelected: boolean;
  isFogged: boolean;
  onClick: () => void;
}

// ── Deterministic helpers ─────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
  return h;
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0xffffffff; };
}

type Terrain = "forest" | "mountains" | "village" | "castle" | "plains";

function getTerrain(id: string): Terrain {
  const v = hashStr(id) % 100;
  if (v < 7) return "castle";
  if (v < 28) return "mountains";
  if (v < 62) return "forest";
  if (v < 82) return "village";
  return "plains";
}

// ── Terrain icons (all centered at 0,0, scaled by `s`) ───────────────────────

function PineTree({ s, op }: { s: number; op: number }) {
  return (
    <g opacity={op} style={{ pointerEvents: "none" }}>
      <rect x={-s * 0.1} y={s * 0.22} width={s * 0.2} height={s * 0.4} fill="#7a5c3a" />
      <polygon points={`0,${-s} ${-s * 0.62},${s * 0.08} ${s * 0.62},${s * 0.08}`} fill="#3a6642" />
      <polygon points={`0,${-s * 0.52} ${-s * 0.48},${s * 0.38} ${s * 0.48},${s * 0.38}`} fill="#4a7a52" />
    </g>
  );
}

function MountainIcon({ s, op }: { s: number; op: number }) {
  return (
    <g opacity={op} style={{ pointerEvents: "none" }}>
      <polygon points={`0,${-s} ${-s * 0.88},${s * 0.5} ${s * 0.88},${s * 0.5}`} fill="#848494" />
      <polygon points={`0,${-s} ${-s * 0.27},${-s * 0.38} ${s * 0.27},${-s * 0.38}`} fill="#e8e4da" />
    </g>
  );
}

function HouseIcon({ s, op }: { s: number; op: number }) {
  return (
    <g opacity={op} style={{ pointerEvents: "none" }}>
      <rect x={-s * 0.5} y={-s * 0.08} width={s} height={s * 0.82} fill="#c4956a" />
      <polygon points={`${-s * 0.62},${-s * 0.08} ${s * 0.62},${-s * 0.08} 0,${-s * 0.82}`} fill="#8b3a2a" />
      <rect x={-s * 0.18} y={s * 0.22} width={s * 0.36} height={s * 0.5} fill="#6a4830" />
    </g>
  );
}

function CastleIcon({ s, op }: { s: number; op: number }) {
  return (
    <g opacity={op} style={{ pointerEvents: "none" }}>
      {/* Base wall */}
      <rect x={-s * 0.72} y={-s * 0.28} width={s * 1.44} height={s * 1.0} fill="#9696a4" />
      {/* Left tower */}
      <rect x={-s * 0.9} y={-s * 0.9} width={s * 0.6} height={s * 1.44} fill="#848494" />
      {/* Right tower */}
      <rect x={s * 0.3} y={-s * 0.9} width={s * 0.6} height={s * 1.44} fill="#848494" />
      {/* Left battlements */}
      <rect x={-s * 0.9} y={-s * 1.15} width={s * 0.18} height={s * 0.27} fill="#848494" />
      <rect x={-s * 0.62} y={-s * 1.15} width={s * 0.18} height={s * 0.27} fill="#848494" />
      {/* Right battlements */}
      <rect x={s * 0.3} y={-s * 1.15} width={s * 0.18} height={s * 0.27} fill="#848494" />
      <rect x={s * 0.58} y={-s * 1.15} width={s * 0.18} height={s * 0.27} fill="#848494" />
      {/* Gate arch */}
      <path
        d={`M ${-s * 0.21},${-s * 0.28} L ${-s * 0.21},${s * 0.72} Q 0,${s * 0.82} ${s * 0.21},${s * 0.72} L ${s * 0.21},${-s * 0.28} Z`}
        fill="#44404c"
      />
      {/* Arrow slits */}
      <rect x={-s * 0.74} y={-s * 0.5} width={s * 0.12} height={s * 0.3} fill="#44404c" />
      <rect x={s * 0.62} y={-s * 0.5} width={s * 0.12} height={s * 0.3} fill="#44404c" />
    </g>
  );
}

function TentIcon({ s, op }: { s: number; op: number }) {
  return (
    <g opacity={op} style={{ pointerEvents: "none" }}>
      <polygon points={`0,${-s * 0.82} ${-s * 0.76},${s * 0.56} ${s * 0.76},${s * 0.56}`} fill="#a09080" />
      <line x1={0} y1={-s * 0.82} x2={0} y2={s * 0.56} stroke="#786858" strokeWidth={s * 0.09} />
      <line x1={-s * 0.76} y1={s * 0.56} x2={s * 0.76} y2={s * 0.56} stroke="#786858" strokeWidth={s * 0.12} />
    </g>
  );
}

// ── Terrain placement ─────────────────────────────────────────────────────────

function TerrainDecor({ hexId, cx, cy, size, owned }: { hexId: string; cx: number; cy: number; size: number; owned: boolean }) {
  const type = getTerrain(hexId);
  const h = hashStr(hexId);
  const rng = seededRng(h);
  const op = owned ? 0.5 : 0.78;
  const spread = size * 0.38;

  if (type === "castle") {
    return (
      <g transform={`translate(${cx},${cy + size * 0.06})`}>
        <CastleIcon s={size * 0.28} op={op} />
      </g>
    );
  }

  if (type === "forest") {
    const n = 2 + (h % 2);
    return (
      <>
        {Array.from({ length: n }, (_, i) => {
          const a = rng() * Math.PI * 2;
          const d = rng() * spread * 0.68;
          const ts = size * (0.18 + rng() * 0.06);
          return (
            <g key={i} transform={`translate(${cx + Math.cos(a) * d},${cy + Math.sin(a) * d})`}>
              <PineTree s={ts} op={op} />
            </g>
          );
        })}
      </>
    );
  }

  if (type === "mountains") {
    const n = 1 + (h % 2);
    return (
      <>
        {Array.from({ length: n }, (_, i) => {
          const a = rng() * Math.PI * 2;
          const d = rng() * spread * 0.4;
          const ms = size * (0.2 + rng() * 0.08);
          return (
            <g key={i} transform={`translate(${cx + Math.cos(a) * d * 1.3},${cy + Math.sin(a) * d * 0.55})`}>
              <MountainIcon s={ms} op={op} />
            </g>
          );
        })}
      </>
    );
  }

  if (type === "village") {
    const n = 1 + (h % 2);
    const hs = size * 0.17;
    const items: React.ReactNode[] = Array.from({ length: n }, (_, i) => {
      const a = rng() * Math.PI * 2;
      const d = rng() * spread * 0.46;
      return (
        <g key={i} transform={`translate(${cx + Math.cos(a) * d},${cy + Math.sin(a) * d})`}>
          <HouseIcon s={hs} op={op} />
        </g>
      );
    });
    if (h % 3 !== 0) {
      const a = rng() * Math.PI * 2;
      const d = rng() * spread * 0.6;
      items.push(
        <g key="t" transform={`translate(${cx + Math.cos(a) * d},${cy + Math.sin(a) * d})`}>
          <PineTree s={size * 0.13} op={op * 0.75} />
        </g>
      );
    }
    return <>{items}</>;
  }

  // plains
  return (
    <g transform={`translate(${cx},${cy})`}>
      <TentIcon s={size * 0.14} op={op * 0.72} />
    </g>
  );
}

// ── Player shield/banner ──────────────────────────────────────────────────────

function PlayerShield({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const s = size * 0.27;
  const py = cy - size * 0.08;
  return (
    <g style={{ pointerEvents: "none" }}>
      {/* Pole */}
      <line x1={cx} y1={py + s * 1.05} x2={cx} y2={py - s * 0.38} stroke="white" strokeWidth={2.2} opacity={0.92} strokeLinecap="round" />
      {/* Shield body */}
      <path
        d={`M ${cx - s * 0.62},${py - s * 0.3} L ${cx + s * 0.62},${py - s * 0.3} L ${cx + s * 0.62},${py + s * 0.48} Q ${cx + s * 0.62},${py + s * 1.0} ${cx},${py + s * 1.15} Q ${cx - s * 0.62},${py + s * 1.0} ${cx - s * 0.62},${py + s * 0.48} Z`}
        fill="white"
        opacity={0.96}
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}
      />
      {/* Sword blade */}
      <line x1={cx} y1={py + s * 0.02} x2={cx} y2={py + s * 0.9} stroke="#4a4a50" strokeWidth={s * 0.13} strokeLinecap="round" />
      {/* Crossguard */}
      <line x1={cx - s * 0.32} y1={py + s * 0.3} x2={cx + s * 0.32} y2={py + s * 0.3} stroke="#4a4a50" strokeWidth={s * 0.1} strokeLinecap="round" />
      {/* Pommel */}
      <circle cx={cx} cy={py + s * 0.9} r={s * 0.09} fill="#4a4a50" />
      {/* Sword tip */}
      <polygon points={`${cx},${py - s * 0.02} ${cx - s * 0.07},${py + s * 0.14} ${cx + s * 0.07},${py + s * 0.14}`} fill="#4a4a50" />
    </g>
  );
}

// ── HexTile ───────────────────────────────────────────────────────────────────

export function HexTile({ hex, cx, cy, size, isOwn, isAttackable, isSelected, isFogged, onClick }: HexTileProps) {
  const points = useMemo(() => cornersToPointsString(hexCorners(cx, cy, size)), [cx, cy, size]);

  if (isFogged) {
    return <polygon points={points} fill="#d4d0c8" stroke="#c0bcb4" strokeWidth={1.5} />;
  }

  const fillColor = hex.ownerId ? hex.ownerColor || "#888" : "#e2ddd4";
  const strokeColor = isSelected
    ? "#ffffff"
    : isAttackable
      ? "#f0c030"
      : "rgba(0,0,0,0.18)";
  const strokeWidth = isSelected ? 3.5 : isAttackable ? 2.5 : 1.5;

  return (
    <g onClick={isAttackable ? onClick : undefined} style={{ cursor: isAttackable ? "pointer" : "default" }}>
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className={isAttackable ? "hover:opacity-90 transition-opacity" : ""}
      />
      <TerrainDecor hexId={hex.id} cx={cx} cy={cy} size={size} owned={!!hex.ownerId} />
      {hex.ownerId && <PlayerShield cx={cx} cy={cy} size={size} />}
      {isAttackable && (
        <polygon points={points} fill="none" stroke="#f0c030" strokeWidth={2} opacity={0.45} className="animate-pulse" />
      )}
    </g>
  );
}
