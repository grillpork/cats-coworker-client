"use client";

import React, { useState, useEffect, useRef } from "react";
import CatWorkingGrid from "./CatWorkingGrid";

const TILE_ASSETS = [
  { id: "00", name: "Empty (Solid)", src: null },
  { id: "01", name: "Floor 1", src: "/map-box/map-box-01.png" },
  { id: "02", name: "Floor 2", src: "/map-box/map-box-02.png" },
  { id: "03", name: "Floor 3", src: "/map-box/map-box-03.png" },
  { id: "04", name: "Floor 4", src: "/map-box/map-box-04.png" },
  { id: "05", name: "Wall Top", src: "/map-box/map-box-05.png" },
  { id: "06", name: "Wall Bottom", src: "/map-box/map-box-06.png" },
  { id: "07", name: "Wall Left", src: "/map-box/map-box-07.png" },
  { id: "08", name: "Wall Right", src: "/map-box/map-box-08.png" },
  { id: "09", name: "Corner Top-Left", src: "/map-box/map-box-09.png" },
  { id: "10", name: "Corner Top-Right", src: "/map-box/map-box-10.png" },
  { id: "11", name: "Corner Bottom-Left", src: "/map-box/map-box-11.png" },
  { id: "12", name: "Corner Bottom-Right", src: "/map-box/map-box-12.png" },
  { id: "13", name: "Decor 1", src: "/map-box/map-box-13.png" },
  { id: "14", name: "Decor 2", src: "/map-box/map-box-14.png" },
  { id: "15", name: "Decor 3", src: "/map-box/map-box-15.png" },
  { id: "16", name: "Decor 4", src: "/map-box/map-box-16.png" },
];

// Cute pixel player avatar SVG
// Removed PlayerSVG in favor of image

const Particle = ({ startX, startY, destX, destY }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Trigger animation next frame
    const timer = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className="absolute text-emerald-400 font-black text-xl z-50 pointer-events-none drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
      style={{
        left: active ? destX : startX,
        top: active ? destY : startY,
        opacity: active ? 0 : 1,
        transform: `scale(${active ? 1.5 : 0.5}) translate(-50%, -50%)`,
        transition: "all 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
      }}
    >
      SP
    </div>
  );
};

const playCoinSound = () => {
  if (typeof window === "undefined") return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    // Pitch goes up (B5 to E6) like a classic coin sound
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.1); 
    
    // Quick attack, exponential release
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio context errors if browser blocks autoplay
  }
};

