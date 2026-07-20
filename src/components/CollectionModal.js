import React, { useState } from 'react';

const RARITIES = [
  { id: 'normal', label: 'Normal', color: 'text-gray-300 bg-white/5 hover:bg-white/10' },
  { id: 'golden', label: 'Golden', color: 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' },
  { id: 'diamond', label: 'Diamond', color: 'text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20' },
  { id: 'lava', label: 'Lava', color: 'text-orange-500 bg-orange-500/10 hover:bg-orange-500/20' },
  { id: 'rainbow', label: 'Rainbow', color: 'text-pink-400 bg-gradient-to-r from-pink-500/10 to-yellow-500/10 hover:from-pink-500/20 hover:to-yellow-500/20' },
  { id: 'galaxy', label: 'Galaxy', color: 'text-purple-400 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20' }
];

// Generate 95 mock slots distributed across rarities
const MOCK_COLLECTION = [];
let catId = 0;
RARITIES.forEach((rarity, rIdx) => {
  const counts = { normal: 30, golden: 20, diamond: 15, lava: 15, rainbow: 10, galaxy: 5 };
  const count = counts[rarity.id] || 15;
  const catImages = [
    '/cats/cat-common.png', 
    '/cats/cat-rare.png', 
    '/cats/cat-epic.png', 
    '/cats/cat-legendary.png', 
    '/cats/cat-mythic.png', 
    '/cats/cat-divine.png'
  ];
  const mockNames = ['Tung Tung Sahur', 'Boneca Ambalabu', 'Trippi Troppi', 'Brr Brr Patapim', 'Garamararam', 'Frigo Camelo', 'Tatatata Sahur', 'Balerina Capucina', 'Cappuccino'];
  
  for (let i = 0; i < count; i++) {
    const isFirst = (i === 0);
    MOCK_COLLECTION.push({
      id: catId++,
      rarity: rarity.id,
      rarityLabel: rarity.label,
      name: isFirst ? `${rarity.label} Brainrot` : mockNames[i % mockNames.length],
      discovered: isFirst,
      image: isFirst ? catImages[rIdx % catImages.length] : '/cats/cat-common.png'
    });
  }
});

export default function CollectionModal({ onClose }) {
  const [activeRarity, setActiveRarity] = useState('normal');
  const displayedCats = MOCK_COLLECTION.filter(c => c.rarity === activeRarity);
  const discoveredCount = MOCK_COLLECTION.filter(c => c.discovered).length;
  const totalCount = MOCK_COLLECTION.length;
  const percentage = Math.round((discoveredCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 font-sans">
      {/* Main Modal Container */}
      <div className="w-[750px] max-w-[95vw] max-h-[90vh] bg-[#1a1b1e] rounded-2xl border border-white/10 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.8)] scale-95 origin-center text-white overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#20222a] to-[#2a2d36] border-b border-white/5 p-4 flex justify-between items-center relative flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-md">📘</span>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Collection Index
            </h2>
          </div>
          
          <div className="flex flex-col items-end mr-12">
            <span className="text-xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] leading-none">
              {percentage}%
            </span>
            <span className="text-xs font-medium text-gray-400 mt-1">
              {discoveredCount}/{totalCount} Discovered
            </span>
          </div>

          <button 
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 bg-white/5 hover:bg-red-500/80 border border-white/10 rounded-full flex items-center justify-center transition-all duration-200"
          >
            <span className="text-gray-300 hover:text-white font-medium text-sm">✕</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar */}
          <div className="w-40 bg-[#16171a] border-r border-white/5 p-3 flex flex-col gap-2 overflow-y-auto flex-shrink-0">
            {RARITIES.map(rarity => (
              <button
                key={rarity.id}
                onClick={() => setActiveRarity(rarity.id)}
                className={`w-full py-2.5 px-3 text-left font-semibold text-sm rounded-xl transition-all duration-200 ${rarity.color} ${activeRarity === rarity.id ? 'ring-1 ring-white/20 shadow-lg shadow-black/20' : 'opacity-70 hover:opacity-100'}`}
              >
                {rarity.label}
              </button>
            ))}
          </div>

          {/* Grid Area */}
          <div className="flex-1 bg-[#1a1b1e] p-5 flex flex-col overflow-hidden relative">
            <style>{`
              .modern-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .modern-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .modern-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1); 
                border-radius: 10px;
              }
              .modern-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.2);
              }
            `}</style>
            
            <div className="flex-1 overflow-y-auto modern-scrollbar pr-2 -mr-2">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {displayedCats.map((cat, idx) => (
                  <div key={cat.id} className="h-32 bg-[#23242a] border border-white/5 rounded-xl flex flex-col relative overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-md">
                    
                    {/* Cat Name Top */}
                    <div className="absolute top-1.5 left-0 right-0 text-center z-10 px-2">
                      <span className="text-[9px] font-semibold text-gray-300 leading-tight block truncate group-hover:text-white transition-colors">
                        {cat.name}
                      </span>
                    </div>

                    {/* Cat Image / Silhouette */}
                    <div className="flex-1 flex items-center justify-center p-2 mt-3">
                      {cat.discovered ? (
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden p-1">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-black/40 rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] opacity-50" />
                      )}
                    </div>

                    {/* Bottom Labels */}
                    <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center justify-center z-10">
                      <span className="text-[10px] font-bold text-gray-400">
                        {cat.rarityLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="mt-5 flex flex-col items-center pt-4 border-t border-white/5">
              <div className="text-gray-300 font-medium text-sm mb-3 text-center">
                Collect <span className="text-white font-bold">86 Normal Brainrots</span> to unlock a new Base Skin
              </div>
              <div className="w-full h-4 bg-black/40 rounded-full relative overflow-hidden flex items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${(3 / 86) * 100}%` }} 
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
              <div className="w-full flex justify-between mt-1.5 px-1 text-[10px] text-gray-500 font-semibold">
                <span>0</span>
                <span className="text-emerald-400">3 / 86</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
