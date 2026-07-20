import React, { useState } from "react";
import { z } from "zod";
import { Form } from "../../ui/Form";
import { InputField } from "../../ui/InputField";
import { Button } from "../../ui/Button";
import { authServices } from "../../../services/auth.service";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../hook/useAuth";
import GoogleLoginButton from "../ui/GoogleLoginButton";

// Validation schemas using Zod
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "กรุณากรอกอีเมล")
      .email("รูปแบบอีเมลไม่ถูกต้อง"),
    password: z
      .string()
      .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z
      .string()
      .min(6, "กรุณากรอกยืนยันรหัสผ่าน"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export default function AuthForm({ mode = "sign-in" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignIn = mode === "sign-in";
  const schema = isSignIn ? signInSchema : signUpSchema;
  const defaultValues = isSignIn
    ? { email: "", password: "" }
    : { email: "", password: "", confirmPassword: "" };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);
    try {
      if (isSignIn) {
        await login(data.email, data.password);
        
        // Redirect to callbackUrl if present, otherwise default to home page
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        router.push(callbackUrl);
      } else {
        await authServices.register(data.email, data.password);
        router.push("/auth/sign-in");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-neutral-950/80 border border-neutral-900 rounded-2xl shadow-2xl backdrop-blur-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {isSignIn ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h1>
        <p className="text-sm text-neutral-400 mt-2 font-light">
          {isSignIn
            ? "ยินดีต้อนรับกลับมา! กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ"
            : "สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งานแอปพลิเคชัน"}
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
          {error}
        </div>
      )}

      <Form
        schema={schema}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        className="space-y-5"
      >
        <InputField
          name="email"
          label="อีเมล"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
        />

        <InputField
          name="password"
          label="รหัสผ่าน"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {!isSignIn && (
          <InputField
            name="confirmPassword"
            label="ยืนยันรหัสผ่าน"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        )}

        <Button type="submit" isLoading={loading} className="w-full mt-2">
          {isSignIn ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </Button>
      </Form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-neutral-950 px-2 text-neutral-400 font-light">หรือ</span>
        </div>
      </div>

      <GoogleLoginButton onSuccess={() => {
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        router.push(callbackUrl);
      }} />


      <div className="mt-6 text-center text-sm text-neutral-400">
        {isSignIn ? (
          <>
            ยังไม่มีบัญชีใช่หรือไม่?{" "}
            <Link
              href="/auth/sign-up"
              className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
            >
              สมัครสมาชิกที่นี่
            </Link>
          </>
        ) : (
          <>
            มีบัญชีอยู่แล้วใช่หรือไม่?{" "}
            <Link
              href="/auth/sign-in"
              className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
            >
              เข้าสู่ระบบที่นี่
            </Link>
          </>
        )}
      </div>
    </div>
  );
}