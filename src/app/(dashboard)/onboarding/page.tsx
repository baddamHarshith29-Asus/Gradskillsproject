"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBranchStore } from "@/lib/store";
import {
  getBranchesAction,
  getBranchFloorsAction,
  createClientAction,
  createContractAction,
} from "@/app/actions";
import { generateAgreementPdf } from "@/lib/pdf";
import SignatureStep from "@/components/onboarding/SignatureStep";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  UserPlus, 
  Building, 
  MapPin, 
  Calendar, 
  PenTool, 
  FileCheck, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Download,
  Loader2,
  AlertCircle
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Account Profile", icon: <UserPlus className="size-4" /> },
  { id: 2, name: "Workspace Allocation", icon: <Building className="size-4" /> },
  { id: 3, name: "Leasing Terms", icon: <Calendar className="size-4" /> },
  { id: 4, name: "Smart E-Sign", icon: <PenTool className="size-4" /> },
  { id: 5, name: "Review & Issue", icon: <FileCheck className="size-4" /> },
];

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useBranchStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [branches, setBranches] = useState<{ id: string; name: string; city: string }[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [availableSpaces, setAvailableSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // STEP 1 Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    whatsapp: "",
    branchId: "",
  });

  // STEP 2 Form State
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState("");

  // STEP 3 Form State
  const [contractData, setContractData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 6); // default 6 months lease
      return d.toISOString().split("T")[0];
    })(),
    monthlyRate: 0,
  });

  // STEP 4 Form State
  const [signatureDataUrl, setSignatureDataUrl] = useState("");

  // STEP 5 Output State
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Load branches
  useEffect(() => {
    async function loadBranches() {
      const data = await getBranchesAction();
      setBranches(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, branchId: data[0].id }));
      }
    }
    loadBranches();
  }, []);

  // Load floors when branch changes
  useEffect(() => {
    if (formData.branchId) {
      async function loadFloors() {
        const data = await getBranchFloorsAction(formData.branchId);
        setFloors(data);
        if (data.length > 0) {
          setSelectedFloorId(data[0].id);
        } else {
          setSelectedFloorId("");
          setAvailableSpaces([]);
        }
      }
      loadFloors();
    }
  }, [formData.branchId]);

  // Load spaces when floor changes
  useEffect(() => {
    if (selectedFloorId) {
      const floor = floors.find((f) => f.id === selectedFloorId);
      if (floor) {
        setAvailableSpaces(floor.spaces || []);
        if (floor.spaces && floor.spaces.length > 0) {
          const firstSpace = floor.spaces[0];
          setSelectedSpaceId(firstSpace.id);
          setContractData((prev) => ({
            ...prev,
            monthlyRate: firstSpace.baseRate * 160, // estimate 160h base monthly rent
          }));
        } else {
          setSelectedSpaceId("");
        }
      }
    } else {
      setAvailableSpaces([]);
      setSelectedSpaceId("");
    }
  }, [selectedFloorId, floors]);

  // Update monthly rate suggestion if space changes
  const handleSpaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const spaceId = e.target.value;
    setSelectedSpaceId(spaceId);
    const space = availableSpaces.find((s) => s.id === spaceId);
    if (space) {
      setContractData((prev) => ({
        ...prev,
        monthlyRate: space.baseRate * 160,
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.company || !formData.email) {
        toast.error("Please fill in all required fields (Name, Company, Email)");
        return;
      }
    }
    if (currentStep === 2) {
      if (!selectedSpaceId) {
        toast.error("Please select a workspace space inventory to allocate");
        return;
      }
    }
    if (currentStep === 3) {
      if (!contractData.startDate || !contractData.endDate || contractData.monthlyRate <= 0) {
        toast.error("Please provide valid dates and monthly rate");
        return;
      }
    }
    if (currentStep === 4) {
      if (!signatureDataUrl) {
        toast.error("Licensee must sign the agreement before proceeding");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const selectedBranch = branches.find((b) => b.id === formData.branchId);
  const selectedSpace = availableSpaces.find((s) => s.id === selectedSpaceId);

  const handleOnboardSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create client
      const clientRes = await createClientAction({
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        branchId: formData.branchId,
        lifecycle: "ACTIVE", // promote directly to active lease holder
        healthScore: 90, // initialize at high rating since they just completed onboarding
      });

      if (!clientRes.success || !clientRes.client) {
        throw new Error(clientRes.error || "Failed to create client account profile");
      }

      // 2. Create contract
      const contractRes = await createContractAction({
        clientId: clientRes.client.id,
        spaceId: selectedSpaceId,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        monthlyRate: contractData.monthlyRate,
        status: "ACTIVE",
        signatureUrl: signatureDataUrl,
      });

      if (!contractRes.success || !contractRes.contract) {
        throw new Error(contractRes.error || "Failed to issue legal contract lease");
      }

      // 3. Generate PDF Agreement
      const pdfUrl = await generateAgreementPdf(
        {
          name: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
        },
        {
          startDate: contractData.startDate,
          endDate: contractData.endDate,
          monthlyRate: contractData.monthlyRate,
        },
        selectedSpace?.name || "Private Office",
        selectedBranch?.name || "Downtown Hub",
        signatureDataUrl
      );

      setPdfBlobUrl(pdfUrl);

      // 4. Log Simulated notifications (virtual WhatsApp / Email webhook dispatches)
      const recipientName = `${formData.name} (${formData.company})`;
      
      addNotification(
        "system",
        "Licensee Activated",
        `Corporate account ${formData.company} has completed e-signing. Lease bound to ${selectedSpace?.name}.`,
        "Community Coordinator"
      );

      addNotification(
        "whatsapp",
        "Welcome to CoNexus!",
        `Hi *${formData.name}*, welcome to your new private office at *${selectedBranch?.name}*! Your keycard passes are ready for pick up at front reception desk. Support pin: ${Math.floor(1000 + Math.random()*9000)}.`,
        recipientName
      );

      addNotification(
        "email",
        "Lease Executed & Handover Documentation",
        `Dear ${formData.name},\n\nThank you for choosing CoNexus. Your legal lease agreement for ${selectedSpace?.name} starting ${contractData.startDate} has been successfully executed.\n\nAttached is your digital copy of the signed agreement.`,
        formData.email
      );

      setCompleted(true);
      toast.success("Onboarding fully executed & contract dispatched!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Workspace Onboarding Wizard
        </h2>
        <p className="text-xs text-neutral">
          Seamlessly onboarding new companies: allocate workspace, execute agreements, capture signature, and activate access.
        </p>
      </div>

      {/* Stepper progress indicator */}
      <div className="flex items-center justify-between bg-brand-850 p-3.5 rounded-lg border border-brand-600">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-brand-400 border-brand-400 text-white shadow-md shadow-brand-400/20 scale-105"
                    : isDone
                    ? "bg-success border-success text-white"
                    : "border-brand-600 bg-brand-800 text-neutral"
                }`}
              >
                {isDone ? <CheckCircle className="size-4" /> : step.id}
              </div>
              <span
                className={`hidden md:inline text-[11px] font-semibold tracking-wide ${
                  isActive ? "text-white" : isDone ? "text-slate-300" : "text-neutral"
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Steps Content panels */}
      <Card className="border-brand-600 bg-brand-700 shadow-xl">
        <CardContent className="p-6">
          {/* STEP 1: Account Profile */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-600 pb-2">
                <UserPlus className="size-4.5 text-brand-300" />
                <span className="font-heading text-xs font-bold text-slate-200">Company Representative Account Details</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="onboard-name" className="text-xs text-slate-300">Authorized Signatory Name *</Label>
                  <input
                    id="onboard-name"
                    type="text"
                    placeholder="e.g. Satya Nadella"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="onboard-company" className="text-xs text-slate-300">Corporate Company Name *</Label>
                  <input
                    id="onboard-company"
                    type="text"
                    placeholder="e.g. Microsoft India"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="onboard-email" className="text-xs text-slate-300">Primary Contact Email *</Label>
                  <input
                    id="onboard-email"
                    type="email"
                    placeholder="satya@microsoft.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="onboard-branch" className="text-xs text-slate-300">Target Coworking Center *</Label>
                  <select
                    id="onboard-branch"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="onboard-phone" className="text-xs text-slate-300">Phone Number (Optional)</Label>
                  <input
                    id="onboard-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="onboard-whatsapp" className="text-xs text-slate-300">WhatsApp Alert Number (Optional)</Label>
                  <input
                    id="onboard-whatsapp"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-neutral focus:border-brand-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Workspace Seating Allocation */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-600 pb-2">
                <Building className="size-4.5 text-brand-300" />
                <span className="font-heading text-xs font-bold text-slate-200">Workspace Inventory Allocation</span>
              </div>

              {floors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-brand-600 rounded-md">
                  <AlertCircle className="size-8 text-danger mb-2" />
                  <span className="text-xs font-semibold text-slate-300">No Seating Inventory Found</span>
                  <span className="text-[10px] text-neutral text-center max-w-xs mt-1">
                    Please go to the Floor Plan Builder page to design some space layouts for this coworking center first.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Floor switcher */}
                    <div className="space-y-1.5">
                      <Label htmlFor="alloc-floor" className="text-xs text-slate-300">Select Floor Layout</Label>
                      <select
                        id="alloc-floor"
                        value={selectedFloorId}
                        onChange={(e) => setSelectedFloorId(e.target.value)}
                        className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                      >
                        {floors.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Space select */}
                    <div className="space-y-1.5">
                      <Label htmlFor="alloc-space" className="text-xs text-slate-300">Available Space Unit</Label>
                      {availableSpaces.length === 0 ? (
                        <select disabled className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-neutral">
                          <option>No spaces available on floor</option>
                        </select>
                      ) : (
                        <select
                          id="alloc-space"
                          value={selectedSpaceId}
                          onChange={handleSpaceChange}
                          className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                        >
                          {availableSpaces.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.type} · Capacity: {s.capacity} pax)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {selectedSpace && (
                    <div className="rounded-lg border border-brand-600 bg-brand-900/50 p-4 space-y-2 text-xs">
                      <span className="block font-bold text-white uppercase text-[10px] text-brand-300 tracking-wider">
                        Allocated Unit Details
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-neutral">Base Rate:</span>
                          <span className="block text-slate-200 font-medium">₹{selectedSpace.baseRate}/hr</span>
                        </div>
                        <div>
                          <span className="text-neutral">Seating Capacity:</span>
                          <span className="block text-slate-200 font-medium">{selectedSpace.capacity} Pax</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-neutral">Standard Amenities:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {JSON.parse(selectedSpace.amenities || "[]").map((amenity: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="border-brand-600 bg-brand-850 text-slate-300 text-[9px]">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Leasing Terms & Period */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-600 pb-2">
                <Calendar className="size-4.5 text-brand-300" />
                <span className="font-heading text-xs font-bold text-slate-200">License Terms & Agreement period</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="term-start" className="text-xs text-slate-300">Commencement Date</Label>
                  <input
                    id="term-start"
                    type="date"
                    value={contractData.startDate}
                    onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="term-end" className="text-xs text-slate-300">Expiration Date</Label>
                  <input
                    id="term-end"
                    type="date"
                    value={contractData.endDate}
                    onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="term-rate" className="text-xs text-slate-300">Monthly License Fee (INR)</Label>
                  <input
                    id="term-rate"
                    type="number"
                    value={contractData.monthlyRate}
                    onChange={(e) => setContractData({ ...contractData, monthlyRate: Number(e.target.value) })}
                    className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                    placeholder="Rent Fee"
                  />
                  <span className="block text-[10px] text-neutral italic mt-0.5">
                    Prepopulated from base hourly rate * 160h. Customizable.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Smart E-Signature */}
          {currentStep === 4 && (
            <SignatureStep
              onSave={(url) => setSignatureDataUrl(url)}
              onClear={() => setSignatureDataUrl("")}
              savedSignature={signatureDataUrl}
            />
          )}

          {/* STEP 5: Review & Activation */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-brand-600 pb-2">
                <FileCheck className="size-4.5 text-brand-300" />
                <span className="font-heading text-xs font-bold text-slate-200">License Verification Review</span>
              </div>

              {!completed ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-brand-600 bg-brand-900/40 p-4 text-xs space-y-3.5">
                    <div className="flex justify-between items-center pb-2 border-b border-brand-600/50">
                      <div>
                        <span className="block font-bold text-white text-sm">{formData.name}</span>
                        <span className="text-neutral">{formData.company} · {formData.email}</span>
                      </div>
                      <Badge className="bg-brand-400/10 text-brand-400 border border-brand-400/20 uppercase font-bold text-[9px]">
                        Leasing Account
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral block mb-0.5">Allocated Space</span>
                        <span className="text-slate-200 font-semibold">{selectedSpace?.name || "Office space"} ({selectedSpace?.type})</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral block mb-0.5">Coworking Center</span>
                        <span className="text-slate-200 font-semibold">{selectedBranch?.name || "Downtown Branch"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral block mb-0.5">Rent Term Duration</span>
                        <span className="text-slate-200 font-semibold">
                          {new Date(contractData.startDate).toLocaleDateString()} - {new Date(contractData.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral block mb-0.5">Monthly License Charge</span>
                        <span className="text-brand-300 font-bold">₹{contractData.monthlyRate.toLocaleString()} / mo</span>
                      </div>
                    </div>

                    {signatureDataUrl && (
                      <div className="border-t border-brand-600/50 pt-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral block mb-1">Captured Authorized Signature</span>
                        <div className="rounded border border-brand-600 bg-brand-850 p-2 max-w-xs h-16 flex items-center justify-center">
                          <img src={signatureDataUrl} alt="Signature Preview" className="h-full object-contain" />
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral leading-relaxed">
                    By clicking the execute activation button, CoNexus will register this licensee, generate the legally binding agreement PDF with signatures, write local DB bindings, and simulate onboarding WhatsApp announcements.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-success/20 text-success border border-success/35">
                    <CheckCircle className="size-8" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-200 block">Workspace License Active!</span>
                    <span className="text-xs text-neutral max-w-xs mt-1 block">
                      Legal contract has been issued and simulated welcome notifications have been queued in the simulator drawer.
                    </span>
                  </div>

                  {pdfBlobUrl && (
                    <a href={pdfBlobUrl} download={`Agreement_${formData.company.replace(/\s+/g, "_")}.pdf`}>
                      <Button className="h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                        <Download className="size-4 mr-1.5" />
                        Download Agreement PDF
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t border-brand-600/50 p-4 gap-3">
          {currentStep > 1 && !completed && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              className="h-9 text-xs"
            >
              <ArrowLeft className="size-3.5 mr-1.5" />
              Back
            </Button>
          )}

          {!completed ? (
            currentStep < 5 ? (
              <Button
                onClick={handleNext}
                className="h-9 text-xs bg-brand-400 hover:bg-brand-300 text-white font-semibold ml-auto"
              >
                Next
                <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handleOnboardSubmit}
                disabled={loading}
                className="h-9 text-xs bg-brand-400 hover:bg-brand-300 text-white font-semibold ml-auto"
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle className="size-4 mr-1.5" />
                )}
                Execute & Activate Workspace
              </Button>
            )
          ) : (
            <Button
              onClick={() => router.push("/clients")}
              className="h-9 text-xs bg-brand-400 hover:bg-brand-300 text-white font-semibold ml-auto"
            >
              Go to CRM Directory
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-60 items-center justify-center text-neutral text-xs">
        <Loader2 className="mr-2 size-5 animate-spin text-brand-400" />
        Loading Onboarding Wizard...
      </div>
    }>
      <OnboardingWizard />
    </Suspense>
  );
}
