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
    <div className="flex flex-col gap-6 flex-1 font-sans">
      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat card 1 */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-250/20 flex items-center justify-center text-emerald-600 shadow-inner">
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
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-250/20 flex items-center justify-center text-blue-600 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-zinc-900">9,600 SP</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">อัปเดตคลื่นวิทยาล่าสุด</div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

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
                {loading ? (
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
    </div>
  );
}
