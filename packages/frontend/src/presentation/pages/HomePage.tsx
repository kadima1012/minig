import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { GAMES } from "@minigames/shared";
import { GameCard } from "../components/common/GameCard";

export function HomePage() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll(".game-card"),
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            MiniGames
          </h1>
          <p className="text-gray-400 text-lg">Pick a game and start playing!</p>
        </div>
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}
