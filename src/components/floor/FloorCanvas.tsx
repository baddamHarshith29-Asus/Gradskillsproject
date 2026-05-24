"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Group, Text, Transformer } from "react-konva";

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

interface FloorCanvasProps {
  shapes: CanvasShape[];
  selectedId: string | null;
  onSelectShape: (id: string | null) => void;
  onUpdateShapes: (newShapes: CanvasShape[]) => void;
}

export default function FloorCanvas({
  shapes,
  selectedId,
  onSelectShape,
  onUpdateShapes,
}: FloorCanvasProps) {
  const trRef = useRef<any>(null);
  const shapeRefs = useRef<Map<string, any>>(new Map());
  const [stageDimensions, setStageDimensions] = useState({ width: 750, height: 500 });

  // Snap to 10px grid
  const snapToGrid = (val: number) => {
    return Math.round(val / 10) * 10;
  };

  // Attach transformer to selected shape
  useEffect(() => {
    if (trRef.current) {
      if (selectedId) {
        const node = shapeRefs.current.get(selectedId);
        if (node) {
          trRef.current.nodes([node]);
          trRef.current.getLayer().batchDraw();
          return;
        }
      }
      trRef.current.nodes([]);
    }
  }, [selectedId, shapes]);

  const handleStageClick = (e: any) => {
    // Click on empty space deselects shape
    if (e.target === e.target.getStage()) {
      onSelectShape(null);
    }
  };

  // Handle Dragging Shapes
  const handleDragEnd = (id: string, e: any) => {
    const x = snapToGrid(e.target.x());
    const y = snapToGrid(e.target.y());
    
    // Snap visual element
    e.target.x(x);
    e.target.y(y);

    const updated = shapes.map((s) => {
      if (s.id === id) {
        return { ...s, x, y };
      }
      return s;
    });
    onUpdateShapes(updated);
  };

  // Handle Resizing Shapes
  const handleTransformEnd = (id: string, e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scales to 1 and calculate new snapped dimensions
    node.scaleX(1);
    node.scaleY(1);

    const width = snapToGrid(Math.max(20, node.width() * scaleX));
    const height = snapToGrid(Math.max(20, node.height() * scaleY));
    const x = snapToGrid(node.x());
    const y = snapToGrid(node.y());

    const updated = shapes.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          x,
          y,
          width,
          height,
        };
      }
      return s;
    });
    onUpdateShapes(updated);
  };

  // Handle drops from sidebar palette
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("spaceType");
    if (!type) return;

    // Get drop offset coordinates relative to stage container
    const container = e.currentTarget.getBoundingClientRect();
    const dropX = snapToGrid(e.clientX - container.left);
    const dropY = snapToGrid(e.clientY - container.top);

    // Default dimensions and pricing by type
    let width = 60;
    let height = 45;
    let baseRate = 100;
    let namePrefix = "Desk";

    if (type === "MEETING_ROOM") {
      width = 120;
      height = 100;
      baseRate = 600;
      namePrefix = "Meeting Room";
    } else if (type === "HOT_DESK") {
      width = 100;
      height = 70;
      baseRate = 50;
      namePrefix = "Hotdesk Area";
    } else if (type === "PRIVATE_OFFICE") {
      width = 140;
      height = 110;
      baseRate = 1200;
      namePrefix = "Private Office";
    } else if (type === "PHONE_BOOTH") {
      width = 50;
      height = 50;
      baseRate = 150;
      namePrefix = "Phone Booth";
    }

    const newId = `sp-${type.toLowerCase()}-${Math.random().toString(36).substring(7)}`;
    const newShape: CanvasShape = {
      id: newId,
      type,
      x: dropX,
      y: dropY,
      width,
      height,
      name: `${namePrefix} ${shapes.length + 1}`,
      capacity: type === "MEETING_ROOM" ? 8 : type === "PRIVATE_OFFICE" ? 4 : 1,
      baseRate,
      amenities: ["Wifi"],
    };

    onUpdateShapes([...shapes, newShape]);
    onSelectShape(newId);
  };

  const getShapeColor = (type: string, isSelected: boolean) => {
    if (isSelected) return "#3b82f6"; // brand electric blue
    switch (type) {
      case "MEETING_ROOM":
        return "#1e3a8a"; // deep blue
      case "PRIVATE_OFFICE":
        return "#312e81"; // deep indigo
      case "PHONE_BOOTH":
        return "#581c87"; // deep purple
      case "HOT_DESK":
        return "#064e3b"; // emerald green
      default:
        return "#1f2937"; // slate
    }
  };

  const getShapeBorderColor = (type: string, isSelected: boolean) => {
    if (isSelected) return "#60a5fa";
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
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative rounded-xl border border-brand-600 bg-brand-800 p-1 select-none overflow-hidden"
      style={{ width: "100%", height: "510px" }}
    >
      <Stage
        width={stageDimensions.width}
        height={stageDimensions.height}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
        className="cursor-crosshair"
      >
        <Layer>
          {/* Grid lines in background */}
          {renderGrid()}

          {/* Render Shapes */}
          {shapes.map((shape) => {
            const isSelected = shape.id === selectedId;
            return (
              <Group
                key={shape.id}
                id={shape.id}
                x={shape.x}
                y={shape.y}
                draggable
                onDragEnd={(e) => handleDragEnd(shape.id, e)}
                onTransformEnd={(e) => handleTransformEnd(shape.id, e)}
                onClick={() => onSelectShape(shape.id)}
                onTouchStart={() => onSelectShape(shape.id)}
                ref={(node) => {
                  if (node) {
                    shapeRefs.current.set(shape.id, node);
                  } else {
                    shapeRefs.current.delete(shape.id);
                  }
                }}
              >
                {/* Main Space Rect */}
                <Rect
                  width={shape.width}
                  height={shape.height}
                  fill={getShapeColor(shape.type, isSelected)}
                  stroke={getShapeBorderColor(shape.type, isSelected)}
                  strokeWidth={2}
                  cornerRadius={6}
                  opacity={isSelected ? 0.95 : 0.8}
                />
                
                {/* Space text labels */}
                <Text
                  text={shape.name}
                  fontSize={10}
                  fontFamily="Inter"
                  fill="#f8fafc"
                  width={shape.width}
                  height={shape.height}
                  align="center"
                  verticalAlign="middle"
                  padding={5}
                  ellipsis
                  listening={false}
                />
                
                {/* Tiny badge of base rate */}
                <Text
                  text={`₹${shape.baseRate}/h`}
                  fontSize={8}
                  fontFamily="JetBrains Mono"
                  fill="#94a3b8"
                  x={5}
                  y={shape.height - 12}
                  listening={false}
                />
              </Group>
            );
          })}

          {/* Active Transformer Bounding Box */}
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit minimum dimensions
              if (newBox.width < 30 || newBox.height < 30) {
                return oldBox;
              }
              return newBox;
            }}
            anchorFill="#60a5fa"
            anchorStroke="#3b82f6"
            anchorSize={6}
            borderStroke="#3b82f6"
            borderStrokeWidth={1.5}
            rotateEnabled={false}
          />
        </Layer>
      </Stage>
      
      {/* Visual Canvas Dimensions tag */}
      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-neutral bg-brand-900/80 px-2 py-0.5 rounded border border-brand-600">
        Grid Snap: 10px · Canvas: {stageDimensions.width}×{stageDimensions.height}px
      </div>
    </div>
  );
}
