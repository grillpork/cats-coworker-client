import React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, ClipboardList, Gift } from 'lucide-react';

export default function RightMenu({ isAuthenticated }) {
  const router = useRouter();

  const handleAction = (callback) => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    if (callback) callback();
  };

  return (
    <div className="flex flex-col gap-2.5 w-24 justify-center items-end">
      <button 
        onClick={() => handleAction(() => alert("Rank Clicked!"))}
        className="flex items-center gap-2 bg-white/95 border-[3px] border-[#0d47a1] rounded-l-full py-1.5 pl-4 pr-2.5 shadow-md hover:translate-x-[-4px] transition-all cursor-pointer"
      >
        <Trophy size={14} className="text-[#0d47a1]" />
        <span className="text-[#0d47a1] font-black text-[10px] uppercase tracking-wider">Rank</span>
      </button>
      <button 
        onClick={() => handleAction(() => alert("Inbox Clicked!"))}
        className="flex items-center gap-2 bg-white/95 border-[3px] border-[#0d47a1] rounded-l-full py-1.5 pl-4 pr-2.5 shadow-md hover:translate-x-[-4px] transition-all cursor-pointer"
      >
        <Mail size={14} className="text-[#0d47a1]" />
        <span className="text-[#0d47a1] font-black text-[10px] uppercase tracking-wider">Inbox</span>
      </button>
      <button 
        onClick={() => handleAction(() => alert("Quest Clicked!"))}
        className="flex items-center gap-2 bg-white/95 border-[3px] border-[#0d47a1] rounded-l-full py-1.5 pl-4 pr-2.5 shadow-md hover:translate-x-[-4px] transition-all cursor-pointer relative"
      >
        <div className="absolute top-[-3px] left-[6px] w-4.5 h-4.5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">6</div>
        <ClipboardList size={14} className="text-[#0d47a1]" />
        <span className="text-[#0d47a1] font-black text-[10px] uppercase tracking-wider">Quest</span>
      </button>
      <button 
        onClick={() => handleAction(() => alert("Reward Clicked!"))}
        className="flex items-center gap-2 bg-white/95 border-[3px] border-[#0d47a1] rounded-l-full py-1.5 pl-4 pr-2.5 shadow-md hover:translate-x-[-4px] transition-all cursor-pointer relative"
      >
        <div className="absolute top-[-3px] left-[6px] w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">2</div>
        <Gift size={14} className="text-[#0d47a1]" />
        <span className="text-[#0d47a1] font-black text-[10px] uppercase tracking-wider">Reward</span>
      </button>
    </div>
  );
}
