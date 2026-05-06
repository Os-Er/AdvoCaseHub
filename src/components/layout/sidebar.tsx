"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Scale,
  Gavel,
  TrendingDown,
  Handshake,
  ShieldCheck,
  BriefcaseBusiness,
  Clock,
  Wallet,
  Receipt,
  Minus,
  ArrowDownToLine,
  FileText,
  FolderOpen,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

// ============================================================
// Badge tipi
// ============================================================

export interface SidebarBadges {
  dolacakVekalet: number;
  bekleyenMakbuz: number;
  yaklasanIsler: number;
}

// ============================================================
// Menü konfigürasyonu
// ============================================================

type SingleItem = {
  kind: "single";
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: keyof SidebarBadges;
  exact?: boolean;
};

type GroupItem = {
  kind: "group";
  key: string;
  label: string;
  icon: React.ElementType;
  children: {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: keyof SidebarBadges;
  }[];
};

type NavItem = SingleItem | GroupItem;

const NAV: NavItem[] = [
  {
    kind: "single",
    href: "/dashboard",
    label: "Ana Sayfa",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    kind: "group",
    key: "dosyalar",
    label: "Dosya Yönetimi",
    icon: FolderOpen,
    children: [
      { href: "/dosyalar/hukuk", label: "Hukuk Davaları",  icon: Scale },
      { href: "/dosyalar/ceza",  label: "Ceza Davaları",   icon: Gavel },
      { href: "/dosyalar/icra",  label: "İcra Takipleri",  icon: TrendingDown },
    ],
  },
  {
    kind: "single",
    href: "/arabuluculuk",
    label: "Arabuluculuk",
    icon: Handshake,
  },
  {
    kind: "single",
    href: "/cmk",
    label: "CMK İşlemleri",
    icon: ShieldCheck,
  },
  {
    kind: "single",
    href: "/danismanlik",
    label: "Danışmanlık",
    icon: BriefcaseBusiness,
  },
  {
    kind: "single",
    href: "/sureli-isler",
    label: "Süreli İşler",
    icon: Clock,
    badge: "yaklasanIsler",
  },
  {
    kind: "group",
    key: "finans",
    label: "Finans Yönetimi",
    icon: Wallet,
    children: [
      { href: "/finans/makbuzlar",  label: "Makbuzlar",   icon: Receipt,         badge: "bekleyenMakbuz" },
      { href: "/finans/giderler",   label: "Giderler",    icon: Minus },
      { href: "/finans/tahsilatlar",label: "Tahsilatlar", icon: ArrowDownToLine },
    ],
  },
  {
    kind: "single",
    href: "/vekaletnameler",
    label: "Vekaletnameler",
    icon: FileText,
    badge: "dolacakVekalet",
  },
];

// ============================================================
// Yardımcı: pathname'e göre açık olması gereken grup key'leri
// ============================================================

function getInitialOpenGroups(pathname: string): Set<string> {
  const open = new Set<string>();
  for (const item of NAV) {
    if (item.kind === "group") {
      if (item.children.some((c) => pathname.startsWith(c.href))) {
        open.add(item.key);
      }
    }
  }
  return open;
}

// ============================================================
// Badge komponenti
// ============================================================

function Badge({
  count,
  variant = "default",
}: {
  count: number;
  variant?: "red" | "default";
}) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none",
        variant === "red"
          ? "bg-red-500 text-white"
          : "text-[#1B2A4A]"
      )}
      style={variant !== "red" ? { backgroundColor: "#C9A84C" } : {}}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ============================================================
// Tekil link
// ============================================================

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  badges,
  exact = false,
  onClick,
  indent = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: keyof SidebarBadges;
  badges: SidebarBadges;
  exact?: boolean;
  onClick?: () => void;
  indent?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  const count = badge ? badges[badge] : 0;
  const isVekalet = badge === "dolacakVekalet";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
        indent ? "px-2" : "px-3",
        active
          ? "text-[#1B2A4A] font-semibold shadow-sm"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
      style={active ? { backgroundColor: "#C9A84C" } : {}}
    >
      <Icon className={cn("flex-shrink-0", indent ? "w-4 h-4" : "w-5 h-5")} />
      <span className="flex-1 truncate">{label}</span>
      <Badge count={count} variant={isVekalet ? "red" : "default"} />
    </Link>
  );
}

// ============================================================
// Accordion grubu
// ============================================================

function NavGroup({
  item,
  badges,
  openGroups,
  onToggle,
  onItemClick,
}: {
  item: GroupItem;
  badges: SidebarBadges;
  openGroups: Set<string>;
  onToggle: (key: string) => void;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const isOpen = openGroups.has(item.key);
  const hasActiveChild = item.children.some((c) => pathname.startsWith(c.href));
  const Icon = item.icon;

  return (
    <div>
      {/* Grup başlığı */}
      <button
        type="button"
        onClick={() => onToggle(item.key)}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left",
          hasActiveChild
            ? "text-white bg-white/10"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronRight
          className={cn(
            "w-4 h-4 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {/* Alt itemlar */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="ml-3 mt-0.5 pl-3 border-l border-white/10 space-y-0.5 pb-1">
          {item.children.map((child) => (
            <NavLink
              key={child.href}
              href={child.href}
              label={child.label}
              icon={child.icon}
              badge={child.badge}
              badges={badges}
              onClick={onItemClick}
              indent
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Nav listesi
// ============================================================

function NavList({
  badges,
  onItemClick,
}: {
  badges: SidebarBadges;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => getInitialOpenGroups(pathname)
  );

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {NAV.map((item) =>
        item.kind === "single" ? (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            badges={badges}
            exact={item.exact}
            onClick={onItemClick}
          />
        ) : (
          <NavGroup
            key={item.key}
            item={item}
            badges={badges}
            openGroups={openGroups}
            onToggle={toggleGroup}
            onItemClick={onItemClick}
          />
        )
      )}
    </nav>
  );
}

// ============================================================
// SidebarContent — hem desktop hem mobile Sheet'te kullanılır
// ============================================================

export function SidebarContent({
  onItemClick,
  badges,
}: {
  onItemClick?: () => void;
  badges: SidebarBadges;
}) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#1B2A4A" }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
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

      <NavList badges={badges} onItemClick={onItemClick} />

      {/* Footer: logout + legal */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </form>
        <div className="flex gap-3 mt-3 px-3">
          <Link href="/kvkk"                   target="_blank" className="text-[10px] text-slate-500 hover:text-slate-300">KVKK</Link>
          <Link href="/gizlilik-politikasi"    target="_blank" className="text-[10px] text-slate-500 hover:text-slate-300">Gizlilik</Link>
          <Link href="/kullanim-kosullari"     target="_blank" className="text-[10px] text-slate-500 hover:text-slate-300">Koşullar</Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Desktop Sidebar
// ============================================================

export function Sidebar({ badges }: { badges: SidebarBadges }) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0">
      <SidebarContent badges={badges} />
    </aside>
  );
}
