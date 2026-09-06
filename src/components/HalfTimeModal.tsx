// src/components/HalfTimeModal.tsx
import React, { useState } from "react";
import { MessageSquare, Volume2, FastForward } from "lucide-react";
import type { GameSnapshot, Formation, PlayerFeedback } from "../types";

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
  const feedbacks: PlayerFeedback[] = snapshot.playerFeedback || [];

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
        backgroundColor: "rgba(0, 0, 0, 0.88)",
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
          border: "1px solid rgba(0, 242, 254, 0.3)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 242, 254, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          position: "relative",
          color: "#fff",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-gold)", fontWeight: "800", fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>⏸️</span>
              <span>HALF-TIME DRESSING ROOM • 45:00</span>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fff", marginTop: "2px" }}>
              Tactical Review & Second Half Strategy
            </div>
          </div>
          <div style={{ padding: "4px 12px", borderRadius: "20px", background: "rgba(234, 179, 8, 0.15)", border: "1px solid rgba(234, 179, 8, 0.4)", color: "#facc15", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Match Paused
          </div>
        </div>

        {/* Halftime Score & Key Stats Ribbon */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "14px 20px",
            borderRadius: "12px",
            background: "rgba(0, 0, 0, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* Home */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: snapshot.homeTeam?.color || "#00f2fe",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "1rem",
              }}
            >
              H
            </div>
            <div>
              <div style={{ fontWeight: "800", color: "#fff", fontSize: "1rem" }}>{snapshot.homeTeam?.name || "Home FC"}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{snapshot.homeTeam?.formation}</div>
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "#fff", lineHeight: 1 }}>
              {snapshot.score.home} - {snapshot.score.away}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: "700" }}>HALF TIME</span>
          </div>

          {/* Away */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "800", color: "#fff", fontSize: "1rem" }}>{snapshot.awayTeam?.name || "Away FC"}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{snapshot.awayTeam?.formation}</div>
            </div>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: snapshot.awayTeam?.color || "#f43f5e",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "1rem",
              }}
            >
              A
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center" }}>
          <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Possession</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-cyan)", marginTop: "2px" }}>
              {snapshot.stats.possession.home}% - {snapshot.stats.possession.away}%
            </div>
          </div>
          <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Shots (On Target)</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-cyan)", marginTop: "2px" }}>
              {snapshot.stats.shots.home} ({snapshot.stats.shotsOnTarget?.home || 0}) - {snapshot.stats.shots.away} ({snapshot.stats.shotsOnTarget?.away || 0})
            </div>
          </div>
          <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Pass Accuracy</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-cyan)", marginTop: "2px" }}>
              {snapshot.stats.passAccuracy?.home || 85}% - {snapshot.stats.passAccuracy?.away || 85}%
            </div>
          </div>
          <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Tackles</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--accent-cyan)", marginTop: "2px" }}>
              {snapshot.stats.tackles.home} - {snapshot.stats.tackles.away}
            </div>
          </div>
        </div>

        {/* Player Feedback / Agent Learning Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
              <MessageSquare size={14} />
              <span>Squad Feedback & Tactical Learning (+1% Mastery)</span>
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              Players evaluate prompt clarity & provide autonomous responses
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
            {feedbacks.length > 0 ? (
              feedbacks.map((fb) => (
                <div
                  key={fb.playerId}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: fb.type === "encourage" ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
                    border: fb.type === "encourage" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "6px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "800", fontSize: "0.82rem", color: "#fff" }}>
                        {fb.playerName} ({fb.playerRole})
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: "800",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          background: fb.type === "encourage" ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)",
                          color: fb.type === "encourage" ? "#6ee7b7" : "#fcd34d",
                        }}
                      >
                        {fb.type === "encourage" ? "Encouraging 👍" : "Challenging ⚠️"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#e2e8f0", fontStyle: "italic", margin: 0, lineHeight: "1.3" }}>
                      "{fb.message}"
                    </p>
                  </div>
                  {fb.tacticalAdvice && (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "4px" }}>
                      <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>Advice: </span>
                      {fb.tacticalAdvice}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", padding: "12px", textAlign: "center", borderRadius: "8px", background: "rgba(255, 255, 255, 0.02)", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                Squad is focused. Tactical directives executed smoothly.
              </div>
            )}
          </div>
        </div>

        {/* Manager Dressing Room Team Talk */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
            <Volume2 size={14} />
            <span>Dressing Room Team Talk</span>
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
            {teamTalkOptions.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedTalkIndex(idx);
                  setTeamTalk(opt.directive);
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: selectedTalkIndex === idx ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  border: selectedTalkIndex === idx ? "2px solid var(--accent-cyan)" : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: selectedTalkIndex === idx ? "0 0 15px rgba(0, 242, 254, 0.25)" : "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontWeight: "800", fontSize: "0.82rem", color: selectedTalkIndex === idx ? "var(--accent-cyan)" : "#fff", marginBottom: "3px" }}>
                  {opt.title}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.3" }}>
                  {opt.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Half Formation & Substitution */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {/* Formation Picker */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <label style={{ fontSize: "0.74rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              🔄 Second Half Formation
            </label>
            <select
              value={selectedFormation}
              onChange={(e) => setSelectedFormation(e.target.value as Formation)}
              style={{
                width: "100%",
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#fff",
                fontWeight: "700",
                fontSize: "0.82rem",
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
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Squad will morph smoothly into this tactical geometry on 2nd half whistle.
            </span>
          </div>

          {/* Tactical Substitution */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.74rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                🔄 Tactical Substitution
              </label>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                {snapshot.subsRemaining?.home ?? 3} subs remaining
              </span>
            </div>

            {benchSubs.length > 0 && (snapshot.subsRemaining?.home ?? 3) > 0 ? (
              <form onSubmit={handleSubSubmit} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <select
                  value={selectedStarterId}
                  onChange={(e) => setSelectedStarterId(e.target.value)}
                  style={{
                    flex: 1,
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    color: "#fff",
                    fontSize: "0.75rem",
                    outline: "none",
                  }}
                >
                  <option value="">Sub OFF Starter...</option>
                  {homePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name} ({p.role}) - {p.stamina}%
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  style={{
                    flex: 1,
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    color: "#fff",
                    fontSize: "0.75rem",
                    outline: "none",
                  }}
                >
                  <option value="">Deploy Sub...</option>
                  {benchSubs.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.number} {b.name} ({b.role})
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!selectedStarterId || !selectedSubId}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    background: selectedStarterId && selectedSubId ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.1)",
                    color: selectedStarterId && selectedSubId ? "#000" : "var(--text-muted)",
                    fontWeight: "800",
                    fontSize: "0.75rem",
                    border: "none",
                    cursor: selectedStarterId && selectedSubId ? "pointer" : "default",
                  }}
                >
                  Sub
                </button>
              </form>
            ) : (
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontStyle: "italic", paddingTop: "4px" }}>
                {(snapshot.subsRemaining?.home ?? 3) <= 0
                  ? "All 3 substitutions have been deployed."
                  : "No bench substitutes available."}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "1rem" }}>↔️</span>
            <span>Teams will <strong>swap pitch ends</strong> immediately upon second half kickoff!</span>
          </div>

          <button
            type="button"
            onClick={() => onKickoffSecondHalf(selectedFormation, teamTalk)}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
              border: "none",
              color: "#000",
              fontWeight: "900",
              cursor: "pointer",
              fontSize: "0.88rem",
              letterSpacing: "0.03em",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 20px rgba(0, 242, 254, 0.4)",
            }}
          >
            <span>Kick Off 2nd Half (Swap Ends)</span>
            <FastForward size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
