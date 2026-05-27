"use client";

import React, { useEffect, useState } from "react";
import { useBranchStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Map,
  Users,
  Compass,
  Zap,
  Info,
  CheckCircle,
  Play,
  RotateCcw,
  Download,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface DeskSeat {
  id: number;
  label: string;
  type: "HOTDESK" | "SUITE" | "CONFERENCE" | "AMENITY";
  occupantName: string | null;
  occupantCompany: string | null;
  heat: number; // occupancy density representation (0 to 100)
  optimizedHeat: number; // value after running AI
  x: number;
  y: number;
}

const MOCK_SEATING_INITIAL: DeskSeat[] = [
  // Floor 1 Grid desks
  { id: 1, label: "Desk 101", type: "HOTDESK", occupantName: "Ananya Roy", occupantCompany: "Apex Tech", heat: 85, optimizedHeat: 90, x: 1, y: 1 },
  { id: 2, label: "Desk 102", type: "HOTDESK", occupantName: "Arjun Sen", occupantCompany: "Apex Tech", heat: 75, optimizedHeat: 90, x: 2, y: 1 },
  { id: 3, label: "Desk 103", type: "HOTDESK", occupantName: "Rohan Vyas", occupantCompany: "Acme Corp", heat: 35, optimizedHeat: 20, x: 3, y: 1 },
  { id: 4, label: "Desk 104", type: "HOTDESK", occupantName: null, occupantCompany: null, heat: 0, optimizedHeat: 20, x: 4, y: 1 },
  { id: 5, label: "Desk 105", type: "HOTDESK", occupantName: "Pooja Bose", occupantCompany: "Apex Tech", heat: 90, optimizedHeat: 90, x: 5, y: 1 },

  { id: 6, label: "Desk 106", type: "HOTDESK", occupantName: null, occupantCompany: null, heat: 0, optimizedHeat: 90, x: 1, y: 2 },
  { id: 7, label: "Desk 107", type: "HOTDESK", occupantName: "Simran Gill", occupantCompany: "Freelance", heat: 25, optimizedHeat: 15, x: 2, y: 2 },
  { id: 8, label: "Desk 108", type: "HOTDESK", occupantName: "Varun Shah", occupantCompany: "Acme Corp", heat: 55, optimizedHeat: 20, x: 3, y: 2 },
  { id: 9, label: "Desk 109", type: "HOTDESK", occupantName: null, occupantCompany: null, heat: 0, optimizedHeat: 15, x: 4, y: 2 },
  { id: 10, label: "Desk 110", type: "HOTDESK", occupantName: "Rhea Nair", occupantCompany: "Freelance", heat: 30, optimizedHeat: 15, x: 5, y: 2 },

  { id: 11, label: "Focus Pod A", type: "SUITE", occupantName: "Vikram Seth", occupantCompany: "Indie Labs", heat: 95, optimizedHeat: 95, x: 1, y: 3 },
  { id: 12, label: "Focus Pod B", type: "SUITE", occupantName: "Neha Dutt", occupantCompany: "Indie Labs", heat: 85, optimizedHeat: 95, x: 2, y: 3 },
  { id: 13, label: "Boardroom 1", type: "CONFERENCE", occupantName: "Meeting Session", occupantCompany: "Apex Tech", heat: 60, optimizedHeat: 50, x: 3, y: 3 },
  { id: 14, label: "Coffee Lounge", type: "AMENITY", occupantName: null, occupantCompany: null, heat: 40, optimizedHeat: 30, x: 4, y: 3 },
  { id: 15, label: "Phone Booth 1", type: "AMENITY", occupantName: "Amit Roy", occupantCompany: "Acme Corp", heat: 70, optimizedHeat: 40, x: 5, y: 3 },

  { id: 16, label: "Desk 111", type: "HOTDESK", occupantName: "Tarun Rao", occupantCompany: "Acme Corp", heat: 50, optimizedHeat: 80, x: 1, y: 4 },
  { id: 17, label: "Desk 112", type: "HOTDESK", occupantName: "Kiara Advani", occupantCompany: "Acme Corp", heat: 40, optimizedHeat: 80, x: 2, y: 4 },
  { id: 18, label: "Desk 113", type: "HOTDESK", occupantName: null, occupantCompany: null, heat: 0, optimizedHeat: 80, x: 3, y: 4 },
  { id: 19, label: "Desk 114", type: "HOTDESK", occupantName: "Siddharth Malhotra", occupantCompany: "Acme Corp", heat: 65, optimizedHeat: 80, x: 4, y: 4 },
  { id: 20, label: "Desk 115", type: "HOTDESK", occupantName: null, occupantCompany: null, heat: 0, optimizedHeat: 10, x: 5, y: 4 },
];

type OptimizationPolicy = "COLLABORATION" | "QUIET_FOCUS" | "ECO_ENERGY" | "BALANCED_LOAD";

export default function SpatialPlannerPage() {
  const { selectedBranchId, selectedBranchName } = useBranchStore();

  const [seatingList, setSeatingList] = useState<DeskSeat[]>(MOCK_SEATING_INITIAL);
  const [selectedSeat, setSelectedSeat] = useState<DeskSeat | null>(MOCK_SEATING_INITIAL[0]);
  const [policy, setPolicy] = useState<OptimizationPolicy>("COLLABORATION");
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimized, setOptimized] = useState<boolean>(false);
  const [optimizerConsole, setOptimizerConsole] = useState<string[]>([]);
  const [successExport, setSuccessExport] = useState<boolean>(false);

  // Sync state on branch change
  useEffect(() => {
    setSeatingList(MOCK_SEATING_INITIAL.map((s) => {
      // Add slight variety based on branch names
      const suffix = selectedBranchName.includes("Goa") ? 10 : selectedBranchName.includes("Mumbai") ? 20 : 0;
      return {
        ...s,
        heat: Math.max(0, Math.min(100, s.heat + (s.heat > 0 ? (suffix % 3 === 0 ? 5 : -10) : 0))),
      };
    }));
    setOptimized(false);
    setSelectedSeat(MOCK_SEATING_INITIAL[0]);
  }, [selectedBranchId, selectedBranchName]);

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    setOptimized(false);
    setOptimizerConsole([
      "Initializing Spatial Seating Optimizer...",
      "Analyzing active telemetry data and workspace registry...",
      `Loading Optimization Policy: [${policy.replace("_", " ")}]`,
      "Mapping physical desk nodes and thermal load grids...",
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setOptimizerConsole((prev) => [
          ...prev,
          "Computing proximity vectors for 'Apex Tech' and 'Acme Corp'...",
          "Identifying redundant environmental heating blocks in vacant zones..."
        ]);
      } else if (step === 2) {
        setOptimizerConsole((prev) => [
          ...prev,
          "Running seating rearrangement simulation (1,000 iterations)...",
          "Recalculating ambient acoustic thresholds in Focus corridor..."
        ]);
      } else if (step === 3) {
        setOptimizerConsole((prev) => [
          ...prev,
          "Generating energy load reductions for unoccupied lower sectors...",
          "Optimization plan converged successfully with zero violations!"
        ]);
      } else if (step === 4) {
        clearInterval(interval);
        setIsOptimizing(false);
        setOptimized(true);

        // Apply visual optimized heat shift
        setSeatingList((prev) =>
          prev.map((s) => {
            let heatFactor = s.optimizedHeat;
            // Shift names to represent team clustering if COLLABORATION is picked
            if (policy === "COLLABORATION") {
              if (s.occupantCompany === "Apex Tech") heatFactor = 95;
              if (s.occupantCompany === "Acme Corp") heatFactor = 85;
            } else if (policy === "ECO_ENERGY") {
              // Vacuum teams into higher grids to save lighting in lower ones
              if (s.y >= 3) heatFactor = Math.max(10, s.heat - 35);
              else heatFactor = Math.min(95, s.heat + 25);
            } else if (policy === "QUIET_FOCUS") {
              if (s.type === "HOTDESK") heatFactor = Math.max(10, Math.min(30, s.heat));
            } else if (policy === "BALANCED_LOAD") {
              heatFactor = 45; // even load
            }
            return {
              ...s,
              heat: heatFactor,
            };
          })
        );
      }
    }, 850);
  };

  const handleReset = () => {
    setSeatingList(MOCK_SEATING_INITIAL);
    setOptimized(false);
    setOptimizerConsole([]);
    setSelectedSeat(MOCK_SEATING_INITIAL[0]);
  };

  const handleExport = () => {
    setSuccessExport(true);
    setTimeout(() => setSuccessExport(false), 4000);
  };

  // Get color depending on heat index
  const getHeatColor = (heatVal: number) => {
    if (heatVal === 0) return "bg-brand-900/35 border-brand-700/50 hover:bg-brand-900/60";
    if (heatVal < 30) return "bg-emerald-500/25 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/35";
    if (heatVal < 60) return "bg-blue-500/25 border-blue-500/40 text-blue-300 hover:bg-blue-500/35";
    if (heatVal < 80) return "bg-amber-500/30 border-amber-500/50 text-amber-300 hover:bg-amber-500/40 animate-pulse-slow";
    return "bg-rose-500/30 border-rose-500/50 text-rose-300 hover:bg-rose-500/40 animate-pulse";
  };

  // Analytics Comparison Metrics based on optimization policy
  const getMetrics = () => {
    if (policy === "COLLABORATION") {
      return {
        collab: { before: 54, after: 92, label: "Team Proximity Clustered" },
        energy: { before: 68, after: 74, label: "Heating Zone Efficiency" },
        focus: { before: 62, after: 58, label: "Quiet Corridor Index" }
      };
    }
    if (policy === "ECO_ENERGY") {
      return {
        collab: { before: 54, after: 62, label: "Team Proximity Clustered" },
        energy: { before: 68, after: 96, label: "Heating Zone Efficiency" },
        focus: { before: 62, after: 78, label: "Quiet Corridor Index" }
      };
    }
    if (policy === "QUIET_FOCUS") {
      return {
        collab: { before: 54, after: 42, label: "Team Proximity Clustered" },
        energy: { before: 68, after: 72, label: "Heating Zone Efficiency" },
        focus: { before: 62, after: 94, label: "Quiet Corridor Index" }
      };
    }
    return {
      collab: { before: 54, after: 70, label: "Team Proximity Clustered" },
      energy: { before: 68, after: 78, label: "Heating Zone Efficiency" },
      focus: { before: 62, after: 82, label: "Quiet Corridor Index" }
    };
  };

  const metrics = getMetrics();

  if (selectedBranchId === "all") {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">
            AI Operational Layout Optimizer
          </span>
          <h1 className="font-heading text-2xl font-black text-white tracking-tight">
            Spatial AI Seating Heatmap Planner
          </h1>
        </div>

        <Card className="border-brand-600 bg-brand-700/60 p-8 text-center max-w-md mx-auto mt-12 border-dashed">
          <Sparkles className="size-12 text-brand-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-200">Connect a Workspace Branch</h3>
          <p className="text-[11px] text-neutral mt-2 leading-relaxed">
            Please select a specific co-working branch location from the sidebar selection menu to load real-time occupancy seating maps and fire spatial rearrangement algorithms.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-200">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-600/40 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-brand-400/20 text-brand-300 font-bold px-2.5 py-0.5 rounded border border-brand-400/30 uppercase tracking-widest font-mono">
              🧠 AI SPATIAL ENGINE
            </span>
          </div>
          <h1 className="font-heading text-2xl font-black text-white tracking-tight">
            Spatial AI Seating Heatmap Planner
          </h1>
          <p className="text-[11px] text-neutral">
            Intelligent capacity planning and density forecasting tool for <strong className="text-slate-300">{selectedBranchName}</strong>
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2">
          {optimized ? (
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-9 px-3 text-xs border-brand-600 hover:bg-brand-900/30 text-neutral hover:text-white rounded-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              Reset Seating Grid
            </Button>
          ) : (
            <Button
              onClick={handleRunOptimizer}
              disabled={isOptimizing}
              className="h-9 px-4.5 text-xs bg-brand-400 hover:bg-brand-300 text-white font-bold rounded-md shrink-0 flex items-center gap-1.5 shadow-md shadow-brand-500/10 cursor-pointer"
            >
              <Sparkles className="size-3.5 animate-spin-once" />
              {isOptimizing ? "Optimizing Grid..." : "Run AI Spatial Optimizer"}
            </Button>
          )}
          
          <Button
            onClick={handleExport}
            className="h-9 px-3 text-xs bg-brand-600 border border-brand-500 hover:bg-brand-500 text-white font-bold rounded-md shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="size-3.5" />
            Export AI Report
          </Button>
        </div>
      </div>

      {/* Alert / Notification boxes */}
      {successExport && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-400 animate-fade-in">
          <CheckCircle className="size-5 shrink-0" />
          <span className="font-semibold">Spatial reorganization blueprint successfully exported! Saved layout config: `seating_ai_opt_${policy.toLowerCase()}.pdf`.</span>
        </div>
      )}

      {/* Policy Selection Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            key: "COLLABORATION" as const,
            title: "Team Collaboration",
            desc: "Cluster client teams together to maximize communication flow.",
            icon: <Users className="size-4" />,
          },
          {
            key: "ECO_ENERGY" as const,
            title: "Eco-Energy Mode",
            desc: "Pool personnel to shut down and dim empty HVAC grid zones.",
            icon: <Zap className="size-4 text-brand-300" />,
          },
          {
            key: "QUIET_FOCUS" as const,
            title: "Focus Corridors",
            desc: "Isolate single desks to maintain acoustics and sound isolation.",
            icon: <Compass className="size-4" />,
          },
          {
            key: "BALANCED_LOAD" as const,
            title: "Balanced Load",
            desc: "Distribute workers evenly to buffer physical spacing indices.",
            icon: <Map className="size-4" />,
          },
        ].map((pol) => {
          const isSelected = policy === pol.key;
          return (
            <button
              key={pol.key}
              onClick={() => {
                if (!isOptimizing) {
                  setPolicy(pol.key);
                  setOptimized(false);
                }
              }}
              disabled={isOptimizing}
              className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-brand-800 border-brand-400 text-white font-bold shadow-md ring-1 ring-brand-400"
                  : "bg-brand-900/10 border-brand-600/40 hover:border-brand-500/20 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2 text-slate-200">
                {pol.icon}
                <span className="text-[11px] font-extrabold">{pol.title}</span>
              </div>
              <p className="text-[9px] text-neutral mt-1 leading-tight font-medium">
                {pol.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout block */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Spatial Grid & Console Panel */}
        <div className="space-y-6 lg:col-span-2">
          
          <Card className="border-brand-600 bg-brand-700/80 shadow-lg relative overflow-hidden">
            {/* Live Optimizer loader overlay */}
            {isOptimizing && (
              <div className="absolute inset-0 bg-brand-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4 p-6">
                <Sparkles className="size-10 text-brand-400 animate-spin" />
                <div className="text-center space-y-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
                    AI Spatial Convergence Active
                  </h3>
                  <p className="text-[10px] text-neutral max-w-xs leading-relaxed">
                    Computing optimal seat coordinates based on client matrices and telemetry density limits...
                  </p>
                </div>
                
                {/* Console logs feed */}
                <div className="w-full max-w-sm rounded-lg border border-brand-600 bg-brand-900/90 p-3 h-28 overflow-y-auto text-left font-mono text-[9px] text-brand-300 space-y-1">
                  {optimizerConsole.map((log, index) => (
                    <div key={index} className="flex gap-1.5">
                      <span className="text-neutral font-bold">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CardHeader className="pb-3 border-b border-brand-600/30">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral flex items-center gap-2">
                    <Map className="size-4 text-brand-400" />
                    Spatial Seating Heatmap
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Grid coordinates map showing workspace occupancy heat density.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-[9px] text-neutral">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded bg-brand-900/50 border border-brand-700" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded bg-emerald-500/30 border border-emerald-500/50" /> Warm
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded bg-rose-500/30 border border-rose-500/50" /> High Density
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* Responsive Seating grid mapping */}
              <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto bg-brand-900/10 border border-brand-600/30 rounded-2xl p-4">
                {seatingList.map((seat) => {
                  const isSelected = selectedSeat?.id === seat.id;
                  return (
                    <button
                      key={seat.id}
                      onClick={() => setSelectedSeat(seat)}
                      className={`h-16 rounded-xl border flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${getHeatColor(seat.heat)} ${
                        isSelected ? "ring-2 ring-white scale-102 font-extrabold border-white" : ""
                      }`}
                    >
                      <span className="text-[9px] font-bold block leading-none">{seat.label}</span>
                      <span className="text-[7px] text-neutral block font-medium truncate max-w-full mt-1.5">
                        {seat.occupantName ? seat.occupantName.split(" ")[0] : "Vacant"}
                      </span>
                      {seat.heat > 0 && (
                        <div className="w-8 h-1 rounded-full mt-1.5 overflow-hidden bg-brand-900/50 border border-brand-600/30">
                          <div className={`h-full ${
                            seat.heat < 40 ? "bg-emerald-400" : seat.heat < 80 ? "bg-amber-400" : "bg-rose-500"
                          }`} style={{ width: `${seat.heat}%` }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

            </CardContent>
          </Card>

          {/* Action Plan Blueprint summary */}
          {optimized && (
            <Card className="border-brand-600 bg-brand-700/80 shadow-lg border-l-4 border-l-emerald-500">
              <CardContent className="p-4 space-y-3.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle className="size-4.5" />
                  AI Optimization Reallocations Blueprint
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-neutral">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[9px]">
                      Recommended Reallocations:
                    </h5>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Consolidate 4 members of **Apex Tech** into Row A coordinates (Desks 101, 102, 105, 106).</li>
                      <li>Shift **Acme Corp** outliers (Varun Shah) to focus pod row D to clear acoustic space.</li>
                      <li>Dim climate ballast zones in vacated Focus corridor Desk sector 115.</li>
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[9px]">
                      Simulated Operational Benefits:
                    </h5>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>**Energy reduction**: Dimmed unoccupied desks saves 18.4% heating load.</li>
                      <li>**Collaboration spike**: Inter-team physical distance decreased by 4.2m.</li>
                      <li>**Noise Isolation**: Increased quiet acoustic threshold by 12dB.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right side panel: Seating Inspector & Metrics */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Desk Seat Inspector details */}
          <Card className="border-brand-600 bg-brand-700/80 shadow-lg">
            <CardHeader className="pb-3 border-b border-brand-600/30">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral flex items-center gap-2">
                <Info className="size-4" />
                Workspace Seat Inspector
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {selectedSeat ? (
                <div className="space-y-3.5 text-[11px]">
                  <div className="flex justify-between items-center border-b border-brand-600/30 pb-2">
                    <span className="font-bold text-white text-xs">{selectedSeat.label}</span>
                    <Badge className="bg-brand-900/60 border border-brand-600 text-brand-300 font-extrabold uppercase text-[8px]">
                      {selectedSeat.type}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral">Occupancy status:</span>
                      <span className={`font-semibold ${selectedSeat.occupantName ? "text-slate-100" : "text-emerald-400"}`}>
                        {selectedSeat.occupantName ? "Occupied Reserved" : "✓ Open Available"}
                      </span>
                    </div>

                    {selectedSeat.occupantName && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-neutral">Occupant Host:</span>
                          <span className="font-bold text-slate-100">{selectedSeat.occupantName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral">Client Account:</span>
                          <span className="font-semibold text-slate-200">{selectedSeat.occupantCompany}</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between">
                      <span className="text-neutral">Spatial Density:</span>
                      <span className="font-mono font-bold text-brand-400">{selectedSeat.heat}% occupancy</span>
                    </div>
                  </div>

                  {selectedSeat.occupantName && (
                    <div className="bg-brand-900/30 border border-brand-600/40 rounded-xl p-3 text-[10px] text-neutral leading-relaxed">
                      💡 Seat optimization recommends keeping this zone clustered with teammates from **{selectedSeat.occupantCompany}** to encourage inter-team productivity hooks.
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center text-neutral text-xs py-8 italic">
                  Select a desk on the seating grid to review metrics and occupant info.
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Metrics before vs after */}
          <Card className="border-brand-600 bg-brand-700/80 shadow-lg">
            <CardHeader className="pb-3 border-b border-brand-600/30">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral flex items-center gap-2">
                <Sparkles className="size-4 text-brand-400" />
                Operational Layout Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Metric 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold text-slate-200">{metrics.collab.label}</span>
                  <span className="font-bold font-mono">
                    {metrics.collab.before}% <span className="text-neutral">→</span> <span className="text-emerald-400">{optimized ? metrics.collab.after : metrics.collab.before}%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-brand-900 border border-brand-600/50 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-brand-600 opacity-30" style={{ width: `${metrics.collab.before}%` }} />
                  <div className="absolute top-0 left-0 h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${optimized ? metrics.collab.after : metrics.collab.before}%` }} />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold text-slate-200">{metrics.energy.label}</span>
                  <span className="font-bold font-mono">
                    {metrics.energy.before}% <span className="text-neutral">→</span> <span className="text-emerald-400">{optimized ? metrics.energy.after : metrics.energy.before}%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-brand-900 border border-brand-600/50 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-brand-600 opacity-30" style={{ width: `${metrics.energy.before}%` }} />
                  <div className="absolute top-0 left-0 h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${optimized ? metrics.energy.after : metrics.energy.before}%` }} />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold text-slate-200">{metrics.focus.label}</span>
                  <span className="font-bold font-mono">
                    {metrics.focus.before}% <span className="text-neutral">→</span> <span className="text-emerald-400">{optimized ? metrics.focus.after : metrics.focus.before}%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-brand-900 border border-brand-600/50 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-brand-600 opacity-30" style={{ width: `${metrics.focus.before}%` }} />
                  <div className="absolute top-0 left-0 h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${optimized ? metrics.focus.after : metrics.focus.before}%` }} />
                </div>
              </div>

              <div className="text-[9px] text-neutral leading-relaxed flex items-start gap-1.5 bg-brand-900/10 border border-brand-600/40 p-2.5 rounded-xl">
                <AlertCircle className="size-4 text-brand-500 shrink-0 mt-0.5" />
                <span>Optimization calculations automatically factor in local branch layout geometry constraints configured inside CoNexus Workspace Floor Builder.</span>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
