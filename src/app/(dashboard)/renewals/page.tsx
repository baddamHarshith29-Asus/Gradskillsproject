"use client";

import React, { useEffect, useState } from "react";
import { useBranchStore } from "@/lib/store";
import { getContractsAction, renewContractAction } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Clock,
  Send,
  AlertTriangle,
  RefreshCw,
  Mail,
  User,
  Activity,
  Calendar,
  Building,
  CheckCircle,
  Loader2
} from "lucide-react";

export default function RenewalsPage() {
  const { selectedBranchId, addNotification } = useBranchStore();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Renewal Modal Form State
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [newEndDate, setNewEndDate] = useState("");
  const [newRate, setNewRate] = useState(0);
  const [renewing, setRenewing] = useState(false);

  // Active Category Filter
  const [activeBucket, setActiveBucket] = useState("ALL");

  // Signature canvas states
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (selectedContract) {
      setIsSigned(false);
    }
  }, [selectedContract]);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.strokeStyle = "#38bdf8"; // neon blue ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsSigned(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  useEffect(() => {
    loadRenewalsData();
  }, [selectedBranchId]);

  async function loadRenewalsData() {
    setLoading(true);
    const data = await getContractsAction(selectedBranchId);
    setContracts(data);
    setLoading(false);
  }

  // Calculate days left helper
  const getDaysLeft = (endDateStr: string) => {
    const end = new Date(endDateStr).setHours(0, 0, 0, 0);
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  // Categorize contract
  const getBucket = (daysLeft: number) => {
    if (daysLeft <= 0) return "EXPIRED";
    if (daysLeft === 1) return "1_DAY";
    if (daysLeft <= 7) return "7_DAYS";
    if (daysLeft <= 15) return "15_DAYS";
    if (daysLeft <= 30) return "30_DAYS";
    return "SAFE";
  };

  const getBucketLabel = (bucket: string) => {
    switch (bucket) {
      case "EXPIRED": return "Already Expired";
      case "1_DAY": return "Expiring in 1 Day";
      case "7_DAYS": return "Expiring in 7 Days";
      case "15_DAYS": return "Expiring in 15 Days";
      case "30_DAYS": return "Expiring in 30 Days";
      default: return "Safe / Multi-Month";
    }
  };

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case "EXPIRED": return "border-danger text-danger bg-danger/5";
      case "1_DAY": return "border-red-500/50 text-red-400 bg-red-500/5";
      case "7_DAYS": return "border-orange-500/50 text-orange-400 bg-orange-500/5";
      case "15_DAYS": return "border-yellow-500/50 text-yellow-500 bg-yellow-500/5";
      case "30_DAYS": return "border-brand-300/50 text-brand-300 bg-brand-400/5";
      default: return "border-success/50 text-success bg-success/5";
    }
  };

  // Filter logic
  const filteredContracts = contracts.filter((c) => {
    const days = getDaysLeft(c.endDate);
    const bucket = getBucket(days);
    if (activeBucket === "ALL") return true;
    if (activeBucket === "AT_RISK") return c.client.healthScore < 50;
    return bucket === activeBucket;
  });

  // Count summaries
  const expiredCount = contracts.filter(c => getDaysLeft(c.endDate) <= 0).length;
  const criticalCount = contracts.filter(c => {
    const days = getDaysLeft(c.endDate);
    return days > 0 && days <= 7;
  }).length;
  const warningCount = contracts.filter(c => {
    const days = getDaysLeft(c.endDate);
    return days > 7 && days <= 30;
  }).length;
  const atRiskCount = contracts.filter(c => c.client.healthScore < 50).length;

  const handleSendReminder = (contract: any, type: "whatsapp" | "email") => {
    const days = getDaysLeft(contract.endDate);
    const recipient = `${contract.client.name} (${contract.client.company})`;
    const endDateStr = new Date(contract.endDate).toLocaleDateString();

    if (type === "whatsapp") {
      addNotification(
        "whatsapp",
        "License Expiration Reminder",
        `Hi *${contract.client.name}*, your workspace license contract for center *${contract.client.branch.name}* expires in *${days} days* (${endDateStr}). Renew this week to guarantee badge and wifi connectivity.`,
        recipient
      );
      toast.success("Simulated WhatsApp reminder logged!");
    } else {
      addNotification(
        "email",
        "Workspace License Expiration Pending",
        `Dear ${contract.client.name},\n\nWe hope you have enjoyed your time at CoNexus. Your contract is expiring on ${endDateStr}.\n\nPlease contact our community leads or sign an extension in your billing portal.`,
        contract.client.email
      );
      toast.success("Simulated Email reminder logged!");
    }
  };

  const handleOpenRenew = (contract: any) => {
    setSelectedContract(contract);
    // Suggest 6 months extension
    const currentEnd = new Date(contract.endDate);
    currentEnd.setMonth(currentEnd.getMonth() + 6);
    setNewEndDate(currentEnd.toISOString().split("T")[0]);
    setNewRate(contract.monthlyRate);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    setRenewing(true);
    const res = await renewContractAction(selectedContract.id, newEndDate, newRate);
    setRenewing(false);

    if (res.success) {
      toast.success("Leasing contract extended & set back to Active!");
      
      // Log notification
      addNotification(
        "system",
        "Contract Renewed",
        `Lease ID #${selectedContract.id.substring(0, 8).toUpperCase()} extended to ${newEndDate} at ₹${newRate}/mo.`,
        "Operations Audit"
      );

      setSelectedContract(null);
      loadRenewalsData();
    } else {
      toast.error("Failed to renew contract");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Clock className="size-5.5 text-brand-400" />
          Lease Renewals Pipeline
        </h2>
        <p className="text-xs text-neutral">
          Monitor leasing terms, target soon-expiring client contracts, send simulation notifications, and execute license extensions.
        </p>
      </div>

      {/* KPI stats dashboard */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card 
            className="border-brand-600 bg-brand-700 p-4 cursor-pointer hover:border-brand-400/40 transition-colors"
            onClick={() => setActiveBucket("EXPIRED")}
          >
            <span className="text-[10px] uppercase font-bold text-neutral">Already Expired</span>
            <span className="block text-lg font-bold text-danger mt-1">
              {expiredCount}
            </span>
          </Card>

          <Card 
            className="border-brand-600 bg-brand-700 p-4 cursor-pointer hover:border-brand-400/40 transition-colors"
            onClick={() => setActiveBucket("7_DAYS")}
          >
            <span className="text-[10px] uppercase font-bold text-neutral">Critical (1-7 Days)</span>
            <span className="block text-lg font-bold text-orange-400 mt-1">
              {criticalCount}
            </span>
          </Card>

          <Card 
            className="border-brand-600 bg-brand-700 p-4 cursor-pointer hover:border-brand-400/40 transition-colors"
            onClick={() => setActiveBucket("30_DAYS")}
          >
            <span className="text-[10px] uppercase font-bold text-neutral">Warning (8-30 Days)</span>
            <span className="block text-lg font-bold text-yellow-500 mt-1">
              {warningCount}
            </span>
          </Card>

          <Card 
            className="border-brand-600 bg-brand-700 p-4 cursor-pointer hover:border-brand-400/40 transition-colors"
            onClick={() => setActiveBucket("AT_RISK")}
          >
            <span className="text-[10px] uppercase font-bold text-neutral">At Risk (Health &lt; 50)</span>
            <span className="block text-lg font-bold text-red-500 mt-1 flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-red-500" />
              {atRiskCount}
            </span>
          </Card>
        </div>
      )}

      {/* Filter bucket toolbar */}
      <Card className="border-brand-600 bg-brand-700 p-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-neutral mr-2 font-semibold">Active Filter:</span>
          {[
            { id: "ALL", label: "All Active Contracts" },
            { id: "EXPIRED", label: "Expired" },
            { id: "1_DAY", label: "1 Day Left" },
            { id: "7_DAYS", label: "7 Days Left" },
            { id: "15_DAYS", label: "15 Days Left" },
            { id: "30_DAYS", label: "30 Days Left" },
            { id: "SAFE", label: "Safe (&gt; 30 Days)" },
            { id: "AT_RISK", label: "At Risk Accounts" }
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveBucket(item.id)}
              className={`h-7.5 text-[11px] px-2.5 rounded transition-colors ${
                activeBucket === item.id
                  ? "bg-brand-600/40 text-brand-300 border border-brand-400/35 font-semibold"
                  : "text-slate-300 hover:bg-brand-800/40 hover:text-white"
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: item.label }} />
            </Button>
          ))}
        </div>
      </Card>

      {/* Renewals list */}
      {loading ? (
        <div className="flex h-40 items-center justify-center text-neutral text-xs animate-pulse">
          <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
          Analyzing leasing pipelines...
        </div>
      ) : filteredContracts.length === 0 ? (
        <Card className="border-brand-600 bg-brand-700 p-8 text-center max-w-sm mx-auto">
          <CheckCircle className="size-10 text-brand-600 mx-auto mb-2" />
          <span className="text-xs font-semibold text-slate-300 block">No Expiring Leases Found</span>
          <span className="text-[11px] text-neutral mt-0.5 block">
            All contracts in this filter category are fully active and compliant.
          </span>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredContracts.map((contract) => {
            const daysLeft = getDaysLeft(contract.endDate);
            const bucket = getBucket(daysLeft);
            const isAtRisk = contract.client.healthScore < 50;

            return (
              <Card 
                key={contract.id} 
                className={`border-brand-600 bg-brand-700 p-4 transition-colors hover:border-brand-600/80 ${
                  isAtRisk ? "border-l-4 border-l-red-500" : ""
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                  {/* Left Side Client Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-brand-800 border border-brand-600 font-bold text-slate-300">
                      {contract.client.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{contract.client.name}</span>
                        <Badge variant="outline" className={`text-[9px] uppercase font-bold px-1.5 h-4.5 border ${getBucketColor(bucket)}`}>
                          {getBucketLabel(bucket)} ({daysLeft <= 0 ? "Expired" : `${daysLeft} days`})
                        </Badge>
                        {isAtRisk && (
                          <Badge className="bg-red-500/10 text-danger border border-danger/25 text-[9px] font-bold gap-1 h-4.5">
                            <AlertTriangle className="size-2.5" />
                            AT RISK (Health: {contract.client.healthScore}%)
                          </Badge>
                        )}
                      </div>
                      <span className="block text-[11px] text-neutral mt-0.5 font-medium flex items-center gap-1">
                        <Building className="size-3.5" />
                        {contract.client.company} · {contract.client.branch.name}
                      </span>
                    </div>
                  </div>

                  {/* Right Side Actions */}
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <div className="text-right mr-2">
                      <span className="block text-xs font-bold text-white">₹{contract.monthlyRate.toLocaleString()}/mo</span>
                      <span className="block text-[10px] text-neutral mt-0.5">
                        Expires: {new Date(contract.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Email Remind */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSendReminder(contract, "email")}
                      className="h-8 w-8 border-brand-600 hover:bg-brand-800 text-neutral hover:text-white"
                      title="Send Email Reminder"
                    >
                      <Mail className="size-3.5" />
                    </Button>

                    {/* WhatsApp Remind */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSendReminder(contract, "whatsapp")}
                      className="h-8 w-8 border-brand-600 hover:bg-brand-800 text-neutral hover:text-white"
                      title="Send WhatsApp Reminder"
                    >
                      <Send className="size-3.5 rotate-45" />
                    </Button>

                    {/* Renew Contract */}
                    <Button
                      onClick={() => handleOpenRenew(contract)}
                      className="h-8 text-xs bg-brand-400 hover:bg-brand-300 text-white font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="size-3.5" />
                      Renew
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Renewal extend terms modal dialog */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm border-brand-600 bg-brand-700 shadow-2xl relative">
            <CardHeader>
              <CardTitle className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="size-4.5 text-brand-400" />
                Configure Lease Extension
              </CardTitle>
              <CardDescription className="text-xs text-neutral">
                Extend contract lease terms for <strong className="text-slate-200">{selectedContract.client.company}</strong>.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRenewSubmit}>
              <CardContent className="space-y-4">
                {/* New expiration Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="renew-end" className="text-xs text-slate-300">Revised Expiration Date</Label>
                  <input
                    id="renew-end"
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    min={new Date(selectedContract.endDate).toISOString().split("T")[0]}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                    required
                  />
                </div>

                {/* Monthly Rate */}
                <div className="space-y-1.5">
                  <Label htmlFor="renew-rate" className="text-xs text-slate-300">Monthly License Fee (INR)</Label>
                  <input
                    id="renew-rate"
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                {/* E-Signature Canvas Pad */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <Label>Sign License Renewal Agreement *</Label>
                    {isSigned && (
                      <Badge className="bg-emerald-500/10 text-success border border-emerald-500/20 text-[9px] h-4">
                        Signed
                      </Badge>
                    )}
                  </div>
                  <div className="border border-brand-600 rounded bg-brand-900/60 p-1 relative">
                    <canvas
                      ref={canvasRef}
                      width={310}
                      height={100}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair bg-slate-950/20 rounded block w-full"
                    />
                    {!isSigned && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-neutral italic">
                        Draw signature here
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] text-brand-300 hover:text-brand-200 underline font-semibold cursor-pointer"
                    >
                      Clear Pad
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-brand-600/50 p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedContract(null)}
                  className="h-8.5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={renewing || !isSigned}
                  className="h-8.5 text-xs bg-brand-400 hover:bg-brand-300 text-white font-semibold"
                >
                  {renewing ? "Renewing..." : "Execute Renewal"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
