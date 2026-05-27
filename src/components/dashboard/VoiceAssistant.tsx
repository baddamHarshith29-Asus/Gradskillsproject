"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Send, Volume2, VolumeX, Terminal, X, Sparkles, Command, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VoiceAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const textEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech APIs
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          setErrorMsg(null);
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
          processCommand(resultText);
        };

        rec.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          if (event.error === "not-allowed") {
            setErrorMsg("Microphone permission denied. Switch to manual typing!");
          } else {
            setErrorMsg(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Scroll to bottom of terminal output
  useEffect(() => {
    if (textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [typewriterText, response, errorMsg]);

  // Typewriter effect logic
  useEffect(() => {
    if (!response) return;
    setTypewriterText("");
    let i = 0;
    const interval = setInterval(() => {
      setTypewriterText((prev) => prev + response.charAt(i));
      i++;
      if (i >= response.length) {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [response]);

  const speakText = (text: string) => {
    if (isMuted || !synthRef.current) return;
    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      synthRef.current.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis Error:", e);
    }
  };

  const processCommand = (command: string) => {
    setIsThinking(true);
    setResponse("");
    const lower = command.toLowerCase().trim();

    setTimeout(() => {
      let reply = "";
      let redirect = "";

      // 1. Available rooms / desks
      if (
        lower.includes("room") ||
        lower.includes("available") ||
        lower.includes("booking") ||
        lower.includes("empty") ||
        lower.includes("space")
      ) {
        reply =
          "CoNexus intelligence reports there are currently 12 available premium workspaces across all branches. Bangalore has 6 available hotdesks including the newly pre-seeded Boardroom Loft on Floor 3. Mumbai Tech Park has 4 open meeting spaces. Would you like me to open the booking page?";
      }
      // 2. Navigation
      else if (lower.includes("booking") || lower.includes("map") || lower.includes("schedule") || lower.includes("calendar")) {
        reply = "Affirmative. Loading the interactive smart booking portal floor plans...";
        redirect = "/booking";
      } else if (lower.includes("ticket") || lower.includes("issue") || lower.includes("support") || lower.includes("broken")) {
        reply = "Opening the Support Tickets registry. There are 3 open branch tickets: One high priority AC repair request in Mumbai, and 2 general requests in Goa.";
        redirect = "/tickets";
      } else if (lower.includes("billing") || lower.includes("invoice") || lower.includes("finance") || lower.includes("money")) {
        reply = "Loading the branch billing accounts ledger and invoice registers...";
        redirect = "/finance";
      } else if (lower.includes("visitor") || lower.includes("kiosk") || lower.includes("guest")) {
        reply = "Launching Guest check-in simulator registers. Please check the public facing tablet preview.";
        redirect = "/visitor";
      } else if (lower.includes("floor") || lower.includes("builder") || lower.includes("designer")) {
        reply = "Switching workspace views to the visual floor plan drag and drop designer module.";
        redirect = "/floor-builder";
      } else if (lower.includes("home") || lower.includes("dashboard") || lower.includes("branch")) {
        reply = "Returning branch status monitors to the main corporate overview workspace.";
        redirect = "/";
      }
      // 3. Occupancy
      else if (lower.includes("occupancy") || lower.includes("utilization") || lower.includes("capacity") || lower.includes("busy") || lower.includes("crowded")) {
        reply =
          "Branch Occupancy index: Downtown Innovation Bangalore is operating at 80% capacity today. Tech Park West Mumbai is at 62%, and Goa Sunset Incubator is at a relaxed 35% utilization. Dynamic prices are adjusted automatically.";
      }
      // 4. Hello / Help
      else if (lower.includes("hi") || lower.includes("hello") || lower.includes("help") || lower.includes("what") || lower.includes("conexus")) {
        reply =
          "Greetings! I am the CoNexus Edge-AI Voice Agent. You can speak commands like 'Which spaces are available?', 'Check community occupancy', 'Check branch tickets', or instruct me to navigate, e.g. 'Navigate to tickets' or 'Open smart booking portal'. How can I assist your team today?";
      } else {
        reply = `Command received: "${command}". I parsed this command using our local NLP parser, but it matches no predefined branch triggers. Say 'help' to review operational commands.`;
      }

      setResponse(reply);
      speakText(reply);
      setIsThinking(false);

      if (redirect) {
        setTimeout(() => {
          router.push(redirect);
        }, 1500);
      }
    }, 850);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg("Web Speech Recognition API is unsupported in this browser environment. Please use manual console typing below!");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      recognitionRef.current.stop();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setTranscript(inputVal);
    processCommand(inputVal);
    setInputVal("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600 scale-95"
            : "bg-brand-400 hover:bg-brand-300 hover:scale-105"
        }`}
      >
        {/* Radar pulses when assistant is listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-75"></span>
            <span className="absolute -inset-2 rounded-full border border-brand-400/50 animate-pulse"></span>
          </>
        )}
        {isOpen ? <X className="size-6" /> : <Sparkles className="size-6 animate-pulse" />}
      </button>

      {/* Main Glassmorphic Assistant Card */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 rounded-2xl border border-brand-500/40 bg-brand-850/90 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
          {/* Header */}
          <div className="bg-brand-900/60 p-4 border-b border-brand-600/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-brand-400 animate-pulse" />
              <div>
                <span className="font-heading text-xs font-bold text-slate-100 flex items-center gap-1">
                  CoNexus NLP Assistant
                  <Badge className="text-[8px] bg-brand-400/20 border border-brand-400/30 text-brand-300 hover:bg-brand-400/30 rounded px-1 font-mono uppercase font-black h-4">
                    Edge AI
                  </Badge>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Simulated Speech Navigation Engine</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Mute toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (synthRef.current) synthRef.current.cancel();
                }}
                className="p-1.5 rounded hover:bg-brand-850 text-slate-300 transition-colors"
                title={isMuted ? "Unmute synthesis output" : "Mute synthesis output"}
              >
                {isMuted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-brand-850 text-slate-400 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Screen Console */}
          <div className="flex-1 p-4 h-64 overflow-y-auto space-y-3 font-mono text-[11px] bg-brand-950/70 text-slate-300 flex flex-col justify-end">
            <div className="text-brand-400 text-[10px] opacity-75 flex items-center gap-1.5 select-none border-b border-brand-600/20 pb-1.5">
              <Command className="size-3" />
              <span>CoNexus Terminal Environment loaded.</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-2 flex flex-col justify-end">
              {transcript && (
                <div className="text-right">
                  <span className="bg-brand-700/50 border border-brand-600/40 rounded-lg px-2.5 py-1.5 inline-block text-slate-100 text-left max-w-[85%]">
                    🎙️ <span className="font-semibold">User:</span> {transcript}
                  </span>
                </div>
              )}

              {isThinking && (
                <div className="text-left flex items-center gap-2 text-brand-300 animate-pulse py-1">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Processing natural language parameters...</span>
                </div>
              )}

              {typewriterText && (
                <div className="text-left">
                  <div className="bg-brand-900/60 border border-brand-700/60 rounded-lg px-2.5 py-1.5 inline-block text-left text-brand-300 max-w-[85%] leading-relaxed shadow-md">
                    <span className="font-extrabold text-white block mb-0.5">🤖 CoNexus:</span>
                    {typewriterText}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-2 rounded text-[10px] leading-relaxed">
                  ⚠️ <strong>Console Note:</strong> {errorMsg}
                </div>
              )}
              
              <div ref={textEndRef} />
            </div>
          </div>

          {/* Control Bar & Microphone Trigger */}
          <div className="p-4 border-t border-brand-600/40 bg-brand-900/40 space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <Button
                onClick={isListening ? stopListening : startListening}
                className={`w-full py-2.5 h-10 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-xs text-white ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20"
                    : "bg-brand-400 hover:bg-brand-300 shadow-md shadow-brand-400/20"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="size-4 animate-bounce" />
                    Listening... Stop
                  </>
                ) : (
                  <>
                    <Mic className="size-4" />
                    Start Voice Command
                  </>
                )}
              </Button>
            </div>

            {/* Quick text input fallback */}
            <form onSubmit={handleManualSubmit} className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Terminal className="absolute left-2.5 top-2.5 size-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type commands e.g. help, spaces..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full bg-brand-900/60 text-slate-100 text-xs placeholder:text-slate-400 pl-8 pr-3 py-2 rounded-md border border-brand-600/50 focus:border-brand-400 focus:outline-none h-8.5 font-mono"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-8.5 px-3 bg-brand-600 border border-brand-500 hover:bg-brand-500 text-white rounded-md flex items-center justify-center shrink-0"
              >
                <Send className="size-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
