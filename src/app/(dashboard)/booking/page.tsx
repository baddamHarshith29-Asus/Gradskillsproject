"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useBranchStore } from "@/lib/store";
import { getBranchFloorsAction, getBranchesAction } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Map, Filter, Clock, Sparkles, CheckCircle2, User, Loader2 } from "lucide-react";
import BookingModal from "@/components/booking/BookingModal";
import { toast } from "sonner";

// Dynamic imports to prevent SSR issues for canvas & calendar
const BookingFloorMap = dynamic(() => import("@/components/booking/BookingFloorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[510px] w-full items-center justify-center rounded-xl border border-brand-600 bg-brand-800 text-neutral text-xs animate-pulse">
      <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
      Loading Floor Plan visualizer...
    </div>
  ),
});

const BookingCalendar = dynamic(() => import("@/components/booking/BookingCalendar"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-xl border border-brand-600 bg-brand-850 text-neutral text-xs animate-pulse">
      <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
      Generating Interactive Schedule...
    </div>
  ),
});

const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

function BookingPageContent() {
  const { selectedBranchId, setBranch } = useBranchStore();
  const searchParams = useSearchParams();
  const queryBranchId = searchParams ? searchParams.get("branch") : null;

  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"floor" | "calendar">("floor");
  
  // Date/Time query state for Floor Map occupancy
  const [queryDate, setQueryDate] = useState(new Date().toISOString().split("T")[0]);
  const [queryStartTime, setQueryStartTime] = useState("10:00");
  const [queryEndTime, setQueryEndTime] = useState("12:00");
  
  // Bookings list for current branch
  const [bookings, setBookings] = useState<any[]>([]);
  
  // Booking Modal trigger
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpaceForBooking, setSelectedSpaceForBooking] = useState<any | null>(null);

  // Quick space type filters
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Live Hover property inspector state
  const [hoveredSpace, setHoveredSpace] = useState<any | null>(null);

  // 1. Initial load
  useEffect(() => {
    async function init() {
      const dbBranches = await getBranchesAction();
      setBranches(dbBranches);

      // Auto-select branch if passed in search query
      if (queryBranchId) {
        const found = dbBranches.find((b) => b.id === queryBranchId);
        if (found) {
          setBranch(found.id, found.name);
          return;
        }
      }

      if (dbBranches.length > 0 && selectedBranchId === "all") {
        setBranch(dbBranches[0].id, dbBranches[0].name);
      }
    }
    init();
  }, [queryBranchId]);

  // 2. Fetch floors and bookings when branch changes
  useEffect(() => {
    if (selectedBranchId && selectedBranchId !== "all") {
      loadBranchData();
    }
  }, [selectedBranchId]);

  // Synchronize query start and end times to prevent invalid windows
  useEffect(() => {
    const startIdx = TIME_OPTIONS.indexOf(queryStartTime);
    const endIdx = TIME_OPTIONS.indexOf(queryEndTime);
    if (endIdx <= startIdx) {
      const nextIdx = Math.min(startIdx + 2, TIME_OPTIONS.length - 1);
      setQueryEndTime(TIME_OPTIONS[nextIdx]);
    }
  }, [queryStartTime]);

  async function loadBranchData() {
    // Load floors
    const dbFloors = await getBranchFloorsAction(selectedBranchId);
    setFloors(dbFloors);
    if (dbFloors.length > 0) {
      setSelectedFloorId(dbFloors[0].id);
    } else {
      setSelectedFloorId("");
    }

    // Load bookings
    fetchBookings();
  }

  const fetchBookings = async () => {
    if (!selectedBranchId || selectedBranchId === "all") return;
    try {
      const res = await fetch(`/api/bookings?branchId=${selectedBranchId}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reservations list.");
    }
  };

  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFloorId(e.target.value);
  };

  // Find active floor
  const activeFloor = floors.find((f) => f.id === selectedFloorId);
  
  // Parse shapes from floor json layout
  let shapes: any[] = [];
  if (activeFloor?.layoutJson) {
    try {
      const parsed = JSON.parse(activeFloor.layoutJson);
      shapes = parsed.shapes || [];
    } catch (e) {
      shapes = [];
    }
  }

  // Filter shapes by space type
  if (typeFilter !== "ALL") {
    shapes = shapes.filter((s) => s.type === typeFilter);
  }

  // Determine which spaces are occupied in the queried time window
  const queryStartDateTime = new Date(`${queryDate}T${queryStartTime}:00`);
  const queryEndDateTime = new Date(`${queryDate}T${queryEndTime}:00`);

  const occupiedSpaceIds = new Set<string>();
  const spaceOccupantNames: Record<string, string> = {};

  bookings.forEach((booking) => {
    if (booking.status !== "CONFIRMED") return;
    const bStart = new Date(booking.startTime);
    const bEnd = new Date(booking.endTime);

    // Overlap condition
    if (bStart < queryEndDateTime && bEnd > queryStartDateTime) {
      occupiedSpaceIds.add(booking.spaceId);
      spaceOccupantNames[booking.spaceId] = booking.client?.company || booking.client?.name || "Reserved";
    }
  });

  const handleSelectSpace = (shape: any) => {
    setSelectedSpaceForBooking(shape);
    setIsModalOpen(true);
  };

  const handleBookingSuccess = () => {
    fetchBookings();
  };

  // Peak Hours utilization signal helper
  const totalFloorSpacesCount = shapes.length;
  const occupiedCount = shapes.filter((s) => occupiedSpaceIds.has(s.id)).length;
  const utilizationRate = totalFloorSpacesCount > 0 ? (occupiedCount / totalFloorSpacesCount) : 0.5;

  const getEffectiveRate = (baseRate: number) => {
    if (utilizationRate > 0.7) {
      return Math.round(baseRate * 1.15);
    } else if (utilizationRate < 0.3) {
      return Math.round(baseRate * 0.85);
    }
    return baseRate;
  };

  const renderPropertyInspector = () => {
    const space = hoveredSpace;
    return (
      <Card className="border-brand-600 bg-brand-850 h-[510px] flex flex-col justify-between overflow-hidden relative shadow-lg">
        {/* Glow detail background */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-400/5 blur-2xl pointer-events-none" />
        
        <CardHeader className="pb-3 border-b border-brand-600/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
              Live Inspector
            </span>
            {space && (
              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                occupiedSpaceIds.has(space.id) ? "border-red-500/30 text-red-400 bg-red-950/20" : "border-emerald-500/30 text-emerald-400 bg-emerald-950/20"
              }`}>
                {occupiedSpaceIds.has(space.id) ? "● Occupied" : "● Available"}
              </Badge>
            )}
          </div>
          <CardTitle className="font-heading text-lg font-bold text-white mt-1">
            {space ? space.name : "Select or Hover Space"}
          </CardTitle>
          <CardDescription className="text-[11px] text-neutral">
            {space ? `Properties for ID: ${space.id.substring(0, 8)}...` : "Hover your mouse over a shape on the map canvas to inspect live states."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 p-4 space-y-4 text-xs overflow-y-auto">
          {space ? (
            <>
              {/* Type and capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-900/45 border border-brand-600/30 rounded-lg p-2">
                  <div className="text-neutral text-[9px] uppercase font-bold tracking-wider">Space Type</div>
                  <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <span className="text-[11px]">
                      {space.type === "MEETING_ROOM" && "🤝 Meeting Room"}
                      {space.type === "PRIVATE_OFFICE" && "💼 Private Office"}
                      {space.type === "PHONE_BOOTH" && "📞 Phone Booth"}
                      {space.type === "HOT_DESK" && "🟢 Hotdesk Area"}
                      {space.type === "DESK" && "🖥️ Fixed Desk"}
                    </span>
                  </div>
                </div>
                <div className="bg-brand-900/45 border border-brand-600/30 rounded-lg p-2">
                  <div className="text-neutral text-[9px] uppercase font-bold tracking-wider">Capacity</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{space.capacity} pax</div>
                </div>
              </div>

              {/* Rates */}
              <div className="bg-brand-900/45 border border-brand-600/30 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center text-slate-300 text-[11px]">
                  <span>Base Rate:</span>
                  <span className="font-semibold">₹{space.baseRate}/hour</span>
                </div>
                
                {/* Dynamic pricing calculation */}
                <div className="flex justify-between items-center text-slate-300 border-t border-brand-600/30 pt-2 text-[11px]">
                  <span>Dynamic Rate:</span>
                  <span className="font-bold text-xs text-brand-300">
                    ₹{getEffectiveRate(space.baseRate)}/hour
                  </span>
                </div>
                
                <div className="text-[10px] text-neutral leading-relaxed">
                  {utilizationRate > 0.7 ? (
                    <span className="text-red-400">🔥 +15% Dynamic surcharge applied due to high demand.</span>
                  ) : utilizationRate < 0.3 ? (
                    <span className="text-emerald-400">✨ -15% Off-peak price discount active!</span>
                  ) : (
                    <span className="text-slate-400">Standard community pricing is currently in effect.</span>
                  )}
                </div>
              </div>

              {/* Occupant Detail */}
              <div className="bg-brand-900/45 border border-brand-600/30 rounded-lg p-3">
                <div className="text-neutral text-[9px] uppercase font-bold tracking-wider mb-1">Live Occupancy Status</div>
                {occupiedSpaceIds.has(space.id) ? (
                  <div className="space-y-1">
                    <div className="text-red-400 font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      Booked / Reserved
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-1">
                      <User className="size-3 text-neutral" />
                      <span>Host: <strong className="text-slate-200">{spaceOccupantNames[space.id] || "Reserved member"}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Available to reserve instantly
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-1.5">
                <div className="text-neutral text-[9px] uppercase font-bold tracking-wider">Available Amenities</div>
                <div className="flex flex-wrap gap-1">
                  {space.amenities && space.amenities.length > 0 ? (
                    space.amenities.map((amenity: string, idx: number) => (
                      <span key={idx} className="bg-brand-800 text-slate-300 border border-brand-600/50 rounded px-2 py-0.5 text-[9px]">
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-neutral italic">Standard workspace amenities included.</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-75">
              <div className="size-16 rounded-full bg-brand-900/40 border border-brand-600/25 flex items-center justify-center text-xl mb-3 text-brand-400">
                🔍
              </div>
              <span className="text-xs font-semibold text-slate-300">Space Inspector Inactive</span>
              <span className="text-[10px] text-neutral max-w-[200px] mt-1 leading-relaxed">
                Hover over a desk or office on the layout canvas to view its amenities, capacity, and current price.
              </span>
            </div>
          )}
        </CardContent>

        {space && !occupiedSpaceIds.has(space.id) && (
          <div className="p-3 border-t border-brand-600/40 bg-brand-900/40">
            <Button
              onClick={() => handleSelectSpace(space)}
              className="w-full bg-brand-400 text-white hover:bg-brand-300 text-xs font-bold py-1.5 h-9 rounded transition-all shadow-md shadow-brand-400/10"
            >
              <CheckCircle2 className="size-3.5 mr-1.5" />
              Book Space
            </Button>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-white">Smart Booking Portal</h2>
          <p className="text-xs text-neutral">
            Check live floor grids, browse schedules, and reserve hotdesks or conference rooms with dynamic peak pricing.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-brand-850 p-1 rounded-lg border border-brand-600">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("floor")}
            className={`h-8 text-xs font-semibold px-3 py-1 rounded transition-colors ${
              activeTab === "floor" ? "bg-brand-400 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Map className="size-3.5 mr-1.5" />
            Floor Map View
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("calendar")}
            className={`h-8 text-xs font-semibold px-3 py-1 rounded transition-colors ${
              activeTab === "calendar" ? "bg-brand-400 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <CalendarIcon className="size-3.5 mr-1.5" />
            Calendar Schedule
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      {selectedBranchId === "all" ? (
        <Card className="border-brand-600 bg-brand-700 p-8 text-center max-w-lg mx-auto">
          <Map className="size-12 text-brand-600 mx-auto mb-3" />
          <span className="text-sm font-semibold text-slate-300 block">Select a Coworking Center</span>
          <span className="text-xs text-neutral block mt-1">
            To query space availability and make bookings, please select a specific branch from the dropdown menu in the sidebar.
          </span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* Left Panel: Query Options & Filters */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-brand-600 bg-brand-700 p-4 space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-600 pb-2">
                <Clock className="size-4.5 text-brand-400" />
                <span className="font-heading text-xs font-bold text-slate-200">Set Reservation Window</span>
              </div>
              
              {/* Date Query */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-neutral">Date</label>
                <input
                  type="date"
                  value={queryDate}
                  onChange={(e) => setQueryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Time Queries */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-semibold text-neutral">Start</label>
                  <select
                    value={queryStartTime}
                    onChange={(e) => setQueryStartTime(e.target.value)}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-2 py-1.5 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                  >
                    {TIME_OPTIONS.slice(0, -1).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-semibold text-neutral">End</label>
                  <select
                    value={queryEndTime}
                    onChange={(e) => setQueryEndTime(e.target.value)}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-2 py-1.5 text-xs text-slate-100 focus:border-brand-400 focus:outline-none cursor-pointer"
                  >
                    {TIME_OPTIONS.slice(TIME_OPTIONS.indexOf(queryStartTime) + 1).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Space filters */}
              <div className="space-y-3 border-t border-brand-600 pt-3">
                <div className="flex items-center gap-2 pb-1">
                  <Filter className="size-4 text-brand-400" />
                  <span className="font-heading text-xs font-bold text-slate-200">Space Type Filter</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: "ALL", label: "All Space Types" },
                    { id: "DESK", label: "Fixed Desk" },
                    { id: "HOT_DESK", label: "Hotdesk Areas" },
                    { id: "MEETING_ROOM", label: "Meeting Rooms" },
                    { id: "PRIVATE_OFFICE", label: "Private Offices" },
                    { id: "PHONE_BOOTH", label: "Phone Booths" }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTypeFilter(filter.id)}
                      className={`w-full text-left rounded px-2.5 py-1.5 text-xs transition-colors ${
                        typeFilter === filter.id
                          ? "bg-brand-600/40 text-brand-300 font-semibold border-l-2 border-brand-400"
                          : "text-slate-300 hover:bg-brand-800/40 hover:text-white"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Smart Demand pricing sandbox indicator */}
            {activeTab === "floor" && shapes.length > 0 && (
              <Card className="border-brand-600 bg-brand-700 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-400">
                  <Sparkles className="size-4 animate-pulse" />
                  <span>Dynamic Pricing Signals</span>
                </div>
                <p className="text-[11px] text-neutral leading-relaxed">
                  Utilization for this block is <strong className="text-slate-200">{Math.round(utilizationRate * 100)}%</strong>. 
                  {utilizationRate > 0.7 ? (
                    <span className="text-danger"> Highly busy period. Peak hours surcharge (+15%) will be active on checkout.</span>
                  ) : utilizationRate < 0.3 ? (
                    <span className="text-success"> Calm period. Off-peak pricing discounts (-15%) apply!</span>
                  ) : (
                    <span> Standard workspace base rates apply.</span>
                  )}
                </p>
              </Card>
            )}
          </div>

          {/* Right Panel: Map or Calendar */}
          <div className="lg:col-span-3">
            {activeTab === "floor" ? (
              <Card className="border-brand-600 bg-brand-700 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-600 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral">Floor Layout:</span>
                    {floors.length === 0 ? (
                      <span className="text-xs text-danger font-semibold">No Layouts Available</span>
                    ) : (
                      <select
                        value={selectedFloorId}
                        onChange={handleFloorChange}
                        className="rounded border border-brand-600 bg-brand-850 px-2.5 py-1 text-xs font-semibold text-slate-200 focus:border-brand-400 focus:outline-none cursor-pointer"
                      >
                        {floors.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-neutral">
                      Query Slots: {occupiedCount} / {totalFloorSpacesCount} Reserved
                    </span>
                  </div>
                </div>

                {selectedFloorId ? (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8">
                      <BookingFloorMap
                        shapes={shapes}
                        occupiedSpaceIds={occupiedSpaceIds}
                        spaceOccupantNames={spaceOccupantNames}
                        onSelectSpace={handleSelectSpace}
                        onHoverSpace={setHoveredSpace}
                      />
                    </div>
                    <div className="xl:col-span-4">
                      {renderPropertyInspector()}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[400px] flex-col items-center justify-center text-center">
                    <Map className="size-12 text-brand-600 mb-3" />
                    <span className="text-sm font-semibold text-slate-300">No Floor Layout Selected</span>
                    <span className="text-xs text-neutral max-w-sm mt-1 leading-relaxed">
                      This center doesn't have any floors designed. Go to the Floor Plan Builder page to design the seating layout.
                    </span>
                  </div>
                )}
              </Card>
            ) : (
              <BookingCalendar 
                bookings={bookings} 
                onSelectEvent={(e) => {
                  toast.info(`Space: ${e.resource.space?.name}\nClient: ${e.resource.client?.name} (${e.resource.client?.company})\nHours: ${new Date(e.resource.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(e.resource.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Booking Checkout dialog */}
      {selectedSpaceForBooking && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSpaceForBooking(null);
          }}
          space={{
            id: selectedSpaceForBooking.id,
            name: selectedSpaceForBooking.name,
            type: selectedSpaceForBooking.type,
            baseRate: selectedSpaceForBooking.baseRate,
            capacity: selectedSpaceForBooking.capacity,
          }}
          branchId={selectedBranchId}
          historicalUtilization={utilizationRate}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-brand-600 bg-brand-850 text-neutral text-xs">
        <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
        Initialising Smart Booking system...
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
