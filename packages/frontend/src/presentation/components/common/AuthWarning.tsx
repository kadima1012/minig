import React from "react";
import { Link } from "react-router-dom";

export function AuthWarning() {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-lg text-sm text-center">
      Your score won't be saved.{" "}
      <Link to="/login" className="underline font-medium hover:text-yellow-200">
        Sign in
      </Link>{" "}
      or{" "}
      <Link to="/register" className="underline font-medium hover:text-yellow-200">
        create an account
      </Link>{" "}
      to save scores and appear on the leaderboard.
    </div>
  );
}
