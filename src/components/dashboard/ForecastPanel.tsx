"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, Sparkles, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ForecastData {
  date: string;
  predictedUtilization: number;
  confidence: string;
}

interface ForecastPanelProps {
  forecast: {
    date: Date;
    predictedUtilization: number;
    confidence: "high" | "medium" | "low";
  }[];
}

export default function ForecastPanel({ forecast }: ForecastPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="border-brand-600 bg-brand-700 h-[320px] animate-pulse">
        <CardContent className="h-full flex items-center justify-center text-neutral text-xs">
          Loading AI engine...
        </CardContent>
      </Card>
    );
  }

  // Format date for XAxis
  const chartData = forecast.map((f) => ({
    name: format(f.date, "EEE (d MMM)"),
    occupancy: f.predictedUtilization,
    confidence: f.confidence,
  }));

  // Find peak day
  const peakDay = [...chartData].sort((a, b) => b.occupancy - a.occupancy)[0];

  return (
    <Card className="border-brand-600 bg-brand-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Brain className="size-5 text-brand-400" />
              AI Occupancy Forecasting
            </CardTitle>
            <CardDescription className="text-xs text-neutral">
              7-day forward-looking workspace seat and meeting room utilization rates
            </CardDescription>
          </div>
          <Badge className="bg-brand-400/10 text-brand-400 border border-brand-400/20 gap-1.5 hover:bg-brand-400/10">
            <Sparkles className="size-3" />
            Predictive Model V1
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Metric summary */}
        {peakDay && (
          <div className="flex items-center gap-2 text-xs text-neutral mb-4 bg-brand-800/40 p-2.5 rounded-lg border border-brand-600/40">
            <TrendingUp className="size-4.5 text-brand-300" />
            <span>
              Peak utilization predicted on <strong className="text-slate-200">{peakDay.name}</strong> at <strong className="text-brand-300">{peakDay.occupancy}%</strong> capacity. Recommend dynamic peak pricing for meeting rooms.
            </span>
          </div>
        )}

        {/* Chart */}
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  borderColor: "#243447",
                  borderRadius: "0.5rem",
                  color: "#f8fafc",
                  fontSize: "11px",
                }}
                formatter={(value) => [`${value}%`, "Predicted Occupancy"]}
              />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOccupancy)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
