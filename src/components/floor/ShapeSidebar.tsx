"use client";

import React from "react";
import { Building2, Laptop, Monitor, PhoneCall, Users } from "lucide-react";

interface ShapePaletteItem {
  type: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  colorClass: string;
}

interface ShapeSidebarProps {
  onAddShape?: (type: string) => void;
}

export default function ShapeSidebar({ onAddShape }: ShapeSidebarProps) {
  const shapes: ShapePaletteItem[] = [
    {
      type: "MEETING_ROOM",
      title: "Conference Room",
      desc: "For client meetings & boards",
      icon: <Users className="size-4" />,
      colorClass: "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:border-blue-500",
    },
    {
      type: "PRIVATE_OFFICE",
      title: "Private Office",
      desc: "Secure lockable suite",
      icon: <Building2 className="size-4" />,
      colorClass: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:border-indigo-500",
    },
    {
      type: "PHONE_BOOTH",
      title: "Phone Booth",
      desc: "Soundproof private calls",
      icon: <PhoneCall className="size-4" />,
      colorClass: "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:border-purple-500",
    },
    {
      type: "DESK",
      title: "Dedicated Desk",
      desc: "Assigned personal monitor desk",
      icon: <Monitor className="size-4" />,
      colorClass: "bg-slate-500/15 border-slate-500/30 text-slate-300 hover:border-slate-300",
    },
    {
      type: "HOT_DESK",
      title: "Hotdesk Zone",
      desc: "Open flex desk layout seating",
      icon: <Laptop className="size-4" />,
      colorClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-500",
    },
  ];

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("spaceType", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-heading text-xs font-bold text-slate-200">Space Palette</h4>
        <p className="text-[10px] text-neutral mt-0.5">
          Click any element to add, or drag and drop onto the layout canvas.
        </p>
      </div>

      <div className="space-y-2.5">
        {shapes.map((shape) => (
          <div
            key={shape.type}
            draggable
            onDragStart={(e) => handleDragStart(e, shape.type)}
            onClick={() => onAddShape?.(shape.type)}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 select-none ${shape.colorClass}`}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-900/50 border border-brand-600/30">
              {shape.icon}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold">{shape.title}</span>
              <span className="block text-[9px] text-neutral truncate mt-0.5">
                {shape.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-brand-900/40 border border-brand-600/50 p-3 text-[10px] text-neutral leading-relaxed">
        💡 <strong>Pro Tip:</strong> Snap to grid (10px spacing) is enabled by default. Click on any canvas element to edit properties, resize, or delete.
      </div>
    </div>
  );
}
