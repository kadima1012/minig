import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { GAMES } from "@minigames/shared";
import { GameCard } from "../components/common/GameCard";
import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { user, logout, loading } = useAuth();

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
        <div className="flex justify-end mb-4">
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm">
                Hello, <span className="font-semibold text-indigo-400">{user.username}</span>
              </span>
              <Link
                to="/account"
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
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
