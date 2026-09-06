// src/components/AssistantManagerDrawer.tsx
import React, { useState } from "react";
import {
  X,
  Send,
  ClipboardList,
  Compass,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import type { TeamConfig, AssistantManagerBriefing, GameSnapshot } from "../types";

interface AssistantManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  teamConfig: TeamConfig;
  gameState: GameSnapshot | null;
  activeTier?: string;
  activeModel?: string;
}

const QUICK_DIRECTIVES = [
  { label: "Defensive Shape Debrief", prompt: "Analyze our defensive transitions and recommend backline compacting adjustments." },
  { label: "Scout Next Opponent", prompt: "Give me a tactical scouting breakdown for our upcoming matchday opponent." },
  { label: "Realistic Transfer Targets", prompt: "Recommend 2 realistic transfer targets for our grassroots budget in Tier 4." },
  { label: "Technical Finishing Drills", prompt: "Plan Tuesday's technical drills to improve our striker and winger finishing precision." },
  { label: "Squad Fatigue & Rotation", prompt: "Evaluate squad fatigue and recommend which bench substitutes should start next game." },
];

export const AssistantManagerDrawer: React.FC<AssistantManagerDrawerProps> = ({
  isOpen,
  onClose,
  teamConfig,
  gameState,
  activeTier = "tier_4",
  activeModel = "llama3.2:1b",
}) => {
  const [directiveInput, setDirectiveInput] = useState("");
  const [briefing, setBriefing] = useState<AssistantManagerBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ directive: string; briefing: AssistantManagerBriefing }[]>([]);

  if (!isOpen) return null;

  const handleSendDirective = async (promptToSend?: string) => {
    const text = (promptToSend || directiveInput).trim();
    if (!text) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/staff/assistant-directive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directive: text,
          teamConfig,
          gameState,
          activeTier,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.briefing) {
          setBriefing(data.briefing);
          setHistory((prev) => [{ directive: text, briefing: data.briefing }, ...prev.slice(0, 4)]);
          if (!promptToSend) setDirectiveInput("");
        }
      }
    } catch (err) {
      console.error("Assistant directive error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 99999,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "min(640px, 100vw)",
          height: "100%",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 26, 0.99) 100%)",
          borderLeft: "1px solid rgba(0, 229, 255, 0.3)",
          boxShadow: "-15px 0 35px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          gap: "18px",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  background: "rgba(0, 229, 255, 0.15)",
                  color: "#00E5FF",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                }}
              >
                Backroom Staff
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Cpu size={12} />
                <span>AI Prompt Powered</span>
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "#fff" }}>
              Assistant Manager Briefing
            </h2>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Coach Roy Evans • Tactical Analyst & Squad Overseer
            </div>
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

        {/* Coach Overview Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            padding: "14px 16px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Club Tier</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#38bdf8" }}>National League</div>
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Squad Harmony</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#c084fc" }}>{teamConfig.squadHarmony || 75}%</div>
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Transfer Warchest</div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#10b981" }}>£{(teamConfig.transferBudget || 1.5).toFixed(1)}M</div>
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Model Provider</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#fbbf24" }}>{activeModel}</div>
          </div>
        </div>

        {/* Quick Managerial Directive Macro Buttons */}
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "8px" }}>
            Quick Coaching Directives
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {QUICK_DIRECTIVES.map((qd) => (
              <button
                key={qd.label}
                onClick={() => handleSendDirective(qd.prompt)}
                disabled={isLoading}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {qd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manager Directive Prompt Input Box */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e2e8f0" }}>
            Issue Managerial Directive to Assistant Coach
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <textarea
              rows={2}
              value={directiveInput}
              onChange={(e) => setDirectiveInput(e.target.value)}
              placeholder="e.g. Give me a blunt tactical debrief on why we conceded, or recommend 2 realistic Tier 4 transfers..."
              style={{
                flex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "10px",
                padding: "10px 12px",
                color: "#fff",
                fontSize: "0.85rem",
                outline: "none",
                resize: "none",
              }}
            />
            <button
              onClick={() => handleSendDirective()}
              disabled={isLoading || !directiveInput.trim()}
              style={{
                padding: "0 18px",
                borderRadius: "10px",
                border: "none",
                background: directiveInput.trim() ? "linear-gradient(135deg, #00E5FF 0%, #0077FF 100%)" : "rgba(255, 255, 255, 0.08)",
                color: directiveInput.trim() ? "#000" : "var(--text-muted)",
                fontWeight: "800",
                fontSize: "0.85rem",
                cursor: directiveInput.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {isLoading ? (
                <span>Thinking...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Direct</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Briefing Display */}
        {briefing ? (
          <div
            className="glass-panel"
            style={{
              background: "linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(15, 23, 42, 0.9) 100%)",
              border: "1px solid rgba(0, 229, 255, 0.25)",
              borderRadius: "14px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ClipboardList size={20} color="#00E5FF" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#fff" }}>
                  {briefing.heading}
                </h3>
              </div>
              {briefing.latencyMs && (
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {briefing.latencyMs}ms • {briefing.modelUsed || activeModel}
                </span>
              )}
            </div>

            {/* Tactical Analysis */}
            <div style={{ background: "rgba(0, 0, 0, 0.3)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <div style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: "800", textTransform: "uppercase", marginBottom: "4px" }}>
                Tactical Assessment
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#e2e8f0", lineHeight: 1.45 }}>
                {briefing.analysis}
              </p>
            </div>

            {/* Action Plan */}
            <div style={{ background: "rgba(16, 185, 129, 0.06)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <div style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: "800", textTransform: "uppercase", marginBottom: "4px" }}>
                Recommended Action Plan
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#d1fae5", lineHeight: 1.45 }}>
                {briefing.actionPlan}
              </p>
            </div>

            {/* Key Recommendations Checklist */}
            {briefing.recommendations && briefing.recommendations.length > 0 && (
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
                  Staff Recommendations
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {briefing.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        background: "rgba(255, 255, 255, 0.02)",
                        padding: "8px 10px",
                        borderRadius: "6px",
                      }}
                    >
                      <CheckCircle2 size={15} color="#00E5FF" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              borderRadius: "12px",
              border: "1px dashed rgba(255, 255, 255, 0.1)",
              color: "var(--text-muted)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Compass size={28} color="var(--text-muted)" />
            <span style={{ fontSize: "0.85rem" }}>
              Click a quick directive above or issue custom prompt instructions to receive an Assistant Manager tactical briefing.
            </span>
          </div>
        )}

        {history.length > 1 && (
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>Previous Directives:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {history.map((h, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.72rem", padding: "4px 8px" }}
                  onClick={() => setBriefing(h.briefing)}
                >
                  {h.directive.slice(0, 28)}...
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
