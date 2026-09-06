// src/components/EmbeddedPlayerChat.tsx
import React, { useState } from "react";
import { MessageSquare, Send, Zap, Target, Shield, Award, Heart, Building2, Sparkles } from "lucide-react";
import type { PlayerState, ChatMessage, FanFeedback, ChairpersonFeedback } from "../types";

interface EmbeddedPlayerChatProps {
  players: PlayerState[];
  selectedPlayer: PlayerState | null;
  onSelectPlayer: (player: PlayerState) => void;
  onSendDirective: (playerId: string, message: string) => void;
  chatHistory: ChatMessage[];
  teamColor?: string;
  fanFeedback?: FanFeedback;
  chairpersonFeedback?: ChairpersonFeedback;
  activeModel?: string;
  onOpenLLMStudio?: () => void;
}

const QUICK_SHOUTS = [
  { text: "Press and hunt the ball down fiercely!", icon: Zap, label: "⚡ Press & Hunt" },
  { text: "Pull the trigger! Shoot on sight from distance!", icon: Target, label: "🎯 Shoot on Sight" },
  { text: "Keep calm, retain possession, and play short passes.", icon: Shield, label: "🧘 Retain Ball" },
  { text: "Put in crunching tackles and lock down your man!", icon: Shield, label: "🛡️ Hard Tackles" },
  { text: "Wake up! Your match rating is dropping! I need more intensity!", icon: Award, label: "💥 Lift Rating" },
];

