"use client";

import React, { useRef, useEffect, useState } from "react";
import SignaturePad from "signature_pad";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle } from "lucide-react";

interface SignatureStepProps {
  onSave: (signatureDataUrl: string) => void;
  onClear: () => void;
  savedSignature?: string;
}

export default function SignatureStep({ onSave, onClear, savedSignature }: SignatureStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Fix canvas scaling for high DPI screens
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);

      const pad = new SignaturePad(canvas, {
        backgroundColor: "rgba(0, 0, 0, 0)", // transparent
        penColor: "#f8fafc", // white pen
      });

      pad.addEventListener("endStroke", () => {
        setTimeout(() => {
          setHasSignature(true);
        }, 0);
        onSave(pad.toDataURL());
      });

      padRef.current = pad;

      // Pre-load signature if it already exists
      if (savedSignature) {
        pad.fromDataURL(savedSignature);
        setTimeout(() => {
          setHasSignature(true);
        }, 0);
      }

      return () => {
        pad.off();
      };
    }
  }, []); // Mount-only to prevent lag & loops on stroke end

  // Support external clearing (e.g. from parent wizard)
  useEffect(() => {
    if (padRef.current && !savedSignature) {
      padRef.current.clear();
      setHasSignature(false);
    }
  }, [savedSignature]);

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
      setHasSignature(false);
      onClear();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-xs font-bold text-slate-200 uppercase tracking-wider">
          Legal Agreement Signature
        </h3>
        <p className="text-[11px] text-neutral">
          Please sign inside the canvas below to execute the coworking space license contract.
        </p>
      </div>

      <div className="relative rounded-xl border border-brand-600 bg-brand-850 h-44 overflow-hidden flex flex-col justify-end">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />
        
        {/* Helper info on canvas */}
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[11px] text-neutral/50 italic">
            Draw your signature here
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          className="text-xs h-8 text-danger border-danger/35 hover:bg-danger/5"
        >
          <Trash2 className="size-3.5 mr-1" />
          Clear Signature
        </Button>
        {hasSignature && (
          <div className="flex items-center gap-1 text-success text-[11px] font-semibold ml-auto">
            <CheckCircle className="size-4" />
            Signature Recorded
          </div>
        )}
      </div>
    </div>
  );
}
