import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export function TopHeader() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <span className="text-xl">💰</span>
        <span className="font-semibold text-zinc-900">Money Tracker</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/categories" className="text-xl" aria-label="หมวดหมู่">
          ⚙️
        </Link>
        <form action={signOut}>
          <button type="submit" className="text-sm text-zinc-500">
            ออกจากระบบ
          </button>
        </form>
      </div>
    </header>
  );
}
