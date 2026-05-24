"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useBranchStore } from "@/lib/store";
import { getFullClientsAction, updateClientLifecycleAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  FileText, 
  Ticket as TicketIcon, 
  Calendar, 
  CreditCard,
  Building,
  Mail,
  Phone,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const LIFECYCLES = ["ALL", "LEAD", "PROSPECT", "ONBOARDING", "ACTIVE", "AT_RISK", "CHURNED"];

const LIFECYCLE_BADGES: Record<string, string> = {
  LEAD: "border-slate-500 text-slate-400 bg-slate-500/5",
  PROSPECT: "border-yellow-500/40 text-yellow-500 bg-yellow-500/5",
  ONBOARDING: "border-cyan-500/40 text-cyan-400 bg-cyan-500/5",
  ACTIVE: "border-success/40 text-success bg-success/5",
  AT_RISK: "border-orange-500/40 text-orange-400 bg-orange-500/5",
  CHURNED: "border-danger/40 text-danger bg-danger/5",
};

export default function ClientsPage() {
  const { selectedBranchId } = useBranchStore();
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLifecycle, setActiveLifecycle] = useState("ALL");
  
  // Expanded detail state
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, [selectedBranchId]);

  async function loadClients() {
    setLoading(true);
    const data = await getFullClientsAction(selectedBranchId);
    setClients(data);
    setFilteredClients(data);
    setLoading(false);
  }

  // Handle Search & Filter logic
  useEffect(() => {
    let result = clients;
    
    if (activeLifecycle !== "ALL") {
      result = result.filter((c) => c.lifecycle === activeLifecycle);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    
    setFilteredClients(result);
  }, [searchQuery, activeLifecycle, clients]);

  const toggleExpand = (id: string) => {
    setExpandedClientId(expandedClientId === id ? null : id);
  };

  const handleStatusChange = async (clientId: string, newLifecycle: string) => {
    const res = await updateClientLifecycleAction(clientId, newLifecycle);
    if (res.success) {
      toast.success(`Lifecycle status updated to ${newLifecycle}`);
      loadClients();
    } else {
      toast.error("Failed to update status");
    }
  };

  // Helper to render health ring
  const renderHealthRing = (score: number) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let color = "#10b981"; // success green
    if (score < 40) color = "#ef4444"; // danger red
    else if (score < 70) color = "#f59e0b"; // warning orange

    return (
      <div className="relative flex items-center justify-center size-10">
        <svg className="transform -rotate-90 size-10">
          <circle
            cx="20"
            cy="20"
            r={radius}
            className="stroke-brand-600"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke={color}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-white font-mono">{score}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="size-5.5 text-brand-400" />
            Clients CRM & Directory
          </h2>
          <p className="text-xs text-neutral">
            Manage company memberships, monitor engagement health indices, audit active workspace leases, and check tickets.
          </p>
        </div>

        <Link href="/onboarding">
          <Button className="bg-brand-400 hover:bg-brand-300 text-white font-semibold text-xs h-9">
            <Plus className="size-4 mr-1.5" />
            Onboard New Client
          </Button>
        </Link>
      </div>

      {/* Stats summary row */}
      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-brand-600 bg-brand-700 p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral uppercase font-semibold">Total Accounts</span>
              <span className="block text-lg font-bold text-white">{clients.length}</span>
            </div>
            <Users className="size-5 text-brand-400" />
          </Card>
          <Card className="border-brand-600 bg-brand-700 p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral uppercase font-semibold">Active Members</span>
              <span className="block text-lg font-bold text-success">
                {clients.filter(c => c.lifecycle === "ACTIVE").length}
              </span>
            </div>
            <CheckCircle2 className="size-5 text-success" />
          </Card>
          <Card className="border-brand-600 bg-brand-700 p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral uppercase font-semibold">At-Risk Accounts</span>
              <span className="block text-lg font-bold text-warning">
                {clients.filter(c => c.lifecycle === "AT_RISK").length}
              </span>
            </div>
            <AlertTriangle className="size-5 text-warning" />
          </Card>
          <Card className="border-brand-600 bg-brand-700 p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral uppercase font-semibold">Avg Health Score</span>
              <span className="block text-lg font-bold text-brand-300">
                {Math.round(clients.reduce((sum, c) => sum + c.healthScore, 0) / clients.length)}%
              </span>
            </div>
            <TrendingUp className="size-5 text-brand-300" />
          </Card>
        </div>
      )}

      {/* Toolbar */}
      <Card className="border-brand-600 bg-brand-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-neutral" />
            <input
              type="text"
              placeholder="Search by client name, company, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-brand-600 bg-brand-800 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
            />
          </div>

          {/* Lifecycle filters */}
          <div className="flex flex-wrap gap-1.5">
            {LIFECYCLES.map((stage) => (
              <Button
                key={stage}
                variant="ghost"
                onClick={() => setActiveLifecycle(stage)}
                className={`h-8 text-xs px-3 rounded transition-colors ${
                  activeLifecycle === stage
                    ? "bg-brand-600/40 text-brand-300 border border-brand-400/35 font-semibold"
                    : "text-slate-300 hover:bg-brand-800/40 hover:text-white"
                }`}
              >
                {stage === "ALL" ? "All Stages" : stage}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* CRM list table */}
      {loading ? (
        <div className="flex h-60 items-center justify-center text-neutral text-xs animate-pulse">
          <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
          Retrieving CRM records...
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="border-brand-600 bg-brand-700 p-8 text-center max-w-sm mx-auto">
          <Users className="size-10 text-brand-600 mx-auto mb-2" />
          <span className="text-xs font-semibold text-slate-300 block">No Clients Found</span>
          <span className="text-[11px] text-neutral mt-0.5 block">
            Try adjusting your search criteria or lifecycle status filters.
          </span>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const isExpanded = expandedClientId === client.id;
            const activeContract = client.contracts.find((c: any) => c.status === "ACTIVE");
            const unpaidInvoices = client.invoices.filter((i: any) => i.status === "PENDING");
            const openTickets = client.tickets.filter((t: any) => t.status === "OPEN" || t.status === "IN_PROGRESS");

            return (
              <Card 
                key={client.id} 
                className={`border-brand-600 bg-brand-700 transition-all duration-200 ${
                  isExpanded ? "border-brand-400/50 bg-brand-750" : "hover:border-brand-600/80"
                }`}
              >
                {/* Main Row */}
                <div 
                  onClick={() => toggleExpand(client.id)}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Health score gauge */}
                    {renderHealthRing(client.healthScore)}
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{client.name}</span>
                        <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wider px-1.5 h-4.5 border ${LIFECYCLE_BADGES[client.lifecycle]}`}>
                          {client.lifecycle}
                        </Badge>
                      </div>
                      <span className="block text-[11px] text-neutral mt-0.5 font-medium flex items-center gap-1.5">
                        <Building className="size-3.5" />
                        {client.company}
                      </span>
                    </div>
                  </div>

                  {/* Quick stats badges */}
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <Badge variant="outline" className="border-brand-600 text-slate-300 text-[10px] font-medium bg-brand-800/40">
                      <Mail className="size-3 mr-1" />
                      {client.email}
                    </Badge>

                    {activeContract ? (
                      <Badge variant="outline" className="border-success/30 text-success text-[10px] bg-success/5 font-semibold">
                        ₹{activeContract.monthlyRate.toLocaleString()}/mo Lease
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-600 text-neutral text-[10px] bg-brand-850">
                        No Lease Contract
                      </Badge>
                    )}

                    {unpaidInvoices.length > 0 && (
                      <Badge className="bg-red-500/10 text-danger border border-danger/25 text-[10px] font-bold">
                        ₹{unpaidInvoices.reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString()} Pending
                      </Badge>
                    )}

                    {openTickets.length > 0 && (
                      <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/25 text-[10px] font-bold">
                        {openTickets.length} Open Ticket{openTickets.length > 1 && "s"}
                      </Badge>
                    )}

                    {isExpanded ? <ChevronUp className="size-4 text-neutral" /> : <ChevronDown className="size-4 text-neutral" />}
                  </div>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <CardContent className="border-t border-brand-600/50 p-4 bg-brand-900/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
                    
                    {/* Contract / General Info */}
                    <div className="space-y-3">
                      <span className="block font-heading text-xs font-bold text-slate-200 pb-1.5 border-b border-brand-600">
                        Lease Agreement & Contacts
                      </span>
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5 text-neutral" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      
                      {activeContract ? (
                        <div className="rounded-md border border-brand-600 bg-brand-850 p-3 space-y-1.5">
                          <div className="flex justify-between font-bold text-white">
                            <span>Contract Status</span>
                            <span className="text-success">{activeContract.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral">Monthly Rent</span>
                            <span className="text-slate-200">₹{activeContract.monthlyRate.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral">Term Range</span>
                            <span className="text-slate-200">
                              {new Date(activeContract.startDate).toLocaleDateString()} - {new Date(activeContract.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 text-center border border-dashed border-brand-600 rounded-md">
                          <span className="text-neutral block mb-2">No Active Leasing Found</span>
                          <Link href={`/onboarding?clientId=${client.id}`}>
                            <Button className="w-full text-[10px] h-7 bg-brand-400/10 border border-brand-400/20 text-brand-400 hover:bg-brand-400/20">
                              Execute Agreement
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* Change lifecycle dropdown */}
                      <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] uppercase font-semibold text-neutral">Modify Lifecycle Status</label>
                        <select
                          value={client.lifecycle}
                          onChange={(e) => handleStatusChange(client.id, e.target.value)}
                          className="w-full rounded border border-brand-600 bg-brand-800 px-2 py-1 text-xs text-slate-100 focus:outline-none cursor-pointer"
                        >
                          {LIFECYCLES.slice(1).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Bookings & Usage logs */}
                    <div className="space-y-3">
                      <span className="block font-heading text-xs font-bold text-slate-200 pb-1.5 border-b border-brand-600">
                        Room & Desk Bookings ({client.bookings.length})
                      </span>
                      {client.bookings.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                          {client.bookings.slice(0, 5).map((booking: any) => (
                            <div key={booking.id} className="flex justify-between items-center rounded border border-brand-600 bg-brand-850/50 p-2">
                              <div>
                                <span className="block font-bold text-slate-200">{booking.space?.name}</span>
                                <span className="block text-[10px] text-neutral">
                                  {new Date(booking.startTime).toLocaleDateString()} @ {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-brand-300">₹{booking.totalAmount}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral italic block py-2">No historical bookings found.</span>
                      )}
                    </div>

                    {/* Financial Invoices & SLA Tickets */}
                    <div className="space-y-3">
                      <span className="block font-heading text-xs font-bold text-slate-200 pb-1.5 border-b border-brand-600">
                        Recent Billing & Tickets
                      </span>
                      
                      {/* Invoices summary */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral flex items-center gap-1.5">
                          <CreditCard className="size-3.5" /> Billing History
                        </span>
                        {client.invoices.length > 0 ? (
                          <div className="flex justify-between items-center bg-brand-850 p-2 rounded border border-brand-600">
                            <div>
                              <span className="text-[10px] block text-neutral">Paid invoices: {client.invoices.filter((i: any) => i.status === "PAID").length}</span>
                              <span className="text-[10px] block text-neutral">Pending: {unpaidInvoices.length}</span>
                            </div>
                            <span className="font-bold text-white">₹{client.invoices.reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString()} Total</span>
                          </div>
                        ) : (
                          <span className="text-neutral italic text-[10px]">No invoice records found.</span>
                        )}
                      </div>

                      {/* Ticket Summary */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral flex items-center gap-1.5">
                          <TicketIcon className="size-3.5" /> Support Tickets
                        </span>
                        {client.tickets.length > 0 ? (
                          <div className="flex justify-between items-center bg-brand-850 p-2 rounded border border-brand-600">
                            <div>
                              <span className="text-[10px] block text-neutral">Open issues: {openTickets.length}</span>
                              <span className="text-[10px] block text-neutral">Resolved: {client.tickets.filter((t: any) => t.status === "RESOLVED" || t.status === "CLOSED").length}</span>
                            </div>
                            <Badge className="bg-brand-400/10 text-brand-400 border border-brand-400/20 text-[9px]">
                              {client.tickets.filter((t: any) => t.priority === "URGENT" || t.priority === "HIGH").length} Urg
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-neutral italic text-[10px]">No helpdesk tickets created.</span>
                        )}
                      </div>
                    </div>

                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
