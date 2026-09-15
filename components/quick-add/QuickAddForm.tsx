"use client";

import { useActionState, useMemo, useState } from "react";
import clsx from "clsx";
import { createTransaction } from "@/lib/actions/transactions";
import { BUDGET_LEVEL_CLASS, BUDGET_LEVEL_LABEL } from "@/lib/utils/budget";
import type {
  BudgetProgress,
  Category,
  TransactionType,
} from "@/lib/types/database";

export function QuickAddForm({
  categories,
  budgetProgress,
  defaultDate,
}: {
  categories: Category[];
  budgetProgress: BudgetProgress[];
  defaultDate: string;
}) {
  const [state, formAction, pending] = useActionState(
    createTransaction,
    undefined
  );
  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState(defaultDate);
  const [note, setNote] = useState("");

  // Reset the form after a successful submit, adjusting state during render
  // per React's documented pattern rather than useEffect (avoids an extra
  // render-after-commit and works under the React Compiler's rules).
  const [prevState, setPrevState] = useState(state);
  if (prevState !== state) {
    setPrevState(state);
    if (state?.success) {
      setCategoryId(null);
      setAmount("");
      setNote("");
      setOccurredOn(defaultDate);
    }
  }

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  const budgetByCategory = useMemo(
    () => new Map(budgetProgress.map((b) => [b.category_id, b])),
    [budgetProgress]
  );
  const selectedBudget = categoryId ? budgetByCategory.get(categoryId) : undefined;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4"
    >
      <input type="hidden" name="category_id" value={categoryId ?? ""} />
      <input type="hidden" name="type" value={type} />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            setCategoryId(null);
          }}
          className={clsx(
            "rounded-lg py-2.5 text-sm font-medium",
            type === "expense"
              ? "bg-red-600 text-white"
              : "bg-zinc-100 text-zinc-600"
          )}
        >
          รายจ่าย
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategoryId(null);
          }}
          className={clsx(
            "rounded-lg py-2.5 text-sm font-medium",
            type === "income"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-100 text-zinc-600"
          )}
        >
          รายรับ
        </button>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-zinc-700"
        >
          จำนวนเงิน (บาท)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-3 text-2xl font-semibold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700">หมวดหมู่</p>
        {visibleCategories.length === 0 ? (
          <p className="text-sm text-zinc-400">
            ยังไม่มีหมวดหมู่ ไปเพิ่มได้ที่หน้าหมวดหมู่
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm",
                  categoryId === c.id
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 text-zinc-600"
                )}
              >
                <span>{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedBudget && selectedBudget.level !== "ok" && (
        <p
          className={clsx(
            "rounded-lg px-3 py-2 text-sm",
            BUDGET_LEVEL_CLASS[selectedBudget.level].bg,
            BUDGET_LEVEL_CLASS[selectedBudget.level].text
          )}
        >
          {selectedBudget.category_name}: ใช้ไปแล้ว{" "}
          {selectedBudget.percent.toFixed(0)}% ของงบเดือนนี้ —{" "}
          {BUDGET_LEVEL_LABEL[selectedBudget.level]}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="occurred_on"
            className="block text-sm font-medium text-zinc-700"
          >
            วันที่
          </label>
          <input
            id="occurred_on"
            name="occurred_on"
            type="date"
            required
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-zinc-700"
          >
            โน้ต (ถ้ามี)
          </label>
          <input
            id="note"
            name="note"
            type="text"
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !categoryId}
        className={clsx(
          "w-full rounded-lg py-3 text-base font-semibold text-white disabled:opacity-50",
          type === "expense"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-emerald-600 hover:bg-emerald-700"
        )}
      >
        {pending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  );
}
