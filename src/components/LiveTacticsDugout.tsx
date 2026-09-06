// src/components/LiveTacticsDugout.tsx
import React, { useState } from "react";
import { UserCheck, Megaphone, Zap, Shield, Compass, Target, CheckCircle2, ArrowRightLeft } from "lucide-react";
import type { GameSnapshot } from "../types";

interface LiveTacticsDugoutProps {
  gameState: GameSnapshot | null;
  onMakeSubstitution: (targetPlayerId: string, subName: string, subRole: string, subPrompt: string) => void;
  onUpdateTacticsLive: (prompt: string, macroKey?: string) => void;
  userTeamType?: "home" | "away";
}

export const LiveTacticsDugout: React.FC<LiveTacticsDugoutProps> = ({
  gameState,
  onMakeSubstitution,
  onUpdateTacticsLive,
  userTeamType = "home",
}) => {
  const [selectedPlayerToReplace, setSelectedPlayerToReplace] = useState<string>("");
  const [subRole, setSubRole] = useState<string>("FWD");
  const [tacticalFeedback, setTacticalFeedback] = useState<string | null>(null);

  if (!gameState) {
    return (
      <div className="carbon-card" style={{ padding: "14px", textAlign: "center", color: "var(--cds-text-muted)", fontSize: "12px" }}>
        Live tactical dugout unlocks at kickoff.
      </div>
    );
  }

  const { players, subsRemaining, phase } = gameState;
  const teamPlayers = players.filter((p) => p.team === userTeamType);
  const remainingSubs = subsRemaining ? subsRemaining[userTeamType] : 1;

  // Find default player to replace (lowest stamina outfield player)
  const outfieldPlayers = teamPlayers.filter((p) => p.role !== "GK");
  const defaultReplaceCandidate = [...outfieldPlayers].sort((a, b) => a.stamina - b.stamina)[0];

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedPlayerToReplace || defaultReplaceCandidate?.id;
    if (!targetId) return;

    onMakeSubstitution(
      targetId,
      "Super Sub Agent",
      subRole,
      `Impact substitute with fresh explosive stamina. Blitz opponent third and attack aggressively!`
    );

    setTacticalFeedback("Substitution called! Sub Agent entering the pitch with 100% stamina.");
    setTimeout(() => setTacticalFeedback(null), 4000);
  };

  const handleQuickShout = (macroKey: string, label: string) => {
    onUpdateTacticsLive("", macroKey);
    setTacticalFeedback(`Touchline order "${label}" dispatched! Team tactical weights updated.`);
    setTimeout(() => setTacticalFeedback(null), 4000);
  };

  return (
    <div
      className="carbon-card"
      style={{
        padding: "14px 16px",
        background: "var(--cds-surface)",
        border: "1px solid var(--cds-border)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Dugout Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--cds-border-subtle)",
          paddingBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Megaphone size={14} color="var(--cds-green-primary)" />
          <span style={{ fontWeight: "700", fontSize: "12px", color: "var(--cds-text-primary)", letterSpacing: "0.02em" }}>
            LIVE TOUCHLINE DUGOUT & TACTICS
          </span>
        </div>

        <span
          className={remainingSubs > 0 ? "badge badge-success" : "badge badge-neutral"}
          style={{ fontSize: "10px", padding: "2px 8px" }}
        >
          {remainingSubs > 0 ? `${remainingSubs} / 3 Subs Available` : "0 / 3 Subs Left"}
        </span>
      </div>

      {/* Feedback Toast */}
      {tacticalFeedback && (
        <div
          style={{
            background: "var(--cds-green-light)",
            border: "1px solid var(--cds-green-primary)",
            borderRadius: "4px",
            padding: "6px 10px",
            fontSize: "11px",
            color: "var(--cds-green-primary)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "600",
          }}
        >
          <CheckCircle2 size={13} />
          <span>{tacticalFeedback}</span>
        </div>
      )}

      {/* 1. Tactical Substitution & Directives in 2-Column Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {/* Substitution Panel */}
        <div
          style={{
            background: "var(--cds-layer)",
            borderRadius: "4px",
            padding: "10px",
            border: "1px solid var(--cds-border)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
              <ArrowRightLeft size={13} color="var(--cds-blue)" />
              <span>Tactical Sub Agent</span>
            </div>
            <span style={{ fontSize: "10px", color: "var(--cds-text-muted)" }}>3 max</span>
          </div>

          {remainingSubs > 0 ? (
            <form onSubmit={handleSubSubmit} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div>
                <select
                  value={selectedPlayerToReplace || defaultReplaceCandidate?.id || ""}
                  onChange={(e) => setSelectedPlayerToReplace(e.target.value)}
                  className="carbon-input"
                  style={{
                    width: "100%",
                    height: "28px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  {teamPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name} ({p.role}) - {p.stamina}% Stamina
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <select
                  value={subRole}
                  onChange={(e) => setSubRole(e.target.value)}
                  className="carbon-input"
                  style={{
                    flex: 1,
                    height: "28px",
                    padding: "2px 6px",
                    fontSize: "11px",
                  }}
                >
                  <option value="ST">ST (Impact Striker)</option>
                  <option value="CAM">CAM (Creative Playmaker)</option>
                  <option value="CDM">CDM (Iron Anchor)</option>
                  <option value="CB">CB (Dominant Stopper)</option>
                  <option value="RW">RW (Inverted Winger)</option>
                  <option value="LW">LW (Explosive Winger)</option>
                </select>

                <button
                  type="submit"
                  disabled={phase === "fulltime"}
                  className="btn btn-primary"
                  style={{
                    height: "28px",
                    padding: "0 10px",
                    fontSize: "11px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    gap: "4px",
                  }}
                >
                  <UserCheck size={12} /> Send On
                </button>
              </div>
            </form>
          ) : (
            <div style={{ padding: "6px", textAlign: "center", color: "var(--cds-text-muted)", fontSize: "11px" }}>
              ✓ All 3 tactical substitutions used.
            </div>
          )}
        </div>

        {/* Quick Tactical Orders */}
        <div
          style={{
            background: "var(--cds-layer)",
            borderRadius: "4px",
            padding: "10px",
            border: "1px solid var(--cds-border)",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Zap size={13} color="var(--cds-green-primary)" />
            <span>Tactical Macro Shouts</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "4px 6px", fontSize: "10px", height: "26px", justifyContent: "center" }}
              onClick={() => handleQuickShout("ALL_OUT_PRESS", "Heavy Metal Press")}
            >
              <Zap size={11} color="var(--cds-red)" /> All-Out Press
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "4px 6px", fontSize: "10px", height: "26px", justifyContent: "center" }}
              onClick={() => handleQuickShout("PARK_THE_BUS", "Park The Bus")}
            >
              <Shield size={11} color="var(--cds-blue)" /> Park The Bus
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "4px 6px", fontSize: "10px", height: "26px", justifyContent: "center" }}
              onClick={() => handleQuickShout("COUNTER_ATTACK", "Direct Counter Blitz")}
            >
              <Compass size={11} color="var(--cds-green-primary)" /> Counter Blitz
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "4px 6px", fontSize: "10px", height: "26px", justifyContent: "center" }}
              onClick={() => handleQuickShout("SHOOT_ON_SIGHT", "Shoot On Sight")}
            >
              <Target size={11} color="#B28600" /> Shoot On Sight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
