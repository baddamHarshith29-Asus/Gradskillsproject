"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useBranchStore } from "@/lib/store";
import {
  getBranchesAction,
  getBranchFloorsAction,
  saveFloorLayoutAction,
  createFloorAction,
} from "@/app/actions";
import ShapeSidebar from "@/components/floor/ShapeSidebar";
import PropertiesPanel from "@/components/floor/PropertiesPanel";
import { CanvasShape } from "@/components/floor/FloorCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Save, Sparkles, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Dynamically import Konva component with SSR disabled
const FloorCanvas = dynamic(() => import("@/components/floor/FloorCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[510px] w-full items-center justify-center rounded-xl border border-brand-600 bg-brand-800 text-neutral text-xs animate-pulse">
      <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
      Booting Vector Layout Canvas...
    </div>
  ),
});

export default function FloorBuilderPage() {
  const { selectedBranchId, setBranch } = useBranchStore();
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [floors, setFloors] = useState<{ id: string; name: string; layoutJson: string }[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newFloorName, setNewFloorName] = useState("");
  const [creatingFloor, setCreatingFloor] = useState(false);

  // 1. Load branches on mount
  useEffect(() => {
    async function loadBranches() {
      const dbBranches = await getBranchesAction();
      setBranches(dbBranches);
      if (dbBranches.length > 0 && selectedBranchId === "all") {
        setBranch(dbBranches[0].id, dbBranches[0].name);
      }
    }
    loadBranches();
  }, []);

  // 2. Load floors when selected branch changes
  useEffect(() => {
    if (selectedBranchId && selectedBranchId !== "all") {
      loadFloors();
    }
  }, [selectedBranchId]);

  async function loadFloors() {
    const dbFloors = await getBranchFloorsAction(selectedBranchId);
    setFloors(dbFloors);
    if (dbFloors.length > 0) {
      setSelectedFloorId(dbFloors[0].id);
      loadLayout(dbFloors[0].layoutJson);
    } else {
      setSelectedFloorId("");
      setShapes([]);
      setSelectedShapeId(null);
    }
  }

  // 3. Load layout from JSON
  const loadLayout = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      setShapes(parsed.shapes || []);
      setSelectedShapeId(null);
    } catch (e) {
      setShapes([]);
      setSelectedShapeId(null);
    }
  };

  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const floorId = e.target.value;
    setSelectedFloorId(floorId);
    const selected = floors.find((f) => f.id === floorId);
    if (selected) {
      loadLayout(selected.layoutJson);
    }
  };

  const handleUpdateShapes = (newShapes: CanvasShape[]) => {
    setShapes(newShapes);
  };

  const handleUpdateSingleShape = (updatedShape: CanvasShape) => {
    const updated = shapes.map((s) => (s.id === updatedShape.id ? updatedShape : s));
    setShapes(updated);
  };

  const handleDeleteShape = (id: string) => {
    const filtered = shapes.filter((s) => s.id !== id);
    setShapes(filtered);
    setSelectedShapeId(null);
    toast.success("Space removed from canvas");
  };

  const handleSaveLayout = async () => {
    if (!selectedFloorId) return;
    setSaving(true);
    const layoutJson = JSON.stringify({ width: 750, height: 500, shapes });
    const res = await saveFloorLayoutAction(selectedFloorId, layoutJson);
    setSaving(false);
    if (res.success) {
      toast.success("Floor layout saved & synced to space inventories!");
      // reload floors list to update cache
      const dbFloors = await getBranchFloorsAction(selectedBranchId);
      setFloors(dbFloors);
    } else {
      toast.error("Failed to save layout");
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName || !selectedBranchId || selectedBranchId === "all") return;
    setCreatingFloor(true);
    const res = await createFloorAction(selectedBranchId, newFloorName);
    setCreatingFloor(false);
    if (res.success && res.floor) {
      toast.success("New floor created!");
      setNewFloorName("");
      loadFloors();
    } else {
      toast.error("Failed to create floor");
    }
  };

  const selectedShape = shapes.find((s) => s.id === selectedShapeId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Interactive Floor Builder
          </h2>
          <p className="text-xs text-neutral">
            Design floor plans, drag-and-drop seating inventory, and sync rates instantly with booking portal.
          </p>
        </div>
        
        {selectedFloorId && (
          <Button
            onClick={handleSaveLayout}
            disabled={saving}
            className="bg-brand-400 text-white hover:bg-brand-300 transition-colors h-9 text-xs"
          >
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save & Sync Layout
          </Button>
        )}
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar Palette */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-brand-600 bg-brand-700 p-4">
            <ShapeSidebar />
          </Card>
          
          {/* Create Floor Mini-Form */}
          {selectedBranchId && selectedBranchId !== "all" && (
            <Card className="border-brand-600 bg-brand-700 p-4 space-y-3">
              <span className="block font-heading text-xs font-bold text-slate-200">
                Create New Floor
              </span>
              <form onSubmit={handleCreateFloor} className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Floor 3 - Tech Zone"
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={creatingFloor}
                  className="w-full text-xs h-8 bg-brand-400 text-white hover:bg-brand-300"
                >
                  <Plus className="size-3.5 mr-1" />
                  Add Floor
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Center Drawing Canvas & Top Controls */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-brand-600 bg-brand-700 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-brand-600 pb-3 mb-4">
              {/* Floor Switcher */}
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-brand-400" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral">Active Layout:</span>
                  {floors.length === 0 ? (
                    <span className="text-xs text-danger font-semibold">No Floors Found</span>
                  ) : (
                    <select
                      value={selectedFloorId}
                      onChange={handleFloorChange}
                      className="rounded border border-brand-600 bg-brand-850 px-2 py-1 text-xs font-semibold text-slate-200 focus:border-brand-400 focus:outline-none cursor-pointer"
                    >
                      {floors.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-brand-600 text-slate-300 h-6">
                  Desks: {shapes.filter((s) => s.type === "DESK").length}
                </Badge>
                <Badge variant="outline" className="border-brand-600 text-slate-300 h-6">
                  Hotdesks: {shapes.filter((s) => s.type === "HOT_DESK").length}
                </Badge>
                <Badge variant="outline" className="border-brand-600 text-slate-300 h-6">
                  Rooms: {shapes.filter((s) => s.type === "MEETING_ROOM").length}
                </Badge>
              </div>
            </div>

            {/* Drawing Canvas */}
            {selectedFloorId ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                  <FloorCanvas
                    shapes={shapes}
                    selectedId={selectedShapeId}
                    onSelectShape={setSelectedShapeId}
                    onUpdateShapes={handleUpdateShapes}
                  />
                </div>
                
                {/* Properties inspector panel */}
                <div className="lg:col-span-1">
                  <PropertiesPanel
                    selectedShape={selectedShape}
                    onUpdateShape={handleUpdateSingleShape}
                    onDeleteShape={handleDeleteShape}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center text-center">
                <Building2 className="size-12 text-brand-600 mb-3" />
                <span className="text-sm font-semibold text-slate-300">No Floor Selected</span>
                <span className="text-xs text-neutral max-w-sm mt-1 leading-relaxed">
                  Select a specific coworking branch in the sidebar, then use the "Create New Floor" form to add your first layout design.
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
