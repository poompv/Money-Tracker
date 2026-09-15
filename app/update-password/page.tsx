import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-3xl">💰</span>
          <h1 className="mt-2 text-xl font-semibold text-zinc-900">
            Money Tracker
          </h1>
          <p className="text-sm text-zinc-500">ตั้งรหัสผ่านใหม่</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  );
}
