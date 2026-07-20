"use client";

import React from "react";
import { LogOut } from "lucide-react";

export default function Topbar({ user, logout }) {
  return (
    <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-[#101114]/30 backdrop-blur-md sticky top-0 z-20 font-sans">
      {/* Left side empty or page title */}
      <div></div>

      {/* Right side controls */}
      <div className="flex items-center gap-6">
        {/* Server Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">สถานะเซิร์ฟเวอร์: ออนไลน์</span>
        </div>

        {/* Divider line */}
        <div className="h-6 w-px bg-zinc-900"></div>

        {/* Userbox */}
        <div className="flex items-center gap-3 bg-[#111215]/80 border border-zinc-800/80 rounded-xl px-4 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="w-7 h-7 rounded-full bg-zinc-850 border border-zinc-700 flex items-center justify-center font-black text-xs text-rose-400 uppercase">
            {user?.name?.substring(0, 2)}
          </div>
          <div className="text-left select-none">
            <div className="text-xs font-black text-slate-200 leading-tight">{user?.name}</div>
            <div className="text-[9px] text-rose-500 font-mono font-bold uppercase leading-none mt-0.5">{user?.roleName || "Admin"}</div>
          </div>

          {/* Quick logout trigger in userbox */}
          <button
            onClick={logout}
            title="ออกจากระบบ"
            className="ml-2 p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-colors border border-transparent hover:border-rose-950/20"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
