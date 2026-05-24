import React from "react";
import { prisma } from "@/lib/prisma";
import KPIRow from "@/components/dashboard/KPIRow";
import BranchCard, { type BranchData } from "@/components/dashboard/BranchCard";
import ForecastPanel from "@/components/dashboard/ForecastPanel";
import { forecastDemand } from "@/lib/forecast";

// Dynamic routing config for Next.js server components
export const revalidate = 0;

export default async function DashboardPage() {
  // 1. Fetch KPI metrics
  const totalMembers = await prisma.client.count();
  
  const activeContracts = await prisma.contract.findMany({
    where: { status: "ACTIVE" },
    select: { monthlyRate: true },
  });
  const totalRevenue = activeContracts.reduce((sum, c) => sum + c.monthlyRate, 0);

  const activeTickets = await prisma.ticket.count({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
  });

  // 2. Fetch Branches and calculate metrics per branch
  const dbBranches = await prisma.branch.findMany({
    include: {
      clients: true,
      tickets: {
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      },
    },
  });

  const branchesData: BranchData[] = await Promise.all(
    dbBranches.map(async (branch) => {
      // Calculate occupancy rate (active contracts / total spaces)
      const totalSpaces = await prisma.space.count({
        where: { floor: { branchId: branch.id } },
      });
      const occupiedSpaces = await prisma.contract.count({
        where: {
          status: "ACTIVE",
          client: { branchId: branch.id },
        },
      });
      const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;

      // Calculate community score (average of client health scores in this branch)
      const avgCommunityScore = branch.clients.length > 0
        ? Math.round(
            branch.clients.reduce((sum, c) => sum + c.healthScore, 0) /
              branch.clients.length
          )
        : 75;

      // Calculate MRR per branch
      const branchContracts = await prisma.contract.findMany({
        where: {
          status: "ACTIVE",
          client: { branchId: branch.id },
        },
        select: { monthlyRate: true },
      });
      const branchMrr = branchContracts.reduce((sum, c) => sum + c.monthlyRate, 0);

      // Dummy Carbon Score (sustainability offset based on occupancy efficiency)
      const carbonOffsetPercentage = Math.round((occupancyRate * 0.3) + 10);

      return {
        id: branch.id,
        name: branch.name,
        city: branch.city,
        address: branch.address,
        occupancyRate: occupancyRate || 40, // fallback for demo if empty
        communityScore: avgCommunityScore,
        mrr: branchMrr || 15000, // fallback for demo if empty
        openTickets: branch.tickets.length,
        carbonScore: carbonOffsetPercentage,
      };
    })
  );

  // Calculate average overall occupancy
  const avgOccupancy =
    branchesData.length > 0
      ? Math.round(
          branchesData.reduce((sum, b) => sum + b.occupancyRate, 0) /
            branchesData.length
        )
      : 0;

  // 3. Fetch historical bookings for AI forecasting
  const bookings = await prisma.booking.findMany({
    select: {
      startTime: true,
      status: true,
    },
  });

  const forecast = forecastDemand(bookings);

  return (
    <div className="space-y-6">
      {/* Header text */}
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-bold tracking-tight text-white">
          Multi-Location Control Center
        </h2>
        <p className="text-xs text-neutral">
          Real-time occupancy status, financial health, and AI operations forecast across all active branches.
        </p>
      </div>

      {/* KPI metric row */}
      <KPIRow
        totalMembers={totalMembers}
        totalRevenue={totalRevenue}
        avgOccupancy={avgOccupancy}
        activeTickets={activeTickets}
      />

      {/* Main Grid: Branch Cards & AI Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Branch Cards list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-slate-200">
              Active Branches ({branchesData.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {branchesData.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        </div>

        {/* AI Forecast panel */}
        <div className="lg:col-span-1">
          <ForecastPanel forecast={forecast} />
        </div>
      </div>
    </div>
  );
}
