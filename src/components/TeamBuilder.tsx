// src/components/TeamBuilder.tsx
import React, { useState } from "react";
import { Shield, Sparkles, Sliders, Check } from "lucide-react";
import type { TeamConfig, Formation } from "../types";

interface TeamBuilderProps {
  team: TeamConfig;
  onSave: (team: TeamConfig) => void;
  title?: string;
}

const COLOR_PRESETS = [
  { label: "Carbon Green", primary: "#0F6B45", secondary: "#085C3B" },
  { label: "Carbon Blue", primary: "#0F62FE", secondary: "#0043CE" },
  { label: "Crimson Red", primary: "#DA1E28", secondary: "#A2191F" },
  { label: "Gold Amber", primary: "#F1C21B", secondary: "#B28600" },
  { label: "Royal Purple", primary: "#8A3FFC", secondary: "#6929C4" },
  { label: "Teal Matrix", primary: "#007D79", secondary: "#005D5D" },
];

const PRESET_TACTICS = [
  {
    name: "Pep's Tiki-Taka",
    desc: "Short passing, extreme possession & patient build up.",
    formation: "4-3-3" as Formation,
    prompt: "High possession, short crisp passing, patient build-up, medium-high pressing to recover possession instantly.",
    playerPrompts: {
      gk: "Sweeper keeper, distribute short to center backs, act as extra passing outlet.",
      cdm: "Holding pivot, receive between lines and dictate tempo.",
      cam: "Playmaker CAM, unlock defensive blocks with delicate through-balls.",
      st: "Clinical center forward, drop slightly to link play then attack the box.",
    },
  },
  {
    name: "Klopp's Gegenpress",
    desc: "Relentless high press, suffocating turnovers & vertical runs.",
    formation: "4-3-3" as Formation,
    prompt: "Suffocate opponent in their half with relentless pressing, blitz counter-attacks, direct vertical passing into the box.",
    playerPrompts: {
      gk: "Sweeper keeper, stay alert for loose balls behind our high line.",
      rb: "Overlapping wingback, high workrate and aggressive crosses.",
      cm_r: "Box-to-box engine, press the ball carrier like a madman.",
      st: "Lethal poacher, shoot on sight from any angle in the box.",
    },
  },
  {
    name: "Mourinho's Iron Wall",
    desc: "Compact 5-3-2 low block, hard slide tackles & lethal counters.",
    formation: "5-3-2" as Formation,
    prompt: "Park the bus inside our own third, ruthless slide tackles, absorb pressure, lethal long-ball counter-attacks to lone striker.",
    playerPrompts: {
      gk: "Stay on the line, make reflex stops and launch counter-attacks.",
      cb_c: "Anchor the penalty box, slide tackle anyone within reach, clear all danger.",
      cdm: "Shield the backline and break up opposition plays.",
      st_r: "Target man, hold up the ball and unleash long-range rockets.",
    },
  },
  {
    name: "Samba Flair",
    desc: "Classic 4-4-2 with trickery, aggressive dribbling & long-range curlers.",
    formation: "4-4-2" as Formation,
    prompt: "High tempo dribbling, trick moves, exploit 1v1 duels on the wings, shoot with venom from outside the box.",
    playerPrompts: {
      gk: "Sweeper keeper, distribute to open wingers.",
      rm: "Dribble master, isolate defenders 1v1 on the right wing.",
      cm_r: "Skilled playmaker, look for trivela and finesse passes.",
      st_r: "Acrobatic striker, shoot from distance and test the keeper.",
    },
  },
];

