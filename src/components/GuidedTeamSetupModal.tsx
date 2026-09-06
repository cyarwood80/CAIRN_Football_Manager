// src/components/GuidedTeamSetupModal.tsx
import React, { useState, useEffect } from "react";
import { Dices, Check, Trophy, Shirt } from "lucide-react";
import type { TeamConfig, Formation } from "../types";

interface GuidedTeamSetupModalProps {
  isOpen: boolean;
  currentTeam: TeamConfig;
  onClose: () => void;
  onCompleteSetup: (newTeam: TeamConfig, initialBudget: number) => void;
}

const PRESET_NAMES = [
  "East End Wanderers",
  "Harbor Athletic FC",
  "Peak District Town",
  "Southwark Rovers",
  "Highland Rangers",
  "Boroughbridge United",
  "Thameside City",
  "Avonmouth Albion",
  "Pennine Celtic",
  "Mersey Grassroots FC",
];

const PRESET_COLORS = [
  { primary: "#00E5FF", secondary: "#0A192F", name: "Cyber Cyan" },
  { primary: "#10B981", secondary: "#064E3B", name: "Emerald Forest" },
  { primary: "#F59E0B", secondary: "#78350F", name: "Amber Gold" },
  { primary: "#EC4899", secondary: "#831843", name: "Neon Rose" },
  { primary: "#8B5CF6", secondary: "#4C1D95", name: "Royal Purple" },
  { primary: "#3B82F6", secondary: "#1E3A8A", name: "Ocean Blue" },
  { primary: "#EF4444", secondary: "#7F1D1D", name: "Crimson Red" },
  { primary: "#E2E8F0", secondary: "#1E293B", name: "Classic Monochrome" },
];

