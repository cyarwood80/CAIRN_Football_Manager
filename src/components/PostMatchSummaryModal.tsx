// src/components/PostMatchSummaryModal.tsx
import React from "react";
import { Trophy, Award, X, RotateCcw } from "lucide-react";
import type { PostMatchSummary, GameSnapshot } from "../types";

interface PostMatchSummaryModalProps {
  summary: PostMatchSummary | null;
  gameState: GameSnapshot;
  isOpen?: boolean;
  onClose: () => void;
  onRematch?: () => void;
}

export const PostMatchSummaryModal: React.FC<PostMatchSummaryModalProps> = ({
  summary,
  gameState,
  isOpen = true,
  onClose,
  onRematch,
}) => {
  if (!isOpen || (!summary && gameState.phase !== "fulltime")) return null;

  const potm = summary?.playerOfTheMatch;
  const score = summary?.score || gameState.score;
  const homeTeam = gameState.homeTeam;
  const awayTeam = gameState.awayTeam;

  const homeWon = score.home > score.away;
  const awayWon = score.away > score.home;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
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
          width: "min(780px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "18px",
          padding: "28px",
          background: "linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(10, 14, 25, 0.99) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 242, 254, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.06)",
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

        {/* Header Title */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-gold)", fontWeight: "800", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <Trophy size={16} />
            <span>FULL TIME MATCH REPORT & PUNDIT ANALYSIS</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#fff", marginTop: "4px" }}>
            {homeWon ? `${homeTeam.name} Victory!` : awayWon ? `${awayTeam.name} Victory!` : "Honours Even in Thrilling Draw!"}
          </div>
        </div>

        {/* Master Scoreboard Ribbon */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "16px 20px",
            borderRadius: "12px",
            background: "rgba(0, 0, 0, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* Home */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: homeTeam.color,
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "1.1rem",
              }}
            >
              H
            </div>
            <div>
              <div style={{ fontWeight: "800", color: "#fff", fontSize: "1.05rem" }}>{homeTeam.name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{homeTeam.formation}</div>
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.4rem", fontWeight: "900", color: "#fff", lineHeight: 1 }}>
              {score.home} - {score.away}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: "700" }}>90' COMPLETED</span>
          </div>

          {/* Away */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "800", color: "#fff", fontSize: "1.05rem" }}>{awayTeam.name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{awayTeam.formation}</div>
            </div>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: awayTeam.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "1.1rem",
              }}
            >
              A
            </div>
          </div>
        </div>

        {/* Player of the Match Card */}
        {potm && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(20, 15, 3, 0.4) 100%)",
              border: "1px solid rgba(234, 179, 8, 0.4)",
              boxShadow: "0 0 25px rgba(234, 179, 8, 0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
                }}
              >
                <Award size={28} />
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#eab308", fontWeight: "800", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  PLAYER OF THE MATCH (POTM)
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#fff" }}>
                  {potm.name} ({potm.role})
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                  {potm.team === "home" ? homeTeam.name : awayTeam.name}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#34d399", fontFamily: "var(--font-mono)" }}>
                  {potm.rating.toFixed(1)}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Rating</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#fff", fontFamily: "var(--font-mono)" }}>
                  {potm.goals}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Goals</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#fff", fontFamily: "var(--font-mono)" }}>
                  {potm.assists}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Assists</div>
              </div>
            </div>
          </div>
        )}

        {/* Tactical Verdict & Critique */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: homeTeam.color, marginBottom: "4px" }}>
              {homeTeam.name} Critique
            </div>
            <div style={{ fontSize: "0.82rem", color: "#e2e8f0", lineHeight: "1.4" }}>
              {summary?.managerCritique?.home || `${homeTeam.name} showed commendable tactical resilience.`}
            </div>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: awayTeam.color, marginBottom: "4px" }}>
              {awayTeam.name} Critique
            </div>
            <div style={{ fontSize: "0.82rem", color: "#e2e8f0", lineHeight: "1.4" }}>
              {summary?.managerCritique?.away || `${awayTeam.name} exerted immense pressure on transitions.`}
            </div>
          </div>
        </div>

        {/* Key Turning Points Timeline */}
        {summary?.turningPoints && summary.turningPoints.length > 0 && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-cyan)", marginBottom: "8px" }}>
              KEY MATCH TURNING POINTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {summary.turningPoints.map((tp, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-gold)", fontWeight: "700", width: "24px" }}>
                    {tp.minute}'
                  </span>
                  <span style={{ color: "#fff" }}>{tp.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Bottom Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
          >
            Review Pitch & Squad
          </button>
          {onRematch && (
            <button
              onClick={onRematch}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                border: "none",
                color: "#000",
                fontWeight: "800",
                cursor: "pointer",
                fontSize: "0.82rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 0 15px rgba(0, 242, 254, 0.4)",
              }}
            >
              <RotateCcw size={14} />
              <span>Next Match / Rematch</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
