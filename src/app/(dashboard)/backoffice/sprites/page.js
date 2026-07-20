"use client";

import React, { useState, useEffect } from "react";
import { mapService } from "../../../../services/map.service";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Sparkles, Upload, HelpCircle, AlertTriangle } from "lucide-react";

export default function SpritesManagementPage() {
  const [sprites, setSprites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSprite, setSelectedSprite] = useState(null);

  // Form states
  const [tileId, setTileId] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tileIdToDelete, setTileIdToDelete] = useState("");

  const fetchSprites = async () => {
    setLoading(true);
    try {
      const res = await mapService.getSprites();
      setSprites(res?.data || res || []);
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถดึงข้อมูลภาพแผนที่จากระบบได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprites();
  }, []);

  const openAddModal = () => {
    setSelectedSprite(null);
    setTileId("");
    setName("");
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sprite) => {
    setSelectedSprite(sprite);
    setTileId(sprite.tileId);
    setName(sprite.name || "");
    setImageFile(null);
    setImagePreview(sprite.image || null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tileId || !name) return alert("กรุณากรอกไอดีกระเบื้องและชื่อชิ้นงาน");

    const formData = new FormData();
    formData.append("tileId", tileId);
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await mapService.upsertSprite(formData);
      alert("บันทึกข้อมูลภาพแผนที่สำเร็จ");
      setIsModalOpen(false);
      fetchSprites();
    } catch (err) {
      console.error(err);
      alert("ดำเนินการล้มเหลว: " + (err.response?.data?.error || err.message));
    }
  };

  const openDeleteModal = (tId) => {
    setTileIdToDelete(tId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await mapService.deleteSprite(tileIdToDelete);
      alert("ลบรูปภาพแผนที่สำเร็จ");
      setIsDeleteModalOpen(false);
      fetchSprites();
    } catch (err) {
      console.error(err);
      alert("การดำเนินการล้มเหลว");
    }
  };

  if (loading && sprites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono">
        <div className="text-zinc-500 animate-pulse text-xs uppercase">กำลังโหลดข้อมูลภาพแผนที่...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-rose-500" /> ฐานข้อมูลภาพแผนที่ (Sprite Map)
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">จัดการภาพแผ่นกระเบื้องปูพื้น กำแพง และของตกแต่งแผนที่</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> เพิ่มภาพใหม่
        </button>
      </div>

      {/* Grid Palette */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {sprites.map((sprite) => (
          <div key={sprite.id} className="bg-[#101114] border border-zinc-900 rounded-xl p-4 flex flex-col gap-3 relative group">
            {/* Hover Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => openEditModal(sprite)}
                className="p-1 bg-zinc-900 border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-blue-500 rounded transition-colors"
                title="แก้ไข"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => openDeleteModal(sprite.tileId)}
                className="p-1 bg-zinc-900 border border-zinc-800 hover:border-red-500 text-zinc-400 hover:text-red-500 rounded transition-colors"
                title="ลบ"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="aspect-square bg-black/30 border border-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
              {sprite.image ? (
                <img src={sprite.image} alt={sprite.name} className="w-full h-full object-contain p-2" />
              ) : (
                <HelpCircle className="w-8 h-8 text-zinc-800" />
              )}
            </div>

            {/* Details */}
            <div className="text-center">
              <div className="text-[10px] font-bold text-slate-300 truncate">{sprite.name}</div>
              <div className="text-[9px] text-zinc-500 font-mono mt-0.5">ไอดี: {sprite.tileId}</div>
            </div>
          </div>
        ))}

        {sprites.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 font-mono italic border border-dashed border-zinc-800 rounded-xl">
            ยังไม่มีชิ้นงานแผ่นแผนที่ในระบบ กดปุ่ม "เพิ่มภาพใหม่" เพื่อเพิ่ม
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#101114] border border-zinc-800 rounded-2xl p-6 relative flex flex-col gap-4 font-sans shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black tracking-wider text-slate-100 uppercase border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" /> {selectedSprite ? "แก้ไขข้อมูลภาพแผนที่" : "เพิ่มชิ้นส่วนกระเบื้องใหม่"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">ไอดีกระเบื้อง (Tile ID) *</label>
                <input
                  type="text"
                  required
                  disabled={!!selectedSprite}
                  value={tileId}
                  onChange={(e) => setTileId(e.target.value)}
                  placeholder="เช่น 17"
                  className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-bold transition-colors font-mono disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">ชื่อแผ่นกระเบื้อง *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Floor 5 / Wall Right"
                  className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-bold transition-colors"
                />
              </div>

              {/* Upload image file */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">ไฟล์ภาพแผ่นแผนที่</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-black/40 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-zinc-800" />
                    )}
                  </div>
                  <label className="flex-1 flex flex-col items-center justify-center p-3 border border-zinc-800 border-dashed rounded-lg cursor-pointer hover:border-rose-500 transition-colors bg-black/20">
                    <Upload className="w-4 h-4 text-zinc-500" />
                    <span className="text-[9px] text-zinc-500 uppercase font-mono mt-1 font-bold">เลือกภาพ</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black"
                >
                  {selectedSprite ? "บันทึกข้อมูล" : "สร้างชิ้นงาน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#101114] border border-zinc-800 rounded-2xl p-6 relative flex flex-col gap-4 font-sans shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
            </div>

            <h2 className="text-base font-black tracking-wider text-slate-100 uppercase">
              ยืนยันการลบรูปภาพแผนที่?
            </h2>

            <p className="text-xs text-zinc-400 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบกระเบื้องไอดี <span className="text-red-400 font-mono font-bold">#{tileIdToDelete}</span>? การลบกระเบื้องนี้จะส่งผลกระทบกับแผนที่/ด่านที่ใช้งานรูปภาพชิ้นนี้อยู่
            </p>

            <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-zinc-900">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black text-xs"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
