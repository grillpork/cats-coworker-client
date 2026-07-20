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
    case 'COMMON': return 'drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] animate-pulse';
    case 'RARE': return 'drop-shadow-[0_0_6px_rgba(96,165,250,0.6)] animate-pulse';
    case 'EPIC': return 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] animate-pulse';
    case 'LEGENDARY': return 'drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-[pulse_1s_ease-in-out_infinite]';
    case 'MYTHIC': return 'drop-shadow-[0_0_12px_rgba(236,72,153,0.9)] animate-[pulse_0.8s_ease-in-out_infinite]';
    case 'DIVINE': return 'drop-shadow-[0_0_15px_rgba(168,85,247,1)] animate-[pulse_0.5s_ease-in-out_infinite]';
    default: return 'drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]';
  }
};

export default function InventoryPanel({
  inventory = [],
  spPoints = 0,
  onSelectCat,
  onUpgradeCat,
}) {
  return (
    <div className="w-full max-w-4xl bg-[#202124]/40 border border-zinc-800/80 rounded-lg p-2.5 font-mono text-xs flex flex-col gap-2 mx-auto">
      {inventory.length === 0 ? (
        <div className="text-zinc-600 italic py-2 text-center text-[10px]">
          No cats in inventory. Solve decryption to summon cats!
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2.5 overflow-y-auto max-h-[400px] w-full p-1">
          {inventory.map((cat, idx) => {
            const level = cat.level || 1;
            const upgradeCost = level * 100;
            // Calculate dynamic SP rate: base SP rate + (level - 1) * 2
            const currentSpRate = cat.spRate + (level - 1) * 2;

            return (
              <div
                key={cat.id || idx}
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.setData("sourceInvIdx", idx.toString());
                }}
                className="bg-[#2a2c31]/90 border border-zinc-800 hover:border-rose-500/80 rounded-lg p-2 flex flex-col items-center justify-between cursor-pointer w-full aspect-[4/3] relative transition-all active:scale-95 group"
                onClick={() => onSelectCat(idx)}
                title="Drag to Desk or Click to Select"
              >
                <div className="flex items-end justify-center bg-black/30 rounded-full border border-zinc-700/50 w-14 h-14 mt-1">
                  <img 
                    src={getCatImage(cat)} 
                    alt={cat.name} 
                    className={`w-10 h-10 object-contain z-20 mb-1.5 ${getAuraClass(cat.rarity)}`}
                  />
                  <img 
                    src="/computer.png" 
                    alt="computer" 
                    className="w-8 h-8 object-contain z-10 -ml-4 mb-1"
                  />
                </div>
                
                <div className="w-full flex flex-col items-center justify-center mb-1">
                  <div className="text-zinc-300 truncate text-[11px] font-bold w-full text-center">
                    {cat.name}
                  </div>
                  <div className="text-emerald-400 text-[10px] font-semibold">
                    +{currentSpRate} SP/s (LV.{level})
                  </div>
                </div>

                {/* Absolute Top-Right Upgrade Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent deploying
                    if (onUpgradeCat && spPoints >= upgradeCost) {
                      onUpgradeCat(idx);
                    }
                  }}
                  disabled={spPoints < upgradeCost}
                  className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-650 text-zinc-950 rounded text-[8px] font-black transition-colors"
                  title={`Upgrade Level for ${upgradeCost} SP`}
                >
                  LV+ ({upgradeCost})
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
