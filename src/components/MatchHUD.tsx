// src/components/MatchHUD.tsx
import React from "react";
import { Timer, Brain, Crosshair } from "lucide-react";
import type { GameSnapshot } from "../types";

interface MatchHUDProps {
  gameState: GameSnapshot | null;
  currentPace?: number;
  onSetMatchPace?: (pace: number) => void;
}

export const MatchHUD: React.FC<MatchHUDProps> = ({ gameState, currentPace = 1.0, onSetMatchPace }) => {
  if (!gameState) {
    return (
      <div className="carbon-card" style={{ padding: "18px", textAlign: "center", color: "var(--cds-text-muted)", fontSize: "13px" }}>
        Awaiting match kickoff...
      </div>
    );
  }

  const { score, stats, elapsedSeconds, matchDuration, phase, homeTeam, awayTeam, activeThought } = gameState;
  const simMinute = Math.min(90, Math.floor((elapsedSeconds / matchDuration) * 90));
  const activePace = gameState.matchPace || currentPace;

  // Safe stat accessors
  const homeSaves = stats.saves?.home || 0;
  const awaySaves = stats.saves?.away || 0;

  const homePassAtt = stats.passesAttempted?.home || stats.passes.home || 0;
  const awayPassAtt = stats.passesAttempted?.away || stats.passes.away || 0;
  const homePassComp = stats.passesCompleted?.home || Math.round(homePassAtt * 0.85);
  const awayPassComp = stats.passesCompleted?.away || Math.round(awayPassAtt * 0.85);
  const homePassAcc = stats.passAccuracy?.home ?? (homePassAtt > 0 ? Math.round((homePassComp / homePassAtt) * 100) : 100);
  const awayPassAcc = stats.passAccuracy?.away ?? (awayPassAtt > 0 ? Math.round((awayPassComp / awayPassAtt) * 100) : 100);

  const homeShots = stats.shots.home || 0;
  const awayShots = stats.shots.away || 0;
  const homeTarget = stats.shotsOnTarget.home || 0;
  const awayTarget = stats.shotsOnTarget.away || 0;

  const homeTacklesWon = stats.tacklesWon?.home ?? stats.tackles.home;
  const awayTacklesWon = stats.tacklesWon?.away ?? stats.tackles.away;

  // Render stat comparison row with dual progress bar
  const renderStatBar = (label: string, homeVal: string | number, awayVal: string | number, homePct = 50) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700" }}>
        <span style={{ color: homeTeam.color || "var(--cds-green-primary)" }}>{homeVal}</span>
        <span style={{ color: "var(--cds-text-secondary)", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.03em" }}>
          {label}
        </span>
        <span style={{ color: awayTeam.color || "var(--cds-red)" }}>{awayVal}</span>
      </div>
      <div style={{ height: "4px", borderRadius: "2px", background: "var(--cds-border-subtle)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${homePct}%`, background: homeTeam.color || "var(--cds-green-primary)", transition: "width 0.3s ease" }} />
        <div style={{ width: `${100 - homePct}%`, background: awayTeam.color || "var(--cds-red)", transition: "width 0.3s ease" }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* 1. Master Scoreboard (Clean IBM Carbon Card) */}
      <div
        className="carbon-card"
        style={{
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "10px",
          background: "var(--cds-surface)",
          border: "1px solid var(--cds-border)",
        }}
      >
        {/* Home Team */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              background: homeTeam.color || "var(--cds-green-primary)",
              border: "1px solid var(--cds-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "13px",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            H
          </div>
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "var(--cds-text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={homeTeam.name}
            >
              {homeTeam.name}
            </div>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", display: "flex", gap: "4px", alignItems: "center" }}>
              <span>{homeTeam.formation}</span>
              <span className="badge badge-info" style={{ padding: "0 4px", fontSize: "9px" }}>AI</span>
            </div>
          </div>
        </div>

        {/* Center Score & Match Clock */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "0 4px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              className={`badge ${
                phase === "live" ? "badge-success" : phase === "goal" ? "badge-error" : "badge-neutral"
              }`}
              style={{ fontSize: "10px", padding: "1px 6px" }}
            >
              {phase === "live" ? "● LIVE" : phase === "goal" ? "⚽ GOAL!" : phase === "kickoff" ? "KICKOFF" : "FULL TIME"}
            </span>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--cds-text-primary)", fontWeight: "700" }}>
              <Timer size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: "2px" }} />
              {simMinute}'
            </span>
          </div>

          <div style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "0.04em", color: "var(--cds-text-primary)", lineHeight: 1, fontFamily: "var(--font-mono)" }}>
            {score.home} <span style={{ color: "var(--cds-text-muted)", fontSize: "18px" }}>-</span> {score.away}
          </div>

          {/* Match Pace Selector */}
          {onSetMatchPace && (
            <div style={{ display: "flex", gap: "2px", marginTop: "2px", background: "var(--cds-layer)", padding: "1px 2px", borderRadius: "4px", border: "1px solid var(--cds-border-subtle)" }}>
              <button
                onClick={() => onSetMatchPace(0.75)}
                title="Tactical Slow Pace: Gives managers time to assess ratings & make changes"
                style={{
                  padding: "1px 5px",
                  borderRadius: "2px",
                  border: "none",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: activePace === 0.75 ? "var(--cds-green-primary)" : "transparent",
                  color: activePace === 0.75 ? "#fff" : "var(--cds-text-muted)",
                }}
              >
                0.75x
              </button>
              <button
                onClick={() => onSetMatchPace(1.0)}
                title="Standard Match Pace"
                style={{
                  padding: "1px 5px",
                  borderRadius: "2px",
                  border: "none",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: activePace === 1.0 ? "var(--cds-green-primary)" : "transparent",
                  color: activePace === 1.0 ? "#fff" : "var(--cds-text-muted)",
                }}
              >
                1.0x
              </button>
              <button
                onClick={() => onSetMatchPace(1.5)}
                title="Fast Simulation Pace"
                style={{
                  padding: "1px 5px",
                  borderRadius: "2px",
                  border: "none",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: activePace === 1.5 ? "var(--cds-green-primary)" : "transparent",
                  color: activePace === 1.5 ? "#fff" : "var(--cds-text-muted)",
                }}
              >
                1.5x
              </button>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", minWidth: 0 }}>
          <div style={{ textAlign: "right", minWidth: 0, overflow: "hidden" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "var(--cds-text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={awayTeam.name}
            >
              {awayTeam.name}
            </div>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", display: "flex", gap: "4px", justifyContent: "flex-end", alignItems: "center" }}>
              <span className="badge badge-neutral" style={{ padding: "0 4px", fontSize: "9px" }}>AI</span>
              <span>{awayTeam.formation}</span>
            </div>
          </div>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              background: awayTeam.color || "var(--cds-red)",
              border: "1px solid var(--cds-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "13px",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            A
          </div>
        </div>
      </div>

      {/* 2. Agent Inner-Monologue Live Stream (High Contrast Dark Text on Light Layer) */}
      <div className="carbon-card" style={{ padding: "10px 14px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <Brain size={13} color="var(--cds-green-primary)" />
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-green-primary)", textTransform: "uppercase" }}>
            Agent Inner-Monologue (Real-Time Reasoning)
          </span>
        </div>
        {activeThought ? (
          <div
            style={{
              fontSize: "12px",
              lineHeight: "1.4",
              color: "var(--cds-text-primary)",
              background: "var(--cds-surface)",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid var(--cds-border-subtle)",
              borderLeft: `3px solid ${activeThought.team === "home" ? (homeTeam.color || "var(--cds-green-primary)") : (awayTeam.color || "var(--cds-red)")}`,
            }}
          >
            <strong style={{ color: "var(--cds-text-primary)", fontWeight: "700" }}>
              {activeThought.playerName}:
            </strong>{" "}
            <span style={{ color: "var(--cds-text-secondary)", fontStyle: "italic" }}>
              "{activeThought.text}"
            </span>
          </div>
        ) : (
          <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", padding: "2px 0" }}>
            Agents actively evaluating passing lanes, pressing zones & shooting angles...
          </div>
        )}
      </div>

      {/* 3. Opta Matchday Stats Board (Clean Carbon Light) */}
      <div
        className="carbon-card"
        style={{
          padding: "12px 14px",
          background: "var(--cds-surface)",
          border: "1px solid var(--cds-border)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--cds-border-subtle)", paddingBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Crosshair size={13} color="var(--cds-green-primary)" />
            <span style={{ fontWeight: "700", fontSize: "11px", color: "var(--cds-text-primary)", letterSpacing: "0.02em" }}>
              OFFICIAL MATCHDAY STATS (OPTA)
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "var(--cds-text-muted)", fontWeight: "600" }}>LIVE METRICS</span>
        </div>

        {/* Possession */}
        {renderStatBar(
          "Possession",
          `${stats.possession.home}%`,
          `${stats.possession.away}%`,
          stats.possession.home
        )}

        {/* Expected Goals (xG) */}
        {renderStatBar(
          "Expected Goals (xG)",
          stats.xG.home.toFixed(2),
          stats.xG.away.toFixed(2),
          Math.max(15, Math.min(85, Math.round((stats.xG.home / (stats.xG.home + stats.xG.away + 0.01)) * 100)))
        )}

        {/* Total Shots & On Target */}
        {renderStatBar(
          "Shots (On Target)",
          `${homeShots} (${homeTarget})`,
          `${awayShots} (${awayTarget})`,
          Math.max(20, Math.min(80, Math.round((homeShots / (homeShots + awayShots || 1)) * 100)))
        )}

        {/* Goalkeeper Saves */}
        {renderStatBar(
          "GK Saves",
          homeSaves,
          awaySaves,
          Math.max(20, Math.min(80, Math.round((homeSaves / (homeSaves + awaySaves || 1)) * 100)))
        )}

        {/* Pass Accuracy */}
        {renderStatBar(
          "Pass Accuracy",
          `${homePassAcc}%`,
          `${awayPassAcc}%`,
          Math.max(20, Math.min(80, Math.round((homePassComp / (homePassComp + awayPassComp || 1)) * 100)))
        )}

        {/* Tackles */}
        {renderStatBar(
          "Tackles Won",
          homeTacklesWon,
          awayTacklesWon,
          Math.max(20, Math.min(80, Math.round((homeTacklesWon / (homeTacklesWon + awayTacklesWon || 1)) * 100)))
        )}
      </div>
    </div>
  );
};
