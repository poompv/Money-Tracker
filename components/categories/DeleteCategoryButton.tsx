"use client";

import { useTransition } from "react";
import { deleteCategory } from "@/lib/actions/categories";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          confirm(
            "ลบหมวดหมู่นี้? รายการที่เคยบันทึกไว้ในหมวดหมู่นี้จะกลายเป็น \"ไม่มีหมวดหมู่\""
          )
        ) {
          startTransition(() => {
            deleteCategory(id);
          });
        }
      }}
      className="text-zinc-400 hover:text-red-600 disabled:opacity-50"
      aria-label="ลบหมวดหมู่"
    >
      🗑️
    </button>
  );
}
