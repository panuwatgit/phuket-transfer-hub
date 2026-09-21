"use client";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { Logo } from "@/components/site/Nav";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <main className="min-h-screen grid place-items-center px-5 bg-[#F6F1E9]">
      <form action={action} className="card w-full max-w-[380px] p-7 anim-in">
        <div className="mb-6"><Logo sub="หลังบ้าน" /></div>
        <h1 className="text-2xl font-semibold mb-1">เข้าสู่ระบบ</h1>
        <p className="text-ink-soft text-sm mb-5">สำหรับทีมงาน Phuket Transfer Hub</p>
        <label className="lbl" htmlFor="password">รหัสผ่าน</label>
        <div className={`in ${state?.error ? "err" : ""}`}><span>🔒</span><input id="password" name="password" type="password" autoFocus autoComplete="current-password" required /></div>
        {state?.error && <div className="emsg">{state.error}</div>}
        <button className="btn btn-teal w-full mt-5 !rounded-xl" disabled={pending}>{pending ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ →"}</button>
      </form>
    </main>
  );
}
