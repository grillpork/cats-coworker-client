import React, { useState, useEffect } from 'react';
import { Zap, Coins, Gem, Settings, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authServices } from '../../services/auth.service';
import { characterService } from '../../services/character.service';

export default function TopNavbar({ isAuthenticated, user }) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || user?.username || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "");
  const [availAvatars, setAvailAvatars] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || user.username || "");
      setSelectedAvatar(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    if (isProfileOpen) {
      const loadAvatars = async () => {
        try {
          const res = await characterService.getAll();
          setAvailAvatars(res?.data || res || []);
        } catch (e) {
          console.error("Failed to load avatars:", e);
        }
      };
      loadAvatars();
    }
  }, [isProfileOpen]);

  const handleAction = (callback) => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    if (callback) callback();
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return alert("กรุณากรอกชื่อเล่น");
    try {
      await authServices.updateProfile(editName.trim(), selectedAvatar);
      alert("ปรับปรุงโปรไฟล์สำเร็จ!");
      setIsProfileOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("ล้มเหลวในการตั้งค่าโปรไฟล์: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex items-center justify-between w-full z-20 mb-4 font-sans">
      {/* Profile Area */}
      <div
        onClick={() => handleAction(() => setIsProfileOpen(true))}
        className="flex items-center gap-3 bg-[#0d47a1]/70 border-4 border-white/95 rounded-full py-1.5 pl-2 pr-5 shadow-lg backdrop-blur-sm cursor-pointer hover:scale-102 transition-all group"
        title="คลิกเพื่อตั้งค่าโปรไฟล์"
      >
        <div className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden shadow-md shrink-0">
          <img 
            src={user?.avatar?.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${user?.avatar || '/mc-00.png'}`} 
            alt="User Avatar" 
            className="w-8 h-8 object-contain"
            onError={(e) => { e.target.src = "/mc-00.png"; }}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-white font-black text-xs tracking-wider drop-shadow-md group-hover:text-yellow-300 transition-colors flex items-center gap-1">
            <span>{isAuthenticated ? (user?.name || user?.username || user?.email?.split('@')[0]) : "Not Logged In"}</span>
            <Settings size={10} className="opacity-60 group-hover:opacity-100" />
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
          <span className="text-white font-black text-xs  drop-shadow">48/48</span>
          <span
            onClick={() => handleAction(() => alert("Energy Purchased!"))}
            className="text-yellow-300 font-extrabold text-xs cursor-pointer hover:scale-110 transition"
          >
            +
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#0d47a1]/70 border-[3px] border-white rounded-full py-1 px-3.5 shadow-md">
          <Coins size={16} className="text-yellow-400" />
          <span className="text-white font-black text-xs  drop-shadow">
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
          <span className="text-white font-black text-xs  drop-shadow">1,200</span>
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
          title="Logout"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Profile Settings Modal Popup */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#101114] border border-zinc-800 rounded-[32px] max-w-sm w-full p-6 shadow-2xl relative text-left">
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-white font-black text-base tracking-wider mb-4 flex items-center gap-2">
              <Settings className="text-yellow-400 w-5 h-5" /> ตั้งค่าโปรไฟล์ผู้เล่น
            </h3>
            
            <div className="flex flex-col gap-4">
              {/* Nickname input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ชื่อเล่น (Nickname)</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="ชื่อเล่นของคุณ" 
                  className="w-full bg-[#17181c] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

               {/* Avatar selection grid */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">เลือกตัวละครหลัก (Avatar)</label>
                <div className="grid grid-cols-4 gap-3 max-h-40 overflow-y-auto pr-1">
                  {/* Custom uploaded avatar */}
                  {selectedAvatar && (selectedAvatar.startsWith("/uploads/") || selectedAvatar.startsWith("http")) && (
                    <div 
                      onClick={() => setSelectedAvatar(selectedAvatar)}
                      className="aspect-square bg-[#17181c] border-2 rounded-2xl flex items-center justify-center p-2 cursor-pointer transition-all hover:scale-105 border-yellow-450 bg-yellow-500/5 relative"
                    >
                      <img 
                        src={selectedAvatar.startsWith("http") ? selectedAvatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${selectedAvatar}`} 
                        alt="Uploaded Avatar" 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = "/mc-00.png"; }}
                      />
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full scale-75">Custom</span>
                    </div>
                  )}

                  {availAvatars.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.avatarUrl;
                    return (
                      <div 
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.avatarUrl)}
                        className={`aspect-square bg-[#17181c] border-2 rounded-2xl flex items-center justify-center p-2 cursor-pointer transition-all hover:scale-105 ${
                          isSelected ? 'border-yellow-400 bg-yellow-500/5' : 'border-zinc-850 hover:border-zinc-700'
                        }`}
                      >
                        <img 
                          src={avatar.avatarUrl.startsWith("http") ? avatar.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${avatar.avatarUrl}`} 
                          alt={avatar.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = "/mc-00.png"; }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Custom Avatar */}
              <div className="flex flex-col gap-1.5 mt-0.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-sans">หรืออัปโหลดรูปภาพตัวเอง</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="avatar-upload" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const formData = new FormData();
                      formData.append("avatar", file);
                      
                      setIsUploading(true);
                      try {
                        const res = await authServices.uploadAvatar(formData);
                        const uploadedUrl = res.avatarUrl || res.data?.avatarUrl;
                        if (uploadedUrl) {
                          setSelectedAvatar(uploadedUrl);
                          alert("อัปโหลดรูปภาพสำเร็จ!");
                        }
                      } catch (err) {
                        console.error("Avatar upload failed:", err);
                        alert("อัปโหลดรูปภาพล้มเหลว: " + (err.response?.data?.error || err.message));
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                  />
                  <label 
                    htmlFor="avatar-upload" 
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 border border-zinc-750 active:scale-95"
                  >
                    {isUploading ? "กำลังอัปโหลด..." : "📁 เลือกไฟล์รูปภาพ"}
                  </label>
                  {selectedAvatar && (selectedAvatar.startsWith("/uploads/") || selectedAvatar.startsWith("http")) && (
                    <span className="text-[9px] text-emerald-450 font-bold">✓ อัปโหลดแล้ว</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <button 
                onClick={handleSaveProfile}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-black rounded-xl active:scale-95 transition-all mt-2 cursor-pointer"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
