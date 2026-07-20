"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Cat, Map, LogOut, ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function Sidebar({ user, logout }) {
  const pathname = usePathname();

  const navItems = [
    { name: "ภาพรวมระบบ", path: "/backoffice/overview", icon: LayoutDashboard },
    { name: "จัดการผู้ใช้งาน", path: "/backoffice/user", icon: Users },
    { name: "จัดการข้อมูลแมว", path: "/backoffice/cats", icon: Cat },
    { name: "จัดการภาพแผนที่", path: "/backoffice/sprites", icon: ImageIcon },
    { name: "เครื่องมือจัดแผนที่", path: "/backoffice/map-editor", icon: Map },
  ];

  return (
    <aside className="w-72 bg-[#101114] border-r border-zinc-900 flex flex-col justify-between shrink-0 font-sans">
      <div>
        {/* Logo / Admin Badge */}
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <span className="text-rose-500 font-black text-sm">CO</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-rose-500 uppercase">แผงควบคุมแอดมิน</h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">แผงควบคุม v1.0</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex flex-col gap-1">
          <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-3 mb-2 font-mono">คอนโซลหลัก</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-rose-500" : "text-zinc-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Back to game button at bottom */}
      <div className="p-4 border-t border-zinc-900/60">
        <Link
          href="/"
          className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:border-rose-500 hover:bg-zinc-900/80 rounded-lg text-[10px] font-black tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> กลับไปเล่นเกม
        </Link>
      </div>
    </aside>
  );
}
