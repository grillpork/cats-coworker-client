import React from 'react';
import { Zap, Coins, Gem, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopNavbar({ isAuthenticated, user }) {
  const router = useRouter();

  const handleAction = (callback) => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    if (callback) callback();
  };

  return (
    <div className="flex items-center justify-between w-full z-20 mb-4">
      {/* Profile Area */}
      <div 
        onClick={() => handleAction()} 
        className="flex items-center gap-3 bg-[#0d47a1]/70 border-4 border-white/95 rounded-full py-1.5 pl-2 pr-5 shadow-lg backdrop-blur-sm cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border-2 border-white flex items-center justify-center font-black text-white text-base shadow-md drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
          4
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-white font-black text-xs tracking-wider drop-shadow-md">
            {isAuthenticated ? (user?.name || user?.username || user?.email?.split('@')[0]) : "Not Logged In"}
          </span>
          <div className="w-24 h-2.5 bg-zinc-800 rounded-full border border-white/40 overflow-hidden p-[1px]">
            <div className="w-[60%] h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stat Badges */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2 bg-[#0d47a1]/70 border-[3px] border-white rounded-full py-1 px-3.5 shadow-md">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-white font-black text-xs font-mono drop-shadow">48/48</span>
          <span 
            onClick={() => handleAction(() => alert("Energy Purchased!"))} 
            className="text-yellow-300 font-extrabold text-xs cursor-pointer hover:scale-110 transition"
          >
            +
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#0d47a1]/70 border-[3px] border-white rounded-full py-1 px-3.5 shadow-md">
          <Coins size={16} className="text-yellow-400" />
          <span className="text-white font-black text-xs font-mono drop-shadow">
            {isAuthenticated && user?.sp !== undefined ? user.sp.toLocaleString() : "0"}
          </span>
          <span 
            onClick={() => handleAction(() => alert("Coins Purchased!"))} 
            className="text-yellow-300 font-extrabold text-xs cursor-pointer hover:scale-110 transition"
          >
            +
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#0d47a1]/70 border-[3px] border-white rounded-full py-1 px-3.5 shadow-md">
          <Gem size={16} className="text-purple-300" />
          <span className="text-white font-black text-xs font-mono drop-shadow">1,200</span>
          <span 
            onClick={() => handleAction(() => alert("Gems Purchased!"))} 
            className="text-yellow-300 font-extrabold text-xs cursor-pointer hover:scale-110 transition"
          >
            +
          </span>
        </div>
        <button 
          onClick={() => {
            handleAction(() => {
              if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
                window.location.href = "/auth/sign-in";
              }
            });
          }}
          className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#64b5f6] to-[#1e88e5] border-[3px] border-white flex items-center justify-center shadow-md active:scale-95 transition-all text-white font-bold cursor-pointer"
          title="Logout / Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
