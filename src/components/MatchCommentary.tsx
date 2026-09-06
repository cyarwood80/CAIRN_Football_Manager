// src/components/MatchCommentary.tsx
import React, { useState } from "react";
import { Activity, Radio, Filter, Award, ShieldAlert, Sparkles, RefreshCw, Megaphone, Flag } from "lucide-react";
import type { MatchEvent, CrowdAtmosphere } from "../types";

interface MatchCommentaryProps {
  events: MatchEvent[];
  homeTeamColor?: string;
  awayTeamColor?: string;
  crowdAtmosphere?: CrowdAtmosphere;
}

export const MatchCommentary: React.FC<MatchCommentaryProps> = ({
  events,
  homeTeamColor = "var(--cds-green-primary)",
  awayTeamColor = "var(--cds-red)",
  crowdAtmosphere,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "goals_shots" | "defense" | "tactics_subs">("all");

  const filteredEvents = events.filter((e) => {
    if (activeFilter === "goals_shots") return e.type === "goal" || e.type === "shot";
    if (activeFilter === "defense") return e.type === "save" || e.type === "tackle";
    if (activeFilter === "tactics_subs") return e.type === "sub" || e.type === "tactic";
    return true;
  });

  const getEventBadge = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal":
        return {
          icon: <Award size={13} color="#161616" />,
          bg: "#fef08a",
          border: "#fde047",
          color: "#854d0e",
          label: "GOAL",
        };
      case "shot":
        return {
          icon: <Sparkles size={13} color="#0284c7" />,
          bg: "#e0f2fe",
          border: "#bae6fd",
          color: "#0369a1",
          label: "SHOT",
        };
      case "save":
        return {
          icon: <ShieldAlert size={13} color="#0F6B45" />,
          bg: "#e6f4ea",
          border: "#b7e1cd",
          color: "#0F6B45",
          label: "SAVE",
        };
      case "tackle":
        return {
          icon: <Activity size={13} color="#d97706" />,
          bg: "#fef3c7",
          border: "#fde68a",
          color: "#b45309",
          label: "TACKLE",
        };
      case "sub":
        return {
          icon: <RefreshCw size={13} color="#7c3aed" />,
          bg: "#f3e8ff",
          border: "#e9d5ff",
          color: "#6d28d9",
          label: "SUB",
        };
      case "tactic":
        return {
          icon: <Megaphone size={13} color="#e11d48" />,
          bg: "#ffe4e6",
          border: "#fecdd3",
          color: "#be123c",
          label: "TACTIC",
        };
      case "whistle":
        return {
          icon: <Flag size={13} color="#475569" />,
          bg: "#f1f5f9",
          border: "#e2e8f0",
          color: "#334155",
          label: "WHISTLE",
        };
      default:
        return {
          icon: <Radio size={13} color="#0F6B45" />,
          bg: "var(--cds-layer)",
          border: "var(--cds-border)",
          color: "var(--cds-text-primary)",
          label: "MATCH",
        };
    }
  };

  return (
    <div
      className="carbon-card"
      style={{
        padding: "12px 16px",
        background: "var(--cds-surface)",
        border: "1px solid var(--cds-border)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
      }}
    >
      {/* Top Header Row with Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          borderBottom: "1px solid var(--cds-border-subtle)",
          paddingBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Radio size={15} color="var(--cds-green-primary)" />
          <div>
            <div style={{ fontWeight: "700", fontSize: "12px", letterSpacing: "0.02em", color: "var(--cds-text-primary)" }}>
              MATCHDAY COMMENTARY & EVENT FEED
            </div>
            {crowdAtmosphere && (
              <div style={{ fontSize: "11px", color: "var(--cds-text-secondary)", display: "flex", alignItems: "center", gap: "6px", marginTop: "1px" }}>
                <span>📢 {crowdAtmosphere.decibels} dB • {crowdAtmosphere.venue === "home" ? "Home Ground" : "Away"}</span>
                {crowdAtmosphere.homeExpectationPenalty && (
                  <span className="badge badge-error" style={{ fontSize: "10px", padding: "0 4px" }}>
                    ⚠️ Crowd Restless
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <Filter size={12} color="var(--cds-text-muted)" style={{ marginRight: "2px" }} />
          <button
            type="button"
            className={`btn ${activeFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "2px 8px", fontSize: "11px", height: "24px" }}
            onClick={() => setActiveFilter("all")}
          >
            All ({events.length})
          </button>
          <button
            type="button"
            className={`btn ${activeFilter === "goals_shots" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "2px 8px", fontSize: "11px", height: "24px" }}
            onClick={() => setActiveFilter("goals_shots")}
          >
            ⚽ Goals
          </button>
          <button
            type="button"
            className={`btn ${activeFilter === "defense" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "2px 8px", fontSize: "11px", height: "24px" }}
            onClick={() => setActiveFilter("defense")}
          >
            🧤 Defense
          </button>
          <button
            type="button"
            className={`btn ${activeFilter === "tactics_subs" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "2px 8px", fontSize: "11px", height: "24px" }}
            onClick={() => setActiveFilter("tactics_subs")}
          >
            🔄 Tactics
          </button>
        </div>
      </div>

      {/* Events List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          maxHeight: "160px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "14px", color: "var(--cds-text-muted)", fontSize: "12px" }}>
            No commentary events recorded yet.
          </div>
        ) : (
          filteredEvents.map((e, idx) => {
            const badge = getEventBadge(e.type);
            const isLatest = idx === 0;

            return (
              <div
                key={e.id || idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 80px 1fr",
                  alignItems: "center",
                  gap: "10px",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  background: isLatest ? "var(--cds-layer)" : "var(--cds-surface)",
                  border: isLatest ? "1px solid var(--cds-border)" : "1px solid var(--cds-border-subtle)",
                  borderLeft: isLatest
                    ? `3px solid ${homeTeamColor}`
                    : e.type === "goal"
                    ? `3px solid ${awayTeamColor}`
                    : "3px solid transparent",
                  transition: "background 0.2s ease",
                }}
              >
                {/* Minute */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: "700",
                    fontSize: "11px",
                    color: "var(--cds-text-primary)",
                    background: "var(--cds-layer-hover)",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    textAlign: "center",
                  }}
                >
                  {e.minute}'
                </div>

                {/* Event Category Badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    padding: "2px 6px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.03em",
                    justifyContent: "center",
                  }}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>

                {/* Event Content Text */}
                <div
                  style={{
                    fontSize: "12px",
                    lineHeight: "1.35",
                    color: "var(--cds-text-primary)",
                    fontWeight: e.type === "goal" ? "700" : isLatest ? "600" : "400",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <span>{e.text}</span>
                  {e.promptAttribution && (
                    <span
                      style={{
                        background: "rgba(15, 107, 69, 0.12)",
                        border: "1px solid #A7F0BA",
                        color: "var(--cds-green-primary)",
                        fontSize: "9.5px",
                        fontWeight: "700",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                      title={`Triggered by manager prompt: "${e.promptAttribution.prompt}"`}
                    >
                      ⚡ {e.promptAttribution.shift}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
