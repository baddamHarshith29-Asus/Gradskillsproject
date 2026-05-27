"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Calendar,
  Clock,
  Cpu,
  CreditCard,
  Globe,
  LayoutDashboard,
  LogOut,
  Map,
  QrCode,
  Settings,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
  X,
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

  const [showAccessPass, setShowAccessPass] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Timer loop for Rolling access pass code
  useEffect(() => {
    if (!showAccessPass) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showAccessPass]);

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
    { title: "Smart Hub IoT", href: "/iot", icon: <Cpu className="size-4" /> },
    { title: "Spatial AI Planner", href: "/spatial-planner", icon: <Sparkles className="size-4" /> },
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

      {/* Dynamic Key Access Gateways */}
      {user && (
        <div className="px-4 py-2 border-t border-brand-600/40 bg-brand-900/10">
          <button
            onClick={() => setShowAccessPass(true)}
            className="w-full flex items-center justify-between rounded-lg border border-brand-500/25 bg-brand-900/40 hover:bg-brand-900/70 p-2.5 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">🔑</span>
              <div>
                <span className="text-[10px] font-bold text-slate-200 block">Hub Smart Pass</span>
                <span className="text-[8px] text-neutral block mt-0.5">Encrypted QR Gateway Entry</span>
              </div>
            </div>
            <span className="text-[9px] bg-brand-400/25 text-brand-300 font-mono px-1.5 py-0.5 rounded font-bold group-hover:scale-105 transition-transform border border-brand-400/20">
              ACTIVE
            </span>
          </button>
        </div>
      )}

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

      {/* Visual QR rolling gateway key modal overlay */}
      {showAccessPass && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/80 backdrop-blur-sm p-4 font-sans">
          <div className="relative w-full max-w-sm rounded-2xl border border-brand-500/35 bg-brand-850 p-6 shadow-2xl space-y-4">
            
            {/* Top Close */}
            <button
              onClick={() => setShowAccessPass(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-brand-800 transition-colors animate-spin-once"
            >
              <X className="size-4" />
            </button>

            {/* Header info */}
            <div className="text-center space-y-1">
              <span className="text-[10px] bg-brand-400/20 text-brand-300 font-bold px-2.5 py-0.5 rounded border border-brand-400/30 uppercase tracking-widest font-mono inline-block">
                ⚡ SECURE ACCESS PASS
              </span>
              <h3 className="text-sm font-extrabold text-white">Hub Gateway Entry Key</h3>
              <p className="text-[10px] text-neutral">Hold this token close to the gateway scanner panel at your branch.</p>
            </div>

            {/* Interactive QR box with scanner laser */}
            <div className="relative mx-auto size-44 rounded-xl bg-white border border-brand-600/25 flex items-center justify-center p-3 overflow-hidden shadow-inner select-none">
              {/* Laser line scrolling effect */}
              <div className="absolute left-0 w-full h-0.5 bg-blue-500 shadow-md shadow-blue-500 animate-pulse pointer-events-none" />
              
              {/* Retro styled simulated QR Grid vector */}
              <svg className="size-full text-brand-950" viewBox="0 0 29 29" fill="currentColor">
                {/* Visual anchor corners */}
                <rect x="0" y="0" width="7" height="7" />
                <rect x="1" y="1" width="5" height="5" fill="white" />
                <rect x="2" y="2" width="3" height="3" />
                
                <rect x="22" y="0" width="7" height="7" />
                <rect x="23" y="1" width="5" height="5" fill="white" />
                <rect x="24" y="2" width="3" height="3" />

                <rect x="0" y="22" width="7" height="7" />
                <rect x="1" y="23" width="5" height="5" fill="white" />
                <rect x="2" y="24" width="3" height="3" />

                {/* Random simulated code dot cells */}
                <rect x="9" y="1" width="2" height="2" />
                <rect x="15" y="0" width="3" height="1" />
                <rect x="19" y="2" width="1" height="3" />
                
                <rect x="9" y="9" width="3" height="3" />
                <rect x="14" y="10" width="2" height="1" />
                <rect x="18" y="8" width="4" height="2" />
                
                <rect x="25" y="9" width="3" height="2" />
                <rect x="10" y="15" width="2" height="4" />
                <rect x="14" y="14" width="4" height="2" />
                
                <rect x="20" y="15" width="2" height="2" />
                <rect x="9" y="21" width="3" height="1" />
                <rect x="15" y="22" width="4" height="3" />
                
                <rect x="22" y="21" width="2" height="2" />
                <rect x="25" y="24" width="3" height="3" />
              </svg>
            </div>

            {/* Verification Roster details */}
            <div className="bg-brand-900/50 border border-brand-600/30 rounded-xl p-3.5 space-y-2 text-[11px]">
              <div className="flex justify-between items-center text-slate-300">
                <span>Roster Host:</span>
                <span className="font-semibold text-white">{user.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Access Level:</span>
                <span className="font-bold text-brand-300">{ROLE_LABELS[user.role]}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Active Branch:</span>
                <span className="font-semibold text-slate-100">
                  {selectedBranchId === "all" ? "Downtown Innovation" : branches.find(b => b.id === selectedBranchId)?.name || "Downtown Innovation"}
                </span>
              </div>
            </div>

            {/* Reset ticker and status */}
            <div className="flex items-center justify-between text-[10px] text-neutral px-1">
              <span className="flex items-center gap-1 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Token: ROLL_ENC_{countdown}
              </span>
              <span className="font-mono text-brand-400 font-bold">Resets in {countdown}s</span>
            </div>

          </div>
        </div>
      )}
    </aside>
  );
}
