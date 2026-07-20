"use client";

import React from "react";

export default function Header({ userName = "muping", userEmail = "userone@gmail.com" }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-[#17181a]">
      {/* Left Spacer */}
      <div className="w-48" />

      {/* Center LOGO */}
      <div className="text-2xl font-bold tracking-[0.2em] text-white">
        LOGO
      </div>

      {/* Right User Profile Info */}
      <div className="flex items-center gap-3 w-48 justify-end text-right">
        <div className="text-xs">
          <div className="font-semibold text-white">{userName}</div>
          <div className="text-[10px] text-zinc-500">{userEmail}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-600 border border-zinc-500 flex items-center justify-center text-sm font-semibold text-white">
          {userName.substring(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
