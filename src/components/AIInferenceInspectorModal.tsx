// src/components/AIInferenceInspectorModal.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Activity,
  Zap,
  TrendingUp,
  Terminal,
  RefreshCw,
  Cpu,
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
  const [testPrompt, setTestPrompt] = useState(
    teamConfig.prompt || "Relentless counter-press, quick vertical transitions, wingers overlap, striker shoot on sight"
  );
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
        backgroundColor: "rgba(22, 22, 22, 0.45)",
        backdropFilter: "blur(4px)",
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
          maxWidth: "960px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.16)",
        }}
      >
        {/* Header & Local Model Selector */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--cds-border)", paddingBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className={isConnected ? "badge badge-success" : "badge badge-warning"} style={{ fontSize: "11px" }}>
                {isConnected ? "Local Ollama: Connected" : "Local Standalone Cognitive Mode"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>100% Desktop Offline Execution</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--cds-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Cpu size={22} color="var(--cds-green-primary)" />
              <span>AI Neural Cognition & Inference Hub</span>
            </h2>
            <p style={{ margin: "3px 0 0 0", color: "var(--cds-text-secondary)", fontSize: "13px" }}>
              Surface real-time prompt inferencing, personality trait resonance, and player self-evolution curves.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Model Selector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Active Model</span>
              <select
                value={activeModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="carbon-input"
                style={{
                  height: "32px",
                  padding: "0 8px",
                  fontSize: "12px",
                  fontWeight: "600",
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
              className="btn btn-secondary"
              style={{ padding: "6px 8px", height: "auto" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--cds-border-subtle)", paddingBottom: "10px" }}>
          <button
            onClick={() => setActiveTab("stream")}
            style={{
              padding: "6px 14px",
              borderRadius: "3px",
              border: activeTab === "stream" ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
              fontSize: "12px",
              fontWeight: activeTab === "stream" ? "600" : "400",
              cursor: "pointer",
              background: activeTab === "stream" ? "var(--cds-layer-selected)" : "transparent",
              color: activeTab === "stream" ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Activity size={14} />
            <span>Live Inference Stream ({telemetryLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("traits")}
            style={{
              padding: "6px 14px",
              borderRadius: "3px",
              border: activeTab === "traits" ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
              fontSize: "12px",
              fontWeight: activeTab === "traits" ? "600" : "400",
              cursor: "pointer",
              background: activeTab === "traits" ? "var(--cds-layer-selected)" : "transparent",
              color: activeTab === "traits" ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Zap size={14} />
            <span>Squad Trait Resonance Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("evolution")}
            style={{
              padding: "6px 14px",
              borderRadius: "3px",
              border: activeTab === "evolution" ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
              fontSize: "12px",
              fontWeight: activeTab === "evolution" ? "600" : "400",
              cursor: "pointer",
              background: activeTab === "evolution" ? "var(--cds-layer-selected)" : "transparent",
              color: activeTab === "evolution" ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <TrendingUp size={14} />
            <span>Player Evolution & Learning Curves</span>
          </button>
        </div>

        {/* TAB 1: LIVE INFERENCE STREAM */}
        {activeTab === "stream" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "16px" }}>
            {/* Telemetry Log List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                  Recent Inferences
                </span>
                <button
                  onClick={fetchLLMData}
                  disabled={isLoading}
                  style={{ background: "transparent", border: "none", color: "var(--cds-green-primary)", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <RefreshCw size={12} />
                  <span>Refresh</span>
                </button>
              </div>

              <div style={{ maxHeight: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", paddingRight: "4px" }}>
                {telemetryLogs.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--cds-text-muted)", fontSize: "13px" }}>
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
                          borderRadius: "4px",
                          border: isSelected ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                          background: isSelected ? "var(--cds-layer-selected)" : "var(--cds-layer)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: isSelected ? "var(--cds-green-primary)" : "var(--cds-text-primary)" }}>
                            {log.targetName || log.type}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                            {log.latencyMs}ms
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          "{log.userPrompt}"
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
                  background: "var(--cds-layer)",
                  borderRadius: "4px",
                  padding: "16px",
                  border: "1px solid var(--cds-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--cds-border-subtle)", paddingBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Terminal size={15} color="var(--cds-green-primary)" />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
                      Inference Telemetry Details
                    </span>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: "11px" }}>
                    {activeTelemetry.model} • {activeTelemetry.tokenCount || 40} tokens
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px" }}>
                    User Prompt / Directive
                  </div>
                  <div style={{ background: "var(--cds-surface)", border: "1px solid var(--cds-border)", padding: "8px 10px", borderRadius: "3px", fontSize: "13px", color: "var(--cds-text-primary)" }}>
                    "{activeTelemetry.userPrompt}"
                  </div>
                </div>

                {activeTelemetry.reasoningTrace && (
                  <div>
                    <div style={{ fontSize: "11px", color: "#B28600", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px" }}>
                      Neural Reasoning Trace (&lt;think&gt;)
                    </div>
                    <div style={{ background: "var(--cds-amber-light)", border: "1px solid var(--cds-amber)", padding: "8px 10px", borderRadius: "3px", fontSize: "12px", color: "#8A6800", maxHeight: "120px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                      {activeTelemetry.reasoningTrace}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px" }}>
                    Model Cognitive Response
                  </div>
                  <div style={{ background: "var(--cds-surface)", border: "1px solid var(--cds-border)", padding: "10px 12px", borderRadius: "3px", fontSize: "13px", color: "var(--cds-text-primary)", lineHeight: 1.5 }}>
                    {activeTelemetry.response}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--cds-text-muted)", fontSize: "13px" }}>
                Select a telemetry entry to inspect prompt weights and model output.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRAIT RESONANCE MATRIX */}
        {activeTab === "traits" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Prompt Tester */}
            <div style={{ background: "var(--cds-layer)", borderRadius: "4px", padding: "16px", border: "1px solid var(--cds-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
                  Test Managerial Tactical Prompt Against Squad Characteristics
                </label>
                {resonanceAnalysis && (
                  <span className="badge badge-success" style={{ fontSize: "11px" }}>
                    Squad Resonance: {resonanceAnalysis.averageResonance}%
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
                  className="carbon-input"
                  style={{ flex: 1, height: "36px", fontSize: "13px" }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => analyzePromptResonance(testPrompt)}
                  disabled={isAnalyzing}
                  style={{ height: "36px", fontSize: "13px" }}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Prompt"}
                </button>
              </div>
            </div>

            {/* Resonance Table */}
            <div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {resonanceAnalysis?.resonances.map((item) => (
                <div
                  key={item.playerId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 120px 80px 1fr",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "4px",
                    background: "var(--cds-layer)",
                    border: `1px solid ${item.resonanceScore >= 90 ? "var(--cds-green-primary)" : "var(--cds-border)"}`,
                    fontSize: "13px",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "600", color: "var(--cds-text-primary)" }}>{item.name}</span>
                    <span style={{ fontSize: "11px", color: "var(--cds-text-muted)", marginLeft: "6px" }}>{item.role}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#0F62FE", fontWeight: "600", fontSize: "12px" }}>
                    <span>{item.traitIcon}</span>
                    <span>{item.trait}</span>
                  </div>

                  <div>
                    <span
                      className={item.resonanceScore >= 80 ? "badge badge-success" : "badge badge-warning"}
                      style={{ fontSize: "11px" }}
                    >
                      {item.resonanceScore}%
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
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
            <div style={{ fontSize: "13px", color: "var(--cds-text-secondary)", background: "var(--cds-green-light)", border: "1px solid var(--cds-green-primary)", padding: "10px 14px", borderRadius: "4px" }}>
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
                    className="carbon-card"
                    style={{
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--cds-text-primary)" }}>{player.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>{player.role} • {player.personalityIcon} {player.personalityTrait || "Methodical"}</div>
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--cds-green-primary)" }}>
                        ⭐ {current.toFixed(1)}
                      </span>
                    </div>

                    {/* Progress Bar towards potential */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--cds-text-muted)", marginBottom: "3px" }}>
                        <span>Current Rating</span>
                        <span>Max Potential: ⭐ {potential.toFixed(1)}</span>
                      </div>
                      <div style={{ width: "100%", height: "4px", background: "var(--cds-border)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--cds-green-primary)" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--cds-text-muted)", borderTop: "1px solid var(--cds-border-subtle)", paddingTop: "6px" }}>
                      <span>Valuation: <strong style={{ color: "var(--cds-text-primary)" }}>£{player.transferValue || 0.3}M</strong></span>
                      <span>Mastery: <strong style={{ color: "var(--cds-green-primary)" }}>{player.tacticalMastery || 55}%</strong></span>
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
