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
      <div className="min-h-screen bg-[#f4f5f8] text-zinc-800 flex items-center justify-center ">
        <div className="text-center flex flex-col gap-3">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="text-sm font-bold tracking-wider animate-pulse text-zinc-500">กำลังตรวจสอบสิทธิ์การเข้าถึง...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.roleName?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-[#f4f5f8] text-zinc-850 flex items-center justify-center  p-6">
        <div className="max-w-md w-full bg-white border border-[#e9ecef] rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-650 bg-red-650"></div>
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto stroke-[1.5]" />
          <h2 className="text-xl font-black text-red-500 mt-6 tracking-widest uppercase">ปฏิเสธการเข้าถึง</h2>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
            พื้นที่ทำงานนี้สงวนไว้สำหรับผู้ดูแลระบบเท่านั้น บัญชีของคุณไม่มีระดับสิทธิ์การเข้าถึงที่เพียงพอสำหรับแดชบอร์ดนี้
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/" className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-black transition-all flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> กลับไปยังหน้าหลักเกม
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-zinc-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar user={user} logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 pl-[280px] bg-[#f4f5f8] flex flex-col overflow-y-auto">
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
