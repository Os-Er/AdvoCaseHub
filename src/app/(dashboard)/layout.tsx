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
  const yarin = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [
    { data: profile },
    { count: dolacakVekalet },
    { count: bekleyenMakbuz },
    { count: yaklasanIsler },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, email, avatar_url")
      .eq("id", user.id)
      .single(),

    // Vekaletnameler: 30 gün içinde dolacak aktif olanlar
    supabase
      .from("vekaletnameler")
      .select("id", { count: "exact", head: true })
      .eq("durum", "AKTIF")
      .gte("bitis_tarihi", bugun)
      .lte("bitis_tarihi", gun30) as unknown as Promise<{ count: number | null }>,

    // Finans: ödenmemiş / kısmi makbuzlar
    supabase
      .from("finans")
      .select("id", { count: "exact", head: true })
      .eq("tip", "MAKBUZ")
      .in("durum", ["BEKLIYOR", "KISMI"]) as unknown as Promise<{ count: number | null }>,

    // Süreli işler: bugün ve yarın dolacak, tamamlanmamış
    supabase
      .from("sureli_isler")
      .select("id", { count: "exact", head: true })
      .eq("tamamlandi", false)
      .eq("arsivlendi", false)
      .lte("son_tarih", yarin) as unknown as Promise<{ count: number | null }>,
  ]);

  const displayUser = profile ?? {
    full_name: user.email?.split("@")[0] ?? "Kullanıcı",
    email: user.email ?? "",
    avatar_url: null,
  };

  const badges = {
    dolacakVekalet:  dolacakVekalet  ?? 0,
    bekleyenMakbuz:  bekleyenMakbuz  ?? 0,
    yaklasanIsler:   yaklasanIsler   ?? 0,
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
