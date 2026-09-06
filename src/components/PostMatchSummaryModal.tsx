// src/components/PostMatchSummaryModal.tsx
import React from "react";
import { Award, X, RotateCcw } from "lucide-react";
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
        backgroundColor: "rgba(22, 22, 22, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "20px",
      }}
    >
      <div
        className="carbon-card"
        style={{
          width: "min(780px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.18)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "6px 8px",
            height: "auto",
          }}
        >
          <X size={16} />
        </button>

        {/* Header Title */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span className="badge badge-success" style={{ fontSize: "11px" }}>
              FULL TIME MATCH REPORT & PUNDIT ANALYSIS
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--cds-text-primary)", margin: "8px 0 0 0" }}>
            {homeWon ? `${homeTeam.name} Victory!` : awayWon ? `${awayTeam.name} Victory!` : "Honours Even in Thrilling Draw!"}
          </h1>
        </div>

        {/* Master Scoreboard Ribbon */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "16px 24px",
            borderRadius: "4px",
            background: "var(--cds-layer)",
            border: "1px solid var(--cds-border)",
          }}
        >
          {/* Home */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "4px",
                background: homeTeam.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              H
            </div>
            <div>
              <div style={{ fontWeight: "700", color: "var(--cds-text-primary)", fontSize: "15px" }}>{homeTeam.name}</div>
              <div style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>{homeTeam.formation}</div>
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "var(--cds-text-primary)", lineHeight: 1, fontFamily: "var(--font-mono)" }}>
              {score.home} - {score.away}
            </div>
            <span className="badge badge-neutral" style={{ fontSize: "10px", marginTop: "4px" }}>
              90' FULL TIME
            </span>
          </div>

          {/* Away */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "700", color: "var(--cds-text-primary)", fontSize: "15px" }}>{awayTeam.name}</div>
              <div style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>{awayTeam.formation}</div>
            </div>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "4px",
                background: awayTeam.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "14px",
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
              borderRadius: "4px",
              background: "var(--cds-green-light)",
              border: "1px solid var(--cds-green-primary)",
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
                  width: "44px",
                  height: "44px",
                  borderRadius: "4px",
                  background: "var(--cds-green-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--cds-green-primary)", fontWeight: "700", textTransform: "uppercase" }}>
                  PLAYER OF THE MATCH (POTM)
                </div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                  {potm.name} ({potm.role})
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--cds-green-primary)" }}>
                Match Rating: {potm.rating.toFixed(1)} / 10
              </div>
            </div>
          </div>
        )}

        {/* Key Pundit Observations & Tactical Analysis */}
        {((summary?.turningPoints && summary.turningPoints.length > 0) || summary?.tacticalVerdict) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--cds-text-muted)", textTransform: "uppercase" }}>
              Key Matchday Observations & Verdict
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {summary?.tacticalVerdict && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "var(--cds-layer)",
                    borderRadius: "3px",
                    border: "1px solid var(--cds-border)",
                    fontSize: "13px",
                    color: "var(--cds-text-primary)",
                    fontWeight: "500",
                  }}
                >
                  🎙️ <strong>Tactical Verdict:</strong> {summary.tacticalVerdict}
                </div>
              )}
              {summary?.turningPoints?.map((tp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    background: "var(--cds-layer)",
                    borderRadius: "3px",
                    border: "1px solid var(--cds-border)",
                    fontSize: "13px",
                    color: "var(--cds-text-secondary)",
                  }}
                >
                  ⏱️ <strong>{tp.minute}'</strong> — {tp.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--cds-border)", paddingTop: "16px" }}>
          {onRematch && (
            <button
              className="btn btn-secondary"
              onClick={onRematch}
              style={{ height: "38px", fontSize: "13px", gap: "6px" }}
            >
              <RotateCcw size={14} />
              <span>Rematch Scrimmage</span>
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ height: "38px", padding: "0 20px", fontSize: "13px" }}
          >
            Return to Hub
          </button>
        </div>
      </div>
    </div>
  );
};
