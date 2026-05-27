"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function FinanceSandbox() {
  const [occupancy, setOccupancy] = useState(70);
  const [surcharge, setSurcharge] = useState(12);
  const [branch, setBranch] = useState("Bangalore");

  const getBaseMrr = () => {
    switch (branch) {
      case "Mumbai":
        return 320000;
      case "Goa":
        return 150000;
      default: // Bangalore
        return 480000;
    }
  };

  const calculatedRevenue = Math.round(
    getBaseMrr() * (occupancy / 100) * (1 + surcharge / 100)
  );

  const calculatedTax = Math.round(calculatedRevenue * 0.18); // 18% GST

  return (
    <Card className="border-brand-600 bg-brand-800 shadow-xl overflow-hidden relative">
      {/* Decorative pulse border */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-300 to-blue-500 animate-pulse" />
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-brand-400/5 blur-xl pointer-events-none" />
      
      <CardHeader className="pb-3 border-b border-brand-600/40">
        <CardTitle className="font-heading text-xs font-bold text-white flex items-center gap-1.5">
          <TrendingUp className="size-4 text-brand-300 animate-bounce" />
          Revenue Sandbox Simulator
        </CardTitle>
        <CardDescription className="text-[10px] text-neutral leading-relaxed">
          Simulate workspace MRR outcomes based on dynamic surcharge adjustments and target capacity.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Branch selector */}
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-bold text-neutral">Target Branch Hub</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full rounded border border-brand-600 bg-brand-700 px-2 py-1.5 text-xs text-slate-200 cursor-pointer focus:outline-none h-8.5 font-medium"
          >
            <option value="Bangalore">Downtown Innovation (Bangalore)</option>
            <option value="Mumbai">Tech Park West (Mumbai)</option>
            <option value="Goa">Waterfront Incubator (Goa)</option>
          </select>
        </div>

        {/* Occupancy rate slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] uppercase font-bold text-neutral">
            <span>Target Capacity</span>
            <span className="text-brand-300 font-mono text-[10px] font-bold">{occupancy}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={occupancy}
            onChange={(e) => setOccupancy(Number(e.target.value))}
            className="w-full h-1.5 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-brand-400"
          />
        </div>

        {/* Dynamic pricing multiplier slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] uppercase font-bold text-neutral">
            <span>Dynamic Surcharge</span>
            <span className="text-brand-300 font-mono text-[10px] font-bold">+{surcharge}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={surcharge}
            onChange={(e) => setSurcharge(Number(e.target.value))}
            className="w-full h-1.5 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-brand-400"
          />
        </div>

        {/* Outputs panel */}
        <div className="bg-brand-900/50 border border-brand-600/30 rounded-xl p-3.5 space-y-3.5">
          <div className="space-y-1">
            <span className="text-neutral text-[9px] uppercase font-bold block">Estimated MRR Forecast</span>
            <div className="text-lg font-black text-white flex items-center gap-1">
              <span className="text-brand-300">₹</span>
              <span>{calculatedRevenue.toLocaleString()}</span>
              <span className="text-[9px] text-neutral font-medium lowercase">/ month</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-brand-600/40 pt-2.5">
            <div className="space-y-0.5">
              <span className="text-neutral text-[8px] uppercase font-bold block">Tax Yield (18%)</span>
              <span className="text-[11px] font-bold text-slate-200">₹{calculatedTax.toLocaleString()}</span>
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-neutral text-[8px] uppercase font-bold block">Util. Status</span>
              <span className={`text-[10px] font-bold ${occupancy >= 80 ? "text-danger" : occupancy >= 50 ? "text-brand-300" : "text-success"}`}>
                {occupancy >= 80 ? "🔥 Surcharge Active" : occupancy >= 50 ? "🟢 Dynamic Sizing" : "✨ Calm Period"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