export const GuidedTeamSetupModal: React.FC<GuidedTeamSetupModalProps> = ({
  isOpen,
  currentTeam,
  onClose: _onClose,
  onCompleteSetup,
}) => {
  const [teamName, setTeamName] = useState(
    currentTeam.name && !currentTeam.name.includes("Arsenal") && !currentTeam.name.includes("Manchester")
      ? currentTeam.name
      : "East End Wanderers FC"
  );
  const [primaryColor, setPrimaryColor] = useState(currentTeam.color || "#00E5FF");
  const [secondaryColor, setSecondaryColor] = useState(currentTeam.secondaryColor || "#0A192F");
  const [formation, setFormation] = useState<Formation>(currentTeam.formation || "4-3-3");
  const [draftSquad, setDraftSquad] = useState<any | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  const fetchRandomDraft = async (nameToUse: string) => {
    setIsLoadingDraft(true);
    try {
      const res = await fetch(`/api/cm/draft?name=${encodeURIComponent(nameToUse || "Grassroots FC")}&tier=tier_4`);
      if (res.ok) {
        const data = await res.json();
        if (data.squad) {
          setDraftSquad(data.squad);
        }
      }
    } catch (e) {
      console.warn("Could not draft squad:", e);
    } finally {
      setIsLoadingDraft(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRandomDraft(teamName);
    }
  }, [isOpen]);

  const handleRandomizeName = () => {
    const randomName = PRESET_NAMES[Math.floor(Math.random() * PRESET_NAMES.length)];
    setTeamName(randomName);
    fetchRandomDraft(randomName);
  };

  const handleFinish = () => {
    if (!draftSquad) return;

    const compiledTeam: TeamConfig = {
      name: teamName.trim() || "Grassroots United FC",
      color: primaryColor,
      secondaryColor,
      formation,
      prompt: currentTeam.prompt || "Compact defensive block, direct vertical transitions, striker shoot on sight",
      starting11: draftSquad.starting11,
      benchSubs: draftSquad.benchSubs,
      squadHarmony: 75,
      transferBudget: 1.5, // £1.5M grassroots starting budget
      totalSquadValue: draftSquad.totalSquadValue || 3.5,
    };

    onCompleteSetup(compiledTeam, 1.5);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "880px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 26, 0.98) 100%)",
          border: "1px solid rgba(0, 229, 255, 0.3)",
          borderRadius: "18px",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Header Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#10b981",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  textTransform: "uppercase",
                }}
              >
                Grassroots Career Mode
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>•</span>
              <span style={{ color: "#38bdf8", fontSize: "0.8rem", fontWeight: "700" }}>Tier 4: National League</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "900", color: "#fff" }}>
              Create Your Football Club
            </h2>
            <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Every manager begins at the bottom of the pyramid. Craft your identity, receive your grassroots squad, and earn your way to the top.
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Starting Budget</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "#10b981" }}>£1.5M</div>
          </div>
        </div>

        {/* Club Details Configuration Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {/* Column 1: Identity & Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>
                Club Name
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. East End Wanderers"
                  style={{
                    flex: 1,
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleRandomizeName}
                  title="Randomize Name & Re-roll Squad"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    padding: "0 12px",
                    color: "#00E5FF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                  }}
                >
                  <Dices size={16} />
                  <span>Random</span>
                </button>
              </div>
            </div>

            {/* Kit Colors */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px" }}>
                Kit Strip Colors (Home & Away)
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                {PRESET_COLORS.map((cp) => (
                  <button
                    key={cp.name}
                    onClick={() => {
                      setPrimaryColor(cp.primary);
                      setSecondaryColor(cp.secondary);
                    }}
                    title={cp.name}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: primaryColor === cp.primary ? "2px solid #fff" : "1px solid rgba(255, 255, 255, 0.2)",
                      background: `linear-gradient(135deg, ${cp.primary} 50%, ${cp.secondary} 50%)`,
                      cursor: "pointer",
                      boxShadow: primaryColor === cp.primary ? "0 0 10px rgba(0, 229, 255, 0.5)" : "none",
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: "32px", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer", background: "transparent" }}
                  />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Primary Kit</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ width: "32px", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer", background: "transparent" }}
                  />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Trim / Numbers</span>
                </div>
              </div>
            </div>

            {/* Formation Selector */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>
                Tactical Formation
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["4-3-3", "4-4-2", "3-5-2", "5-3-2"] as Formation[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormation(f)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: "6px",
                      border: `1px solid ${formation === f ? "#00E5FF" : "rgba(255, 255, 255, 0.1)"}`,
                      background: formation === f ? "rgba(0, 229, 255, 0.15)" : "rgba(0, 0, 0, 0.3)",
                      color: formation === f ? "#00E5FF" : "var(--text-secondary)",
                      fontWeight: "800",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Squad Roster Preview */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: "800", color: "#fff" }}>
                <Shirt size={16} color={primaryColor} />
                <span>Generated 14-Player Squad (Tier 4)</span>
              </div>
              <button
                onClick={() => fetchRandomDraft(teamName)}
                disabled={isLoadingDraft}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#38bdf8",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {isLoadingDraft ? "Scouting..." : "🔄 Re-roll Squad"}
              </button>
            </div>

            {/* Squad List Scroll */}
            <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", paddingRight: "4px" }}>
              {draftSquad?.starting11?.map((p: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 10px",
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: "800", color: primaryColor, width: "18px" }}>#{p.number}</span>
                    <span style={{ fontWeight: "700", color: "#fff" }}>{p.name}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{p.role}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      title={p.personalityDescription}
                      style={{
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontSize: "0.68rem",
                        fontWeight: "700",
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "#38bdf8",
                      }}
                    >
                      {p.personalityIcon || "🛡️"} {p.personalityTrait || "Methodical"}
                    </span>
                    <span style={{ fontWeight: "800", color: "#10b981", fontSize: "0.75rem" }}>
                      ⭐ {p.rating?.toFixed(1) || "5.7"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Squad Summary Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "8px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span>Average Squad Rating: <strong style={{ color: "#fff" }}>5.7 / 10</strong></span>
              <span>Squad Value: <strong style={{ color: "#38bdf8" }}>£{draftSquad?.totalSquadValue || 3.5}M</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24", fontSize: "0.8rem" }}>
            <Trophy size={16} />
            <span>Goal: Finish in the Top 3 to earn promotion to Division Two!</span>
          </div>

          <button
            onClick={handleFinish}
            disabled={!draftSquad || isLoadingDraft}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #00E5FF 0%, #0077FF 100%)",
              color: "#000",
              fontWeight: "900",
              fontSize: "0.95rem",
              cursor: draftSquad ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 10px 25px rgba(0, 229, 255, 0.3)",
            }}
          >
            <Check size={18} />
            <span>KICK OFF CAREER IN TIER 4</span>
          </button>
        </div>
      </div>
    </div>
  );
};
