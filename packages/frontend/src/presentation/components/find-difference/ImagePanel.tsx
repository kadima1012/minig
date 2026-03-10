import React, { useRef } from "react";
import { gsap } from "gsap";

interface Marker {
  x: number;
  y: number;
  id: string;
}

interface ImagePanelProps {
  imageUrl: string;
  label: string;
  markers: Marker[];
  onImageClick: (xPercent: number, yPercent: number) => void;
  disabled: boolean;
}

export function ImagePanel({ imageUrl, label, markers, onImageClick, disabled }: ImagePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    onImageClick(xPercent, yPercent);
  };

  const handleMarkerMount = (el: HTMLDivElement | null) => {
    if (el) {
      gsap.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-center text-sm text-gray-400 font-medium">{label}</span>
      <div
        ref={containerRef}
        className={`relative rounded-xl overflow-hidden cursor-crosshair select-none ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        onClick={handleClick}
      >
        <img
          src={imageUrl}
          alt={label}
          className="w-full block"
          draggable={false}
        />
        {markers.map((m) => (
          <div
            key={m.id}
            ref={handleMarkerMount}
            className="absolute w-10 h-10 rounded-full border-4 border-yellow-400 bg-yellow-400/20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          />
        ))}
      </div>
    </div>
  );
}
