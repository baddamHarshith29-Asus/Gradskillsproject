import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { spaceId, clientId, branchId, startTime, endTime, totalAmount } = body;

    if (!spaceId || !branchId || !startTime || !endTime || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details." },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Conflict detection (double booking guard)
    const conflicts = await prisma.booking.findMany({
      where: {
        spaceId,
        status: "CONFIRMED",
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Double-booking conflict! The space has already been reserved for this time slot.",
        },
        { status: 409 }
      );
    }

    // 2. Create the booking
    const booking = await prisma.booking.create({
      data: {
        spaceId,
        clientId: clientId || null,
        branchId,
        startTime: start,
        endTime: end,
        totalAmount: Number(totalAmount),
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const spaceId = searchParams.get("spaceId");

    const whereClause: any = {};
    if (branchId && branchId !== "all") whereClause.branchId = branchId;
    if (spaceId) whereClause.spaceId = spaceId;

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        space: true,
        client: true,
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load bookings." },
      { status: 500 }
    );
  }
}
