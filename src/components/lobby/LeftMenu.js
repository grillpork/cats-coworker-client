import React from 'react';
import { useRouter } from 'next/navigation';
import { Cat, PenTool, Settings, Lock, BookOpen } from 'lucide-react';

export default function LeftMenu({ isAuthenticated, user }) {
  const router = useRouter();

  const handleAction = (route, callback) => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    if (route) {
      router.push(route);
    } else if (callback) {
      callback();
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-24 justify-center">
      <button 
        onClick={() => handleAction(null, () => alert("Hero clicked!"))}
        className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-b from-pink-400 to-pink-600 border-[3px] border-white rounded-2xl shadow-lg active:scale-95 transition-all relative text-white cursor-pointer"
      >
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[9px] font-black">2</div>
        <Cat size={24} className="mb-1" />
        <span className="text-[10px] font-black uppercase tracking-wider">Hero</span>
      </button>

      <button 
        onClick={() => handleAction('/map-editor')}
        className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-b from-amber-400 to-orange-500 border-[3px] border-white rounded-2xl shadow-lg active:scale-95 transition-all text-white text-center cursor-pointer"
      >
        <PenTool size={24} className="mb-1" />
        <span className="text-[9px] font-black uppercase tracking-wider leading-tight">Editor</span>
      </button>

      {isAuthenticated && user?.roleName?.toLowerCase() === "admin" ? (
        <button 
          onClick={() => handleAction('/backoffice/overview')}
          className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-b from-indigo-400 to-indigo-600 border-[3px] border-white rounded-2xl shadow-lg active:scale-95 transition-all text-white text-center cursor-pointer"
        >
          <Settings size={24} className="mb-1" />
          <span className="text-[9px] font-black uppercase tracking-wider leading-tight">Admin</span>
        </button>
      ) : (
        <div 
          onClick={() => handleAction()}
          className="w-20 h-20 bg-zinc-800/20 border-[3px] border-zinc-700/30 rounded-2xl flex flex-col items-center justify-center text-zinc-500/50 cursor-pointer"
        >
          <Lock size={20} className="mb-1" />
          <span className="text-[8px] font-black uppercase">Locked</span>
        </div>
      )}

      <button 
        onClick={() => handleAction(null, () => alert("📖 วิธีเล่นเบื้องต้น:\n1. เดินตัวละครด้วย W, A, S, D หรือปุ่มลูกศร\n2. เข้าไปหยิบและวางแมวในพื้นที่โต๊ะทำงานเพื่อขุดเหรียญ SP\n3. กดปุ่ม F เมื่อเดินใกล้ตัวละครอื่น เพื่อมอบของขวัญแมวให้เพื่อนในห้องเซิร์ฟเวอร์"))}
        className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-b from-emerald-400 to-emerald-600 border-[3px] border-white rounded-2xl shadow-lg active:scale-95 transition-all text-white cursor-pointer"
      >
        <BookOpen size={24} className="mb-1" />
        <span className="text-[9px] font-black uppercase tracking-wider">Guide</span>
      </button>
    </div>
  );
}
