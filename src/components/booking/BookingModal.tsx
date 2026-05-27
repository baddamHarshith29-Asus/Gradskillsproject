"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, Calendar, Clock, DollarSign, Sparkles, User, X } from "lucide-react";
import { getClientsAction } from "@/app/actions";
import { useBranchStore } from "@/lib/store";
import { calculatePrice, isPeakPricing, isDiscountPricing } from "@/lib/pricing";

interface SpaceInfo {
  id: string;
  name: string;
  type: string;
  baseRate: number;
  capacity: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceInfo | null;
  branchId: string;
  onSuccess: () => void;
  // Mock historical utilization (between 0.0 and 1.0)
  historicalUtilization?: number;
}

const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export default function BookingModal({
  isOpen,
  onClose,
  space,
  branchId,
  onSuccess,
  historicalUtilization = 0.5,
}: BookingModalProps) {
  const [clients, setClients] = useState<{ id: string; name: string; company: string; email: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [submitting, setSubmitting] = useState(false);
  const { addNotification } = useBranchStore();

  useEffect(() => {
    if (isOpen) {
      async function loadClients() {
        const dbClients = await getClientsAction();
        setClients(dbClients);
        if (dbClients.length > 0) {
          setSelectedClientId(dbClients[0].id);
        }
      }
      loadClients();
    }
  }, [isOpen]);

  // Synchronize start and end times to prevent validation errors
  useEffect(() => {
    const startIdx = TIME_OPTIONS.indexOf(startTime);
    const endIdx = TIME_OPTIONS.indexOf(endTime);
    if (endIdx <= startIdx) {
      const nextIdx = Math.min(startIdx + 2, TIME_OPTIONS.length - 1);
      setEndTime(TIME_OPTIONS[nextIdx]);
    }
  }, [startTime]);

  if (!isOpen || !space) return null;

  // Calculate pricing
  const hourlyRate = calculatePrice(space.baseRate, historicalUtilization);
  const isPeak = isPeakPricing(historicalUtilization);
  const isDiscount = isDiscountPricing(historicalUtilization);

  // Calculate total hours
  const startIdx = TIME_OPTIONS.indexOf(startTime);
  const endIdx = TIME_OPTIONS.indexOf(endTime);
  const hours = endIdx > startIdx ? endIdx - startIdx : 1;
  const totalAmount = hourlyRate * hours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endIdx <= startIdx) {
      toast.error("End time must be after start time");
      return;
    }
    if (!selectedClientId) {
      toast.error("Please select a client account");
      return;
    }

    setSubmitting(true);
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);
    
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: space.id,
          clientId: selectedClientId,
          branchId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          totalAmount,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        toast.success(`Booking confirmed for ${space.name}!`);
        
        // Log Simulated Notifications
        const client = clients.find((c) => c.id === selectedClientId);
        const recipientName = client ? `${client.name} (${client.company})` : "Member";
        
        // Send simulated WhatsApp
        addNotification(
          "whatsapp",
          "Booking Confirmation",
          `Hi ${client?.name || "Member"}, your booking for *${space.name}* at Downtown Innovation Hub on ${date} (${startTime}-${endTime}) is confirmed! Total lease amount: ₹${totalAmount}.`,
          recipientName
        );

        // Send simulated Email
        addNotification(
          "email",
          "Invoice & Booking Slip Issued",
          `Dear ${client?.name || "Member"},\n\nWe have received your reservation for ${space.name}. Invoice #${Math.floor(1000 + Math.random()*9000)} has been issued for ₹${totalAmount}.\n\nAccess PIN: ${Math.floor(1000 + Math.random()*9000)}`,
          client?.email || "member@conexus.app"
        );

        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Failed to make booking");
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      toast.error("An error occurred during booking checkout.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-brand-600 bg-brand-700 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-4.5" />
        </button>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-brand-400">
            <Calendar className="size-5" />
            <CardTitle className="font-heading text-base font-bold text-white">
              Configure Booking
            </CardTitle>
          </div>
          <CardDescription className="text-neutral text-xs">
            Reserve <strong className="text-slate-200">{space.name}</strong> (Capacity: {space.capacity} pax)
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {/* Client selector */}
            <div className="space-y-1.5">
              <Label htmlFor="booking-client" className="text-xs text-slate-300">Client Account</Label>
              <select
                id="booking-client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Pick */}
            <div className="space-y-1.5">
              <Label htmlFor="booking-date" className="text-xs text-slate-300">Reservation Date</Label>
              <input
                id="booking-date"
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                required
              />
            </div>

            {/* Time windows */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="booking-start" className="text-xs text-slate-300">Start Time</Label>
                <select
                  id="booking-start"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                >
                  {TIME_OPTIONS.slice(0, -1).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-end" className="text-xs text-slate-300">End Time</Label>
                <select
                  id="booking-end"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                >
                  {TIME_OPTIONS.slice(TIME_OPTIONS.indexOf(startTime) + 1).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Calculations Sandbox */}
            <div className="rounded-lg border border-brand-600 bg-brand-900/50 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral font-medium">
                <span>Base Space Rate</span>
                <span>₹{space.baseRate} / hr</span>
              </div>

              {/* Peak indicator */}
              <div className="flex items-center justify-between">
                <span className="text-neutral font-medium">Demand Signal</span>
                <span className="font-bold flex items-center gap-1">
                  {isPeak && (
                    <Badge className="bg-red-500/10 text-danger border border-danger/25 text-[9px] font-bold uppercase tracking-wider h-5">
                      Peak Demand (+15%)
                    </Badge>
                  )}
                  {isDiscount && (
                    <Badge className="bg-emerald-500/10 text-success border border-success/25 text-[9px] font-bold uppercase tracking-wider h-5">
                      Off-Peak Discount (-15%)
                    </Badge>
                  )}
                  {!isPeak && !isDiscount && (
                    <Badge className="bg-slate-500/10 text-slate-400 border border-brand-600 text-[9px] font-bold uppercase tracking-wider h-5">
                      Standard Demand
                    </Badge>
                  )}
                </span>
              </div>

              {/* Dynamic rate */}
              <div className="flex items-center justify-between text-slate-200 border-t border-brand-600/50 pt-2 font-medium">
                <span>Dynamic Hourly Rate</span>
                <span className="font-bold text-slate-100">₹{hourlyRate} / hr</span>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between text-neutral font-medium">
                <span>Duration</span>
                <span>{hours} hour{hours > 1 && "s"}</span>
              </div>

              {/* Total price */}
              <div className="flex items-center justify-between border-t border-brand-600 pt-2 font-bold text-white text-sm">
                <span>Total Amount Due</span>
                <span className="text-brand-300">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-5 gap-2 border-t border-brand-600/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 h-9 text-xs bg-brand-400 hover:bg-brand-300 text-white font-semibold"
            >
              {submitting ? "Processing..." : "Confirm Reservation"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
