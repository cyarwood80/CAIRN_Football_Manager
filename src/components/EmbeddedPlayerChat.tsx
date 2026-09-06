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
  teamColor = "var(--cds-green-primary)",
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
      className="carbon-card"
      style={{
        padding: "14px 16px",
        background: "var(--cds-surface)",
        border: "1px solid var(--cds-border)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Sub-Tabs: 1-on-1 Player Touchline Chat vs Club Dynamics */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--cds-border-subtle)", paddingBottom: "8px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setActiveSubTab("chat")}
            className={`btn ${activeSubTab === "chat" ? "btn-primary" : "btn-secondary"}`}
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "700",
              height: "28px",
            }}
          >
            <MessageSquare size={12} />
            <span>1-on-1 Touchline Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("dynamics")}
            className={`btn ${activeSubTab === "dynamics" ? "btn-primary" : "btn-secondary"}`}
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "700",
              height: "28px",
            }}
          >
            <Building2 size={12} />
            <span>Club Pulse & Board</span>
          </button>
        </div>

        {/* Model Indicator / Inspector link */}
        {onOpenLLMStudio && (
          <button
            type="button"
            onClick={onOpenLLMStudio}
            className="btn btn-secondary"
            title="Inspect Prompt Telemetry & Switch Local Model"
            style={{
              height: "26px",
              padding: "0 8px",
              fontSize: "11px",
              gap: "4px",
            }}
          >
            <Sparkles size={11} color="var(--cds-green-primary)" />
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--cds-green-primary)", fontWeight: "700" }}>{activeModel}</span>
          </button>
        )}
      </div>

      {activeSubTab === "chat" ? (
        <>
          {/* Player Quick Selector Ribbon */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>
              Target Player:
            </span>
            <select
              value={currentPlayer?.id || ""}
              onChange={(e) => {
                const p = homeStarters.find((item) => item.id === e.target.value);
                if (p) onSelectPlayer(p);
              }}
              className="carbon-input"
              style={{
                flex: 1,
                maxWidth: "240px",
                height: "30px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: "600",
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
                padding: "8px 10px",
                borderRadius: "4px",
                background: "var(--cds-layer)",
                border: "1px solid var(--cds-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    background: teamColor,
                    color: "#fff",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                  }}
                >
                  {currentPlayer.number}
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "12px", color: "var(--cds-text-primary)" }}>
                    {currentPlayer.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                    {currentPlayer.role} • Stamina {currentPlayer.stamina}% • TM {currentPlayer.tacticalMastery || 75}%
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--cds-green-primary)", fontFamily: "var(--font-mono)", lineHeight: 1.1 }}>
                  {currentPlayer.rating.toFixed(1)}
                </div>
                <div style={{ fontSize: "9px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Rating</div>
              </div>
            </div>
          )}

          {/* Chat Messages Stream */}
          <div
            style={{
              height: "120px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "6px 8px",
              background: "var(--cds-layer)",
              borderRadius: "4px",
              border: "1px solid var(--cds-border)",
            }}
          >
            {playerChats.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", color: "var(--cds-text-muted)", fontSize: "11px", fontStyle: "italic" }}>
                Shout tactical instructions to #{currentPlayer?.number} {currentPlayer?.name}...
              </div>
            ) : (
              playerChats.map((msg, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {/* Manager Shout Bubble */}
                  <div style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--cds-green-light)", border: "1px solid var(--cds-green-primary)", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", color: "var(--cds-text-primary)" }}>
                    <span style={{ fontSize: "10px", color: "var(--cds-green-primary)", fontWeight: "800", display: "block" }}>
                      Boss:
                    </span>
                    {msg.message}
                  </div>

                  {/* Player Reply Bubble */}
                  {msg.response && (
                    <div style={{ alignSelf: "flex-start", maxWidth: "88%", background: "var(--cds-surface)", border: "1px solid var(--cds-border)", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", color: "var(--cds-text-primary)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "10px", color: "var(--cds-green-primary)", fontWeight: "800" }}>
                          {msg.playerName || currentPlayer?.name}:
                        </span>
                        <span style={{ fontSize: "9px", color: "var(--cds-text-muted)", fontFamily: "var(--font-mono)" }}>
                          {activeModel}
                        </span>
                      </div>
                      <p style={{ margin: "2px 0 0 0", fontStyle: "italic", color: "var(--cds-text-secondary)" }}>"{msg.response}"</p>
                      {msg.actionTaken && (
                        <span style={{ fontSize: "10px", color: "var(--cds-blue)", display: "block", marginTop: "2px", fontWeight: "600" }}>
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
                className="btn btn-secondary"
                style={{
                  padding: "2px 8px",
                  fontSize: "10px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  height: "24px",
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
              className="carbon-input"
              style={{
                flex: 1,
                height: "32px",
                fontSize: "12px",
                padding: "4px 8px",
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn btn-primary"
              style={{
                height: "32px",
                padding: "0 12px",
                fontSize: "12px",
                fontWeight: "600",
                gap: "4px",
              }}
            >
              <Send size={11} />
              <span>Shout</span>
            </button>
          </form>
        </>
      ) : (
        /* Club Dynamics View: Fan Feedback & Chairperson Boardroom */
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Fan Feedback Card */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--cds-text-primary)", textTransform: "uppercase" }}>
                <Heart size={12} color="var(--cds-red)" />
                <span>Supporters Sentiment & Roar</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: "10px", padding: "1px 6px" }}>
                {fanFeedback?.status || "Optimistic"} ({fanFeedback?.sentiment ?? 65}%)
              </span>
            </div>

            {/* Sentiment Progress Bar */}
            <div style={{ height: "4px", borderRadius: "2px", background: "var(--cds-border)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${fanFeedback?.sentiment ?? 65}%`,
                  background: "var(--cds-green-primary)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)", fontStyle: "italic", lineHeight: "1.3", margin: "2px 0" }}>
              "{fanFeedback?.chant || "Come on boys, let's play our football!"}"
            </div>

            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", borderTop: "1px solid var(--cds-border-subtle)", paddingTop: "4px" }}>
              <strong style={{ color: "var(--cds-text-primary)" }}>Influence: </strong>
              {fanFeedback?.moraleEffect || "Neutral crowd atmosphere"}
            </div>
          </div>

          {/* Chairperson Boardroom Card */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--cds-text-primary)", textTransform: "uppercase" }}>
                <Building2 size={12} color="var(--cds-blue)" />
                <span>Chairperson & Board Verdict</span>
              </div>
              <span className="badge badge-info" style={{ fontSize: "10px", padding: "1px 6px" }}>
                {chairpersonFeedback?.status || "Satisfied"} ({chairpersonFeedback?.boardConfidence ?? 75}%)
              </span>
            </div>

            {/* Board Confidence Bar */}
            <div style={{ height: "4px", borderRadius: "2px", background: "var(--cds-border)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${chairpersonFeedback?.boardConfidence ?? 75}%`,
                  background: "var(--cds-blue)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: "1.35", margin: "2px 0" }}>
              {chairpersonFeedback?.message || "The Board expects tactical excellence and high discipline today."}
            </div>

            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", borderTop: "1px solid var(--cds-border-subtle)", paddingTop: "4px" }}>
              <strong style={{ color: "var(--cds-text-primary)" }}>Board Impact: </strong>
              {chairpersonFeedback?.influence || "Standard board backing"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
