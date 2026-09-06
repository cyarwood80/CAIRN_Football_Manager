// src/components/TacticsBoardCarbon.tsx
import React, { useState } from "react";
import { CheckCircle2, ChevronRight, Play, Sparkles, Wand2, BookOpen } from "lucide-react";
import { PromptQualityAnalyzer } from "./PromptQualityAnalyzer";
import type { TeamConfig, Formation, SquadPlayerConfig } from "../types";

interface TacticsBoardCarbonProps {
  teamConfig: TeamConfig;
  onSaveTactics: (updated: TeamConfig) => void;
  onSelectPlayerDossier: (player: SquadPlayerConfig) => void;
  onEnterLiveMatch: () => void;
  onOpenMasterclass?: () => void;
}

// 11v11 Formation Coordinate Mapping for Pitch (percent-based: [x%, y%])
const FORMATION_POSITIONS: Record<string, { role: string; label: string; x: number; y: number }[]> = {
  "4-3-3": [
    { role: "GK", label: "GK", x: 50, y: 90 },
    { role: "RB", label: "RB", x: 84, y: 72 },
    { role: "CB", label: "CB", x: 62, y: 76 },
    { role: "CB", label: "CB", x: 38, y: 76 },
    { role: "LB", label: "LB", x: 16, y: 72 },
    { role: "CDM", label: "CDM", x: 50, y: 56 },
    { role: "CM", label: "RCM", x: 70, y: 44 },
    { role: "CM", label: "LCM", x: 30, y: 44 },
    { role: "RW", label: "RW", x: 82, y: 22 },
    { role: "ST", label: "ST", x: 50, y: 16 },
    { role: "LW", label: "LW", x: 18, y: 22 },
  ],
  "4-2-3-1": [
    { role: "GK", label: "GK", x: 50, y: 90 },
    { role: "RB", label: "RB", x: 84, y: 74 },
    { role: "CB", label: "CB", x: 62, y: 78 },
    { role: "CB", label: "CB", x: 38, y: 78 },
    { role: "LB", label: "LB", x: 16, y: 74 },
    { role: "CDM", label: "RDM", x: 64, y: 60 },
    { role: "CDM", label: "LDM", x: 36, y: 60 },
    { role: "RW", label: "RAM", x: 80, y: 38 },
    { role: "CAM", label: "CAM", x: 50, y: 36 },
    { role: "LW", label: "LAM", x: 20, y: 38 },
    { role: "ST", label: "ST", x: 50, y: 16 },
  ],
  "4-4-2": [
    { role: "GK", label: "GK", x: 50, y: 90 },
    { role: "RB", label: "RB", x: 84, y: 74 },
    { role: "CB", label: "CB", x: 62, y: 76 },
    { role: "CB", label: "CB", x: 38, y: 76 },
    { role: "LB", label: "LB", x: 16, y: 74 },
    { role: "RM", label: "RM", x: 84, y: 46 },
    { role: "CM", label: "RCM", x: 62, y: 48 },
    { role: "CM", label: "LCM", x: 38, y: 48 },
    { role: "LM", label: "LM", x: 16, y: 46 },
    { role: "ST", label: "RS", x: 62, y: 20 },
    { role: "ST", label: "LS", x: 38, y: 20 },
  ],
  "3-5-2": [
    { role: "GK", label: "GK", x: 50, y: 90 },
    { role: "CB", label: "RCB", x: 74, y: 76 },
    { role: "CB", label: "CB", x: 50, y: 78 },
    { role: "CB", label: "LCB", x: 26, y: 76 },
    { role: "RWB", label: "RWB", x: 88, y: 50 },
    { role: "CM", label: "RCM", x: 64, y: 52 },
    { role: "CDM", label: "CDM", x: 50, y: 58 },
    { role: "CM", label: "LCM", x: 36, y: 52 },
    { role: "LWB", label: "LWB", x: 12, y: 50 },
    { role: "ST", label: "RS", x: 60, y: 20 },
    { role: "ST", label: "LS", x: 40, y: 20 },
  ],
};

