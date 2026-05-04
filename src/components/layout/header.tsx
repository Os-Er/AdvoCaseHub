"use client";

import { useState, useTransition } from "react";
import { Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarContent, type SidebarBadges } from "./sidebar";
import { signOut } from "@/lib/actions/auth";
import type { User } from "@/lib/types/database";

interface HeaderProps {
  user: Pick<User, "full_name" | "email" | "avatar_url">;
  badges: SidebarBadges;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Header({ user, badges }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(() => { signOut(); });
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Mobile hamburger */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Menüyü aç"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigasyon Menüsü</SheetTitle>
            <SidebarContent onItemClick={() => setMobileOpen(false)} badges={badges} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors outline-none"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-800 leading-tight">
              {user.full_name}
            </p>
            <p className="text-xs text-slate-500 leading-tight">{user.email}</p>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" className="w-48">
          <div className="px-2 py-2">
            <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
