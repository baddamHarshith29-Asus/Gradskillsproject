"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Group, Text } from "react-konva";

export interface CanvasShape {
  id: string;
  type: string; // DESK | HOT_DESK | PRIVATE_OFFICE | MEETING_ROOM | PHONE_BOOTH
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  capacity: number;
  baseRate: number;
  amenities: string[];
}

interface BookingFloorMapProps {
  shapes: CanvasShape[];
  occupiedSpaceIds: Set<string>;
  spaceOccupantNames: Record<string, string>;
  onSelectSpace: (space: CanvasShape) => void;
}

export default function BookingFloorMap({
  shapes,
  occupiedSpaceIds,
  spaceOccupantNames,
  onSelectSpace,
}: BookingFloorMapProps) {
  const [stageDimensions] = useState({ width: 750, height: 500 });

  const getShapeColor = (type: string, isOccupied: boolean) => {
    if (isOccupied) return "#451a1a"; // Dark crimson for booked spaces
    switch (type) {
      case "MEETING_ROOM":
        return "#1e3b8a font-medium"; // Deep blue
      case "PRIVATE_OFFICE":
        return "#312e81"; // Deep indigo
      case "PHONE_BOOTH":
        return "#581c87"; // Deep purple
      case "HOT_DESK":
        return "#064e3b"; // Emerald green
      default:
        return "#1f2937"; // Slate grey
    }
  };

  const getShapeBorderColor = (type: string, isOccupied: boolean) => {
    if (isOccupied) return "#ef4444"; // Bright red border for booked spaces
    switch (type) {
      case "MEETING_ROOM":
        return "#3b82f6";
      case "PRIVATE_OFFICE":
        return "#4f46e5";
      case "PHONE_BOOTH":
        return "#8b5cf6";
      case "HOT_DESK":
        return "#10b981";
      default:
        return "#4b5563";
    }
  };

  // Render Grid Lines background
  const renderGrid = () => {
    const gridLines = [];
    const spacing = 20;
    
    // Vertical lines
    for (let i = 0; i < stageDimensions.width / spacing; i++) {
      gridLines.push(
        <Rect
          key={`v-${i}`}
          x={i * spacing}
          y={0}
          width={1}
          height={stageDimensions.height}
          fill="#1e2a3b"
          opacity={0.3}
          listening={false}
        />
      );
    }
    // Horizontal lines
    for (let i = 0; i < stageDimensions.height / spacing; i++) {
      gridLines.push(
        <Rect
          key={`h-${i}`}
          x={0}
          y={i * spacing}
          width={stageDimensions.width}
          height={1}
          fill="#1e2a3b"
          opacity={0.3}
          listening={false}
        />
      );
    }
    return gridLines;
  };

  return (
    <div
      className="relative rounded-xl border border-brand-600 bg-brand-800 p-1 select-none overflow-hidden"
      style={{ width: "100%", height: "510px" }}
    >
      <Stage
        width={stageDimensions.width}
        height={stageDimensions.height}
        className="mx-auto"
      >
        <Layer>
          {/* Grid lines */}
          {renderGrid()}

          {/* Render Spaces */}
          {shapes.map((shape) => {
            const isOccupied = occupiedSpaceIds.has(shape.id);
            const occupant = spaceOccupantNames[shape.id] || "";

            return (
              <Group
                key={shape.id}
                x={shape.x}
                y={shape.y}
                onClick={() => {
                  if (!isOccupied) {
                    onSelectSpace(shape);
                  }
                }}
                onTouchStart={() => {
                  if (!isOccupied) {
                    onSelectSpace(shape);
                  }
                }}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (stage) {
                    stage.container().style.cursor = isOccupied ? "not-allowed" : "pointer";
                  }
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (stage) {
                    stage.container().style.cursor = "default";
                  }
                }}
              >
                {/* Main Rect */}
                <Rect
                  width={shape.width}
                  height={shape.height}
                  fill={getShapeColor(shape.type, isOccupied)}
                  stroke={getShapeBorderColor(shape.type, isOccupied)}
                  strokeWidth={2}
                  cornerRadius={6}
                  opacity={0.85}
                />

                {/* Name Label */}
                <Text
                  text={shape.name}
                  fontSize={10}
                  fontFamily="Inter"
                  fill="#f8fafc"
                  width={shape.width}
                  height={shape.height - 15}
                  align="center"
                  verticalAlign="middle"
                  padding={5}
                  ellipsis
                  listening={false}
                />

                {/* Occupancy details */}
                <Text
                  text={isOccupied ? `Occupied: ${occupant}` : `Available · ₹${shape.baseRate}/h`}
                  fontSize={8}
                  fontFamily="Inter"
                  fill={isOccupied ? "#fca5a5" : "#94a3b8"}
                  width={shape.width}
                  x={0}
                  y={shape.height - 12}
                  align="center"
                  listening={false}
                  ellipsis
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      <div className="absolute bottom-2 right-3 flex gap-4 text-[10px] bg-brand-900/80 px-3 py-1 rounded border border-brand-600">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-emerald-500"></div>
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-red-500"></div>
          <span className="text-slate-300">Reserved / Occupied</span>
        </div>
      </div>
    </div>
  );
}
