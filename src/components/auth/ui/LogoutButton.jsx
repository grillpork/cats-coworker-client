"use client";

import React from "react";
import { useAuth } from "../hook/useAuth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({
  className = "",
  showIcon = true,
  children,
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/sign-in");
  };

  return (
    <button
      onClick={handleLogout}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all select-none focus:outline-none focus:ring-2 focus:ring-neutral-800 ${className}`}
    >
      {showIcon && <LogOut className="w-4 h-4" />}
      {children || "ออกจากระบบ"}
    </button>
  );
}
