"use client";

import React, { useState, useEffect } from "react";
import { catsService } from "../../../../services/cats.service";
import { Plus, Edit2, Trash2, X, Cat, HelpCircle, Sparkles, Upload } from "lucide-react";

export default function CatsCrudPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState("COMMON");
  const [type, setType] = useState("standard");
  const [spRate, setSpRate] = useState("10");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await catsService.getAll();
      setCats(res?.data || res || []);
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถดึงข้อมูลแมวจากฐานข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openAddModal = () => {
    setSelectedCat(null);
    setName("");
    setBreed("");
    setAge("");
    setDescription("");
    setRarity("COMMON");
    setType("standard");
    setSpRate("10");
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setSelectedCat(cat);
    setName(cat.name || "");
    setBreed(cat.breed || "");
    setAge(cat.age ? String(cat.age) : "");
    setDescription(cat.description || "");
    setRarity(cat.rarity || "COMMON");
    setType(cat.type || "standard");
    setSpRate(cat.spRate ? String(cat.spRate) : "10");
    setImageFile(null);
    setImagePreview(cat.image || null);
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
    if (!name) return alert("จำเป็นต้องใส่ชื่อแมว");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("breed", breed);
    formData.append("age", age);
    formData.append("description", description);
    formData.append("rarity", rarity);
    formData.append("type", type);
    formData.append("spRate", spRate);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (selectedCat) {
        // Edit cat
        await catsService.update(selectedCat.id, formData);
        alert("อัปเดตข้อมูลแมวสำเร็จ");
      } else {
        // Create cat
        await catsService.create(formData);
        alert("เพิ่มข้อมูลแมวสำเร็จ");
      }
      setIsModalOpen(false);
      fetchCats();
    } catch (err) {
      console.error(err);
      alert("การดำเนินการล้มเหลว: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไอเทมแมวตัวนี้ออกจากระบบ?")) return;
    try {
      await catsService.delete(id);
      alert("ลบข้อมูลแมวสำเร็จ");
      fetchCats();
    } catch (err) {
      console.error(err);
      alert("การลบล้มเหลว");
    }
  };

  if (loading && cats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono">
        <div className="text-zinc-500 animate-pulse text-xs uppercase">กำลังโหลดฐานข้อมูลแมว...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-slate-100 flex items-center gap-2">
            <Cat className="w-6 h-6 text-rose-500" /> ฐานข้อมูลไอเทมแมว
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">ตั้งค่าและจัดการข้อมูลแมวภายในเกม</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> เพิ่มแมวใหม่
        </button>
      </div>

      {/* Database Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map((cat) => (
          <div key={cat.id} className="bg-[#101114] border border-zinc-900 rounded-xl p-5 flex flex-col gap-4 relative group">
            {/* Action buttons on hover */}
            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => openEditModal(cat)}
                className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-blue-500 rounded-md transition-colors"
                title="แก้ไข"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-500 text-zinc-400 hover:text-red-500 rounded-md transition-colors"
                title="ลบ"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cat Thumbnail */}
            <div className="h-36 bg-black/20 border border-zinc-900 rounded-lg flex items-center justify-center overflow-hidden relative">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain p-2" />
              ) : (
                <HelpCircle className="w-12 h-12 text-zinc-800 stroke-[1]" />
              )}
              {/* Rarity Tag */}
              <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[8px] font-black bg-black/80 text-rose-400 border border-rose-950/45 rounded font-mono uppercase tracking-widest">
                {cat.rarity}
              </span>
            </div>

            {/* Info details */}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black text-slate-200">{cat.name}</h3>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{cat.breed || "ไม่ได้ระบุสายพันธุ์"}</p>
              
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-900 text-xs">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-mono block">พลังงานที่ผลิตได้</span>
                  <span className="font-mono text-emerald-500 font-bold">+{cat.spRate} SP/วินาที</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-mono block">ประเภทโมเดล</span>
                  <span className="font-mono text-blue-400 font-bold capitalize">{cat.type}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {cats.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500 font-mono italic border border-dashed border-zinc-800 rounded-xl">
            ไม่มีข้อมูลแมวในฐานข้อมูล คลิก "เพิ่มแมวใหม่" เพื่อสร้างข้อมูลเริ่มต้น
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#101114] border border-zinc-800 rounded-2xl p-6 relative flex flex-col gap-4 font-sans max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black tracking-wider text-slate-100 uppercase border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" /> {selectedCat ? "แก้ไขข้อมูลแมว" : "เพิ่มข้อมูลแมวใหม่"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">ชื่อแมว *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Tabby Cat"
                  className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-bold transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">สายพันธุ์</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="เช่น Shorthair"
                    className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-bold transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">อายุ (เดือน)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="เช่น 12"
                    className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-bold transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">ระดับความหายาก</label>
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value)}
                    className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-bold transition-colors"
                  >
                    <option value="COMMON">COMMON</option>
                    <option value="RARE">RARE</option>
                    <option value="EPIC">EPIC</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                    <option value="MYTHIC">MYTHIC</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">ประเภท</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-bold transition-colors"
                  >
                    <option value="standard">Standard</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">อัตราผลิต SP/วินาที</label>
                  <input
                    type="number"
                    required
                    value={spRate}
                    onChange={(e) => setSpRate(e.target.value)}
                    placeholder="10"
                    className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-bold transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">คำอธิบาย</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="เขียนข้อมูลรายละเอียดแมว..."
                  rows="3"
                  className="bg-black/40 border border-zinc-800 focus:border-rose-500 rounded-lg p-2.5 text-white transition-colors resize-none"
                />
              </div>

              {/* Image Upload Box */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] font-mono">รูปภาพโมเดลแมว</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-black/40 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <HelpCircle className="w-8 h-8 text-zinc-800 stroke-[1]" />
                    )}
                  </div>
                  <label className="flex-1 flex flex-col items-center justify-center p-4 border border-zinc-800 border-dashed rounded-lg cursor-pointer hover:border-rose-500 transition-colors bg-black/20">
                    <Upload className="w-5 h-5 text-zinc-500" />
                    <span className="text-[10px] text-zinc-500 uppercase font-mono mt-1 font-bold">เลือกไฟล์</span>
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
                  {selectedCat ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มแมว"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
