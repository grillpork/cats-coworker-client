"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../../../lib/api";
import { 
  Server, Users, Volume2, LogOut, MapPin, Activity, 
  ShieldAlert, Sparkles, Plus, Trash2, ShieldCheck, ChevronDown,
  Layers, Map, Edit, Check, X
} from "lucide-react";

export default function ServerRoomManagementPage() {
  // Existing states
  const [players, setPlayers] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Cat placement states
  const [placements, setPlacements] = useState([]);
  const [systemCats, setSystemCats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);

  // Active rooms & maps states
  const [rooms, setRooms] = useState([]);
  const [maps, setMaps] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Editing room map state
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [selectedMapId, setSelectedMapId] = useState("");

  // Creating room state
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomMapId, setNewRoomMapId] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Modal states for placing a cat
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [modalUserId, setModalUserId] = useState("");
  const [modalCatId, setModalCatId] = useState("");
  const [modalCatLevel, setModalCatLevel] = useState(1);
  const [submittingPlacement, setSubmittingPlacement] = useState(false);

  const fetchOnlinePlayers = async () => {
    try {
      const res = await api.get("/api/admin/online-players");
      setPlayers(res || []);
    } catch (e) {
      console.error("Failed to fetch online players:", e);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const fetchPlacementsData = async () => {
    try {
      setLoadingPlacements(true);
      const [placementsRes, catsRes, usersRes] = await Promise.all([
        api.get("/api/admin/placements"),
        api.get("/api/cats"),
        api.get("/api/user/all")
      ]);
      setPlacements(placementsRes || []);
      setSystemCats(catsRes?.data || catsRes || []);
      setAllUsers(usersRes || []);
    } catch (e) {
      console.error("Failed to fetch placements data:", e);
    } finally {
      setLoadingPlacements(false);
    }
  };

  const fetchRoomsAndMaps = async () => {
    try {
      setLoadingRooms(true);
      const [roomsRes, mapsRes] = await Promise.all([
        api.get("/api/maps/rooms"),
        api.get("/api/maps/all")
      ]);
      setRooms(roomsRes || []);
      setMaps(mapsRes || []);
      if (mapsRes && mapsRes.length > 0) {
        setNewRoomMapId(mapsRes[0].id);
      }
    } catch (err) {
      console.error("Failed to load rooms/maps:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchOnlinePlayers();
    fetchPlacementsData();
    fetchRoomsAndMaps();
    // Poll online players list
    const interval = setInterval(fetchOnlinePlayers, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    setSendingBroadcast(true);
    try {
      await api.post("/api/admin/broadcast", { message: announcement });
      alert("ประกาศข้อความไปยังผู้เล่นทั้งหมดสำเร็จ!");
      setAnnouncement("");
    } catch (err) {
      console.error(err);
      alert("ล้มเหลวในการส่งประกาศ: " + (err.response?.data?.error || err.message));
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleKick = async (id, username) => {
    if (!confirm(`คุณต้องการเตะผู้ใช้งาน "${username}" ออกจากระบบใช่หรือไม่?`)) return;

    try {
      await api.post(`/api/admin/kick/${id}`);
      alert(`เตะผู้ใช้ "${username}" สำเร็จ`);
      fetchOnlinePlayers();
    } catch (err) {
      console.error(err);
      alert("ล้มเหลวในการเตะผู้ใช้: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRemovePlacement = async (placementId) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการนำแมวตัวนี้ออกจากระบบโต๊ะทำงาน?")) return;
    try {
      await api.delete(`/api/admin/placements/${placementId}`);
      alert("นำแมวออกจากโต๊ะสำเร็จ!");
      fetchPlacementsData();
    } catch (err) {
      console.error(err);
      alert("ล้มเหลวในการลบ: " + (err.response?.data?.error || err.message));
    }
  };

  const handleOpenPlaceModal = (slotIndex) => {
    setSelectedSlotIndex(slotIndex);
    setModalUserId(allUsers[0]?.id || "");
    setModalCatId(systemCats[0]?.id || "");
    setModalCatLevel(1);
    setShowPlaceModal(true);
  };

  const handleCreatePlacementSubmit = async (e) => {
    e.preventDefault();
    if (!modalUserId || !modalCatId || selectedSlotIndex === null) {
      return alert("กรุณาเลือกข้อมูลให้ครบถ้วน");
    }

    const templateCat = systemCats.find(c => String(c.id) === String(modalCatId));
    if (!templateCat) return alert("ไม่พบข้อมูลแม่แบบแมวที่เลือก");

    setSubmittingPlacement(true);
    try {
      // Build dynamic catData properties
      const catData = {
        id: templateCat.id,
        catId: templateCat.id,
        name: templateCat.name,
        breed: templateCat.breed,
        rarity: templateCat.rarity,
        type: templateCat.type,
        spRate: templateCat.spRate,
        level: parseInt(modalCatLevel, 10),
        image: templateCat.image
      };

      await api.post("/api/admin/placements", {
        userId: parseInt(modalUserId, 10),
        slotIndex: selectedSlotIndex,
        catData
      });

      alert("จัดสรรแมวลงโต๊ะสำเร็จ!");
      setShowPlaceModal(false);
      fetchPlacementsData();
    } catch (err) {
      console.error(err);
      alert("ล้มเหลวในการจัดสรรแมว: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingPlacement(false);
    }
  };

  // Update room map handler
  const handleUpdateRoomMap = async (roomId, roomName) => {
    if (!selectedMapId) return;
    try {
      await api.put(`/api/maps/rooms/${roomId}`, {
        name: roomName,
        mapId: parseInt(selectedMapId, 10)
      });
      alert("เปลี่ยนแผนที่ห้องเซิร์ฟเวอร์สำเร็จ!");
      setEditingRoomId(null);
      fetchRoomsAndMaps();
    } catch (err) {
      console.error(err);
      alert("เปลี่ยนแผนที่ล้มเหลว: " + (err.response?.data?.error || err.message));
    }
  };

  // Create room handler
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim() || !newRoomMapId) return alert("กรุณากรอกชื่อห้องและเลือกแผนที่");
    setCreatingRoom(true);
    try {
      await api.post("/api/maps/rooms", {
        name: newRoomName.trim(),
        mapId: parseInt(newRoomMapId, 10)
      });
      alert("เปิดห้องเซิร์ฟเวอร์ใหม่สำเร็จ!");
      setNewRoomName("");
      fetchRoomsAndMaps();
    } catch (err) {
      console.error(err);
      alert("เปิดห้องล้มเหลว: " + (err.response?.data?.error || err.message));
    } finally {
      setCreatingRoom(false);
    }
  };

  // Delete room handler
  const handleDeleteRoom = async (roomId, roomName) => {
    if (!confirm(`คุณต้องการปิดห้องเซิร์ฟเวอร์ "${roomName}" และเตะผู้เล่นทั้งหมดออกใช่หรือไม่?`)) return;
    try {
      await api.delete(`/api/maps/rooms/${roomId}`);
      alert("ปิดห้องเซิร์ฟเวอร์เรียบร้อย!");
      fetchRoomsAndMaps();
    } catch (err) {
      console.error(err);
      alert("ล้มเหลวในการปิดห้อง: " + (err.response?.data?.error || err.message));
    }
  };

  // Build mapping of active placements for quick retrieval
  const placementsMap = {};
  placements.forEach(p => {
    placementsMap[p.slotIndex] = p;
  });

  return (
    <div className="flex flex-col gap-8 flex-1 font-sans text-zinc-800 pb-16">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2 text-zinc-900 ">
          <Server className="w-6 h-6 text-rose-500" /> การจัดการบอร์ดห้องเซิร์ฟเวอร์ & แผนที่
        </h1>
        <p className="text-xs text-zinc-500">
          ควบคุม จัดระเบียบโต๊ะทำงานแมว ทรานแซกชัน และสลอตการขุด SP ของทุกไอดีในแบบเรียลไทม์
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat card 1 */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/20 flex items-center justify-center text-emerald-600 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-zinc-900">{players.length} คน</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">ผู้เล่นออนไลน์อยู่ขณะนี้</div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Stat card 2 */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-250/20 flex items-center justify-center text-rose-600 shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-zinc-900">ใช้งานปกติ</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">สถานะเซิร์ฟเวอร์ WS</div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Stat card 3 */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/20 flex items-center justify-center text-blue-600 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-zinc-900">{placements.length} ตัว</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">จำนวนแมวที่กำลังทำงาน</div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* NEW SECTION: Active Rooms & Map layout management form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rooms Manager Card (Col 2/3) */}
        <div className="lg:col-span-2 bg-white border border-[#e9ecef] rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-zinc-800">
              <Layers className="w-4 h-4 text-rose-500" /> จัดการแผนที่ประจำห้องเซิร์ฟเวอร์ (Room Map Assignment)
            </h2>
            <p className="text-[10px] text-zinc-400">
              จัดการว่าห้องเซิร์ฟเวอร์ห้องใดจะใช้ผังห้องคอมพิวเตอร์และสิ่งกีดขวางในแผนที่แบบใด
            </p>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e9ecef] text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-bold">ชื่อห้องเซิร์ฟเวอร์</th>
                  <th className="py-2.5 px-3 font-bold">โฮสต์/ผู้เปิด</th>
                  <th className="py-2.5 px-3 font-bold">ผู้เล่น/ความจุ</th>
                  <th className="py-2.5 px-3 font-bold">ผังแผนที่ที่กำหนดอยู่</th>
                  <th className="py-2.5 px-3 font-bold text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9ecef]">
                {loadingRooms ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-zinc-400 uppercase animate-pulse">
                      กำลังโหลดข้อมูลห้องเซิร์ฟเวอร์...
                    </td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-zinc-400">
                      ไม่มีห้องเซิร์ฟเวอร์เปิดอยู่
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => {
                    const isEditing = editingRoomId === room.id;
                    return (
                      <tr key={room.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-zinc-800">
                          {room.name}
                        </td>
                        <td className="py-3.5 px-3 text-zinc-500">
                          {room.hostUsername}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-zinc-650">
                          👤 {room.playerCount} / {room.maxPlayers || 6}
                        </td>
                        <td className="py-3.5 px-3">
                          {isEditing ? (
                            <div className="relative w-44">
                              <select
                                value={selectedMapId}
                                onChange={(e) => setSelectedMapId(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:border-indigo-500 appearance-none font-sans"
                              >
                                {maps.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} ({m.cols}x{m.rows})
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150/40 text-indigo-650 px-2 py-0.5 rounded-full font-semibold">
                              <Map className="w-3 h-3" />
                              {room.map?.name || "Default Map Layout"}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleUpdateRoomMap(room.id, room.name)}
                                className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                                title="บันทึก"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setEditingRoomId(null)}
                                className="p-1.5 bg-zinc-200 text-zinc-650 rounded-lg hover:bg-zinc-300 transition-colors cursor-pointer"
                                title="ยกเลิก"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingRoomId(room.id);
                                  setSelectedMapId(room.mapId || "");
                                }}
                                className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg transition-colors text-[10px] inline-flex items-center gap-1 cursor-pointer"
                                title="เปลี่ยนแผนที่ที่เปิด"
                              >
                                <Edit className="w-3 h-3" /> เปลี่ยนแผนที่
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id, room.name)}
                                className="p-1 bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-rose-600 text-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="ปิดห้องนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Room Server Form (Col 1/3) */}
        <div className="bg-white border border-[#e9ecef] rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-zinc-800">
              <Plus className="w-4 h-4 text-emerald-500" /> เปิดห้องเซิร์ฟเวอร์ใหม่ (Launch Server Room)
            </h2>
            <p className="text-[10px] text-zinc-400">
              เปิดเซิร์ฟเวอร์ห้องคอมขุดจำลองใหม่โดยกำหนดผังแมวตามต้องการ
            </p>
          </div>

          <form onSubmit={handleCreateRoom} className="flex flex-col gap-4 mt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider">ชื่อห้องเซิร์ฟเวอร์</label>
              <input
                type="text"
                placeholder="เช่น Server Room G"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-zinc-800 outline-none transition-all font-sans"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider">เลือกผังโครงสร้างแผนที่</label>
              <div className="relative">
                <select
                  value={newRoomMapId}
                  onChange={(e) => setNewRoomMapId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all appearance-none font-sans"
                  required
                >
                  {maps.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.cols}x{m.rows})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingRoom || !newRoomName.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-100 text-white disabled:text-zinc-400 text-xs font-black rounded-xl active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" /> {creatingRoom ? "กำลังสร้างห้อง..." : "เปิดบอร์ดห้องเซิร์ฟเวอร์"}
            </button>
          </form>
        </div>

      </div>

      {/* Main Server Room Placements Grid Section */}
      <div className="bg-white border border-[#e9ecef] rounded-[32px] p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-zinc-800 ">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> แผงควบคุมจัดวางพิกัดแมวทุกโซน (48 ช่อง)
            </h2>
            <p className="text-[10px] text-zinc-400">
              ควบคุมการกระจายวาง ย้าย หรือปลดประจำการแมวทั้งหมดของทุกไอดีได้อย่างไร้ขีดจำกัด
            </p>
          </div>
          <button 
            onClick={fetchPlacementsData}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
          >
            รีเฟรชบอร์ด
          </button>
        </div>

        {loadingPlacements ? (
          <div className="py-20 text-center text-zinc-450 uppercase tracking-widest text-xs animate-pulse">
            กำลังโหลดโมเดลแผนที่ห้องเซิร์ฟเวอร์...
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, zoneIdx) => {
              return (
                <div 
                  key={zoneIdx} 
                  className="border-2 border-zinc-100 hover:border-zinc-200/80 rounded-[28px] p-4 flex flex-col gap-4 bg-zinc-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2 mb-0.5">
                    <span className="text-[10.5px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Zone {zoneIdx + 1} Placements
                    </span>
                    <span className="text-[9px] bg-zinc-200/80 text-zinc-600 px-2 py-0.5 rounded-full font-bold">
                      {Array.from({ length: 8 }).filter((_, s) => placementsMap[zoneIdx * 8 + s]).length}/8 โต๊ะ
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {Array.from({ length: 8 }).map((_, subIdx) => {
                      const globalSlotIdx = zoneIdx * 8 + subIdx;
                      const placement = placementsMap[globalSlotIdx];
                      
                      return (
                        <div 
                          key={globalSlotIdx} 
                          className={`aspect-[3/4] rounded-2xl border-2 flex flex-col items-center justify-between p-2 relative transition-all group ${
                            placement
                              ? 'border-emerald-500/30 bg-emerald-500/[0.03] hover:border-emerald-500/60'
                              : 'border-dashed border-zinc-200 bg-white hover:border-zinc-400/80'
                          }`}
                        >
                          <span className="absolute top-1.5 left-2 text-[7px] font-extrabold text-zinc-400">
                            #{globalSlotIdx + 1}
                          </span>

                          {placement ? (
                            <>
                              <button 
                                onClick={() => handleRemovePlacement(placement.id)}
                                className="absolute top-1 right-1 p-1 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors scale-75 cursor-pointer opacity-0 group-hover:opacity-100"
                                title="ปลดแมวออกจากโต๊ะ"
                              >
                                <Trash2 size={12} />
                              </button>

                              <div className="flex flex-col items-center mt-3.5 mb-1 shrink-0">
                                <img 
                                  src={placement.catData?.image || `/cats/cat-${(placement.catData?.rarity || 'common').toLowerCase()}.png`} 
                                  alt={placement.catData?.name} 
                                  className="w-8 h-8 object-contain drop-shadow-md"
                                  onError={(e) => { e.target.src = "/cats/cat-common.png"; }}
                                />
                              </div>

                              <div className="flex flex-col items-center gap-0.5 w-full text-center">
                                <span className="text-[7.5px] font-black text-zinc-700 truncate w-full">
                                  {placement.catData?.name}
                                </span>
                                <span className="text-[6.5px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1 rounded-md font-bold uppercase scale-90">
                                  {placement.catData?.rarity}
                                </span>
                                <span className="text-[7px] text-emerald-600 font-bold mt-0.5">
                                  {placement.catData?.spRate} SP/s
                                </span>
                                <span className="text-[6.5px] text-zinc-400 font-bold">
                                  LV.{placement.catData?.level || 1}
                                </span>
                              </div>

                              <div className="w-full border-t border-zinc-100 pt-1 text-center shrink-0">
                                <p className="text-[6px] text-zinc-400 font-bold truncate max-w-full" title={placement.userName || placement.userEmail}>
                                  👤 {placement.userName || placement.userEmail?.split('@')[0]}
                                </p>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenPlaceModal(globalSlotIdx)}
                              className="flex flex-col items-center justify-center gap-1.5 h-full w-full cursor-pointer text-zinc-400 hover:text-zinc-600"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-[7px] font-black uppercase tracking-wider">วางแมว</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Broadcast & Active Players Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Users Table (Col 2/3) */}
        <div className="lg:col-span-2 bg-white border border-[#e9ecef] rounded-[28px] p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-zinc-800 ">
            <Users className="w-4 h-4 text-emerald-500" /> รายชื่อผู้ใช้ในห้องเซิร์ฟเวอร์
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e9ecef] text-zinc-400  uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">ชื่อผู้เล่น</th>
                  <th className="py-3 px-4 font-bold">ไอดี (User ID)</th>
                  <th className="py-3 px-4 font-bold">ห้องเซิร์ฟเวอร์</th>
                  <th className="py-3 px-4 font-bold">พิกัดปัจจุบัน (X, Y)</th>
                  <th className="py-3 px-4 font-bold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9ecef]">
                {loadingPlayers ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-400  uppercase animate-pulse">
                      กำลังโหลดข้อมูลผู้เล่น...
                    </td>
                  </tr>
                ) : players.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-400 ">
                      ไม่มีผู้เล่นในห้องเซิร์ฟเวอร์ขณะนี้
                    </td>
                  </tr>
                ) : (
                  players.map((player) => (
                    <tr key={player.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-zinc-800">
                        {player.username}
                      </td>
                      <td className="py-3.5 px-4  text-zinc-400">
                        #{player.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-500">
                        {player.room || "Server Room A"}
                      </td>
                      <td className="py-3.5 px-4  text-zinc-500">
                        <span className="inline-flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 text-zinc-650">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          X: {Math.round(player.x)}, Y: {Math.round(player.y)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleKick(player.id, player.username)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-650 text-red-550 hover:text-white rounded text-[10px] font-bold transition-all inline-flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
                          title="เตะออกจากเซิร์ฟเวอร์"
                        >
                          <LogOut className="w-3 h-3" /> เตะออก
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Broadcast Board (Col 1/3) */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-6 flex flex-col gap-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-zinc-800 ">
              <Volume2 className="w-4 h-4 text-rose-500" /> ประกาศระบบ (Global Announcement)
            </h2>
            <p className="text-[10px] text-zinc-400">
              ส่งข้อความแจ้งเตือนหรือประกาศด่วนไปยังผู้เล่นทุกคนที่กำลังอยู่ในห้องเซิร์ฟเวอร์โดยตรง
            </p>
          </div>

          <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="พิมพ์ข้อความที่ต้องการประกาศที่นี่..."
              className="w-full min-h-[120px] bg-zinc-50 border border-[#e9ecef] hover:border-zinc-300 focus:border-rose-500 rounded-xl p-3.5 text-xs text-zinc-800 placeholder:text-zinc-650 outline-none transition-all resize-none font-sans"
              required
            />

            <button
              type="submit"
              disabled={sendingBroadcast || !announcement.trim()}
              className={`w-full py-2.5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${announcement.trim()
                  ? "bg-black hover:bg-zinc-900 text-white cursor-pointer shadow-md"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/50"
                }`}
            >
              <Volume2 className="w-4 h-4" /> {sendingBroadcast ? "กำลังประกาศ..." : "ส่งประกาศด่วน"}
            </button>
          </form>

          <div className="mt-2 p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl flex gap-2.5 items-start">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
              <strong>หมายเหตุความปลอดภัย:</strong> การประกาศและการเตะผู้ใช้จะมีผลทันทีกับ WebSocket Clients ของผู้เล่นที่เชื่อมต่ออยู่ การเตะผู้เล่นจะสลายสถานะ Socket และตัดการมองเห็นพิกัดของผู้เล่นทันที
            </p>
          </div>
        </div>
      </div>

      {/* Place Cat Modal Popup Dialog */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form 
            onSubmit={handleCreatePlacementSubmit}
            className="bg-white border border-zinc-200 rounded-[32px] max-w-sm w-full p-6 shadow-2xl relative text-left flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-zinc-900 font-black text-sm tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> จัดสรรแมวลงพิกัด #{selectedSlotIndex + 1}
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {/* Select User Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">เจ้าของสิทธิ์ (Owner User)</label>
                <div className="relative">
                  <select 
                    value={modalUserId}
                    onChange={(e) => setModalUserId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-indigo-500 appearance-none font-sans"
                    required
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.username} ({u.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Select Cat Template Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">เลือกสายพันธุ์แมว (Cat Template)</label>
                <div className="relative">
                  <select 
                    value={modalCatId}
                    onChange={(e) => setModalCatId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-indigo-500 appearance-none font-sans"
                    required
                  >
                    {systemCats.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.rarity}] {c.name} ({c.spRate} SP/s)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Cat Level Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ระดับเลเวลแมว (Level)</label>
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={modalCatLevel}
                  onChange={(e) => setModalCatLevel(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-indigo-500 font-sans"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowPlaceModal(false)}
                className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                disabled={submittingPlacement}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md text-center active:scale-95"
              >
                {submittingPlacement ? "กำลังจัดวาง..." : "ตกลงจัดวาง"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
