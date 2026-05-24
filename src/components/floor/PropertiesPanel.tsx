"use client";

import React, { useEffect, useState } from "react";
import { CanvasShape } from "./FloorCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Wrench } from "lucide-react";

interface PropertiesPanelProps {
  selectedShape: CanvasShape | null;
  onUpdateShape: (updated: CanvasShape) => void;
  onDeleteShape: (id: string) => void;
}

const AMENITY_OPTIONS = [
  "Wifi",
  "AC",
  "Ergonomic Chair",
  "Whiteboard",
  "Projector",
  "Tea/Coffee",
  "Monitor",
  "Acoustic Padding",
  "Power Outlets",
];

export default function PropertiesPanel({
  selectedShape,
  onUpdateShape,
  onDeleteShape,
}: PropertiesPanelProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [baseRate, setBaseRate] = useState(100);
  const [amenities, setAmenities] = useState<string[]>([]);

  // Update local states when selected shape changes
  useEffect(() => {
    if (selectedShape) {
      setName(selectedShape.name);
      setCapacity(selectedShape.capacity);
      setBaseRate(selectedShape.baseRate);
      setAmenities(selectedShape.amenities || []);
    }
  }, [selectedShape]);

  if (!selectedShape) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-brand-600 bg-brand-800/30 p-6 text-center">
        <Wrench className="size-8 text-brand-600 mb-2.5" />
        <span className="text-xs font-semibold text-slate-400">Space Inspector</span>
        <span className="text-[10px] text-neutral max-w-[180px] mt-1 leading-relaxed">
          Select any element on the floor layout canvas to adjust its properties.
        </span>
      </div>
    );
  }

  const handleFieldChange = (field: keyof CanvasShape, value: any) => {
    onUpdateShape({
      ...selectedShape,
      [field]: value,
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    let updated: string[];
    if (amenities.includes(amenity)) {
      updated = amenities.filter((a) => a !== amenity);
    } else {
      updated = [...amenities, amenity];
    }
    setAmenities(updated);
    handleFieldChange("amenities", updated);
  };

  return (
    <div className="rounded-xl border border-brand-600 bg-brand-700 p-5 space-y-4">
      <div>
        <h4 className="font-heading text-xs font-bold text-slate-200">Space Inspector</h4>
        <span className="text-[10px] text-neutral block mt-0.5">
          Type: <strong className="text-brand-400 uppercase">{selectedShape.type.replace("_", " ")}</strong>
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="space-name" className="text-xs text-slate-300">Space Name / Label</Label>
          <Input
            id="space-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              handleFieldChange("name", e.target.value);
            }}
            className="h-8 border-brand-600 bg-brand-800 text-slate-100 placeholder:text-neutral focus:border-brand-400 text-xs"
          />
        </div>

        {/* Capacity & Rates row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="space-capacity" className="text-xs text-slate-300">Max Capacity</Label>
            <Input
              id="space-capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => {
                const val = Number(e.target.value) || 1;
                setCapacity(val);
                handleFieldChange("capacity", val);
              }}
              className="h-8 border-brand-600 bg-brand-800 text-slate-100 focus:border-brand-400 text-xs"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="space-rate" className="text-xs text-slate-300">Hourly Rate (₹)</Label>
            <Input
              id="space-rate"
              type="number"
              min={0}
              value={baseRate}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setBaseRate(val);
                handleFieldChange("baseRate", val);
              }}
              className="h-8 border-brand-600 bg-brand-800 text-slate-100 focus:border-brand-400 text-xs"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs text-slate-300 block mb-1">Included Amenities</Label>
          <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1 border border-brand-600 bg-brand-800 p-2 rounded-lg">
            {AMENITY_OPTIONS.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(opt)}
                  onChange={() => handleAmenityToggle(opt)}
                  className="rounded border-brand-600 bg-brand-700 text-brand-400 focus:ring-brand-400 size-3"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-brand-600/50 flex gap-2">
          <Button
            onClick={() => onDeleteShape(selectedShape.id)}
            variant="destructive"
            className="w-full text-[11px] h-8 bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger-foreground border-transparent"
          >
            <Trash2 className="size-3.5 mr-1.5" />
            Delete Space
          </Button>
        </div>
      </div>
    </div>
  );
}
