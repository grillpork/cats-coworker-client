"use client";

import React from "react";

export default function Sidebar({
  levels = [],
  currentLevelIdx,
  onSelectLevel,
  levelStatus = {},
}) {
  return (
    <aside className="w-full md:w-60 bg-[#17181a] border-r border-zinc-800 p-6 flex flex-col gap-4">
      <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
        all level
      </div>
      <div className="flex flex-col gap-2">
        {levels.map((level, idx) => {
          const isCurrent = idx === currentLevelIdx;
          const status = levelStatus[level.id] || "idle";
          return (
            <button
              key={level.id}
              onClick={() => onSelectLevel(idx)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded text-sm  transition-all ${isCurrent
                  ? "bg-[#2d2f34] text-white border-l-4 border-emerald-500"
                  : "bg-[#202124] text-zinc-400 hover:bg-[#25262a]"
                }`}
            >
              <span>LV {level.id}</span>
              {status === "pass" && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                  pass
                </span>
              )}
              {status === "fail" && (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold uppercase">
                  fail
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
