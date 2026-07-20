"use client";

import React, { useState, useEffect, useRef } from "react";
import CatWorkingGrid from "./CatWorkingGrid";
import { mapService } from "../services/map.service";



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
  user,
  room,
  selectedMap,
  onRoomCatsSync,
  onCatPlacedRemote,
  onCatRemovedRemote,
  onCatUpgradedRemote,
  wsSendRef,
  myAssignedSlotIndex,
  setMyAssignedSlotIndex,
}) {
  const [dimensions, setDimensions] = useState({ width: 1680, height: 1104 });
  const [zoom, setZoom] = useState(1.0);
  const playerSize = 48;
  const coinSize = 24;

  const mapRef = useRef(null);
  const socketRef = useRef(null);

  // Attach wsSendRef so parent component can emit WS messages
  useEffect(() => {
    if (wsSendRef) {
      wsSendRef.current = (data) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify(data));
        }
      };
    }
  }, [wsSendRef]);

  // Other players online in the same room
  const [otherPlayers, setOtherPlayers] = useState({});

  // Custom Map State loaded from local storage
  const [customMap, setCustomMap] = useState(null);

  // Player position state (centered initially)
  const [playerPos, setPlayerPos] = useState({ x: 600, y: 400 });
  // Manage keys pressed to support diagonal movement
  const keysPressed = useRef({});

  const [tileAssets, setTileAssets] = useState([]);

  // Load custom map layout based on selected room
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const spritesRes = await mapService.getSprites();
        const sprites = spritesRes?.data || spritesRes || [];
        setTileAssets(sprites);

        // Use passed selectedMap from room selection, otherwise fall back to default active map
        const map = selectedMap || (await mapService.getActiveMap());
        const resolvedMap = map?.data || map;
        if (resolvedMap && resolvedMap.rows && resolvedMap.cols && Array.isArray(resolvedMap.tiles)) {
          setCustomMap(resolvedMap);
          // Center character in custom map
          setPlayerPos({
            x: (resolvedMap.cols * 48) / 2 - 24,
            y: (resolvedMap.rows * 48) / 2 - 24,
          });
        }
      } catch (err) {
        console.error("Failed to load active map configuration:", err);
      }
    };
    loadMapData();
  }, [selectedMap]);

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

  // WebSocket connection for real-time multiplayer
  useEffect(() => {
    // Don't connect until user is loaded
    if (!user || !user.id) return;

    let ws;
    try {
      const getWsUrl = () => {
        if (process.env.NEXT_PUBLIC_WS_URL) {
          return process.env.NEXT_PUBLIC_WS_URL;
        }
        if (typeof window !== "undefined") {
          const isHttps = window.location.protocol === "https:";
          const isProd = window.location.hostname === "catako.site";
          if (isProd || isHttps) {
            return "wss://backend-catako.site";
          }
        }
        return "ws://localhost:4000";
      };

      const wsUrl = getWsUrl();
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Server Room Gateway WS:", wsUrl);
        const currentRoomName = room || "Server Room A";
        ws.send(
          JSON.stringify({
            type: "join",
            user: {
              id: user.id,
              username: user.username || user.email?.split("@")[0] || `User-${user.id}`,
            },
            room: currentRoomName,
            x: playerPos.x,
            y: playerPos.y
          })
        );
      };

      ws.onerror = (err) => {
        console.error("WebSocket connection error:", err);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "joined_room") {
            if (data.slotIndex !== undefined) {
              setMyAssignedSlotIndex(data.slotIndex);
            }
            const initial = {};
            (data.players || []).forEach(p => {
              initial[p.id] = p;
            });
            setOtherPlayers(initial);

            if (data.roomCats && onRoomCatsSync) {
              onRoomCatsSync(data.roomCats);
            }
          } else if (data.type === "room_full") {
            alert("❌ " + (data.reason || "ห้องเซิร์ฟเวอร์นี้เต็มแล้ว (จำกัด 6 คน)"));
            window.location.href = "/";
          } else if (data.type === "players_list") {
            const initial = {};
            data.players.forEach(p => {
              initial[p.id] = p;
            });
            setOtherPlayers(initial);
          } else if (data.type === "player_joined") {
            setOtherPlayers(prev => ({
              ...prev,
              [data.player.id]: data.player
            }));
          } else if (data.type === "player_moved") {
            setOtherPlayers(prev => {
              if (!prev[data.id]) return prev;
              return {
                ...prev,
                [data.id]: { ...prev[data.id], x: data.x, y: data.y }
              };
            });
          } else if (data.type === "player_held_cat_updated") {
            setOtherPlayers(prev => {
              if (!prev[data.id]) return prev;
              return {
                ...prev,
                [data.id]: { ...prev[data.id], heldCat: data.heldCat }
              };
            });
          } else if (data.type === "player_left") {
            setOtherPlayers(prev => {
              const next = { ...prev };
              delete next[data.id];
              return next;
            });
          } else if (data.type === "sync_cats") {
            if (data.roomCats && onRoomCatsSync) {
              onRoomCatsSync(data.roomCats);
            }
          } else if (data.type === "cat_placed") {
            if (onCatPlacedRemote) {
              onCatPlacedRemote(data.slotIndex, data.cat);
            }
          } else if (data.type === "cat_removed") {
            if (onCatRemovedRemote) {
              onCatRemovedRemote(data.slotIndex);
            }
          } else if (data.type === "cat_upgraded") {
            if (onCatUpgradedRemote) {
              onCatUpgradedRemote(data.slotIndex, data.cat);
            }
          } else if (data.type === "announcement") {
            alert(`📢 ประกาศจากระบบ:\n\n${data.message}`);
          } else if (data.type === "kicked") {
            alert("❌ คุณถูกเตะออกจาก Server Room โดยผู้ดูแลระบบ");
            window.location.reload();
          }
        } catch (msgErr) {
          console.error("WS Message Parsing Error:", msgErr);
        }
      };
    } catch (wsErr) {
      console.error("Failed to initialize WebSocket connection:", wsErr);
    }

    return () => {
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
    // Only reconnect when user.id or room changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, room]);

  // Auto-sync our zone cats to the WebSocket server whenever they change
  useEffect(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    if (myAssignedSlotIndex === undefined || myAssignedSlotIndex === null) return;

    const myZoneCats = deployedCats.slice(myAssignedSlotIndex * 8, (myAssignedSlotIndex * 8) + 8);
    socketRef.current.send(
      JSON.stringify({
        type: "sync_cats",
        cats: myZoneCats
      })
    );
  }, [deployedCats, myAssignedSlotIndex]);

  // Sync heldCat to WS server whenever it changes
  useEffect(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(
      JSON.stringify({
        type: "update_held_cat",
        heldCat: heldCat
      })
    );
  }, [heldCat]);

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

        // Send movement update to server if coordinates changed
        if (prev.x !== nextX || prev.y !== nextY) {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: "move",
              x: nextX,
              y: nextY
            }));
          }
        }

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

        for (let i = 0; i < 48; i++) {
          const center = getDeskCenter(i);
          const dist = Math.hypot(playerCenterX - center.x, playerCenterY - center.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestSlotIdx = i;
          }
        }

        // 80px radius for interaction.
        if (minDistance < 80 && closestSlotIdx !== -1) {
          const targetZoneIdx = Math.floor(closestSlotIdx / 8);
          // Verify zone ownership before interaction
          if (targetZoneIdx !== myAssignedSlotIndex) {
            const otherOwner = Object.values(otherPlayers).find(p => p.slotIndex === targetZoneIdx);
            const ownerName = otherOwner ? otherOwner.username : `Player ${targetZoneIdx + 1}`;
            alert(`⛔ นี่คือพื้นที่ Zone ${targetZoneIdx + 1} ของเพื่อน (${ownerName}) ไม่สามารถยุ่งกับแมวหรือพื้นที่ของผู้อื่นได้!`);
            return;
          }

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
  }, [heldCat, playerPos, deployedCats, onPlaceCat, onPickupCat, myAssignedSlotIndex, otherPlayers]);

  const mapW = customMap ? customMap.cols * 48 : dimensions.width;
  const mapH = customMap ? customMap.rows * 48 : dimensions.height;
  const offsetX = customMap ? Math.max(0, (dimensions.width - mapW) / 2) : 0;
  const offsetY = customMap ? Math.max(0, (dimensions.height - mapH) / 2) : 0;

  // Helper to compute center coordinates of each of the 48 desk slots across 6 zones
  const getDeskCenter = (slotIdx) => {
    const zoneIdx = Math.floor(slotIdx / 8);
    const subIdx = slotIdx % 8;
    const subRow = Math.floor(subIdx / 4);
    const subCol = subIdx % 4;

    const zones = [
      { colStart: 3, rowStart: 3 },
      { colStart: 14, rowStart: 3 },
      { colStart: 25, rowStart: 3 },
      { colStart: 3, rowStart: 13 },
      { colStart: 14, rowStart: 13 },
      { colStart: 25, rowStart: 13 },
    ];

    const z = zones[zoneIdx] || zones[0];
    const tileCol = z.colStart + 1 + subCol;
    const tileRow = z.rowStart + 1 + subRow;

    return {
      x: (tileCol + 0.5) * 48,
      y: (tileRow + 0.5) * 48,
    };
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

  // Monitor player proximity to each desk to harvest accumulated SP for player's assigned zone (8 slots)
  useEffect(() => {
    const playerCenterX = playerPos.x + playerSize / 2;
    const playerCenterY = playerPos.y + playerSize / 2;

    const startSlot = myAssignedSlotIndex * 8;
    const endSlot = startSlot + 8;

    for (let i = startSlot; i < endSlot; i++) {
      if (accumulatedSp[i] > 0) {
        const center = getDeskCenter(i);
        const dist = Math.sqrt(
          Math.pow(playerCenterX - center.x, 2) + Math.pow(playerCenterY - center.y, 2)
        );
        // Harvest if player is within range (85px) of their desk center
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
            {React.useMemo(() => {
              const tileSize = 48;
              const mapCols = customMap ? customMap.cols : Math.ceil(dimensions.width / tileSize);
              const mapRows = customMap ? customMap.rows : Math.ceil(dimensions.height / tileSize);
              const tiles = [];
              
              for (let r = 0; r < mapRows; r++) {
                for (let c = 0; c < mapCols; c++) {
                  let imgSrc = "";
                  if (customMap) {
                    const tileId = customMap.tiles[r]?.[c] || "00";
                    const asset = tileAssets.find(t => t.tileId === tileId);
                    imgSrc = asset ? asset.image : null;
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
                    // Floors and 6 Plot Fences (matching mockup image)
                    else {
                      const fenceTile = (() => {
                        const plots = [
                          { colStart: 2, colEnd: 7, rowStart: 2, rowEnd: 5 },
                          { colStart: 9, colEnd: 14, rowStart: 2, rowEnd: 5 },
                          { colStart: 16, colEnd: 21, rowStart: 2, rowEnd: 5 },
                          { colStart: 2, colEnd: 7, rowStart: 9, rowEnd: 12 },
                          { colStart: 9, colEnd: 14, rowStart: 9, rowEnd: 12 },
                          { colStart: 16, colEnd: 21, rowStart: 9, rowEnd: 12 },
                        ];
                        for (const p of plots) {
                          if (r >= p.rowStart && r <= p.rowEnd && c >= p.colStart && c <= p.colEnd) {
                            const isTop = r === p.rowStart;
                            const isBottom = r === p.rowEnd;
                            const isLeft = c === p.colStart;
                            const isRight = c === p.colEnd;
                            if (isTop || isBottom || isLeft || isRight) {
                              if (isTop && isLeft) return "/map-box/map-box-09.png";
                              if (isTop && isRight) return "/map-box/map-box-10.png";
                              if (isBottom && isLeft) return "/map-box/map-box-11.png";
                              if (isBottom && isRight) return "/map-box/map-box-12.png";
                              if (isTop) return "/map-box/map-box-05.png";
                              if (isBottom) return "/map-box/map-box-06.png";
                              if (isLeft) return "/map-box/map-box-07.png";
                              if (isRight) return "/map-box/map-box-08.png";
                            }
                          }
                        }
                        return null;
                      })();

                      if (fenceTile) {
                        imgSrc = fenceTile;
                      } else {
                        const seed = (r * 7 + c * 13) % 4;
                        const floorNum = String(seed + 1).padStart(2, '0');
                        imgSrc = `/map-box/map-box-${floorNum}.png`;
                      }
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
            }, [customMap, dimensions])}
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
              left: `${mapW / 2 - 580}px`,
              top: `${mapH / 2 - 380}px`,
              width: "1160px",
            }}
          >
            <CatWorkingGrid
              slots={deployedCats}
              accumulatedSp={accumulatedSp}
              spPoints={spPoints}
              myAssignedSlotIndex={myAssignedSlotIndex}
              otherPlayers={otherPlayers}
              user={user}
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
            for (let i = 0; i < 48; i++) {
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
                      src={heldCat.image || `/cats/cat-${heldCat.rarity.toLowerCase()}.png`} 
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

          {/* Other Players */}
          {Object.values(otherPlayers).map((p) => (
            <div
              key={p.id}
              className="absolute transition-all duration-75 ease-out select-none z-10 flex flex-col items-center"
              style={{
                left: p.x,
                top: p.y - (p.heldCat ? 30 : 0),
                width: playerSize,
                height: playerSize + (p.heldCat ? 30 : 0),
              }}
            >
              {p.heldCat && (
                <div className="absolute -top-16 flex flex-col items-center animate-bounce">
                  <img 
                    src={p.heldCat.image || `/cats/cat-${p.heldCat.rarity.toLowerCase()}.png`} 
                    alt="Held Cat" 
                    className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
                </div>
              )}
              <div className="absolute -top-6 flex flex-col items-center">
                <span className="text-[8px] bg-black/85 text-blue-300 px-2 py-0.5 rounded-full mb-0.5 whitespace-nowrap border border-blue-900/55 font-mono font-bold drop-shadow-md">
                  {p.username}
                </span>
              </div>
              <img src="/mc-00.png" alt={p.username} className="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.45)] mt-auto opacity-80" />
            </div>
          ))}
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
