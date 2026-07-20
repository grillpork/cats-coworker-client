"use client";

import React from "react";
import { useAuth } from "../hook/useAuth";
import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";

export default function RoleGuard({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm font-light text-neutral-400 select-none">
          กำลังโหลด...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-300 p-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white mb-2">ไม่ได้รับอนุญาต</h2>
        <p className="text-sm text-neutral-400 mb-6 text-center">
          กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ
        </p>
        <Link
          href="/auth/sign-in"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  const hasAccess =
    allowedRoles.length === 0 || (user?.role && allowedRoles.includes(user.role));

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-300 p-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          สิทธิ์การใช้งานไม่เพียงพอ
        </h2>
        <p className="text-sm text-neutral-400 mb-6 text-center">
          บัญชีของคุณ ({user?.role || "ไม่มีบทบาท"}) ไม่มีสิทธิ์เข้าถึงหน้านี้
        </p>
        <div className="flex gap-4">
          <Link
            href="/backoffice/overview"
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm font-medium transition-all"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
