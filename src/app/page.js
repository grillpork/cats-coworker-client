"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/hook/useAuth";
import { useRouter } from "next/navigation";
import { mapService } from "../services/map.service";
import { PawPrint, MessageCircle, Lightbulb, Map, Gamepad2 } from "lucide-react";

import TopNavbar from "../components/lobby/TopNavbar";
import LeftMenu from "../components/lobby/LeftMenu";
import RightMenu from "../components/lobby/RightMenu";
import RoomSelectionModal from "../components/lobby/RoomSelectionModal";

export default function LobbyPage() {
  const { isAuthenticated, user, fetchUser } = useAuth();
  const router = useRouter();

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [mapTemplates, setMapTemplates] = useState([]);
  const [selectedRoomObj, setSelectedRoomObj] = useState(null);
  const [selectedMapTemplateId, setSelectedMapTemplateId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
      // Dynamically fetch user profile to update SP
      if (isAuthenticated && fetchUser) {
        fetchUser();
      }
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

  const handleCreateRoom = async (roomName) => {
    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบก่อนสร้าง Server Room (Guest Mode cannot create rooms)");
      return;
    }
    const nameToUse = roomName || newRoomName;
    if (!nameToUse || !nameToUse.trim()) {
      alert("กรุณากรอกชื่อห้องที่ต้องการสร้าง");
      return;
    }
    if (!selectedMapTemplateId) {
      alert("กรุณาเลือกแผนที่สำหรับเซิร์ฟเวอร์");
      return;
    }

    setCreatingRoom(true);
    try {
      const res = await mapService.createRoomInstance(nameToUse.trim(), Number(selectedMapTemplateId || 1));
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

  const handleEditClick = async (room, newName) => {
    if (!newName || !newName.trim()) return alert("กรุณากรอกชื่อห้อง");

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

  return (
    <main className="relative w-screen h-screen bg-[#80deea] bg-[radial-gradient(circle_at_center,#e0f7fa_0%,#80deea_100%)] text-slate-800 font-sans overflow-hidden flex items-center justify-center select-none">
      {/* Repeating paw-print watermark overlay using low-opacity emoji */}
      <div className="absolute inset-0 opacity-[0.03] grid grid-cols-8 grid-rows-6 pointer-events-none text-4xl p-8 gap-12 z-0">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="transform rotate-12 text-sky-900/10"><PawPrint size={36} /></span>
        ))}
      </div>

      {/* Main Cartoon Game Frame */}
      <div className="relative z-10 w-full h-full  bg-[#1e88e5] bg-[radial-gradient(circle_at_center,#29b6f6_0%,#0288d1_100%)],inset_0_4px_0_rgba(255,255,255,0.4)] overflow-hidden flex flex-col p-5">

        <TopNavbar isAuthenticated={isAuthenticated} user={user} />

        {/* Central Content Split */}
        <div className="flex-1 flex w-full relative z-10 overflow-hidden">

          <LeftMenu isAuthenticated={isAuthenticated} user={user} />

          {/* Central Character and Interactive Area */}
          <div className="flex-1 relative flex flex-col items-center justify-center">
            {isAuthenticated ? (
              <>
                <div className="absolute w-[240px] h-[240px] bg-sky-300/30 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-[23%] w-[160px] h-[20px] bg-[#0c3c8c]/50 rounded-full" />
                <div className="relative z-10 w-[220px] h-[220px] flex items-center justify-center group">
                  <img
                    src="/mc-00.png"
                    alt="Main Character Avatar"
                    className="w-44 h-44 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300 select-none pointer-events-none"
                  />
                </div>
                <div className="absolute left-[15%] w-10 h-10 bg-white hover:bg-slate-100 rounded-lg flex items-center justify-center font-black border-2 border-[#0d47a1] cursor-pointer shadow-md hover:scale-105 active:scale-95 transition" onClick={() => alert("👈 ฟังก์ชันเปลี่ยนตัวละครหลักเร็วๆ นี้!")}>
                  ◀
                </div>
                <div className="absolute right-[15%] w-10 h-10 bg-white hover:bg-slate-100 rounded-lg flex items-center justify-center font-black border-2 border-[#0d47a1] cursor-pointer shadow-md hover:scale-105 active:scale-95 transition" onClick={() => alert("👉 ฟังก์ชันเปลี่ยนตัวละครหลักเร็วๆ นี้!")}>
                  ▶
                </div>
                <div className="absolute bottom-[10%] bg-white border-[3px] border-[#0d47a1] rounded-full px-5 py-1.5 shadow-md flex items-center gap-1.5 font-bold text-xs text-[#0d47a1]">
                  <MessageCircle size={16} />
                  <span>Let's play together in Server Room!</span>
                </div>
              </>
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/auth/sign-in')}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-black text-xl py-4 px-12 rounded-full border-[4px] border-white shadow-[0_8px_0_#d97706,0_15px_20px_rgba(0,0,0,0.4)] active:translate-y-[8px] active:shadow-[0_0px_0_#d97706,0_0px_0_rgba(0,0,0,0)] transition-all uppercase tracking-widest"
                >
                  Login to Play
                </button>
                <div className="text-white/80 font-bold text-sm bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                  Authentication Required
                </div>
              </div>
            )}
          </div>

          <RightMenu isAuthenticated={isAuthenticated} />

        </div>
      </div>

      <RoomSelectionModal
        showRoomModal={showRoomModal}
        setShowRoomModal={setShowRoomModal}
        availableRooms={availableRooms}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleCreateRoom={handleCreateRoom}
        setSelectedRoomObj={setSelectedRoomObj}
        router={router}
        user={user}
        handleEditClick={handleEditClick}
        handleDeleteRoom={handleDeleteRoom}
      />
    </main>
  );
}
