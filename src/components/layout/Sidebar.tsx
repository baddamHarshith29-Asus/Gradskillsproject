"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Globe,
  LayoutDashboard,
  LogOut,
  Map,
  QrCode,
  Settings,
  Ticket,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranchStore } from "@/lib/store";
import { getBranchesAction } from "@/app/actions";
import { getCurrentUserAction, handleSignOutAction } from "@/app/(auth)/login/actions";
import { isRouteAllowed, type UserRole, ROLE_LABELS } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedBranchId, setBranch } = useBranchStore();
  const [branches, setBranches] = useState<{ id: string; name: string; city: string }[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; role: UserRole } | null>(null);

  useEffect(() => {
    async function loadData() {
      const branchesData = await getBranchesAction();
      setBranches(branchesData);
      
      const userData = await getCurrentUserAction();
      if (userData) {
        setUser(userData);
      }
    }
    loadData();
  }, []);

  const menuItems: MenuItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="size-4" /> },
    { title: "Floor Plan Builder", href: "/floor-builder", icon: <Map className="size-4" /> },
    { title: "Smart Bookings", href: "/booking", icon: <Calendar className="size-4" /> },
    { title: "Smart Visitors", href: "/visitors", icon: <QrCode className="size-4" /> },
    { title: "Clients CRM", href: "/clients", icon: <Users className="size-4" /> },
    { title: "Finance & Billing", href: "/finance", icon: <CreditCard className="size-4" /> },
    { title: "Contract Renewals", href: "/renewals", icon: <Clock className="size-4" /> },
    { title: "Helpdesk Tickets", href: "/tickets", icon: <Ticket className="size-4" /> },
    { title: "Team HR", href: "/team", icon: <UserCheck className="size-4" /> },
    { title: "Website CMS", href: "/cms", icon: <Globe className="size-4" /> },
    { title: "Settings & RBAC", href: "/settings", icon: <Settings className="size-4" /> },
  ];

  // Filter menu items by user's role
  const allowedMenuItems = menuItems.filter((item) =>
    user ? isRouteAllowed(user.role, item.href) : false
  );

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "all") {
      setBranch("all", "All Branches");
    } else {
      const selected = branches.find((b) => b.id === value);
      if (selected) {
        setBranch(selected.id, selected.name);
      }
    }
  };

  const handleLogout = async () => {
    await handleSignOutAction();
  };

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-20 flex w-60 flex-col border-r border-brand-600 bg-brand-800 text-slate-100">
      {/* Header / Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-brand-600 px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-400/10 border border-brand-400/20 text-brand-400">
          <Building2 className="size-5" />
        </div>
        <div>
          <span className="font-heading text-lg font-bold tracking-tight text-white">CoNexus</span>
          <span className="block text-[10px] text-neutral font-medium uppercase tracking-wider">Workspace OS</span>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="border-b border-brand-600 px-4 py-3">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral mb-1.5 px-1">
          Current Workspace
        </label>
        <select
          value={selectedBranchId}
          onChange={handleBranchChange}
          className="w-full rounded-md border border-brand-600 bg-brand-700 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 cursor-pointer"
        >
          <option value="all">All Branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} ({branch.city})
            </option>
          ))}
        </select>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {allowedMenuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-400 text-white font-semibold"
                  : "text-slate-300 hover:bg-brand-700 hover:text-white hover:translate-x-0.5"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User Information Profile Footer */}
      {user && (
        <div className="border-t border-brand-600 bg-brand-900/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-400/20 text-xs font-bold text-brand-400 border border-brand-400/30">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-slate-200">{user.name}</span>
              <span className="block text-[10px] text-neutral truncate mt-0.5 leading-none">
                {user.email}
              </span>
              <div className="mt-1.5">
                <Badge variant="outline" className="border-brand-400/40 text-brand-400 bg-brand-400/5 text-[9px] h-4 px-1.5 font-semibold">
                  {ROLE_LABELS[user.role] || user.role}
                </Badge>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-neutral hover:text-danger rounded p-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
