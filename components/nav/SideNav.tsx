"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/lib/nav-items";

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white p-4 md:block">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="text-2xl">💰</span>
        <span className="font-semibold text-zinc-900">Money Tracker</span>
      </div>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-zinc-600 hover:bg-zinc-50"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="pt-2">
          <Link
            href="/categories"
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              pathname === "/categories"
                ? "bg-emerald-50 text-emerald-700"
                : "text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <span>⚙️</span>
            หมวดหมู่
          </Link>
        </li>
      </ul>
    </nav>
  );
}
