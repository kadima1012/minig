import React, { useMemo } from "react";
import { TcHexData, TC_CATEGORY_COLORS } from "@minigames/shared";
import { hexCorners, cornersToPointsString } from "../../../domain/value-objects/HexGrid";

interface HexTileProps {
  hex: TcHexData;
  cx: number;
  cy: number;
  size: number;
  isOwn: boolean;
  isAttackable: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryIcon({ category, cx, cy, size, color }: { category: string; cx: number; cy: number; size: number; color: string }) {
  const s = size * 0.32;
  const x = cx - s / 2;
  const y = cy - size * 0.15 - s / 2;

  switch (category) {
    case "science":
      // Flask / atom icon
      return (
        <g transform={`translate(${x},${y})`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
          <circle cx={s / 2} cy={s / 2} r={s * 0.4} />
          <circle cx={s / 2} cy={s / 2} r={s * 0.08} fill={color} />
          <ellipse cx={s / 2} cy={s / 2} rx={s * 0.4} ry={s * 0.15} />
          <ellipse cx={s / 2} cy={s / 2} rx={s * 0.15} ry={s * 0.4} />
        </g>
      );
    case "movies":
      // Film/clapperboard icon
      return (
        <g transform={`translate(${x},${y})`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
          <rect x={s * 0.1} y={s * 0.3} width={s * 0.8} height={s * 0.6} rx={s * 0.05} fill={color} fillOpacity={0.15} />
          <line x1={s * 0.1} y1={s * 0.3} x2={s * 0.9} y2={s * 0.3} />
          <polygon points={`${s * 0.15},${s * 0.1} ${s * 0.35},${s * 0.1} ${s * 0.3},${s * 0.3} ${s * 0.1},${s * 0.3}`} fill={color} fillOpacity={0.3} />
          <polygon points={`${s * 0.4},${s * 0.1} ${s * 0.6},${s * 0.1} ${s * 0.55},${s * 0.3} ${s * 0.35},${s * 0.3}`} fill={color} fillOpacity={0.3} />
          <polygon points={`${s * 0.65},${s * 0.1} ${s * 0.85},${s * 0.1} ${s * 0.8},${s * 0.3} ${s * 0.6},${s * 0.3}`} fill={color} fillOpacity={0.3} />
        </g>
      );
    case "history":
      // Pillar / column icon
      return (
        <g transform={`translate(${x},${y})`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
          <polygon points={`${s * 0.25},${s * 0.15} ${s * 0.75},${s * 0.15} ${s * 0.7},${s * 0.25} ${s * 0.3},${s * 0.25}`} fill={color} fillOpacity={0.2} />
          <line x1={s * 0.35} y1={s * 0.25} x2={s * 0.35} y2={s * 0.75} />
          <line x1={s * 0.5} y1={s * 0.25} x2={s * 0.5} y2={s * 0.75} />
          <line x1={s * 0.65} y1={s * 0.25} x2={s * 0.65} y2={s * 0.75} />
          <rect x={s * 0.2} y={s * 0.75} width={s * 0.6} height={s * 0.1} fill={color} fillOpacity={0.2} />
        </g>
      );
    case "tech":
      // Monitor / chip icon
      return (
        <g transform={`translate(${x},${y})`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
          <rect x={s * 0.15} y={s * 0.15} width={s * 0.7} height={s * 0.5} rx={s * 0.05} fill={color} fillOpacity={0.15} />
          <line x1={s * 0.4} y1={s * 0.65} x2={s * 0.35} y2={s * 0.8} />
          <line x1={s * 0.6} y1={s * 0.65} x2={s * 0.65} y2={s * 0.8} />
          <line x1={s * 0.25} y1={s * 0.8} x2={s * 0.75} y2={s * 0.8} />
        </g>
      );
    case "gaming":
      // Gamepad icon
      return (
        <g transform={`translate(${x},${y})`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
          <rect x={s * 0.15} y={s * 0.3} width={s * 0.7} height={s * 0.4} rx={s * 0.15} fill={color} fillOpacity={0.15} />
          <line x1={s * 0.3} y1={s * 0.4} x2={s * 0.3} y2={s * 0.6} />
          <line x1={s * 0.2} y1={s * 0.5} x2={s * 0.4} y2={s * 0.5} />
          <circle cx={s * 0.65} cy={s * 0.45} r={s * 0.04} fill={color} />
          <circle cx={s * 0.75} cy={s * 0.55} r={s * 0.04} fill={color} />
        </g>
      );
    default:
      return (
        <text x={cx} y={cy - size * 0.15} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={size * 0.35} fontWeight="bold" style={{ pointerEvents: "none" }}>
          ?
        </text>
      );
  }
}

export function HexTile({ hex, cx, cy, size, isOwn, isAttackable, isSelected, onClick }: HexTileProps) {
  const points = useMemo(() => {
    const corners = hexCorners(cx, cy, size);
    return cornersToPointsString(corners);
  }, [cx, cy, size]);

  const categoryColor = TC_CATEGORY_COLORS[hex.category] || "#6b7280";
  const fillColor = hex.ownerId
    ? hex.ownerColor || "#4b5563"
    : categoryColor + "33"; // transparent category tint for neutral

  const strokeColor = isSelected
    ? "#ffffff"
    : isAttackable
      ? "#fbbf24"
      : isOwn
        ? "#ffffff44"
        : "#3b3b54";

  const strokeWidth = isSelected ? 3 : isAttackable ? 2.5 : 1;
  const cursor = isAttackable ? "pointer" : "default";
  const opacity = hex.ownerId ? 0.85 : 0.5;

  return (
    <g
      onClick={isAttackable ? onClick : undefined}
      style={{ cursor }}
    >
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        className={isAttackable ? "hover:opacity-100 transition-opacity" : ""}
      />
      {/* Category icon */}
      <CategoryIcon
        category={hex.category}
        cx={cx}
        cy={cy}
        size={size}
        color={hex.ownerId ? "#ffffffcc" : categoryColor}
      />
      {/* Owner name */}
      {hex.ownerUsername && (
        <text
          x={cx}
          y={cy + size * 0.3}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffffaa"
          fontSize={size * 0.2}
          style={{ pointerEvents: "none" }}
        >
          {hex.ownerUsername.length > 6 ? hex.ownerUsername.slice(0, 5) + ".." : hex.ownerUsername}
        </text>
      )}
      {/* Attackable indicator - pulsing ring */}
      {isAttackable && (
        <polygon
          points={points}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={1.5}
          opacity={0.6}
          className="animate-pulse"
        />
      )}
    </g>
  );
}
