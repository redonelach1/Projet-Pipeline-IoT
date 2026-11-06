"use client";

import React, { useState } from "react";
import { ScenarioType } from "@/types/iiot";
import { FlaskConical, Flame, Activity, TrendingDown, Power, FileWarning, WifiOff, RotateCcw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestLabProps {
  onPublishCommand: (
    deviceId: string | "all",
    action: "set_scenario" | "reset",
    scenario?: ScenarioType,
    durationSec?: number
  ) => void;
}

export function TestLab({ onPublishCommand }: TestLabProps) {
  const [targetDevice, setTargetDevice] = useState<string>("motor-01");
  const [durationSec, setDurationSec] = useState<number>(30);
  const [commandLogs, setCommandLogs] = useState<
    Array<{ id: number; timestamp: string; target: string; action: string; scenario?: string }>
  >([]);

  const fleetIds = ["motor-01", "motor-02", "pump-01", "compressor-01", "conveyor-01", "all"];

  const handleTrigger = (scenario: ScenarioType) => {
    onPublishCommand(targetDevice, "set_scenario", scenario, durationSec);
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString("en-GB"),
      target: targetDevice,
      action: "SET_SCENARIO",
      scenario,
    };
    setCommandLogs((prev) => [newLog, ...prev.slice(0, 15)]);
  };

  const handleReset = () => {
    onPublishCommand(targetDevice, "reset");
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString("en-GB"),
      target: targetDevice,
      action: "RESET_NOMINAL",
    };
    setCommandLogs((prev) => [newLog, ...prev.slice(0, 15)]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-industrial-panel border border-industrial-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-mono uppercase text-white flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-industrial-cyan" />
            <span>Interactive Fault Injection & Verification Lab</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time evaluation interface for oral defense: inject anomalies and verify Edge Gateway reactions
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors font-bold self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All to Nominal</span>
        </button>
      </div>

      {/* Target & Parameters Selector */}
      <div className="bg-industrial-panel border border-industrial-border rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-mono uppercase text-gray-400 block mb-2">
            1. Select Target Industrial Asset:
          </label>
          <div className="flex flex-wrap gap-2">
            {fleetIds.map((id) => (
              <button
                key={id}
                onClick={() => setTargetDevice(id)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-mono uppercase transition-all",
                  targetDevice === id
                    ? "bg-industrial-cyan text-black font-bold shadow-sm"
                    : "bg-industrial-dark text-gray-400 border border-industrial-border hover:text-white"
                )}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono uppercase text-gray-400 block mb-2">
            2. Scenario Duration: <span className="text-industrial-cyan font-bold">{durationSec}s</span>
          </label>
          <div className="flex items-center space-x-2">
            {[10, 20, 30, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => setDurationSec(sec)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-mono transition-all",
                  durationSec === sec
                    ? "bg-industrial-border text-white font-bold"
                    : "bg-industrial-dark text-gray-400 hover:text-white"
                )}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
          3. Available Anomaly Scenarios (Click to Inject):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Scenario 1: Thermal Overheat */}
          <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4 flex flex-col justify-between hover:border-rose-500/40 transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <h4 className="font-mono font-bold text-white text-sm">Thermal Overheat</h4>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                Ramps temperature progressively above 85°C to trigger Edge high-temperature alarm rule.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("THERMAL_OVERHEAT")}
              className="mt-4 w-full py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 rounded text-xs font-mono font-bold transition-colors"
            >
              Inject Thermal Fault
            </button>
          </div>

          {/* Scenario 2: Vibration Spike */}
          <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h4 className="font-mono font-bold text-white text-sm">Mechanical Vibration</h4>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                Simulates bearing unbalance spike (&gt; 5.5 mm/s) to verify ISO 10816 critical alarm.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("VIBRATION_SPIKE")}
              className="mt-4 w-full py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded text-xs font-mono font-bold transition-colors"
            >
              Inject Vibration Spike
            </button>
          </div>

          {/* Scenario 3: Pressure Drop */}
          <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-cyan-400" />
                <h4 className="font-mono font-bold text-white text-sm">Line Pressure Drop</h4>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                Collapses fluid pressure below 2.5 bar to simulate hydraulic cavitation or pipe rupture.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("PRESSURE_DROP")}
              className="mt-4 w-full py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 rounded text-xs font-mono font-bold transition-colors"
            >
              Inject Pressure Drop
            </button>
          </div>

          {/* Scenario 4: Machine Stop */}
          <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4 flex flex-col justify-between hover:border-gray-500/40 transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <Power className="w-5 h-5 text-gray-300" />
                <h4 className="font-mono font-bold text-white text-sm">Emergency Stop</h4>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                Transitions state machine to STOPPED, reducing mechanical velocity and thermal output.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("MACHINE_STOP")}
              className="mt-4 w-full py-2 bg-gray-500/10 border border-gray-500/30 text-gray-300 hover:bg-gray-500/20 rounded text-xs font-mono font-bold transition-colors"
            >
              Force Machine Stop
            </button>
          </div>

          {/* Scenario 5: Corrupted Payload */}
          <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4 flex flex-col justify-between hover:border-rose-500/40 transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <FileWarning className="w-5 h-5 text-rose-300" />
                <h4 className="font-mono font-bold text-white text-sm">Corrupted Payload</h4>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                Sends malformed schema types to test Pydantic edge rejection and error quarantine.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("CORRUPTED_PAYLOAD")}
              className="mt-4 w-full py-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 rounded text-xs font-mono font-bold transition-colors"
            >
              Inject Bad Payload
            </button>
          </div>

          {/* Scenario 6: Network Silence */}
          <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <WifiOff className="w-5 h-5 text-purple-400" />
                <h4 className="font-mono font-bold text-white text-sm">Network Silence</h4>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                Suspends MQTT telemetry transmissions to test equipment timeout and offline status.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("SILENCE")}
              className="mt-4 w-full py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded text-xs font-mono font-bold transition-colors"
            >
              Simulate Network Cut
            </button>
          </div>
        </div>
      </div>

      {/* Command Dispatch Feedback Audit Log */}
      <div className="bg-industrial-panel border border-industrial-border rounded-lg p-5">
        <h4 className="font-mono font-bold text-white text-xs uppercase mb-3">
          Command Dispatch Feedback Audit Log
        </h4>
        <div className="bg-industrial-dark border border-industrial-border rounded p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1.5">
          {commandLogs.length === 0 ? (
            <div className="text-gray-500">No injection commands dispatched yet. Ready for evaluation.</div>
          ) : (
            commandLogs.map((log) => (
              <div key={log.id} className="flex items-center space-x-2 text-gray-300">
                <span className="text-gray-500">[{log.timestamp}]</span>
                <span className="text-industrial-cyan font-bold">{log.action}</span>
                <span>target={log.target}</span>
                {log.scenario && <span className="text-amber-400 font-semibold">{log.scenario}</span>}
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

