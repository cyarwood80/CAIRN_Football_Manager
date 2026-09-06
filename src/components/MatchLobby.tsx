// src/components/MatchLobby.tsx
import React, { useState } from "react";
import { Users, Play, Copy, Check, Swords, Bot, Globe, Sparkles } from "lucide-react";
import type { TeamConfig } from "../types";

interface MatchLobbyProps {
  roomCode: string | null;
  role: "host" | "guest" | "spectator" | null;
  homeTeam: TeamConfig | null;
  awayTeam: TeamConfig | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onStartScrimmage: (botPresetKey: string) => void;
  onStartMatch: () => void;
  onOpenShareModal: () => void;
}

export const MatchLobby: React.FC<MatchLobbyProps> = ({
  roomCode,
  role,
  homeTeam,
  awayTeam,
  onCreateRoom,
  onJoinRoom,
  onStartScrimmage,
  onStartMatch,
  onOpenShareModal,
}) => {
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* If not in a room yet */}
      {!roomCode ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Create or Join Room for Friends */}
          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={22} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Play with Friends</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Create a custom match room and share the room code or link with your friends to play head-to-head.
            </p>

            <button className="btn btn-primary" onClick={onCreateRoom} style={{ width: "100%", padding: "12px" }}>
              <Sparkles size={16} /> Host New Match Room
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "6px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>or join friend</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter Room Code (e.g. CUP-A49B)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              <button
                className="btn btn-secondary"
                disabled={!inputCode.trim()}
                onClick={() => onJoinRoom(inputCode.trim())}
              >
                Join
              </button>
            </div>

            {/* Instant Host Explainer */}
            <div
              style={{
                marginTop: "10px",
                background: "rgba(0, 242, 254, 0.05)",
                border: "1px solid rgba(0, 242, 254, 0.2)",
                borderRadius: "10px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={18} color="var(--accent-cyan)" />
                <span style={{ fontSize: "0.82rem", color: "#e2e8f0" }}>Want to host so anyone can access?</span>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                onClick={onOpenShareModal}
              >
                Hosting Guide
              </button>
            </div>
          </div>

          {/* Instant Scrimmage with AI Bots */}
          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Bot size={22} color="var(--accent-pink)" />
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Solo AI Scrimmage</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Test your club tactics immediately against legendary autonomous AI archetypes:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { key: "GEGENPRESS", name: "Klopp's Heavy Metal Gegenpress", color: "#ff3366", desc: "Suffocating high press & blitz counters" },
                { key: "TIKI_TAKA", name: "Pep's Tiki-Taka", color: "#00f2fe", desc: "Extreme possession & patient triangles" },
                { key: "LOW_BLOCK", name: "Mourinho's Iron Low Block", color: "#f59e0b", desc: "Park the bus & ruthless slide tackles" },
                { key: "SAMBA_FLAIR", name: "Samba Flair All-Stars", color: "#10b981", desc: "1v1 dribbles, tricks & long curlers" },
              ].map((bot) => (
                <button
                  key={bot.key}
                  className="btn btn-secondary"
                  onClick={() => onStartScrimmage(bot.key)}
                  style={{
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderLeft: `4px solid ${bot.color}`,
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "700", color: "#fff", fontSize: "0.9rem" }}>{bot.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{bot.desc}</div>
                  </div>
                  <Swords size={16} color={bot.color} />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* In-Room Matchday Staging */
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Room Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="badge badge-live">MATCH ROOM ACTIVE</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: "800", fontSize: "1.2rem", color: "var(--accent-cyan)" }}>
                  {roomCode}
                </span>
                <button
                  onClick={copyRoomCode}
                  className="btn btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                  title="Copy room code"
                >
                  {copied ? <Check size={13} color="var(--accent-green)" /> : <Copy size={13} />}
                </button>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                You are joined as <strong style={{ color: "#fff" }}>{role?.toUpperCase()}</strong>. Send the code to your friend to join.
              </p>
            </div>

            {role === "host" && (
              <button className="btn btn-primary" onClick={onStartMatch} style={{ padding: "12px 24px", fontSize: "1rem" }}>
                <Play size={18} /> Kick Off Match!
              </button>
            )}
          </div>

          {/* Teams Facing Off */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "20px", alignItems: "center" }}>
            {/* Host Club */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${homeTeam?.color || "var(--accent-cyan)"}44`,
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: homeTeam?.color || "var(--accent-cyan)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: "800", fontSize: "1.05rem" }}>{homeTeam?.name || "Host Team"}</div>
                  <span className="badge badge-ai" style={{ fontSize: "0.68rem" }}>HOME SQUAD</span>
                </div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "8px" }}>
                Formation: <strong>{homeTeam?.formation || "1-2-1"}</strong>
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>
                "{homeTeam?.prompt || "Balanced teamwork"}"
              </div>
            </div>

            {/* VS Badge */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "900",
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent-gold)",
                  fontSize: "1.1rem",
                }}
              >
                VS
              </div>
            </div>

            {/* Away Club */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${awayTeam?.color || "var(--accent-pink)"}44`,
                borderRadius: "12px",
                padding: "16px",
                textAlign: "right",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "1.05rem" }}>{awayTeam?.name || "Awaiting Opponent..."}</div>
                  <span className="badge badge-bot" style={{ fontSize: "0.68rem" }}>AWAY SQUAD</span>
                </div>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: awayTeam?.color || "var(--accent-pink)",
                  }}
                />
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "8px" }}>
                Formation: <strong>{awayTeam?.formation || "1-2-1"}</strong>
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>
                "{awayTeam?.prompt || "Awaiting rival coach instructions..."}"
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
