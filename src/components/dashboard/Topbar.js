"use client";

import React from "react";
import { Search, Lightbulb, Folder, Link as LinkIcon, Settings, Plus, LogOut } from "lucide-react";

export default function Topbar({ user, logout }) {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-transparent sticky top-0 z-20 font-sans">
      {/* Left side: Search input matching mock-up */}
      <div className="flex items-center bg-white border border-[#e9ecef] rounded-full px-5 py-2.5 w-80 shadow-sm">
        <Search size={16} className="text-zinc-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search console..." 
          className="bg-transparent border-0 outline-none text-xs text-zinc-700 placeholder-zinc-450 w-full"
        />
      </div>

      {/* Right side controls matching mock-up */}
      <div className="flex items-center gap-4">
        {/* Quick Circular Action Buttons */}
        <div className="flex items-center gap-2">
          <button title="Quick Tip" className="w-10 h-10 rounded-full bg-white border border-[#e9ecef] flex items-center justify-center text-zinc-650 hover:bg-zinc-50 active:scale-95 transition-all shadow-sm">
            <Lightbulb size={16} className="text-zinc-600" />
          </button>
          <button title="System Files" className="w-10 h-10 rounded-full bg-white border border-[#e9ecef] flex items-center justify-center text-zinc-650 hover:bg-zinc-50 active:scale-95 transition-all shadow-sm">
            <Folder size={16} className="text-zinc-600" />
          </button>
          <button title="Integration Links" className="w-10 h-10 rounded-full bg-white border border-[#e9ecef] flex items-center justify-center text-zinc-650 hover:bg-zinc-50 active:scale-95 transition-all shadow-sm">
            <LinkIcon size={16} className="text-zinc-600" />
          </button>
          <button title="Settings" className="w-10 h-10 rounded-full bg-white border border-[#e9ecef] flex items-center justify-center text-zinc-650 hover:bg-zinc-50 active:scale-95 transition-all shadow-sm">
            <Settings size={16} className="text-zinc-600" />
          </button>
          <button onClick={logout} title="Sign Out" className="w-10 h-10 rounded-full bg-white border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 active:scale-95 transition-all shadow-sm">
            <LogOut size={16} />
          </button>
        </div>

        {/* Black Action Button */}
        <button className="h-10 px-5 bg-black hover:bg-zinc-900 text-white rounded-full text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95">
          <Plus size={14} />
          <span>New action</span>
        </button>
      </div>
    </header>
  );
}
