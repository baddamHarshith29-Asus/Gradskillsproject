"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  CreditCard,
  LogIn,
  QrCode,
  Shield,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { handleLoginAction, handleCredentialsLoginAction } from "./actions";
import { type UserRole } from "@/lib/rbac";

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("demo@conexus.app");
  const [password, setPassword] = useState("demo123");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const quickLogins: {
    role: UserRole;
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      role: "SUPER_ADMIN",
      title: "Super Admin",
      desc: "Full organization access",
      icon: <Shield className="size-5" />,
      color: "border-red-500/30 hover:border-red-500 text-red-400 bg-red-950/10",
    },
    {
      role: "BRANCH_MANAGER",
      title: "Branch Manager",
      desc: "Manage floor plans & team",
      icon: <Building2 className="size-5" />,
      color: "border-blue-500/30 hover:border-blue-500 text-blue-400 bg-blue-950/10",
    },
    {
      role: "COMMUNITY_LEAD",
      title: "Community Lead",
      desc: "Onboard clients & check-ins",
      icon: <Users className="size-5" />,
      color: "border-emerald-500/30 hover:border-emerald-500 text-emerald-400 bg-emerald-950/10",
    },
    {
      role: "FINANCE",
      title: "Finance",
      desc: "Billing & invoice dashboard",
      icon: <CreditCard className="size-5" />,
      color: "border-amber-500/30 hover:border-amber-500 text-amber-400 bg-amber-950/10",
    },
    {
      role: "MEMBER",
      title: "CoNexus Member",
      desc: "Member portal & booking",
      icon: <User className="size-5" />,
      color: "border-purple-500/30 hover:border-purple-500 text-purple-400 bg-purple-950/10",
    },
    {
      role: "VISITOR",
      title: "Visitor Kiosk",
      desc: "Public kiosk check-in",
      icon: <QrCode className="size-5" />,
      color: "border-pink-500/30 hover:border-pink-500 text-pink-400 bg-pink-950/10",
    },
  ];

  const triggerLogin = async (role: UserRole) => {
    setLoading(role);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await handleLoginAction(role);
    } catch (e) {
      console.error(e);
      setLoading(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading("credentials");

    if (email === "demo@conexus.app") {
      await triggerLogin("SUPER_ADMIN");
      return;
    }

    const res = await handleCredentialsLoginAction(email);
    if (res.success && res.redirectUrl) {
      setSuccessMsg("Access Granted! Redirecting...");
      window.location.href = res.redirectUrl;
    } else {
      setErrorMsg(res.error || "Authentication failed.");
      setLoading(null);
    }
  };

  return (
    <Card className="border-brand-600 bg-brand-700 shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-400/10 text-brand-400 border border-brand-400/20">
          <Building2 className="size-6" />
        </div>
        <CardTitle className="font-heading text-2xl font-bold tracking-tight text-foreground">
          CoNexus
        </CardTitle>
        <CardDescription className="text-neutral">
          Multi-Branch Coworking CRM + ERP Platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-950/30 border border-red-500/30 rounded text-red-400">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-xs bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-400">
              {successMsg}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="demo@conexus.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-brand-600 bg-brand-800 text-slate-100 placeholder:text-neutral focus:border-brand-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-brand-600 bg-brand-800 text-slate-100 placeholder:text-neutral focus:border-brand-400"
            />
          </div>
          <Button
            type="submit"
            disabled={loading !== null}
            className="w-full bg-brand-400 text-white hover:bg-brand-300 transition-colors"
          >
            {loading === "credentials" ? (
              "Signing in..."
            ) : (
              <>
                <LogIn className="mr-2 size-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-300">
          Don't have an account?{" "}
          <a href="/register" className="text-brand-300 hover:text-brand-200 font-semibold underline transition-colors">
            Register as Employee
          </a>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-brand-600"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-neutral">
            Quick Login For Judges
          </span>
          <div className="flex-grow border-t border-brand-600"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickLogins.map((item) => (
            <button
              key={item.role}
              disabled={loading !== null}
              onClick={() => triggerLogin(item.role)}
              className={`flex flex-col items-start p-3 text-left border rounded-lg transition-all duration-200 ${item.color} ${
                loading === item.role ? "opacity-50 scale-[0.98]" : "hover:scale-[1.02]"
              }`}
            >
              <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-brand-900/50 border border-brand-600/30">
                {item.icon}
              </div>
              <div className="font-semibold text-xs text-slate-200">
                {item.title}
              </div>
              <div className="text-[10px] text-neutral mt-0.5 leading-tight">
                {item.desc}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
