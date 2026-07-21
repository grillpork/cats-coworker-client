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
      <div className="flex-1 flex items-center justify-center ">
        <div className="text-zinc-500 animate-pulse text-xs uppercase">กำลังโหลดข้อมูลแผงควบคุม...</div>
      </div>
    );
  }

  const statCards = [
    { title: "เจ้าหน้าที่ลงทะเบียน", value: usersCount, desc: "บัญชีผู้ใช้งานระบบทั้งหมด", icon: Users, color: "text-blue-600", bg: "bg-white border-[#e9ecef]" },
    { title: "เทมเพลตแมวในระบบ", value: catsCount, desc: "จำนวนแมวที่กำหนดไว้ในฐานข้อมูล", icon: Cat, color: "text-rose-600", bg: "bg-white border-[#e9ecef]" },
    { title: "แมวที่กำลังทำงาน", value: activePlacementsCount, desc: "แมวที่จัดวางบนโต๊ะทำงาน", icon: Monitor, color: "text-emerald-600", bg: "bg-white border-[#e9ecef]" },
  ];

  return (
    <div className="flex flex-col gap-8 flex-1 font-sans">

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-6 rounded-2xl border ${card.bg} shadow-sm transition-all hover:scale-[1.02] hover:shadow-md flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ">{card.title}</span>
                <span className="text-3xl font-extrabold text-zinc-900 mt-1 block">{card.value}</span>
                <span className="text-[10px] text-zinc-500 mt-1.5 block font-medium">{card.desc}</span>
              </div>
              <div className={`p-3.5 rounded-2xl bg-zinc-50 border border-[#e9ecef] ${card.color} shadow-inner`}>
                <Icon className="w-7 h-7 stroke-[1.8]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Layout for Detail Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Recent Registered Users */}
        <div className="lg:col-span-2 bg-white border border-[#e9ecef] rounded-[28px] p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e9ecef] pb-3.5">
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2 ">
              <Users className="w-4 h-4 text-zinc-400" /> บันทึกข้อมูลเจ้าหน้าที่ล่าสุด
            </h2>
            <span className="text-[9px] bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-lg  font-bold uppercase border border-zinc-200/50">5 รายการล่าสุด</span>
          </div>

          <div className="flex flex-col">
            {recentUsers.map((u) => {
              const initials = u.name ? u.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "US";
              return (
                <div key={u.id} className="flex items-center justify-between py-3.5 border-b border-[#e9ecef] hover:bg-zinc-50/50 transition-colors px-1">
                  <div className="flex items-center gap-4 flex-1 truncate">
                    {/* Small checkbox mock matching mockup */}
                    <div className="w-4.5 h-4.5 rounded-md border border-zinc-200 flex items-center justify-center shrink-0 cursor-pointer hover:border-zinc-400 transition-colors" />

                    {/* Avatar initials bubble matching mockup */}
                    <div className="w-9 h-9 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center font-bold text-xs text-zinc-700 shrink-0 shadow-inner">
                      {initials}
                    </div>

                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-zinc-850 truncate">{u.name}</span>
                      <span className="text-[10px] text-zinc-400 truncate font-light ">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[9px] font-extrabold px-2.5 py-1 bg-emerald-100/60 text-emerald-700 border border-emerald-250/20 rounded-md  uppercase">
                      User
                    </span>
                    <span className="text-[10px] text-zinc-400  font-medium">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentUsers.length === 0 && (
              <div className="py-8 text-center text-zinc-400  italic text-xs">ยังไม่มีบันทึกข้อมูลเจ้าหน้าที่</div>
            )}
          </div>
        </div>

        {/* Live Systems Simulation */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-6 flex flex-col gap-6 shadow-sm">
          <div className="border-b border-[#e9ecef] pb-3.5">
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2 ">
              <Database className="w-4 h-4 text-zinc-400" /> การวินิจฉัยเครื่องเซิร์ฟเวอร์
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* CPU Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-zinc-650 text-zinc-650 text-zinc-650 text-zinc-500">อัตราการใช้งาน CPU</span>
                <span className=" text-rose-600 font-extrabold">{cpuUsage}%</span>
              </div>
              <div className="w-full bg-[#eef0f3] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-1000"
                  style={{ width: `${cpuUsage}%` }}
                ></div>
              </div>
            </div>

            {/* RAM Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-zinc-650 text-zinc-650 text-zinc-650 text-zinc-500">อัตราการใช้งาน RAM</span>
                <span className=" text-blue-600 font-extrabold">{ramUsage}%</span>
              </div>
              <div className="w-full bg-[#eef0f3] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-1000"
                  style={{ width: `${ramUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Active Workstation Placements */}
          <div className="mt-2 border-t border-[#e9ecef] pt-5">
            <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest mb-4 ">คิวการปฏิบัติงานของแมว</h3>
            <div className="flex flex-col gap-2.5">
              {placementsList.slice(0, 3).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-[#e9ecef] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-zinc-700">{p.cat?.name || "แมว"}</span>
                  </div>
                  <span className="text-[10px]  text-zinc-400 font-extrabold">โต๊ะทำงานช่องที่ {p.slotIndex + 1}</span>
                </div>
              ))}
              {placementsList.length === 0 && (
                <div className="text-center text-zinc-400  italic text-[10px] py-6 bg-zinc-50 border border-[#e9ecef] rounded-xl">
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
