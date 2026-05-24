"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useBranchStore } from "@/lib/store";
import { getVisitorsAction, checkOutVisitorAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  QrCode,
  Users,
  LogOut,
  Clock,
  Search,
  ExternalLink,
  Loader2,
  CalendarDays,
  CheckCircle
} from "lucide-react";

export default function VisitorsPage() {
  const { selectedBranchId } = useBranchStore();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | CHECKED_OUT

  useEffect(() => {
    loadVisitorsData();
  }, [selectedBranchId]);

  async function loadVisitorsData() {
    setLoading(true);
    const data = await getVisitorsAction(selectedBranchId);
    setVisitors(data);
    setFilteredVisitors(data);
    setLoading(false);
  }

  // Handle search and status filters
  useEffect(() => {
    let result = visitors;

    if (statusFilter === "ACTIVE") {
      result = result.filter((v) => !v.checkOutAt);
    } else if (statusFilter === "CHECKED_OUT") {
      result = result.filter((v) => v.checkOutAt);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.company && v.company.toLowerCase().includes(q)) ||
          v.hostName.toLowerCase().includes(q)
      );
    }

    setFilteredVisitors(result);
  }, [searchQuery, statusFilter, visitors]);

  const handleCheckOut = async (visitorId: string) => {
    const res = await checkOutVisitorAction(visitorId);
    if (res.success) {
      toast.success("Visitor checked out successfully");
      loadVisitorsData();
    } else {
      toast.error("Failed to check out visitor");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="size-5.5 text-brand-400" />
            Visitor Handling & Logs
          </h2>
          <p className="text-xs text-neutral">
            Review guest check-ins, verify host notifications, and audit visitor logs for safety compliance.
          </p>
        </div>

        {/* Public Kiosk CTA */}
        <a 
          href="/kiosk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-brand-400 hover:bg-brand-300 text-white px-4 py-2 text-xs font-bold transition-colors gap-1.5"
        >
          <QrCode className="size-4" />
          Launch Guest Kiosk
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* Toolbar controls */}
      <Card className="border-brand-600 bg-brand-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-neutral" />
            <input
              type="text"
              placeholder="Search visitors, companies, or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-brand-600 bg-brand-800 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
            />
          </div>

          {/* Status filters */}
          <div className="flex bg-brand-850 p-0.5 rounded border border-brand-600">
            {[
              { id: "ALL", label: "All Logs" },
              { id: "ACTIVE", label: "Currently Checked-in" },
              { id: "CHECKED_OUT", label: "Checked-out" }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`text-[10px] font-semibold px-3 py-1 rounded transition-colors ${
                  statusFilter === filter.id ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table grid */}
      <Card className="border-brand-600 bg-brand-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-neutral text-xs animate-pulse">
              <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
              Retrieving visitor logs...
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-neutral">
              <Users className="size-10 text-brand-600 mb-2" />
              <span className="text-xs font-semibold text-slate-300">No Visitors Found</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-600 bg-brand-800/40 text-neutral font-semibold">
                    <th className="p-4">Visitor</th>
                    <th className="p-4">Host Details</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4">Check-In At</th>
                    <th className="p-4">Check-Out At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-600/50">
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-brand-750 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{visitor.name}</div>
                        {visitor.company && <div className="text-[10px] text-neutral mt-0.5">{visitor.company}</div>}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-200 font-medium">{visitor.hostName}</div>
                        <div className="text-[10px] text-neutral mt-0.5">{visitor.hostEmail}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-300 font-medium">{visitor.purpose || "Meeting"}</span>
                      </td>
                      <td className="p-4 text-neutral font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 text-brand-400" />
                          {new Date(visitor.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[9px] mt-0.5">{new Date(visitor.checkInAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 text-neutral font-mono">
                        {visitor.checkOutAt ? (
                          <>
                            <div className="flex items-center gap-1.5 text-success">
                              <CheckCircle className="size-3" />
                              {new Date(visitor.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[9px] mt-0.5">{new Date(visitor.checkOutAt).toLocaleDateString()}</div>
                          </>
                        ) : (
                          <Badge className="bg-brand-400/10 border border-brand-400/25 text-brand-300 text-[9px] font-bold">
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!visitor.checkOutAt && (
                          <Button
                            onClick={() => handleCheckOut(visitor.id)}
                            className="h-7 text-[10px] bg-brand-600 border border-brand-500 hover:bg-brand-850 text-slate-200 font-semibold"
                          >
                            <LogOut className="size-3 mr-1" />
                            Check Out
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
