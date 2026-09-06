// src/components/PromptMasterclassModal.tsx
import React, { useState } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Zap,
  Brain,
  Shield,
  Target,
  Sliders,
  Award,
  FlaskConical,
  CheckCircle2,
  Copy,
  Cpu,
} from "lucide-react";
import type { PlayerState } from "../types";

interface PromptMasterclassModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel?: string;
  players?: PlayerState[];
  onApplyTacticsPrompt?: (prompt: string) => void;
}

export const PromptMasterclassModal: React.FC<PromptMasterclassModalProps> = ({
  isOpen,
  onClose,
  activeModel = "llama3.2:1b",
  players = [],
  onApplyTacticsPrompt,
}) => {
  const fallbackPlayers: any[] = [
    { id: "p1", name: "Archie Vance", number: 9, role: "ST", rating: 7.8, stamina: 92, personalityTrait: "Hunter", personalityIcon: "🎯", team: "home" },
    { id: "p2", name: "Liam Sterling", number: 10, role: "CAM", rating: 8.1, stamina: 88, personalityTrait: "Creative", personalityIcon: "🧠", team: "home" },
    { id: "p3", name: "Marcus Bradley", number: 8, role: "CM", rating: 7.5, stamina: 95, personalityTrait: "Tenacious", personalityIcon: "🛡️", team: "home" },
    { id: "p4", name: "Kofi Boateng", number: 4, role: "CB", rating: 7.9, stamina: 90, personalityTrait: "Stopper", personalityIcon: "🧱", team: "home" },
  ];
  const activeSquadPlayers = players && players.length > 0 ? players : fallbackPlayers;

  const [activeTab, setActiveTab] = useState<"pillars" | "optimizer" | "sandbox" | "achievements">("pillars");
  const [selectedPillar, setSelectedPillar] = useState<number>(0);

  // 1-Click Prompt Optimizer State
  const [rawPromptInput, setRawPromptInput] = useState<string>("press them hard and shoot whenever you can");
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizedResult, setOptimizedResult] = useState<{
    originalPrompt: string;
    optimizedPrompt: string;
    techniqueApplied: string;
    reasoningExplanation: string;
    expectedResonanceBoost: string;
    latencyMs?: number;
  } | null>(null);

  // Sandbox A/B Test State
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(activeSquadPlayers[0]?.id || "p1");
  const [promptA, setPromptA] = useState<string>("Run forward fast and shoot from distance!");
  const [promptB, setPromptB] = useState<string>("When penetrating the attacking third, isolate the center-back 1v1 and pull the trigger on sight within 20 yards. Do NOT force low-probability shots when the winger is unmarked.");
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [abResult, setAbResult] = useState<any | null>(null);
  const [copiedPillText, setCopiedPillText] = useState<string | null>(null);

  if (!isOpen) return null;

  const PILLARS = [
    {
      id: 0,
      title: "1. Persona & Role Conditioning",
      icon: <Brain size={16} color="var(--cds-green-primary)" />,
      badge: "System Prompt",
      summary: "How player personality traits act as foundational system prompts and behavioral priors.",
      concept: "In LLMs, a system prompt sets the character persona, cognitive guardrails, and decision weights. In CAIRN FC, every player's personality trait (e.g. 'Creative', 'Aggressive', 'Methodical', 'Flair', 'Leader') operates as a permanent system prompt conditioning how they interpret your touchline shouts.",
      exampleBad: 'Manager: "Attack now!" (Vague command, player interprets randomly)',
      exampleGood: 'Manager: "As our Creative Playmaker, drop between the lines and thread the through-ball to our pacey striker."',
      mechanic: "High persona alignment grants +15% to +20% Trait Resonance and elevates in-game match ratings.",
    },
    {
      id: 1,
      title: "2. Zero-Shot vs. Few-Shot Prompting",
      icon: <Target size={16} color="var(--cds-blue)" />,
      badge: "In-Context Learning",
      summary: "Providing concrete tactical examples directly inside the prompt to guide action selection.",
      concept: "Zero-shot prompting gives instructions without examples. Few-shot prompting provides 1–2 concrete scenarios (e.g. 'e.g. If fullback overlaps, slip the ball down the wing; if closed down, turn inside and shoot'). Few-shot prompting eliminates stochastic hallucinations and ensures clean execution.",
      exampleBad: 'Manager: "Win the ball and pass forward."',
      exampleGood: 'Manager: "When pressing in midfield, double-team their pivot. Example: if #6 receives with back to goal, tackle immediately and release our right winger into space."',
      mechanic: "Few-shot tactical directives boost transition pass completion by +24%.",
    },
    {
      id: 2,
      title: "3. Chain-of-Thought (CoT) Reasoning",
      icon: <Sparkles size={16} color="#8A3FFC" />,
      badge: "<think> Token Traces",
      summary: "Guiding players through step-by-step cognitive evaluation before committing to an action.",
      concept: "Reasoning models (like DeepSeek-R1 and structured Llama 3.2 agents) generate internal thought tokens (`<think>` reasoning traces) before answering. By prompting with step-by-step reasoning triggers, players evaluate pitch spatial geometry before executing risky passes or tackles.",
      exampleBad: 'Manager: "Clear the ball!" (Triggers blind clearances)',
      exampleGood: 'Manager: "Step 1: Scan for overlapping fullback. Step 2: If marked, recycle possession back to defensive pivot. Step 3: Switch play to opposite wing."',
      mechanic: "Unlocks the Agent Inner-Monologue trace in the match HUD and prevents turnover panic.",
    },
    {
      id: 3,
      title: "4. Negative Constraints & Guardrails",
      icon: <Shield size={16} color="var(--cds-red)" />,
      badge: "Safety Boundaries",
      summary: "Setting explicit operational boundaries to prevent unwanted behaviors and fouls.",
      concept: "Without negative constraints, AI agents may over-optimize on aggression or shot greed. Adding negative guardrails (e.g. 'Do NOT commit fouls inside 25 yards; do NOT take low-probability shots when a teammate is open') keeps aggression high while preventing yellow cards and wasted possession.",
      exampleBad: 'Manager: "Tackle as hard as possible!" (High yellow/red card risk)',
      exampleGood: 'Manager: "Suffocate their midfield with aggressive pressing. Do NOT slide tackle inside our defensive third; stay on feet and force backward passes."',
      mechanic: "Reduces foul frequency by 65% while maintaining a 95% press success rate.",
    },
    {
      id: 4,
      title: "5. Temperature & Sampling Dynamics",
      icon: <Sliders size={16} color="#FF832B" />,
      badge: "Stochasticity Control",
      summary: "Balancing strict tactical discipline (Low Temp) with spontaneous creative brilliance (High Temp).",
      concept: "In neural language models, Temperature controls randomness. Low Temperature (0.2) produces deterministic, highly disciplined play (ideal for defensive low blocks and penalty shootouts). High Temperature (0.85) produces creative flair, audacious trick shots, and unpredictable dribbles.",
      exampleBad: 'Treating all players with identical rigid commands.',
      exampleGood: 'Setting Low Temp (0.2) on Center Backs for 100% positional discipline, and High Temp (0.8) on Wingers/Strikers for unexpected 1v1 flair.',
      mechanic: "Tuned automatically per position in the Tactics Compiler to maximize team harmony.",
    },
    {
      id: 5,
      title: "6. Context Density & Token Latency",
      icon: <Cpu size={16} color="var(--cds-green-primary)" />,
      badge: "Performance & Speed",
      summary: "Maximizing information density per token to achieve ultra-fast ~120ms local inference.",
      concept: "Local on-device inference (Ollama running on CPU/GPU) processes tokens in real time. Verbose filler words slow down matchday reactions. High-density, structured prompt keywords (e.g. 'Zonal Trigger: Middle Third -> 1-touch vertical -> Shoot') execute in under 140ms.",
      exampleBad: 'Manager: "Hey guys I really want you to please try to pass the ball around if possible..." (Slow, low signal)',
      exampleGood: 'Manager: "Transition Trigger: Middle Third -> One-touch vertical -> Shoot on sight <20y."',
      mechanic: "Reduces Ollama token evaluation latency from 400ms down to 120ms.",
    },
  ];

  const handleRunOptimizer = async () => {
    if (!rawPromptInput.trim()) return;
    setIsOptimizing(true);
    try {
      const res = await fetch("/api/llm/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: rawPromptInput }),
      });
      const data = await res.json();
      setOptimizedResult(data);
    } catch (err) {
      console.error("Optimizer error:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRunABComparison = async () => {
    const targetPlayer = activeSquadPlayers.find((p) => p.id === selectedPlayerId) || activeSquadPlayers[0];
    if (!targetPlayer) return;
    setIsComparing(true);
    try {
      const res = await fetch("/api/llm/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: targetPlayer,
          promptA,
          promptB,
          gameState: null,
        }),
      });
      const data = await res.json();
      setAbResult(data);
    } catch (err) {
      console.error("AB test error:", err);
    } finally {
      setIsComparing(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPillText(text);
    setTimeout(() => setCopiedPillText(null), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        className="carbon-card"
        style={{
          width: "100%",
          maxWidth: "940px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "6px",
          backgroundColor: "var(--cds-surface)",
          border: "1px solid var(--cds-border)",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.28)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--cds-border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--cds-layer)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "4px",
                background: "var(--cds-green-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--cds-green-primary)",
              }}
            >
              <BookOpen size={18} color="var(--cds-green-primary)" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                AI Prompt Engineering Masterclass & Playbook
              </div>
              <div style={{ fontSize: "11px", color: "var(--cds-text-secondary)" }}>
                Mastering LLM agent persona conditioning, few-shot prompting, and reasoning traces in football management
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                background: "var(--cds-layer-hover)",
                padding: "3px 8px",
                borderRadius: "3px",
                border: "1px solid var(--cds-border)",
                color: "var(--cds-green-primary)",
                fontWeight: "700",
              }}
            >
              🦙 {activeModel}
            </span>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: "4px 8px", height: "28px" }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--cds-border-subtle)",
            background: "var(--cds-layer)",
            padding: "0 16px",
          }}
        >
          <button
            onClick={() => setActiveTab("pillars")}
            style={{
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: "700",
              borderBottom: activeTab === "pillars" ? "2px solid var(--cds-green-primary)" : "2px solid transparent",
              color: activeTab === "pillars" ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <BookOpen size={14} />
            <span>The 6 Pillars</span>
          </button>

          <button
            onClick={() => setActiveTab("optimizer")}
            style={{
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: "700",
              borderBottom: activeTab === "optimizer" ? "2px solid var(--cds-green-primary)" : "2px solid transparent",
              color: activeTab === "optimizer" ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={14} />
            <span>1-Click Prompt Optimizer</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            style={{
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: "700",
              borderBottom: activeTab === "sandbox" ? "2px solid var(--cds-green-primary)" : "2px solid transparent",
              color: activeTab === "sandbox" ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FlaskConical size={14} />
            <span>Prompt A/B Lab</span>
          </button>

          <button
            onClick={() => setActiveTab("achievements")}
            style={{
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: "700",
              borderBottom: activeTab === "achievements" ? "2px solid var(--cds-green-primary)" : "2px solid transparent",
              color: activeTab === "achievements" ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Award size={14} />
            <span>Skill Badges</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1 }}>
          {/* TAB 1: THE 6 PILLARS */}
          {activeTab === "pillars" && (
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "16px" }}>
              {/* Left Pillar Selector List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {PILLARS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPillar(p.id)}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: "4px",
                      border: `1px solid ${selectedPillar === p.id ? "var(--cds-green-primary)" : "var(--cds-border)"}`,
                      background: selectedPillar === p.id ? "var(--cds-layer-selected)" : "var(--cds-layer)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "12px", color: "var(--cds-text-primary)" }}>
                      {p.icon}
                      <span>{p.title}</span>
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--cds-text-muted)" }}>{p.badge}</span>
                  </button>
                ))}
              </div>

              {/* Right Pillar Detail Card */}
              {PILLARS[selectedPillar] && (
                <div
                  style={{
                    background: "var(--cds-layer)",
                    border: "1px solid var(--cds-border)",
                    borderRadius: "4px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {PILLARS[selectedPillar].icon}
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                        {PILLARS[selectedPillar].title}
                      </span>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: "10px" }}>
                      {PILLARS[selectedPillar].badge}
                    </span>
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: "1.5", margin: 0 }}>
                    {PILLARS[selectedPillar].concept}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {/* Vague Example */}
                    <div
                      style={{
                        padding: "10px",
                        background: "rgba(218, 30, 40, 0.06)",
                        border: "1px solid #FFD7D9",
                        borderRadius: "4px",
                        fontSize: "11px",
                      }}
                    >
                      <div style={{ fontWeight: "700", color: "var(--cds-red)", marginBottom: "4px" }}>
                        ❌ Vague / Low-Yield Prompt
                      </div>
                      <div style={{ color: "var(--cds-text-secondary)", fontStyle: "italic" }}>
                        {PILLARS[selectedPillar].exampleBad}
                      </div>
                    </div>

                    {/* Elite Example */}
                    <div
                      style={{
                        padding: "10px",
                        background: "rgba(15, 107, 69, 0.06)",
                        border: "1px solid #A7F0BA",
                        borderRadius: "4px",
                        fontSize: "11px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "700", color: "var(--cds-green-primary)" }}>
                          ✓ Structured Elite Prompt
                        </span>
                        <button
                          onClick={() => handleCopyPrompt(PILLARS[selectedPillar].exampleGood)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--cds-green-primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            fontSize: "10px",
                          }}
                        >
                          <Copy size={11} />
                          <span>{copiedPillText === PILLARS[selectedPillar].exampleGood ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                      <div style={{ color: "var(--cds-text-primary)", fontWeight: "600" }}>
                        {PILLARS[selectedPillar].exampleGood}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--cds-surface)",
                      border: "1px solid var(--cds-border)",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      color: "var(--cds-text-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Zap size={13} color="var(--cds-green-primary)" />
                    <span><strong>Engine Impact:</strong> {PILLARS[selectedPillar].mechanic}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 1-CLICK PROMPT OPTIMIZER */}
          {activeTab === "optimizer" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
                Type a casual tactical idea. The AI Prompt Optimizer compiler decomposes it, injects zonal triggers, and applies negative constraints to guarantee high adherence on local models.
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={rawPromptInput}
                  onChange={(e) => setRawPromptInput(e.target.value)}
                  placeholder="Enter a casual tactical instruction..."
                  className="carbon-input"
                  style={{ flex: 1, height: "36px", fontSize: "12px", padding: "6px 12px" }}
                />
                <button
                  onClick={handleRunOptimizer}
                  disabled={isOptimizing || !rawPromptInput.trim()}
                  className="btn btn-primary"
                  style={{ height: "36px", padding: "0 16px", fontSize: "12px", fontWeight: "700", gap: "6px" }}
                >
                  <Sparkles size={14} />
                  <span>{isOptimizing ? "Compiling..." : "⚡ Optimize Prompt"}</span>
                </button>
              </div>

              {optimizedResult && (
                <div
                  style={{
                    background: "var(--cds-layer)",
                    border: "1px solid var(--cds-border)",
                    borderRadius: "4px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                      Optimized Prompt Engineering Output
                    </span>
                    <span className="badge badge-success" style={{ fontSize: "11px" }}>
                      {optimizedResult.techniqueApplied}
                    </span>
                  </div>

                  <div
                    style={{
                      background: "rgba(15, 107, 69, 0.08)",
                      border: "1px solid #A7F0BA",
                      borderRadius: "4px",
                      padding: "12px",
                      fontSize: "12px",
                      color: "var(--cds-text-primary)",
                      fontWeight: "600",
                      lineHeight: "1.5",
                    }}
                  >
                    "{optimizedResult.optimizedPrompt}"
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", fontSize: "11px" }}>
                    <span style={{ color: "var(--cds-text-secondary)" }}>
                      💡 {optimizedResult.reasoningExplanation}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleCopyPrompt(optimizedResult.optimizedPrompt)}
                        className="btn btn-secondary"
                        style={{ height: "28px", padding: "0 10px", fontSize: "11px", gap: "4px" }}
                      >
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>
                      {onApplyTacticsPrompt && (
                        <button
                          onClick={() => {
                            onApplyTacticsPrompt(optimizedResult.optimizedPrompt);
                            onClose();
                          }}
                          className="btn btn-primary"
                          style={{ height: "28px", padding: "0 12px", fontSize: "11px", fontWeight: "700", gap: "4px" }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Apply to Active Squad</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROMPT A/B TESTING LAB */}
          {activeTab === "sandbox" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
                  Compare two prompt formulations on a squad player to observe real-time latency, reasoning traces, and behavioral weight differences.
                </span>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="carbon-input"
                  style={{ height: "30px", fontSize: "11px", padding: "2px 8px" }}
                >
                  {activeSquadPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name} ({p.role}) - {p.personalityTrait || "Methodical"}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {/* Prompt A */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                    Formulation A (Baseline)
                  </span>
                  <textarea
                    value={promptA}
                    onChange={(e) => setPromptA(e.target.value)}
                    rows={3}
                    className="carbon-input"
                    style={{ width: "100%", fontSize: "11px", padding: "6px 8px", resize: "vertical" }}
                  />
                </div>

                {/* Prompt B */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                    Formulation B (Structured / CoT)
                  </span>
                  <textarea
                    value={promptB}
                    onChange={(e) => setPromptB(e.target.value)}
                    rows={3}
                    className="carbon-input"
                    style={{ width: "100%", fontSize: "11px", padding: "6px 8px", resize: "vertical" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={handleRunABComparison}
                  disabled={isComparing}
                  className="btn btn-primary"
                  style={{ padding: "8px 24px", fontSize: "12px", fontWeight: "700", gap: "6px" }}
                >
                  <FlaskConical size={14} />
                  <span>{isComparing ? "Running Dual Model Inferences..." : "Run Side-by-Side Comparison"}</span>
                </button>
              </div>

              {abResult && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* Result A */}
                  <div style={{ background: "var(--cds-layer)", border: "1px solid var(--cds-border)", borderRadius: "4px", padding: "12px", fontSize: "11px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "700", color: "var(--cds-text-primary)" }}>Result A</span>
                      <span style={{ color: "var(--cds-text-muted)" }}>{abResult.promptA.latencyMs}ms</span>
                    </div>
                    <p style={{ fontStyle: "italic", margin: "4px 0" }}>"{abResult.promptA.response}"</p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px", fontSize: "10px", color: "var(--cds-text-secondary)" }}>
                      <span>Press: {Math.round(abResult.promptA.weights.pressBias * 100)}%</span>
                      <span>Shot: {Math.round(abResult.promptA.weights.shotBias * 100)}%</span>
                      <span>Pass: {Math.round(abResult.promptA.weights.passBias * 100)}%</span>
                    </div>
                  </div>

                  {/* Result B */}
                  <div style={{ background: "var(--cds-layer)", border: "1px solid var(--cds-green-primary)", borderRadius: "4px", padding: "12px", fontSize: "11px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "700", color: "var(--cds-green-primary)" }}>Result B (Enhanced)</span>
                      <span style={{ color: "var(--cds-green-primary)", fontWeight: "700" }}>{abResult.promptB.latencyMs}ms</span>
                    </div>
                    <p style={{ fontStyle: "italic", margin: "4px 0", color: "var(--cds-text-primary)", fontWeight: "600" }}>"{abResult.promptB.response}"</p>
                    {abResult.promptB.reasoningTrace && (
                      <div style={{ marginTop: "4px", padding: "4px", background: "rgba(15,107,69,0.06)", borderRadius: "3px", fontSize: "10px", color: "var(--cds-text-secondary)" }}>
                        🧠 {abResult.promptB.reasoningTrace}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px", fontSize: "10px", color: "var(--cds-text-secondary)" }}>
                      <span>Press: {Math.round(abResult.promptB.weights.pressBias * 100)}%</span>
                      <span>Shot: {Math.round(abResult.promptB.weights.shotBias * 100)}%</span>
                      <span>Pass: {Math.round(abResult.promptB.weights.passBias * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACHIEVEMENTS */}
          {activeTab === "achievements" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {[
                { title: "Persona Architect", desc: "Successfully condition a player's mental model using persona role-prompting.", icon: "🧠", unlocked: true },
                { title: "Chain-of-Thought Tactician", desc: "Issue a multi-step conditional prompt that directly triggers a goal.", icon: "⚡", unlocked: true },
                { title: "Guardrail Specialist", desc: "Apply negative constraints to keep a clean sheet with 0 yellow cards.", icon: "🛡️", unlocked: true },
                { title: "Prompt Lab Scientist", desc: "Run a dual prompt A/B test in the laboratory sandbox.", icon: "🔬", unlocked: true },
                { title: "Master Prompt Engineer", desc: "Score 95+ Tactical Mastery grade on the Prompt Quality Analyzer.", icon: "🏆", unlocked: true },
                { title: "Zero-Latency Tactician", desc: "Execute a high-density directive with under 150ms Ollama generation time.", icon: "⏱️", unlocked: true },
              ].map((ach, idx) => (
                <div
                  key={idx}
                  style={{
                    background: ach.unlocked ? "rgba(15, 107, 69, 0.06)" : "var(--cds-layer)",
                    border: `1px solid ${ach.unlocked ? "#A7F0BA" : "var(--cds-border)"}`,
                    borderRadius: "4px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div style={{ fontSize: "22px" }}>{ach.icon}</div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: ach.unlocked ? "var(--cds-green-primary)" : "var(--cds-text-primary)" }}>
                      {ach.title}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--cds-text-secondary)", marginTop: "2px" }}>
                      {ach.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
