"use client";

import React, { useState } from "react";
import { ScenarioType } from "@/types/iiot";
import { FlaskConical, Flame, Activity, TrendingDown, Power, FileWarning, WifiOff, RotateCcw, CheckCircle, Zap } from "lucide-react";
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
    onPublishCommand("all", "reset");
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString("en-GB"),
      target: "all",
      action: "RESET_NOMINAL",
      scenario: "RESET",
    };
    setCommandLogs((prev) => [newLog, ...prev.slice(0, 15)]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#131C18] border border-[#1A2821] flex items-center justify-center text-[#00F59B] shadow-[0_0_12px_rgba(0,245,155,0.2)]">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono uppercase text-white flex items-center space-x-2">
              <span>Interactive Fault Injection &amp; Verification Lab</span>
            </h2>
            <p className="text-xs font-mono text-[#8E9E96] mt-0.5">
              Live simulation interface: inject anomalies, evaluate Edge Gateway detection &amp; trigger alarms
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-mono bg-[#16231D] text-[#8E9E96] hover:text-white border border-[#1A2821] hover:bg-[#1F3328] transition-colors font-bold self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-[#00F59B]" />
          <span>Reset All to Nominal (RESET)</span>
        </button>
      </div>

      {/* Target & Parameters Selector */}
      <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-mono uppercase text-[#8E9E96] block mb-2">
            1. Select Target Industrial Asset:
          </label>
          <div className="flex flex-wrap gap-2">
            {fleetIds.map((id) => (
              <button
                key={id}
                onClick={() => setTargetDevice(id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-mono uppercase transition-all",
                  targetDevice === id
                    ? "bg-[#00F59B] text-[#050B08] font-bold shadow-[0_0_12px_rgba(0,245,155,0.3)]"
                    : "bg-[#070B09] text-[#8E9E96] border border-[#1A2821] hover:text-white"
                )}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono uppercase text-[#8E9E96] block mb-2">
            2. Scenario Duration: <span className="text-[#00F59B] font-bold">{durationSec}s</span>
          </label>
          <div className="flex items-center space-x-2">
            {[10, 20, 30, 60, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => setDurationSec(sec)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-mono transition-all border",
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

      {/* Scenarios Grid */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#8E9E96] mb-3">
          3. Available Anomaly Scenarios (Click to Inject):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Scenario 1: Thermal Overheat */}
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 flex flex-col justify-between hover:border-[#FF4D4D]/50 transition-colors shadow-lg">
            <div>
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-[#FF4D4D]" />
                <h4 className="font-mono font-bold text-white text-sm">Thermal Overheat</h4>
              </div>
              <p className="text-xs text-[#8E9E96] mt-2 font-mono">
                Ramps temperature progressively above 85°C to trigger Edge high-temperature alarm rule.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("THERMAL_OVERHEAT")}
              className="mt-4 w-full py-2 bg-[#FF4D4D]/15 border border-[#FF4D4D]/30 text-[#FF4D4D] hover:bg-[#FF4D4D]/25 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Inject Thermal Fault (THERMAL_OVERHEAT)
            </button>
          </div>

          {/* Scenario 2: Vibration Spike */}
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 flex flex-col justify-between hover:border-[#F59E0B]/50 transition-colors shadow-lg">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#F59E0B]" />
                <h4 className="font-mono font-bold text-white text-sm">Mechanical Vibration</h4>
              </div>
              <p className="text-xs text-[#8E9E96] mt-2 font-mono">
                Simulates bearing unbalance spike (&gt; 5.5 mm/s) to verify ISO 10816 critical alarm.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("VIBRATION_SPIKE")}
              className="mt-4 w-full py-2 bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/25 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Inject Vibration Spike (VIBRATION_SPIKE)
            </button>
          </div>

          {/* Scenario 3: Pressure Drop */}
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition-colors shadow-lg">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-cyan-400" />
                <h4 className="font-mono font-bold text-white text-sm">Line Pressure Drop</h4>
              </div>
              <p className="text-xs text-[#8E9E96] mt-2 font-mono">
                Collapses fluid pressure below 2.5 bar to simulate hydraulic cavitation or pipe rupture.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("PRESSURE_DROP")}
              className="mt-4 w-full py-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Inject Pressure Drop (PRESSURE_DROP)
            </button>
          </div>

          {/* Scenario 4: Machine Stop */}
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 flex flex-col justify-between hover:border-gray-500/50 transition-colors shadow-lg">
            <div>
              <div className="flex items-center space-x-2">
                <Power className="w-5 h-5 text-gray-300" />
                <h4 className="font-mono font-bold text-white text-sm">Emergency Stop</h4>
              </div>
              <p className="text-xs text-[#8E9E96] mt-2 font-mono">
                Transitions state machine to STOPPED, reducing mechanical velocity and thermal output.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("MACHINE_STOP")}
              className="mt-4 w-full py-2 bg-gray-500/15 border border-gray-500/30 text-gray-300 hover:bg-gray-500/25 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Force Machine Stop (MACHINE_STOP)
            </button>
          </div>

          {/* Scenario 5: Corrupted Payload */}
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-colors shadow-lg">
            <div>
              <div className="flex items-center space-x-2">
                <FileWarning className="w-5 h-5 text-purple-400" />
                <h4 className="font-mono font-bold text-white text-sm">Corrupted Payload</h4>
              </div>
              <p className="text-xs text-[#8E9E96] mt-2 font-mono">
                Sends malformed schema types to test Pydantic edge rejection and error quarantine.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("CORRUPTED_PAYLOAD")}
              className="mt-4 w-full py-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Inject Bad Payload (CORRUPTED_PAYLOAD)
            </button>
          </div>

          {/* Scenario 6: Network Silence */}
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 flex flex-col justify-between hover:border-rose-400/50 transition-colors shadow-lg">
            <div>
              <div className="flex items-center space-x-2">
                <WifiOff className="w-5 h-5 text-rose-300" />
                <h4 className="font-mono font-bold text-white text-sm">Network Silence</h4>
              </div>
              <p className="text-xs text-[#8E9E96] mt-2 font-mono">
                Suspends MQTT telemetry transmissions to test equipment timeout and offline status.
              </p>
            </div>
            <button
              onClick={() => handleTrigger("SILENCE")}
              className="mt-4 w-full py-2 bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Simulate Network Cut (SILENCE)
            </button>
          </div>
        </div>
      </div>

      {/* Command Dispatch Feedback Audit Log */}
      <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-xl">
        <h4 className="font-mono font-bold text-white text-xs uppercase mb-3">
          Command Dispatch Feedback Audit Log
        </h4>
        <div className="bg-[#070B09] border border-[#1A2821] rounded-xl p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1.5">
          {commandLogs.length === 0 ? (
            <div className="text-[#5C7268]">No injection commands dispatched yet. Ready for evaluation.</div>
          ) : (
            commandLogs.map((log) => (
              <div key={log.id} className="flex items-center space-x-2 text-gray-300">
                <span className="text-[#5C7268]">[{log.timestamp}]</span>
                <span className="text-[#00F59B] font-bold">{log.action}</span>
                <span>target={log.target}</span>
                {log.scenario && <span className="text-[#F59E0B] font-semibold">{log.scenario}</span>}
                <CheckCircle className="w-3.5 h-3.5 text-[#00F59B] ml-auto" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TestLab;
