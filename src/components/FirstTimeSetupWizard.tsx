// src/components/FirstTimeSetupWizard.tsx
import React, { useState, useEffect } from "react";
import {
  Shield,
  Sparkles,
  Trophy,
  Brain,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Dices,
  Zap,
  Sliders,
  Cpu,
} from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import { PromptQualityAnalyzer } from "./PromptQualityAnalyzer";
import type { TeamConfig, Formation, SquadPlayerConfig, LLMModelInfo } from "../types";

interface FirstTimeSetupWizardProps {
  isOpen: boolean;
  onComplete: (team: TeamConfig, managerName: string, managerStyle: string) => void;
  onCancel?: () => void;
}

const PRESET_CLUBS = [
  "Cairn Athletic FC",
  "Highland Rangers",
  "East End Wanderers",
  "Harbor City FC",
  "Pennine Celtic",
  "Southwark Rovers",
  "Avonmouth Albion",
  "Boroughbridge United",
];

const PRESET_COLORS = [
  { primary: "#0F6B45", secondary: "#085C3B", name: "Cairn Forest" },
  { primary: "#0F62FE", secondary: "#0043CE", name: "Carbon Cobalt" },
  { primary: "#DA1E28", secondary: "#A2191F", name: "Crimson Crown" },
  { primary: "#8A3FFC", secondary: "#6929C4", name: "Imperial Purple" },
  { primary: "#007D79", secondary: "#005D5D", name: "Teal Matrix" },
  { primary: "#F1C21B", secondary: "#B28600", name: "Sovereign Gold" },
];

const MANAGER_ARCHETYPES = [
  {
    id: "tactician",
    name: "The Tactician",
    desc: "Obsessed with positional shape, passing networks & spatial control.",
    bonus: "+15% Passing Stability for Methodical & Creative players",
    icon: Sliders,
    defaultPrompt: "Patient possession triangles, short passing from the back, control tempo and wait for vertical openings.",
  },
  {
    id: "gegenpresser",
    name: "The Gegenpresser",
    desc: "Demands relentless intensity, instant counter-pressing & vertical speed.",
    bonus: "+20% Ball Recovery Speed for Tenacious & Aggressive players",
    icon: Zap,
    defaultPrompt: "Relentless high pressing, suffocate opponent in their half, blitz vertical counter-attacks immediately on turnover.",
  },
  {
    id: "artist",
    name: "The Artist",
    desc: "Grants creative freedom, expressive 1v1 dribbling & aesthetic flair.",
    bonus: "+18% Dribble Success & Shot Creation for Flair & Creative players",
    icon: Sparkles,
    defaultPrompt: "High tempo flair, exploit 1v1 wing duels, give creative freedom in final third, shoot on sight.",
  },
  {
    id: "disciplinarian",
    name: "The Disciplinarian",
    desc: "Builds unbreakable defensive fortresses, ruthless tackling & grit.",
    bonus: "+22% Tackle Win Rate & Clean Sheet Probability",
    icon: Shield,
    defaultPrompt: "Compact low block, ferocious tackles, protect penalty box, lethal counter-attacks through lone striker.",
  },
];

