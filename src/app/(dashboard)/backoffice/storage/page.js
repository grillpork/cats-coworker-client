"use client";

import React, { useState, useEffect } from "react";
import { storageService } from "../../../../services/storage.service";
import { Database, HardDrive, Cloud, FileText, Settings, Server, RefreshCw } from "lucide-react";

export default function StorageManagementPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("local"); // 'local' | 'r2'

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await storageService.getStats();
      setStats(res?.data || res);
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถดึงข้อมูลสถิติคลังเก็บข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-zinc-400 font-bold">กำลังโหลดข้อมูลคลังเก็บข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 flex-1 font-sans">
      {/* Top action row */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">ระบบตรวจสอบพื้นที่</span>
        <button
          onClick={fetchStats}
          className="p-2.5 bg-white border border-[#e9ecef] hover:bg-zinc-50 rounded-xl text-zinc-600 transition-all flex items-center gap-2 shadow-sm text-xs font-bold active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> รีเฟรชข้อมูล
        </button>
      </div>

      {/* Grid of Storage types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PostgreSQL Database */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[9px] bg-indigo-50/50 border border-indigo-100/50 text-indigo-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">Active</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PostgreSQL DB</span>
            <h2 className="text-2xl font-black text-zinc-900 mt-1">{stats?.db?.sizePretty || "0.00 MB"}</h2>
            <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">ขนาดข้อมูลหลักรวม Index และ Schema ในระบบ</p>
          </div>
        </div>

        {/* Local storage */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-[9px] bg-emerald-50/50 border border-emerald-100/50 text-emerald-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">Local disk</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Local Uploads</span>
            <h2 className="text-2xl font-black text-zinc-900 mt-1">{stats?.local?.sizePretty || "0.00 MB"}</h2>
            <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">มีไฟล์ทั้งหมด {stats?.local?.files?.length || 0} ไฟล์ ในโฟลเดอร์ uploads/</p>
          </div>
        </div>

        {/* Cloudflare R2 Storage */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
              <Cloud className="w-5 h-5" />
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${
              stats?.r2?.configured 
                ? "bg-orange-50/50 border-orange-100/50 text-orange-600" 
                : "bg-zinc-100 border-zinc-200 text-zinc-400"
            }`}>
              {stats?.r2?.configured ? "Configured" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cloudflare R2 Bucket</span>
            <h2 className="text-2xl font-black text-zinc-900 mt-1">{stats?.r2?.sizePretty || "0.00 MB"}</h2>
            <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed truncate" title={stats?.r2?.bucketName}>
              Bucket: {stats?.r2?.bucketName} ({stats?.r2?.filesCount || 0} ไฟล์)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs to toggle details */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 border-b border-[#e9ecef] pb-2">
          <button
            onClick={() => setActiveTab("local")}
            className={`px-4 py-2 text-xs font-black transition-all ${
              activeTab === "local"
                ? "text-zinc-950 border-b-2 border-black"
                : "text-zinc-400 hover:text-zinc-900"
            }`}
          >
            ไฟล์อัปเดตแบบ Local ({stats?.local?.files?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("r2")}
            className={`px-4 py-2 text-xs font-black transition-all ${
              activeTab === "r2"
                ? "text-zinc-950 border-b-2 border-black"
                : "text-zinc-400 hover:text-zinc-900"
            }`}
          >
            ไฟล์บน Cloudflare R2 ({stats?.r2?.filesCount || 0})
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === "local" ? (
          <div className="bg-white border border-[#e9ecef] rounded-[28px] overflow-hidden shadow-sm">
            {stats?.local?.files?.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs font-bold">
                ไม่พบไฟล์ถูกเก็บในโฟลเดอร์ Local Uploads
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#f8f9fa] border-b border-[#e9ecef] text-zinc-500 font-extrabold uppercase">
                    <tr>
                      <th className="p-4 pl-6">ชื่อไฟล์ (File Name)</th>
                      <th className="p-4">ขนาดไฟล์ (Size)</th>
                      <th className="p-4 pr-6">วันที่สร้าง (Date Modified)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e9ecef] text-zinc-700">
                    {stats?.local?.files?.map((file, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-zinc-800 font-mono truncate max-w-[300px]">{file.name}</td>
                        <td className="p-4 font-mono font-medium">{file.sizePretty}</td>
                        <td className="p-4 pr-6 text-zinc-400 font-mono">{new Date(file.createdAt).toLocaleString("th-TH")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#e9ecef] rounded-[28px] overflow-hidden shadow-sm">
            {!stats?.r2?.configured ? (
              <div className="p-12 text-center text-rose-500 text-xs font-bold bg-rose-50/20 border-rose-100">
                ⚠️ Cloudflare R2 ยังไม่ได้รับการกำหนดค่าความปลอดภัยใน .env ของระบบหลังบ้าน
              </div>
            ) : stats?.r2?.files?.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs font-bold">
                ไม่พบไฟล์ถูกเก็บใน Cloudflare R2 Bucket
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#f8f9fa] border-b border-[#e9ecef] text-zinc-500 font-extrabold uppercase">
                    <tr>
                      <th className="p-4 pl-6">คีย์ไฟล์ (Object Key)</th>
                      <th className="p-4">ขนาดไฟล์ (Size)</th>
                      <th className="p-4 pr-6">อัปเดตล่าสุด (Last Modified)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e9ecef] text-zinc-700">
                    {stats?.r2?.files?.map((file, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-zinc-800 font-mono truncate max-w-[300px]">{file.key}</td>
                        <td className="p-4 font-mono font-medium">{file.sizePretty}</td>
                        <td className="p-4 pr-6 text-zinc-400 font-mono">{new Date(file.lastModified).toLocaleString("th-TH")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
