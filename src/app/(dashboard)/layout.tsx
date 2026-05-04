import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToastHandler } from "@/components/ui/toast-handler";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const bugun = new Date().toISOString().split("T")[0];
  const gun30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [
    { data: profile },
    { count: dolacakVekalet },
    { count: bekleyenMakbuz },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, email, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("vekaletnameler")
      .select("id", { count: "exact", head: true })
      .eq("durum", "AKTIF")
      .gte("bitis_tarihi", bugun)
      .lte("bitis_tarihi", gun30) as unknown as Promise<{ count: number | null }>,
    supabase
      .from("makbuzlar")
      .select("id", { count: "exact", head: true })
      .in("durum", ["BEKLENIYOR", "KISMI"]) as unknown as Promise<{ count: number | null }>,
  ]);

  const displayUser = profile ?? {
    full_name: user.email?.split("@")[0] ?? "Kullanıcı",
    email: user.email ?? "",
    avatar_url: null,
  };

  const badges = {
    dolacakVekalet: dolacakVekalet ?? 0,
    bekleyenMakbuz: bekleyenMakbuz ?? 0,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar badges={badges} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header user={displayUser} badges={badges} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ToastHandler />
          {children}
        </main>
      </div>
    </div>
  );
}
