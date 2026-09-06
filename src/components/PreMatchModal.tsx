// src/components/PreMatchModal.tsx
import React, { useState } from "react";
import { X, Users, Radio } from "lucide-react";
import type { TeamConfig, Formation, SquadPlayerConfig } from "../types";

interface PreMatchModalProps {
  userTeam: TeamConfig;
  opponentName: string;
  isHome: boolean;
  gameweek: number;
  onConfirmAndKickoff: (finalTeamConfig: TeamConfig, venue: "home" | "away") => void;
  onClose: () => void;
}

export const PreMatchModal: React.FC<PreMatchModalProps> = ({
  userTeam,
  opponentName,
  isHome,
  gameweek,
  onConfirmAndKickoff,
  onClose,
}) => {
  const [formation, setFormation] = useState<Formation>(userTeam.formation || "4-3-3");
  const [matchPrompt, setMatchPrompt] = useState<string>(
    userTeam.prompt || "High pressing tempo with quick direct transition passing."
  );
  const [starters, setStarters] = useState<SquadPlayerConfig[]>(
    userTeam.starting11 ? JSON.parse(JSON.stringify(userTeam.starting11)) : []
  );
  const [bench, setBench] = useState<SquadPlayerConfig[]>(
    userTeam.benchSubs ? JSON.parse(JSON.stringify(userTeam.benchSubs)) : []
  );
  const [selectedStarterIdx, setSelectedStarterIdx] = useState<number | null>(null);

  const venue: "home" | "away" = isHome ? "home" : "away";

  // Swap position slots between starters, or starter with bench
  const handleStarterClick = (index: number) => {
    if (selectedStarterIdx === null) {
      setSelectedStarterIdx(index);
    } else if (selectedStarterIdx === index) {
      setSelectedStarterIdx(null);
    } else {
      // Swap positions between starters
      const newStarters = [...starters];
      const temp = newStarters[selectedStarterIdx];
      newStarters[selectedStarterIdx] = newStarters[index];
      newStarters[index] = temp;
      setStarters(newStarters);
      setSelectedStarterIdx(null);
    }
  };

  const handleBenchSwap = (benchIdx: number) => {
    if (selectedStarterIdx === null) return;
    const newStarters = [...starters];
    const newBench = [...bench];
    const tempStarter = newStarters[selectedStarterIdx];
    newStarters[selectedStarterIdx] = {
      ...newBench[benchIdx],
      role: tempStarter.role, // inherit position role or natural role
    };
    newBench[benchIdx] = tempStarter;
    setStarters(newStarters);
    setBench(newBench);
    setSelectedStarterIdx(null);
  };

  const handleKickoff = () => {
    const finalConfig: TeamConfig = {
      ...userTeam,
      formation,
      prompt: matchPrompt,
      starting11: starters,
      benchSubs: bench,
    };
    onConfirmAndKickoff(finalConfig, venue);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "20px",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "min(880px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "18px",
          padding: "24px 28px",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.99) 100%)",
          border: "1px solid rgba(0, 242, 254, 0.25)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 242, 254, 0.12)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          position: "relative",
          color: "#fff",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "none",
            borderRadius: "8px",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)", fontWeight: "800", fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <Radio size={16} />
            <span>PRE-MATCH TACTICAL HUB • GAMEWEEK {gameweek}</span>
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#fff", marginTop: "2px" }}>
            {userTeam.name} vs {opponentName}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            {isHome ? "🏟️ Home Fixture (Crowd Roar Advantage)" : "✈️ Away Match (Hostile Underdog Test)"}
          </div>
        </div>

        {/* Scouting & Venue Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {/* Opponent Scouting */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#fb7185", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🔍 Opponent Scouting Report
              </span>
              <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#fff" }}>{opponentName}</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4", margin: 0 }}>
              Disciplined shape with high counter-attacking threat on transitions. Press their deep midfield early to disrupt their supply lines.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", background: "rgba(244, 63, 94, 0.15)", color: "#fda4af", border: "1px solid rgba(244, 63, 94, 0.3)" }}>
                Threat: Fast Counter
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.06)", color: "#cbd5e1" }}>
                Formation: 4-3-3
              </span>
            </div>
          </div>

          {/* Venue & Crowd Dynamics */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: isHome ? "rgba(0, 242, 254, 0.06)" : "rgba(245, 158, 11, 0.06)",
              border: isHome ? "1px solid rgba(0, 242, 254, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: isHome ? "var(--accent-cyan)" : "#fbbf24", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📢 Venue: {isHome ? "Home Ground" : "Away Ground"}
              </span>
              <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#fff" }}>
                {isHome ? "90 dB Roar" : "75 dB Hostile"}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4", margin: 0 }}>
              {isHome
                ? "Playing at home grants +5% speed and pressing intensity while tied or leading! But falling behind causes crowd anxiety and heavy stamina drain."
                : "Away fixture tests grit. Hostile noise increases tactical pressure, but underdogs gain stubborn counter resilience!"}
            </p>
          </div>
        </div>

        {/* Formation & Team Tactical Briefing */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "14px" }}>
          {/* Formation Picker */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <label style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📐 Match Formation
            </label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value as Formation)}
              style={{
                width: "100%",
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#fff",
                fontWeight: "700",
                fontSize: "0.85rem",
                outline: "none",
              }}
            >
              <option value="4-3-3">4-3-3 (Attack Wide: 4 DEF • 3 MID • 3 FWD)</option>
              <option value="4-4-2">4-4-2 (Classic Balance: 4 DEF • 4 MID • 2 ST)</option>
              <option value="3-5-2">3-5-2 (Midfield Overload: 3 DEF • 5 MID • 2 ST)</option>
              <option value="5-3-2">5-3-2 (Defensive Fortress: 5 DEF • 3 MID • 2 ST)</option>
              <option value="4-2-3-1">4-2-3-1 (Double Pivot Control: 4 DEF • 2 CDM • 3 AM • 1 ST)</option>
              <option value="3-4-3">3-4-3 (All-Out Frontline Press: 3 DEF • 4 MID • 3 FWD)</option>
            </select>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Pitch positioning anchors automatically adapt to this tactical shape.
            </span>
          </div>

          {/* Tactical Briefing / Prompt */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <label style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📋 Pre-Match Team Prompt & Directives
            </label>
            <textarea
              value={matchPrompt}
              onChange={(e) => setMatchPrompt(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                padding: "8px 10px",
                color: "#e2e8f0",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                resize: "none",
                outline: "none",
              }}
              placeholder="Input tactical directives for your autonomous squad..."
            />
            <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
              {["High Press Intensity", "Quick Counter Attacks", "Tiki-Taka Possession", "Shoot On Sight"].map((macro) => (
                <button
                  key={macro}
                  type="button"
                  onClick={() => setMatchPrompt(macro + ": dominate space and execute game plan.")}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#cbd5e1",
                    fontSize: "0.72rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  + {macro}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Starting 11 & Position Allocation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={14} />
              <span>Starting 11 Position Allocation</span>
            </span>
            <span style={{ fontSize: "0.72rem", color: selectedStarterIdx !== null ? "var(--accent-cyan)" : "var(--text-secondary)", fontWeight: "600" }}>
              {selectedStarterIdx !== null
                ? "👉 Click another starter to SWAP positions, or click a bench player to swap onto pitch"
                : "💡 Click any starter to swap position with another player"}
            </span>
          </div>

          {/* Starters Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
            {starters.map((player, idx) => {
              const isSelected = selectedStarterIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleStarterClick(idx)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: isSelected ? "rgba(0, 242, 254, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    border: isSelected ? "2px solid var(--accent-cyan)" : "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: isSelected ? "0 0 15px rgba(0, 242, 254, 0.35)" : "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "900", padding: "1px 6px", borderRadius: "4px", background: "rgba(0, 0, 0, 0.4)", color: "var(--accent-cyan)" }}>
                      #{player.number}
                    </span>
                    <span style={{ fontSize: "0.68rem", fontWeight: "800", padding: "1px 6px", borderRadius: "4px", background: "rgba(0, 242, 254, 0.15)", color: "var(--accent-cyan)" }}>
                      {player.role}
                    </span>
                  </div>
                  <div style={{ fontWeight: "800", fontSize: "0.82rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {player.name}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    <span>£{player.transferValue || 8.0}m</span>
                    <span style={{ color: "#34d399", fontWeight: "700" }}>{player.tacticalMastery || 75}% TM</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bench Substitutes */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Bench Substitutes (14-Player Squad Rule: 3 Subs)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" }}>
              {bench.map((bPlayer, bIdx) => (
                <div
                  key={bIdx}
                  onClick={() => handleBenchSwap(bIdx)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: selectedStarterIdx !== null ? "rgba(0, 242, 254, 0.08)" : "rgba(255, 255, 255, 0.03)",
                    border: selectedStarterIdx !== null ? "1px dashed rgba(0, 242, 254, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                    cursor: selectedStarterIdx !== null ? "pointer" : "default",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.8rem", color: "#e2e8f0" }}>
                      #{bPlayer.number} {bPlayer.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {bPlayer.role} • £{bPlayer.transferValue || 6.0}m • {bPlayer.tacticalMastery || 60}% TM
                    </div>
                  </div>
                  {selectedStarterIdx !== null && (
                    <span style={{ fontSize: "0.68rem", fontWeight: "900", color: "#000", background: "var(--accent-cyan)", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
                      Swap In
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "var(--text-secondary)",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleKickoff}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
              border: "none",
              color: "#000",
              fontWeight: "900",
              cursor: "pointer",
              fontSize: "0.88rem",
              letterSpacing: "0.03em",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
            }}
          >
            <span>Confirm Lineup & Kick Off</span>
            <span style={{ fontSize: "1rem" }}>⚽</span>
          </button>
        </div>
      </div>
    </div>
  );
};
