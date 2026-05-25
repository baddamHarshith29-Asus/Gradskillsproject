import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/": ["./prisma/dev.db"],
    "/login": ["./prisma/dev.db"],
    "/register": ["./prisma/dev.db"],
    "/dashboard": ["./prisma/dev.db"],
    "/booking": ["./prisma/dev.db"],
    "/floor-builder": ["./prisma/dev.db"],
    "/clients": ["./prisma/dev.db"],
    "/finance": ["./prisma/dev.db"],
    "/renewals": ["./prisma/dev.db"],
    "/visitors": ["./prisma/dev.db"],
    "/tickets": ["./prisma/dev.db"],
    "/kiosk": ["./prisma/dev.db"],
    "/api/bookings": ["./prisma/dev.db"],
  },
};

export default nextConfig;
