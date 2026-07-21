"use client";

import React, { useState, useEffect } from "react";
import { storageService } from "../../../../services/storage.service";
import { 
  Database, HardDrive, Cloud, FileText, Settings, Server, 
  RefreshCw, Folder, FolderOpen, ArrowLeft, Home, FileCode, ImageIcon
} from "lucide-react";

export default function StorageManagementPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("local"); // 'local' | 'r2'
  
  // Desktop OS Folder Navigation States
  const [currentPath, setCurrentPath] = useState(""); // "" is root, "cats/", "sprites/", etc.
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await storageService.getStats();
      setStats(res?.data || res);
      // Reset navigation on refresh
      setCurrentPath("");
      setSelectedFile(null);
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

  // Filter and group files based on active tab and current folder path
  const getExplorerContents = () => {
    const rawFiles = activeTab === "local" 
      ? (stats?.local?.files || []) 
      : (stats?.r2?.files || []);

    const folders = new Set();
    const filesInDir = [];

    rawFiles.forEach((file) => {
      const key = file.key || file.name || "";
      
      if (currentPath === "") {
        // Root folder: look for top level folders and files
        if (key.includes("/")) {
          const parts = key.split("/");
          folders.add(parts[0] + "/");
        } else {
          filesInDir.push({ ...file, isFile: true, displayName: key });
        }
      } else {
        // Inside a subfolder (e.g. currentPath === "cats/")
        if (key.startsWith(currentPath) && key !== currentPath) {
          const relative = key.slice(currentPath.length);
          if (relative.includes("/")) {
            const parts = relative.split("/");
            folders.add(currentPath + parts[0] + "/");
          } else {
            filesInDir.push({ ...file, isFile: true, displayName: relative });
          }
        }
      }
    });

    return {
      folders: Array.from(folders).map(folderPath => {
        const parts = folderPath.split("/");
        // Get the folder's name (e.g. "cats" from "cats/")
        const displayName = parts[parts.length - 2] || folderPath;
        return {
          path: folderPath,
          displayName,
          isFile: false
        };
      }),
      files: filesInDir
    };
  };

  const handleFolderClick = (folderPath) => {
    setCurrentPath(folderPath);
    setSelectedFile(null);
  };

  const handleGoUp = () => {
    if (currentPath === "") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop(); // Remove current folder
    const parentPath = parts.length > 0 ? parts.join("/") + "/" : "";
    setCurrentPath(parentPath);
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-zinc-400 font-bold">กำลังโหลดข้อมูลคลังเก็บข้อมูล...</span>
      </div>
    );
  }

  const { folders, files } = getExplorerContents();

  // Helper to determine file icon
  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) {
      return <ImageIcon className="w-8 h-8 text-emerald-500" />;
    }
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="flex flex-col gap-8 flex-1 font-sans text-zinc-800 pb-16">
      
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2 text-zinc-900">
            <HardDrive className="w-6 h-6 text-indigo-500" /> คลังเก็บไฟล์ระบบ (Storage Explorer)
          </h1>
          <p className="text-xs text-zinc-500">
            จัดการระบบไฟล์ภาพแมว ตัวละคร หรือชิ้นส่วนแผนที่ทั้งแบบเซิร์ฟเวอร์ Local และ Cloudflare R2
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2.5 bg-white border border-[#e9ecef] hover:bg-zinc-50 rounded-xl text-zinc-600 transition-all flex items-center gap-2 shadow-sm text-xs font-bold active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> รีเฟรชข้อมูล
        </button>
      </div>

      {/* Grid of Storage stats */}
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
            <h2 className="text-2xl font-black text-zinc-900 mt-1">{stats?.dbSizePretty || "0.00 MB"}</h2>
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
            <h2 className="text-2xl font-black text-zinc-900 mt-1">{stats?.uploadsSizePretty || "0.00 MB"}</h2>
            <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">โฟลเดอร์เก็บรูปภาพอัปโหลดหลัก (uploads/)</p>
          </div>
        </div>

        {/* Capacity limit info */}
        <div className="bg-white border border-[#e9ecef] rounded-[28px] p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="text-[9px] bg-blue-50/50 border border-blue-100/50 text-blue-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">Storage Limit</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ความจุใช้งานรวม / ลิมิต</span>
            <h2 className="text-2xl font-black text-zinc-900 mt-1">{stats?.totalSizePretty || "0.00 MB"} / {stats?.limitPretty || "50.00 MB"}</h2>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mt-2 border border-zinc-200">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, stats?.percentage || 0)}%` }}
              />
            </div>
            <p className="text-[9px] text-zinc-400 mt-1.5 text-right font-bold">{stats?.percentage || 0}% Used</p>
          </div>
        </div>
      </div>

      {/* OS File Explorer Interface */}
      <div className="bg-white border border-[#e9ecef] rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-[480px]">
        
        {/* Tab Selector & Address bar */}
        <div className="bg-zinc-50 border-b border-[#e9ecef] p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("local");
                setCurrentPath("");
                setSelectedFile(null);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                activeTab === "local"
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-500"
              }`}
            >
              Local Storage ({stats?.local?.files?.length || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("r2");
                setCurrentPath("");
                setSelectedFile(null);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                activeTab === "r2"
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-500"
              }`}
            >
              Cloudflare R2 ({stats?.r2?.files?.length || 0})
            </button>
          </div>

          {/* OS Navigation Address bar */}
          <div className="flex items-center gap-3 bg-white border border-[#e9ecef] rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => handleFolderClick("")}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-500 transition-colors"
                title="Root Folder"
              >
                <Home size={14} />
              </button>
              <button 
                onClick={handleGoUp}
                disabled={currentPath === ""}
                className={`p-1 rounded transition-colors ${
                  currentPath === "" 
                    ? "text-zinc-300 cursor-not-allowed" 
                    : "hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                }`}
                title="Up One Level"
              >
                <ArrowLeft size={14} />
              </button>
            </div>

            <div className="h-4 w-[1px] bg-zinc-200 shrink-0" />

            <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 overflow-x-auto w-full select-text py-0.5">
              <span className="font-bold text-zinc-800 shrink-0">{activeTab === "local" ? "Local uploads" : "r2-bucket"}</span>
              <span>/</span>
              {currentPath.split("/").filter(Boolean).map((part, index, arr) => (
                <React.Fragment key={index}>
                  <span className="font-semibold text-zinc-700 shrink-0">{part}</span>
                  {index < arr.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Explorer area split: contents + detail side-panel */}
        <div className="flex-1 flex min-h-[380px]">
          
          {/* Main folder content view */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[420px]">
            {folders.length === 0 && files.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-450 gap-2">
                <FolderOpen className="w-12 h-12 text-zinc-200" />
                <span className="text-xs font-bold">โฟลเดอร์นี้ว่างเปล่า</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                {/* Folders first */}
                {folders.map((folder) => (
                  <div
                    key={folder.path}
                    onClick={() => handleFolderClick(folder.path)}
                    className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl hover:bg-yellow-500/5 border border-transparent hover:border-yellow-500/25 cursor-pointer transition-all active:scale-95 group"
                  >
                    <Folder className="w-10 h-10 text-yellow-500 fill-yellow-400 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-bold text-zinc-800 line-clamp-2 leading-tight">
                      {folder.displayName}
                    </span>
                  </div>
                ))}

                {/* Files next */}
                {files.map((file, idx) => {
                  const key = file.key || file.name || "";
                  const isSelected = selectedFile?.displayName === file.displayName;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedFile(file)}
                      className={`flex flex-col items-center text-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all active:scale-95 group ${
                        isSelected 
                          ? "bg-indigo-50 border-indigo-200 shadow-xs" 
                          : "border-transparent hover:bg-zinc-50 hover:border-zinc-200"
                      }`}
                    >
                      <div className="group-hover:scale-105 transition-transform">
                        {getFileIcon(file.displayName)}
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-700 line-clamp-2 leading-tight break-all">
                        {file.displayName}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono">
                        {file.sizePretty}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Detail Panel */}
          {selectedFile && (
            <div className="w-72 border-l border-[#e9ecef] bg-zinc-50/50 p-5 flex flex-col gap-5 shrink-0 overflow-y-auto max-h-[480px]">
              <div className="flex justify-between items-center border-b border-zinc-200/60 pb-3">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ข้อมูลรายละเอียดไฟล์</span>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800"
                >
                  ปิด
                </button>
              </div>

              {/* Preview image if file is image */}
              {["jpg", "jpeg", "png", "webp", "gif"].includes(selectedFile.displayName.split(".").pop().toLowerCase()) && (
                <div className="w-full aspect-video rounded-xl border border-zinc-200 bg-white overflow-hidden flex items-center justify-center p-2 shadow-inner">
                  <img
                    src={activeTab === "local" 
                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${currentPath}${selectedFile.displayName}`
                      : selectedFile.key?.startsWith("http") ? selectedFile.key : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/${selectedFile.key}`
                    }
                    alt={selectedFile.displayName}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { e.target.src = "/mc-00.png"; }}
                  />
                </div>
              )}

              {/* Text attributes */}
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wider">ชื่อไฟล์</span>
                  <span className="font-bold text-zinc-800 break-all font-mono text-[10px]">{selectedFile.displayName}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wider">พาร์ทเต็ม (Full Key)</span>
                  <span className="text-zinc-650 break-all font-mono text-[10.5px]">
                    {activeTab === "local" 
                      ? `uploads/${currentPath}${selectedFile.displayName}`
                      : `${selectedFile.key}`
                    }
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wider">ขนาดพื้นที่</span>
                  <span className="font-mono text-zinc-750 font-bold">{selectedFile.sizePretty}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wider">แก้ไขล่าสุด</span>
                  <span className="font-mono text-zinc-500 text-[10.5px]">
                    {new Date(selectedFile.createdAt || selectedFile.lastModified).toLocaleString("th-TH")}
                  </span>
                </div>
              </div>

              {/* Utility actions */}
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200">
                <a
                  href={activeTab === "local" 
                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${currentPath}${selectedFile.displayName}`
                    : selectedFile.key?.startsWith("http") ? selectedFile.key : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/${selectedFile.key}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-center text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95 block"
                >
                  🔗 เปิดดูภาพจริง
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
