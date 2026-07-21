"use client";

import React, { useState, useEffect } from "react";
import { characterService } from "../../../../services/character.service";
import { Plus, Trash2, X, Sparkles, Smile, Upload, Pencil } from "lucide-react";

export default function CharactersManagementPage() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

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
    setEditId(null);
    setName("");
    setPrice("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (char) => {
    setEditId(char.id);
    setName(char.name);
    setPrice(char.price !== undefined ? char.price.toString() : "0");
    setAvatarFile(null);
    setAvatarPreview(char.avatarUrl);
    setIsModalOpen(true);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return alert("กรุณากรอกชื่อตัวละคร");
    }
    if (!editId && !avatarFile) {
      return alert("กรุณาอัปโหลดรูปภาพตัวละคร");
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price ? parseInt(price, 10) : 0);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      if (editId) {
        await characterService.update(editId, formData);
        alert("แก้ไขข้อมูลตัวละครสำเร็จ");
      } else {
        await characterService.create(formData);
        alert("บันทึกข้อมูลตัวละครสำเร็จ");
      }
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
      {/* Floating Action Button */}
      <button
        onClick={openAddModal}
        className="fixed bottom-8 right-8 z-30 px-4 py-4 bg-black hover:bg-zinc-900 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-zinc-400 font-bold ">กำลังโหลดข้อมูลตัวละคร...</span>
        </div>
      ) : characters.length === 0 ? (
        <div className="border border-[#e9ecef] bg-white rounded-[28px] p-16 text-center text-zinc-400 shadow-sm">
          <Smile className="w-12 h-12 mx-auto stroke-[1.5] text-zinc-300 mb-3" />
          <p className="text-sm font-bold text-zinc-800">ไม่พบข้อมูลตัวละครในระบบ</p>
          <p className="text-xs text-zinc-500 mt-1">กดปุ่ม "เพิ่มตัวละครใหม่" ด้านบนเพื่อเพิ่มเข้าระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {characters.map((char) => (
            <div
              key={char.id}
              className="bg-white border border-[#e9ecef] rounded-[24px] p-5 flex flex-col items-center gap-4 relative overflow-hidden group shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
            >
              {/* Action buttons on hover */}
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => openEditModal(char)}
                  className="w-8 h-8 rounded-full bg-white border border-[#e9ecef] text-zinc-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  title="แก้ไขตัวละคร"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(char.id, char.name)}
                  className="w-8 h-8 rounded-full bg-white border border-[#e9ecef] text-zinc-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  title="ลบตัวละคร"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-32 h-32 bg-[#f8f9fa] rounded-2xl flex items-center justify-center p-3 border border-[#e9ecef] shadow-inner group-hover:scale-105 transition-transform duration-300">
                <img
                  src={char.avatarUrl.startsWith("http") ? char.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${char.avatarUrl}`}
                  alt={char.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "/mc-00.png";
                  }}
                />
              </div>

              <div className="text-center w-full">
                <h4 className="text-sm font-bold text-zinc-800 truncate">{char.name}</h4>
                <div className="text-[10px] font-black text-rose-500 mt-1">
                  💰 {char.price || 0} SP
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#e9ecef] rounded-[28px] max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

             <h3 className="text-lg font-black text-rose-500 tracking-wider flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" /> {editId ? "แก้ไขข้อมูลตัวละคร" : "เพิ่มตัวละครใหม่"}
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              {editId ? "ปรับปรุงข้อมูลและรูปภาพของตัวละครที่มีอยู่ในระบบ" : "ระบุรายละเอียดและอัปโหลดไฟล์รูปภาพตัวละคร"}
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
                  className="w-full bg-white border border-[#e9ecef] rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-650 outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ราคาตัวละคร (SP)</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="ตัวอย่าง: 100"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white border border-[#e9ecef] rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-650 outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">อัปโหลดรูปภาพตัวละคร</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input").click()}
                  className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    isDragging 
                      ? "border-rose-500 bg-rose-50/50" 
                      : "border-zinc-300 bg-[#f8f9fa] hover:border-zinc-400"
                  }`}
                >
                  {avatarPreview ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-16 h-16 overflow-hidden">
                        <img
                          src={avatarPreview.startsWith("data:") ? avatarPreview : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${avatarPreview}`}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] text-zinc-700 font-bold leading-tight truncate max-w-[220px]">
                        {avatarFile ? avatarFile.name : "รูปภาพที่เลือก"}
                      </span>
                      <span className="text-[9px] text-zinc-400">คลิกหรือลากไฟล์ใหม่เพื่อเปลี่ยน</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-zinc-400" />
                      <span className="text-[11px] text-zinc-650 font-bold leading-tight">
                        ลากรูปภาพมาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์
                      </span>
                      <span className="text-[9px] text-zinc-400">รองรับไฟล์ JPEG, PNG, WEBP ขนาดไม่เกิน 2MB</span>
                    </>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-500 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black hover:bg-zinc-900 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
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
