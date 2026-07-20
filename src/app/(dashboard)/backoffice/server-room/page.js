"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../../../lib/api";
import { Server, Users, Volume2, LogOut, MapPin, Activity, ShieldAlert, Sparkles } from "lucide-react";

export default function ServerRoomManagementPage() {
  const [players, setPlayers] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const fetchOnlinePlayers = async () => {
    try {
      const res = await api.get("/api/admin/online-players");
      setPlayers(res || []);
    } catch (e) {
      console.error("Failed to fetch online players:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlinePlayers();
    // Poll for active coordinates updates every 3 seconds
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

  return (
    <div className="flex flex-col gap-6 flex-1 font-sans text-slate-100">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-slate-100 flex items-center gap-2">
            <Server className="w-6 h-6 text-rose-500" /> ควบคุมและจัดการ Server Room
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">
            มอนิเตอร์และบริหารจัดการผู้เล่นที่กำลังเชื่อมต่ออยู่ในระบบ Multiplayer แบบ Real-time
          </p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat card 1 */}
        <div className="bg-[#101114] border border-zinc-900 rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-md">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">{players.length} คน</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">ผู้เล่นออนไลน์อยู่ขณะนี้</div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Stat card 2 */}
        <div className="bg-[#101114] border border-zinc-900 rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-md">
          <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">ใช้งานปกติ</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">สถานะเซิร์ฟเวอร์ WS</div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Stat card 3 */}
        <div className="bg-[#101114] border border-zinc-900 rounded-xl p-5 flex items-center gap-4 relative overflow-hidden shadow-md">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">9,600 SP</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">อัปเดตคลื่นวิทยาล่าสุด</div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Users Table (Col 2/3) */}
        <div className="lg:col-span-2 bg-[#101114] border border-zinc-900 rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-zinc-300">
            <Users className="w-4 h-4 text-emerald-400" /> รายชื่อผู้ใช้ในห้องเซิร์ฟเวอร์
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">ชื่อผู้เล่น</th>
                  <th className="py-3 px-4 font-bold">ไอดี (User ID)</th>
                  <th className="py-3 px-4 font-bold">ห้องเซิร์ฟเวอร์</th>
                  <th className="py-3 px-4 font-bold">พิกัดปัจจุบัน (X, Y)</th>
                  <th className="py-3 px-4 font-bold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500 font-mono uppercase animate-pulse">
                      กำลังโหลดข้อมูลผู้เล่น...
                    </td>
                  </tr>
                ) : players.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-zinc-500 font-mono">
                      ไม่มีผู้เล่นในห้องเซิร์ฟเวอร์ขณะนี้
                    </td>
                  </tr>
                ) : (
                  players.map((player) => (
                    <tr key={player.id} className="border-b border-zinc-850 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {player.username}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500">
                        {player.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-400">
                        {player.room || "Server Room A"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        <span className="inline-flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          X: {Math.round(player.x)}, Y: {Math.round(player.y)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleKick(player.id, player.username)}
                          className="px-2.5 py-1 bg-red-950/40 hover:bg-red-500 border border-red-900/50 hover:border-red-600 text-red-400 hover:text-white rounded text-[10px] font-bold transition-all inline-flex items-center gap-1 active:scale-95"
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
        <div className="bg-[#101114] border border-zinc-900 rounded-xl p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-zinc-300">
              <Volume2 className="w-4 h-4 text-rose-500" /> ประกาศระบบ (Global Announcement)
            </h2>
            <p className="text-[10px] text-zinc-500">
              ส่งข้อความแจ้งเตือนหรือประกาศด่วนไปยังผู้เล่นทุกคนที่กำลังอยู่ในห้องเซิร์ฟเวอร์โดยตรง
            </p>
          </div>

          <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="พิมพ์ข้อความที่ต้องการประกาศที่นี่..."
              className="w-full min-h-[120px] bg-[#151619] border border-zinc-850 hover:border-zinc-700 focus:border-rose-500 rounded-xl p-3.5 text-xs text-slate-100 placeholder:text-zinc-600 outline-none transition-all resize-none font-sans"
              required
            />
            
            <button
              type="submit"
              disabled={sendingBroadcast || !announcement.trim()}
              className={`w-full py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                announcement.trim()
                  ? "bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                  : "bg-zinc-850 text-zinc-650 cursor-not-allowed border border-zinc-900"
              }`}
            >
              <Volume2 className="w-4 h-4" /> {sendingBroadcast ? "กำลังประกาศ..." : "ส่งประกาศด่วน"}
            </button>
          </form>

          <div className="mt-2 p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl flex gap-2.5 items-start">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-zinc-450 leading-relaxed">
              <strong>หมายเหตุความปลอดภัย:</strong> การประกาศและการเตะผู้ใช้จะมีผลทันทีกับ WebSocket Clients ของผู้เล่นที่เชื่อมต่ออยู่ การเตะผู้เล่นจะสลายสถานะ Socket และตัดการมองเห็นพิกัดของผู้เล่นทันที
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
