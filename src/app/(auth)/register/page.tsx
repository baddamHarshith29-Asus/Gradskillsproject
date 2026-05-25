"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { getBranchesAction } from "@/app/actions";
import { registerEmployeeAction } from "../login/actions";
import { type UserRole } from "@/lib/rbac";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string; city: string }[]>([]);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("BRANCH_MANAGER");
  const [branchId, setBranchId] = useState("");

  useEffect(() => {
    async function loadBranches() {
      const data = await getBranchesAction();
      setBranches(data);
      if (data.length > 0) {
        setBranchId(data[0].id);
      }
    }
    loadBranches();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role || !branchId) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await registerEmployeeAction({
        name,
        email,
        role,
        branchId,
      });

      if (res.success) {
        toast.success("Employee account registered successfully! Please login.");
        router.push("/login");
      } else {
        toast.error(res.error || "Failed to register account.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-brand-600 bg-brand-700 shadow-2xl w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-400/10 text-brand-400 border border-brand-400/20">
          <UserPlus className="size-6" />
        </div>
        <CardTitle className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Register Staff Account
        </CardTitle>
        <CardDescription className="text-neutral">
          Create employee account to access CoNexus Multi-Branch CRM + ERP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-slate-200 text-xs">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Satya Nadella"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-brand-600 bg-brand-800 text-slate-100 placeholder:text-neutral focus:border-brand-400 text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-200 text-xs">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="satya@conexus.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-brand-600 bg-brand-800 text-slate-100 placeholder:text-neutral focus:border-brand-400 text-xs h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-slate-200 text-xs">Access Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer h-9"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="BRANCH_MANAGER">Branch Manager</option>
                <option value="COMMUNITY_LEAD">Community Lead</option>
                <option value="FINANCE">Finance</option>
                <option value="MEMBER">CoNexus Member</option>
                <option value="VISITOR">Visitor Kiosk</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="branch" className="text-slate-200 text-xs">Assigned Center</Label>
              {branches.length === 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-neutral h-9 px-3 border border-brand-600 bg-brand-800 rounded-md">
                  <Loader2 className="size-3 animate-spin text-brand-400" />
                  Loading...
                </div>
              ) : (
                <select
                  id="branch"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full rounded-md border border-brand-600 bg-brand-800 px-3 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer h-9"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-400 text-white hover:bg-brand-300 transition-colors h-9 text-xs"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-300 pt-2 border-t border-brand-600">
          <a href="/login" className="inline-flex items-center text-brand-300 hover:text-brand-200 transition-colors gap-1.5">
            <ArrowLeft className="size-3.5" />
            Back to Login
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
