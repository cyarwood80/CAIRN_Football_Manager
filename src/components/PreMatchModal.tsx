// src/components/PreMatchModal.tsx
import React, { useState } from "react";
import { X, Users } from "lucide-react";
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
        backgroundColor: "rgba(22, 22, 22, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "20px",
      }}
    >
      <div
        className="carbon-card"
        style={{
          width: "min(880px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.18)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "6px 8px",
            height: "auto",
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span className="badge badge-error" style={{ fontSize: "11px" }}>
              MATCHDAY • GAMEWEEK #{gameweek}
            </span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--cds-text-primary)", margin: "4px 0" }}>
            {userTeam.name || "Cairn Athletic FC"} vs {opponentName}
          </h1>
          <div style={{ fontSize: "13px", color: "var(--cds-text-secondary)" }}>
            {isHome ? "🏟️ Home Fixture (Crowd Roar Advantage)" : "✈️ Away Match (Hostile Underdog Test)"}
          </div>
        </div>

        {/* Scouting & Venue Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {/* Opponent Scouting */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              borderLeft: "3px solid var(--cds-red)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-red)", textTransform: "uppercase" }}>
                🔍 Opponent Scouting Report
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--cds-text-primary)" }}>{opponentName}</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: 1.45, margin: 0 }}>
              Disciplined shape with high counter-attacking threat on transitions. Press their deep midfield early to disrupt their supply lines.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <span className="badge badge-error" style={{ fontSize: "10px" }}>
                Threat: Fast Counter
              </span>
              <span className="badge badge-neutral" style={{ fontSize: "10px" }}>
                Formation: 4-3-3
              </span>
            </div>
          </div>

          {/* Venue & Crowd Dynamics */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              borderLeft: isHome ? "3px solid var(--cds-green-primary)" : "3px solid var(--cds-amber)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: isHome ? "var(--cds-green-primary)" : "#B28600", textTransform: "uppercase" }}>
                📢 Venue: {isHome ? "Home Ground" : "Away Ground"}
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                {isHome ? "90 dB Roar" : "75 dB Hostile"}
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: 1.45, margin: 0 }}>
              {isHome
                ? "Playing at home grants +5% speed and pressing intensity while tied or leading! But falling behind causes crowd anxiety."
                : "Away fixture tests grit. Hostile noise increases tactical pressure, but underdogs gain stubborn counter resilience!"}
            </p>
          </div>
        </div>

        {/* Formation & Team Tactical Briefing */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "14px" }}>
          {/* Formation Picker */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>
              Match Formation
            </label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value as Formation)}
              className="carbon-input"
              style={{
                width: "100%",
                height: "36px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <option value="4-3-3">4-3-3 (Attack Wide: 4 DEF • 3 MID • 3 FWD)</option>
              <option value="4-4-2">4-4-2 (Classic Balance: 4 DEF • 4 MID • 2 ST)</option>
              <option value="3-5-2">3-5-2 (Midfield Overload: 3 DEF • 5 MID • 2 ST)</option>
              <option value="5-3-2">5-3-2 (Defensive Fortress: 5 DEF • 3 MID • 2 ST)</option>
              <option value="4-2-3-1">4-2-3-1 (Double Pivot Control: 4 DEF • 2 CDM • 3 AM • 1 ST)</option>
              <option value="3-4-3">3-4-3 (All-Out Frontline Press: 3 DEF • 4 MID • 3 FWD)</option>
            </select>
            <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
              Pitch positioning anchors automatically adapt to this tactical shape.
            </span>
          </div>

          {/* Tactical Briefing / Prompt */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>
              Pre-Match Team Directives & Prompt
            </label>
            <textarea
              value={matchPrompt}
              onChange={(e) => setMatchPrompt(e.target.value)}
              rows={2}
              className="carbon-input"
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "13px",
                resize: "none",
              }}
              placeholder="Input tactical directives for your autonomous squad..."
            />
            <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
              {["High Press Intensity", "Quick Counter Attacks", "Tiki-Taka Possession", "Shoot On Sight"].map((macro) => (
                <button
                  key={macro}
                  type="button"
                  onClick={() => setMatchPrompt(macro + ": dominate space and execute game plan.")}
                  className="btn btn-secondary"
                  style={{
                    height: "26px",
                    padding: "0 8px",
                    fontSize: "11px",
                    fontWeight: "600",
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
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--cds-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={16} color="var(--cds-green-primary)" />
              <span>Starting 11 Lineup Allocation</span>
            </span>
            <span style={{ fontSize: "12px", color: selectedStarterIdx !== null ? "var(--cds-green-primary)" : "var(--cds-text-muted)", fontWeight: "600" }}>
              {selectedStarterIdx !== null
                ? "👉 Click another starter to SWAP positions, or click a bench player to swap onto pitch"
                : "💡 Click any starter to swap position with another player"}
            </span>
          </div>

          {/* Starters Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: "8px" }}>
            {starters.map((player, idx) => {
              const isSelected = selectedStarterIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleStarterClick(idx)}
                  className="carbon-card"
                  style={{
                    padding: "10px 12px",
                    background: isSelected ? "var(--cds-layer-selected)" : "var(--cds-surface)",
                    border: isSelected ? "2px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-muted)" }}>
                      #{player.number}
                    </span>
                    <span className="badge badge-info" style={{ fontSize: "10px", padding: "1px 5px" }}>
                      {player.role}
                    </span>
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--cds-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {player.name}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "11px", color: "var(--cds-text-muted)" }}>
                    <span>£{player.transferValue || 0.3}m</span>
                    <span style={{ color: "var(--cds-green-primary)", fontWeight: "700" }}>{player.tacticalMastery || 75}% TM</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bench Substitutes */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>
              Bench Substitutes (14-Player Squad Rule: 3 Subs)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" }}>
              {bench.map((bPlayer, bIdx) => (
                <div
                  key={bIdx}
                  onClick={() => handleBenchSwap(bIdx)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    background: selectedStarterIdx !== null ? "var(--cds-green-light)" : "var(--cds-surface)",
                    border: selectedStarterIdx !== null ? "1px dashed var(--cds-green-primary)" : "1px solid var(--cds-border)",
                    cursor: selectedStarterIdx !== null ? "pointer" : "default",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "13px", color: "var(--cds-text-primary)" }}>
                      #{bPlayer.number} {bPlayer.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                      {bPlayer.role} • £{bPlayer.transferValue || 0.2}m • {bPlayer.tacticalMastery || 60}% TM
                    </div>
                  </div>
                  {selectedStarterIdx !== null && (
                    <span className="badge badge-success" style={{ fontSize: "10px", padding: "2px 8px" }}>
                      Swap In
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--cds-border)", paddingTop: "16px" }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ height: "38px", padding: "0 18px", fontSize: "13px" }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleKickoff}
            className="btn btn-primary"
            style={{
              height: "40px",
              padding: "0 24px",
              fontSize: "14px",
              fontWeight: "600",
              gap: "8px",
              background: "var(--cds-green-primary)",
              borderColor: "var(--cds-green-primary)",
            }}
          >
            <span>Confirm Lineup & Kick Off</span>
            <span>⚽</span>
          </button>
        </div>
      </div>
    </div>
  );
};
