"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authServices } from "../../services/auth.service";
import { catsService } from "../../services/cats.service";
import { characterService } from "../../services/character.service";
import { mapService } from "../../services/map.service";
import {
  LayoutDashboard,
  Users,
  Cat,
  Map,
  ArrowLeft,
  Image as ImageIcon,
  Server,
  Smile,
  ChevronDown,
  Activity,
  LogOut,
  Cloud
} from "lucide-react";

export default function Sidebar({ user, logout }) {
  const pathname = usePathname();
  const [storageInfo, setStorageInfo] = useState({
    totalSizeBytes: 0,
    limitBytes: 50 * 1024 * 1024,
    totalSizePretty: "0.00 MB",
    limitPretty: "50.00 MB",
    percentage: 0
  });

  const [counts, setCounts] = useState({ cats: 0, characters: 0, sprites: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storageRes, catsRes, charsRes, spritesRes] = await Promise.all([
          authServices.getStorageInfo().catch(() => null),
          catsService.getAll().catch(() => []),
          characterService.getAll().catch(() => []),
          mapService.getSprites().catch(() => [])
        ]);

        if (storageRes) {
          setStorageInfo(storageRes);
        }

        setCounts({
          cats: catsRes?.data?.length || catsRes?.length || 0,
          characters: charsRes?.data?.length || charsRes?.length || 0,
          sprites: spritesRes?.data?.length || spritesRes?.length || 0
        });
      } catch (e) {
        console.error("Failed to load sidebar statistics:", e);
      }
    };
    fetchData();
  }, []);

  const primaryItems = [
    { name: "ภาพรวมระบบ", path: "/backoffice/overview", icon: LayoutDashboard },
    { name: "จัดการผู้ใช้งาน", path: "/backoffice/user", icon: Users },
    { name: "จัดการ Server Room", path: "/backoffice/server-room", icon: Server },
    { name: "จัดการคลังเก็บข้อมูล", path: "/backoffice/storage", icon: Cloud },
  ];

  const gameDataItems = [
    { name: "จัดการข้อมูลแมว", path: "/backoffice/cats", icon: Cat, count: counts.cats },
    { name: "จัดการตัวละคร", path: "/backoffice/characters", icon: Smile, count: counts.characters },
    { name: "จัดการภาพแผนที่", path: "/backoffice/sprites", icon: ImageIcon, count: counts.sprites },
    { name: "เครื่องมือจัดแผนที่", path: "/backoffice/map-editor", icon: Map },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper to extract initials for user avatar
  const getInitials = () => {
    if (!user) return "AD";
    const nameStr = user.name || user.username || "Admin User";
    const parts = nameStr.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-[280px] bg-[#f8f9fa] border-r border-[#e9ecef] flex flex-col justify-between font-sans h-screen p-6 select-none">
      <div className="flex flex-col gap-6">
        {/* User Profile Header */}
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between p-1 bg-transparent cursor-pointer transition-all hover:opacity-80 active:scale-98"
          >
            <div className="flex items-center gap-3 truncate">
              {/* Initials Avatar */}
              <div className="w-10 h-10 rounded-full bg-white border border-[#e9ecef] flex items-center justify-center font-bold text-zinc-800 text-xs shadow-sm shrink-0">
                {getInitials()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-zinc-900 truncate">
                  {user?.name || user?.username || "Admin User"}
                </span>
                <span className="text-[10px] text-zinc-400 truncate font-light font-mono mt-0.5">
                  {user?.email || "admin@catako.site"}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className={`text-zinc-400 shrink-0 ml-1.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Floating Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#e9ecef] rounded-2xl shadow-md p-2 z-50 flex flex-col gap-1">
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-xs text-red-650 hover:bg-red-50 rounded-xl transition-all font-bold flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={14} />
                <span>ออกจากระบบ (Sign Out)</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Categories */}
        <div className="flex flex-col gap-5">
          {/* Main console category */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-3.5 mb-2 ">
              Mailbox
            </span>
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${isActive
                      ? "bg-white border-[#e9ecef] text-zinc-950 shadow-sm"
                      : "text-zinc-700 hover:text-zinc-950 bg-transparent border-transparent hover:bg-zinc-200/40"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-zinc-900" : "text-zinc-500"}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Game Data category */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-3.5 mb-2 ">
              Tags
            </span>
            {gameDataItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${isActive
                      ? "bg-white border-[#e9ecef] text-zinc-950 shadow-sm"
                      : "text-zinc-700 hover:text-zinc-950 bg-transparent border-transparent hover:bg-zinc-200/40"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-zinc-900" : "text-zinc-500"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[9px]  font-bold text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded-md">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info Widget & Action */}
      <div className="flex flex-col gap-4 font-sans">
        {/* Status widget box */}
        <div className="flex flex-col gap-2.5 px-1.5">
          <div className="flex gap-2.5 items-start">
            <Cloud size={16} className="text-zinc-700 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-zinc-900 leading-tight">
                {storageInfo.percentage > 80 ? "Storage almost full" : "Database Storage"}
              </span>
              <span className="text-[10px] text-zinc-400 font-normal leading-normal">
                {storageInfo.percentage > 80 ? "See our upgraded plans." : "Free tier workspace database."}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[9px] font-extrabold text-zinc-800 ">
              <span>{storageInfo.totalSizePretty}</span>
              <span>{storageInfo.limitPretty}</span>
            </div>
            {/* Elegant Gray Striped Progress Bar */}
            <div className="w-full h-3 bg-[#eef0f3] rounded-full overflow-hidden p-0.5 border border-zinc-200/20">
              <div
                className="h-full bg-zinc-300 rounded-full transition-all duration-500 relative"
                style={{
                  width: `${Math.min(100, storageInfo.percentage)}%`,
                  backgroundImage: "linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0.03) 75%, transparent 75%, transparent)",
                  backgroundSize: "8px 8px"
                }}
              />
            </div>
          </div>
        </div>

        {/* Upgrade / Back to Game Button */}
        <div className="flex flex-col gap-1.5">
          <Link
            href="/"
            className="w-full py-3 bg-black hover:bg-zinc-900 text-white rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-zinc-300" />
            <span>Upgrade Plan</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
