// src/components/CarbonHeader.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Play,
  FastForward,
  Cpu,
  CloudSun,
  X,
  Sparkles,
} from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import type { CalendarState, TeamConfig } from "../types";

interface CarbonHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  calendarState: CalendarState | null;
  teamConfig: TeamConfig;
  activeLLMModel: string;
  isConnected?: boolean;
  isAdvancing?: boolean;
  onOpenAIInspector: () => void;
  onOpenAssistantManager: () => void;
  onAdvanceDay: () => void;
  onAdvanceToMatchday?: () => void;
  onPlayScheduledMatch: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "match" | "scout" | "training";
  read: boolean;
}

export const CarbonHeader: React.FC<CarbonHeaderProps> = ({
  searchQuery,
  onSearchChange,
  calendarState,
  teamConfig,
  activeLLMModel,
  isConnected = true,
  isAdvancing = false,
  onOpenAIInspector,
  onOpenAssistantManager,
  onAdvanceDay,
  onAdvanceToMatchday,
  onPlayScheduledMatch,
}) => {
  const isMatchday = calendarState?.isMatchday;
  const displayDate = calendarState?.date || "Saturday, 12 September 2026";
  const dayOfWeek = calendarState?.dayOfWeek ?? 6;
  const daysUntilMatch = isMatchday ? 0 : ((6 - (dayOfWeek % 7) + 7) % 7 || 7);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showManagerProfile, setShowManagerProfile] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif_1",
      title: "Fixture Scheduled",
      desc: "Gameweek #1 Matchday against FC Halifax Town is ready for kickoff.",
      time: "10m ago",
      type: "match",
      read: false,
    },
    {
      id: "notif_2",
      title: "Scout Report Added",
      desc: "Chief Scout Malcolm Davies flagged Archie Vance (ST) with 84 potential.",
      time: "1h ago",
      type: "scout",
      read: false,
    },
    {
      id: "notif_3",
      title: "Training Mastery Boost",
      desc: "Relentless Gegenpress drill boosted squad tactical mastery by +3%.",
      time: "3h ago",
      type: "training",
      read: true,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
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
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Date, Countdown & Weather */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--cds-text-secondary)" }}>
            <span style={{ fontWeight: "700", color: "var(--cds-text-primary)" }}>{displayDate}</span>
            {isMatchday ? (
              <span className="badge badge-error" style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px" }}>
                ⚡ MATCHDAY
              </span>
            ) : (
              <span className="badge badge-info" style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px" }}>
                {daysUntilMatch} day{daysUntilMatch === 1 ? "" : "s"} to Matchday
              </span>
            )}
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
              height: "34px",
              padding: "0 12px",
              fontSize: "12px",
              fontWeight: "600",
              gap: "6px",
              background: "var(--cds-layer)",
              borderColor: "var(--cds-border)",
              color: "var(--cds-text-primary)",
            }}
            title="Inspect Local AI Model Telemetry & Trait Resonance"
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: isConnected ? "var(--cds-green-primary)" : "var(--cds-red)",
              }}
            />
            <Cpu size={14} color="var(--cds-green-primary)" />
            <span>AI: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--cds-green-primary)" }}>{activeLLMModel}</strong></span>
          </button>

          {/* Assistant Manager Shortcut Button */}
          <button
            className="btn btn-secondary"
            onClick={onOpenAssistantManager}
            style={{
              height: "34px",
              padding: "0 12px",
              fontSize: "12px",
              fontWeight: "600",
              gap: "6px",
              background: "var(--cds-layer-selected)",
              borderColor: "var(--cds-green-primary)",
              color: "var(--cds-green-primary)",
            }}
            title="Open AI Assistant Coach Tactical Debrief"
          >
            <span>👔</span>
            <span>Assistant Coach</span>
          </button>

          {/* Notifications Bell with Popover */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              style={{
                position: "relative",
                background: showNotifications ? "var(--cds-layer)" : "transparent",
                border: "1px solid",
                borderColor: showNotifications ? "var(--cds-border)" : "transparent",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--cds-text-primary)",
                padding: "8px",
              }}
              title="Club Notifications & Alerts"
            >
              <Bell size={18} />
              {unreadNotifsCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "7px",
                    height: "7px",
                    background: "var(--cds-red)",
                    borderRadius: "50%",
                  }}
                />
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            {showNotifications && (
              <div
                className="carbon-card"
                style={{
                  position: "absolute",
                  top: "44px",
                  right: 0,
                  width: "320px",
                  padding: "0",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--cds-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--cds-layer)" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                    Club Notifications ({unreadNotifsCount})
                  </span>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={markAllNotifsRead}
                      style={{ background: "transparent", border: "none", color: "var(--cds-green-primary)", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--cds-border-subtle)",
                        background: n.read ? "transparent" : "var(--cds-layer-selected)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--cds-text-muted)" }}>{n.time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--cds-text-secondary)", lineHeight: 1.4 }}>
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Progression & Match Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {!isMatchday && onAdvanceToMatchday && (
              <button
                className="btn btn-secondary"
                onClick={onAdvanceToMatchday}
                disabled={isAdvancing}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  gap: "6px",
                  background: "var(--cds-layer)",
                  borderColor: "var(--cds-border)",
                  color: "var(--cds-text-primary)",
                  opacity: isAdvancing ? 0.6 : 1,
                  cursor: isAdvancing ? "not-allowed" : "pointer",
                }}
                title="Fast-forward calendar directly to Saturday Matchday"
              >
                <FastForward size={14} color="var(--cds-blue)" />
                <span>⏩ Matchday</span>
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={isMatchday ? onPlayScheduledMatch : onAdvanceDay}
              disabled={isAdvancing}
              style={{
                height: "36px",
                padding: "0 18px",
                fontSize: "13px",
                fontWeight: "700",
                gap: "6px",
                background: isMatchday ? "var(--cds-green-primary)" : "var(--cds-green-primary)",
                borderColor: isMatchday ? "var(--cds-green-primary)" : "var(--cds-green-primary)",
                boxShadow: isMatchday ? "0 0 14px rgba(15, 107, 69, 0.4)" : "none",
                opacity: isAdvancing ? 0.7 : 1,
                cursor: isAdvancing ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
              title={isMatchday ? "Kick off scheduled matchday" : "Advance to next calendar day"}
            >
              {isAdvancing ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⏳</span>
                  <span>Advancing...</span>
                </>
              ) : isMatchday ? (
                <>
                  <Play size={14} />
                  <span>PLAY MATCH</span>
                </>
              ) : (
                <>
                  <FastForward size={14} />
                  <span>CONTINUE</span>
                </>
              )}
            </button>
          </div>

          {/* Manager User Profile Pill (Opens Profile Modal) */}
          <div
            onClick={() => setShowManagerProfile(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 8px",
              borderRadius: "4px",
              borderLeft: "1px solid var(--cds-border-subtle)",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            title="Click to view Manager Profile & Career Record"
          >
            <PlayerAvatar name="Chris Manager" size="sm" teamColor="#0F6B45" />
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-primary)", lineHeight: 1.2 }}>
                Chris
              </span>
              <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                {teamConfig.name || "CAIRN FC"}
              </span>
            </div>
            <ChevronDown size={14} color="var(--cds-text-secondary)" />
          </div>
        </div>
      </header>

      {/* Manager Profile & Career Record Modal */}
      {showManagerProfile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(22, 22, 22, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
            padding: "16px",
          }}
        >
          <div
            className="carbon-card"
            style={{
              width: "100%",
              maxWidth: "540px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.16)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--cds-border)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <PlayerAvatar name="Chris Manager" size="lg" teamColor="#0F6B45" />
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)", margin: 0 }}>
                    Chris
                  </h2>
                  <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)", marginTop: "2px" }}>
                    Head Coach & Manager • {teamConfig.name || "Cairn Athletic FC"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowManagerProfile(false)}
                className="btn btn-secondary"
                style={{ padding: "6px 8px", height: "auto" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Manager Career Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div style={{ padding: "12px", background: "var(--cds-layer)", borderRadius: "4px", textAlign: "center", border: "1px solid var(--cds-border)" }}>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Win Rate</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--cds-green-primary)" }}>80.0%</div>
              </div>
              <div style={{ padding: "12px", background: "var(--cds-layer)", borderRadius: "4px", textAlign: "center", border: "1px solid var(--cds-border)" }}>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Record (W-D-L)</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--cds-text-primary)" }}>4 - 1 - 0</div>
              </div>
              <div style={{ padding: "12px", background: "var(--cds-layer)", borderRadius: "4px", textAlign: "center", border: "1px solid var(--cds-border)" }}>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Board Confidence</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#0F62FE" }}>88%</div>
              </div>
            </div>

            {/* Tactical Archetype */}
            <div style={{ padding: "14px", background: "var(--cds-green-light)", border: "1px solid var(--cds-green-primary)", borderRadius: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <Sparkles size={15} color="var(--cds-green-primary)" />
                <strong style={{ fontSize: "13px", color: "var(--cds-green-primary)" }}>
                  Tactical Archetype: High-Tempo Gegenpress Innovator
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--cds-text-primary)", lineHeight: 1.45 }}>
                Master of energetic pressing triggers and vertical ball progression. Highly respected by backroom coaching staff.
              </p>
            </div>

            {/* Philosophy Prompt */}
            <div>
              <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px" }}>
                Managerial Tactical Directive
              </div>
              <div style={{ background: "var(--cds-layer)", padding: "10px 12px", borderRadius: "4px", border: "1px solid var(--cds-border)", fontSize: "12px", color: "var(--cds-text-secondary)", fontStyle: "italic" }}>
                "{teamConfig.prompt || "Organised high-tempo tactical possession, compact defensive lines, energetic wing transitions."}"
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowManagerProfile(false)}
                style={{ height: "34px", fontSize: "13px" }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
