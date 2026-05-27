"use client";

import React, { useEffect, useState } from "react";
import { useBranchStore } from "@/lib/store";
import { getTicketsAction, createTicketAction, updateTicketStatusAction, getClientsAction } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Ticket as TicketIcon,
  Plus,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Play,
  User,
  Tags,
  Filter,
  Loader2,
  MessageSquare,
  Send,
  X
} from "lucide-react";

const COLUMNS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"];
const CATEGORIES = ["ALL", "Wifi & Internet", "Facility & AC", "Printing", "Billing & Invoicing", "Access Cards", "Events"];

// Component to handle dynamic SLA ticking
function SLATimer({ createdAtStr, resolvedAtStr, status }: { createdAtStr: string; resolvedAtStr: string | null; status: string }) {
  const [elapsedText, setElapsedText] = useState("");
  const [isBreached, setIsBreached] = useState(false);

  useEffect(() => {
    const calculateElapsed = () => {
      const createdTime = new Date(createdAtStr).getTime();
      const endTime = resolvedAtStr ? new Date(resolvedAtStr).getTime() : Date.now();
      
      const diffMs = endTime - createdTime;
      const diffHrs = diffMs / (1000 * 60 * 60);
      
      // Breach if open for more than 4 hours
      if (diffHrs >= 4 && status !== "RESOLVED" && status !== "CLOSED") {
        setIsBreached(true);
      } else {
        setIsBreached(false);
      }

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0) {
        setElapsedText(`${hours}h ${minutes}m`);
      } else {
        setElapsedText(`${minutes}m`);
      }
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 15000); // update every 15s

    return () => clearInterval(interval);
  }, [createdAtStr, resolvedAtStr, status]);

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <Clock className={`size-3.5 ${isBreached ? "text-danger animate-pulse" : "text-neutral"}`} />
      <span className={`text-[10px] font-mono ${isBreached ? "text-danger font-bold" : "text-neutral"}`}>
        Age: {elapsedText}
      </span>
      {isBreached && (
        <Badge className="bg-red-500/10 text-danger border border-danger/25 text-[9px] font-bold uppercase tracking-wider h-4 px-1.5 animate-pulse ml-auto">
          SLA Breached (&gt;4h)
        </Badge>
      )}
    </div>
  );
}

