"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../../components/auth/hook/useAuth";
import { mapService } from "../../../../services/map.service";



const DEFAULT_COLS = 20;
const DEFAULT_ROWS = 15;

export default function MapEditorPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tileAssets, setTileAssets] = useState([]);
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

  // Load sprites and active map layout from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch sprite assets
        const spritesRes = await mapService.getSprites();
        const sprites = spritesRes?.data || spritesRes || [];
        setTileAssets(sprites);
        if (sprites.length > 0) {
          setSelectedTileId(sprites[0].tileId);
        }

        // Fetch active map layout
        const mapRes = await mapService.getActiveMap();
        const map = mapRes?.data || mapRes;
        if (map && map.rows && map.cols && Array.isArray(map.tiles)) {
          setRows(map.rows);
          setCols(map.cols);
          setRowInput(String(map.rows));
          setColInput(String(map.cols));
          setGrid(map.tiles);
        }
      } catch (e) {
        console.error("Failed to load map/sprites from API:", e);
      }
    };

    if (isAuthenticated && user?.roleName?.toLowerCase() === "admin") {
      loadData();
    }
  }, [isAuthenticated, user]);

  const handleSaveToGame = async () => {
    const mapData = {
      name: "Custom Server Room Map",
      rows,
      cols,
      tiles: grid,
    };
    try {
      await mapService.saveMap(mapData);
      alert("บันทึกแผนที่ลงฐานข้อมูลเรียบร้อยแล้ว! เมื่อเปิดเกมจะแสดงแผนที่ที่ออกแบบไว้");
    } catch (e) {
      console.error(e);
      alert("บันทึกแผนที่ล้มเหลว: " + (e.response?.data?.error || e.message));
    }
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
        alert("นำเข้าข้อมูลแผนที่สำเร็จ!");
      } else {
        alert("รูปแบบไม่ถูกต้อง! ต้องมีแถว (rows) คอลัมน์ (cols) และตารางกระเบื้อง (tiles)");
      }
    } catch (e) {
      alert("การวิเคราะห์ JSON ล้มเหลว: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111215] text-slate-100 flex items-center justify-center ">
        <div className="text-center flex flex-col gap-2">
          <span className="text-2xl animate-pulse">🔒 กำลังป้องกันพื้นที่ทำงาน...</span>
          <span className="text-[10px] text-zinc-500 uppercase">กำลังตรวจสอบสิทธิ์การใช้งาน</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.roleName?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-[#111215] text-slate-100 flex items-center justify-center  p-6">
        <div className="max-w-md w-full bg-[#16171a] border border-red-950/40 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          <span className="text-4xl">🚫</span>
          <h2 className="text-lg font-black text-red-500 mt-4 tracking-widest uppercase">ปฏิเสธการเข้าถึง</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            สิทธิ์การเข้าถึงเฉพาะผู้ดูแลระบบเท่านั้นในการเข้าถึงและแก้ไขเครื่องมือจัดแผนที่เซิร์ฟเวอร์
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/" className="px-6 py-2 bg-zinc-900 border border-zinc-700 hover:border-rose-500 rounded text-xs font-black transition-all">
              ⬅ กลับไปยังหน้าหลักเกม
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111215] text-slate-100  p-6 flex flex-col gap-6 selection:bg-rose-500 selection:text-white">
      {/* Header Panel */}
      <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-rose-500 tracking-wider flex items-center gap-2">
            <span>🛠</span> เครื่องมือจัดแผนที่เซิร์ฟเวอร์
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase mt-0.5">ออกแบบและปรับแต่งห้องทำงานของเซิร์ฟเวอร์ของคุณ</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToGame}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 rounded text-xs font-black transition-colors"
          >
            💾 บันทึกแผนที่เข้าเกม
          </button>
          <Link href="/" className="px-4 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-rose-500 rounded text-xs font-black transition-colors">
            ⬅ กลับไปที่เกม
          </Link>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">

        {/* Left Control Palette (z-10) */}
        <div className="w-full lg:w-80 bg-[#16171a] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
          <div>
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800/80 pb-1.5">
              คลังแผ่นกระเบื้อง
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {tileAssets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTileId(t.tileId)}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("tileId", t.tileId);
                  }}
                  className={`relative p-1 rounded-lg border-2 aspect-square flex items-center justify-center transition-all bg-black/20 cursor-grab active:cursor-grabbing ${selectedTileId === t.tileId
                      ? "border-rose-500 scale-105 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                      : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  title={`${t.name} (ลากลงตาราง หรือ คลิกเพื่อเลือก)`}
                >
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-full h-full object-contain pointer-events-none" />
                  ) : (
                    <div className="w-full h-full bg-[#1c1d22] border border-zinc-800 rounded" />
                  )}
                  <span className="absolute bottom-0 right-1 text-[8px] font-black text-zinc-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {t.tileId}
                  </span>
                </button>
              ))}
            </div>
            {tileAssets.length > 0 && (
              <div className="mt-2 text-center text-[10px] text-rose-400 font-bold uppercase">
                เลือกอยู่: {tileAssets.find((t) => t.tileId === selectedTileId)?.name}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800/80 pb-1.5">
              ขนาดตารางแผนที่
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex flex-col gap-1 text-[10px] text-zinc-500">
                จำนวนแถว (5-40):
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
                คอลัมน์ (5-40):
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
              เครื่องมือด่วน
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleFillAll}
                className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold"
              >
                ปูทั้งหมด
              </button>
              <button
                onClick={handleClear}
                className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold"
              >
                ล้างทั้งหมด
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-[#16171a] border border-zinc-800 rounded-xl p-4 flex flex-col justify-center items-center overflow-auto min-h-[500px]">
          <p className="text-[10px] text-zinc-500 uppercase mb-2 select-none">
            💡 ลากแผ่นกระเบื้องมาวางที่นี่ หรือ คลิกเมาส์ค้างไว้แล้วลากเพื่อระบายสีแผนที่
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
                const asset = tileAssets.find((t) => t.tileId === tileId);
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
                    {asset && asset.image ? (
                      <img src={asset.image} alt={asset.name} className="w-full h-full object-cover pointer-events-none" />
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
              ส่งออกข้อมูลแผนที่ (Export)
            </h2>
            <button
              onClick={handleExport}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded text-[9px] font-black"
            >
              สร้างรหัส JSON
            </button>
          </div>
          <textarea
            readOnly
            value={exportedJson}
            placeholder="คลิกปุ่มสร้างรหัสเพื่อดึงข้อมูลรหัสแผนที่..."
            className="w-full h-32 bg-black/40 border border-zinc-800 rounded p-2 text-[10px] text-emerald-400  focus:outline-none resize-none"
          />
        </div>

        <div className="bg-[#16171a] border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
              นำเข้าข้อมูลแผนที่ (Import)
            </h2>
            <button
              onClick={handleImport}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[9px] font-black"
            >
              โหลดข้อมูลแผนที่
            </button>
          </div>
          <textarea
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            placeholder="วางรหัส JSON เพื่อนำเข้าโครงสร้างแผนที่..."
            className="w-full h-32 bg-black/40 border border-zinc-800 rounded p-2 text-[10px] text-zinc-300  focus:outline-none resize-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