export const TeamBuilder: React.FC<TeamBuilderProps> = ({ team: initialTeam, onSave, title = "Squad Tactical Studio" }) => {
  const [team, setTeam] = useState<TeamConfig>(initialTeam);
  const [activeTab, setActiveTab] = useState<"strategy" | "players">("strategy");
  const [savedBadge, setSavedBadge] = useState(false);

  const applyPreset = (preset: typeof PRESET_TACTICS[0]) => {
    setTeam((prev) => ({
      ...prev,
      formation: preset.formation,
      prompt: preset.prompt,
      playerPrompts: { ...preset.playerPrompts } as unknown as Record<string, string>,
    }));
  };

  const handleSave = () => {
    onSave(team);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  return (
    <div
      className="carbon-card"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        background: "var(--cds-surface)",
        border: "1px solid var(--cds-border)",
        borderRadius: "4px",
        marginTop: "16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--cds-border)",
          paddingBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "4px",
              background: `linear-gradient(135deg, ${team.color}, ${team.secondaryColor || "#085C3B"})`,
              border: "1px solid var(--cds-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <h2 className="type-h3" style={{ margin: 0 }}>{title}</h2>
            <p style={{ color: "var(--cds-text-secondary)", fontSize: "0.82rem", margin: "2px 0 0 0" }}>
              Define your club identity & coach your full 11v11 squad in plain English
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ gap: "6px" }}>
          {savedBadge ? (
            <>
              <Check size={16} /> Saved!
            </>
          ) : (
            <>
              <Sparkles size={16} /> Save & Apply Squad
            </>
          )}
        </button>
      </div>

      {/* Club Identity Form */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {/* Team Name */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--cds-text-secondary)", marginBottom: "6px", fontWeight: "600" }}>
            Club Name
          </label>
          <input
            type="text"
            value={team.name}
            onChange={(e) => setTeam({ ...team, name: e.target.value })}
            className="carbon-input"
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "var(--cds-surface)",
              border: "1px solid var(--cds-border)",
              borderRadius: "4px",
              color: "var(--cds-text-primary)",
              fontFamily: "var(--font-main)",
              fontSize: "0.9rem",
              outline: "none",
            }}
            placeholder="e.g. CAIRN FC"
          />
        </div>

        {/* Formation */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--cds-text-secondary)", marginBottom: "6px", fontWeight: "600" }}>
            Formation
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["4-3-3", "4-4-2", "3-5-2", "5-3-2"] as Formation[]).map((f) => {
              const isSelected = team.formation === f;
              return (
                <button
                  key={f}
                  onClick={() => setTeam({ ...team, formation: f })}
                  style={{
                    flex: 1,
                    padding: "9px 8px",
                    background: isSelected ? "var(--cds-green-primary)" : "var(--cds-surface)",
                    border: `1px solid ${isSelected ? "var(--cds-green-primary)" : "var(--cds-border)"}`,
                    borderRadius: "4px",
                    color: isSelected ? "#FFFFFF" : "var(--cds-text-primary)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Presets */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--cds-text-secondary)", marginBottom: "6px", fontWeight: "600" }}>
            Kit Primary Color
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", paddingTop: "4px" }}>
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.primary}
                onClick={() => setTeam({ ...team, color: c.primary, secondaryColor: c.secondary })}
                title={c.label}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "4px",
                  background: c.primary,
                  border: team.color === c.primary ? "2px solid var(--cds-text-primary)" : "1px solid var(--cds-border)",
                  cursor: "pointer",
                  boxShadow: team.color === c.primary ? `0 0 0 2px var(--cds-green-primary)` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--cds-border)", paddingBottom: "8px" }}>
        <button
          className={activeTab === "strategy" ? "btn btn-primary" : "btn btn-secondary"}
          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
          onClick={() => setActiveTab("strategy")}
        >
          <Sliders size={15} /> Team Philosophy & Presets
        </button>
        <button
          className={activeTab === "players" ? "btn btn-primary" : "btn btn-secondary"}
          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
          onClick={() => setActiveTab("players")}
        >
          <Shield size={15} /> Individual 11v11 Agent Playbooks
        </button>
      </div>

      {/* Tab Content: Strategy & Presets */}
      {activeTab === "strategy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Presets */}
          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--cds-text-secondary)", marginBottom: "8px", fontWeight: "600" }}>
              Quick Tactical Archetypes (Click to populate):
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px" }}>
              {PRESET_TACTICS.map((p) => (
                <div
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  style={{
                    background: "var(--cds-layer)",
                    border: "1px solid var(--cds-border)",
                    borderRadius: "4px",
                    padding: "12px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--cds-green-primary)";
                    e.currentTarget.style.background = "#DEFBE6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--cds-border)";
                    e.currentTarget.style.background = "var(--cds-layer)";
                  }}
                >
                  <div style={{ fontWeight: "700", fontSize: "0.88rem", color: "var(--cds-text-primary)", marginBottom: "4px" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cds-text-secondary)" }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Plain English Prompt Box */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--cds-text-primary)", marginBottom: "6px" }}>
              Overall Team Philosophy (Plain English)
            </label>
            <textarea
              rows={3}
              value={team.prompt}
              onChange={(e) => setTeam({ ...team, prompt: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--cds-surface)",
                border: "1px solid var(--cds-border)",
                borderRadius: "4px",
                color: "var(--cds-text-primary)",
                fontFamily: "var(--font-main)",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                resize: "vertical",
                outline: "none",
              }}
              placeholder="e.g. Suffocate opponent in their half with relentless pressing, blitz counter-attacks, direct vertical passing..."
            />
          </div>

          {/* Quick Keywords Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {[
              "Heavy Gegenpress",
              "Park the Bus",
              "Short Pass Possession",
              "Shoot on Sight",
              "Lethal Counter Attacks",
              "Aggressive Slide Tackles",
              "Exploit Flanks",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() =>
                  setTeam((prev) => ({
                    ...prev,
                    prompt: prev.prompt ? `${prev.prompt}. ${chip}` : chip,
                  }))
                }
                style={{
                  background: "var(--cds-layer)",
                  border: "1px solid var(--cds-border)",
                  borderRadius: "2px",
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  color: "var(--cds-green-primary)",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Individual Player Playbooks */}
      {activeTab === "players" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          {[
            { key: "gk", label: "Goalkeeper (GK)", defaultDesc: "Guards net, shot-stopping, distribution" },
            { key: "cb", label: "Center Backs (CB)", defaultDesc: "Dominant tackles, aerial clearances, defensive line" },
            { key: "fullback", label: "Full Backs / Wingbacks (RB/LB)", defaultDesc: "Flank marking, overlapping crosses" },
            { key: "cdm", label: "Defensive Midfielder (CDM)", defaultDesc: "Screening backline, breaking counters, recycling" },
            { key: "cm", label: "Central Midfielders (CM/CAM)", defaultDesc: "Dictating tempo, through-balls, pressing transitions" },
            { key: "winger", label: "Wingers (RW/LW)", defaultDesc: "1v1 dribbles, cutting inside, crossing, scoring" },
            { key: "st", label: "Center Forward (ST)", defaultDesc: "Finishing, runs into box, shooting on sight" },
          ].map(({ key, label, defaultDesc }) => (
            <div
              key={key}
              style={{
                background: "var(--cds-layer)",
                border: "1px solid var(--cds-border)",
                borderRadius: "4px",
                padding: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--cds-text-primary)" }}>{label}</span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--cds-text-secondary)", marginBottom: "8px" }}>
                {defaultDesc}
              </div>
              <input
                type="text"
                value={(team.playerPrompts as any)?.[key] || ""}
                onChange={(e) =>
                  setTeam({
                    ...team,
                    playerPrompts: {
                      ...team.playerPrompts,
                      [key]: e.target.value,
                    },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "var(--cds-surface)",
                  border: "1px solid var(--cds-border)",
                  borderRadius: "4px",
                  color: "var(--cds-text-primary)",
                  fontFamily: "var(--font-main)",
                  fontSize: "0.82rem",
                  outline: "none",
                }}
                placeholder={`Coaching directive for ${label}...`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
