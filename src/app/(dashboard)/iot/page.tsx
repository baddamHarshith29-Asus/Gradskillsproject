"use client";

import React, { useEffect, useState } from "react";
import { useBranchStore } from "@/lib/store";
import { getClientsAction, createTicketAction } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Thermometer,
  Droplets,
  Volume2,
  Wind,
  Zap,
  AlertTriangle,
  RefreshCw,
  Play,
  CheckCircle,
  Lightbulb,
  Fan,
  Wrench,
  HelpCircle,
} from "lucide-react";

interface RoomTelemetry {
  id: string;
  name: string;
  temp: number;
  humidity: number;
  noise: number;
  aqi: number;
  power: number;
}

interface Anomaly {
  id: string;
  room: string;
  title: string;
  desc: string;
  severity: "WARNING" | "CRITICAL";
  metric: string;
}

const ROOMS_MOCK: Record<string, RoomTelemetry[]> = {
  bangalore: [
    { id: "b1", name: "Suite 101 (Executive Suite)", temp: 21.8, humidity: 45, noise: 38, aqi: 42, power: 1.2 },
    { id: "b2", name: "Suite 102 (Creative Studio)", temp: 23.4, humidity: 48, noise: 52, aqi: 68, power: 2.1 },
    { id: "b3", name: "Hotdesk Row A", temp: 22.0, humidity: 42, noise: 45, aqi: 35, power: 0.8 },
    { id: "b4", name: "Conference Room 301", temp: 20.5, humidity: 50, noise: 30, aqi: 40, power: 3.4 },
    { id: "b5", name: "Silent Pod 105", temp: 22.2, humidity: 40, noise: 18, aqi: 28, power: 0.4 },
  ],
  mumbai: [
    { id: "m1", name: "Suite 201 (Fintech Hub)", temp: 22.5, humidity: 55, noise: 44, aqi: 75, power: 2.4 },
    { id: "m2", name: "Meeting Suite A", temp: 21.0, humidity: 52, noise: 35, aqi: 62, power: 1.8 },
    { id: "m3", name: "Hotdesk Row C", temp: 23.0, humidity: 58, noise: 48, aqi: 88, power: 1.5 },
    { id: "m4", name: "Collaboration Zone", temp: 24.2, humidity: 60, noise: 58, aqi: 94, power: 3.1 },
  ],
  goa: [
    { id: "g1", name: "Ocean View Cabin 1", temp: 24.0, humidity: 65, noise: 40, aqi: 18, power: 1.6 },
    { id: "g2", name: "Sunset Terrace Deck", temp: 26.5, humidity: 70, noise: 45, aqi: 15, power: 0.9 },
    { id: "g3", name: "Beachside Pod A", temp: 23.2, humidity: 68, noise: 38, aqi: 22, power: 0.5 },
  ],
};

const ANOMALIES_MOCK: Record<string, Anomaly[]> = {
  bangalore: [
    { id: "ab1", room: "Suite 102 (Creative Studio)", title: "Air Quality Threshold Warning", desc: "AQI spiked past 65 due to printer ventilation blockage.", severity: "WARNING", metric: "AQI: 68" },
    { id: "ab2", room: "Conference Room 301", title: "HVAC Return Grille Failure", desc: "Suction power dropped 35%. Dynamic filter blockage suspected.", severity: "CRITICAL", metric: "Fan: 12% flow" }
  ],
  mumbai: [
    { id: "am1", room: "Collaboration Zone", title: "Ambient Noise Threshold Breach", desc: "Sustained dB level exceeds 55dB during quiet office hours.", severity: "WARNING", metric: "Noise: 58 dB" },
    { id: "am2", room: "Hotdesk Row C", title: "Smart Meter Overcurrent Leak", desc: "Abnormal sub-meter draw detected in row sector 3 outlets.", severity: "CRITICAL", metric: "Current: 16.4A" }
  ],
  goa: [
    { id: "ag1", room: "Ocean View Cabin 1", title: "Humidity High (Dehumidifier Offline)", desc: "Moisture levels exceeded 65% limit risking equipment weathering.", severity: "WARNING", metric: "Humidity: 65%" }
  ]
};

