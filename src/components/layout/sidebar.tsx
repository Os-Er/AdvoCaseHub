"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, FileText, Receipt, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

export interface SidebarBadges {
  dolacakVekalet: number;
  bekleyenMakbuz: number;
}

const navItems = [
  { href: "/dashboard",      label: "Ana Sayfa",      icon: LayoutDashboard, exact: true,  badge: null as keyof SidebarBadges | null },
  { href: "/dosyalar",       label: "Dosyalar",        icon: FolderOpen,      exact: false, badge: null as keyof SidebarBadges | null },
  { href: "/vekaletnameler", label: "Vekaletnameler",  icon: FileText,        exact: false, badge: "dolacakVekalet" as keyof SidebarBadges | null },
  { href: "/makbuzlar",      label: "Makbuzlar",       icon: Receipt,         exact: false, badge: "bekleyenMakbuz" as keyof SidebarBadges | null },
];

function NavItems({ onItemClick, badges }: { onItemClick?: () => void; badges: SidebarBadges }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {navItems.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const count  = badge ? badges[badge] : 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              active
                ? "text-[#1B2A4A] font-semibold shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            style={active ? { backgroundColor: "#C9A84C" } : {}}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none",
                  badge === "dolacakVekalet"
                    ? "bg-red-500 text-white"
                    : "text-[#1B2A4A]"
                )}
                style={badge === "bekleyenMakbuz" ? { backgroundColor: "#C9A84C" } : {}}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarContent({ onItemClick, badges }: { onItemClick?: () => void; badges: SidebarBadges }) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#1B2A4A" }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white rounded-xl p-2.5">
          <Image
            src="/logo.png"
            alt="AdvoCaseHub"
            width={180}
            height={60}
            className="object-contain w-full h-12"
            priority
            unoptimized
          />
        </div>
      </div>

      <NavItems onItemClick={onItemClick} badges={badges} />

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ badges }: { badges: SidebarBadges }) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0">
      <SidebarContent badges={badges} />
    </aside>
  );
}
