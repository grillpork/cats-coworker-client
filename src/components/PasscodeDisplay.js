"use client";

import React from "react";

export default function PasscodeDisplay({
  currentLevel,
  currentOutput = [],
  timeLeft,
  formatTime,
}) {
  return (
    <div className="flex flex-col items-center justify-start py-2 gap-8 text-center">
      {/* Countdown Timer and Level Header */}
      <div className="text-center space-y-2">
        <div className={`text-xs  font-bold tracking-widest px-3 py-1 rounded inline-block bg-black/35 border ${timeLeft < 30 ? "text-rose-500 border-rose-500/30 animate-pulse" : "text-amber-500 border-amber-500/20"
          }`}>
          ⏱ COUNTDOWN: {formatTime(timeLeft)}
        </div>
        <h2 className="text-2xl font-bold tracking-widest text-zinc-200">
          LV {currentLevel?.id}
        </h2>
        <p className="text-xs text-zinc-500 max-w-lg  leading-relaxed">
          {currentLevel?.description}
        </p>
      </div>

      {/* 6 password rendering boxes */}
      <div className="flex flex-col items-center gap-4">
        {/* Value Indicators */}
        <div className="flex gap-6 justify-center">
          {currentOutput.map((char, index) => (
            <div key={index} className="w-12 text-center  text-xl font-bold text-emerald-400 tracking-wider">
              {char || "-"}
            </div>
          ))}
        </div>

        {/* Visual Passcode Boxes */}
        <div className="flex gap-6 justify-center">
          {Array.from({ length: 6 }).map((_, index) => {
            const char = currentOutput[index] || "";
            const isCorrect = currentLevel && char !== "" && char === currentLevel.testCases[0]?.expected[index];
            return (
              <div
                key={index}
                className={`w-12 h-16 rounded-md bg-[#2a2c31] border transition-all duration-300 flex items-center justify-center text-2xl  font-bold ${char === ""
                    ? "border-zinc-800 shadow-inner"
                    : isCorrect
                      ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] text-emerald-400"
                      : "border-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] text-rose-400"
                  }`}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
