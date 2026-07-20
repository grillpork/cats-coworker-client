"use client";

import React, { useState, useEffect } from "react";
import { authServices } from "../../../../services/auth.service";
import { catsService } from "../../../../services/cats.service";
import { Users, Cat, Monitor, Activity, Database, Calendar } from "lucide-react";

export default function OverviewPage() {
  const [usersCount, setUsersCount] = useState(0);
  const [catsCount, setCatsCount] = useState(0);
  const [activePlacementsCount, setActivePlacementsCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [placementsList, setPlacementsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // System stats simulation
  const [cpuUsage, setCpuUsage] = useState(32);
  const [ramUsage, setRamUsage] = useState(58);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all users
        const usersRes = await authServices.getAllUsers();
        const users = usersRes?.data || usersRes || [];
        setUsersCount(users.length);
        
        // Sort and get recent users (last 5)
        const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentUsers(sortedUsers.slice(0, 5));

        // Fetch all cats
        const catsRes = await catsService.getAll();
        const cats = catsRes?.data || catsRes || [];
        setCatsCount(cats.length);

        // Fetch placements
        const placementsRes = await catsService.getPlacements();
        const placements = placementsRes?.data || placementsRes || [];
        setActivePlacementsCount(placements.length);
        setPlacementsList(placements);

      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // CPU/RAM simulation interval
    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.max(15, Math.min(95, prev + Math.floor(Math.random() * 11) - 5)));
      setRamUsage((prev) => Math.max(40, Math.min(85, prev + Math.floor(Math.random() * 5) - 2)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono">
        <div className="text-zinc-500 animate-pulse text-xs uppercase">กำลังโหลดข้อมูลแผงควบคุม...</div>
      </div>
    );
  }

  const statCards = [
    { title: "เจ้าหน้าที่ลงทะเบียน", value: usersCount, desc: "บัญชีผู้ใช้งานระบบทั้งหมด", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { title: "เทมเพลตแมวในระบบ", value: catsCount, desc: "จำนวนแมวที่กำหนดไว้ในฐานข้อมูล", icon: Cat, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
    { title: "แมวที่กำลังทำงาน", value: activePlacementsCount, desc: "แมวที่จัดวางบนโต๊ะทำงาน", icon: Monitor, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ];

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black tracking-wider text-slate-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-rose-500" /> ภาพรวมระบบ
        </h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">สถิติเทอร์มินัลแบบเรียลไทม์และศูนย์ควบคุม</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-6 rounded-xl border ${card.bg} transition-all hover:scale-[1.02] flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-mono">{card.title}</span>
                <span className="text-3xl font-black text-slate-100 mt-1 block">{card.value}</span>
                <span className="text-[10px] text-zinc-400 mt-1.5 block">{card.desc}</span>
              </div>
              <div className={`p-4 rounded-xl bg-black/40 ${card.color}`}>
                <Icon className="w-8 h-8 stroke-[1.5]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Layout for Detail Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Recent Registered Users */}
        <div className="lg:col-span-2 bg-[#101114] border border-zinc-900 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" /> บันทึกข้อมูลเจ้าหน้าที่ล่าสุด
            </h2>
            <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono font-bold uppercase">5 รายการล่าสุด</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 uppercase font-mono font-bold text-[10px]">
                  <th className="pb-3">ชื่อ</th>
                  <th className="pb-3">อีเมลระบบ</th>
                  <th className="pb-3">วันที่เข้าร่วม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/20">
                    <td className="py-3 font-bold text-slate-300">{u.name}</td>
                    <td className="py-3 font-mono text-zinc-400">{u.email}</td>
                    <td className="py-3 text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-600" /> {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-zinc-500 font-mono italic">ยังไม่มีบันทึกข้อมูลเจ้าหน้าที่</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Systems Simulation */}
        <div className="bg-[#101114] border border-zinc-900 rounded-xl p-6 flex flex-col gap-6">
          <div className="border-b border-zinc-900 pb-3">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-500" /> การวินิจฉัยเครื่องเซิร์ฟเวอร์
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* CPU Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-zinc-400">อัตราการใช้งาน CPU</span>
                <span className="font-mono text-rose-500">{cpuUsage}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-1000"
                  style={{ width: `${cpuUsage}%` }}
                ></div>
              </div>
            </div>

            {/* RAM Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-zinc-400">อัตราการใช้งาน RAM</span>
                <span className="font-mono text-blue-500">{ramUsage}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-1000"
                  style={{ width: `${ramUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Active Workstation Placements */}
          <div className="mt-4 border-t border-zinc-900 pt-6">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">คิวการปฏิบัติงานของแมว</h3>
            <div className="flex flex-col gap-3">
              {placementsList.slice(0, 3).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-900 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-slate-300">{p.cat?.name || "แมว"}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">โต๊ะทำงานช่องที่ {p.slotIndex + 1}</span>
                </div>
              ))}
              {placementsList.length === 0 && (
                <div className="text-center text-zinc-500 font-mono italic text-[11px] py-4 bg-zinc-950/20 border border-zinc-900/50 rounded-lg">
                  ยังไม่มีแมวที่กำลังทำงานในขณะนี้
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
