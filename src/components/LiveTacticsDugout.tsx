// src/components/LiveTacticsDugout.tsx
import React, { useState } from "react";
import { UserCheck, Megaphone, Zap, Shield, Compass, Target, ArrowRightLeft, Send, CheckCircle2 } from "lucide-react";
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
  const [customShout, setCustomShout] = useState<string>("");
  const [tacticalFeedback, setTacticalFeedback] = useState<string | null>(null);

  if (!gameState) {
    return (
      <div className="glass-panel" style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
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
    setTacticalFeedback(`Touchline order "${label}" dispatched! Team weights updated in real time.`);
    setTimeout(() => setTacticalFeedback(null), 4000);
  };

  const handleCustomShoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customShout.trim()) return;

    onUpdateTacticsLive(customShout.trim());
    setTacticalFeedback(`Custom order: "${customShout}" dispatched to team!`);
    setCustomShout("");
    setTimeout(() => setTacticalFeedback(null), 4000);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: "16px 20px",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "linear-gradient(180deg, rgba(17, 24, 39, 0.85) 0%, rgba(11, 15, 25, 0.95) 100%)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Dugout Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Megaphone size={16} color="var(--accent-cyan)" />
          <span style={{ fontWeight: "800", fontSize: "0.92rem", color: "#fff", letterSpacing: "0.02em" }}>
            LIVE TOUCHLINE DUGOUT & TACTICS
          </span>
        </div>

        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: "700",
            padding: "3px 8px",
            borderRadius: "12px",
            background: remainingSubs > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(100, 116, 139, 0.2)",
            color: remainingSubs > 0 ? "var(--accent-green)" : "var(--text-muted)",
            border: `1px solid ${remainingSubs > 0 ? "rgba(16, 185, 129, 0.3)" : "rgba(100, 116, 139, 0.3)"}`,
          }}
        >
          {remainingSubs > 0 ? `${remainingSubs} / 3 Subs Available` : "0 / 3 Subs Left"}
        </div>
      </div>

      {/* Feedback Toast */}
      {tacticalFeedback && (
        <div
          style={{
            background: "rgba(0, 242, 254, 0.12)",
            border: "1px solid rgba(0, 242, 254, 0.3)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "0.78rem",
            color: "var(--accent-cyan)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <CheckCircle2 size={14} />
          <span>{tacticalFeedback}</span>
        </div>
      )}

      {/* 1. Tactical Substitution Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "10px",
          padding: "12px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: "700", color: "#e2e8f0" }}>
            <ArrowRightLeft size={14} color="#c084fc" />
            <span>Tactical Substitution Agent</span>
          </div>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>3 allowed per match</span>
        </div>

        {remainingSubs > 0 ? (
          <form onSubmit={handleSubSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Replace Outfield Player:
                </label>
                <select
                  value={selectedPlayerToReplace || defaultReplaceCandidate?.id || ""}
                  onChange={(e) => setSelectedPlayerToReplace(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "6px",
                    color: "#fff",
                    padding: "6px 8px",
                    fontSize: "0.75rem",
                  }}
                >
                  {teamPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name} ({p.role}) - {p.stamina}% Stamina
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
                  Sub Tactical Role:
                </label>
                <select
                  value={subRole}
                  onChange={(e) => setSubRole(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "6px",
                    color: "#fff",
                    padding: "6px 8px",
                    fontSize: "0.75rem",
                  }}
                >
                  <option value="ST">ST (Impact Striker)</option>
                  <option value="CAM">CAM (Creative Playmaker)</option>
                  <option value="CDM">CDM (Iron Anchor)</option>
                  <option value="CB">CB (Dominant Stopper)</option>
                  <option value="RW">RW (Inverted Winger)</option>
                  <option value="LW">LW (Explosive Winger)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={phase === "fulltime"}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
              }}
            >
              <UserCheck size={14} /> Send On Fresh Sub Agent (100% Stamina)
            </button>
          </form>
        ) : (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.78rem",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "6px",
            }}
          >
            ✓ Tactical substitution has already been used for this match.
          </div>
        )}
      </div>

      {/* 2. Live Mid-Game Tactical Prompts */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "10px",
          padding: "12px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Zap size={14} color="var(--accent-gold)" />
          <span>Quick Touchline Tactical Orders (Real-Time Re-weight)</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "10px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "6px 4px", fontSize: "0.7rem", gap: "4px", justifyContent: "center" }}
            onClick={() => handleQuickShout("ALL_OUT_PRESS", "Heavy Metal Press")}
          >
            <Zap size={12} color="#ef4444" /> All-Out Press
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "6px 4px", fontSize: "0.7rem", gap: "4px", justifyContent: "center" }}
            onClick={() => handleQuickShout("PARK_THE_BUS", "Park The Bus")}
          >
            <Shield size={12} color="#3b82f6" /> Park The Bus
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "6px 4px", fontSize: "0.7rem", gap: "4px", justifyContent: "center" }}
            onClick={() => handleQuickShout("COUNTER_ATTACK", "Direct Counter Blitz")}
          >
            <Compass size={12} color="#10b981" /> Counter Blitz
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "6px 4px", fontSize: "0.7rem", gap: "4px", justifyContent: "center" }}
            onClick={() => handleQuickShout("TIKI_TAKA_CONTROL", "Tiki-Taka Retain")}
          >
            <Target size={12} color="#38bdf8" /> Tiki-Taka Keep
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "6px 4px", fontSize: "0.7rem", gap: "4px", justifyContent: "center", gridColumn: "span 2" }}
            onClick={() => handleQuickShout("SHOOT_ON_SIGHT", "Shoot On Sight")}
          >
            🎯 Shoot On Sight From Distance
          </button>
        </div>

        {/* Custom Touchline Directive */}
        <form onSubmit={handleCustomShoutSubmit} style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            placeholder="Custom manager shout (e.g. 'Double-team their striker & take long shots')..."
            value={customShout}
            onChange={(e) => setCustomShout(e.target.value)}
            style={{
              flex: 1,
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "6px",
              color: "#fff",
              padding: "6px 10px",
              fontSize: "0.76rem",
            }}
          />
          <button
            type="submit"
            disabled={!customShout.trim()}
            className="btn btn-primary"
            style={{ padding: "6px 12px", fontSize: "0.76rem", gap: "4px" }}
          >
            <Send size={12} /> Shout
          </button>
        </form>
      </div>
    </div>
  );
};
