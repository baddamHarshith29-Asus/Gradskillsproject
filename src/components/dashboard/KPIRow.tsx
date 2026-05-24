"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, IndianRupee, Percent, Users } from "lucide-react";

interface KPIRowProps {
  totalMembers: number;
  totalRevenue: number;
  avgOccupancy: number;
  activeTickets: number;
}

export default function KPIRow({
  totalMembers,
  totalRevenue,
  avgOccupancy,
  activeTickets,
}: KPIRowProps) {
  const kpis = [
    {
      title: "Total Active Members",
      value: totalMembers.toLocaleString(),
      desc: "Across all active client accounts",
      icon: <Users className="size-5 text-brand-400" />,
    },
    {
      title: "Monthly Recurring Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      desc: "Active contract lease value",
      icon: <IndianRupee className="size-5 text-success" />,
    },
    {
      title: "Average Seat Occupancy",
      value: `${avgOccupancy}%`,
      desc: "Meeting room & hotdesk space usage",
      icon: <Percent className="size-5 text-brand-300" />,
    },
    {
      title: "Pending Tickets (SLA)",
      value: activeTickets.toString(),
      desc: "Open maintenance/IT tickets",
      icon: (
        <AlertCircle
          className={`size-5 ${activeTickets > 0 ? "text-danger animate-pulse" : "text-neutral"}`}
        />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="border-brand-600 bg-brand-700">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral">
                {kpi.title}
              </span>
              <div className="font-heading text-2xl font-bold tracking-tight text-white">
                {kpi.value}
              </div>
              <span className="block text-[10px] text-neutral">{kpi.desc}</span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-800 border border-brand-600/50 shadow-inner">
              {kpi.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
