"use client";

import React, { Suspense } from "react";
import AuthForm from "../../../components/auth/form/AuthForm";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 relative overflow-hidden">
      {/* Immersive background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Suspense fallback={<div className="text-white text-center">กำลังโหลด...</div>}>
          <AuthForm mode="sign-in" />
        </Suspense>
      </div>
    </main>
  );
}
