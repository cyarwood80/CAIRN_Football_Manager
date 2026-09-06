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
        backgroundColor: "rgba(22, 22, 22, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 99999,
      }}
    >
      <div
        style={{
          width: "min(640px, 100vw)",
          height: "100%",
          background: "var(--cds-surface)",
          borderLeft: "1px solid var(--cds-border)",
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.12)",
          display: "flex",
          flexDirection: "column",
          padding: "28px",
          gap: "20px",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--cds-border)", paddingBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge badge-success" style={{ fontSize: "11px" }}>
                Backroom Staff
              </span>
              <span style={{ fontSize: "12px", color: "var(--cds-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Cpu size={13} color="var(--cds-green-primary)" />
                <span>AI Prompt Powered</span>
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
              Assistant Manager Briefing
            </h2>
            <div style={{ fontSize: "13px", color: "var(--cds-text-secondary)", marginTop: "3px" }}>
              Coach Roy Evans • Tactical Analyst & Squad Overseer
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "6px 8px", height: "auto" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Coach Overview Card */}
        <div
          style={{
            background: "var(--cds-layer)",
            borderRadius: "4px",
            padding: "14px 18px",
            border: "1px solid var(--cds-border)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Club Tier</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-text-primary)" }}>National League</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Squad Harmony</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-green-primary)" }}>{teamConfig.squadHarmony || 82}%</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Transfer Warchest</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-text-primary)" }}>£{(teamConfig.transferBudget || 1.5).toFixed(1)}M</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Active Model</div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F62FE", fontFamily: "var(--font-mono)" }}>{activeModel}</div>
          </div>
        </div>

        {/* Quick Managerial Directive Macro Buttons */}
        <div>
          <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "8px" }}>
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
                  borderRadius: "3px",
                  border: "1px solid var(--cds-border)",
                  background: "var(--cds-layer)",
                  color: "var(--cds-text-secondary)",
                  fontSize: "12px",
                  fontWeight: "500",
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
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
            Issue Managerial Directive to Assistant Coach
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <textarea
              rows={2}
              value={directiveInput}
              onChange={(e) => setDirectiveInput(e.target.value)}
              placeholder="e.g. Give me a blunt tactical debrief on why we conceded, or recommend 2 realistic Tier 4 transfers..."
              className="carbon-input"
              style={{
                flex: 1,
                padding: "10px 12px",
                fontSize: "13px",
                resize: "none",
              }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleSendDirective()}
              disabled={isLoading || !directiveInput.trim()}
              style={{
                padding: "0 18px",
                fontSize: "13px",
                fontWeight: "600",
                gap: "6px",
              }}
            >
              {isLoading ? (
                <span>Thinking...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Direct</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Briefing Display */}
        {briefing ? (
          <div
            className="carbon-card"
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              borderLeft: "3px solid var(--cds-green-primary)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ClipboardList size={18} color="var(--cds-green-primary)" />
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                  {briefing.heading}
                </h3>
              </div>
              {briefing.latencyMs && (
                <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                  {briefing.latencyMs}ms • {briefing.modelUsed || activeModel}
                </span>
              )}
            </div>

            {/* Tactical Analysis */}
            <div style={{ background: "var(--cds-layer)", borderRadius: "4px", padding: "12px", border: "1px solid var(--cds-border)" }}>
              <div style={{ fontSize: "11px", color: "var(--cds-green-primary)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
                Tactical Assessment
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--cds-text-primary)", lineHeight: 1.5 }}>
                {briefing.analysis}
              </p>
            </div>

            {/* Action Plan */}
            <div style={{ background: "var(--cds-green-light)", borderRadius: "4px", padding: "12px", border: "1px solid var(--cds-green-primary)" }}>
              <div style={{ fontSize: "11px", color: "var(--cds-green-primary)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
                Recommended Action Plan
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--cds-text-primary)", lineHeight: 1.5 }}>
                {briefing.actionPlan}
              </p>
            </div>

            {/* Key Recommendations Checklist */}
            {briefing.recommendations && briefing.recommendations.length > 0 && (
              <div>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
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
                        fontSize: "12px",
                        color: "var(--cds-text-secondary)",
                        background: "var(--cds-layer)",
                        padding: "8px 10px",
                        borderRadius: "3px",
                      }}
                    >
                      <CheckCircle2 size={14} color="var(--cds-green-primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
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
              padding: "36px 20px",
              textAlign: "center",
              borderRadius: "4px",
              border: "1px dashed var(--cds-border)",
              color: "var(--cds-text-muted)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Compass size={24} color="var(--cds-text-muted)" />
            <span style={{ fontSize: "13px" }}>
              Click a quick directive above or issue custom prompt instructions to receive an Assistant Manager tactical briefing.
            </span>
          </div>
        )}

        {history.length > 1 && (
          <div style={{ borderTop: "1px solid var(--cds-border)", paddingTop: "12px" }}>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", marginBottom: "6px" }}>Previous Directives:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {history.map((h, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary"
                  style={{ fontSize: "11px", padding: "4px 8px", height: "auto" }}
                  onClick={() => setBriefing(h.briefing)}
                >
                  {h.directive.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
