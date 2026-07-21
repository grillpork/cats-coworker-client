"use client";

import React, { useState, useEffect } from "react";
import { characterService } from "../../../../services/character.service";
import { Plus, Trash2, X, Sparkles, Smile } from "lucide-react";

export default function CharactersManagementPage() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const res = await characterService.getAll();
      setCharacters(res?.data || res || []);
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถดึงข้อมูลตัวละครจากระบบได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const openAddModal = () => {
    setName("");
    setAvatarUrl("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !avatarUrl.trim()) {
      return alert("กรุณากรอกชื่อและที่อยู่รูปภาพตัวละคร");
    }

    try {
      await characterService.create(name.trim(), avatarUrl.trim());
      alert("บันทึกข้อมูลตัวละครสำเร็จ");
      setIsModalOpen(false);
      fetchCharacters();
    } catch (err) {
      console.error(err);
      alert("ดำเนินการล้มเหลว: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, charName) => {
    if (!confirm(`คุณต้องการลบตัวละคร "${charName}" ใช่หรือไม่?`)) return;
    try {
      await characterService.delete(id);
      alert("ลบตัวละครสำเร็จ");
      fetchCharacters();
    } catch (err) {
      console.error(err);
      alert("ดำเนินการล้มเหลว: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-rose-500 tracking-wider flex items-center gap-2">
            <Smile className="w-6 h-6 text-rose-500" /> จัดการตัวละคร (Characters)
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            เพิ่ม ลบ และอัปเดตข้อมูลตัวละครหลักที่ผู้เล่นสามารถเลือกใช้งานได้ในเกม
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-rose-950/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> เพิ่มตัวละครใหม่
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-zinc-500 font-bold font-mono">กำลังโหลดข้อมูลตัวละคร...</span>
        </div>
      ) : characters.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-16 text-center text-zinc-500">
          <Smile className="w-12 h-12 mx-auto stroke-[1.5] text-zinc-600 mb-3" />
          <p className="text-sm font-bold">ไม่พบข้อมูลตัวละครในระบบ</p>
          <p className="text-xs text-zinc-600 mt-1">กดปุ่ม "เพิ่มตัวละครใหม่" ด้านบนเพื่อเพิ่มเข้าระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {characters.map((char) => (
            <div 
              key={char.id}
              className="bg-[#111215] border border-zinc-900 rounded-[20px] p-5 flex flex-col items-center gap-4 relative overflow-hidden group shadow-md hover:border-zinc-800 transition-all"
            >
              {/* Delete button top right */}
              <button
                onClick={() => handleDelete(char.id, char.name)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="ลบตัวละคร"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-32 h-32 bg-zinc-950/40 rounded-2xl flex items-center justify-center p-3 border border-zinc-900/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <img
                  src={char.avatarUrl}
                  alt={char.name}
                  className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
                  onError={(e) => {
                    e.target.src = "/mc-00.png";
                  }}
                />
              </div>

              <div className="text-center w-full">
                <h4 className="text-sm font-bold text-slate-200 truncate">{char.name}</h4>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 bg-zinc-950/50 px-3 py-1.5 rounded-lg truncate select-all" title={char.avatarUrl}>
                  {char.avatarUrl}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#111215] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-rose-500 tracking-wider flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" /> เพิ่มตัวละครใหม่
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              ระบุรายละเอียดและ path ของไฟล์รูปภาพตัวละคร
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ชื่อตัวละคร</label>
                <input
                  type="text"
                  required
                  placeholder="ตัวอย่าง: Cat Hero Pink"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-zinc-650 outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Avatar URL / Path</label>
                <input
                  type="text"
                  required
                  placeholder="ตัวอย่าง: /mc-00.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-zinc-650 outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {avatarUrl && (
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                  <span className="text-[9px] font-bold text-zinc-500">ตัวอย่างรูปภาพ:</span>
                  <div className="w-16 h-16">
                    <img 
                      src={avatarUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "/mc-00.png";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
