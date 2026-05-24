"use client";

import React, { useEffect, useState } from "react";
import { getBranchesAction, checkInVisitorAction } from "@/app/actions";
import { useBranchStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  Users,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  UserCheck
} from "lucide-react";

export default function KioskPage() {
  const { addNotification } = useBranchStore();
  
  // Step controls
  const [branches, setBranches] = useState<{ id: string; name: string; city: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    hostName: "",
    hostEmail: "",
    purpose: "Meeting",
    branchId: "",
  });

  useEffect(() => {
    async function loadBranches() {
      const data = await getBranchesAction();
      setBranches(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, branchId: data[0].id }));
      }
    }
    loadBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.hostName || !formData.hostEmail || !formData.branchId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const res = await checkInVisitorAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success("Checked in successfully!");
      setSubmitted(true);

      // Trigger simulated notifications
      const selectedBranch = branches.find((b) => b.id === formData.branchId);
      const branchName = selectedBranch ? selectedBranch.name : "Downtown innovation hub";

      // 1. Host WhatsApp Simulation
      addNotification(
        "whatsapp",
        "Visitor Arrival Alert",
        `Hi *${formData.hostName}*, your guest *${formData.name}* (from *${formData.company || "Guest"}*) has arrived at reception for *${formData.purpose}* at center *${branchName}*. Checked in at: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        formData.hostName
      );

      // 2. Host Email Simulation
      addNotification(
        "email",
        "Your Guest Has Arrived",
        `Dear ${formData.hostName},\n\nYour guest, ${formData.name} representing ${formData.company || "N/A"}, has completed kiosk check-in at ${branchName}.\n\nPurpose: ${formData.purpose}\n\nPlease proceed to reception to receive your guest.`,
        formData.hostEmail
      );

      // Auto-reset form after 6 seconds
      setTimeout(() => {
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          hostName: "",
          hostEmail: "",
          purpose: "Meeting",
          branchId: branches[0]?.id || "",
        });
        setSubmitted(false);
      }, 6000);
    } else {
      toast.error("Kiosk check-in failed");
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-4 selection:bg-brand-400 selection:text-white">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-400/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-xl space-y-6 relative z-10">
        
        {/* Logo and Greeting */}
        <div className="text-center space-y-2">
          <div className="inline-flex size-14 items-center justify-center rounded-xl bg-brand-400/10 border border-brand-400/20 text-brand-400 mb-2">
            <Building2 className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white">CoNexus Guest Terminal</h1>
          <p className="text-xs text-neutral">
            Welcome! Please complete guest registration to alert your host instantly.
          </p>
        </div>

        {!submitted ? (
          <Card className="border-brand-600 bg-brand-700/80 backdrop-blur-md shadow-2xl">
            <CardHeader className="border-b border-brand-600/50 pb-4">
              <CardTitle className="font-heading text-sm font-bold text-slate-200 flex items-center gap-2">
                <UserCheck className="size-4.5 text-brand-400" />
                Check-in Form
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                
                {/* Branch Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="kiosk-branch" className="text-xs text-slate-300">CoNexus Coworking Center *</Label>
                  <select
                    id="kiosk-branch"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-850 px-3 py-2 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Visitor name */}
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="visitor-name" className="text-xs text-slate-300">Your Full Name *</Label>
                    <input
                      id="visitor-name"
                      type="text"
                      placeholder="e.g. Richard Hendricks"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border border-brand-600 bg-brand-850 px-3 py-2 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="visitor-comp" className="text-xs text-slate-300">Your Company Name</Label>
                    <input
                      id="visitor-comp"
                      type="text"
                      placeholder="e.g. Pied Piper"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full rounded-md border border-brand-600 bg-brand-850 px-3 py-2 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="visitor-email" className="text-xs text-slate-300">Your Email Address</Label>
                    <input
                      id="visitor-email"
                      type="email"
                      placeholder="richard@piedpiper.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-md border border-brand-600 bg-brand-850 px-3 py-2 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="visitor-phone" className="text-xs text-slate-300">Your Phone Number</Label>
                    <input
                      id="visitor-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-md border border-brand-600 bg-brand-850 px-3 py-2 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Host name */}
                <div className="grid grid-cols-2 gap-4 border-t border-brand-600/50 pt-3">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="host-name" className="text-xs text-slate-300">Host Contact Name *</Label>
                    <input
                      id="host-name"
                      type="text"
                      placeholder="Host employee name"
                      value={formData.hostName}
                      onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                      className="w-full rounded-md border border-brand-600 bg-brand-850 px-3 py-2 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Host email */}
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="host-email" className="text-xs text-slate-300">Host Contact Email *</Label>
                    <input
                      id="host-email"
                      type="email"
                      placeholder="host@company.com"
                      value={formData.hostEmail}
                      onChange={(e) => setFormData({ ...formData, hostEmail: e.target.value })}
                      className="w-full rounded-md border border-brand-600 bg-brand-850 px-3 py-2 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Purpose of visit */}
                <div className="space-y-1.5">
                  <Label htmlFor="visitor-purpose" className="text-xs text-slate-300">Purpose of Visit *</Label>
                  <select
                    id="visitor-purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-850 px-3 py-2 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Meeting">Scheduled Meeting</option>
                    <option value="Interview">Job Interview</option>
                    <option value="Delivery">Package Delivery</option>
                    <option value="Tour">Site Facility Tour</option>
                    <option value="Other">Others</option>
                  </select>
                </div>

              </CardContent>
              <div className="p-4 border-t border-brand-600/50">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-brand-400 hover:bg-brand-300 text-white font-bold text-xs h-10 rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? "Checking in..." : "Complete Kiosk Check-in"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="border-brand-600 bg-brand-700/90 shadow-2xl p-8 text-center space-y-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/20 text-success border border-success/35 mx-auto">
              <CheckCircle className="size-9" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-lg font-bold text-slate-100">Check-in Complete!</h2>
              <p className="text-xs text-neutral max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-200">{formData.name}</strong>. We have dispatched a simulated WhatsApp and email notification to your host <strong className="text-slate-200">{formData.hostName}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral bg-brand-900/40 py-2 px-3 rounded-lg border border-brand-600 max-w-xs mx-auto">
              <Clock className="size-3.5" />
              <span>Resetting terminal for next visitor...</span>
            </div>
          </Card>
        )}

        <div className="text-center text-[10px] text-neutral">
          CoNexus OS v1.0.0 · Lobby Concierge Terminal
        </div>
      </div>
    </div>
  );
}
