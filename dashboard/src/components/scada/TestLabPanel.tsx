"use client";

import React, { useState } from "react";
import { ScenarioType } from "@/types/iiot";
import {
  FlaskConical,
  Flame,
  Activity,
  TrendingDown,
  Power,
  FileWarning,
  WifiOff,
  RotateCcw,
  Play,
  Zap,
  CheckCircle2,
  Clock,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestLabPanelProps {
  onInjectFault?: (scenario: ScenarioType, targetDevice: string, durationSec: number) => void;
  onReset?: () => void;
  onPublishCommand?: (
    deviceId: string | "all",
    action: "set_scenario" | "reset",
    scenario?: ScenarioType,
    durationSec?: number
  ) => void;
  className?: string;
}

interface ScenarioMeta {
  type: ScenarioType;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderColor: string;
}

const SCENARIOS: ScenarioMeta[] = [
  {
    type: "THERMAL_OVERHEAT",
    name: "Thermal Overheat",
    category: "Temperature",
    description: "Ramps temperature above 85°C to test edge threshold trip.",
    icon: Flame,
    accentColor: "text-[#FF4D4D]",
    borderColor: "hover:border-[#FF4D4D]/50",
  },
  {
    type: "VIBRATION_SPIKE",
    name: "Vibration Spike",
    category: "Mechanical",
    description: "Induces bearing unbalance > 5.5 mm/s ISO 10816 critical alarm.",
    icon: Activity,
    accentColor: "text-[#F59E0B]",
    borderColor: "hover:border-[#F59E0B]/50",
  },
  {
    type: "PRESSURE_DROP",
    name: "Pressure Drop",
    category: "Hydraulic",
    description: "Collapses line pressure < 2.5 bar to simulate line breach.",
    icon: TrendingDown,
    accentColor: "text-cyan-400",
    borderColor: "hover:border-cyan-500/50",
  },
  {
    type: "MACHINE_STOP",
    name: "Machine Stop",
    category: "State Machine",
    description: "Forces emergency stop to decelerate velocity to 0.",
    icon: Power,
    accentColor: "text-gray-300",
    borderColor: "hover:border-gray-500/50",
  },
  {
    type: "CORRUPTED_PAYLOAD",
    name: "Corrupted Payload",
    category: "Integrity",
    description: "Dispatches malformed JSON payload to trigger edge quarantine.",
    icon: FileWarning,
    accentColor: "text-purple-400",
    borderColor: "hover:border-purple-500/50",
  },
  {
    type: "SILENCE",
    name: "Network Silence",
    category: "Connectivity",
    description: "Simulates transport loss & equipment heartbeat timeout.",
    icon: WifiOff,
    accentColor: "text-rose-300",
    borderColor: "hover:border-rose-400/50",
  },
];

const TARGET_EQUIPMENT = [
  { id: "all", label: "Broadcast (All Fleet)", type: "FLEET" },
  { id: "motor-01", label: "motor-01 (Drive)", type: "MOTOR" },
  { id: "motor-02", label: "motor-02 (Aux)", type: "MOTOR" },
  { id: "pump-01", label: "pump-01 (Coolant)", type: "PUMP" },
  { id: "compressor-01", label: "compressor-01 (Pneumatic)", type: "COMPRESSOR" },
  { id: "conveyor-01", label: "conveyor-01 (Feeder)", type: "CONVEYOR" },
  { id: "robot-01", label: "robot-01 (Assembly)", type: "ROBOT" },
  { id: "cnc-01", label: "cnc-01 (Milling)", type: "CNC" },
  { id: "furnace-01", label: "furnace-01 (Thermal)", type: "FURNACE" },
];

export function TestLabPanel({
  onInjectFault,
  onReset,
  onPublishCommand,
  className,
}: TestLabPanelProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>("THERMAL_OVERHEAT");
  const [targetDevice, setTargetDevice] = useState<string>("motor-01");
  const [durationSec, setDurationSec] = useState<number>(30);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  const handleInject = () => {
    // Dispatch via props
    if (onInjectFault) {
      onInjectFault(selectedScenario, targetDevice, durationSec);
    }
    if (onPublishCommand) {
      onPublishCommand(targetDevice, "set_scenario", selectedScenario, durationSec);
    }

    setLastActionFeedback(`Injected [${selectedScenario}] on ${targetDevice} (${durationSec}s)`);
    setTimeout(() => setLastActionFeedback(null), 4000);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    if (onPublishCommand) {
      onPublishCommand("all", "reset");
    }

    setLastActionFeedback("System Reset to Nominal Dispatched");
    setTimeout(() => setLastActionFeedback(null), 4000);
  };

  return (
    <div
      className={cn(
        "bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between",
        className
      )}
    >
      <div>
        {/* Header (Matching Reference Design Right Column Card Format) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1A2821]/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#131C18] border border-[#1A2821] flex items-center justify-center text-[#00F59B] shadow-[0_0_12px_rgba(0,245,155,0.15)]">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-mono font-bold text-white tracking-wide">
                  Industrial Test Lab
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-ping" />
              </div>
              <p className="text-xs font-mono text-[#8E9E96] mt-0.5">
                Fault Injection &amp; Dynamics Simulation
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 bg-[#070B09] border border-[#1A2821] text-[#00F59B] rounded-full">
            Live Lab
          </span>
        </div>

        {/* 1. Target Equipment Selector */}
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-mono text-[#8E9E96] uppercase tracking-wider flex items-center justify-between">
            <span>Target Equipment</span>
            <span className="text-[11px] font-mono text-[#00F59B]">{targetDevice}</span>
          </label>
          <div className="relative">
            <select
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
              className="w-full bg-[#070B09] border border-[#1A2821] focus:border-[#00F59B] rounded-xl px-3 py-2 text-xs font-mono text-white appearance-none cursor-pointer focus:outline-none transition-colors"
            >
              {TARGET_EQUIPMENT.map((eq) => (
                <option key={eq.id} value={eq.id} className="bg-[#0D1411] text-white">
                  {eq.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#8E9E96]">
              <Settings2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 2. Scenario Grid (6 Scenarios) */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-mono text-[#8E9E96] uppercase tracking-wider block">
            Select Anomaly Scenario
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map((sc) => {
              const IconComp = sc.icon;
              const isSelected = selectedScenario === sc.type;
              return (
                <button
                  key={sc.type}
                  type="button"
                  onClick={() => setSelectedScenario(sc.type)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group",
                    isSelected
                      ? "bg-[#131C18] border-[#00F59B] shadow-[0_0_12px_rgba(0,245,155,0.2)]"
                      : "bg-[#070B09] border-[#1A2821] hover:bg-[#0D1411]",
                    sc.borderColor
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center border",
                        isSelected
                          ? "bg-[#00F59B]/20 border-[#00F59B]/40 text-[#00F59B]"
                          : "bg-[#0D1411] border-[#1A2821]",
                        sc.accentColor
                      )}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B] shadow-[0_0_6px_#00F59B]" />
                    )}
                  </div>

                  <div className="mt-2">
                    <span className="text-xs font-mono font-bold text-white block truncate">
                      {sc.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#5C7268] block truncate">
                      {sc.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Duration Slider / Stepper (10s to 120s) */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8E9E96] uppercase tracking-wider">Fault Duration</span>
            <span className="font-bold text-[#00F59B] bg-[#070B09] border border-[#1A2821] px-2 py-0.5 rounded">
              {durationSec}s
            </span>
          </div>

          {/* Slider input */}
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={durationSec}
            onChange={(e) => setDurationSec(Number(e.target.value))}
            className="w-full h-1.5 bg-[#16231D] rounded-lg appearance-none cursor-pointer accent-[#00F59B]"
          />

          {/* Stepper preset buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[10, 30, 60, 120].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setDurationSec(sec)}
                className={cn(
                  "py-1 rounded-lg text-[11px] font-mono transition-all border",
                  durationSec === sec
                    ? "bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/40 font-bold"
                    : "bg-[#070B09] text-[#8E9E96] border-[#1A2821] hover:text-white"
                )}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Action CTAs */}
      <div className="mt-5 space-y-2.5 pt-3 border-t border-[#1A2821]/80">
        {/* Feedback Alert if recently dispatched */}
        {lastActionFeedback && (
          <div className="p-2 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B] text-xs font-mono flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{lastActionFeedback}</span>
          </div>
        )}

        {/* Primary CTA: Solid Neon Green "INJECT SCENARIO" */}
        <button
          type="button"
          onClick={handleInject}
          className="w-full bg-[#00F59B] hover:bg-[#00F59B]/90 text-[#050B08] font-bold rounded-xl shadow-[0_0_15px_rgba(0,245,155,0.35)] py-3 px-4 flex items-center justify-center space-x-2 font-mono text-xs tracking-wider uppercase transition-all duration-150 active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>INJECT SCENARIO</span>
        </button>

        {/* Secondary CTA: "RESET SYSTEM" Button */}
        <button
          type="button"
          onClick={handleReset}
          className="w-full bg-[#16231D] hover:bg-[#1F3328] border border-[#1A2821] text-[#8E9E96] hover:text-white rounded-xl py-2.5 px-4 font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-all duration-150"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET SYSTEM</span>
        </button>
      </div>
    </div>
  );
}

export default TestLabPanel;
