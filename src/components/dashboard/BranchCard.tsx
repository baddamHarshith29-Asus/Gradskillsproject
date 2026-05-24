"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Leaf, MapPin, MessageSquare, ShieldAlert } from "lucide-react";
import Link from "next/link";

export interface BranchData {
  id: string;
  name: string;
  city: string;
  address: string;
  occupancyRate: number;
  communityScore: number;
  mrr: number;
  openTickets: number;
  carbonScore: number; // e.g., 23 (represents 23% more efficient)
}

interface BranchCardProps {
  branch: BranchData;
}

export default function BranchCard({ branch }: BranchCardProps) {
  // Determine community score ring color
  const getScoreColor = (score: number) => {
    if (score > 70) return "text-success border-success/30";
    if (score > 40) return "text-warning border-warning/30";
    return "text-danger border-danger/30";
  };

  return (
    <Card className="border-brand-600 bg-brand-700 hover:border-brand-400 transition-all duration-300 flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-brand-600/50">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-400/5 px-2 py-0.5 rounded border border-brand-400/10">
              {branch.city}
            </span>
            <CardTitle className="font-heading text-base font-bold text-white mt-1">
              {branch.name}
            </CardTitle>
          </div>
          
          {/* Circular Community Health Score Ring */}
          <div className="flex flex-col items-center">
            <div className={`flex size-11 items-center justify-center rounded-full border-2 font-heading text-sm font-bold bg-brand-800 ${getScoreColor(branch.communityScore)}`}>
              {branch.communityScore}
            </div>
            <span className="text-[8px] uppercase tracking-wider text-neutral font-semibold mt-1">
              Health
            </span>
          </div>
        </div>
        
        {/* Address */}
        <div className="flex items-center gap-1.5 text-xs text-neutral mt-2">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{branch.address}</span>
        </div>
      </CardHeader>

      <CardContent className="py-4 space-y-4 flex-1">
        {/* Occupancy and MRR Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-brand-800/40 border border-brand-600/40 p-3">
            <span className="block text-[9px] uppercase tracking-wider text-neutral font-semibold">
              Occupancy Rate
            </span>
            <span className="font-heading text-lg font-bold text-slate-200 block mt-1">
              {branch.occupancyRate}%
            </span>
            <div className="w-full bg-brand-600 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-brand-400 h-full rounded-full" 
                style={{ width: `${branch.occupancyRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="rounded-lg bg-brand-800/40 border border-brand-600/40 p-3">
            <span className="block text-[9px] uppercase tracking-wider text-neutral font-semibold">
              Branch MRR
            </span>
            <span className="font-heading text-lg font-bold text-slate-200 block mt-1">
              ₹{branch.mrr.toLocaleString()}
            </span>
            <span className="text-[8px] text-neutral mt-2 block">Monthly recurring lease</span>
          </div>
        </div>

        {/* Carbon Footprint & Tickets status */}
        <div className="space-y-2">
          {/* Carbon Score */}
          <div className="flex items-center justify-between text-xs rounded-lg bg-emerald-950/10 border border-emerald-500/20 p-2.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Leaf className="size-4" />
              <span className="font-semibold text-[11px]">Carbon Efficiency</span>
            </div>
            <span className="text-emerald-400 font-bold text-[11px]">
              +{branch.carbonScore}% vs Industry Avg
            </span>
          </div>

          {/* SLA Tickets */}
          <div className={`flex items-center justify-between text-xs rounded-lg p-2.5 border ${
            branch.openTickets > 0 
              ? "bg-red-950/10 border-danger/30 text-danger" 
              : "bg-brand-800/30 border-brand-600/40 text-neutral"
          }`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4" />
              <span className="font-semibold text-[11px]">Active Tickets</span>
            </div>
            <span className="font-bold text-[11px]">
              {branch.openTickets} Open
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 border-t border-brand-600/50 flex gap-2">
        <Link href={`/booking?branch=${branch.id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full text-[11px] h-8 cursor-pointer">
            Book Workspace
          </Button>
        </Link>
        <Link href={`/floor-builder?branch=${branch.id}`} className="flex-1">
          <Button size="sm" className="w-full text-[11px] h-8 bg-brand-400 hover:bg-brand-300 text-white cursor-pointer">
            Floor Manager
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
