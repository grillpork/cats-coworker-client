"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../components/auth/hook/useAuth";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] text-slate-100 flex items-center justify-center font-mono">
        <div className="text-center flex flex-col gap-3">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="text-sm font-bold tracking-wider animate-pulse text-zinc-400">กำลังตรวจสอบสิทธิ์การเข้าถึง...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.roleName?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-[#0b0c0e] text-slate-100 flex items-center justify-center font-mono p-6">
        <div className="max-w-md w-full bg-[#111215] border border-red-950/40 rounded-2xl p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.08)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600"></div>
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto stroke-[1.5]" />
          <h2 className="text-xl font-black text-red-500 mt-6 tracking-widest uppercase">ปฏิเสธการเข้าถึง</h2>
          <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
            พื้นที่ทำงานนี้สงวนไว้สำหรับผู้ดูแลระบบเท่านั้น บัญชีของคุณไม่มีระดับสิทธิ์การเข้าถึงที่เพียงพอสำหรับแดชบอร์ดนี้
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/" className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-rose-500 rounded-lg text-xs font-black transition-all flex items-center gap-2 hover:bg-zinc-800">
              <ArrowLeft className="w-4 h-4" /> กลับไปยังหน้าหลักเกม
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar user={user} logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 bg-[#0b0c0e] flex flex-col overflow-y-auto">
        {/* Topbar Header */}
        <Topbar user={user} logout={logout} />
        
        {/* Children Content */}
        <div className="p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
