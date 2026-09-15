import Link from "next/link";
import { getTransactionsByDay } from "@/lib/queries/transactions";
import { addDaysISO, formatThaiDateLong, todayISO } from "@/lib/utils/date";
import { formatTHB } from "@/lib/utils/currency";
import { TransactionList } from "@/components/transactions/TransactionList";

export default async function DailyPage({
  searchParams,
}: PageProps<"/daily">) {
  const params = await searchParams;
  const date =
    typeof params.date === "string" && params.date ? params.date : todayISO();

  const transactions = await getTransactionsByDay(date);
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/daily?date=${addDaysISO(date, -1)}`}
          className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100"
        >
          ← ก่อนหน้า
        </Link>
        <h1 className="text-sm font-semibold text-zinc-900">
          {formatThaiDateLong(date)}
        </h1>
        <Link
          href={`/daily?date=${addDaysISO(date, 1)}`}
          className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100"
        >
          ถัดไป →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
          <p className="text-xs text-zinc-500">รายรับ</p>
          <p className="text-lg font-semibold text-emerald-600">
            {formatTHB(income)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
          <p className="text-xs text-zinc-500">รายจ่าย</p>
          <p className="text-lg font-semibold text-red-600">
            {formatTHB(expense)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white px-4">
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}
