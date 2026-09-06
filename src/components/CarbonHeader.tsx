// src/components/CarbonHeader.tsx
import React from "react";
import { Search, Bell, ChevronDown, Play, FastForward, Cpu, CloudSun } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import type { CalendarState, TeamConfig } from "../types";

interface CarbonHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  calendarState: CalendarState | null;
  teamConfig: TeamConfig;
  activeLLMModel: string;
  isConnected?: boolean;
  onOpenAIInspector: () => void;
  onOpenAssistantManager: () => void;
  onAdvanceDay: () => void;
  onPlayScheduledMatch: () => void;
}

export const CarbonHeader: React.FC<CarbonHeaderProps> = ({
  searchQuery,
  onSearchChange,
  calendarState,
  teamConfig,
  activeLLMModel,
  isConnected = true,
  onOpenAIInspector,
  onOpenAssistantManager,
  onAdvanceDay,
  onPlayScheduledMatch,
}) => {
  const isMatchday = calendarState?.isMatchday;
  const displayDate = calendarState?.date || "Saturday, 12 September 2026";

  return (
    <header
      style={{
        height: "64px",
        background: "var(--cds-surface)",
        borderBottom: "1px solid var(--cds-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Left Search Bar */}
      <div style={{ position: "relative", width: "360px" }}>
        <Search
          size={16}
          color="var(--cds-text-muted)"
          style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
        />
        <input
          type="text"
          className="carbon-input"
          placeholder="Search players, staff, competitions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            paddingLeft: "36px",
            height: "36px",
            fontSize: "13px",
            background: "var(--cds-layer)",
            borderColor: "var(--cds-border)",
          }}
        />
      </div>

      {/* Right Controls: Date, Weather, Notifications, Profile, Action Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Date & Weather */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--cds-text-secondary)" }}>
          <span style={{ fontWeight: "500", color: "var(--cds-text-primary)" }}>{displayDate}</span>
          <span>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <CloudSun size={15} color="#0F62FE" />
            <span>14°C Partly cloudy</span>
          </div>
        </div>

        {/* Local AI Model Inspector Button */}
        <button
          className="btn btn-secondary"
          onClick={onOpenAIInspector}
          style={{
            height: "32px",
            padding: "0 10px",
            fontSize: "12px",
            fontWeight: "500",
            gap: "6px",
            borderColor: "var(--cds-border)",
          }}
          title="Inspect Local AI Model Telemetry & Trait Resonance"
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isConnected ? "var(--cds-green-primary)" : "var(--cds-red)",
            }}
          />
          <Cpu size={14} color="var(--cds-green-primary)" />
          <span>AI: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--cds-green-primary)" }}>{activeLLMModel}</strong></span>
        </button>

        {/* Assistant Manager Shortcut */}
        <button
          className="btn btn-secondary"
          onClick={onOpenAssistantManager}
          style={{
            height: "32px",
            padding: "0 10px",
            fontSize: "12px",
            fontWeight: "600",
            gap: "6px",
            color: "var(--cds-green-primary)",
            borderColor: "var(--cds-border)",
          }}
          title="Open AI Assistant Coach Tactical Debrief"
        >
          <span>👔</span>
          <span>Assistant</span>
        </button>

        {/* Notifications Bell */}
        <button
          style={{
            position: "relative",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cds-text-secondary)",
            padding: "6px",
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "6px",
              height: "6px",
              background: "var(--cds-red)",
              borderRadius: "50%",
            }}
          />
        </button>

        {/* Global Match Action Button */}
        <button
          className="btn btn-primary"
          onClick={isMatchday ? onPlayScheduledMatch : onAdvanceDay}
          style={{
            height: "36px",
            padding: "0 16px",
            fontSize: "13px",
            fontWeight: "600",
            gap: "6px",
            background: isMatchday ? "var(--cds-red)" : "var(--cds-green-primary)",
            borderColor: isMatchday ? "var(--cds-red)" : "var(--cds-green-primary)",
          }}
          title={isMatchday ? "Kick off scheduled matchday" : "Advance to next calendar day"}
        >
          {isMatchday ? <Play size={14} /> : <FastForward size={14} />}
          <span>{isMatchday ? "PLAY MATCH" : "CONTINUE"}</span>
        </button>

        {/* Manager User Profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingLeft: "8px",
            borderLeft: "1px solid var(--cds-border-subtle)",
            cursor: "pointer",
          }}
        >
          <PlayerAvatar name="Chris Manager" size="sm" teamColor="#0F6B45" />
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-primary)", lineHeight: 1.2 }}>
              Chris Manager
            </span>
            <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
              {teamConfig.name || "CAIRN FC"}
            </span>
          </div>
          <ChevronDown size={14} color="var(--cds-text-secondary)" />
        </div>
      </div>
    </header>
  );
};
