import { formatTHB } from "@/lib/utils/currency";
import { DeleteTransactionButton } from "./DeleteTransactionButton";
import type { TransactionWithCategory } from "@/lib/types/database";

export function TransactionItem({ tx }: { tx: TransactionWithCategory }) {
  const isExpense = tx.type === "expense";

  return (
    <li className="flex items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-xl">{tx.category?.icon ?? "📦"}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">
            {tx.category?.name ?? "ไม่มีหมวดหมู่"}
          </p>
          {tx.note && (
            <p className="truncate text-xs text-zinc-500">{tx.note}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={
            isExpense
              ? "font-medium text-red-600"
              : "font-medium text-emerald-600"
          }
        >
          {isExpense ? "-" : "+"}
          {formatTHB(Number(tx.amount))}
        </span>
        <DeleteTransactionButton id={tx.id} />
      </div>
    </li>
  );
}
