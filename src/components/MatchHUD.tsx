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
      <div className="glass-panel" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", borderRadius: "14px" }}>
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
  const homeShotAcc = stats.shotAccuracy?.home ?? (homeShots > 0 ? Math.round((homeTarget / homeShots) * 100) : 0);
  const awayShotAcc = stats.shotAccuracy?.away ?? (awayShots > 0 ? Math.round((awayTarget / awayShots) * 100) : 0);

  const homeTacklesWon = stats.tacklesWon?.home ?? stats.tackles.home;
  const awayTacklesWon = stats.tacklesWon?.away ?? stats.tackles.away;
  const homeTackleAtt = stats.tacklesAttempted?.home ?? (homeTacklesWon + 1);
  const awayTackleAtt = stats.tacklesAttempted?.away ?? (awayTacklesWon + 1);
  const homeTacklePct = stats.tackleSuccess?.home ?? (homeTackleAtt > 0 ? Math.round((homeTacklesWon / homeTackleAtt) * 100) : 100);
  const awayTacklePct = stats.tackleSuccess?.away ?? (awayTackleAtt > 0 ? Math.round((awayTacklesWon / awayTackleAtt) * 100) : 100);

  const homeInterceptions = stats.interceptions?.home || 0;
  const awayInterceptions = stats.interceptions?.away || 0;

  // Render stat comparison row with dual progress bar
  const renderStatBar = (label: string, homeVal: string | number, awayVal: string | number, homePct = 50) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: "700" }}>
        <span style={{ color: homeTeam.color }}>{homeVal}</span>
        <span style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.03em" }}>
          {label}
        </span>
        <span style={{ color: awayTeam.color }}>{awayVal}</span>
      </div>
      <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255, 255, 255, 0.06)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${homePct}%`, background: homeTeam.color, transition: "width 0.3s ease" }} />
        <div style={{ width: `${100 - homePct}%`, background: awayTeam.color, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. Master Scoreboard */}
      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          borderRadius: "14px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "12px",
          background: "linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 15, 25, 0.95) 100%)",
        }}
      >
        {/* Home Team */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: homeTeam.color,
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "1rem",
              color: "#000",
              boxShadow: `0 0 14px ${homeTeam.color}66`,
              flexShrink: 0,
            }}
          >
            H
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {homeTeam.name}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", gap: "6px", alignItems: "center" }}>
              <span>{homeTeam.formation}</span>
              <span className="badge badge-ai" style={{ padding: "1px 6px", fontSize: "0.65rem" }}>AI</span>
            </div>
          </div>
        </div>

        {/* Center Score & Match Clock */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              className={`badge ${
                phase === "live" ? "badge-live animate-pulse-slow" : phase === "goal" ? "badge-live" : "badge-bot"
              }`}
              style={{ fontSize: "0.68rem", padding: "2px 8px" }}
            >
              {phase === "live" ? "● LIVE" : phase === "goal" ? "⚽ GOAL!" : phase === "kickoff" ? "KICKOFF" : "FULL TIME"}
            </span>
            <span style={{ fontSize: "0.82rem", fontFamily: "var(--font-mono)", color: "var(--accent-gold)", fontWeight: "700" }}>
              <Timer size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "2px" }} />
              {simMinute}'
            </span>
          </div>

          <div style={{ fontSize: "2.2rem", fontWeight: "900", letterSpacing: "0.06em", color: "#fff", lineHeight: 1 }}>
            {score.home} <span style={{ color: "var(--text-muted)", fontSize: "1.6rem" }}>-</span> {score.away}
          </div>

          {/* Match Pace Selector */}
          {onSetMatchPace && (
            <div style={{ display: "flex", gap: "4px", marginTop: "4px", background: "rgba(0,0,0,0.3)", padding: "2px 4px", borderRadius: "8px" }}>
              <button
                onClick={() => onSetMatchPace(0.75)}
                title="Tactical Slow Pace: Gives managers time to assess ratings & make changes"
                style={{
                  padding: "2px 6px",
                  borderRadius: "5px",
                  border: "none",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: activePace === 0.75 ? "var(--accent-cyan)" : "transparent",
                  color: activePace === 0.75 ? "#000" : "var(--text-muted)",
                }}
              >
                🐢 0.75x
              </button>
              <button
                onClick={() => onSetMatchPace(1.0)}
                title="Standard Match Pace"
                style={{
                  padding: "2px 6px",
                  borderRadius: "5px",
                  border: "none",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: activePace === 1.0 ? "var(--accent-cyan)" : "transparent",
                  color: activePace === 1.0 ? "#000" : "var(--text-muted)",
                }}
              >
                ⚽ 1.0x
              </button>
              <button
                onClick={() => onSetMatchPace(1.5)}
                title="Fast Simulation Pace"
                style={{
                  padding: "2px 6px",
                  borderRadius: "5px",
                  border: "none",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: activePace === 1.5 ? "var(--accent-cyan)" : "transparent",
                  color: activePace === 1.5 ? "#000" : "var(--text-muted)",
                }}
              >
                ⚡ 1.5x
              </button>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
          <div style={{ textAlign: "right", minWidth: 0 }}>
            <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {awayTeam.name}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
              <span className="badge badge-bot" style={{ padding: "1px 6px", fontSize: "0.65rem" }}>AI</span>
              <span>{awayTeam.formation}</span>
            </div>
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: awayTeam.color,
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "1rem",
              color: "#fff",
              boxShadow: `0 0 14px ${awayTeam.color}66`,
              flexShrink: 0,
            }}
          >
            A
          </div>
        </div>
      </div>

      {/* 2. Opta Matchday Stats Board */}
      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          borderRadius: "14px",
          background: "linear-gradient(180deg, rgba(17, 24, 39, 0.85) 0%, rgba(11, 15, 25, 0.95) 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Crosshair size={14} color="var(--accent-cyan)" />
            <span style={{ fontWeight: "800", fontSize: "0.82rem", color: "#fff", letterSpacing: "0.04em" }}>
              OFFICIAL MATCHDAY STATS (OPTA)
            </span>
          </div>
          <span style={{ fontSize: "0.68rem", color: "var(--accent-gold)", fontWeight: "700" }}>LIVE METRICS</span>
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
          "Total Shots (On Target)",
          `${homeShots} (${homeTarget})`,
          `${awayShots} (${awayTarget})`,
          Math.max(20, Math.min(80, Math.round((homeShots / (homeShots + awayShots || 1)) * 100)))
        )}

        {/* Shot Accuracy % */}
        {renderStatBar(
          "Shot Accuracy",
          `${homeShotAcc}%`,
          `${awayShotAcc}%`,
          Math.max(20, Math.min(80, Math.round((homeShotAcc / (homeShotAcc + awayShotAcc || 1)) * 100)))
        )}

        {/* Goalkeeper Saves */}
        {renderStatBar(
          "Heroic GK Saves",
          homeSaves,
          awaySaves,
          Math.max(20, Math.min(80, Math.round((homeSaves / (homeSaves + awaySaves || 1)) * 100)))
        )}

        {/* Passes & Accuracy */}
        {renderStatBar(
          "Pass Accuracy (Completed)",
          `${homePassAcc}% (${homePassComp}/${homePassAtt})`,
          `${awayPassAcc}% (${awayPassComp}/${awayPassAtt})`,
          Math.max(20, Math.min(80, Math.round((homePassComp / (homePassComp + awayPassComp || 1)) * 100)))
        )}

        {/* Tackles & Success */}
        {renderStatBar(
          "Tackle Success (Won)",
          `${homeTacklePct}% (${homeTacklesWon}/${homeTackleAtt})`,
          `${awayTacklePct}% (${awayTacklesWon}/${awayTackleAtt})`,
          Math.max(20, Math.min(80, Math.round((homeTacklesWon / (homeTacklesWon + awayTacklesWon || 1)) * 100)))
        )}

        {/* Interceptions */}
        {renderStatBar(
          "Interceptions / Loose Balls",
          homeInterceptions,
          awayInterceptions,
          Math.max(20, Math.min(80, Math.round((homeInterceptions / (homeInterceptions + awayInterceptions || 1)) * 100)))
        )}
      </div>

      {/* 3. Agent Inner-Monologue Live Stream */}
      <div className="glass-panel" style={{ padding: "14px 18px", borderRadius: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Brain size={15} color="var(--accent-cyan)" />
          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--accent-cyan)" }}>
            AGENT INNER-MONOLOGUE (REAL-TIME REASONING)
          </span>
        </div>
        {activeThought ? (
          <div
            style={{
              fontSize: "0.86rem",
              lineHeight: "1.4",
              color: "#f1f5f9",
              fontStyle: "italic",
              background: "rgba(0, 242, 254, 0.05)",
              padding: "10px 14px",
              borderRadius: "8px",
              borderLeft: `3px solid ${activeThought.team === "home" ? homeTeam.color : awayTeam.color}`,
            }}
          >
            <strong style={{ fontStyle: "normal", color: "#fff" }}>
              {activeThought.playerName}:
            </strong>{" "}
            "{activeThought.text}"
          </div>
        ) : (
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", padding: "4px 0" }}>
            Agents actively evaluating passing lanes, defensive lines & shot angles...
          </div>
        )}
      </div>
    </div>
  );
};
