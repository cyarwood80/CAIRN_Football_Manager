// src/components/PlayerDossierModal.tsx
import React, { useState } from "react";
import { X, Sparkles, Brain, Zap, TrendingUp } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import type { SquadPlayerConfig } from "../types";

interface PlayerDossierModalProps {
  player: SquadPlayerConfig | null;
  onClose: () => void;
  clubName?: string;
  onApplyRecommendation?: (directive: string) => void;
}

export const PlayerDossierModal: React.FC<PlayerDossierModalProps> = ({
  player,
  onClose,
  clubName = "CAIRN FC",
  onApplyRecommendation,
}) => {
  const [activeTab, setActiveTab] = useState<"Overview" | "Performance" | "Development" | "Tactics" | "Contract" | "Scouting">("Overview");
  const [recommendationApplied, setRecommendationApplied] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);

  if (!player) return null;

  const ovrRating = Math.round((player.rating || 8.5) * 10);
  const val = player.transferValue ? `£${player.transferValue.toFixed(1)}m` : "£82.0m";
  const wage = player.transferValue ? `£${Math.round(player.transferValue * 4.2)}k p/w` : "£350k p/w";

  // Deterministic attribute calculation from player rating & role
  const isFwd = ["ST", "RW", "LW", "FWD"].includes(player.role);
  const isMid = ["CM", "CAM", "CDM", "RM", "LM", "MID"].includes(player.role);
  const isDef = ["CB", "RB", "LB", "DEF"].includes(player.role);

  const pace = Math.min(99, Math.round(ovrRating + (isFwd ? 3 : -2)));
  const shooting = Math.min(99, Math.round(ovrRating + (isFwd ? 2 : isMid ? -4 : -35)));
  const passing = Math.min(99, Math.round(ovrRating + (isMid ? 2 : 0)));
  const dribbling = Math.min(99, Math.round(ovrRating + (isFwd ? 4 : isMid ? 1 : -10)));
  const finishing = Math.min(99, Math.round(ovrRating + (isFwd ? 1 : -15)));
  const firstTouch = Math.min(99, Math.round(ovrRating + 2));

  const vision = Math.min(99, Math.round(ovrRating + (isMid ? 3 : -3)));
  const crossing = Math.min(99, Math.round(ovrRating + (player.role.includes("W") || player.role.includes("B") ? 2 : -6)));
  const technique = Math.min(99, Math.round(ovrRating + 2));
  const workRate = Math.min(99, Math.round(ovrRating - 8));
  const defending = Math.min(99, Math.round(isDef ? ovrRating + 2 : isMid ? 65 : 45));
  const physical = Math.min(99, Math.round(ovrRating - (isFwd ? 8 : -2)));

  const attributesLeft = [
    { label: "Pace", val: pace },
    { label: "Shooting", val: shooting },
    { label: "Passing", val: passing },
    { label: "Dribbling", val: dribbling },
    { label: "Finishing", val: finishing },
    { label: "First Touch", val: firstTouch },
  ];

  const attributesRight = [
    { label: "Vision", val: vision },
    { label: "Crossing", val: crossing },
    { label: "Technique", val: technique },
    { label: "Work Rate", val: workRate },
    { label: "Defending", val: defending },
    { label: "Physical", val: physical },
  ];

  const recentMatches = [
    { date: "12 Sep", opponent: "CAIRN FC", pos: player.role, gls: isFwd ? 1 : 0, ast: isMid ? 1 : 0, rating: "8.5" },
    { date: "29 Aug", opponent: "Man Utd", pos: player.role, gls: 0, ast: isFwd ? 1 : 0, rating: "7.8" },
    { date: "22 Aug", opponent: "Bournemouth", pos: player.role, gls: isFwd ? 1 : 0, ast: 0, rating: "8.2" },
    { date: "15 Aug", opponent: "Spurs", pos: player.role, gls: 0, ast: 1, rating: "7.6" },
    { date: "8 Aug", opponent: "Newcastle", pos: player.role, gls: isFwd ? 2 : 0, ast: 0, rating: "9.1" },
  ];

  const getStatColor = (val: number) => {
    if (val >= 80) return "var(--cds-green-primary)";
    if (val >= 70) return "var(--cds-amber)";
    return "var(--cds-red)";
  };

  const handleApply = () => {
    setRecommendationApplied(true);
    if (onApplyRecommendation) {
      onApplyRecommendation(`${player.name} tactical focus: stay wide to stretch back line, exploit 1v1 space.`);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="carbon-card"
        style={{
          width: "min(960px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--cds-surface)",
          borderRadius: "4px",
          border: "1px solid var(--cds-border)",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.25)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hero Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "18px", borderBottom: "1px solid var(--cds-border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Big Cartoon Portrait */}
            <PlayerAvatar
              name={player.name}
              size="xl"
              teamColor="#0F6B45"
              showFlag={true}
              traitIcon={player.personalityIcon}
            />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <h1 className="type-h1" style={{ fontSize: "26px", margin: 0 }}>
                  {player.name}
                </h1>
                <span style={{ fontSize: "20px" }}>🇪🇬</span>
              </div>

              <div style={{ fontSize: "14px", color: "var(--cds-text-secondary)", marginBottom: "10px" }}>
                <strong style={{ color: "var(--cds-text-primary)" }}>{player.role}</strong> | 32 years old | {clubName}
              </div>

              {/* Rating, Form & Last 5 Games */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--cds-green-primary)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                    {ovrRating}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--cds-text-muted)" }}>OVR</span>
                </div>

                <div style={{ borderLeft: "1px solid var(--cds-border)", paddingLeft: "14px" }}>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", marginBottom: "2px" }}>Form</div>
                  <div style={{ display: "flex", gap: "3px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cds-green-primary)" }} />
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cds-green-primary)" }} />
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cds-green-primary)" }} />
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cds-green-primary)" }} />
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C6C6C6" }} />
                  </div>
                </div>

                <div style={{ borderLeft: "1px solid var(--cds-border)", paddingLeft: "14px" }}>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", marginBottom: "2px" }}>Last 5 games</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-text-primary)" }}>4.8</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Valuation & Shortlist */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--cds-text-secondary)", padding: "4px" }}
              title="Close Dossier"
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", gap: "20px", textAlign: "right", marginTop: "8px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>Value</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)" }}>{val}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>Wage</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)" }}>{wage}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>Contract</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)" }}>2027</div>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setShortlisted(!shortlisted)}
              style={{ height: "32px", fontSize: "12px", marginTop: "4px" }}
            >
              {shortlisted ? "✓ Shortlisted" : "Add to Shortlist"}
            </button>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--cds-border)" }}>
          {(["Overview", "Performance", "Development", "Tactics", "Contract", "Scouting"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid var(--cds-green-primary)" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content: 2-Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Left Column: Attributes & Recent Matches */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Attributes Section */}
            <div>
              <div className="type-h3" style={{ fontSize: "14px", marginBottom: "10px" }}>
                Attributes
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                {/* Column 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {attributesLeft.map((attr, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "13px",
                        padding: "4px 0",
                        borderBottom: "1px solid var(--cds-border-subtle)",
                      }}
                    >
                      <span style={{ color: "var(--cds-text-secondary)" }}>{attr.label}</span>
                      <span style={{ fontWeight: "700", color: getStatColor(attr.val), fontFamily: "var(--font-mono)" }}>
                        {attr.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {attributesRight.map((attr, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "13px",
                        padding: "4px 0",
                        borderBottom: "1px solid var(--cds-border-subtle)",
                      }}
                    >
                      <span style={{ color: "var(--cds-text-secondary)" }}>{attr.label}</span>
                      <span style={{ fontWeight: "700", color: getStatColor(attr.val), fontFamily: "var(--font-mono)" }}>
                        {attr.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Matches Table */}
            <div>
              <div className="type-h3" style={{ fontSize: "14px", marginBottom: "10px" }}>
                Recent Matches
              </div>

              <table className="carbon-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Opponent</th>
                    <th>Pos</th>
                    <th>Gls</th>
                    <th>Ast</th>
                    <th style={{ textAlign: "right" }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMatches.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ color: "var(--cds-text-muted)", fontSize: "12px" }}>{m.date}</td>
                      <td style={{ fontWeight: "500" }}>{m.opponent}</td>
                      <td>
                        <span style={{ background: "var(--cds-layer)", padding: "1px 4px", borderRadius: "2px", fontSize: "11px" }}>
                          {m.pos}
                        </span>
                      </td>
                      <td>{m.gls}</td>
                      <td>{m.ast}</td>
                      <td style={{ textAlign: "right", fontWeight: "700", color: "var(--cds-green-primary)" }}>
                        {m.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Position Heatmap & AI Recommendation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Position Pitch Graphic */}
            <div className="carbon-card" style={{ padding: "16px" }}>
              <div className="type-h3" style={{ fontSize: "14px", marginBottom: "10px" }}>
                Position
              </div>

              {/* Mini 2D pitch graphic */}
              <div
                style={{
                  height: "120px",
                  background: "#1F7A4C",
                  borderRadius: "2px",
                  position: "relative",
                  border: "1px solid #196941",
                  marginBottom: "12px",
                }}
              >
                {/* Center touchline */}
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.6)" }} />
                {/* Center circle */}
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.6)" }} />
                {/* Active Player Dot */}
                <div
                  style={{
                    position: "absolute",
                    right: "20%",
                    top: "30%",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "#08331E",
                    border: "2px solid #FFFFFF",
                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                  }}
                  title="Primary Position: RW"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>Primary Position</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--cds-text-primary)" }}>{player.role}</div>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", marginTop: "4px" }}>Role: Inside Forward</div>
                </div>
                <button className="btn btn-secondary" style={{ height: "28px", fontSize: "12px" }}>
                  Change Role
                </button>
              </div>
            </div>

            {/* AI Learning & Cognitive Evolution Card */}
            <div
              className="carbon-card"
              style={{
                padding: "16px",
                background: "var(--cds-surface)",
                border: "1px solid var(--cds-border)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--cds-green-primary)", fontWeight: "700", fontSize: "13px" }}>
                  <Brain size={16} />
                  <span>AI Prompt Mastery & Evolution</span>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 6px", borderRadius: "2px", background: "#DEFBE6", color: "var(--cds-green-primary)", border: "1px solid #A7F0BA" }}>
                  ⭐ Potential: {(player.potentialRating || (player.rating || 5.8) + 1.8).toFixed(1)}
                </span>
              </div>

              {/* Progress to next OVR Breakthrough */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span style={{ color: "var(--cds-text-secondary)" }}>Growth XP to next Breakthrough:</span>
                  <span style={{ fontWeight: "700", color: "var(--cds-text-primary)" }}>
                    {player.growthPoints || 6} / 10 XP
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "var(--cds-layer)", borderRadius: "2px", overflow: "hidden", border: "1px solid var(--cds-border)" }}>
                  <div style={{ width: `${Math.min(100, ((player.growthPoints || 6) / 10) * 100)}%`, height: "100%", background: "var(--cds-green-primary)" }} />
                </div>
              </div>

              {/* Tactical Mastery Meter */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "var(--cds-layer)", borderRadius: "4px", fontSize: "12px" }}>
                <span style={{ color: "var(--cds-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <TrendingUp size={13} color="var(--cds-blue)" /> Tactical Mastery:
                </span>
                <span style={{ fontWeight: "700", color: "var(--cds-blue)" }}>
                  {player.tacticalMastery || 82}% (Prompt Responsive)
                </span>
              </div>

              {/* Resonating Keywords */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Zap size={12} color="#8A3FFC" /> Best Resonating Coaching Directives:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                  {(player.personalityTrait === "Creative"
                    ? ["delicate through-ball", "creative freedom", "possession triangles"]
                    : player.personalityTrait === "Flair"
                    ? ["isolate 1v1", "cut inside", "shoot on sight"]
                    : player.personalityTrait === "Aggressive"
                    ? ["heavy gegenpress", "relentless tackle", "hunt turnovers"]
                    : player.personalityTrait === "Leader"
                    ? ["maintain shape", "organize backline", "game management"]
                    : ["compact block", "positional discipline", "recycle ball"]
                  ).map((kw, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 6px",
                        borderRadius: "2px",
                        background: "#F8F0FE",
                        border: "1px solid #E8DAFF",
                        color: "#6929C4",
                      }}
                    >
                      &quot;{kw}&quot;
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommendation Card */}
            <div
              className="carbon-card"
              style={{
                padding: "16px",
                background: "var(--cds-layer)",
                borderColor: "rgba(15, 107, 69, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--cds-green-primary)", fontWeight: "700", fontSize: "13px", marginBottom: "8px" }}>
                <Sparkles size={16} />
                <span>AI Recommendation</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--cds-text-secondary)", lineHeight: 1.45, marginBottom: "12px" }}>
                {recommendationApplied
                  ? `✓ Applied to tactics: ${player.name} instructed to stay wide against Liverpool to stretch their back line.`
                  : `${player.name} is in excellent form and should start against Liverpool. Consider keeping him wide to stretch their back line.`}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {!recommendationApplied ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={handleApply}
                      style={{ height: "30px", fontSize: "12px", padding: "0 14px" }}
                    >
                      Apply
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setRecommendationApplied(true)}
                      style={{ height: "30px", fontSize: "12px", padding: "0 12px" }}
                    >
                      Review
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--cds-green-primary)", fontWeight: "600" }}>
                    Active in Matchday Instructions
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