export default function IoTHubPage() {
  const { selectedBranchId, selectedBranchName } = useBranchStore();
  
  // Normalize branch key for mock lookup
  const branchKey = selectedBranchName.toLowerCase().includes("bangalore") 
    ? "bangalore" 
    : selectedBranchName.toLowerCase().includes("mumbai") 
      ? "mumbai" 
      : selectedBranchName.toLowerCase().includes("goa") 
        ? "goa" 
        : "bangalore";

  const activeRooms = ROOMS_MOCK[branchKey] || ROOMS_MOCK.bangalore;
  const [selectedRoom, setSelectedRoom] = useState<RoomTelemetry>(activeRooms[0]);
  const [liveRooms, setLiveRooms] = useState<RoomTelemetry[]>(activeRooms);
  
  // Ambient controls state
  const [targetTemp, setTargetTemp] = useState<number>(22);
  const [lightColor, setLightColor] = useState<string>("#38bdf8"); // Sky blue preset
  const [lightDim, setLightDim] = useState<number>(75);
  const [fanMode, setFanMode] = useState<"ECO" | "AUTO" | "TURBO">("AUTO");
  
  // Simulated telemetry oscillation
  useEffect(() => {
    // Sync with branch change
    setLiveRooms(activeRooms);
    setSelectedRoom(activeRooms[0]);
    setTargetTemp(Math.round(activeRooms[0].temp));
  }, [branchKey, selectedBranchId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRooms((prev) => 
        prev.map((r) => {
          const deltaTemp = (Math.random() - 0.5) * 0.2;
          const deltaNoise = Math.floor((Math.random() - 0.5) * 4);
          const deltaAqi = Math.floor((Math.random() - 0.5) * 2);
          
          return {
            ...r,
            temp: parseFloat((r.temp + deltaTemp).toFixed(1)),
            noise: Math.max(15, Math.min(90, r.noise + deltaNoise)),
            aqi: Math.max(5, Math.min(150, r.aqi + deltaAqi)),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Sync selected room fields with live updates
  useEffect(() => {
    const updated = liveRooms.find((r) => r.id === selectedRoom.id);
    if (updated) {
      setSelectedRoom(updated);
    }
  }, [liveRooms]);

  // Anomalies list state
  const [anomalies, setAnomalies] = useState<Anomaly[]>(ANOMALIES_MOCK[branchKey] || []);
  useEffect(() => {
    setAnomalies(ANOMALIES_MOCK[branchKey] || []);
  }, [branchKey]);

  // DB integration state
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [filingTicketId, setFilingTicketId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const list = await getClientsAction();
        setClients(list);
        if (list.length > 0) {
          setSelectedClientId(list[0].id);
        }
      } catch (err) {
        console.error("Error loading clients for IoT tickets:", err);
      }
    }
    fetchClients();
  }, []);

  const handleFileTicket = async (anomaly: Anomaly) => {
    setFilingTicketId(anomaly.id);
    setSuccessMessage(null);

    // Map selected branch store ID properly (fallback to a dummy ID if 'all' is selected)
    const dbBranchId = selectedBranchId === "all" ? "branch_bangalore" : selectedBranchId;

    const data = {
      title: `[IoT Telemetry Alarm] ${anomaly.title} - ${anomaly.room}`,
      description: `AUTOMATED FACILITY PROTOCOL: IoT Sensory module triggered a high-severity alert for ${anomaly.room}.\n\nAnomaly Detail: ${anomaly.desc}\nSensor Metric: ${anomaly.metric}\nReported Branch Location: ${selectedBranchName}\nRecommended Action: Urgent site inspection and diagnostic check.`,
      priority: anomaly.severity === "CRITICAL" ? "HIGH" : "MEDIUM",
      category: "Hardware",
      branchId: dbBranchId,
      clientId: selectedClientId || undefined,
    };

    try {
      const res = await createTicketAction(data);
      if (res.success && res.ticket) {
        setSuccessMessage(`Maintenance ticket #${res.ticket.id} generated and dispatched!`);
        // Remove anomaly from local list upon success
        setAnomalies((prev) => prev.filter((a) => a.id !== anomaly.id));
      }
    } catch (err) {
      console.error("Failed to log maintenance ticket:", err);
    } finally {
      setFilingTicketId(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  if (selectedBranchId === "all") {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">
            IoT Edge Automation Gateway
          </span>
          <h1 className="font-heading text-2xl font-black text-white tracking-tight">
            Smart Hub IoT Control Panel
          </h1>
        </div>

        <Card className="border-brand-600 bg-brand-700/60 p-8 text-center max-w-md mx-auto mt-12 border-dashed">
          <Cpu className="size-12 text-brand-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-200">Connect a Workspace Branch</h3>
          <p className="text-[11px] text-neutral mt-2 leading-relaxed">
            Please pick a specific coworking location from the sidebar selection menu to view telemetry nodes, climate dials, lighting grids, and facility alert tickers.
          </p>
        </Card>
      </div>
    );
  }

  // Get fan speed classes based on selected mode
  const getFanSpeedClass = () => {
    if (fanMode === "ECO") return "animate-[spin_4s_linear_infinite]";
    if (fanMode === "TURBO") return "animate-[spin_0.8s_linear_infinite] text-brand-400";
    return "animate-[spin_2s_linear_infinite]";
  };

  return (
    <div className="space-y-6 font-sans text-slate-200">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-600/40 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-brand-400/20 text-brand-300 font-bold px-2 py-0.5 rounded border border-brand-400/30 uppercase tracking-widest font-mono">
              ⚡ LIVE TELEMETRY
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="font-heading text-2xl font-black text-white tracking-tight">
            Smart Hub IoT Control Panel
          </h1>
          <p className="text-[11px] text-neutral">
            Sensory monitoring & hardware control loop for <strong className="text-slate-300">{selectedBranchName}</strong>
          </p>
        </div>

        {/* Client association option */}
        <div className="flex items-center gap-3 bg-brand-900/30 border border-brand-600/50 p-3 rounded-xl shrink-0">
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-wider text-neutral">
              Link Maintenance tickets to:
            </span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="mt-1 bg-brand-850 rounded border border-brand-600 px-2 py-1 text-[11px] font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>
          <span title="Tickets filed will be attributed to this tenant account.">
            <HelpCircle className="size-4 text-brand-500 hover:text-brand-400 transition-colors cursor-help" />
          </span>
        </div>
      </div>

      {/* Success notification banner */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-400 animate-fade-in">
          <CheckCircle className="size-5 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Side: Room Roster Select */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-brand-600 bg-brand-700/80 shadow-lg">
            <CardHeader className="pb-3 border-b border-brand-600/30">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral flex items-center gap-2">
                <Cpu className="size-4 text-brand-400" />
                IoT Nodes Inventory
              </CardTitle>
              <CardDescription className="text-[10px]">
                Click a room to display smart telemetry dashboards and adjust atmosphere variables.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2">
              {liveRooms.map((room) => {
                const isActive = room.id === selectedRoom.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full flex items-center justify-between rounded-lg p-3 text-left transition-all border ${
                      isActive
                        ? "bg-brand-400 border-brand-300 text-white font-bold shadow-md scale-[1.01]"
                        : "bg-brand-900/20 hover:bg-brand-900/40 border-brand-600/40 hover:border-brand-500/30 text-slate-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] block truncate">{room.name}</span>
                      <div className="flex items-center gap-3 mt-1.5 text-[9px] text-neutral">
                        <span className="flex items-center gap-0.5">
                          <Thermometer className="size-3" />
                          {room.temp}°C
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Droplets className="size-3" />
                          {room.humidity}%
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Volume2 className="size-3" />
                          {room.noise}dB
                        </span>
                      </div>
                    </div>
                    
                    <Badge className={`text-[8px] font-extrabold uppercase ml-2 ${
                      room.aqi > 80 
                        ? "bg-amber-500/25 text-amber-300 border border-amber-500/20" 
                        : "bg-brand-900/60 border border-brand-600 text-neutral"
                    }`}>
                      AQI {room.aqi}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Anomalies and Alerts Panel */}
          <Card className="border-brand-600 bg-brand-700/80 shadow-lg">
            <CardHeader className="pb-3 border-b border-brand-600/30 bg-danger/5">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-2">
                <AlertTriangle className="size-4 animate-bounce" />
                Active Sensory Anomalies
              </CardTitle>
              <CardDescription className="text-[10px]">
                Facility sub-processors monitoring alerts needing attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3.5">
              {anomalies.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-neutral italic">
                  ✓ All sensors reporting healthy values
                </div>
              ) : (
                anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className={`border rounded-xl p-3 space-y-2 bg-brand-900/40 ${
                      anom.severity === "CRITICAL" ? "border-red-500/30" : "border-amber-500/30"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-mono font-bold text-neutral block">
                          {anom.room}
                        </span>
                        <h4 className="text-[11px] font-bold text-slate-100 mt-0.5">
                          {anom.title}
                        </h4>
                      </div>
                      <Badge className={`text-[8px] font-black ${
                        anom.severity === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}>
                        {anom.severity}
                      </Badge>
                    </div>

                    <p className="text-[10px] text-neutral leading-relaxed">
                      {anom.desc}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[9px] border-t border-brand-600/20">
                      <span className="font-mono text-brand-300 font-semibold bg-brand-400/10 px-1.5 py-0.5 rounded">
                        Telemetry: {anom.metric}
                      </span>
                      <Button
                        size="sm"
                        disabled={filingTicketId === anom.id}
                        onClick={() => handleFileTicket(anom)}
                        className="h-6 px-2.5 text-[9px] font-bold bg-brand-600 border border-brand-500 hover:bg-brand-500 text-white rounded-md flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Wrench className="size-3" />
                        {filingTicketId === anom.id ? "Filing..." : "File Ticket"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Telemetry Control Loop Grid */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Active Sensor Live Telemetry Dials */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Temp Dial */}
            <Card className="border-brand-600 bg-brand-700/80 shadow-md flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-3 text-neutral opacity-20">
                <Thermometer className="size-8" />
              </div>
              <CardContent className="p-4 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-neutral">Temperature</span>
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                  {selectedRoom.temp}°C
                </div>
                <div className="flex items-center gap-1 text-[8px] text-brand-300 font-bold uppercase tracking-wider bg-brand-400/10 px-1.5 py-0.5 rounded border border-brand-400/20 w-fit">
                  <Zap className="size-2.5 animate-pulse" />
                  Live Sensor
                </div>
              </CardContent>
            </Card>

            {/* Humidity Dial */}
            <Card className="border-brand-600 bg-brand-700/80 shadow-md flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 text-neutral opacity-20">
                <Droplets className="size-8" />
              </div>
              <CardContent className="p-4 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-neutral">Humidity</span>
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                  {selectedRoom.humidity}%
                </div>
                <div className="text-[9px] text-slate-400 font-medium">
                  {selectedRoom.humidity > 60 ? "Humid Atmosphere" : selectedRoom.humidity < 40 ? "Dry Climate" : "Optimal Comfort"}
                </div>
              </CardContent>
            </Card>

            {/* Noise Dial */}
            <Card className="border-brand-600 bg-brand-700/80 shadow-md flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 text-neutral opacity-20">
                <Volume2 className="size-8" />
              </div>
              <CardContent className="p-4 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-neutral">Ambient Noise</span>
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                  {selectedRoom.noise} <span className="text-xs text-neutral">dB</span>
                </div>
                <div className="text-[9px] font-semibold flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedRoom.noise > 50 ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                  <span className="text-slate-400">{selectedRoom.noise > 50 ? "Loud Activity" : selectedRoom.noise < 25 ? "Focus Quiet" : "Standard Zone"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Air Quality (AQI) Dial */}
            <Card className="border-brand-600 bg-brand-700/80 shadow-md flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 text-neutral opacity-20">
                <Wind className="size-8" />
              </div>
              <CardContent className="p-4 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-neutral">Air Quality (AQI)</span>
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                  {selectedRoom.aqi}
                </div>
                <Badge className={`text-[8px] font-bold uppercase w-fit tracking-wide h-4.5 px-1.5 ${
                  selectedRoom.aqi < 50 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : selectedRoom.aqi < 100 
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}>
                  {selectedRoom.aqi < 50 ? "Excellent" : selectedRoom.aqi < 100 ? "Moderate" : "Poor Filter"}
                </Badge>
              </CardContent>
            </Card>

          </div>

          {/* Interactive Atmospheric Controller Card */}
          <Card className="border-brand-600 bg-brand-700/80 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-400" />
            <CardHeader className="pb-3 border-b border-brand-600/30 pl-6">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <RefreshCw className="size-4 text-brand-400 animate-spin-once" />
                Climate & Atmosphere Controller
              </CardTitle>
              <CardDescription className="text-[10px]">
                Issue real-time hardware adjustments for <strong className="text-slate-100">{selectedRoom.name}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8 pl-6">
              
              {/* Thermostat adjustment */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Smart Thermostat</span>
                    <span className="text-[10px] text-neutral">Desired indoor threshold temperature</span>
                  </div>
                  <div className="flex items-center gap-2 bg-brand-900/60 border border-brand-600 px-3 py-1 rounded-lg">
                    <span className="text-[10px] text-neutral uppercase font-bold">Set:</span>
                    <span className="text-xs font-black text-brand-400 font-mono">{targetTemp}°C</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-neutral font-mono font-bold">16°C</span>
                  <input
                    type="range"
                    min="16"
                    max="28"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-brand-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral font-mono font-bold">28°C</span>
                </div>
                
                {/* Visual feedback warning depending on set value */}
                <div className={`p-2.5 rounded-lg text-[10px] leading-relaxed border transition-colors ${
                  targetTemp >= 25 
                    ? "bg-amber-950/20 border-amber-500/25 text-amber-400" 
                    : targetTemp <= 19 
                      ? "bg-blue-950/20 border-blue-500/25 text-blue-400" 
                      : "bg-brand-900/20 border-brand-600/35 text-slate-300"
                }`}>
                  {targetTemp >= 25 
                    ? "🔥 Heat loop system engaged. Climate modules heating active area." 
                    : targetTemp <= 19 
                      ? "❄️ High power refrigeration enabled. AC compressor spin throttled up." 
                      : "🍃 Neutral climate comfort engaged. Low carbon baseline draw active."}
                </div>
              </div>

              {/* Grid: Lighting Control & Fan Module */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Smart RGB Dimmer */}
                <div className="space-y-4 border-t md:border-t-0 md:border-r border-brand-600/30 pt-6 md:pt-0 md:pr-6">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
                      <Lightbulb className="size-4 text-brand-300 animate-pulse" />
                      Smart RGB Dimmer
                    </span>
                    <span className="text-[10px] text-neutral">Configure smart LED ballast intensity & shade</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-neutral font-semibold">Ballast Power:</span>
                      <span className="font-bold font-mono text-slate-100">{lightDim}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={lightDim}
                      onChange={(e) => setLightDim(parseInt(e.target.value))}
                      className="w-full h-1 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-brand-300"
                    />

                    {/* Color selection strip */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[9px] uppercase font-bold text-neutral block">Atmospheric Hue:</span>
                      <div className="flex gap-2.5">
                        {[
                          { hex: "#38bdf8", name: "Sky Focus" },
                          { hex: "#a78bfa", name: "Cyber Purple" },
                          { hex: "#34d399", name: "Eco Green" },
                          { hex: "#fb923c", name: "Warm Sunset" },
                          { hex: "#f43f5e", name: "Activity Red" },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => setLightColor(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className={`size-6.5 rounded-full border-2 transition-transform cursor-pointer ${
                              lightColor === c.hex ? "border-white scale-110 shadow-lg" : "border-brand-850 hover:scale-105"
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Simulated Room Lighting Graphic preview block */}
                    <div className="relative rounded-xl border border-brand-600/40 h-20 bg-brand-950 overflow-hidden flex items-center justify-center">
                      {/* Glow Overlay */}
                      <div
                        className="absolute inset-0 transition-all duration-700 blur-[20px] opacity-25"
                        style={{ backgroundColor: lightColor, opacity: lightDim / 240 }}
                      />
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <span className="text-[9px] text-neutral uppercase font-bold font-mono">Room Preview Glow</span>
                        <div
                          className="w-16 h-2 rounded-full mt-1.5 transition-all duration-500 shadow-md"
                          style={{
                            backgroundColor: lightColor,
                            boxShadow: `0 0 16px 4px ${lightColor}`,
                            opacity: lightDim / 100
                          }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Intelligent HVAC Fan speed */}
                <div className="space-y-4 pt-6 md:pt-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
                        <Fan className={`size-4 text-neutral ${getFanSpeedClass()}`} />
                        AC Intake Fan Speed
                      </span>
                      <span className="text-[10px] text-neutral">Toggle active displacement airflow level</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { mode: "ECO" as const, desc: "Ultra-quiet, minimum energy consumption baseline", flow: "32% dynamic flow" },
                      { mode: "AUTO" as const, desc: "Continuously adjusts speed to match set thermostat temperature", flow: "Variable flow" },
                      { mode: "TURBO" as const, desc: "High velocity displacement circulation loop", flow: "98% maximum displacement flow" },
                    ].map((f) => (
                      <button
                        key={f.mode}
                        onClick={() => setFanMode(f.mode)}
                        className={`w-full text-left rounded-xl p-3 border transition-all cursor-pointer ${
                          fanMode === f.mode
                            ? "bg-brand-900 border-brand-400 text-white font-bold"
                            : "bg-brand-900/10 border-brand-600/40 hover:border-brand-500/20 text-slate-400"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-200">{f.mode} Speed</span>
                          <span className="text-[8px] bg-brand-400/25 text-brand-300 font-mono px-1.5 py-0.5 rounded border border-brand-400/20">
                            {f.flow}
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral font-medium mt-1 leading-tight">
                          {f.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                </div>

              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
