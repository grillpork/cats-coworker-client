"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../components/auth/hook/useAuth";
import { useRouter } from "next/navigation";
import { mapService } from "../services/map.service";

export default function LobbyPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [mapTemplates, setMapTemplates] = useState([]);
  const [selectedRoomObj, setSelectedRoomObj] = useState(null);
  const [selectedMapTemplateId, setSelectedMapTemplateId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);

  const fetchRooms = async () => {
    try {
      const roomsRes = await mapService.getRooms();
      const rooms = roomsRes?.data || roomsRes || [];
      setAvailableRooms(rooms);
      setSelectedRoomObj((prev) => {
        if (!prev && rooms.length > 0) return rooms[0];
        const found = rooms.find((r) => r.id === prev?.id);
        return found || (rooms.length > 0 ? rooms[0] : null);
      });
    } catch (err) {
      console.error("Failed to load rooms from database:", err);
    }
  };

  // Load rooms and templates from database on mount & poll every 3 seconds
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesRes = await mapService.getAllMaps();
        const templates = templatesRes?.data || templatesRes || [];
        setMapTemplates(templates);
        if (templates.length > 0) {
          setSelectedMapTemplateId(String(templates[0].id));
        }
      } catch (err) {
        console.error("Failed to load map templates:", err);
      }
    };

    fetchTemplates();
    fetchRooms();

    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = async () => {
    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบก่อนสร้าง Server Room (Guest Mode cannot create rooms)");
      return;
    }
    if (!newRoomName.trim()) {
      alert("กรุณากรอกชื่อห้องที่ต้องการสร้าง");
      return;
    }
    if (!selectedMapTemplateId) {
      alert("กรุณาเลือกแผนที่สำหรับเซิร์ฟเวอร์");
      return;
    }

    setCreatingRoom(true);
    try {
      const res = await mapService.createRoomInstance(newRoomName.trim(), Number(selectedMapTemplateId));
      const newRoom = res?.data || res;
      
      // Refresh list of rooms
      const updatedRes = await mapService.getRooms();
      const rooms = updatedRes?.data || updatedRes || [];
      setAvailableRooms(rooms);
      
      // Navigate to the newly created room
      alert(`สร้าง Server Room "${newRoom.name}" สำเร็จ!`);
      setNewRoomName("");
      setShowRoomModal(false);
      router.push(`/game?roomId=${newRoom.id}`);
    } catch (err) {
      console.error("Failed to create room:", err);
      alert("ล้มเหลวในการสร้างห้อง: " + (err.response?.data?.error || err.message));
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleEditClick = async (room) => {
    const newName = prompt("พิมพ์ชื่อห้องใหม่ที่คุณต้องการ:", room.name);
    if (newName === null) return;
    if (!newName.trim()) return alert("กรุณากรอกชื่อห้อง");
    
    try {
      await mapService.updateRoomInstance(room.id, newName.trim(), room.mapId);
      alert("แก้ไขชื่อห้องสำเร็จ!");
      const res = await mapService.getRooms();
      const rooms = res?.data || res || [];
      setAvailableRooms(rooms);
      if (selectedRoomObj?.id === room.id) {
        const found = rooms.find(r => r.id === room.id);
        if (found) setSelectedRoomObj(found);
      }
    } catch (err) {
      console.error(err);
      alert("ล้มเหลวในการแก้ไข: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteRoom = async (id, name) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้อง "${name}"? (ผู้เล่นในห้องนี้จะถูกตัดการเชื่อมต่อ)`)) return;
    
    try {
      await mapService.deleteRoomInstance(id);
      alert("ลบห้องสำเร็จ!");
      const res = await mapService.getRooms();
      const rooms = res?.data || res || [];
      setAvailableRooms(rooms);
      if (selectedRoomObj?.id === id) {
        setSelectedRoomObj(rooms.length > 0 ? rooms[0] : null);
      }
    } catch (err) {
      console.error(err);
      alert("ล้มเหลวในการลบห้อง: " + (err.response?.data?.error || err.message));
    }
  };

  const handleJoinRoom = () => {
    if (!selectedRoomObj) return alert("กรุณาเลือกห้องที่ต้องการเข้าร่วม");
    if (selectedRoomObj.playerCount >= 6) {
      return alert("ห้องเซิร์ฟเวอร์นี้เต็มแล้ว (จำกัดผู้เล่นไม่เกิน 6 คน)");
    }
    setShowRoomModal(false);
    router.push(`/game?roomId=${selectedRoomObj.id}`);
  };

  return (
    <main className="relative w-screen h-screen bg-[#0a0b0d] text-slate-100 font-sans overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-lg w-full px-6 flex flex-col items-center text-center gap-8">
        {/* Logo / Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.2)] animate-pulse">
            <span className="text-rose-500 font-black text-2xl">🐱</span>
          </div>
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 drop-shadow-md">
            CATS CO-WORKER
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
            Real-time Server Room Simulator
          </p>
        </div>

        {/* Description Card */}
        <div className="w-full bg-[#101114]/90 border border-zinc-900 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
          <div className="text-left flex flex-col gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="text-base">🪙</span>
              <span><strong>FARM SP:</strong> Deploy cyber-cats onto server desks to earn SP.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base">💻</span>
              <span><strong>SOLVE CODE:</strong> Solve decryption tasks in the terminal to obtain more cats.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base">🌐</span>
              <span><strong>MULTIPLAYER:</strong> Connect in real-time and coordinate with other players.</span>
            </div>
          </div>

          <div className="h-[1px] bg-zinc-800/60 my-1" />

          {/* Profile info inside card */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">สถานะผู้ใช้:</span>
            {isAuthenticated ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {user?.username || user?.email?.split('@')[0]}
              </span>
            ) : (
              <span className="text-zinc-400">Guest Mode (ไม่ได้เข้าสู่ระบบ)</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => {
              fetchRooms();
              setShowRoomModal(true);
            }}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_25px_rgba(244,63,94,0.45)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-rose-500/30"
          >
            🚀 เข้าสู่ห้องเซิร์ฟเวอร์ (Enter Server Room)
          </button>

          {!isAuthenticated && (
            <Link
              href="/auth/sign-in"
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-850 hover:border-zinc-700 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              🔑 เข้าสู่ระบบเพื่อบันทึกข้อมูล (Log In)
            </Link>
          )}

          {isAuthenticated && user?.roleName?.toLowerCase() === "admin" && (
            <Link
              href="/backoffice/overview"
              className="w-full py-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              ⚙️ แผงควบคุมแอดมิน (Backoffice)
            </Link>
          )}
        </div>

        <div className="text-[9px] text-zinc-600 font-mono tracking-wider">
          DEVELOPED BY ANTIGRAVITY &bull; ADVANCED AGENTIC CODING v1.0
        </div>
      </div>

      {/* Room Selection Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#101114] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full mx-4 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] font-sans">
            <div className="flex flex-col gap-1.5 text-center relative">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  🚪 เลือก Server Room
                </h2>
                <button
                  onClick={fetchRooms}
                  className="text-[10px] text-zinc-400 hover:text-white bg-zinc-850 hover:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-750 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  title="รีเฟรชรายการห้องเซิร์ฟเวอร์"
                >
                  🔄 รีเฟรช
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 text-left">
                เลือกห้องเซิร์ฟเวอร์ที่คุณต้องการเข้าไปมีส่วนร่วมกับเพื่อนๆ (อัปเดตแบบเรียลไทม์)
              </p>
            </div>

            {/* Room Options */}
            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
              {availableRooms.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500 font-mono">
                  ไม่มีห้องเซิร์ฟเวอร์ใดกำลังเปิดอยู่
                </div>
              ) : (
                availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`w-full p-1 rounded-xl border transition-all flex items-center gap-2 ${
                      selectedRoomObj?.id === room.id
                        ? "bg-rose-500/10 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                        : "bg-[#151619] border-zinc-850"
                    }`}
                  >
                    {/* Selection button */}
                    <button
                      onClick={() => setSelectedRoomObj(room)}
                      className="flex-1 text-left flex justify-between items-center px-3 py-2 cursor-pointer"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-200 font-bold">{room.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-normal">
                          <span>โฮสต์: <strong className="text-zinc-400">{room.hostUsername || "ไม่ระบุ"}</strong></span>
                          <span>&bull;</span>
                          <span>แผนที่: {room.map?.name || "แผนที่ปกติ"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {room.playerCount >= 6 ? (
                          <span className="text-[10px] text-red-400 font-bold font-mono px-1.5 py-0.5 bg-red-950/60 border border-red-900/50 rounded">
                            เต็ม (6/6)
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {room.playerCount || 0} / 6 คน
                          </span>
                        )}
                        {selectedRoomObj?.id === room.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        )}
                      </div>
                    </button>

                    {/* Edit/Delete triggers */}
                    {(room.hostId === user?.id || user?.roleName?.toLowerCase() === "admin") && (
                      <div className="flex gap-1 pr-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(room);
                          }}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                          title="แก้ไขชื่อห้อง"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id, room.name);
                          }}
                          className="p-1 hover:bg-red-950/40 rounded text-red-400 hover:text-red-500 cursor-pointer"
                          title="ลบห้องเซิร์ฟเวอร์"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Create New Room section */}
            <div className="flex flex-col gap-2 border-t border-zinc-850 pt-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">หรือสร้าง Server Room ใหม่</span>
              
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="ใส่ชื่อห้องใหม่ (เช่น Room 99)..."
                className="w-full py-2.5 px-3 bg-[#151619] border border-zinc-850 hover:border-zinc-700 focus:border-rose-500/70 rounded-xl text-xs text-slate-100 placeholder:text-zinc-600 outline-none transition-all"
              />

              <div className="flex gap-2">
                <select
                  value={selectedMapTemplateId}
                  onChange={(e) => setSelectedMapTemplateId(e.target.value)}
                  className="flex-1 py-2.5 px-3 bg-[#151619] border border-zinc-850 hover:border-zinc-700 focus:border-rose-500/70 rounded-xl text-xs text-slate-200 outline-none transition-all cursor-pointer"
                >
                  {mapTemplates.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#101114]">
                      {t.name} ({t.cols}x{t.rows})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleCreateRoom}
                  disabled={creatingRoom || !newRoomName.trim()}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                    newRoomName.trim() && !creatingRoom
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                      : "bg-zinc-850 text-zinc-600 border border-zinc-900 cursor-not-allowed"
                  }`}
                >
                  {creatingRoom ? "กำลังสร้าง..." : "สร้างห้อง"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRoomModal(false)}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-700 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={availableRooms.length === 0}
                className={`flex-1 py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
                  availableRooms.length === 0
                    ? "bg-zinc-850 text-zinc-600 cursor-not-allowed border border-zinc-900"
                    : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 cursor-pointer"
                }`}
              >
                เข้าร่วมห้อง
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
