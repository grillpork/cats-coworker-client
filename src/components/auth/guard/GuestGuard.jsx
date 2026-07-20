"use client";

import React, { useEffect } from "react";
import { useAuth } from "../hook/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function GuestGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/backoffice/overview");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm font-light text-neutral-400 select-none">
          กำลังโหลด...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
