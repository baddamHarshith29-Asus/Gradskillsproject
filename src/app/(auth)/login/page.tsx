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
      const res = await handleLoginAction(role);
      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
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
    <Card className="border-brand-500/30 bg-brand-800/70 backdrop-blur-md shadow-2xl w-full border">
      <CardHeader className="text-center pb-4">
        {/* Only visible on smaller screens when left pane is hidden */}
        <div className="lg:hidden mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-400/20 text-brand-400 border border-brand-400/30">
          <Building2 className="size-6" />
        </div>
        <div className="lg:hidden text-center mb-4">
          <span className="font-heading text-2xl font-black tracking-wider text-slate-100 uppercase">
            CoNexus
          </span>
          <span className="text-[10px] block font-semibold text-brand-400 tracking-widest uppercase">
            Operating System
          </span>
        </div>
        
        <CardTitle className="font-heading text-3xl font-extrabold tracking-tight text-white">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-slate-300 text-sm mt-1">
          Enter credentials or choose a quick login persona below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-950/40 border border-red-500/30 rounded-lg text-red-400 font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-xs bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium">
              {successMsg}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="demo@conexus.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-brand-600/60 bg-brand-900/50 text-slate-100 placeholder:text-neutral focus:border-brand-400 h-11 text-sm rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-brand-600/60 bg-brand-900/50 text-slate-100 placeholder:text-neutral focus:border-brand-400 h-11 text-sm rounded-lg"
            />
          </div>
          <Button
            type="submit"
            disabled={loading !== null}
            className="w-full bg-brand-400 text-white hover:bg-brand-300 transition-colors h-11 text-sm font-semibold rounded-lg shadow-lg shadow-brand-400/10"
          >
            {loading === "credentials" ? (
              "Signing in..."
            ) : (
              <>
                <LogIn className="mr-2 size-4" />
                Sign In to Dashboard
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-300">
          Don't have an employee account?{" "}
          <a href="/register" className="text-brand-300 hover:text-brand-200 font-bold underline transition-colors">
            Register as Staff
          </a>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-brand-600/40"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-brand-400">
            Quick-access simulator panel
          </span>
          <div className="flex-grow border-t border-brand-600/40"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickLogins.map((item) => (
            <button
              key={item.role}
              type="button"
              disabled={loading !== null}
              onClick={() => triggerLogin(item.role)}
              className={`flex flex-col items-start p-3 text-left border rounded-xl transition-all duration-200 ${item.color} ${
                loading === item.role ? "opacity-50 scale-[0.98]" : "hover:scale-[1.02] shadow-sm hover:shadow-md"
              }`}
            >
              <div className="mb-2.5 flex size-9 items-center justify-center rounded-lg bg-brand-950/70 border border-brand-600/40">
                {item.icon}
              </div>
              <div className="font-bold text-xs text-slate-200">
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
