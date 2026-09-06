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
  homeTeamColor = "#00f2fe",
  awayTeamColor = "#ef4444",
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
          icon: <Award size={14} color="#000" />,
          bg: "linear-gradient(135deg, #ffd700, #ffaa00)",
          border: "#ffe066",
          color: "#000",
          label: "GOAL",
        };
      case "shot":
        return {
          icon: <Sparkles size={14} color="#38bdf8" />,
          bg: "rgba(56, 189, 248, 0.15)",
          border: "rgba(56, 189, 248, 0.4)",
          color: "#38bdf8",
          label: "SHOT",
        };
      case "save":
        return {
          icon: <ShieldAlert size={14} color="#10b981" />,
          bg: "rgba(16, 185, 129, 0.15)",
          border: "rgba(16, 185, 129, 0.4)",
          color: "#10b981",
          label: "SAVE",
        };
      case "tackle":
        return {
          icon: <Activity size={14} color="#f59e0b" />,
          bg: "rgba(245, 158, 11, 0.15)",
          border: "rgba(245, 158, 11, 0.4)",
          color: "#f59e0b",
          label: "TACKLE",
        };
      case "sub":
        return {
          icon: <RefreshCw size={14} color="#c084fc" />,
          bg: "rgba(192, 132, 252, 0.2)",
          border: "rgba(192, 132, 252, 0.5)",
          color: "#c084fc",
          label: "SUB",
        };
      case "tactic":
        return {
          icon: <Megaphone size={14} color="#fb7185" />,
          bg: "rgba(251, 113, 133, 0.2)",
          border: "rgba(251, 113, 133, 0.5)",
          color: "#fb7185",
          label: "TACTIC",
        };
      case "whistle":
        return {
          icon: <Flag size={14} color="#e2e8f0" />,
          bg: "rgba(255, 255, 255, 0.15)",
          border: "rgba(255, 255, 255, 0.3)",
          color: "#fff",
          label: "WHISTLE",
        };
      default:
        return {
          icon: <Radio size={14} color="var(--accent-cyan)" />,
          bg: "rgba(0, 242, 254, 0.1)",
          border: "rgba(0, 242, 254, 0.3)",
          color: "var(--accent-cyan)",
          label: "MATCH",
        };
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: "16px 20px",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "linear-gradient(180deg, rgba(17, 24, 39, 0.85) 0%, rgba(11, 15, 25, 0.95) 100%)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
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
          gap: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "rgba(255, 215, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 215, 0, 0.3)",
            }}
          >
            <Radio size={16} color="var(--accent-gold)" className="animate-pulse" />
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.95rem", letterSpacing: "0.02em", color: "#fff" }}>
              FULL-WIDTH MATCHDAY COMMENTARY & EVENT FEED
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span>Real-time tick-by-tick tactical commentary, strikes, saves, and touchline orders</span>
              {crowdAtmosphere && (
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.68rem",
                    fontWeight: "800",
                    background: crowdAtmosphere.homeExpectationPenalty ? "rgba(239, 68, 68, 0.2)" : "rgba(6, 182, 212, 0.2)",
                    color: crowdAtmosphere.homeExpectationPenalty ? "#f87171" : "#22d3ee",
                    border: `1px solid ${crowdAtmosphere.homeExpectationPenalty ? "rgba(239, 68, 68, 0.4)" : "rgba(6, 182, 212, 0.4)"}`,
                  }}
                >
                  📢 {crowdAtmosphere.decibels} dB • {crowdAtmosphere.venue === "home" ? "Home Ground" : "Away"} • {crowdAtmosphere.homeExpectationPenalty ? "⚠️ Crowd Restless (Expectation Penalty)" : "Roaring Support"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <Filter size={13} color="var(--text-muted)" style={{ marginRight: "2px" }} />
          <button
            className={`btn ${activeFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "4px 10px", fontSize: "0.74rem" }}
            onClick={() => setActiveFilter("all")}
          >
            All Events ({events.length})
          </button>
          <button
            className={`btn ${activeFilter === "goals_shots" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "4px 10px", fontSize: "0.74rem" }}
            onClick={() => setActiveFilter("goals_shots")}
          >
            ⚽ Goals & Shots
          </button>
          <button
            className={`btn ${activeFilter === "defense" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "4px 10px", fontSize: "0.74rem" }}
            onClick={() => setActiveFilter("defense")}
          >
            🧤 Saves & Tackles
          </button>
          <button
            className={`btn ${activeFilter === "tactics_subs" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "4px 10px", fontSize: "0.74rem" }}
            onClick={() => setActiveFilter("tactics_subs")}
          >
            🔄 Subs & Tactics
          </button>
        </div>
      </div>

      {/* Events List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "180px",
          overflowY: "auto",
          paddingRight: "6px",
        }}
      >
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "18px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No commentary events matching current filter yet.
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
                  gridTemplateColumns: "55px 95px 1fr",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: isLatest ? "rgba(0, 242, 254, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  border: isLatest ? "1px solid rgba(0, 242, 254, 0.25)" : "1px solid rgba(255, 255, 255, 0.04)",
                  borderLeft: isLatest ? `3px solid ${homeTeamColor}` : e.type === "goal" ? `3px solid ${awayTeamColor}` : "3px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Minute */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: "800",
                    fontSize: "0.85rem",
                    color: isLatest ? "var(--accent-cyan)" : "var(--accent-gold)",
                    background: "rgba(0, 0, 0, 0.3)",
                    padding: "3px 6px",
                    borderRadius: "6px",
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
                    gap: "5px",
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    fontWeight: "800",
                    letterSpacing: "0.04em",
                    justifyContent: "center",
                  }}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>

                {/* Event Content Text */}
                <div
                  style={{
                    fontSize: "0.86rem",
                    lineHeight: "1.35",
                    color: e.type === "goal" ? "#ffd700" : isLatest ? "#fff" : "#cbd5e1",
                    fontWeight: e.type === "goal" ? "800" : isLatest ? "600" : "400",
                  }}
                >
                  {e.text}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
