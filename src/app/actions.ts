"use server";

import { prisma } from "@/lib/prisma";

export async function getBranchesAction() {
  try {
    return await prisma.branch.findMany({
      select: {
        id: true,
        name: true,
        city: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function getBranchFloorsAction(branchId: string) {
  try {
    return await prisma.floor.findMany({
      where: { branchId },
      include: {
        spaces: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching floors:", error);
    return [];
  }
}

export async function getFloorSpacesAction(floorId: string) {
  try {
    return await prisma.space.findMany({
      where: { floorId, isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return [];
  }
}

export async function saveFloorLayoutAction(floorId: string, layoutJson: string) {
  try {
    // 1. Update the Floor layoutJson string
    await prisma.floor.update({
      where: { id: floorId },
      data: { layoutJson },
    });

    // 2. Parse layout shapes
    const parsed = JSON.parse(layoutJson);
    const shapes = parsed.shapes || [];

    // 3. Sync drawn shapes to individual database Space entries
    // Retrieve currently registered spaces for this floor
    const existingSpaces = await prisma.space.findMany({
      where: { floorId },
      select: { id: true },
    });
    const existingIds = existingSpaces.map((s) => s.id);

    const savedIds = shapes.map((s: any) => s.id);

    // Upsert each shape into the Space table
    for (const shape of shapes) {
      await prisma.space.upsert({
        where: { id: shape.id },
        create: {
          id: shape.id,
          name: shape.name || `Space ${shape.id}`,
          type: shape.type || "DESK",
          capacity: Number(shape.capacity) || 1,
          baseRate: Number(shape.baseRate) || 100,
          floorId,
          amenities: JSON.stringify(shape.amenities || []),
          isActive: true,
        },
        update: {
          name: shape.name || `Space ${shape.id}`,
          type: shape.type || "DESK",
          capacity: Number(shape.capacity) || 1,
          baseRate: Number(shape.baseRate) || 100,
          amenities: JSON.stringify(shape.amenities || []),
        },
      });
    }

    // Delete spaces that were removed from the layout
    const deletedIds = existingIds.filter((id) => !savedIds.includes(id));
    if (deletedIds.length > 0) {
      // Clean up orphaned bookings first
      await prisma.booking.deleteMany({
        where: { spaceId: { in: deletedIds } },
      });
      await prisma.space.deleteMany({
        where: { id: { in: deletedIds } },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving floor layout:", error);
    return { success: false, error: String(error) };
  }
}

export async function createFloorAction(branchId: string, name: string) {
  try {
    const floor = await prisma.floor.create({
      data: {
        name,
        branchId,
        layoutJson: JSON.stringify({ width: 750, height: 500, shapes: [] }),
      },
    });
    return { success: true, floor };
  } catch (error) {
    console.error("Error creating floor:", error);
    return { success: false, error: String(error) };
  }
}

export async function getClientsAction() {
  try {
    return await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function getFullClientsAction(branchId?: string) {
  try {
    const whereClause: any = {};
    if (branchId && branchId !== "all") {
      whereClause.branchId = branchId;
    }

    return await prisma.client.findMany({
      where: whereClause,
      include: {
        contracts: true,
        bookings: {
          include: {
            space: true,
          },
        },
        invoices: true,
        tickets: true,
        branch: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching full clients:", error);
    return [];
  }
}

export async function createClientAction(data: {
  name: string;
  company: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  branchId: string;
  lifecycle?: string;
  healthScore?: number;
}) {
  try {
    const client = await prisma.client.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        branchId: data.branchId,
        lifecycle: data.lifecycle || "LEAD",
        healthScore: data.healthScore !== undefined ? data.healthScore : 70,
      },
    });
    return { success: true, client };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: String(error) };
  }
}

export async function createContractAction(data: {
  clientId: string;
  spaceId: string;
  startDate: string;
  endDate: string;
  monthlyRate: number;
  status?: string;
  signatureUrl?: string;
}) {
  try {
    const contract = await prisma.contract.create({
      data: {
        clientId: data.clientId,
        spaceId: data.spaceId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        monthlyRate: Number(data.monthlyRate),
        status: data.status || "ACTIVE",
        signatureUrl: data.signatureUrl || null,
      },
    });
    return { success: true, contract };
  } catch (error) {
    console.error("Error creating contract:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateClientLifecycleAction(clientId: string, lifecycle: string) {
  try {
    const client = await prisma.client.update({
      where: { id: clientId },
      data: { lifecycle },
    });
    return { success: true, client };
  } catch (error) {
    console.error("Error updating client lifecycle:", error);
    return { success: false, error: String(error) };
  }
}

export async function getInvoicesAction(branchId?: string) {
  try {
    const whereClause: any = {};
    if (branchId && branchId !== "all") {
      whereClause.client = { branchId };
    }
    return await prisma.invoice.findMany({
      where: whereClause,
      include: {
        client: {
          include: {
            branch: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export async function createInvoiceAction(data: {
  clientId: string;
  amount: number;
  tax: number;
  dueDate: string;
  lineItems: string;
}) {
  try {
    const invoice = await prisma.invoice.create({
      data: {
        clientId: data.clientId,
        amount: Number(data.amount),
        tax: Number(data.tax),
        dueDate: new Date(data.dueDate),
        lineItems: data.lineItems,
        status: "PENDING",
      },
    });
    return { success: true, invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: String(error) };
  }
}

export async function payInvoiceAction(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });
    return { success: true, invoice };
  } catch (error) {
    console.error("Error paying invoice:", error);
    return { success: false, error: String(error) };
  }
}

export async function getContractsAction(branchId?: string) {
  try {
    const whereClause: any = {};
    if (branchId && branchId !== "all") {
      whereClause.client = { branchId };
    }
    return await prisma.contract.findMany({
      where: whereClause,
      include: {
        client: {
          include: {
            branch: true,
          },
        },
      },
      orderBy: { endDate: "asc" },
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return [];
  }
}

export async function renewContractAction(
  contractId: string,
  newEndDate: string,
  newMonthlyRate: number
) {
  try {
    const renewed = await prisma.contract.update({
      where: { id: contractId },
      data: {
        endDate: new Date(newEndDate),
        monthlyRate: Number(newMonthlyRate),
        status: "ACTIVE",
      },
    });
    return { success: true, contract: renewed };
  } catch (error) {
    console.error("Error renewing contract:", error);
    return { success: false, error: String(error) };
  }
}

export async function getVisitorsAction(branchId?: string) {
  try {
    const whereClause: any = {};
    if (branchId && branchId !== "all") {
      whereClause.branchId = branchId;
    }
    return await prisma.visitor.findMany({
      where: whereClause,
      include: {
        branch: true,
      },
      orderBy: { checkInAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return [];
  }
}

export async function checkInVisitorAction(data: {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  hostName: string;
  hostEmail: string;
  purpose?: string;
  branchId: string;
}) {
  try {
    const visitor = await prisma.visitor.create({
      data: {
        name: data.name,
        company: data.company || null,
        email: data.email || null,
        phone: data.phone || null,
        hostName: data.hostName,
        hostEmail: data.hostEmail,
        purpose: data.purpose || null,
        branchId: data.branchId,
      },
    });
    return { success: true, visitor };
  } catch (error) {
    console.error("Error checking in visitor:", error);
    return { success: false, error: String(error) };
  }
}

export async function checkOutVisitorAction(visitorId: string) {
  try {
    const visitor = await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        checkOutAt: new Date(),
      },
    });
    return { success: true, visitor };
  } catch (error) {
    console.error("Error checking out visitor:", error);
    return { success: false, error: String(error) };
  }
}

export async function getTicketsAction(branchId?: string) {
  try {
    const whereClause: any = {};
    if (branchId && branchId !== "all") {
      whereClause.branchId = branchId;
    }
    return await prisma.ticket.findMany({
      where: whereClause,
      include: {
        client: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
}

export async function createTicketAction(data: {
  title: string;
  description: string;
  category: string;
  priority: string;
  branchId: string;
  clientId?: string;
}) {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        branchId: data.branchId,
        clientId: data.clientId || null,
        status: "OPEN",
      },
    });
    return { success: true, ticket };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateTicketStatusAction(ticketId: string, status: string) {
  try {
    const isResolved = status === "RESOLVED" || status === "CLOSED";
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt: isResolved ? new Date() : null,
      },
    });
    return { success: true, ticket };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return { success: false, error: String(error) };
  }
}





