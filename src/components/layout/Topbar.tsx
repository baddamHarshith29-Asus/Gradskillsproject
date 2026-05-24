"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Mail,
  Search,
  Smartphone,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useBranchStore } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Topbar() {
  const pathname = usePathname();
  const { notifications, clearNotifications } = useBranchStore();
  const [isOpen, setIsOpen] = useState(false);

  // Derive title from path
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Home";
    const last = segments[segments.length - 1];
    return last
      .replace("-", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="fixed top-0 right-0 left-60 z-10 flex h-16 items-center justify-between border-b border-brand-600 bg-brand-900 px-8 text-slate-100">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-lg font-bold tracking-tight text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64 max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral" />
          <input
            type="text"
            placeholder="Quick search (desks, rooms, clients)..."
            className="w-full rounded-md border border-brand-600 bg-brand-800 py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
          />
        </div>

        {/* Notifications Sheet Trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="relative rounded-md border border-brand-600 bg-brand-800 p-2 text-slate-300 hover:text-white transition-colors cursor-pointer">
            <Bell className="size-4.5" />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand-400 text-[9px] font-bold text-white ring-2 ring-brand-900 animate-pulse">
                {notifications.length}
              </span>
            )}
          </SheetTrigger>
          <SheetContent className="border-l border-brand-600 bg-brand-800 text-slate-100 w-[420px] sm:w-[480px]">
            <SheetHeader className="border-b border-brand-600 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Smartphone className="size-5 text-success" />
                  Virtual Notification Hub
                </SheetTitle>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="flex items-center gap-1.5 text-xs text-neutral hover:text-danger transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    Clear Logs
                  </button>
                )}
              </div>
              <p className="text-[11px] text-neutral mt-1">
                Virtual notification sandbox showing simulated emails and WhatsApp webhook alerts.
              </p>
            </SheetHeader>

            {/* Notification logs list */}
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell className="size-10 text-brand-600 mb-3" />
                  <span className="text-xs font-semibold text-slate-400">No Notifications Sent Yet</span>
                  <span className="text-[10px] text-neutral max-w-[200px] mt-1">
                    Book rooms, register visitors, or complete onboarding to trigger real-time simulated alerts!
                  </span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-brand-600 bg-brand-900/60 p-3.5 space-y-2 relative overflow-hidden"
                  >
                    {/* Badge / Type Indicator */}
                    <div className="flex items-center justify-between border-b border-brand-600/50 pb-2">
                      <div className="flex items-center gap-1.5">
                        {n.type === "whatsapp" && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] hover:bg-emerald-500/10 font-bold uppercase tracking-wider gap-1">
                            <span className="inline-block size-1.5 rounded-full bg-emerald-400"></span>
                            WhatsApp Message
                          </Badge>
                        )}
                        {n.type === "email" && (
                          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] hover:bg-blue-500/10 font-bold uppercase tracking-wider gap-1">
                            <span className="inline-block size-1.5 rounded-full bg-blue-400"></span>
                            Email Dispatch
                          </Badge>
                        )}
                        {n.type === "system" && (
                          <Badge className="bg-slate-500/15 text-slate-400 border border-slate-500/20 text-[9px] hover:bg-slate-500/15 font-bold uppercase tracking-wider gap-1">
                            <span className="inline-block size-1.5 rounded-full bg-slate-400"></span>
                            System Event
                          </Badge>
                        )}
                      </div>
                      <span className="text-[9px] text-neutral font-semibold">{n.timestamp}</span>
                    </div>

                    {/* Notification Details */}
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-bold text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-neutral shrink-0">To: {n.recipient}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.body}</p>
                    </div>

                    {/* WhatsApp Checkmark Indicator */}
                    {n.type === "whatsapp" && (
                      <div className="flex justify-end pt-1">
                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-medium">
                          Delivered
                          <CheckCheck className="size-3.5" />
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
