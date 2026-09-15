import Link from "next/link";
import clsx from "clsx";
import {
  getCategoryBreakdown,
  getMonthlyTotals,
} from "@/lib/queries/transactions";
import { addMonthsISO, currentMonthISO, formatThaiMonthYear } from "@/lib/utils/date";
import { formatTHB } from "@/lib/utils/currency";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";

export default async function MonthlyPage({
  searchParams,
}: PageProps<"/monthly">) {
  const params = await searchParams;
  const month =
    typeof params.month === "string" && params.month
      ? params.month
      : currentMonthISO();

  const [totals, breakdown] = await Promise.all([
    getMonthlyTotals(month),
    getCategoryBreakdown(month, "expense"),
  ]);

  const totalExpense = breakdown.reduce((sum, b) => sum + b.total, 0);
  const isSurplus = totals.net >= 0;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/monthly?month=${addMonthsISO(month, -1)}`}
          className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100"
        >
          ← เดือนก่อน
        </Link>
        <h1 className="text-sm font-semibold text-zinc-900">
          {formatThaiMonthYear(month)}
        </h1>
        <Link
          href={`/monthly?month=${addMonthsISO(month, 1)}`}
          className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100"
        >
          เดือนถัดไป →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
          <p className="text-xs text-zinc-500">รายรับรวม</p>
          <p className="text-lg font-semibold text-emerald-600">
            {formatTHB(totals.income)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
          <p className="text-xs text-zinc-500">รายจ่ายรวม</p>
          <p className="text-lg font-semibold text-red-600">
            {formatTHB(totals.expense)}
          </p>
        </div>
      </div>

      <div
        className={clsx(
          "rounded-xl p-4 text-center",
          isSurplus ? "bg-emerald-50" : "bg-red-50"
        )}
      >
        <p className="text-xs text-zinc-500">
          {isSurplus ? "เหลือเก็บเดือนนี้" : "ขาดดุลเดือนนี้ (ใช้เกินรายรับ)"}
        </p>
        <p
          className={clsx(
            "text-2xl font-bold",
            isSurplus ? "text-emerald-700" : "text-red-700"
          )}
        >
          {formatTHB(Math.abs(totals.net))}
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">
          สัดส่วนรายจ่ายตามหมวดหมู่
        </h2>
        <CategoryBreakdownChart items={breakdown} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          สรุปรายจ่ายแยกหมวดหมู่
        </h2>
        {breakdown.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-400">
            ยังไม่มีข้อมูลในเดือนนี้
          </p>
        ) : (
          <ul className="space-y-2">
            {breakdown.map((item) => (
              <li
                key={item.category_id ?? "uncategorized"}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-700">{item.category_name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-zinc-400">
                    {totalExpense > 0
                      ? `${((item.total / totalExpense) * 100).toFixed(0)}%`
                      : "0%"}
                  </span>
                  <span className="font-medium text-zinc-900">
                    {formatTHB(item.total)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
