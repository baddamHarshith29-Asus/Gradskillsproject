"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BranchRecommendationData {
  id: string;
  name: string;
  city: string;
  occupancyRate: number;
  communityScore: number;
  mrr: number;
  openTickets: number;
  carbonScore: number;
}

interface SpaceRecommendationProps {
  branches: BranchRecommendationData[];
}

export default function SpaceRecommendation({ branches }: SpaceRecommendationProps) {
  // Select top occupied branch
  const busyBranch = [...branches].sort((a, b) => b.occupancyRate - a.occupancyRate)[0];
  // Select lowest occupied branch
  const quietBranch = [...branches].sort((a, b) => a.occupancyRate - b.occupancyRate)[0];
  // Select lowest community health score
  const lowHealthBranch = [...branches].sort((a, b) => a.communityScore - b.communityScore)[0];

  return (
    <Card className="border-brand-600 bg-brand-700 mt-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-300 via-brand-400 to-blue-400 animate-pulse" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-400/20 text-brand-400 border border-brand-400/30">
            <Sparkles className="size-4 animate-bounce" />
          </div>
          <div>
            <CardTitle className="font-heading text-sm font-bold text-white">
              AI Space Optimizer Recommendations
            </CardTitle>
            <CardDescription className="text-[11px] text-neutral">
              Simulated optimization vectors based on live occupancy & ESG metrics
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2.5 space-y-3.5">
        
        {/* Recommendation Item 1 */}
        {busyBranch && busyBranch.occupancyRate > 70 && (
          <div className="p-3 bg-brand-800/40 border border-brand-600/50 rounded-xl space-y-2 hover:border-brand-500/30 transition-all">
            <div className="flex items-center justify-between">
              <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[9px] hover:bg-yellow-500/15">
                ⚡ HIGH OCCUPANCY
              </Badge>
              <span className="text-[9px] text-neutral font-mono">{busyBranch.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Branch occupancy has breached <strong className="text-slate-100">{busyBranch.occupancyRate}%</strong> threshold. Automatic peak-period checkout surcharge (+15%) has been engaged.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-brand-300 border-t border-brand-600/30 pt-2 font-medium">
              <span>Action: Redirect member checkins to {quietBranch?.name || "other hubs"}</span>
              <ArrowRight className="size-3" />
            </div>
          </div>
        )}

        {/* Recommendation Item 2 */}
        {quietBranch && quietBranch.occupancyRate < 50 && (
          <div className="p-3 bg-brand-800/40 border border-brand-600/50 rounded-xl space-y-2 hover:border-brand-500/30 transition-all">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] hover:bg-emerald-500/15">
                ✨ LOW DEMAND DISCOUNT
              </Badge>
              <span className="text-[9px] text-neutral font-mono">{quietBranch.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Current seat bookings at <strong className="text-slate-100">{quietBranch.occupancyRate}%</strong> capacity. Marketing campaign generated a dynamic off-peak seat rate voucher.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-brand-300 border-t border-brand-600/30 pt-2 font-medium">
              <span>Action: Deploy off-peak booking passes (-15%)</span>
              <ArrowRight className="size-3" />
            </div>
          </div>
        )}

        {/* Recommendation Item 3 */}
        {lowHealthBranch && (
          <div className="p-3 bg-brand-800/40 border border-brand-600/50 rounded-xl space-y-2 hover:border-brand-500/30 transition-all">
            <div className="flex items-center justify-between">
              <Badge className="bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] hover:bg-red-500/15">
                🚨 HEALTH VECTOR ALERT
              </Badge>
              <span className="text-[9px] text-neutral font-mono">{lowHealthBranch.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Branch community health score has dipped to <strong className="text-slate-100">{lowHealthBranch.communityScore}%</strong>. Open hardware support tickets list: <strong className="text-slate-100">{lowHealthBranch.openTickets}</strong> active.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-brand-300 border-t border-brand-600/30 pt-2 font-medium">
              <span>Action: Escalate branch hardware issues to Hub manager</span>
              <ArrowRight className="size-3" />
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
