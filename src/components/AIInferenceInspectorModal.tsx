// src/components/AIInferenceInspectorModal.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Brain,
  Activity,
  Zap,
  TrendingUp,
  Terminal,
  RefreshCw,
} from "lucide-react";
import type { TeamConfig, LLMModelInfo, LLMTelemetryEntry, TraitResonanceAnalysis } from "../types";

interface AIInferenceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamConfig: TeamConfig;
  activeModel: string;
  onSelectModel: (modelName: string) => void;
}

export const AIInferenceInspectorModal: React.FC<AIInferenceInspectorModalProps> = ({
  isOpen,
  onClose,
  teamConfig,
  activeModel,
  onSelectModel,
}) => {
  const [activeTab, setActiveTab] = useState<"stream" | "traits" | "evolution">("stream");
  const [models, setModels] = useState<LLMModelInfo[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [telemetryLogs, setTelemetryLogs] = useState<LLMTelemetryEntry[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState(teamConfig.prompt || "Relentless counter-press, quick vertical transitions, wingers overlap, striker shoot on sight");
  const [resonanceAnalysis, setResonanceAnalysis] = useState<TraitResonanceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLLMData = async () => {
    setIsLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([
        fetch("/api/llm/models"),
        fetch("/api/llm/telemetry"),
      ]);
      if (mRes.ok) {
        const mData = await mRes.json();
        setModels(mData.models || []);
        setIsConnected(mData.connected);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        setTelemetryLogs(tData.logs || []);
        if (tData.logs && tData.logs.length > 0 && !selectedLogId) {
          setSelectedLogId(tData.logs[0].id);
        }
      }
    } catch (err) {
      console.warn("Could not fetch LLM data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePromptResonance = async (promptText: string) => {
    setIsAnalyzing(true);
    try {
      const squadToAnalyze = [...(teamConfig.starting11 || []), ...(teamConfig.benchSubs || [])];
      const res = await fetch("/api/ai/analyze-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, squad: squadToAnalyze }),
      });
      if (res.ok) {
        const data = await res.json();
        setResonanceAnalysis(data);
      }
    } catch (e) {
      console.warn("Prompt resonance error:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLLMData();
      analyzePromptResonance(testPrompt);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeTelemetry = telemetryLogs.find((l) => l.id === selectedLogId) || telemetryLogs[0];
  const allSquad = [...(teamConfig.starting11 || []), ...(teamConfig.benchSubs || [])];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "16px",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "980px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 26, 0.99) 100%)",
          border: "1px solid rgba(0, 229, 255, 0.3)",
          borderRadius: "18px",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Header & Local Model Selector */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  background: isConnected ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                  color: isConnected ? "#10b981" : "#fbbf24",
                  border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                }}
              >
                {isConnected ? "Local Ollama: Connected" : "Local Standalone Cognitive Mode"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>100% Desktop Offline Execution</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Brain size={24} color="#00E5FF" />
              <span>AI Neural Cognition & Inference Hub</span>
            </h2>
            <p style={{ margin: "2px 0 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
              Surface real-time prompt inferencing, personality trait resonance, and player self-evolution curves.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Model Selector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Active Model</span>
              <select
                value={activeModel}
                onChange={(e) => onSelectModel(e.target.value)}
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(0, 229, 255, 0.4)",
                  borderRadius: "6px",
                  color: "#00E5FF",
                  padding: "4px 8px",
                  fontSize: "0.82rem",
                  fontWeight: "800",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="heuristic-fast">⚡ Heuristic Neural Engine (Built-in)</option>
                {models.map((m) => (
                  <option key={m.name} value={m.name}>
                    🦙 {m.name} ({m.parameterSize})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "10px" }}>
          <button
            onClick={() => setActiveTab("stream")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: "800",
              cursor: "pointer",
              background: activeTab === "stream" ? "#00E5FF" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "stream" ? "#000" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Activity size={16} />
            <span>Live Inference Stream ({telemetryLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("traits")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: "800",
              cursor: "pointer",
              background: activeTab === "traits" ? "#00E5FF" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "traits" ? "#000" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Zap size={16} />
            <span>Squad Trait Resonance Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("evolution")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: "800",
              cursor: "pointer",
              background: activeTab === "evolution" ? "#00E5FF" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "evolution" ? "#000" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <TrendingUp size={16} />
            <span>Player Evolution & Learning Curves</span>
          </button>
        </div>

        {/* TAB 1: LIVE INFERENCE STREAM */}
        {activeTab === "stream" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px" }}>
            {/* Telemetry Log List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                  Recent Inferences
                </span>
                <button
                  onClick={fetchLLMData}
                  disabled={isLoading}
                  style={{ background: "transparent", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <RefreshCw size={12} />
                  <span>Refresh</span>
                </button>
              </div>

              <div style={{ maxHeight: "420px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", paddingRight: "4px" }}>
                {telemetryLogs.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    No prompt inferences logged yet. Shout touchline instructions or issue Assistant Manager directives during matchday!
                  </div>
                ) : (
                  telemetryLogs.map((log) => {
                    const isSelected = (selectedLogId || telemetryLogs[0]?.id) === log.id;
                    return (
                      <div
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: `1px solid ${isSelected ? "#00E5FF" : "rgba(255, 255, 255, 0.06)"}`,
                          background: isSelected ? "rgba(0, 229, 255, 0.12)" : "rgba(255, 255, 255, 0.02)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: "800", color: isSelected ? "#00E5FF" : "#fff" }}>
                            {log.targetName || log.type}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {log.latencyMs}ms
                          </span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          &quot;{log.userPrompt}&quot;
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Detailed Inspection Dossier */}
            {activeTelemetry ? (
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Terminal size={16} color="#00E5FF" />
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#fff" }}>
                      Inference Telemetry Details
                    </span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: "700" }}>
                    {activeTelemetry.model} • {activeTelemetry.tokenCount || 40} tokens
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>
                    User Prompt / Directive
                  </div>
                  <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "8px 10px", borderRadius: "6px", fontSize: "0.8rem", color: "#e2e8f0" }}>
                    &quot;{activeTelemetry.userPrompt}&quot;
                  </div>
                </div>

                {activeTelemetry.reasoningTrace && (
                  <div>
                    <div style={{ fontSize: "0.68rem", color: "#fbbf24", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>
                      Neural Reasoning Trace (&lt;think&gt;)
                    </div>
                    <div style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", padding: "8px 10px", borderRadius: "6px", fontSize: "0.75rem", color: "#fef3c7", maxHeight: "120px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                      {activeTelemetry.reasoningTrace}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>
                    Model Cognitive Response
                  </div>
                  <div style={{ background: "rgba(0, 229, 255, 0.05)", border: "1px solid rgba(0, 229, 255, 0.15)", padding: "10px 12px", borderRadius: "6px", fontSize: "0.85rem", color: "#fff", lineHeight: 1.45 }}>
                    {activeTelemetry.response}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                Select a telemetry entry to inspect prompt weights and model output.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRAIT RESONANCE MATRIX */}
        {activeTab === "traits" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Prompt Tester */}
            <div style={{ background: "rgba(0, 0, 0, 0.4)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>
                  Test Managerial Tactical Prompt Against Squad Characteristics
                </label>
                {resonanceAnalysis && (
                  <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "800" }}>
                    Average Squad Resonance: {resonanceAnalysis.averageResonance}%
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && analyzePromptResonance(testPrompt)}
                  placeholder="Type coaching prompt e.g. High pressing, aggressive slide tackles, patient short passing..."
                  style={{ flex: 1, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "0.85rem", outline: "none" }}
                />
                <button
                  onClick={() => analyzePromptResonance(testPrompt)}
                  disabled={isAnalyzing}
                  style={{ padding: "0 16px", borderRadius: "8px", border: "none", background: "#00E5FF", color: "#000", fontWeight: "800", fontSize: "0.8rem", cursor: "pointer" }}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Prompt"}
                </button>
              </div>
            </div>

            {/* Resonance Table */}
            <div style={{ maxHeight: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {resonanceAnalysis?.resonances.map((item) => (
                <div
                  key={item.playerId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 120px 80px 1fr",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${item.resonanceScore >= 90 ? "rgba(16, 185, 129, 0.3)" : item.resonanceScore <= 60 ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
                    fontSize: "0.8rem",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "800", color: "#fff" }}>{item.name}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "6px" }}>{item.role}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#c084fc", fontWeight: "700" }}>
                    <span>{item.traitIcon}</span>
                    <span>{item.trait}</span>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: "800",
                        fontSize: "0.72rem",
                        background: item.resonanceScore >= 90 ? "rgba(16, 185, 129, 0.2)" : item.resonanceScore <= 60 ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
                        color: item.resonanceScore >= 90 ? "#34d399" : item.resonanceScore <= 60 ? "#f87171" : "#fbbf24",
                      }}
                    >
                      {item.resonanceScore}%
                    </span>
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {item.tacticalAdjustment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PLAYER EVOLUTION & LEARNING */}
        {activeTab === "evolution" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.2)", padding: "10px 14px", borderRadius: "8px" }}>
              🚀 <strong>Grassroots to Superstar Evolution:</strong> Players start with authentic National League ratings (~5.7). When you prompt them consistently and conduct training days, their hidden potential is unlocked, leaping their ratings (up to 8.5+) and exponential transfer valuation!
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
              {allSquad.map((player) => {
                const current = player.rating || 5.7;
                const potential = player.potentialRating || 8.0;
                const progressPct = Math.round(Math.min(100, Math.max(0, ((current - 5.0) / (potential - 5.0)) * 100)));

                return (
                  <div
                    key={player.name}
                    className="glass-panel"
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background: "rgba(15, 23, 42, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "0.9rem", color: "#fff" }}>{player.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{player.role} • {player.personalityIcon} {player.personalityTrait || "Methodical"}</div>
                      </div>
                      <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#10b981" }}>
                        ⭐ {current.toFixed(1)}
                      </span>
                    </div>

                    {/* Progress Bar towards potential */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "3px" }}>
                        <span>Current Rating</span>
                        <span>Max Potential: ⭐ {potential.toFixed(1)}</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg, #38bdf8 0%, #10b981 100%)" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "var(--text-muted)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "6px" }}>
                      <span>Valuation: <strong style={{ color: "#38bdf8" }}>£{player.transferValue || 0.3}M</strong></span>
                      <span>Mastery: <strong style={{ color: "#c084fc" }}>{player.tacticalMastery || 55}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
