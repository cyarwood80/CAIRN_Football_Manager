// src/components/LLMStudioModal.tsx
import React, { useState, useEffect } from "react";
import { X, Cpu, Terminal, RefreshCw, Zap, Brain, MessageSquare } from "lucide-react";
import type { LLMModelInfo, LLMTelemetryEntry } from "../types";

interface LLMStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel: string;
  onSelectModel: (modelName: string) => void;
}

export const LLMStudioModal: React.FC<LLMStudioModalProps> = ({
  isOpen,
  onClose,
  activeModel,
  onSelectModel,
}) => {
  const [models, setModels] = useState<LLMModelInfo[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [telemetryLogs, setTelemetryLogs] = useState<LLMTelemetryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const fetchModelsAndTelemetry = async () => {
    setLoading(true);
    try {
      // Fetch models
      const mRes = await fetch("/api/llm/models");
      if (mRes.ok) {
        const data = await mRes.json();
        setModels(data.models || []);
        setIsConnected(data.connected);
      }

      // Fetch telemetry
      const tRes = await fetch("/api/llm/telemetry");
      if (tRes.ok) {
        const tData = await tRes.json();
        setTelemetryLogs(tData.logs || []);
        if (tData.logs && tData.logs.length > 0 && !selectedLogId) {
          setSelectedLogId(tData.logs[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching LLM data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchModelsAndTelemetry();
      const timer = setInterval(fetchModelsAndTelemetry, 4000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentModelMeta = models.find((m) => m.name === activeModel);
  const activeTelemetry = telemetryLogs.find((l) => l.id === selectedLogId) || telemetryLogs[0];

  const handleModelChange = async (newModel: string) => {
    onSelectModel(newModel);
    try {
      await fetch("/api/llm/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: newModel }),
      });
      fetchModelsAndTelemetry();
    } catch (err) {
      console.error("Error setting model:", err);
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
          width: "min(960px, 95vw)",
          maxHeight: "92vh",
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
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "none",
            borderRadius: "8px",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px", paddingRight: "40px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)", fontWeight: "800", fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <Cpu size={15} />
              <span>LOCAL LLM MODEL STUDIO & PROMPT INSPECTOR</span>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fff", marginTop: "2px" }}>
              Desktop AI Engine Configuration
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                fontWeight: "700",
                padding: "4px 10px",
                borderRadius: "20px",
                background: isConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: isConnected ? "#34d399" : "#f87171",
                border: isConnected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isConnected ? "#10b981" : "#ef4444" }} />
              <span>{isConnected ? `Ollama Active (${models.length} Models)` : "Ollama Offline (Fast Fallback)"}</span>
            </div>

            <button
              onClick={fetchModelsAndTelemetry}
              title="Refresh Models & Telemetry"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "#e2e8f0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.72rem",
              }}
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Model Selector Ribbon & Specs Card */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {/* Active Model Selector */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(0, 242, 254, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <label style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🤖 Select Active Local LLM Model
            </label>
            <select
              value={activeModel}
              onChange={(e) => handleModelChange(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(0, 242, 254, 0.4)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#fff",
                fontWeight: "700",
                fontSize: "0.85rem",
                outline: "none",
              }}
            >
              <option value="heuristic-fast">⚡ Fast Simulation Engine (Deterministic Heuristic)</option>
              {models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.parameterSize || "Local"} • {m.quantizationLevel || "Q4"})
                </option>
              ))}
            </select>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              Hot-swappable during matches. Shouts, player dialogue, and club pulse adapt dynamically.
            </span>
          </div>

          {/* Model Technical Specs */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📋 Model Technical Specifications
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center" }}>
              <div style={{ padding: "6px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.03)" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>PARAMETERS</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#fff" }}>
                  {currentModelMeta?.parameterSize || "1.2B"}
                </div>
              </div>
              <div style={{ padding: "6px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.03)" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>FAMILY</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#fff" }}>
                  {currentModelMeta?.family || "llama"}
                </div>
              </div>
              <div style={{ padding: "6px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.03)" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>QUANT</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#fff" }}>
                  {currentModelMeta?.quantizationLevel || "Q8_0"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center" }}>
              Context Window: {currentModelMeta?.contextLength ? `${currentModelMeta.contextLength.toLocaleString()} tokens` : "131,072 tokens"}
            </div>
          </div>
        </div>

        {/* How LLM is used in the Game */}
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(0, 242, 254, 0.04)",
            border: "1px solid rgba(0, 242, 254, 0.15)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-cyan)", marginBottom: "3px" }}>
              <MessageSquare size={13} />
              <span>1. Player 1-on-1 Dialogue</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#cbd5e1", margin: 0, lineHeight: "1.3" }}>
              When you shout instructions from the touchline, the model adopts that player's role, rating, and fatigue to reply realistically.
            </p>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-gold)", marginBottom: "3px" }}>
              <Brain size={13} />
              <span>2. Club Pulse & Chants</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#cbd5e1", margin: 0, lineHeight: "1.3" }}>
              Supporters generate live chants and stadium reactions reflecting their sentiment, altering crowd roar decibels.
            </p>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "800", color: "#34d399", marginBottom: "3px" }}>
              <Zap size={13} />
              <span>3. Boardroom Memos</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#cbd5e1", margin: 0, lineHeight: "1.3" }}>
              Chairperson evaluates tactical style and performance, granting financial bonuses or scrutinizing results.
            </p>
          </div>
        </div>

        {/* Prompt Telemetry Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
              <Terminal size={14} />
              <span>Live Prompt & Token Telemetry Inspector</span>
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              Inspect live system prompts, user directives, and model reasoning
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "12px", minHeight: "260px" }}>
            {/* Telemetry Log List */}
            <div
              style={{
                borderRadius: "10px",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "8px",
                overflowY: "auto",
                maxHeight: "300px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {telemetryLogs.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", fontStyle: "italic", padding: "12px" }}>
                  Awaiting model calls... Shout to a player or start a match to generate telemetry.
                </div>
              ) : (
                telemetryLogs.map((log) => {
                  const isSelected = selectedLogId === log.id;
                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: isSelected ? "rgba(0, 242, 254, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "1px solid var(--accent-cyan)" : "1px solid rgba(255, 255, 255, 0.06)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: "800", color: isSelected ? "var(--accent-cyan)" : "#fff", textTransform: "capitalize" }}>
                          {log.type.replace("_", " ")}
                        </span>
                        <span style={{ fontSize: "0.65rem", color: "#34d399", fontFamily: "var(--font-mono)" }}>
                          {log.latencyMs}ms
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {log.targetName || log.model}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Prompt & Output Details Panel */}
            <div
              style={{
                borderRadius: "10px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                overflowY: "auto",
                maxHeight: "300px",
              }}
            >
              {activeTelemetry ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "6px" }}>
                    <div>
                      <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#fff" }}>
                        {activeTelemetry.targetName ? `${activeTelemetry.targetName} (${activeTelemetry.type})` : activeTelemetry.type}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                        Model: <strong style={{ color: "var(--accent-cyan)" }}>{activeTelemetry.model}</strong>
                      </span>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#34d399", fontFamily: "var(--font-mono)" }}>
                      ⏱️ {activeTelemetry.latencyMs}ms
                    </span>
                  </div>

                  {/* System Prompt Block */}
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "3px" }}>
                      System Instruction Prompt:
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "rgba(0, 0, 0, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        fontSize: "0.72rem",
                        color: "#94a3b8",
                        whiteSpace: "pre-wrap",
                        fontFamily: "var(--font-mono)",
                        lineHeight: "1.3",
                      }}
                    >
                      {activeTelemetry.systemPrompt}
                    </pre>
                  </div>

                  {/* User Directive Block */}
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "3px" }}>
                      User Directive:
                    </div>
                    <div
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        background: "rgba(0, 242, 254, 0.08)",
                        border: "1px solid rgba(0, 242, 254, 0.2)",
                        fontSize: "0.75rem",
                        color: "#fff",
                      }}
                    >
                      {activeTelemetry.userPrompt}
                    </div>
                  </div>

                  {/* Reasoning Trace (if deepseek-r1) */}
                  {activeTelemetry.reasoningTrace && (
                    <div>
                      <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Brain size={11} />
                        <span>Model Chain of Thought Reasoning (&lt;think&gt; trace):</span>
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          padding: "8px 10px",
                          borderRadius: "6px",
                          background: "rgba(234, 179, 8, 0.06)",
                          border: "1px solid rgba(234, 179, 8, 0.2)",
                          fontSize: "0.7rem",
                          color: "#fde047",
                          whiteSpace: "pre-wrap",
                          fontFamily: "var(--font-mono)",
                          lineHeight: "1.3",
                        }}
                      >
                        {activeTelemetry.reasoningTrace}
                      </pre>
                    </div>
                  )}

                  {/* Raw Model Completion Block */}
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#34d399", textTransform: "uppercase", marginBottom: "3px" }}>
                      Raw Model Response:
                    </div>
                    <div
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        fontSize: "0.8rem",
                        color: "#fff",
                        fontStyle: "italic",
                      }}
                    >
                      "{activeTelemetry.response}"
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  Select a telemetry event to inspect prompt details
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Powered by local Ollama API (`http://localhost:11434`). 100% offline & private to your desktop.
          </span>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
              border: "none",
              color: "#000",
              fontWeight: "800",
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
