"use client";

import React, { useEffect, useState } from "react";
import { useBranchStore } from "@/lib/store";
import {
  getInvoicesAction,
  getClientsAction,
  createInvoiceAction,
  payInvoiceAction,
} from "@/app/actions";
import { generateInvoicePdf } from "@/lib/pdf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Trash2,
  Download,
  CheckCircle,
  FileText,
  DollarSign,
  AlertTriangle,
  Clock,
  Briefcase,
  Loader2
} from "lucide-react";

interface InvoiceItemInput {
  description: string;
  quantity: number;
  price: number;
}

export default function FinancePage() {
  const { selectedBranchId, addNotification } = useBranchStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Invoice Form State
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // default 14 days due
  );
  const [lineItems, setLineItems] = useState<InvoiceItemInput[]>([
    { description: "Workspace License - Dedicated Desk", quantity: 1, price: 15000 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadFinanceData();
  }, [selectedBranchId]);

  async function loadFinanceData() {
    setLoading(true);
    const invData = await getInvoicesAction(selectedBranchId);
    setInvoices(invData);
    
    const clData = await getClientsAction();
    setClients(clData);
    if (clData.length > 0) {
      setSelectedClientId(clData[0].id);
    }
    
    setLoading(false);
  }

  // Calculate stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount + inv.tax, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount + inv.tax, 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "PENDING")
    .reduce((sum, inv) => sum + inv.amount + inv.tax, 0);
  const totalOverdue = invoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount + inv.tax, 0);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === "ALL") return true;
    return inv.status === statusFilter;
  });

  // Form operations
  const handleAddItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const items = [...lineItems];
    items.splice(index, 1);
    setLineItems(items);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemInput, value: string | number) => {
    const items = [...lineItems];
    items[index] = {
      ...items[index],
      [field]: value,
    };
    setLineItems(items);
  };

  // Calculations for custom invoice
  const builderSubtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const builderTax = Math.round(builderSubtotal * 0.18); // 18% GST standard
  const builderGrandTotal = builderSubtotal + builderTax;

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error("Please select a client account");
      return;
    }
    if (lineItems.some((item) => !item.description || item.quantity <= 0 || item.price <= 0)) {
      toast.error("Please fill out all line item details correctly");
      return;
    }

    setSubmitting(true);
    const res = await createInvoiceAction({
      clientId: selectedClientId,
      amount: builderSubtotal,
      tax: builderTax,
      dueDate,
      lineItems: JSON.stringify(lineItems),
    });
    setSubmitting(false);

    if (res.success && res.invoice) {
      toast.success("Invoice created successfully!");
      
      // Send simulated notifications
      const clientObj = clients.find((c) => c.id === selectedClientId);
      const recipientName = clientObj ? `${clientObj.name} (${clientObj.company})` : "Member";
      
      addNotification(
        "whatsapp",
        "New Invoice Raised",
        `Hi ${clientObj?.name || "Member"}, Invoice *#${res.invoice.id.substring(0, 8).toUpperCase()}* for *₹${builderGrandTotal}* (including 18% GST) has been raised. Due Date: ${dueDate}. Please make payment to avoid seating suspension.`,
        recipientName
      );

      setShowBuilder(false);
      setLineItems([{ description: "Workspace License - Dedicated Desk", quantity: 1, price: 15000 }]);
      loadFinanceData();
    } else {
      toast.error("Failed to create invoice");
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    const res = await payInvoiceAction(invoiceId);
    if (res.success) {
      toast.success("Invoice marked as PAID!");
      loadFinanceData();
    } else {
      toast.error("Failed to record payment");
    }
  };

  const handleDownloadPdf = async (invoiceObj: any) => {
    try {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(invoiceObj.lineItems);
      } catch (e) {
        parsedItems = [{ description: "Workspace Leasing Fee", quantity: 1, price: invoiceObj.amount }];
      }

      const clientInfo = {
        name: invoiceObj.client.name,
        company: invoiceObj.client.company,
        email: invoiceObj.client.email,
        phone: invoiceObj.client.phone || undefined,
      };

      const invoiceInfo = {
        id: invoiceObj.id,
        amount: invoiceObj.amount,
        tax: invoiceObj.tax,
        dueDate: invoiceObj.dueDate,
        lineItems: parsedItems,
        createdAt: invoiceObj.createdAt,
      };

      const pdfUrl = await generateInvoicePdf(clientInfo, invoiceInfo);
      
      // Trigger download
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Invoice_${invoiceObj.id.substring(0, 8).toUpperCase()}_${invoiceObj.client.company.replace(/\s+/g, "_")}.pdf`;
      link.click();
      toast.success("Invoice PDF generated and downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF invoice document.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-success/15 border border-success/30 text-success text-[10px] font-semibold h-5">PAID</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-500 text-[10px] font-semibold h-5">PENDING</Badge>;
      case "OVERDUE":
        return <Badge className="bg-red-500/15 border border-red-500/30 text-danger text-[10px] font-semibold h-5">OVERDUE</Badge>;
      default:
        return <Badge variant="outline" className="border-brand-600 text-neutral text-[10px] h-5">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="size-5.5 text-brand-400" />
            Finance & Billing Control
          </h2>
          <p className="text-xs text-neutral">
            Track coworking center MRR flow, generate client invoices, audit paid histories, and execute payment collections.
          </p>
        </div>

        <Button
          onClick={() => setShowBuilder(!showBuilder)}
          className="bg-brand-400 hover:bg-brand-300 text-white font-semibold text-xs h-9"
        >
          {showBuilder ? "Hide Builder" : "Issue Custom Invoice"}
          <Plus className="size-4 ml-1.5" />
        </Button>
      </div>

      {/* Stats Summary */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="border-brand-600 bg-brand-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-neutral">Total Invoiced</span>
              <FileText className="size-4 text-brand-400" />
            </div>
            <span className="block text-lg font-bold text-white mt-1.5">
              ₹{totalInvoiced.toLocaleString()}
            </span>
          </Card>

          <Card className="border-brand-600 bg-brand-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-neutral">Total Collected</span>
              <CheckCircle className="size-4 text-success" />
            </div>
            <span className="block text-lg font-bold text-success mt-1.5">
              ₹{totalPaid.toLocaleString()}
            </span>
          </Card>

          <Card className="border-brand-600 bg-brand-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-neutral">Outstanding (Unpaid)</span>
              <Clock className="size-4 text-yellow-500" />
            </div>
            <span className="block text-lg font-bold text-yellow-500 mt-1.5">
              ₹{totalPending.toLocaleString()}
            </span>
          </Card>

          <Card className="border-brand-600 bg-brand-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-neutral">Overdue Receivables</span>
              <AlertTriangle className="size-4 text-danger" />
            </div>
            <span className="block text-lg font-bold text-danger mt-1.5">
              ₹{totalOverdue.toLocaleString()}
            </span>
          </Card>
        </div>
      )}

      {/* Invoice Builder Console */}
      {showBuilder && (
        <Card className="border-brand-400 bg-brand-750 shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <Plus className="size-4.5 text-brand-400" />
              Invoice Compilation Console
            </CardTitle>
            <CardDescription className="text-xs text-neutral">
              Compile and raise custom invoices with automated tax rates (18% GST) and real-time WhatsApp dispatches.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateInvoiceSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client select */}
                <div className="space-y-1.5">
                  <Label htmlFor="inv-client" className="text-xs text-slate-300">Client Recipient</Label>
                  <select
                    id="inv-client"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="inv-due" className="text-xs text-slate-300">Payment Due Date</Label>
                  <input
                    id="inv-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-3 pt-2">
                <span className="block font-heading text-xs font-bold text-slate-200">Line Items Breakdown</span>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Dedicated Desk Fee - June 2026"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      className="flex-1 rounded border border-brand-600 bg-brand-850 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-neutral focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                      className="w-16 rounded border border-brand-600 bg-brand-850 px-2 py-1.5 text-xs text-slate-100 text-center focus:outline-none"
                      min={1}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                      className="w-28 rounded border border-brand-600 bg-brand-850 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      min={0}
                      required
                    />
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-neutral hover:text-danger p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={handleAddItem}
                  variant="outline"
                  className="text-xs h-7 border-brand-600 text-brand-300 hover:bg-brand-800"
                >
                  Add Item Row
                </Button>
              </div>

              {/* Calculation Summary Box */}
              <div className="rounded-lg border border-brand-600 bg-brand-900/60 p-4 max-w-sm ml-auto text-xs space-y-2">
                <div className="flex justify-between text-neutral font-medium">
                  <span>Subtotal</span>
                  <span>₹{builderSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral font-medium">
                  <span>GST (18%)</span>
                  <span>₹{builderTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-brand-600 pt-2 font-bold text-white text-sm">
                  <span>Total Amount Due</span>
                  <span className="text-brand-300">₹{builderGrandTotal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 border-t border-brand-600/50 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBuilder(false)}
                className="h-8.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-8.5 text-xs bg-brand-400 hover:bg-brand-300 text-white font-semibold"
              >
                {submitting ? "Raising..." : "Issue & Send Invoice"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Ledger Table */}
      <Card className="border-brand-600 bg-brand-700">
        <div className="flex flex-col gap-4 p-4 border-b border-brand-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="block font-heading text-xs font-bold text-slate-200">Center Invoices Ledger</span>
            <span className="block text-[11px] text-neutral">Audit and collect payments on registered invoice assets.</span>
          </div>

          {/* Filter Status */}
          <div className="flex bg-brand-850 p-0.5 rounded border border-brand-600">
            {["ALL", "PAID", "PENDING", "OVERDUE"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded transition-colors ${
                  statusFilter === status ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-neutral text-xs animate-pulse">
              <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
              Loading invoices list...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="size-10 text-brand-600 mb-2" />
              <span className="text-xs font-semibold text-slate-300">No Invoices Found</span>
            </div>
          ) : (
            <div className="divide-y divide-brand-600/50">
              {filteredInvoices.map((inv) => {
                const grandTotal = inv.amount + inv.tax;
                return (
                  <div
                    key={inv.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center justify-between hover:bg-brand-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded bg-brand-800 border border-brand-600 text-brand-400">
                        <FileText className="size-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">#{inv.id.substring(0, 8).toUpperCase()}</span>
                          {getStatusBadge(inv.status)}
                        </div>
                        <span className="block text-[11px] text-neutral mt-0.5 font-medium">
                          {inv.client?.company} · {inv.client?.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      {/* Financial info */}
                      <div className="text-right">
                        <span className="block text-xs font-bold text-white">₹{grandTotal.toLocaleString()}</span>
                        <span className="block text-[10px] text-neutral mt-0.5">
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Download PDF button */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadPdf(inv)}
                        className="h-8 w-8 border-brand-600 hover:bg-brand-800 text-neutral hover:text-white"
                        title="Download PDF Invoice"
                      >
                        <Download className="size-3.5" />
                      </Button>

                      {/* Collect Payment */}
                      {inv.status === "PENDING" && (
                        <Button
                          onClick={() => handlePayInvoice(inv.id)}
                          className="h-8 text-xs bg-success hover:bg-success/90 text-white font-semibold"
                        >
                          Collect Payment
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
