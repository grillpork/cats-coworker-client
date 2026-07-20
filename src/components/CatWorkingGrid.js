"use client";

import React from "react";

const rarityToImage = {
  COMMON: '/cats/cat-common.png',
  RARE: '/cats/cat-rare.png',
  EPIC: '/cats/cat-epic.png',
  LEGENDARY: '/cats/cat-legendary.png',
  MYTHIC: '/cats/cat-mythic.png',
  DIVINE: '/cats/cat-divine.png'
};
const getCatImage = (cat) => cat?.image || rarityToImage[cat?.rarity] || '/cats/cat-common.png';

const getAuraClass = (rarity) => {
  switch (rarity) {
    case 'COMMON': return 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-pulse';
    case 'RARE': return 'drop-shadow-[0_0_10px_rgba(96,165,250,0.6)] animate-pulse';
    case 'EPIC': return 'drop-shadow-[0_0_15px_rgba(34,211,238,0.7)] animate-pulse';
    case 'LEGENDARY': return 'drop-shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-[pulse_1s_ease-in-out_infinite]';
    case 'MYTHIC': return 'drop-shadow-[0_0_25px_rgba(236,72,153,0.9)] animate-[pulse_0.8s_ease-in-out_infinite]';
    case 'DIVINE': return 'drop-shadow-[0_0_30px_rgba(168,85,247,1)] animate-[pulse_0.5s_ease-in-out_infinite]';
    default: return 'drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]';
  }
};

// Exporting SVG in case it's used elsewhere as a placeholder
export function CatComputerSVG({ color = "#4ade80", type = "standard" }) {
  const catColor = color;
  const computerColor = "#94a3b8";

  return (
    <svg className="w-20 h-16" viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wooden Desk Surface */}
      <rect x="4" y="38" width="72" height="6" fill="#854d0e" rx="1.5" stroke="#451a03" strokeWidth="1" />
      {/* Desk Legs */}
      <rect x="10" y="44" width="4" height="10" fill="#451a03" />
      <rect x="66" y="44" width="4" height="10" fill="#451a03" />

      {/* Retro Computer Monitor */}
      <rect x="44" y="10" width="24" height="18" rx="2" fill={computerColor} stroke="#334155" strokeWidth="2" />
      <rect x="47" y="13" width="18" height="12" fill="#1e293b" />
      {/* Screen contents (code lines) */}
      <line x1="49" y1="16" x2="57" y2="16" stroke="#34d399" strokeWidth="1.2" />
      <line x1="49" y1="19" x2="61" y2="19" stroke="#34d399" strokeWidth="1.2" />
      <line x1="49" y1="22" x2="54" y2="22" stroke="#34d399" strokeWidth="1.2" />
      
      {/* Computer Stand */}
      <rect x="54" y="28" width="4" height="6" fill="#64748b" />
      <rect x="50" y="34" width="12" height="4" fill="#475569" />

      {/* Stool/Chair for the cat */}
      <rect x="14" y="18" width="3" height="14" fill="#334155" rx="1" />
      <rect x="12" y="32" width="18" height="3" fill="#475569" rx="1" />
      <line x1="20" y1="35" x2="20" y2="44" stroke="#334155" strokeWidth="2" />
      
      {/* Cat body */}
      <rect x="16" y="24" width="16" height="12" rx="3" fill={catColor} />
      {/* Cat Head */}
      <rect x="22" y="16" width="10" height="9" rx="2.5" fill={catColor} />
      {/* Cat Ears */}
      <polygon points="22,16 25,11 27,16" fill={catColor} />
      <polygon points="29,16 32,11 32,16" fill={catColor} />
      {/* Cat Eyes */}
      <circle cx="25" cy="20" r="1" fill="#000000" />
      <circle cx="29" cy="20" r="1" fill="#000000" />
      {/* Nose */}
      <polygon points="27,21.5 26,22.5 28,22.5" fill="#fda4af" />
    </svg>
  );
}

