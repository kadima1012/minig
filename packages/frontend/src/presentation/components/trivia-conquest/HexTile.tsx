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

const CATEGORY_ICONS: Record<string, string> = {
  science: "S",
  movies: "M",
  history: "H",
  tech: "T",
  gaming: "G",
};

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
      {/* Category letter */}
      <text
        x={cx}
        y={cy - size * 0.15}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={hex.ownerId ? "#ffffffcc" : categoryColor}
        fontSize={size * 0.35}
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        {CATEGORY_ICONS[hex.category] || "?"}
      </text>
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