const DEFAULT_TACTICAL_NAMES = [
  "Alisson Becker",
  "Trent Alexander-Arnold",
  "Virgil van Dijk",
  "Ruben Dias",
  "Andrew Robertson",
  "Jude Bellingham",
  "Moises Caicedo",
  "Mohamed Salah",
  "Bruno Fernandes",
  "Marcus Rashford",
  "Erling Haaland",
];

export const TacticsBoardCarbon: React.FC<TacticsBoardCarbonProps> = ({
  teamConfig,
  onSaveTactics,
  onSelectPlayerDossier,
  onEnterLiveMatch,
  onOpenMasterclass,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"Formation" | "Instructions" | "Player Roles" | "Set Pieces">("Formation");
  const [formation, setFormation] = useState<Formation>(teamConfig.formation || "4-2-3-1");
  const [tacticalStyle, setTacticalStyle] = useState("Balanced");
  const [buildUp, setBuildUp] = useState("Mixed");
  const [chanceCreation, setChanceCreation] = useState("Short Passing");
  const [width, setWidth] = useState("Balanced");
  const [coachingPrompt, setCoachingPrompt] = useState<string>(
    teamConfig.prompt || "Relentless high pressing, suffocate opponent in their half, blitz vertical counter-attacks immediately on turnover."
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [optimizationFeedback, setOptimizationFeedback] = useState<{ technique: string; explanation: string } | null>(null);

  const handleOptimizePrompt = async () => {
    if (!coachingPrompt.trim()) return;
    setIsOptimizingPrompt(true);
    try {
      const res = await fetch("/api/llm/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawPrompt: coachingPrompt }),
      });
      const data = await res.json();
      if (data.optimizedPrompt) {
        setCoachingPrompt(data.optimizedPrompt);
        setOptimizationFeedback({
          technique: data.techniqueApplied || "Few-Shot + CoT Spatial Reasoning",
          explanation: data.reasoningExplanation || "Structured into role-based spatial triggers and defensive guardrails.",
        });
      }
    } catch (e) {
      console.error("Prompt optimization failed:", e);
    } finally {
      setIsOptimizingPrompt(false);
    }
  };

  // Team Instructions State
  const [defensiveLine, setDefensiveLine] = useState("Higher");
  const [lineOfEngagement, setLineOfEngagement] = useState("Balanced");
  const [pressingIntensity, setPressingIntensity] = useState("Medium");
  const [defensiveWidth, setDefensiveWidth] = useState("Balanced");
  const [attackingWidth, setAttackingWidth] = useState("Balanced");
  const [freeRoles, setFreeRoles] = useState("Allowed");

  const positions = FORMATION_POSITIONS[formation] || FORMATION_POSITIONS["4-3-3"];
  const squad = teamConfig.starting11 && teamConfig.starting11.length >= 11
    ? teamConfig.starting11
    : DEFAULT_TACTICAL_NAMES.map((name, i) => ({
        number: i + 1,
        name,
        role: positions[i]?.role || "CM",
        rating: 8.5,
        transferValue: 50.0,
      }));

  const handleSave = () => {
    const updated: TeamConfig = {
      ...teamConfig,
      formation,
      prompt: coachingPrompt.trim() || `${tacticalStyle} style, ${buildUp} build-up, ${chanceCreation} in final third, ${width} attacking width.`,
    };
    onSaveTactics(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Top Header & Sub-Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="type-h1" style={{ marginBottom: "8px" }}>Tactics</h1>
          {/* Sub Tabs */}
          <div style={{ display: "flex", gap: "2px", borderBottom: "1px solid var(--cds-border)" }}>
            {(["Formation", "Instructions", "Player Roles", "Set Pieces"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: activeSubTab === tab ? 600 : 400,
                  color: activeSubTab === tab ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
                  background: "transparent",
                  border: "none",
                  borderBottom: activeSubTab === tab ? "2px solid var(--cds-green-primary)" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.1s ease",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {onOpenMasterclass && (
            <button
              className="btn btn-secondary"
              onClick={onOpenMasterclass}
              style={{
                height: "36px",
                padding: "0 14px",
                gap: "6px",
                background: "linear-gradient(135deg, rgba(15, 107, 69, 0.12) 0%, rgba(138, 63, 252, 0.15) 100%)",
                borderColor: "#8A3FFC",
                color: "var(--cds-text-primary)",
                fontWeight: "600",
                fontSize: "12px",
              }}
              title="Open Prompt Engineering Masterclass & Playbook"
            >
              <Sparkles size={14} color="#8A3FFC" />
              <span>Prompt Masterclass</span>
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={onEnterLiveMatch}
            style={{ height: "36px", padding: "0 16px", gap: "8px" }}
          >
            <Play size={15} />
            <span>Enter Live Match Simulation</span>
          </button>
        </div>
      </div>

      {/* 3-Column Layout: Left Controls, Center 2D Pitch, Right Instructions */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 300px", gap: "20px", alignItems: "start" }}>
        {/* Left Column: Tactics Selectors based on active tab */}
        <div className="carbon-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {activeSubTab === "Formation" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                  Formation
                </label>
                <select
                  className="carbon-input"
                  style={{ width: "100%", height: "36px", cursor: "pointer" }}
                  value={formation}
                  onChange={(e) => setFormation(e.target.value as Formation)}
                >
                  <option value="4-2-3-1">4-2-3-1 Wide</option>
                  <option value="4-3-3">4-3-3 Attack</option>
                  <option value="4-4-2">4-4-2 Standard</option>
                  <option value="3-5-2">3-5-2 Wingbacks</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                  Tactical Style
                </label>
                <select
                  className="carbon-input"
                  style={{ width: "100%", height: "36px", cursor: "pointer" }}
                  value={tacticalStyle}
                  onChange={(e) => setTacticalStyle(e.target.value)}
                >
                  <option value="Balanced">Balanced</option>
                  <option value="Gegenpress">Gegenpress (High Press)</option>
                  <option value="Tiki-Taka">Tiki-Taka (Possession)</option>
                  <option value="Direct Counter">Direct Counter-Attack</option>
                  <option value="Park the Bus">Low Block Anchor</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                  Build Up
                </label>
                <select
                  className="carbon-input"
                  style={{ width: "100%", height: "36px", cursor: "pointer" }}
                  value={buildUp}
                  onChange={(e) => setBuildUp(e.target.value)}
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Short Passing">Short Passing Out of Back</option>
                  <option value="Direct">Direct Through Channels</option>
                  <option value="Long Balls">Long Balls to Target Man</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                  Chance Creation
                </label>
                <select
                  className="carbon-input"
                  style={{ width: "100%", height: "36px", cursor: "pointer" }}
                  value={chanceCreation}
                  onChange={(e) => setChanceCreation(e.target.value)}
                >
                  <option value="Short Passing">Short Passing Work In Box</option>
                  <option value="Crosses">Whipped Crosses</option>
                  <option value="Shoot on Sight">Shoot on Sight</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                  Width
                </label>
                <select
                  className="carbon-input"
                  style={{ width: "100%", height: "36px", cursor: "pointer" }}
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                >
                  <option value="Balanced">Balanced</option>
                  <option value="Wide">Wide Touchline Hugging</option>
                  <option value="Narrow">Narrow Central Overload</option>
                </select>
              </div>
            </>
          )}

          {activeSubTab === "Instructions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)" }}>
                  AI Coaching Directive (Plain English)
                </label>
                <button
                  type="button"
                  onClick={handleOptimizePrompt}
                  disabled={isOptimizingPrompt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "rgba(138, 63, 252, 0.12)",
                    border: "1px solid #8A3FFC",
                    borderRadius: "3px",
                    color: "#8A3FFC",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 8px",
                    cursor: isOptimizingPrompt ? "wait" : "pointer",
                  }}
                  title="Automatically upgrade this prompt into structured UEFA Pro prompt engineering format"
                >
                  <Wand2 size={12} />
                  <span>{isOptimizingPrompt ? "Optimizing..." : "⚡ AI 1-Click Optimize"}</span>
                </button>
              </div>

              <textarea
                className="carbon-input"
                rows={4}
                value={coachingPrompt}
                onChange={(e) => setCoachingPrompt(e.target.value)}
                placeholder="e.g. Relentless high pressing, suffocate opponent in their half, quick vertical passing on turnover..."
                style={{ width: "100%", resize: "vertical", fontSize: "12px", lineHeight: "1.4", padding: "8px" }}
              />

              {optimizationFeedback && (
                <div
                  style={{
                    background: "var(--cds-layer-selected)",
                    border: "1px solid var(--cds-green-primary)",
                    borderRadius: "3px",
                    padding: "8px 10px",
                    fontSize: "11px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", color: "var(--cds-green-primary)" }}>
                      ✨ Applied: {optimizationFeedback.technique}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOptimizationFeedback(null)}
                      style={{ background: "transparent", border: "none", color: "var(--cds-text-muted)", cursor: "pointer", fontSize: "11px" }}
                    >
                      ✕
                    </button>
                  </div>
                  <span style={{ color: "var(--cds-text-secondary)", lineHeight: 1.3 }}>
                    {optimizationFeedback.explanation}
                  </span>
                </div>
              )}

              {/* Quick Preset Buttons */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--cds-text-secondary)", display: "block", marginBottom: "4px" }}>
                  Quick Presets:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {[
                    { label: "Gegenpress", text: "Relentless high pressing, suffocate opponent in their half, blitz vertical counter-attacks immediately on turnover." },
                    { label: "Tiki-Taka", text: "Patient possession triangles, high tactical discipline, control tempo through midfield, isolate wingers 1v1." },
                    { label: "Low Block", text: "Compact defensive line, absorb pressure in low block, hit long direct through-balls behind opponent fullbacks." },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoachingPrompt(p.text)}
                      style={{
                        padding: "3px 8px",
                        fontSize: "11px",
                        background: "var(--cds-layer)",
                        border: "1px solid var(--cds-border)",
                        borderRadius: "2px",
                        cursor: "pointer",
                        color: "var(--cds-text-primary)",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Prompt Analyzer */}
              <PromptQualityAnalyzer promptText={coachingPrompt} compact={true} />

              {/* Masterclass Link Banner */}
              {onOpenMasterclass && (
                <div
                  onClick={onOpenMasterclass}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "3px",
                    background: "var(--cds-layer)",
                    border: "1px dashed var(--cds-border)",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: "var(--cds-text-secondary)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <BookOpen size={14} color="var(--cds-green-primary)" />
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: "var(--cds-text-primary)" }}>Learn Prompt Engineering</strong>
                    <p style={{ margin: 0, fontSize: "10px", color: "var(--cds-text-muted)" }}>
                      Explore Personas, CoT & Negative Constraints.
                    </p>
                  </div>
                  <ChevronRight size={14} color="var(--cds-text-muted)" />
                </div>
              )}
            </div>
          )}

          {activeSubTab === "Player Roles" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)" }}>
                Key Tactical Roles ({squad.length} Starters)
              </span>
              <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {squad.slice(0, 11).map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectPlayerDossier(p)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 8px",
                      background: "var(--cds-layer)",
                      borderRadius: "2px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: "700", marginRight: "6px" }}>#{p.number}</span>
                      <span>{p.name}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--cds-green-primary)", fontWeight: "600" }}>{p.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === "Set Pieces" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)" }}>
                Designated Specialists
              </span>
              {[
                { label: "Captain", defaultPlayer: squad[0]?.name || "Player 1" },
                { label: "Corners", defaultPlayer: squad[1]?.name || "Player 2" },
                { label: "Free Kicks", defaultPlayer: squad[2]?.name || "Player 3" },
                { label: "Penalties", defaultPlayer: squad[3]?.name || "Player 4" },
              ].map((sp, idx) => (
                <div key={idx}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "4px" }}>
                    {sp.label}
                  </label>
                  <select className="carbon-input" style={{ width: "100%", height: "32px", fontSize: "12px" }}>
                    {squad.slice(0, 11).map((p, pIdx) => (
                      <option key={pIdx} value={p.name}>#{p.number} {p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ marginTop: "8px", width: "100%", height: "38px" }}
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={16} />
                <span>Tactic Saved!</span>
              </>
            ) : (
              <span>Save Tactic</span>
            )}
          </button>
        </div>

        {/* Center Column: 2D Football Pitch matching screenshot */}
        <div
          className="carbon-card"
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#185B37",
            borderRadius: "4px",
            border: "1px solid #0F4528",
            position: "relative",
            minHeight: "560px",
            boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.35)",
            overflow: "hidden",
          }}
        >
          {/* Pitch Lines (SVG overlay) */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Pitch Outer Touchlines */}
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            {/* Halfway Line */}
            <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            {/* Center Circle */}
            <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.9)" />
            {/* Top Penalty Box (Opponent) */}
            <rect x="25" y="5" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            <rect x="36" y="5" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            {/* Bottom Penalty Box (Our GK) */}
            <rect x="25" y="77" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            <rect x="36" y="89" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
          </svg>

          {/* Grass Turf Stripes Pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 30px, transparent 30px, transparent 60px)",
              pointerEvents: "none",
            }}
          />

          {/* Interactive Player Tokens on Pitch */}
          {positions.map((pos, idx) => {
            const player = squad[idx] || { number: idx + 1, name: `Player ${idx + 1}`, role: pos.role };
            const displayName = player.name.split(" ").slice(-1)[0] || player.name;

            return (
              <div
                key={idx}
                onClick={() => onSelectPlayerDossier(player)}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                title={`Click to inspect ${player.name} (${pos.label})`}
              >
                {/* Circular Token */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#08331E",
                    border: "2px solid #FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontWeight: "800",
                    fontSize: "13px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {player.number || idx + 1}
                </div>

                {/* Player Name Pill */}
                <span
                  style={{
                    marginTop: "3px",
                    background: "rgba(0, 0, 0, 0.75)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    whiteSpace: "nowrap",
                    maxWidth: "80px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Column: Team Instructions & Key Stats Rings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Team Instructions */}
          <div className="carbon-card" style={{ padding: "18px" }}>
            <div className="type-h3" style={{ fontSize: "14px", marginBottom: "12px" }}>
              Team Instructions
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Defensive Line", val: defensiveLine, set: setDefensiveLine, options: ["Higher", "Standard", "Deep"] },
                { label: "Line of Engagement", val: lineOfEngagement, set: setLineOfEngagement, options: ["High Press", "Balanced", "Low Block"] },
                { label: "Pressing Intensity", val: pressingIntensity, set: setPressingIntensity, options: ["Maximum", "Medium", "Cautious"] },
                { label: "Defensive Width", val: defensiveWidth, set: setDefensiveWidth, options: ["Compact", "Balanced", "Wide"] },
                { label: "Attacking Width", val: attackingWidth, set: setAttackingWidth, options: ["Wide", "Balanced", "Narrow"] },
                { label: "Free Roles", val: freeRoles, set: setFreeRoles, options: ["Allowed", "Disciplined"] },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const currIdx = item.options.indexOf(item.val);
                    const next = item.options[(currIdx + 1) % item.options.length];
                    item.set(next);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    borderRadius: "2px",
                    cursor: "pointer",
                    fontSize: "13px",
                    background: "var(--cds-layer)",
                  }}
                  title="Click to cycle option"
                >
                  <span style={{ color: "var(--cds-text-secondary)" }}>{item.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--cds-text-primary)", fontWeight: "600" }}>
                    <span>{item.val}</span>
                    <ChevronRight size={14} color="var(--cds-text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Stats (Last 5 Matches) Rings */}
          <div className="carbon-card" style={{ padding: "18px" }}>
            <div className="type-h3" style={{ fontSize: "14px", marginBottom: "14px" }}>
              Key Stats (Last 5 Matches)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
              {/* Stat 1: Possession */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: "3px solid var(--cds-green-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--cds-text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  62%
                </div>
                <span style={{ fontSize: "11px", color: "var(--cds-text-secondary)" }}>Possession</span>
              </div>

              {/* Stat 2: Shots */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: "3px solid #0F62FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "var(--cds-text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  18
                </div>
                <span style={{ fontSize: "11px", color: "var(--cds-text-secondary)" }}>Shots / match</span>
              </div>

              {/* Stat 3: Avg Rating */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: "3px solid var(--cds-amber)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "var(--cds-text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  6.4
                </div>
                <span style={{ fontSize: "11px", color: "var(--cds-text-secondary)" }}>Avg. Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