export const FirstTimeSetupWizard: React.FC<FirstTimeSetupWizardProps> = ({
  isOpen,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Club Identity
  const [clubName, setClubName] = useState("Cairn Athletic FC");
  const [stadiumName, setStadiumName] = useState("Cairn Park Arena");
  const [primaryColor, setPrimaryColor] = useState("#0F6B45");
  const [secondaryColor, setSecondaryColor] = useState("#085C3B");

  // Step 2: Manager Profile
  const [managerName, setManagerName] = useState("Chris");
  const [managerArchetype, setManagerArchetype] = useState("gegenpresser");

  // Step 3: AI Engine & Coaching Prompt
  const [selectedFormation, setSelectedFormation] = useState<Formation>("4-3-3");
  const [tacticalPrompt, setTacticalPrompt] = useState(
    "Relentless high pressing, suffocate opponent in their half, blitz vertical counter-attacks immediately on turnover."
  );
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<string>("llama3.2:1b");
  const [availableModels, setAvailableModels] = useState<LLMModelInfo[]>([]);

  // Step 4: Grassroots Squad
  const [draftSquad, setDraftSquad] = useState<{ starting11: SquadPlayerConfig[]; benchSubs: SquadPlayerConfig[] } | null>(null);
  const [isLoadingSquad, setIsLoadingSquad] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check Ollama Local Models connection
      fetch("/api/llm/models")
        .then((r) => r.json())
        .then((data) => {
          if (data) {
            setIsOllamaConnected(!!data.connected);
            if (data.activeModel) setActiveModel(data.activeModel);
            if (data.models) setAvailableModels(data.models);
          }
        })
        .catch(() => setIsOllamaConnected(false));

      // Fetch initial draft squad
      setIsLoadingSquad(true);
      fetch(`/api/cm/draft?name=${encodeURIComponent(clubName)}&tier=tier_4`)
        .then((r) => r.json())
        .then((data) => {
          if (data.squad) {
            setDraftSquad(data.squad);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingSquad(false));
    }
  }, [isOpen]);

  const handleRandomizeClub = () => {
    const randomName = PRESET_CLUBS[Math.floor(Math.random() * PRESET_CLUBS.length)];
    setClubName(randomName);
    setStadiumName(`${randomName.replace(" FC", "").replace(" Athletic", "")} Arena`);
  };

  const handleSelectArchetype = (archId: string) => {
    setManagerArchetype(archId);
    const arch = MANAGER_ARCHETYPES.find((a) => a.id === archId);
    if (arch) {
      setTacticalPrompt(arch.defaultPrompt);
    }
  };

  const handleFinish = () => {
    const starters = draftSquad?.starting11 || [];
    const bench = draftSquad?.benchSubs || [];

    const compiledTeam: TeamConfig = {
      name: clubName.trim() || "Cairn Athletic FC",
      color: primaryColor,
      secondaryColor,
      formation: selectedFormation,
      prompt: tacticalPrompt,
      starting11: starters,
      benchSubs: bench,
      squadHarmony: 82,
      transferBudget: 1.5, // £1.5M grassroots budget
      totalSquadValue: 3.5,
    };

    // Register with server to generate accurate Tier 4 fixtures & standings
    fetch("/api/cm/register-user-club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: compiledTeam.name,
        color: compiledTeam.color,
        secondaryColor: compiledTeam.secondaryColor,
        tier: "tier_4",
      }),
    }).catch((e) => console.warn("Could not register club with server:", e));

    localStorage.setItem("afc_club_setup_done", "true");
    localStorage.setItem("afc_manager_name", managerName.trim() || "Chris");
    localStorage.setItem("afc_manager_archetype", managerArchetype);

    onComplete(compiledTeam, managerName.trim() || "Chris", managerArchetype);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22, 22, 22, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "16px",
      }}
    >
      <div
        className="carbon-card"
        style={{
          width: "100%",
          maxWidth: "880px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--cds-surface)",
          border: "1px solid var(--cds-border)",
          borderRadius: "4px",
          padding: "32px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Wizard Progress Steps Bar */}
        <div style={{ borderBottom: "1px solid var(--cds-border)", paddingBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  background: "var(--cds-green-primary)",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Trophy size={16} />
              </div>
              <span className="type-h3" style={{ fontSize: "16px", margin: 0 }}>
                Club Induction & Manager Onboarding
              </span>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)" }}>
              Step {step} of 4
            </span>
          </div>

          {/* Stepper Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {[
              { num: 1, label: "Club Identity" },
              { num: 2, label: "Manager Profile" },
              { num: 3, label: "AI Prompt Engine" },
              { num: 4, label: "Grassroots Squad" },
            ].map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div
                  key={s.num}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "2px",
                    background: isActive ? "#DEFBE6" : isPast ? "var(--cds-layer)" : "transparent",
                    border: `1px solid ${isActive ? "var(--cds-green-primary)" : "var(--cds-border)"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: isActive ? "var(--cds-green-primary)" : isPast ? "#10b981" : "var(--cds-border)",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isPast ? "✓" : s.num}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "var(--cds-green-primary)" : "var(--cds-text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Club Identity & Strip */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2 className="type-h2" style={{ margin: "0 0 6px 0" }}>Craft Your Football Club</h2>
              <p style={{ color: "var(--cds-text-secondary)", fontSize: "14px", margin: 0 }}>
                Every manager begins at the bottom of the English football pyramid in the National League (Tier 4). Establish your club identity, kit colors, and home stadium.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
              {/* Form inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                    Club Name
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="carbon-input"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="e.g. Cairn Athletic FC"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleRandomizeClub}
                      className="btn btn-secondary"
                      style={{ padding: "0 12px", fontSize: "12px", gap: "4px" }}
                    >
                      <Dices size={15} />
                      <span>Random</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                    Home Stadium
                  </label>
                  <input
                    type="text"
                    className="carbon-input"
                    value={stadiumName}
                    onChange={(e) => setStadiumName(e.target.value)}
                    placeholder="e.g. Cairn Park Arena"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "8px" }}>
                    Kit Color Palettes (Primary & Secondary)
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {PRESET_COLORS.map((c) => {
                      const isSelected = primaryColor === c.primary;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setPrimaryColor(c.primary);
                            setSecondaryColor(c.secondary);
                          }}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "4px",
                            border: isSelected ? "2px solid var(--cds-text-primary)" : "1px solid var(--cds-border)",
                            background: `linear-gradient(135deg, ${c.primary} 50%, ${c.secondary} 50%)`,
                            cursor: "pointer",
                            boxShadow: isSelected ? "0 0 0 2px var(--cds-green-primary)" : "none",
                          }}
                          title={c.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div
                style={{
                  background: "var(--cds-layer)",
                  border: "1px solid var(--cds-border)",
                  borderRadius: "4px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "72px",
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    clipPath: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontWeight: "900",
                    fontSize: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  {clubName.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                    {clubName || "Cairn Athletic FC"}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
                    {stadiumName || "Cairn Park Arena"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "2px",
                    background: "#DEFBE6",
                    color: "var(--cds-green-primary)",
                    border: "1px solid #A7F0BA",
                  }}
                >
                  National League (Tier 4) • £1.5M Budget
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Manager Profile & Archetype */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2 className="type-h2" style={{ margin: "0 0 6px 0" }}>Manager Profile & Philosophy</h2>
              <p style={{ color: "var(--cds-text-secondary)", fontSize: "14px", margin: 0 }}>
                Choose your coaching archetype. Your management philosophy resonates with specific player personality traits and provides distinct matchday bonuses.
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                Manager Name
              </label>
              <input
                type="text"
                className="carbon-input"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Chris Manager"
                style={{ maxWidth: "340px" }}
              />
            </div>

            {/* Archetypes Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {MANAGER_ARCHETYPES.map((arch) => {
                const Icon = arch.icon;
                const isSelected = managerArchetype === arch.id;
                return (
                  <div
                    key={arch.id}
                    onClick={() => handleSelectArchetype(arch.id)}
                    style={{
                      padding: "16px",
                      borderRadius: "4px",
                      background: isSelected ? "#DEFBE6" : "var(--cds-surface)",
                      border: `1px solid ${isSelected ? "var(--cds-green-primary)" : "var(--cds-border)"}`,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icon size={18} color={isSelected ? "var(--cds-green-primary)" : "var(--cds-text-secondary)"} />
                        <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--cds-text-primary)" }}>
                          {arch.name}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 size={16} color="var(--cds-green-primary)" />}
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: 1.4 }}>
                      {arch.desc}
                    </p>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-green-primary)", background: "rgba(15, 107, 69, 0.08)", padding: "2px 6px", borderRadius: "2px", alignSelf: "flex-start" }}>
                      {arch.bonus}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: AI Prompt Coaching Mandate (Core Brief) */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2 className="type-h2" style={{ margin: "0 0 6px 0" }}>The AI Prompt Coaching Mandate</h2>
              <p style={{ color: "var(--cds-text-secondary)", fontSize: "14px", margin: 0 }}>
                This is not a traditional slider-based manager. In CAIRN FC, <strong>players think for themselves using AI</strong>. Your plain English coaching instructions directly govern autonomous decision-making and accelerate superstar development.
              </p>
            </div>

            {/* Explainer 3-Pillar Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <div style={{ padding: "14px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--cds-green-primary)", fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}>
                  <Brain size={16} />
                  <span>1. Autonomous Agents</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: 1.4 }}>
                  Every player has cognitive traits (Creative, Methodical, Flair, Aggressive, Tenacious, Leader, Sensitive) and evaluates the pitch dynamically.
                </p>
              </div>

              <div style={{ padding: "14px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--cds-blue)", fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}>
                  <Sparkles size={16} />
                  <span>2. Prompt Resonance</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: 1.4 }}>
                  Thoughtful, specific tactical prompts resonate with your squad. Better prompts provide higher execution accuracy on the pitch.
                </p>
              </div>

              <div style={{ padding: "14px", borderRadius: "4px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#8A3FFC", fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}>
                  <Trophy size={16} />
                  <span>3. Superstar Evolution</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: 1.4 }}>
                  Grassroots players earn Development XP and Tactical Mastery. Prompt engineering turns raw prospects into world-class superstars.
                </p>
              </div>
            </div>

            {/* Ollama Local Engine Status & Setup Guidance */}
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "4px",
                background: isOllamaConnected ? "rgba(15, 107, 69, 0.08)" : "var(--cds-layer)",
                border: `1px solid ${isOllamaConnected ? "#A7F0BA" : "var(--cds-border)"}`,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Cpu size={16} color={isOllamaConnected ? "var(--cds-green-primary)" : "var(--cds-blue)"} />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                    {isOllamaConnected ? `Local Ollama Active (${availableModels.length} Models Detected)` : "Local AI Engine: Standalone Cognitive Mode"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "2px",
                    background: isOllamaConnected ? "#DEFBE6" : "#FEF7E0",
                    color: isOllamaConnected ? "var(--cds-green-primary)" : "#8E6A00",
                    border: `1px solid ${isOllamaConnected ? "#A7F0BA" : "#F1C21B"}`,
                  }}
                >
                  {isOllamaConnected ? `Model: ${activeModel}` : "Ollama Standalone"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: 1.4 }}>
                {isOllamaConnected
                  ? "Local Ollama LLM is running on localhost:11434. Matchday agent cognition, press conferences, and touchline dialogue run privately on your device."
                  : "Optional: Run 'ollama run llama3.2' in your terminal for real-time local neural inferences, or continue with built-in heuristic agent cognition."}
              </p>
            </div>

            {/* Formation & Initial Philosophy */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                Starting Formation
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["4-3-3", "4-4-2", "3-5-2", "5-3-2"] as Formation[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSelectedFormation(f)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "4px",
                      border: selectedFormation === f ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                      background: selectedFormation === f ? "var(--cds-green-primary)" : "var(--cds-surface)",
                      color: selectedFormation === f ? "#FFFFFF" : "var(--cds-text-primary)",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                Initial Team Philosophy (Coaching Directive)
              </label>
              <textarea
                rows={3}
                value={tacticalPrompt}
                onChange={(e) => setTacticalPrompt(e.target.value)}
                className="carbon-input"
                style={{ width: "100%", lineHeight: 1.5, resize: "vertical", marginBottom: "10px" }}
              />
              {/* Live Real-Time Prompt Quality Scoring */}
              <PromptQualityAnalyzer promptText={tacticalPrompt} compact={false} />
            </div>
          </div>
        )}

        {/* STEP 4: Grassroots 14-Player Squad Reveal */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 className="type-h2" style={{ margin: "0 0 6px 0" }}>Your Grassroots Roster (14 Players)</h2>
                <p style={{ color: "var(--cds-text-secondary)", fontSize: "14px", margin: 0 }}>
                  Here is your official National League matchday squad: 11 Starters + 3 Bench Substitutes. Your journey to the Premier Championship starts now.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-secondary)", textTransform: "uppercase" }}>
                  Starting Budget
                </span>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--cds-green-primary)" }}>
                  £1.50M
                </div>
              </div>
            </div>

            {/* Squad Table Preview */}
            <div style={{ maxHeight: "320px", overflowY: "auto", border: "1px solid var(--cds-border)", borderRadius: "4px" }}>
              {isLoadingSquad ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--cds-text-secondary)" }}>
                  Drafting grassroots players from scouting database...
                </div>
              ) : (
                <table className="carbon-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "36px" }}>#</th>
                      <th>Player</th>
                      <th>Status</th>
                      <th>Role</th>
                      <th>OVR</th>
                      <th>Trait</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(draftSquad?.starting11 || []).concat(draftSquad?.benchSubs || []).map((p, i) => {
                      const isBench = i >= 11;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: "700", color: "var(--cds-text-secondary)" }}>{i + 1}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <PlayerAvatar name={p.name} size="xs" teamColor={primaryColor} traitIcon={p.personalityIcon} />
                              <span style={{ fontWeight: "600" }}>{p.name}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: "700",
                                padding: "2px 6px",
                                borderRadius: "2px",
                                background: isBench ? "var(--cds-layer)" : "#DEFBE6",
                                color: isBench ? "var(--cds-text-secondary)" : "var(--cds-green-primary)",
                                border: `1px solid ${isBench ? "var(--cds-border)" : "#A7F0BA"}`,
                              }}
                            >
                              {isBench ? "BENCH" : "STARTER"}
                            </span>
                          </td>
                          <td style={{ fontWeight: "600" }}>{p.role}</td>
                          <td style={{ fontWeight: "700", color: "var(--cds-green-primary)" }}>
                            {Math.round((p.rating || 5.8) * 10)}
                          </td>
                          <td style={{ fontSize: "12px", color: "#6929C4", fontWeight: "600" }}>
                            {p.personalityIcon || "🛡️"} {p.personalityTrait || "Methodical"}
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                            £{(p.transferValue || 0.25).toFixed(2)}M
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--cds-border)", paddingTop: "16px" }}>
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="btn btn-secondary"
                style={{ gap: "6px", fontSize: "13px" }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-ghost"
                style={{ fontSize: "13px" }}
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="btn btn-primary"
                style={{ gap: "6px", fontSize: "13px" }}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="btn btn-primary"
                style={{ gap: "8px", fontSize: "14px", fontWeight: "700", padding: "0 22px" }}
              >
                <CheckCircle2 size={16} />
                <span>Sign Contract & Enter Manager's Office →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
