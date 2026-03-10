import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Product } from "@minigames/shared";

interface ProductCardProps {
  product: Product;
  side: "A" | "B";
  onSelect: (side: "A" | "B") => void;
  disabled: boolean;
  revealPrice?: number;
  isWinner?: boolean;
}

export function ProductCard({
  product,
  side,
  onSelect,
  disabled,
  revealPrice,
  isWinner,
}: ProductCardProps) {
  const priceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (revealPrice !== undefined && priceRef.current) {
      gsap.fromTo(
        priceRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, [revealPrice]);

  return (
    <button
      onClick={() => onSelect(side)}
      disabled={disabled}
      className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-200 border-2 w-full
        ${disabled ? "cursor-not-allowed" : "hover:scale-105 cursor-pointer"}
        ${isWinner === true ? "border-green-500 shadow-green-500/30 shadow-xl" : ""}
        ${isWinner === false ? "border-red-500/40 opacity-60" : ""}
        ${isWinner === undefined ? "border-surface-border hover:border-primary" : ""}
      `}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="bg-surface-elevated p-4 flex-1 flex flex-col gap-1">
        <span className="text-xs text-gray-400 uppercase">{product.category}</span>
        <span className="font-semibold text-sm">{product.name}</span>
        {revealPrice !== undefined && (
          <div ref={priceRef} className="mt-2 text-xl font-bold text-amber-400">
            ${revealPrice.toLocaleString()}
          </div>
        )}
      </div>
    </button>
  );
}
