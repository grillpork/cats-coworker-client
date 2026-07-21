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
      <div className="flex-1 flex items-center justify-center ">
        <div className="text-zinc-500 animate-pulse text-xs uppercase">กำลังโหลดข้อมูลภาพแผนที่...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1 font-sans">
      {/* Floating Action Button */}
      <button
        onClick={openAddModal}
        className="fixed bottom-8 right-8 z-30 px-4 py-4 bg-black hover:bg-zinc-900 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Grid Palette */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {sprites.map((sprite) => (
          <div key={sprite.id} className="bg-white border border-[#e9ecef] rounded-2xl p-4 flex flex-col gap-3 relative group shadow-sm hover:shadow-md hover:border-zinc-350 transition-all">
            {/* Hover Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => openEditModal(sprite)}
                className="p-1 bg-white border border-[#e9ecef] hover:border-blue-500 text-zinc-400 hover:text-blue-500 rounded transition-colors cursor-pointer shadow-sm"
                title="แก้ไข"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => openDeleteModal(sprite.tileId)}
                className="p-1 bg-white border border-[#e9ecef] hover:border-red-500 text-zinc-400 hover:text-red-500 rounded transition-colors cursor-pointer shadow-sm"
                title="ลบ"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="aspect-square bg-[#f8f9fa] border border-[#e9ecef] rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
              {sprite.image ? (
                <img src={sprite.image} alt={sprite.name} className="w-full h-full object-contain p-2" />
              ) : (
                <HelpCircle className="w-8 h-8 text-zinc-300" />
              )}
            </div>

            {/* Details */}
            <div className="text-center">
              <div className="text-[10px] font-bold text-zinc-800 truncate">{sprite.name}</div>
              <div className="text-[9px] text-zinc-500  mt-0.5">ไอดี: {sprite.tileId}</div>
            </div>
          </div>
        ))}

        {sprites.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-400  italic border border-dashed border-[#e9ecef] rounded-[28px] bg-white shadow-sm">
            ยังไม่มีชิ้นงานแผ่นแผนที่ในระบบ กดปุ่ม "เพิ่มภาพใหม่" เพื่อเพิ่ม
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white border border-[#e9ecef] rounded-[28px] p-6 relative flex flex-col gap-4 font-sans shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black tracking-wider text-zinc-800 uppercase border-b border-[#e9ecef] pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" /> {selectedSprite ? "แก้ไขข้อมูลภาพแผนที่" : "เพิ่มชิ้นส่วนกระเบื้องใหม่"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] ">ไอดีกระเบื้อง (Tile ID) *</label>
                <input
                  type="text"
                  required
                  disabled={!!selectedSprite}
                  value={tileId}
                  onChange={(e) => setTileId(e.target.value)}
                  placeholder="เช่น 17"
                  className="bg-white border border-[#e9ecef] focus:border-rose-500 rounded-xl p-2.5 text-zinc-800 font-bold outline-none transition-colors  disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] ">ชื่อแผ่นกระเบื้อง *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Floor 5 / Wall Right"
                  className="bg-white border border-[#e9ecef] focus:border-rose-500 rounded-xl p-2.5 text-zinc-800 font-bold outline-none transition-colors"
                />
              </div>

              {/* Upload image file */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] ">ไฟล์ภาพแผ่นแผนที่</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>
                  <label className="flex-1 flex flex-col items-center justify-center p-3 border border-[#e9ecef] border-dashed rounded-2xl cursor-pointer hover:border-rose-500 transition-colors bg-[#f8f9fa] hover:bg-zinc-50">
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span className="text-[9px] text-zinc-500 uppercase  mt-1 font-bold">เลือกภาพ</span>
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
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#e9ecef]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 rounded-xl font-bold text-zinc-500 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black hover:bg-zinc-900 text-white rounded-xl font-black cursor-pointer shadow-md"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white border border-[#e9ecef] rounded-[28px] p-6 relative flex flex-col gap-4 font-sans shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
            </div>

            <h2 className="text-base font-black tracking-wider text-zinc-800 uppercase">
              ยืนยันการลบรูปภาพแผนที่?
            </h2>

            <p className="text-xs text-zinc-550 text-zinc-500 leading-relaxed font-medium">
              คุณแน่ใจหรือไม่ว่าต้องการลบกระเบื้องไอดี <span className="text-red-650  font-black">#{tileIdToDelete}</span>? การลบกระเบื้องนี้จะส่งผลกระทบกับแผนที่/ด่านที่ใช้งานรูปภาพชิ้นนี้อยู่
            </p>

            <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-[#e9ecef]">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 rounded-xl font-bold text-xs text-zinc-500 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs cursor-pointer shadow-md"
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
