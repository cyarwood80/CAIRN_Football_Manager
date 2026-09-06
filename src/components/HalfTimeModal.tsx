// src/components/HalfTimeModal.tsx
import React, { useState } from "react";
import { Volume2, FastForward } from "lucide-react";
import type { GameSnapshot, Formation } from "../types";

interface HalfTimeModalProps {
  snapshot: GameSnapshot;
  onKickoffSecondHalf: (updatedFormation?: Formation, teamTalkDirective?: string) => void;
  onExecuteSub?: (targetPlayerId: string, benchSubId: string) => void;
}

export const HalfTimeModal: React.FC<HalfTimeModalProps> = ({
  snapshot,
  onKickoffSecondHalf,
  onExecuteSub,
}) => {
  const [selectedFormation, setSelectedFormation] = useState<Formation>(
    snapshot.homeTeam?.formation || "4-3-3"
  );
  const [teamTalk, setTeamTalk] = useState<string>("Keep the tactical discipline high in the second half!");
  const [selectedTalkIndex, setSelectedTalkIndex] = useState<number>(0);
  const [selectedStarterId, setSelectedStarterId] = useState<string>("");
  const [selectedSubId, setSelectedSubId] = useState<string>("");

  const homePlayers = snapshot.players.filter((p) => p.team === "home" && !p.subbedOut);
  const benchSubs = snapshot.benchSubs?.home?.filter((b) => !b.used) || [];

  const teamTalkOptions = [
    {
      title: "🔥 Fire Up!",
      desc: "Demand relentless pressing and hunting second balls.",
      directive: "Raise press intensity, close down immediately and win every second ball!",
    },
    {
      title: "🛡️ Lock The Gate!",
      desc: "Compact the back line and eliminate space behind.",
      directive: "Stay tight, drop deep into shape and do not let their runners get behind us!",
    },
    {
      title: "🎯 Feed The Channels!",
      desc: "Direct through-balls into the channels for the strikers.",
      directive: "Quicker release forward! Feed the strikers into the space behind their defense!",
    },
    {
      title: "🧠 Calm & Control",
      desc: "Dictate tempo with patient one-touch passing.",
      directive: "Slow the tempo down, maintain ball retention and make them chase shadows.",
    },
  ];

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStarterId && selectedSubId && onExecuteSub) {
      onExecuteSub(selectedStarterId, selectedSubId);
      setSelectedStarterId("");
      setSelectedSubId("");
    }
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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--cds-border)", paddingBottom: "14px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span className="badge badge-warning" style={{ fontSize: "11px" }}>
                HALF-TIME DRESSING ROOM • 45:00
              </span>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--cds-text-primary)", margin: "4px 0 0 0" }}>
              Tactical Review & Second Half Strategy
            </h1>
          </div>
          <span className="badge badge-info" style={{ fontSize: "11px" }}>
            Match Paused
          </span>
        </div>

        {/* Halftime Score & Key Stats Ribbon */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "14px 20px",
            borderRadius: "4px",
            background: "var(--cds-layer)",
            border: "1px solid var(--cds-border)",
          }}
        >
          {/* Home */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "4px",
                background: snapshot.homeTeam?.color || "var(--cds-green-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              H
            </div>
            <div>
              <div style={{ fontWeight: "700", color: "var(--cds-text-primary)", fontSize: "14px" }}>{snapshot.homeTeam?.name || "Home FC"}</div>
              <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>{snapshot.homeTeam?.formation}</div>
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--cds-text-primary)", lineHeight: 1, fontFamily: "var(--font-mono)" }}>
              {snapshot.score.home} - {snapshot.score.away}
            </div>
            <span style={{ fontSize: "11px", color: "var(--cds-text-muted)", fontWeight: "600" }}>HALF TIME</span>
          </div>

          {/* Away */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "700", color: "var(--cds-text-primary)", fontSize: "14px" }}>{snapshot.awayTeam?.name || "Away FC"}</div>
              <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>{snapshot.awayTeam?.formation}</div>
            </div>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "4px",
                background: snapshot.awayTeam?.color || "var(--cds-red)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              A
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center" }}>
          <div style={{ padding: "8px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>Possession</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-text-primary)" }}>{snapshot.stats.possession.home}% - {snapshot.stats.possession.away}%</div>
          </div>
          <div style={{ padding: "8px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>Shots (On Target)</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-text-primary)" }}>{snapshot.stats.shots.home} ({snapshot.stats.shotsOnTarget.home}) - {snapshot.stats.shots.away} ({snapshot.stats.shotsOnTarget.away})</div>
          </div>
          <div style={{ padding: "8px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>xG (Expected Goals)</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-green-primary)" }}>{(snapshot.stats.xG?.home || 0.8).toFixed(2)} - {(snapshot.stats.xG?.away || 0.5).toFixed(2)}</div>
          </div>
          <div style={{ padding: "8px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)" }}>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>Tackles Won</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-text-primary)" }}>{snapshot.stats.tacklesWon?.home ?? snapshot.stats.tackles.home} - {snapshot.stats.tacklesWon?.away ?? snapshot.stats.tackles.away}</div>
          </div>
        </div>

        {/* Manager Team Talk Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Volume2 size={16} color="var(--cds-green-primary)" />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
              Manager Half-Time Team Talk:
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
            {teamTalkOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedTalkIndex(idx);
                  setTeamTalk(opt.directive);
                }}
                className="carbon-card"
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  background: selectedTalkIndex === idx ? "var(--cds-layer-selected)" : "var(--cds-surface)",
                  border: selectedTalkIndex === idx ? "2px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                }}
              >
                <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--cds-text-primary)" }}>{opt.title}</div>
                <div style={{ fontSize: "11px", color: "var(--cds-text-secondary)", marginTop: "2px" }}>{opt.desc}</div>
              </button>
            ))}
          </div>

          <textarea
            value={teamTalk}
            onChange={(e) => setTeamTalk(e.target.value)}
            rows={2}
            className="carbon-input"
            style={{ width: "100%", padding: "8px 10px", fontSize: "13px", resize: "none" }}
            placeholder="Custom instructions for second half..."
          />
        </div>

        {/* Substitution & Tactical Adjustment Panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "14px" }}>
          {/* Formation Adjustment */}
          <div style={{ padding: "14px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>
              Change Formation For 2nd Half:
            </label>
            <select
              value={selectedFormation}
              onChange={(e) => setSelectedFormation(e.target.value as Formation)}
              className="carbon-input"
              style={{ width: "100%", height: "34px", fontSize: "12px", fontWeight: "600" }}
            >
              <option value="4-3-3">4-3-3 (Attack Wide: 4 DEF • 3 MID • 3 FWD)</option>
              <option value="4-4-2">4-4-2 (Classic Balance: 4 DEF • 4 MID • 2 ST)</option>
              <option value="3-5-2">3-5-2 (Midfield Overload: 3 DEF • 5 MID • 2 ST)</option>
              <option value="5-3-2">5-3-2 (Defensive Block: 5 DEF • 3 MID • 2 ST)</option>
              <option value="4-2-3-1">4-2-3-1 (Double Pivot Control: 4 DEF • 2 CDM • 3 AM • 1 ST)</option>
            </select>
          </div>

          {/* Make Sub */}
          <form onSubmit={handleSubSubmit} style={{ padding: "14px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>
              Make Half-Time Substitution:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={selectedStarterId}
                onChange={(e) => setSelectedStarterId(e.target.value)}
                className="carbon-input"
                style={{ flex: 1, height: "34px", fontSize: "12px" }}
              >
                <option value="">Select Player To Sub Off</option>
                {homePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name} ({p.role}) - {Math.round(p.stamina)}% Stamina
                  </option>
                ))}
              </select>

              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="carbon-input"
                style={{ flex: 1, height: "34px", fontSize: "12px" }}
              >
                <option value="">Select Fresh Bench Sub</option>
                {benchSubs.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.number} {b.name} ({b.role})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!selectedStarterId || !selectedSubId}
                className="btn btn-secondary"
                style={{ height: "34px", fontSize: "12px", whiteSpace: "nowrap" }}
              >
                Sub
              </button>
            </div>
          </form>
        </div>

        {/* Kick Off Second Half */}
        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--cds-border)", paddingTop: "14px" }}>
          <button
            type="button"
            onClick={() => onKickoffSecondHalf(selectedFormation, teamTalk)}
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
            <FastForward size={16} />
            <span>Kick Off 2nd Half (45:00 - 90:00)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
