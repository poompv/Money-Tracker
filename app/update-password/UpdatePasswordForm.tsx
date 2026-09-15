"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function establishRecoverySession() {
      // PKCE-style recovery links land with ?code=... — exchange it for a session.
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) setLinkError("ลิงก์หมดอายุหรือถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่");
        else setReady(true);
        return;
      }

      // Hash-fragment (#access_token=...&refresh_token=...&type=recovery)
      // links, parsed manually rather than relying on the client's built-in
      // URL detection, since @supabase/ssr's browser client doesn't reliably
      // do this the way the plain supabase-js client does.
      const hashParams = new URLSearchParams(window.location.hash.slice(1));

      const hashError = hashParams.get("error_description");
      if (hashError) {
        setLinkError(
          hashParams.get("error_code") === "otp_expired"
            ? "ลิงก์นี้หมดอายุหรือถูกใช้ไปแล้ว (ลิงก์ใช้ได้ครั้งเดียว) กรุณากลับไปกด Send Password Recovery ใหม่ และคลิกลิงก์ในอีเมลเพียงครั้งเดียว"
            : decodeURIComponent(hashError.replace(/\+/g, " "))
        );
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) setLinkError("ลิงก์หมดอายุหรือถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่");
        else setReady(true);
        return;
      }

      // Fallback: maybe a session already exists (e.g. page was refreshed
      // after the hash was already processed once).
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setReady(true);
      else setLinkError("ไม่พบลิงก์สำหรับตั้งรหัสผ่านใหม่ กรุณาขอลิงก์ใหม่อีกครั้ง");
    }

    establishRecoverySession();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.replace("/login"), 1500);
  }

  if (success) {
    return (
      <p className="text-center text-sm text-zinc-700">
        ตั้งรหัสผ่านใหม่สำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...
      </p>
    );
  }

  if (!ready) {
    return (
      <p className="text-center text-sm text-zinc-500">
        {linkError ?? "กำลังตรวจสอบลิงก์..."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
          รหัสผ่านใหม่
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-zinc-700"
        >
          ยืนยันรหัสผ่านใหม่
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {formError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
