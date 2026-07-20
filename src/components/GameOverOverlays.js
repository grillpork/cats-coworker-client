"use client";

import React from "react";

export default function GameOverOverlays({
  gameStatus,
  onReset,
}) {
  if (gameStatus === "playing") return null;

  return (
    <>
      {gameStatus === "failed" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center font-mono">
          <div className="text-rose-500 text-3xl font-black mb-2 animate-bounce">🚨 SYSTEM LOCKED DOWN</div>
          <div className="text-zinc-400 text-xs mb-6">THE SELF-DESTRUCTION TIME EXPIRED.</div>
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs tracking-wider transition-all active:scale-95 animate-pulse"
          >
            REBOOT ENGINE
          </button>
        </div>
      )}

      {gameStatus === "completed" && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center font-mono">
          <div className="text-emerald-400 text-3xl font-black mb-2 animate-pulse">🎉 DECRYPTION SUCCESS</div>
          <div className="text-zinc-300 text-xs mb-6">ALL PASSCODES SECURED. DATA RECOVERY COMPLETE.</div>
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-bold text-xs tracking-wider transition-all active:scale-95"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </>
  );
}
