import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SideNav } from "@/components/nav/SideNav";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopHeader } from "@/components/nav/TopHeader";
import { signOut } from "@/lib/actions/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1">
      <SideNav />
      <div className="flex flex-1 flex-col">
        <TopHeader />
        <div className="hidden items-center justify-end border-b border-zinc-200 bg-white px-6 py-3 md:flex">
          <span className="mr-4 text-sm text-zinc-500">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-700">
              ออกจากระบบ
            </button>
          </form>
        </div>
        <main className="flex-1 pb-20 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
