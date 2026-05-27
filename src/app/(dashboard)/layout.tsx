import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import VoiceAssistant from "@/components/dashboard/VoiceAssistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Page Content wrapper */}
      <div className="pl-60 pt-16 min-h-screen flex flex-col">
        {/* Topbar */}
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating AI Voice Command Portal */}
      <VoiceAssistant />
    </div>
  );
}
