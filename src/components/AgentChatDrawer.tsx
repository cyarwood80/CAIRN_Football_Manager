// src/components/AgentChatDrawer.tsx
import React, { useState } from "react";
import { MessageSquare, X, Send, Zap, Shield, Target, Award } from "lucide-react";
import type { PlayerState, ChatMessage } from "../types";

interface AgentChatDrawerProps {
  player: PlayerState | null;
  onClose: () => void;
  onSendDirective: (playerId: string, message: string) => void;
  chatHistory: ChatMessage[];
  teamColor?: string;
}

const QUICK_SHOUTS = [
  { text: "Press and hunt the ball down fiercely!", icon: Zap, label: "⚡ Press & Hunt" },
  { text: "Pull the trigger! Shoot on sight from distance!", icon: Target, label: "🎯 Shoot on Sight" },
  { text: "Keep calm, retain possession, and play short passes.", icon: Shield, label: "🧘 Retain Ball" },
  { text: "Put in crunching tackles and lock down your man!", icon: Shield, label: "🛡️ Hard Tackles" },
  { text: "Wake up! Your match rating is dropping! I need more intensity!", icon: Award, label: "💥 Lift Rating" },
];

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  player,
  onClose,
  onSendDirective,
  chatHistory,
  teamColor = "#00f2fe",
}) => {
  const [inputText, setInputText] = useState("");

  if (!player) return null;

  const playerChats = chatHistory.filter((c) => c.playerId === player.id);

  const handleSend = (textToSend?: string) => {
    const msg = textToSend || inputText;
    if (!msg.trim()) return;
    onSendDirective(player.id, msg.trim());
    setInputText("");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(460px, 95vw)",
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(9, 14, 26, 0.98) 100%)",
        borderLeft: `2px solid ${teamColor}88`,
        boxShadow: "-10px 0 35px rgba(0, 0, 0, 0.7)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: teamColor,
              color: "#000",
              fontWeight: "900",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            {player.number}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: "800", fontSize: "1rem", color: "#fff" }}>{player.name}</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "var(--text-secondary)",
                  fontWeight: "700",
                }}
              >
                {player.role}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", gap: "8px", marginTop: "2px" }}>
              <span>Rating: <strong style={{ color: (player.rating || 6.0) >= 7.0 ? "#34d399" : (player.rating || 6.0) >= 5.8 ? "#fbbf24" : "#f87171" }}>{(player.rating || 6.0).toFixed(1)}</strong></span>
              <span>Health: <strong>{player.health || 100}%</strong></span>
              <span>Stamina: <strong>{player.stamina || 100}%</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
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
      </div>

      {/* Active Thought Pill */}
      <div
        style={{
          margin: "12px 18px",
          padding: "10px 14px",
          borderRadius: "8px",
          background: "rgba(0, 242, 254, 0.06)",
          borderLeft: `3px solid ${teamColor}`,
          fontSize: "0.78rem",
          fontStyle: "italic",
          color: "#e2e8f0",
        }}
      >
        <span style={{ fontWeight: "800", fontStyle: "normal", color: "#38bdf8", marginRight: "6px" }}>Current Focus:</span>
        "{player.thought || "Maintaining tactical positioning..."}"
      </div>

      {/* Chat Messages Thread */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {playerChats.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem", margin: "auto" }}>
            <MessageSquare size={32} style={{ margin: "0 auto 8px auto", opacity: 0.3 }} />
            <div>Touchline Talk with <strong>{player.name}</strong></div>
            <div style={{ fontSize: "0.74rem", marginTop: "4px" }}>
              Give specific instructions to influence this player's aggression, passing directness, or positioning.
            </div>
          </div>
        ) : (
          playerChats.map((chat) => (
            <div key={chat.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Manager Shout */}
              <div
                style={{
                  alignSelf: "flex-end",
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "12px 12px 2px 12px",
                  maxWidth: "85%",
                  fontSize: "0.82rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ fontSize: "0.68rem", opacity: 0.8, marginBottom: "2px", fontWeight: "700" }}>
                  Coach Shout ({chat.minute}')
                </div>
                {chat.message}
              </div>

              {/* Agent Reply */}
              {chat.response && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "rgba(30, 41, 59, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#f1f5f9",
                    padding: "8px 12px",
                    borderRadius: "12px 12px 12px 2px",
                    maxWidth: "85%",
                    fontSize: "0.82rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <div style={{ fontSize: "0.68rem", color: teamColor, marginBottom: "2px", fontWeight: "800" }}>
                    {player.name} (Agent Decision)
                  </div>
                  {chat.response}
                  {chat.actionTaken && (
                    <div style={{ fontSize: "0.68rem", color: "#34d399", marginTop: "4px", fontWeight: "700" }}>
                      ✓ {chat.actionTaken}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Shouts Bar */}
      <div
        style={{
          padding: "10px 18px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          background: "rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        {QUICK_SHOUTS.map((shout, idx) => {
          const Icon = shout.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(shout.text)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#e2e8f0",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "0.72rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 242, 254, 0.15)";
                e.currentTarget.style.borderColor = "#00f2fe";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              <Icon size={12} />
              <span>{shout.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Input Bar */}
      <div
        style={{
          padding: "12px 18px 16px 18px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder={`Shout instructions to ${player.name}...`}
          style={{
            flex: 1,
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            color: "#fff",
            padding: "8px 12px",
            fontSize: "0.82rem",
            outline: "none",
          }}
        />
        <button
          onClick={() => handleSend()}
          style={{
            background: teamColor,
            border: "none",
            borderRadius: "8px",
            color: "#000",
            padding: "0 14px",
            fontWeight: "800",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.15s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