export default function ServerRoomMap({
  deployedCats = [],
  accumulatedSp = [0, 0, 0, 0, 0, 0],
  spPoints = 0,
  isDayShift = false,
  onHarvestSP,
  onUpgradeSlot,
  onMoveSlot,
  onDeployToSlot,
  onSlotClick,
  cipherText,
  subText,
  heldCat,
  onPlaceCat,
  onPickupCat,
}) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [zoom, setZoom] = useState(1.0);
  const playerSize = 48;
  const coinSize = 24;

  const mapRef = useRef(null);

  // Custom Map State loaded from local storage
  const [customMap, setCustomMap] = useState(null);

  // Player position state (centered initially)
  const [playerPos, setPlayerPos] = useState({ x: 600, y: 400 });
  // Manage keys pressed to support diagonal movement
  const keysPressed = useRef({});

  // Load custom map on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("customMapData");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.rows && parsed.cols && Array.isArray(parsed.tiles)) {
            setCustomMap(parsed);
            // Center character in custom map
            setPlayerPos({
              x: (parsed.cols * 48) / 2,
              y: (parsed.rows * 48) / 2,
            });
          }
        } catch (e) {
          console.error("Failed to load custom map:", e);
        }
      }
    }
  }, []);

  // Initialize and handle window resizing
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize(); // run once initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle mouse scroll wheel zoom
  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const handleWheel = (e) => {
      e.preventDefault();
      setZoom((prev) => {
        const nextZoom = prev - e.deltaY * 0.0015;
        return Math.max(0.5, Math.min(2.5, nextZoom));
      });
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, []);

  // Keyboard Event Listeners for movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault(); // prevent scroll
      }
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Physics/movement loop (60fps-ish)
    const interval = setInterval(() => {
      setPlayerPos((prev) => {
        let dx = 0;
        let dy = 0;
        const step = 6; // step size
        const wallSize = 48;

        if (keysPressed.current["ArrowUp"] || keysPressed.current["w"]) dy -= step;
        if (keysPressed.current["ArrowDown"] || keysPressed.current["s"]) dy += step;
        if (keysPressed.current["ArrowLeft"] || keysPressed.current["a"]) dx -= step;
        if (keysPressed.current["ArrowRight"] || keysPressed.current["d"]) dx += step;

        const minX = wallSize;
        const maxX = (customMap ? customMap.cols * 48 : dimensions.width) - wallSize - playerSize;
        const minY = wallSize;
        const maxY = (customMap ? customMap.rows * 48 : dimensions.height) - wallSize - playerSize;

        const nextX = Math.max(minX, Math.min(maxX, prev.x + dx));
        const nextY = Math.max(minY, Math.min(maxY, prev.y + dy));

        return { x: nextX, y: nextY };
      });
    }, 16);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(interval);
    };
  }, [dimensions, customMap]);

  // Handle 'E' key press to place or pickup/swap held cat
  useEffect(() => {
    const handlePlaceKeyPress = (e) => {
      if (e.key.toLowerCase() === 'e') {
        // Find closest slot
        let closestSlotIdx = -1;
        let minDistance = Infinity;

        const playerCenterX = playerPos.x + playerSize / 2;
        const playerCenterY = playerPos.y + playerSize / 2;

        for (let i = 0; i < 6; i++) {
          const center = getDeskCenter(i);
          const dist = Math.hypot(playerCenterX - center.x, playerCenterY - center.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestSlotIdx = i;
          }
        }

        // 80px radius for interaction.
        if (minDistance < 80 && closestSlotIdx !== -1) {
          const hasCat = !!deployedCats[closestSlotIdx];
          if (hasCat && onPickupCat) {
            onPickupCat(closestSlotIdx);
          } else if (!hasCat && heldCat && onPlaceCat) {
            onPlaceCat(closestSlotIdx);
          }
        }
      }
    };

    window.addEventListener("keydown", handlePlaceKeyPress);
    return () => window.removeEventListener("keydown", handlePlaceKeyPress);
  }, [heldCat, playerPos, deployedCats, onPlaceCat, onPickupCat]);

  const mapW = customMap ? customMap.cols * 48 : dimensions.width;
  const mapH = customMap ? customMap.rows * 48 : dimensions.height;
  const offsetX = customMap ? Math.max(0, (dimensions.width - mapW) / 2) : 0;
  const offsetY = customMap ? Math.max(0, (dimensions.height - mapH) / 2) : 0;

  // Helper to compute center coordinates of each desk slot on the map canvas
  const getDeskCenter = (idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const colWidth = 500 / 3;
    const rowHeight = 112;
    const gridTopOffset = 80;
    const x = (mapW / 2 - 250) + col * colWidth + (colWidth / 2);
    const y = (mapH / 2 - 150) + gridTopOffset + row * rowHeight + (rowHeight / 2);
    return { x, y };
  };

  const [particles, setParticles] = useState([]);

  // Cleanup old particles
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles(prev => prev.filter(p => Date.now() - p.timestamp < 1000));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  // Monitor player proximity to each desk to harvest accumulated SP
  useEffect(() => {
    const playerCenterX = playerPos.x + playerSize / 2;
    const playerCenterY = playerPos.y + playerSize / 2;

    for (let i = 0; i < 6; i++) {
      if (accumulatedSp[i] > 0) {
        const center = getDeskCenter(i);
        const dist = Math.sqrt(
          Math.pow(playerCenterX - center.x, 2) + Math.pow(playerCenterY - center.y, 2)
        );
        // Harvest if player is within range (e.g. 85px) of the desk center
        if (dist < 85) {
          onHarvestSP(i, accumulatedSp[i]);
          playCoinSound();
          
          // Spawn scattering particles
          const newParticles = Array.from({ length: 4 }).map(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 50;
            return {
              id: Math.random().toString(36).substr(2, 9),
              startX: center.x,
              startY: center.y,
              destX: center.x + Math.cos(angle) * distance,
              destY: center.y + Math.sin(angle) * distance - 20, // Slight upward bias
              timestamp: Date.now(),
            };
          });
          setParticles(prev => [...prev, ...newParticles]);
        }
      }
    }
  }, [playerPos, accumulatedSp, dimensions]);

  return (
    <div 
      ref={mapRef} 
      className={`fixed inset-0 w-screen h-screen z-10 overflow-hidden select-none transition-colors duration-500 ${
        isDayShift ? "bg-[#25262a]" : "bg-[#161719]"
      }`}
    >
      {/* Zoomable Game Canvas */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: `${playerPos.x + offsetX}px ${playerPos.y + offsetY}px`,
          transition: "transform 0.05s ease-out",
        }}
      >
        {/* Centered Map Container Wrapper */}
        <div
          className="absolute"
          style={{
            left: `${offsetX}px`,
            top: `${offsetY}px`,
            width: `${mapW}px`,
            height: `${mapH}px`,
          }}
        >
          {/* Render Tiled Floor and Wall Grid */}
          <div className="absolute inset-0 z-0">
            {(() => {
              const tileSize = 48;
              const mapCols = customMap ? customMap.cols : Math.ceil(dimensions.width / tileSize);
              const mapRows = customMap ? customMap.rows : Math.ceil(dimensions.height / tileSize);
              const tiles = [];
              
              for (let r = 0; r < mapRows; r++) {
                for (let c = 0; c < mapCols; c++) {
                  let imgSrc = "";
                  if (customMap) {
                    const tileId = customMap.tiles[r]?.[c] || "00";
                    const asset = TILE_ASSETS.find(t => t.id === tileId);
                    imgSrc = asset ? asset.src : null;
                  } else {
                    // Corners
                    if (r === 0 && c === 0) {
                      imgSrc = "/map-box/map-box-09.png";
                    } else if (r === 0 && c === mapCols - 1) {
                      imgSrc = "/map-box/map-box-10.png";
                    } else if (r === mapRows - 1 && c === 0) {
                      imgSrc = "/map-box/map-box-11.png";
                    } else if (r === mapRows - 1 && c === mapCols - 1) {
                      imgSrc = "/map-box/map-box-12.png";
                    }
                    // Wall edges
                    else if (r === 0) {
                      imgSrc = "/map-box/map-box-05.png";
                    } else if (r === mapRows - 1) {
                      imgSrc = "/map-box/map-box-06.png";
                    } else if (c === 0) {
                      imgSrc = "/map-box/map-box-07.png";
                    } else if (c === mapCols - 1) {
                      imgSrc = "/map-box/map-box-08.png";
                    }
                    // Floors
                    else {
                      const seed = (r * 7 + c * 13) % 4;
                      const floorNum = String(seed + 1).padStart(2, '0');
                      imgSrc = `/map-box/map-box-${floorNum}.png`;
                    }
                  }

                  tiles.push(
                    <div
                      key={`${r}-${c}`}
                      className="absolute select-none pointer-events-none"
                      style={{
                        left: c * tileSize,
                        top: r * tileSize,
                        width: tileSize,
                        height: tileSize,
                      }}
                    >
                      {imgSrc ? (
                        <img src={imgSrc} alt="tile" className="w-full h-full object-cover opacity-90" />
                      ) : (
                        <div className="w-full h-full bg-[#151619]" />
                      )}
                    </div>
                  );
                }
              }
              return tiles;
            })()}
          </div>
          
          {/* Ambient Room Lighting */}
          {isDayShift ? (
            <>
              <div className="absolute top-10 left-10 w-[700px] h-[700px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none transition-all duration-500" />
              <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-500" />
            </>
          ) : (
            <>
              <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-500" />
              <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none transition-all duration-500" />
            </>
          )}

          {/* Render SP Particles */}
          {particles.map(p => (
            <Particle 
              key={p.id}
              startX={p.startX}
              startY={p.startY}
              destX={p.destX}
              destY={p.destY}
            />
          ))}

          {/* Stationary Server Work Desks Grid (Placed on map floor, z-5) */}
          <div 
            className="absolute z-5"
            style={{
              left: `${mapW / 2 - 250}px`,
              top: `${mapH / 2 - 150}px`,
              width: "500px",
            }}
          >
            <CatWorkingGrid
              slots={deployedCats}
              accumulatedSp={accumulatedSp}
              spPoints={spPoints}
              onSlotClick={onSlotClick}
              onUpgradeSlot={onUpgradeSlot}
              onMoveSlot={onMoveSlot}
              onDeployToSlot={onDeployToSlot}
              cipherText={cipherText}
              subText={subText}
            />
          </div>

          {/* Player Character */}
          {(() => {
            const playerCenterX = playerPos.x + playerSize / 2;
            const playerCenterY = playerPos.y + playerSize / 2;
            let nearSlotIdx = -1;
            let minDistance = Infinity;
            for (let i = 0; i < 6; i++) {
              const center = getDeskCenter(i);
              const dist = Math.hypot(playerCenterX - center.x, playerCenterY - center.y);
              if (dist < 80 && dist < minDistance) {
                minDistance = dist;
                nearSlotIdx = i;
              }
            }

            return (
              <div
                className="absolute transition-all duration-75 ease-out select-none z-10 flex flex-col items-center"
                style={{
                  left: playerPos.x,
                  top: playerPos.y - (heldCat ? 30 : 0),
                  width: playerSize,
                  height: playerSize + (heldCat ? 30 : 0),
                }}
              >
                {heldCat ? (
                  <div className="absolute -top-16 flex flex-col items-center animate-bounce">
                    <span className="text-[8px] bg-black/80 text-white px-2 py-0.5 rounded-full mb-0.5 whitespace-nowrap border border-zinc-700 font-mono drop-shadow-md">
                      Press 'E' to place
                    </span>
                    <img 
                      src={`/cats/cat-${heldCat.rarity.toLowerCase()}.png`} 
                      alt="Held Cat" 
                      className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    />
                  </div>
                ) : (
                  nearSlotIdx !== -1 && deployedCats[nearSlotIdx] && (
                    <div className="absolute -top-8 flex flex-col items-center animate-pulse">
                      <span className="text-[8px] bg-black/80 text-white px-2 py-0.5 rounded-full whitespace-nowrap border border-zinc-700 font-mono drop-shadow-md">
                        Press 'E' to pick up
                      </span>
                    </div>
                  )
                )}
                <img src="/mc-00.png" alt="Main Character" className="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] mt-auto" />
              </div>
            );
          })()}
        </div>
      </div>

      {/* Zoom UI Controller Overlay (z-20) */}
      <div className="absolute top-4 left-4 z-20 bg-[#17181a]/90 backdrop-blur-md border border-zinc-800 rounded-lg p-1.5 flex items-center gap-1.5 shadow-xl font-mono text-[9px]">
        <button
          onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
          className="w-5 h-5 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-white rounded font-bold text-xs"
          title="Zoom Out"
        >
          -
        </button>
        <span className="text-zinc-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.1))}
          className="w-5 h-5 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-white rounded font-bold text-xs"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoom(1.0)}
          className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-400 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
