import { create } from "zustand";

export interface SimulatedNotification {
  id: string;
  type: "whatsapp" | "email" | "system";
  title: string;
  body: string;
  timestamp: string;
  recipient: string;
}

interface BranchStore {
  selectedBranchId: string;
  selectedBranchName: string;
  setBranch: (id: string, name: string) => void;
  // Simulated Notification Logs
  notifications: SimulatedNotification[];
  addNotification: (
    type: "whatsapp" | "email" | "system",
    title: string,
    body: string,
    recipient: string
  ) => void;
  clearNotifications: () => void;
}

export const useBranchStore = create<BranchStore>((set) => ({
  selectedBranchId: "all",
  selectedBranchName: "All Branches",
  setBranch: (id, name) => set({ selectedBranchId: id, selectedBranchName: name }),
  
  notifications: [
    {
      id: "init-1",
      type: "system",
      title: "System Seeding Complete",
      body: "Database initialized with branches, floor layouts, clients, and SLA tickets.",
      timestamp: new Date().toLocaleTimeString(),
      recipient: "CoNexus OS",
    },
    {
      id: "init-2",
      type: "whatsapp",
      title: "WhatsApp Engine Ready",
      body: "CoNexus WhatsApp virtual gateway connected. Simulating live webhook dispatch.",
      timestamp: new Date().toLocaleTimeString(),
      recipient: "CoNexus Engine",
    }
  ],
  
  addNotification: (type, title, body, recipient) =>
    set((state) => ({
      notifications: [
        {
          id: Math.random().toString(36).substring(7),
          type,
          title,
          body,
          timestamp: new Date().toLocaleTimeString(),
          recipient,
        },
        ...state.notifications,
      ],
    })),
    
  clearNotifications: () => set({ notifications: [] }),
}));