export default function CatWorkingGrid({
  slots = [],
  accumulatedSp = [0, 0, 0, 0, 0, 0],
  spPoints = 0,
  myAssignedSlotIndex = 0,
  otherPlayers = {},
  user,
  onSlotClick,
  onHarvestSP,
  onUpgradeSlot,
  onMoveSlot,
  onDeployToSlot,
  cipherText = "L-L-H-O-E",
  subText = "X - Y",
}) {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* 6 Pre-allocated Plot Areas Grid (3 columns x 2 rows matching mockup) */}
      <div className="grid grid-cols-3 gap-6 max-w-2xl w-full mt-2">
        {Array.from({ length: 6 }).map((_, idx) => {
          const cat = slots[idx];
          const isSelf = idx === myAssignedSlotIndex;
          
          let ownerName = "สำรอง (Free)";
          let isOccupied = false;

          if (isSelf) {
            ownerName = user?.username || user?.email?.split('@')[0] || "คุณ";
            isOccupied = true;
          } else {
            const playerInSlot = Object.values(otherPlayers).find(p => p.slotIndex === idx);
            if (playerInSlot) {
              ownerName = playerInSlot.username;
              isOccupied = true;
            }
          }

          const handleProtectedClick = () => {
            if (!isSelf) {
              alert(`⛔ นี่คือพื้นที่ของเพื่อน (${ownerName}) ไม่สามารถยุ่งกับแมวหรือพื้นที่ของผู้อื่นได้!`);
              return;
            }
            if (onSlotClick) onSlotClick(idx);
          };

          return (
            <div
              key={idx}
              className={`relative p-2.5 rounded-2xl border-4 transition-all flex flex-col items-center justify-between ${
                isSelf
                  ? "border-emerald-500/80 bg-emerald-950/30 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                  : isOccupied
                  ? "border-blue-500/70 bg-blue-950/25 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                  : "border-[#8B5A2B]/80 bg-[#3a2818]/40 shadow-inner"
              }`}
            >
              {/* Plot Owner Badge Header */}
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider mb-1.5 flex items-center gap-1 border shadow-md ${
                isSelf
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60"
                  : isOccupied
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/60"
                  : "bg-zinc-900/80 text-zinc-400 border-zinc-700/60"
              }`}>
                <span>{isSelf ? "🟢" : isOccupied ? "🔵" : "⚪"}</span>
                <span>Plot {idx + 1}: <strong>{ownerName}</strong></span>
                {isSelf && <span className="text-[7px] text-emerald-400 font-extrabold">(คุณ)</span>}
              </div>

              {/* Working Slot / Desk */}
              <div
                onClick={handleProtectedClick}
                draggable={cat && isSelf ? "true" : "false"}
                onDragStart={(e) => {
                  if (!isSelf) {
                    e.preventDefault();
                    return;
                  }
                  e.dataTransfer.setData("sourceSlotIdx", idx.toString());
                }}
                onDragOver={(e) => {
                  if (isSelf) e.preventDefault();
                }}
                onDrop={(e) => {
                  if (!isSelf) {
                    alert(`⛔ นี่คือพื้นที่ของเพื่อน (${ownerName}) ไม่สามารถวางแมวในพื้นที่ผู้อื่นได้!`);
                    return;
                  }
                  e.preventDefault();
                  const sourceSlotStr = e.dataTransfer.getData("sourceSlotIdx");
                  const sourceInvStr = e.dataTransfer.getData("sourceInvIdx");
                  if (sourceSlotStr) {
                    const srcIdx = parseInt(sourceSlotStr, 10);
                    if (srcIdx !== idx && onMoveSlot) {
                      onMoveSlot(srcIdx, idx);
                    }
                  } else if (sourceInvStr) {
                    const invIdx = parseInt(sourceInvStr, 10);
                    if (onDeployToSlot) {
                      onDeployToSlot(invIdx, idx);
                    }
                  }
                }}
                className={`w-full h-32 flex flex-col items-center justify-center relative p-1.5 rounded-xl border border-dashed transition-all ${
                  isSelf
                    ? "cursor-pointer hover:border-emerald-400/50 border-emerald-500/20"
                    : "cursor-not-allowed border-zinc-800/40 opacity-90"
                }`}
              >
                {cat ? (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                        {cat.rarity}
                      </span>
                      <span className={`text-[9px] font-mono font-semibold ${
                        cat.type === "diamond" ? "text-blue-400" : "text-emerald-400"
                      }`}>
                        {cat.type}
                      </span>
                    </div>
                    
                    {/* Cat & Computer Sprite */}
                    <div className="flex items-end justify-center my-1 z-10">
                      <img 
                        src={getCatImage(cat)} 
                        alt={cat.name} 
                        className={`w-12 h-12 object-contain z-20 ${getAuraClass(cat.rarity)}`}
                      />
                      <img 
                        src="/computer.png" 
                        alt="computer" 
                        className="w-11 h-11 object-contain z-10 -ml-3"
                      />
                    </div>

                    <span className="text-[9px] font-mono text-zinc-400 mt-auto">
                      {cat.spRate} SP/s (LV.{cat.level || 1})
                    </span>

                    {/* Harvest Bubble & Level Up Button side-by-side */}
                    <div className="flex items-center gap-1.5 mt-1 z-20">
                      {/* Accumulated SP Harvest Bubble */}
                      <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold select-none transition-all ${
                        (accumulatedSp[idx] || 0) > 0
                          ? isSelf
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                            : "bg-zinc-800/60 text-zinc-400 border border-zinc-700/40"
                          : "bg-zinc-800/40 text-zinc-600 border border-zinc-800/30"
                      }`}>
                        💰 {accumulatedSp[idx] || 0}
                      </div>

                      {/* Level Up Button */}
                      {isSelf && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent recalling cat
                            const cost = (cat.level || 1) * 100;
                            if (onUpgradeSlot && spPoints >= cost) {
                              onUpgradeSlot(idx);
                            }
                          }}
                          disabled={spPoints < (cat.level || 1) * 100}
                          className="px-1.5 py-0.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-650 text-zinc-950 hover:text-zinc-900 border border-yellow-400/40 disabled:border-transparent rounded text-[7px] font-black tracking-wide transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                          title={`Upgrade Level for ${(cat.level || 1) * 100} SP`}
                        >
                          LV+ ({(cat.level || 1) * 100})
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-55 hover:opacity-100 transition-opacity">
                    {/* Empty desk display representation */}
                    <svg className="w-14 h-10" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="28" width="56" height="4" fill="#a16207" rx="1" />
                      <rect x="8" y="32" width="3" height="8" fill="#78350f" />
                      <rect x="53" y="32" width="3" height="8" fill="#78350f" />
                    </svg>
                    <span className="text-[8px] font-mono text-zinc-400 italic">
                      {isSelf ? "โต๊ะว่างของคุณ (กด E เพื่อวางแมว)" : `โต๊ะว่างของ ${ownerName}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
