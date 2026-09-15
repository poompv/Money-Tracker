"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { upsertBudget } from "@/lib/actions/budgets";
import { BUDGET_LEVEL_CLASS, BUDGET_LEVEL_LABEL } from "@/lib/utils/budget";
import { formatTHB } from "@/lib/utils/currency";
import type { BudgetProgress, Category } from "@/lib/types/database";

export function BudgetRow({
  category,
  progress,
  month,
}: {
  category: Category;
  progress?: BudgetProgress;
  month: string;
}) {
  const [editing, setEditing] = useState(!progress);
  const [state, formAction, pending] = useActionState(upsertBudget, undefined);

  // Adjust state during render when `state` changes, per React's documented
  // pattern (react.dev/reference/react/useState#storing-information-from-previous-renders).
  const [prevState, setPrevState] = useState(state);
  if (prevState !== state) {
    setPrevState(state);
    if (state?.success) setEditing(false);
  }

  return (
    <div className="border-b border-zinc-100 py-3 last:border-0">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-900">
          <span>{category.icon}</span>
          {category.name}
        </span>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-emerald-700"
          >
            {progress ? "แก้ไข" : "ตั้งงบ"}
          </button>
        )}
      </div>

      {progress && !editing && (
        <div className="mt-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={clsx(
                "h-full rounded-full",
                BUDGET_LEVEL_CLASS[progress.level].bar
              )}
              style={{ width: `${Math.min(progress.percent, 100)}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className={BUDGET_LEVEL_CLASS[progress.level].text}>
              {BUDGET_LEVEL_LABEL[progress.level]} (
              {progress.percent.toFixed(0)}%)
            </span>
            <span className="text-zinc-500">
              {formatTHB(progress.spent)} / {formatTHB(progress.limit_amount)}
            </span>
          </div>
        </div>
      )}

      {editing && (
        <form action={formAction} className="mt-2 flex items-center gap-2">
          <input type="hidden" name="category_id" value={category.id} />
          <input type="hidden" name="month" value={month} />
          <input
            type="number"
            name="limit_amount"
            min="1"
            step="1"
            defaultValue={progress?.limit_amount}
            required
            placeholder="วงเงิน/เดือน"
            className="w-32 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            บันทึก
          </button>
          {progress && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-zinc-500"
            >
              ยกเลิก
            </button>
          )}
        </form>
      )}
      {state?.error && editing && (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      )}
    </div>
  );
}