export const EmbeddedPlayerChat: React.FC<EmbeddedPlayerChatProps> = ({
  players,
  selectedPlayer,
  onSelectPlayer,
  onSendDirective,
  chatHistory,
  teamColor = "#00f2fe",
  fanFeedback,
  chairpersonFeedback,
  activeModel = "llama3.2:1b",
  onOpenLLMStudio,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "dynamics">("chat");
  const [inputText, setInputText] = useState("");

  // Default to first outfield player if none selected
  const currentPlayer = selectedPlayer || players.find((p) => p.team === "home" && !p.subbedOut) || players[0] || null;
  const homeStarters = players.filter((p) => p.team === "home" && !p.subbedOut);
  const playerChats = currentPlayer ? chatHistory.filter((c) => c.playerId === currentPlayer.id) : [];

  const handleSend = (textToSend?: string) => {
    if (!currentPlayer) return;
    const msg = textToSend || inputText;
    if (!msg.trim()) return;
    onSendDirective(currentPlayer.id, msg.trim());
    setInputText("");
  };

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: "14px",
        padding: "16px 18px",
        background: "linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 28, 0.98) 100%)",
        border: "1px solid rgba(0, 242, 254, 0.2)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Sub-Tabs: 1-on-1 Player Touchline Chat vs Club Dynamics (Fan & Chairperson) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "10px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setActiveSubTab("chat")}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "0.76rem",
              fontWeight: "800",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: activeSubTab === "chat" ? "rgba(0, 242, 254, 0.18)" : "transparent",
              color: activeSubTab === "chat" ? "var(--accent-cyan)" : "var(--text-secondary)",
              border: activeSubTab === "chat" ? "1px solid rgba(0, 242, 254, 0.4)" : "1px solid transparent",
            }}
          >
            <MessageSquare size={13} />
            <span>1-on-1 Touchline Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("dynamics")}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "0.76rem",
              fontWeight: "800",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: activeSubTab === "dynamics" ? "rgba(234, 179, 8, 0.18)" : "transparent",
              color: activeSubTab === "dynamics" ? "var(--accent-gold)" : "var(--text-secondary)",
              border: activeSubTab === "dynamics" ? "1px solid rgba(234, 179, 8, 0.4)" : "1px solid transparent",
            }}
          >
            <Building2 size={13} />
            <span>Club Pulse & Board</span>
          </button>
        </div>

        {/* Model Indicator / Inspector link */}
        {onOpenLLMStudio && (
          <button
            type="button"
            onClick={onOpenLLMStudio}
            title="Inspect Prompt Telemetry & Switch Local Model"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.68rem",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#94a3b8",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Sparkles size={11} color="var(--accent-cyan)" />
            <span style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{activeModel}</span>
          </button>
        )}
      </div>

      {activeSubTab === "chat" ? (
        <>
          {/* Player Quick Selector Ribbon */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Target Player:
            </span>
            <select
              value={currentPlayer?.id || ""}
              onChange={(e) => {
                const p = homeStarters.find((item) => item.id === e.target.value);
                if (p) onSelectPlayer(p);
              }}
              style={{
                flex: 1,
                maxWidth: "240px",
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                borderRadius: "6px",
                padding: "4px 8px",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: "700",
                outline: "none",
              }}
            >
              {homeStarters.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name} ({p.role}) - {p.rating.toFixed(1)} ★
                </option>
              ))}
            </select>
          </div>

          {/* Player Mini Status Card */}
          {currentPlayer && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: teamColor,
                    color: "#000",
                    fontWeight: "900",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  {currentPlayer.number}
                </div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "0.82rem", color: "#fff" }}>
                    {currentPlayer.name}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    {currentPlayer.role} • Stamina {currentPlayer.stamina}% • TM {currentPlayer.tacticalMastery || 75}%
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#34d399", fontFamily: "var(--font-mono)" }}>
                  {currentPlayer.rating.toFixed(1)}
                </div>
                <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Rating</div>
              </div>
            </div>
          )}

          {/* Chat Messages Stream */}
          <div
            style={{
              height: "140px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "8px",
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.04)",
            }}
          >
            {playerChats.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", fontStyle: "italic" }}>
                Shout tactical instructions to #{currentPlayer?.number} {currentPlayer?.name}...
              </div>
            ) : (
              playerChats.map((msg, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {/* Manager Shout Bubble */}
                  <div style={{ alignSelf: "flex-end", maxWidth: "85%", background: "rgba(0, 242, 254, 0.15)", border: "1px solid rgba(0, 242, 254, 0.3)", padding: "5px 10px", borderRadius: "10px 10px 2px 10px", fontSize: "0.75rem", color: "#e2e8f0" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--accent-cyan)", fontWeight: "800", display: "block", marginBottom: "1px" }}>
                      Boss:
                    </span>
                    {msg.message}
                  </div>

                  {/* Player Reply Bubble */}
                  {msg.response && (
                    <div style={{ alignSelf: "flex-start", maxWidth: "88%", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "5px 10px", borderRadius: "10px 10px 10px 2px", fontSize: "0.75rem", color: "#fff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", marginBottom: "1px" }}>
                        <span style={{ fontSize: "0.65rem", color: "#34d399", fontWeight: "800" }}>
                          {msg.playerName || currentPlayer?.name}:
                        </span>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {activeModel}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontStyle: "italic" }}>"{msg.response}"</p>
                      {msg.actionTaken && (
                        <span style={{ fontSize: "0.62rem", color: "#38bdf8", display: "block", marginTop: "3px", fontWeight: "700" }}>
                          ⚡ {msg.actionTaken}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Shouts Row */}
          <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "2px" }}>
            {QUICK_SHOUTS.map((qs, qIdx) => (
              <button
                key={qIdx}
                type="button"
                onClick={() => handleSend(qs.text)}
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#cbd5e1",
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>{qs.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Manager Shout Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: "flex", gap: "6px" }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Shout directive to ${currentPlayer?.name || "player"}...`}
              style={{
                flex: 1,
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "#fff",
                fontSize: "0.78rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                background: inputText.trim() ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.08)",
                border: "none",
                color: inputText.trim() ? "#000" : "var(--text-muted)",
                fontWeight: "800",
                fontSize: "0.75rem",
                cursor: inputText.trim() ? "pointer" : "default",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Send size={12} />
              <span>Shout</span>
            </button>
          </form>
        </>
      ) : (
        /* Club Dynamics View: Fan Feedback & Chairperson Boardroom */
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", minHeight: "240px" }}>
          {/* Fan Feedback Card */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(0, 242, 254, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                <Heart size={14} color="#f43f5e" />
                <span>Supporters Sentiment & Stadium Roar</span>
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: "800",
                  padding: "1px 8px",
                  borderRadius: "12px",
                  background: (fanFeedback?.sentiment ?? 65) >= 65 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: (fanFeedback?.sentiment ?? 65) >= 65 ? "#34d399" : "#f87171",
                  border: (fanFeedback?.sentiment ?? 65) >= 65 ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                }}
              >
                {fanFeedback?.status || "Optimistic"} ({fanFeedback?.sentiment ?? 65}%)
              </span>
            </div>

            {/* Sentiment Progress Bar */}
            <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${fanFeedback?.sentiment ?? 65}%`,
                  background: (fanFeedback?.sentiment ?? 65) >= 65 ? "linear-gradient(90deg, #10b981, #06b6d4)" : "linear-gradient(90deg, #f59e0b, #ef4444)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div style={{ fontSize: "0.78rem", color: "#e2e8f0", fontStyle: "italic", lineHeight: "1.3", margin: "2px 0" }}>
              "{fanFeedback?.chant || "Come on boys, let's play our football!"}"
            </div>

            <div style={{ fontSize: "0.68rem", color: "#94a3b8", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "4px" }}>
              <strong style={{ color: "var(--accent-cyan)" }}>Influence: </strong>
              {fanFeedback?.moraleEffect || "Neutral crowd atmosphere"}
            </div>
          </div>

          {/* Chairperson Boardroom Card */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(234, 179, 8, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-gold)", textTransform: "uppercase" }}>
                <Building2 size={14} color="var(--accent-gold)" />
                <span>Chairperson & Boardroom Verdict</span>
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: "800",
                  padding: "1px 8px",
                  borderRadius: "12px",
                  background: (chairpersonFeedback?.boardConfidence ?? 75) >= 65 ? "rgba(234, 179, 8, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: (chairpersonFeedback?.boardConfidence ?? 75) >= 65 ? "#facc15" : "#f87171",
                  border: (chairpersonFeedback?.boardConfidence ?? 75) >= 65 ? "1px solid rgba(234, 179, 8, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                }}
              >
                {chairpersonFeedback?.status || "Satisfied"} ({chairpersonFeedback?.boardConfidence ?? 75}%)
              </span>
            </div>

            {/* Board Confidence Bar */}
            <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${chairpersonFeedback?.boardConfidence ?? 75}%`,
                  background: "linear-gradient(90deg, #ca8a04, #eab308)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div style={{ fontSize: "0.76rem", color: "#e2e8f0", lineHeight: "1.35", margin: "2px 0" }}>
              {chairpersonFeedback?.message || "The Board expects tactical excellence and high discipline today."}
            </div>

            <div style={{ fontSize: "0.68rem", color: "#94a3b8", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "4px" }}>
              <strong style={{ color: "var(--accent-gold)" }}>Board Impact: </strong>
              {chairpersonFeedback?.influence || "Standard board backing"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
