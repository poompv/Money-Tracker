import type { TransactionWithCategory } from "@/lib/types/database";
import { TransactionItem } from "./TransactionItem";

export function TransactionList({
  transactions,
}: {
  transactions: TransactionWithCategory[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">ยังไม่มีรายการ</p>
    );
  }

  return (
    <ul>
      {transactions.map((tx) => (
        <TransactionItem key={tx.id} tx={tx} />
      ))}
    </ul>
  );
}
