"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, User, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OperatorProfile {
  name: string;
  role: string;
  avatarUrl?: string;
  initials?: string;
  status?: "ACTIVE" | "AWAY" | "BUSY";
}

export interface TopBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isConnected?: boolean;
  brokerUrl?: string;
  operator?: OperatorProfile;
  activeAlarmsCount?: number;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  className?: string;
}

export function TopBar({
  searchQuery = "",
  onSearchChange,
  isConnected = false,
  brokerUrl = "ws://localhost:9001",
  operator = {
    name: "Operator RedNa",
    role: "SCADA Operations Lead",
    initials: "RN",
    status: "ACTIVE",
  },
  activeAlarmsCount = 0,
  onToggleSidebar,
  onOpenMobileSidebar,
  className,
}: TopBarProps) {
  const [internalQuery, setInternalQuery] = useState(searchQuery);

  useEffect(() => {
    setInternalQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleClear = () => {
    setInternalQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const resolvedOperator: OperatorProfile = {
    name: operator?.name || "Operator RedNa",
    role: operator?.role || "SCADA Operations Lead",
    initials: operator?.initials || "RN",
    status: operator?.status || "ACTIVE",
    avatarUrl: operator?.avatarUrl,
  };

  const toggleSidebarFn = onToggleSidebar || onOpenMobileSidebar;

  return (
    <header
      data-testid="topbar"
      className={cn(
        "h-16 sm:h-20 px-4 sm:px-6 lg:px-8 border-b border-[#1A2821] bg-[#070B09]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-4 transition-all",
        className
      )}
    >
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md sm:max-w-lg">
        {toggleSidebarFn && (
          <button
            type="button"
            onClick={toggleSidebarFn}
            aria-label="Toggle navigation sidebar"
            data-testid="mobile-sidebar-toggle"
            className="lg:hidden p-2 rounded-lg bg-[#131C18] border border-[#1A2821] text-[#667A71] hover:text-[#00F59B] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#667A71] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={internalQuery}
            onChange={handleInputChange}
            placeholder="Search equipment, alerts, telemetry..."
            aria-label="Search equipment, alerts, telemetry..."
            data-testid="topbar-search-input"
            className="w-full bg-[#131C18] text-white placeholder-[#667A71] text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2 sm:py-2.5 border border-[#1A2821] transition-all duration-200 focus:outline-none focus:border-[#00F59B] focus:ring-1 focus:ring-[#00F59B]/40 focus:shadow-[0_0_15px_rgba(0,245,155,0.15)] font-sans"
          />
          {internalQuery ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667A71] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[#667A71] bg-[#0D1411] border border-[#1A2821] rounded absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Right: MQTT Stream Health & Operator Profile Card */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* MQTT Connection Status Pill */}
        <div
          data-testid="broker-status-pill"
          title={`MQTT Broker: ${brokerUrl}`}
          className={cn(
            "hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border transition-colors",
            isConnected
              ? "bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/30 shadow-[0_0_10px_rgba(0,245,155,0.15)]"
              : "bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/30"
          )}
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F59B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F59B]" />
              </span>
              <span className="tracking-wide">WS:9001 LIVE</span>
            </>
          ) : (
            <>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4D4D]" />
              <span className="tracking-wide">OFFLINE</span>
            </>
          )}
        </div>

        {/* Operator Profile Card */}
        <div
          data-testid="operator-profile-card"
          className="flex items-center gap-3 pl-2 sm:pl-3 pr-2 py-1.5 rounded-xl hover:bg-[#131C18]/60 transition-colors border border-transparent hover:border-[#1A2821] cursor-pointer group select-none"
        >
          {/* Avatar with Neon Mint Ring */}
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#00F59B] shadow-[0_0_12px_rgba(0,245,155,0.35)] bg-[#111A16] flex items-center justify-center font-bold text-xs sm:text-sm text-[#00F59B] overflow-hidden transition-transform group-hover:scale-105">
              {resolvedOperator.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvedOperator.avatarUrl}
                  alt={resolvedOperator.name}
                  className="w-full h-full object-cover"
                />
              ) : resolvedOperator.initials ? (
                <span>{resolvedOperator.initials}</span>
              ) : (
                <User className="w-5 h-5 text-[#00F59B]" />
              )}
            </div>
            {/* Status Indicator Dot */}
            <span
              className={cn(
                "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#070B09]",
                resolvedOperator.status === "ACTIVE" || !resolvedOperator.status
                  ? "bg-[#00F59B] shadow-[0_0_6px_#00F59B]"
                  : resolvedOperator.status === "AWAY"
                  ? "bg-[#F59E0B]"
                  : "bg-[#FF4D4D]"
              )}
            />
          </div>

          {/* Operator Name & Role Typography Block */}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs sm:text-sm font-semibold text-white tracking-wide group-hover:text-[#00F59B] transition-colors leading-tight">
              {resolvedOperator.name.length > 28
                ? `${resolvedOperator.name.substring(0, 25)}...`
                : resolvedOperator.name}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#667A71] font-mono tracking-tight leading-tight mt-0.5">
              {resolvedOperator.role}
            </span>
          </div>

          {/* Chevron Dropdown */}
          <ChevronDown className="w-4 h-4 text-[#667A71] group-hover:text-white transition-colors ml-0.5 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
