import React, { useState, useEffect } from "react";
import { Button } from "../common/Button";

interface RevengePopupProps {
  revengeHexId: string | null;
  cooldownEndsAt: string | null;
  onAccept: () => void;
  onDecline: () => void;
}

export function RevengePopup({ revengeHexId, cooldownEndsAt, onAccept, onDecline }: RevengePopupProps) {
  const [cooldownLeft, setCooldownLeft] = useState("");

  useEffect(() => {
    if (!cooldownEndsAt) return;

    const update = () => {
      const diff = new Date(cooldownEndsAt).getTime() - Date.now();
      if (diff <= 0) {
        setCooldownLeft("Ready!");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCooldownLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndsAt]);

  if (!revengeHexId && !cooldownEndsAt) return null;

  // Cooldown screen
  if (cooldownEndsAt) {
    const isReady = cooldownLeft === "Ready!";
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-surface-elevated rounded-xl p-4 border border-surface-border shadow-lg max-w-xs">
        <div className="text-sm text-gray-400 mb-1">Cooldown</div>
        <div className={`text-xl font-bold font-mono ${isReady ? "text-green-400" : "text-yellow-400"}`}>
          {cooldownLeft}
        </div>
        {isReady && (
          <div className="text-xs text-gray-500 mt-1">You can attack again!</div>
        )}
      </div>
    );
  }

  // Revenge offer
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
        <h3 className="text-2xl font-bold text-red-400">Eliminated!</h3>
        <p className="text-gray-400">
          You lost all your territories. Want to fight for revenge?
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onAccept}>Revenge!</Button>
          <Button variant="ghost" onClick={onDecline}>Decline</Button>
        </div>
        <p className="text-xs text-gray-500">
          Declining will put you on a 6 minute cooldown before you can attack again.
        </p>
      </div>
    </div>
  );
}
