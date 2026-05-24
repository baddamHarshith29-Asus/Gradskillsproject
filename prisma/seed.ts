require("dotenv").config();
const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");
const adapter = new PrismaLibSql({
  url: "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database...");
  await prisma.ticket.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.client.deleteMany();
  await prisma.space.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Seeding CoNexus platform...");

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      name: "CoNexus Workspace Networks",
    },
  });

  // 2. Branches
  const b1 = await prisma.branch.create({
    data: {
      name: "Downtown Innovation Hub",
      city: "Bangalore",
      address: "102 Mahatma Gandhi Rd, Ashok Nagar",
      organizationId: org.id,
    },
  });

  const b2 = await prisma.branch.create({
    data: {
      name: "Tech Park West",
      city: "Mumbai",
      address: "A-502 Bandra Kurla Complex, Bandra East",
      organizationId: org.id,
    },
  });

  const b3 = await prisma.branch.create({
    data: {
      name: "Waterfront Incubator",
      city: "Goa",
      address: "45 Miramar Beach Rd, Panaji",
      organizationId: org.id,
    },
  });

  // 3. Floors
  const f1_1 = await prisma.floor.create({
    data: {
      name: "Floor 1 - Main Hub",
      branchId: b1.id,
      layoutJson: JSON.stringify({
        width: 800,
        height: 600,
        shapes: [
          { id: "sp-1", type: "MEETING_ROOM", x: 100, y: 100, width: 120, height: 100, name: "Meeting Room A", capacity: 8, baseRate: 600 },
          { id: "sp-2", type: "PHONE_BOOTH", x: 250, y: 100, width: 60, height: 60, name: "Phone Booth 1", capacity: 1, baseRate: 150 },
          { id: "sp-3", type: "DESK", x: 100, y: 250, width: 50, height: 40, name: "Dedicated Desk 1", capacity: 1, baseRate: 100 },
          { id: "sp-4", type: "DESK", x: 170, y: 250, width: 50, height: 40, name: "Dedicated Desk 2", capacity: 1, baseRate: 100 },
          { id: "sp-5", type: "HOT_DESK", x: 100, y: 350, width: 120, height: 80, name: "Hotdesk Zone X", capacity: 6, baseRate: 50 },
        ]
      }),
    },
  });

  const f1_2 = await prisma.floor.create({
    data: {
      name: "Floor 2 - Quiet Zone",
      branchId: b1.id,
      layoutJson: JSON.stringify({
        width: 800,
        height: 600,
        shapes: [
          { id: "sp-6", type: "PRIVATE_OFFICE", x: 100, y: 100, width: 150, height: 120, name: "Executive Suite 201", capacity: 4, baseRate: 1200 },
          { id: "sp-7", type: "DESK", x: 300, y: 100, width: 50, height: 40, name: "Quiet Desk 1", capacity: 1, baseRate: 120 },
        ]
      }),
    },
  });

  const f2_1 = await prisma.floor.create({
    data: {
      name: "Floor 1 - Ground Space",
      branchId: b2.id,
      layoutJson: JSON.stringify({
        width: 800,
        height: 600,
        shapes: [
          { id: "sp-8", type: "MEETING_ROOM", x: 100, y: 100, width: 120, height: 100, name: "Boardroom Alpha", capacity: 12, baseRate: 800 },
          { id: "sp-9", type: "HOT_DESK", x: 300, y: 100, width: 120, height: 80, name: "BKC Hotdesking", capacity: 8, baseRate: 80 },
        ]
      }),
    },
  });

  const f3_1 = await prisma.floor.create({
    data: {
      name: "Deck 1 - Beachfront",
      branchId: b3.id,
      layoutJson: JSON.stringify({
        width: 800,
        height: 600,
        shapes: [
          { id: "sp-10", type: "MEETING_ROOM", x: 100, y: 100, width: 120, height: 100, name: "Ocean Room", capacity: 6, baseRate: 400 },
          { id: "sp-11", type: "HOT_DESK", x: 300, y: 100, width: 150, height: 80, name: "Sunset Lounge Desks", capacity: 10, baseRate: 40 },
        ]
      }),
    },
  });

  // 4. Spaces
  const spaces = [
    // Downtown Hub Spaces
    { id: "sp-1", name: "Meeting Room A", type: "MEETING_ROOM", capacity: 8, baseRate: 600, floorId: f1_1.id, amenities: JSON.stringify(["Wifi", "Projector", "Whiteboard", "Tea/Coffee"]) },
    { id: "sp-2", name: "Phone Booth 1", type: "PHONE_BOOTH", capacity: 1, baseRate: 150, floorId: f1_1.id, amenities: JSON.stringify(["Wifi", "Acoustic Padding"]) },
    { id: "sp-3", name: "Dedicated Desk 1", type: "DESK", capacity: 1, baseRate: 100, floorId: f1_1.id, amenities: JSON.stringify(["Wifi", "Ergonomic Chair", "Monitor"]) },
    { id: "sp-4", name: "Dedicated Desk 2", type: "DESK", capacity: 1, baseRate: 100, floorId: f1_1.id, amenities: JSON.stringify(["Wifi", "Ergonomic Chair"]) },
    { id: "sp-5", name: "Hotdesk Zone X", type: "HOT_DESK", capacity: 6, baseRate: 50, floorId: f1_1.id, amenities: JSON.stringify(["Wifi", "Power Outlets"]) },
    { id: "sp-6", name: "Executive Suite 201", type: "PRIVATE_OFFICE", capacity: 4, baseRate: 1200, floorId: f1_2.id, amenities: JSON.stringify(["Wifi", "Whiteboard", "Filing Cabinets", "AC"]) },
    { id: "sp-7", name: "Quiet Desk 1", type: "DESK", capacity: 1, baseRate: 120, floorId: f1_2.id, amenities: JSON.stringify(["Wifi", "Ergonomic Chair", "Noise Cancelling Panel"]) },

    // Tech Park West Spaces
    { id: "sp-8", name: "Boardroom Alpha", type: "MEETING_ROOM", capacity: 12, baseRate: 800, floorId: f2_1.id, amenities: JSON.stringify(["Wifi", "4K TV Screen", "Video Conf", "AC"]) },
    { id: "sp-9", name: "BKC Hotdesking", type: "HOT_DESK", capacity: 8, baseRate: 80, floorId: f2_1.id, amenities: JSON.stringify(["Wifi", "Ergonomic Chairs"]) },

    // Waterfront Incubator Spaces
    { id: "sp-10", name: "Ocean Room", type: "MEETING_ROOM", capacity: 6, baseRate: 400, floorId: f3_1.id, amenities: JSON.stringify(["Wifi", "Balcony Access", "Whiteboard"]) },
    { id: "sp-11", name: "Sunset Lounge Desks", type: "HOT_DESK", capacity: 10, baseRate: 40, floorId: f3_1.id, amenities: JSON.stringify(["Wifi", "Coffee Bar"]) },
  ];

  for (const s of spaces) {
    await prisma.space.create({ data: s });
  }

  // 5. Clients (with health metrics seed data)
  const clientsData = [
    { name: "Acme Technology Corp", company: "Acme Corp", email: "info@acme.com", phone: "+919876543210", whatsapp: "+919876543210", branchId: b1.id, lifecycle: "ACTIVE", healthScore: 92 },
    { name: "BlueSky Freelancing", company: "BlueSky", email: "hello@bluesky.io", phone: "+919888777666", whatsapp: "+919888777666", branchId: b1.id, lifecycle: "ACTIVE", healthScore: 78 },
    { name: "Vibe Studios", company: "Vibe", email: "creatives@vibestudios.co", phone: "+919111222333", whatsapp: "+919111222333", branchId: b1.id, lifecycle: "ACTIVE", healthScore: 38 }, // low score - renewal risk
    { name: "Global Consulting Partners", company: "GCP", email: "finance@gcp.com", phone: "+919222333444", whatsapp: "+919222333444", branchId: b1.id, lifecycle: "ONBOARDING", healthScore: 50 },
    { name: "Redwood Design Group", company: "Redwood", email: "hello@redwood.design", phone: "+919333444555", whatsapp: null, branchId: b2.id, lifecycle: "ACTIVE", healthScore: 85 },
    { name: "Nexus Venture Labs", company: "NexusLabs", email: "ventures@nexuslabs.co", phone: "+919444555666", whatsapp: "+919444555666", branchId: b2.id, lifecycle: "ACTIVE", healthScore: 42 }, // at risk
    { name: "SeaSide Nomads", company: "SeaSide", email: "nomads@seaside.goa", phone: "+919555666777", whatsapp: "+919555666777", branchId: b3.id, lifecycle: "ACTIVE", healthScore: 95 },
    { name: "Fresh Produce Dev", company: "FreshProduce", email: "leads@freshdev.io", phone: "+919666777888", whatsapp: null, branchId: b3.id, lifecycle: "LEAD", healthScore: 50 },
  ];

  const clients = [];
  for (const c of clientsData) {
    const created = await prisma.client.create({ data: c });
    clients.push(created);
  }

  // Find specifically seeded clients
  const acme = clients.find((c) => c.company === "Acme Corp");
  const bluesky = clients.find((c) => c.company === "BlueSky");
  const vibe = clients.find((c) => c.company === "Vibe");
  const redwood = clients.find((c) => c.company === "Redwood");
  const nexuslabs = clients.find((c) => c.company === "NexusLabs");
  const nomads = clients.find((c) => c.company === "SeaSide");

  // 6. Contracts
  const contractsData = [
    { clientId: acme.id, spaceId: "sp-6", startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), monthlyRate: 45000, status: "ACTIVE" },
    { clientId: bluesky.id, spaceId: "sp-3", startDate: new Date("2026-03-01"), endDate: new Date("2026-08-31"), monthlyRate: 8000, status: "ACTIVE" },
    { clientId: vibe.id, spaceId: "sp-4", startDate: new Date("2025-06-01"), endDate: new Date("2026-05-31"), monthlyRate: 7500, status: "EXPIRING" }, // expires soon!
    { clientId: redwood.id, spaceId: "sp-8", startDate: new Date("2026-02-01"), endDate: new Date("2027-01-31"), monthlyRate: 60000, status: "ACTIVE" },
    { clientId: nomads.id, spaceId: "sp-11", startDate: new Date("2026-05-01"), endDate: new Date("2026-06-01"), monthlyRate: 12000, status: "ACTIVE" },
  ];

  for (const c of contractsData) {
    await prisma.contract.create({ data: c });
  }

  // 7. Bookings (Historical + Future for AI forecasting)
  console.log("Generating 100+ bookings for AI forecast...");
  const baseBookings = [];
  const now = new Date();
  
  // Seed historical bookings for last 30 days to build pattern
  // Meeting rooms have high usage on Tue & Thu, lower on Mon & Fri, zero on weekends
  const dayOfWeekUtilization = [0.1, 0.45, 0.85, 0.50, 0.88, 0.35, 0.05]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

  for (let i = 30; i >= 1; i--) {
    const bookingDate = new Date();
    bookingDate.setDate(now.getDate() - i);
    const dayOfWeek = bookingDate.getDay();
    const targetUtil = dayOfWeekUtilization[dayOfWeek];

    // Determine how many bookings to generate for this day based on target utilization
    const numBookings = Math.round(targetUtil * 5); // Max 5 bookings per day

    for (let j = 0; j < numBookings; j++) {
      // Alternate spaces
      const spaceId = j % 2 === 0 ? "sp-1" : "sp-2"; // Meeting room or phone booth
      const startHour = 9 + Math.floor(Math.random() * 8); // 9am to 5pm
      
      const startTime = new Date(bookingDate);
      startTime.setHours(startHour, 0, 0, 0);
      
      const endTime = new Date(bookingDate);
      endTime.setHours(startHour + 1 + Math.floor(Math.random() * 2), 0, 0, 0);

      // Random client
      const client = clients[Math.floor(Math.random() * clients.length)];

      baseBookings.push({
        spaceId,
        clientId: client.lifecycle === "LEAD" ? null : client.id,
        branchId: b1.id,
        startTime,
        endTime,
        status: "COMPLETED",
        totalAmount: spaceId === "sp-1" ? 1200 : 300,
      });
    }
  }

  // Seed future bookings for next 7 days
  for (let i = 0; i < 7; i++) {
    const bookingDate = new Date();
    bookingDate.setDate(now.getDate() + i);
    const dayOfWeek = bookingDate.getDay();
    
    // Downtown Hub bookings
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Weekdays
      // Book meeting room A
      baseBookings.push({
        spaceId: "sp-1",
        clientId: acme.id,
        branchId: b1.id,
        startTime: (() => {
          const d = new Date(bookingDate);
          d.setHours(10, 0, 0, 0);
          return d;
        })(),
        endTime: (() => {
          const d = new Date(bookingDate);
          d.setHours(12, 0, 0, 0);
          return d;
        })(),
        status: "CONFIRMED",
        totalAmount: 1200,
      });

      // Phone booth booking
      baseBookings.push({
        spaceId: "sp-2",
        clientId: bluesky.id,
        branchId: b1.id,
        startTime: (() => {
          const d = new Date(bookingDate);
          d.setHours(14, 0, 0, 0);
          return d;
        })(),
        endTime: (() => {
          const d = new Date(bookingDate);
          d.setHours(15, 0, 0, 0);
          return d;
        })(),
        status: "CONFIRMED",
        totalAmount: 150,
      });
    }
  }

  for (const b of baseBookings) {
    await prisma.booking.create({ data: b });
  }

  // 8. Visitors
  const visitorsData = [
    { name: "John Doe", company: "Google Inc", email: "johndoe@google.com", phone: "+1555666777", hostName: "Alice Smith (Acme)", hostEmail: "alice@acme.com", purpose: "Vendor meeting", branchId: b1.id, checkInAt: new Date(now.getTime() - 1000 * 60 * 45) }, // checked in 45m ago
    { name: "Priya Sharma", company: "Sequoia India", email: "priya@sequoia.com", phone: "+919998882211", hostName: "Raj Patel (BlueSky)", hostEmail: "raj@bluesky.io", purpose: "Pitch Session", branchId: b1.id, checkInAt: new Date(now.getTime() - 1000 * 60 * 15) }, // checked in 15m ago
    { name: "David Miller", company: "Amazon AWS", email: "david@amazon.com", phone: "+1444333222", hostName: "Vibe Studios Team", hostEmail: "creatives@vibestudios.co", purpose: "Partnership review", branchId: b1.id, checkInAt: new Date(now.getTime() - 1000 * 60 * 120), checkOutAt: new Date(now.getTime() - 1000 * 60 * 30) },
  ];

  for (const v of visitorsData) {
    await prisma.visitor.create({ data: v });
  }

  // 9. Employees
  const employeesData = [
    { name: "Sarah Connor", email: "sarah@conexus.app", role: "BRANCH_MANAGER", branchId: b1.id },
    { name: "Karan Johar", email: "karan@conexus.app", role: "COMMUNITY_LEAD", branchId: b1.id },
    { name: "Meera Nair", email: "meera@conexus.app", role: "FINANCE", branchId: b1.id },
  ];

  for (const e of employeesData) {
    await prisma.employee.create({ data: e });
  }

  // 10. Tickets (Issues with SLA timer values)
  const ticketsData = [
    { title: "Internet connection down on Floor 2", description: "Wifi keeps droping connections in Room 201. Critical for client video calls.", category: "Network", priority: "HIGH", status: "OPEN", branchId: b1.id, clientId: acme.id, createdAt: new Date(now.getTime() - 1000 * 60 * 180) }, // 3h ago
    { title: "Leaky AC in Meeting Room A", description: "Water leaking near the whiteboard setup. Slip hazard.", category: "Maintenance", priority: "URGENT", status: "IN_PROGRESS", branchId: b1.id, clientId: bluesky.id, createdAt: new Date(now.getTime() - 1000 * 60 * 300) }, // 5h ago (SLA breached! >4h)
    { title: "Cleaning requested in Phone Booth 1", description: "Coffee spilled on table.", category: "Cleaning", priority: "LOW", status: "RESOLVED", branchId: b1.id, clientId: vibe.id, createdAt: new Date(now.getTime() - 1000 * 60 * 120), resolvedAt: new Date(now.getTime() - 1000 * 60 * 60) },
  ];

  for (const t of ticketsData) {
    await prisma.ticket.create({ data: t });
  }

  // 11. Invoices
  const invoicesData = [
    {
      clientId: acme.id,
      amount: 45000,
      tax: 8100, // 18% GST standard in India
      status: "PAID",
      dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
      paidAt: new Date(now.getFullYear(), now.getMonth(), 4),
      lineItems: JSON.stringify([
        { description: "Dedicated Suite 201 - Monthly Rental", qty: 1, rate: 45000, amount: 45000 }
      ])
    },
    {
      clientId: bluesky.id,
      amount: 8000,
      tax: 1440,
      status: "PAID",
      dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
      paidAt: new Date(now.getFullYear(), now.getMonth(), 6), // 1 day late payment
      lineItems: JSON.stringify([
        { description: "Dedicated Desk #1 - Monthly Rental", qty: 1, rate: 8000, amount: 8000 }
      ])
    },
    {
      clientId: vibe.id,
      amount: 7500,
      tax: 1350,
      status: "OVERDUE", // overdue invoice causing lower health score!
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5), // last month!
      lineItems: JSON.stringify([
        { description: "Dedicated Desk #2 - Monthly Rental", qty: 1, rate: 7500, amount: 7500 }
      ])
    },
    {
      clientId: vibe.id,
      amount: 7500,
      tax: 1350,
      status: "PENDING",
      dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
      lineItems: JSON.stringify([
        { description: "Dedicated Desk #2 - Monthly Rental", qty: 1, rate: 7500, amount: 7500 }
      ])
    }
  ];

  for (const i of invoicesData) {
    await prisma.invoice.create({ data: i });
  }

  console.log("Seeding complete! Core datasets are ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
