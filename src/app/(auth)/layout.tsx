import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-12 bg-brand-900 text-foreground font-sans overflow-x-hidden">
      {/* Left Pane: Immersive Coworking Backdrop */}
      <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 overflow-hidden border-r border-brand-600/30">
        {/* Coworking space interior backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-105"
          style={{ 
            backgroundImage: "url('/coworking_login_bg.png')",
          }}
        />
        {/* Midnight navy luxury overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950 via-brand-950/80 to-brand-900/35" />
        
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-400/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400 text-white font-extrabold text-2xl shadow-xl shadow-brand-400/20 border border-brand-300/25">
            C
          </div>
          <div>
            <span className="font-heading text-xl font-black tracking-wider text-slate-100 uppercase">
              CoNexus
            </span>
            <span className="text-[10px] block font-semibold text-brand-400 tracking-widest uppercase">
              Operating System
            </span>
          </div>
        </div>

        {/* Hero Copy and Feature Highlights */}
        <div className="relative z-10 my-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/15 px-4 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400"></span>
            </span>
            Premium Co-Working Hub Platform
          </div>
          
          <h1 className="font-heading text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Seamlessly Manage Your Smart Hub with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-blue-400">Integrated Intelligence</span>
          </h1>
          
          <p className="text-slate-300 text-base leading-relaxed font-light">
            Empower community managers, operators, and members with dynamic space planning, responsive seat maps, high-performance database management, and immersive simulated NLP voice assistant services.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="p-4 rounded-xl border border-brand-600/30 bg-brand-800/40 backdrop-blur-sm shadow-md hover:border-brand-500/40 transition-colors">
              <div className="text-brand-400 font-bold mb-1 flex items-center gap-2 text-sm">
                <span>🎙️</span> AI Voice Assistant
              </div>
              <p className="text-xs text-slate-300">Book boardrooms, monitor check-ins, or query hub status naturally using voice recognition command sequences.</p>
            </div>
            <div className="p-4 rounded-xl border border-brand-600/30 bg-brand-800/40 backdrop-blur-sm shadow-md hover:border-brand-500/40 transition-colors">
              <div className="text-blue-400 font-bold mb-1 flex items-center gap-2 text-sm">
                <span>🗺️</span> Interactive Floor Maps
              </div>
              <p className="text-xs text-slate-300">Custom dynamic canvas layout grids allowing rapid spatial planning, live rates inspection, and seat allocation tracking.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral border-t border-brand-800/60 pt-6">
          <span>© 2026 CoNexus Operating System. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Core Cloud Engine Active
          </span>
        </div>
      </div>

      {/* Right Pane: Login Form Container */}
      <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center px-4 py-8 sm:px-12 xl:px-16 bg-brand-900 overflow-y-auto">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

