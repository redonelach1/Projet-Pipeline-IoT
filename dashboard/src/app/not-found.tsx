import React from "react";
import Link from "next/link";
import { ArrowLeft, Radio, Terminal, ServerOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-scada-bg text-scada-text flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased selection:bg-scada-neon selection:text-scada-pill-text">
      {/* Background ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-scada-neon/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-scada-alarm/5 rounded-full blur-[90px] pointer-events-none" />
      </div>

      <div className="relative w-full max-w-2xl bg-scada-surface border border-scada-border rounded-2xl shadow-scada-card p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header Card Info */}
        <div className="flex items-center justify-between border-b border-scada-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-scada-alarm-bg border border-scada-alarm-border flex items-center justify-center text-scada-alarm shadow-scada-alarm">
              <ServerOff className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-scada-alarm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-scada-alarm animate-pulse" />
                Fault Code: 0x404
              </div>
              <h2 className="text-sm font-semibold text-scada-text">
                SCADA Telemetry Network
              </h2>
            </div>
          </div>
          <div className="font-mono text-xs text-scada-text-muted px-3 py-1 rounded-full bg-scada-surface-nested border border-scada-border">
            NODE_UNREACHABLE
          </div>
        </div>

        {/* Central Display */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-3">
            <span className="text-6xl sm:text-7xl font-mono font-black text-scada-neon tracking-tight drop-shadow-[0_0_15px_rgba(0,245,155,0.4)]">
              404
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-scada-text">
              SCADA Node Not Found
            </h1>
          </div>
          <p className="text-sm sm:text-base text-scada-text-muted leading-relaxed max-w-xl">
            The requested industrial telemetry route, physical asset interface, or
            supervisory control node does not exist or has been decommissioned from the
            operational bus.
          </p>
        </div>

        {/* SCADA Node Telemetry Diagnostics Box */}
        <div className="bg-scada-surface-nested border border-scada-border rounded-xl p-4 font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between text-scada-text-subtle border-b border-scada-border/60 pb-2">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-scada-neon" />
              Diagnostic Trace
            </span>
            <span className="text-[#6E8277]">Protocol: MQTT over WS (9001)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-scada-text-muted">
            <div className="flex justify-between">
              <span>Target Route:</span>
              <span className="text-scada-alarm font-medium">UNKNOWN_ENDPOINT</span>
            </div>
            <div className="flex justify-between">
              <span>Bus Status:</span>
              <span className="text-scada-neon font-medium">OPERATIONAL</span>
            </div>
            <div className="flex justify-between">
              <span>Active Gateway:</span>
              <span className="text-scada-text font-medium">ENSAM-RABAT-GW01</span>
            </div>
            <div className="flex justify-between">
              <span>Telemetry Trace:</span>
              <span className="text-scada-neon font-medium">NFT_STANDALONE_OK</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-scada-border">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-scada-pill-active text-scada-pill-text font-bold text-sm shadow-scada-pill hover:bg-scada-neon-hover transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            Return to SCADA Overview
          </Link>
          <div className="text-xs text-scada-text-muted font-mono flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-scada-neon animate-pulse" />
            ENSAM Industrie 4.0 Operations Center
          </div>
        </div>
      </div>
    </div>
  );
}
