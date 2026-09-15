"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTHB } from "@/lib/utils/currency";
import { formatThaiMonthShort } from "@/lib/utils/date";
import type { MonthlyTrendItem } from "@/lib/types/database";

export function MonthlyTrendChart({ items }: { items: MonthlyTrendItem[] }) {
  const data = items.map((item) => ({
    month: formatThaiMonthShort(item.month),
    รายรับ: item.income,
    รายจ่าย: item.expense,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={60} />
          <Tooltip formatter={(value) => formatTHB(Number(value))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="รายจ่าย" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
