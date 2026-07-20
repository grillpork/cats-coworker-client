"use client";

import React, { useState } from "react";
import Link from "next/link";

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

const DEFAULT_COLS = 20;
const DEFAULT_ROWS = 15;

export default function MapEditorPage() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [rowInput, setRowInput] = useState(String(DEFAULT_ROWS));
  const [colInput, setColInput] = useState(String(DEFAULT_COLS));
  const [selectedTileId, setSelectedTileId] = useState("01"); // default to Floor 1
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [grid, setGrid] = useState(() => {
    // Generate initial empty grid (all filled with Empty Tile "00")
    return Array(DEFAULT_ROWS).fill(null).map(() => Array(DEFAULT_COLS).fill("00"));
  });
  const [exportedJson, setExportedJson] = useState("");
  const [importInput, setImportInput] = useState("");

  // Load from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("customMapData");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.rows && parsed.cols && Array.isArray(parsed.tiles)) {
            setRows(parsed.rows);
            setCols(parsed.cols);
            setRowInput(String(parsed.rows));
            setColInput(String(parsed.cols));
            setGrid(parsed.tiles);
          }
        } catch (e) {
          console.error("Failed to load map from localStorage:", e);
        }
      }
    }
  }, []);

  const handleSaveToGame = () => {
    const mapData = {
      rows,
      cols,
      tiles: grid,
    };
    localStorage.setItem("customMapData", JSON.stringify(mapData));
    alert("Map saved to game! Returning to game will display your custom map.");
  };

  const handleTileClick = (r, c, tileId = selectedTileId) => {
    const newGrid = grid.map((rowArr, ri) => {
      if (ri !== r) return rowArr;
      return rowArr.map((colVal, ci) => (ci === c ? tileId : colVal));
    });
    setGrid(newGrid);
  };

  const handleFillAll = () => {
    const newGrid = Array(rows).fill(null).map(() => Array(cols).fill(selectedTileId));
    setGrid(newGrid);
  };

  const handleClear = () => {
    const newGrid = Array(rows).fill(null).map(() => Array(cols).fill("00"));
    setGrid(newGrid);
  };

  const handleResize = (newRows, newCols) => {
    const updatedRows = Math.max(5, Math.min(40, newRows));
    const updatedCols = Math.max(5, Math.min(40, newCols));
    setRows(updatedRows);
    setCols(updatedCols);
    setRowInput(String(updatedRows));
    setColInput(String(updatedCols));

    setGrid((prev) => {
      return Array(updatedRows).fill(null).map((_, r) => {
        return Array(updatedCols).fill(null).map((_, c) => {
          if (prev[r] && prev[r][c] !== undefined) {
            return prev[r][c];
          }
          return "00";
        });
      });
    });
  };

  const handleExport = () => {
    const mapData = {
      rows,
      cols,
      tiles: grid,
    };
    setExportedJson(JSON.stringify(mapData, null, 2));
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importInput);
      if (parsed.rows && parsed.cols && Array.isArray(parsed.tiles)) {
        setRows(parsed.rows);
        setCols(parsed.cols);
        setGrid(parsed.tiles);
        alert("Map imported successfully!");
      } else {
        alert("Invalid format! Must contain rows, cols, and tiles grid array.");
      }
    } catch (e) {
      alert("Failed to parse JSON: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#111215] text-slate-100 font-mono p-6 flex flex-col gap-6 selection:bg-rose-500 selection:text-white">
      {/* Header Panel */}
      <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-rose-500 tracking-wider flex items-center gap-2">
            <span>🛠</span> SERVER MAP EDITOR
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Design customized room layouts for your servers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToGame}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 rounded text-xs font-black transition-colors"
          >
            💾 SAVE TO GAME
          </button>
          <Link href="/" className="px-4 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-rose-500 rounded text-xs font-black transition-colors">
            ⬅ BACK TO GAME
          </Link>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Left Control Palette (z-10) */}
        <div className="w-full lg:w-80 bg-[#16171a] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
          <div>
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800/80 pb-1.5">
              Tile Palette
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {TILE_ASSETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTileId(t.id)}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("tileId", t.id);
                  }}
                  className={`relative p-1 rounded-lg border-2 aspect-square flex items-center justify-center transition-all bg-black/20 cursor-grab active:cursor-grabbing ${
                    selectedTileId === t.id
                      ? "border-rose-500 scale-105 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                      : "border-zinc-800 hover:border-zinc-600"
                  }`}
                  title={`${t.name} (Drag to canvas or click to select)`}
                >
                  {t.src ? (
                    <img src={t.src} alt={t.name} className="w-full h-full object-contain pointer-events-none" />
                  ) : (
                    <div className="w-full h-full bg-[#1c1d22] border border-zinc-800 rounded" />
                  )}
                  <span className="absolute bottom-0 right-1 text-[8px] font-black text-zinc-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {t.id}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-center text-[10px] text-rose-400 font-bold uppercase">
              Active: {TILE_ASSETS.find((t) => t.id === selectedTileId)?.name}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800/80 pb-1.5">
              Grid Settings
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex flex-col gap-1 text-[10px] text-zinc-500">
                ROWS (5-40):
                <input
                  type="text"
                  inputMode="numeric"
                  value={rowInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRowInput(val);
                    const parsed = parseInt(val);
                    if (!isNaN(parsed) && parsed >= 5 && parsed <= 40) {
                      handleResize(parsed, cols);
                    }
                  }}
                  onBlur={() => {
                    let parsed = parseInt(rowInput);
                    if (isNaN(parsed) || parsed < 5) parsed = 5;
                    if (parsed > 40) parsed = 40;
                    handleResize(parsed, cols);
                  }}
                  className="bg-black/40 border border-zinc-800 rounded p-1 text-white font-bold text-center"
                />
              </label>
              <label className="flex flex-col gap-1 text-[10px] text-zinc-500">
                COLS (5-40):
                <input
                  type="text"
                  inputMode="numeric"
                  value={colInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setColInput(val);
                    const parsed = parseInt(val);
                    if (!isNaN(parsed) && parsed >= 5 && parsed <= 40) {
                      handleResize(rows, parsed);
                    }
                  }}
                  onBlur={() => {
                    let parsed = parseInt(colInput);
                    if (isNaN(parsed) || parsed < 5) parsed = 5;
                    if (parsed > 40) parsed = 40;
                    handleResize(rows, parsed);
                  }}
                  className="bg-black/40 border border-zinc-800 rounded p-1 text-white font-bold text-center"
                />
              </label>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800/80 pb-1.5">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleFillAll}
                className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold"
              >
                FILL ALL
              </button>
              <button
                onClick={handleClear}
                className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold"
              >
                CLEAR ALL
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-[#16171a] border border-zinc-800 rounded-xl p-4 flex flex-col justify-center items-center overflow-auto min-h-[500px]">
          <p className="text-[10px] text-zinc-500 uppercase mb-2 select-none">
            💡 Drag & Drop a tile here, OR hold click and drag mouse to paint
          </p>
          <div
            className="grid gap-[1px] bg-zinc-900 border-2 border-zinc-800 p-1"
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}
            onMouseLeave={() => setIsMouseDown(false)}
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((rowArr, r) =>
              rowArr.map((tileId, c) => {
                const asset = TILE_ASSETS.find((t) => t.id === tileId) || TILE_ASSETS[0];
                return (
                  <button
                    key={`${r}-${c}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleTileClick(r, c);
                    }}
                    onMouseEnter={() => {
                      if (isMouseDown) {
                        handleTileClick(r, c);
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedTileId = e.dataTransfer.getData("tileId");
                      if (droppedTileId) {
                        handleTileClick(r, c, droppedTileId);
                      }
                    }}
                    className="w-10 h-10 bg-black/40 hover:bg-zinc-800/60 flex items-center justify-center transition-colors overflow-hidden group relative"
                  >
                    {asset && asset.src ? (
                      <img src={asset.src} alt={asset.name} className="w-full h-full object-cover pointer-events-none" />
                    ) : (
                      <div className="w-full h-full bg-[#151619]" />
                    )}
                    <div className="absolute inset-0 bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* JSON Import/Export Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div className="bg-[#16171a] border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
              Export Map Data
            </h2>
            <button
              onClick={handleExport}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded text-[9px] font-black"
            >
              GENERATE JSON
            </button>
          </div>
          <textarea
            readOnly
            value={exportedJson}
            placeholder="Click Generate JSON to export your map data here..."
            className="w-full h-32 bg-black/40 border border-zinc-800 rounded p-2 text-[10px] text-emerald-400 font-mono focus:outline-none resize-none"
          />
        </div>

        <div className="bg-[#16171a] border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
              Import Map Data
            </h2>
            <button
              onClick={handleImport}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[9px] font-black"
            >
              LOAD MAP
            </button>
          </div>
          <textarea
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            placeholder="Paste your exported JSON map data here to load..."
            className="w-full h-32 bg-black/40 border border-zinc-800 rounded p-2 text-[10px] text-zinc-300 font-mono focus:outline-none resize-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
