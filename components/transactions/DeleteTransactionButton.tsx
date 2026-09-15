"use client";

import { useTransition } from "react";
import { deleteTransaction } from "@/lib/actions/transactions";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("ลบรายการนี้?")) {
          startTransition(() => {
            deleteTransaction(id);
          });
        }
      }}
      className="shrink-0 text-zinc-400 hover:text-red-600 disabled:opacity-50"
      aria-label="ลบรายการ"
    >
      🗑️
    </button>
  );
}
