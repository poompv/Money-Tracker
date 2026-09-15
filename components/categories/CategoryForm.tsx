"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { createCategory } from "@/lib/actions/categories";
import type { TransactionType } from "@/lib/types/database";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(
    createCategory,
    undefined
  );
  const [type, setType] = useState<TransactionType>("expense");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-2 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <input type="hidden" name="type" value={type} />

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={clsx(
            "rounded-lg px-3 py-2 text-sm",
            type === "expense"
              ? "bg-red-600 text-white"
              : "bg-zinc-100 text-zinc-600"
          )}
        >
          รายจ่าย
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={clsx(
            "rounded-lg px-3 py-2 text-sm",
            type === "income"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-100 text-zinc-600"
          )}
        >
          รายรับ
        </button>
      </div>

      <input
        name="icon"
        placeholder="🏷️"
        maxLength={4}
        className="w-16 rounded-lg border border-zinc-300 px-2 py-2 text-center text-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />

      <input
        name="name"
        placeholder="ชื่อหมวดหมู่ใหม่"
        required
        className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "กำลังเพิ่ม..." : "เพิ่ม"}
      </button>

      {state?.error && (
        <p className="w-full text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