export default function TicketsPage() {
  const { selectedBranchId, addNotification } = useBranchStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Wifi & Internet");
  const [priority, setPriority] = useState("MEDIUM");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters State
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Chat simulator state
  const [activeChatTicket, setActiveChatTicket] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleOpenChat = (ticket: any) => {
    setActiveChatTicket(ticket);
    setChatMessages([
      {
        sender: "client",
        name: ticket.client ? ticket.client.name : "Member",
        company: ticket.client ? ticket.client.company : "Facility Lead",
        text: `Regarding our logged complaint: "${ticket.title}". Do we have a dispatcher assigned?`,
        time: "10:15 AM",
      },
      {
        sender: "operator",
        name: "CoNexus Operator",
        text: `Greetings. Our operations dashboard has dispatched this issue as ${ticket.priority} priority. The technician is currently responding. SLA age is actively monitored.`,
        time: "10:20 AM",
      },
    ]);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: "client",
      name: "You (Operations Hub)",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "operator",
          name: "CoNexus Operator",
          text: `Update logged. Escalation vector updated. We'll update the SLA status sheet accordingly.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 800);
  };

  useEffect(() => {
    loadTicketsData();
  }, [selectedBranchId]);

  async function loadTicketsData() {
    setLoading(true);
    const data = await getTicketsAction(selectedBranchId);
    setTickets(data);
    
    const clData = await getClientsAction();
    setClients(clData);
    if (clData.length > 0) {
      setSelectedClientId(clData[0].id);
    }
    setLoading(false);
  }

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedBranchId || selectedBranchId === "all") {
      toast.error("Please provide title, description, and select a branch in sidebar");
      return;
    }

    setSubmitting(true);
    const res = await createTicketAction({
      title,
      description,
      category,
      priority,
      branchId: selectedBranchId,
      clientId: selectedClientId || undefined,
    });
    setSubmitting(false);

    if (res.success && res.ticket) {
      toast.success("Helpdesk ticket logged successfully!");
      setShowForm(false);
      setTitle("");
      setDescription("");
      loadTicketsData();

      // Dispatch simulated webhook alerts
      const clientObj = clients.find(c => c.id === selectedClientId);
      const company = clientObj ? clientObj.company : "CoNexus Member";
      addNotification(
        "system",
        "New Helpdesk Ticket",
        `[${priority}] ${category}: "${title}" has been logged by ${company}. SLA active (4h limit).`,
        "Helpdesk Dispatcher"
      );
    } else {
      toast.error("Failed to create ticket");
    }
  };

  const handleUpdateStatus = async (ticketId: string, currentStatus: string, direction: "next" | "prev") => {
    const currentIndex = COLUMNS.indexOf(currentStatus);
    let newIndex = currentIndex;
    if (direction === "next" && currentIndex < COLUMNS.length - 1) {
      newIndex += 1;
    } else if (direction === "prev" && currentIndex > 0) {
      newIndex -= 1;
    }

    if (newIndex !== currentIndex) {
      const newStatus = COLUMNS[newIndex];
      const res = await updateTicketStatusAction(ticketId, newStatus);
      if (res.success) {
        toast.success(`Ticket status set to ${newStatus}`);
        loadTicketsData();
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case "URGENT":
        return <Badge className="bg-red-500/10 text-danger border border-danger/25 text-[9px] font-bold h-4.5 px-1.5">URGENT</Badge>;
      case "HIGH":
        return <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/25 text-[9px] font-bold h-4.5 px-1.5">HIGH</Badge>;
      case "MEDIUM":
        return <Badge className="bg-slate-500/10 text-slate-300 border border-brand-600 text-[9px] font-bold h-4.5 px-1.5">MEDIUM</Badge>;
      default:
        return <Badge className="bg-slate-500/5 text-neutral border border-brand-600/55 text-[9px] font-bold h-4.5 px-1.5">LOW</Badge>;
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TicketIcon className="size-5.5 text-brand-400" />
            Support Helpdesk & SLAs
          </h2>
          <p className="text-xs text-neutral">
            Manage member complaints, monitor response SLAs, and transition tickets across operational pipelines.
          </p>
        </div>

        {selectedBranchId && selectedBranchId !== "all" && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-brand-400 hover:bg-brand-300 text-white font-semibold text-xs h-9"
          >
            {showForm ? "Hide Form" : "Log Support Ticket"}
            <Plus className="size-4 ml-1.5" />
          </Button>
        )}
      </div>

      {/* Log Ticket Drawer Form */}
      {showForm && (
        <Card className="border-brand-400 bg-brand-750 max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-heading text-sm font-bold text-white flex items-center gap-2">
              Log Support Complaint
            </CardTitle>
            <CardDescription className="text-xs text-neutral">
              Submit a support ticket on behalf of a coworking member to launch resolution timers.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateTicketSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tkt-title" className="text-xs text-slate-300">Ticket Title / Short Summary *</Label>
                <input
                  id="tkt-title"
                  type="text"
                  placeholder="e.g. Conference Room Wifi not connecting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-neutral focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tkt-desc" className="text-xs text-slate-300">Detailed Description *</Label>
                <textarea
                  id="tkt-desc"
                  placeholder="Provide precise locations, device names, or context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-2 text-xs text-slate-100 placeholder:text-neutral focus:outline-none h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tkt-category" className="text-xs text-slate-300">Category</Label>
                  <select
                    id="tkt-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-2 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tkt-prio" className="text-xs text-slate-300">Urgency Level</Label>
                  <select
                    id="tkt-prio"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-2 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  >
                    {PRIORITIES.slice(1).map((prio) => (
                      <option key={prio} value={prio}>
                        {prio}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tkt-client" className="text-xs text-slate-300">Submitting Client Account</Label>
                <select
                  id="tkt-client"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="">No client link (Internal issue)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

            </CardContent>
            <div className="flex justify-end gap-2 border-t border-brand-600/50 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="h-8.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-8.5 text-xs bg-brand-400 hover:bg-brand-300 text-white font-semibold"
              >
                {submitting ? "Logging..." : "Create Ticket"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Toolbar filters */}
      <Card className="border-brand-600 bg-brand-700 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1.5 text-xs text-neutral font-semibold">
            <Filter className="size-4" />
            <span>Filters:</span>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-neutral">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded border border-brand-600 bg-brand-800 px-2.5 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === "ALL" ? "All Urgencies" : p}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-neutral">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded border border-brand-600 bg-brand-800 px-2.5 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Kanban Board Grid */}
      {selectedBranchId === "all" ? (
        <Card className="border-brand-600 bg-brand-700 p-8 text-center max-w-sm mx-auto">
          <TicketIcon className="size-10 text-brand-600 mx-auto mb-2" />
          <span className="text-xs font-semibold text-slate-300 block">Select a Center location</span>
          <span className="text-[11px] text-neutral mt-0.5 block">
            Please pick a specific coworking branch in the sidebar to review active tickets boards.
          </span>
        </Card>
      ) : loading ? (
        <div className="flex h-60 items-center justify-center text-neutral text-xs animate-pulse">
          <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
          Fetching support pipelines...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-start">
          {COLUMNS.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col);
            return (
              <div key={col} className="space-y-3.5 bg-brand-850 p-3.5 rounded-xl border border-brand-600/40 min-h-[480px]">
                {/* Column header */}
                <div className="flex items-center justify-between border-b border-brand-600 pb-2.5 mb-2">
                  <span className="font-heading text-xs font-bold text-slate-200 tracking-wide">
                    {col.replace("_", " ")}
                  </span>
                  <Badge variant="outline" className="border-brand-600 text-neutral text-[10px] font-bold px-1.5 h-4.5">
                    {colTickets.length}
                  </Badge>
                </div>

                {/* Ticket Cards */}
                {colTickets.length === 0 ? (
                  <div className="text-center py-10 text-[10px] text-neutral italic">
                    No tickets in queue
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colTickets.map((t) => (
                      <Card key={t.id} className="border-brand-600 bg-brand-700 hover:border-brand-600/80 transition-colors p-3.5 space-y-2">
                        {/* Title and Priority */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-xs text-slate-200 leading-tight">{t.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {getPriorityBadge(t.priority)}
                            <Badge className="bg-brand-900/60 border border-brand-600 text-neutral text-[8px] h-4 font-bold">
                              {t.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-neutral leading-relaxed line-clamp-3">
                          {t.description}
                        </p>

                        {/* Submitter */}
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral border-t border-brand-600/50 pt-2">
                          <User className="size-3 text-neutral" />
                          <span className="truncate">{t.client ? `${t.client.name} (${t.client.company})` : "Internal Facility"}</span>
                        </div>

                        {/* SLA timers */}
                        <SLATimer createdAtStr={t.createdAt} resolvedAtStr={t.resolvedAt} status={t.status} />

                        {/* Transitions */}
                        <div className="flex justify-end gap-1.5 pt-2 border-t border-brand-600/30">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenChat(t)}
                            className="h-7 w-7 text-neutral hover:text-white"
                            title="Open Chat Support"
                          >
                            <MessageSquare className="size-3.5 text-brand-400" />
                          </Button>
                          {col !== "OPEN" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(t.id, t.status, "prev")}
                              className="h-7 w-7 text-neutral hover:text-white"
                              title="Move back"
                            >
                              <ArrowLeft className="size-3.5" />
                            </Button>
                          )}
                          {col !== "CLOSED" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(t.id, t.status, "next")}
                              className="h-7 w-7 text-neutral hover:text-white"
                              title="Move forward"
                            >
                              {col === "RESOLVED" ? (
                                <CheckCircle className="size-3.5 text-success" />
                              ) : col === "IN_PROGRESS" ? (
                                <CheckCircle className="size-3.5 text-brand-300" />
                              ) : (
                                <Play className="size-3.5 text-brand-400" />
                              )}
                            </Button>
                          )}
                        </div>

                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}

      {/* Live Chat drawer overlay */}
      {activeChatTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/85 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="relative w-full max-w-md rounded-2xl border border-brand-500/35 bg-brand-850 shadow-2xl flex flex-col h-[520px] overflow-hidden">
            
            {/* Header */}
            <div className="bg-brand-900/70 p-4 border-b border-brand-600/40 flex items-center justify-between">
              <div>
                <span className="text-[9px] bg-brand-400/25 text-brand-300 font-bold px-2 py-0.5 rounded border border-brand-400/20 uppercase tracking-widest font-mono">
                  SLA Chat Simulator
                </span>
                <h3 className="text-sm font-extrabold text-white mt-1.5 truncate max-w-[280px]">
                  {activeChatTicket.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveChatTicket(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-brand-700/50 transition-colors"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Message lists */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-brand-900/20 flex flex-col justify-end">
              <div className="text-[10px] text-neutral text-center italic select-none">
                Support session synchronized. Real-time logging engaged.
              </div>
              
              <div className="space-y-3 overflow-y-auto max-h-[320px] py-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === "client" ? "items-end" : "items-start"}`}
                  >
                    <div className="text-[9px] text-neutral mb-0.5 px-1 flex gap-1">
                      <span className="font-bold text-slate-300">{msg.name}</span>
                      <span>·</span>
                      <span>{msg.time}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                        msg.sender === "client"
                          ? "bg-brand-400 text-white rounded-tr-none border border-brand-300/10"
                          : "bg-brand-800 text-slate-200 rounded-tl-none border border-brand-600/45"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-brand-600/40 bg-brand-900/60 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type message to dispatcher..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-brand-900 text-slate-100 text-xs placeholder:text-slate-400 pl-3 pr-3 py-2 rounded-md border border-brand-600/55 focus:border-brand-400 focus:outline-none h-9 font-medium"
              />
              <Button
                type="submit"
                className="h-9 px-3 bg-brand-600 border border-brand-500 hover:bg-brand-500 text-white rounded-md shrink-0 flex items-center justify-center"
              >
                <Send className="size-4" />
              </Button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
