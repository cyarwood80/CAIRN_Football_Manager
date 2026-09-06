// src/components/FixtureList.tsx
import React, { useState, useEffect } from "react";
import { Calendar, Play, CheckCircle2, Clock } from "lucide-react";
import type { LeagueFixture } from "../types";

interface FixtureListProps {
  currentGameweek: number;
  userClubName: string;
  activeTier?: string;
  fixtures?: LeagueFixture[];
  onPlayFixture: (opponentName: string, isHome: boolean, gameweek: number) => void;
  onSelectTier?: (tierKey: string) => void;
}

const TIER_OPTIONS = [
  { key: "tier_1", label: "Premier Championship (T1)" },
  { key: "tier_2", label: "Division One (T2)" },
  { key: "tier_3", label: "Division Two (T3)" },
  { key: "tier_4", label: "National League (T4)" },
];

export const FixtureList: React.FC<FixtureListProps> = ({
  currentGameweek,
  userClubName,
  activeTier = "tier_4",
  fixtures: propFixtures,
  onPlayFixture,
  onSelectTier,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>(activeTier);
  const [selectedGameweek, setSelectedGameweek] = useState<number>(currentGameweek || 1);
  const [internalFixtures, setInternalFixtures] = useState<LeagueFixture[]>([]);

  useEffect(() => {
    setSelectedGameweek(currentGameweek || 1);
  }, [currentGameweek]);

  useEffect(() => {
    fetch(`/api/fixtures?tier=${selectedTier}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.fixtures) setInternalFixtures(data.fixtures);
      })
      .catch((err) => console.warn("Could not fetch fixtures:", err));
  }, [selectedTier, currentGameweek]);

  const fixtures = internalFixtures.length > 0 ? internalFixtures : propFixtures || [];

  // 19 Gameweeks for 20 clubs
  const gameweeks = Array.from({ length: 19 }, (_, i) => i + 1);
  const gwFixtures = fixtures.filter((f) => f.gameweek === selectedGameweek);

  const handleTierChange = (tierKey: string) => {
    setSelectedTier(tierKey);
    if (onSelectTier) onSelectTier(tierKey);
  };

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        background: "linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header with Tier Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(0, 229, 255, 0.15)", border: "1px solid #00E5FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={20} color="#00E5FF" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", margin: 0 }}>
              Championship League Fixture Schedule
            </h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Round-Robin Championship Season • Active Gameweek: <strong>GW #{currentGameweek}</strong>
            </span>
          </div>
        </div>

        {/* Tier Switcher Pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {TIER_OPTIONS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTierChange(t.key)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: selectedTier === t.key ? "1px solid #00E5FF" : "1px solid rgba(255, 255, 255, 0.08)",
                background: selectedTier === t.key ? "rgba(0, 229, 255, 0.15)" : "rgba(0, 0, 0, 0.3)",
                color: selectedTier === t.key ? "#00E5FF" : "var(--text-muted)",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gameweek Selector Pills */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", overflowX: "auto", paddingBottom: "4px" }}>
        {gameweeks.map((gw) => (
          <button
            key={gw}
            onClick={() => setSelectedGameweek(gw)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: `1px solid ${selectedGameweek === gw ? "#00E5FF" : "rgba(255, 255, 255, 0.08)"}`,
              background: selectedGameweek === gw ? "rgba(0, 229, 255, 0.15)" : "rgba(0, 0, 0, 0.3)",
              color: selectedGameweek === gw ? "#00E5FF" : gw === currentGameweek ? "#fbbf24" : "var(--text-muted)",
              fontWeight: "800",
              fontSize: "0.78rem",
              cursor: "pointer",
              position: "relative",
            }}
          >
            GW {gw}
            {gw === currentGameweek && (
              <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "7px", height: "7px", borderRadius: "50%", background: "#fbbf24" }} />
            )}
          </button>
        ))}
      </div>

      {/* Fixtures List for Selected Gameweek */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px" }}>
        {gwFixtures.map((fix) => {
          const isUserMatch = fix.homeTeam.toLowerCase().includes(userClubName.toLowerCase()) || fix.awayTeam.toLowerCase().includes(userClubName.toLowerCase());
          const isUserHome = fix.homeTeam.toLowerCase().includes(userClubName.toLowerCase());
          const opponent = isUserHome ? fix.awayTeam : fix.homeTeam;

          return (
            <div
              key={fix.id}
              className="glass-panel"
              style={{
                padding: "16px",
                borderRadius: "10px",
                border: `1px solid ${isUserMatch ? "rgba(0, 229, 255, 0.4)" : "rgba(255, 255, 255, 0.06)"}`,
                background: isUserMatch ? "linear-gradient(180deg, rgba(0, 229, 255, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%)" : "rgba(15, 23, 42, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Top metadata */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Gameweek #{fix.gameweek}</span>
                  {isUserMatch && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: "800",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        background: isUserHome ? "rgba(16, 185, 129, 0.2)" : "rgba(138, 63, 252, 0.2)",
                        color: isUserHome ? "#10b981" : "#c084fc",
                        border: `1px solid ${isUserHome ? "rgba(16, 185, 129, 0.4)" : "rgba(138, 63, 252, 0.4)"}`,
                      }}
                    >
                      {isUserHome ? "🏟️ HOME" : "✈️ AWAY"}
                    </span>
                  )}
                </div>
                {fix.played ? (
                  <span style={{ color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={12} /> Full-Time
                  </span>
                ) : (
                  <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> Scheduled
                  </span>
                )}
              </div>

              {/* Match Scoreline / Teams */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Home Team */}
                <div style={{ flex: 1, textAlign: "right", fontWeight: "700", color: fix.homeTeam.toLowerCase().includes(userClubName.toLowerCase()) ? "#00E5FF" : "#fff", fontSize: "0.9rem" }}>
                  {fix.homeTeam}
                </div>

                {/* Score or VS badge */}
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "6px",
                    background: fix.played ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 229, 255, 0.1)",
                    fontWeight: "900",
                    fontSize: "0.95rem",
                    margin: "0 12px",
                    fontFamily: "var(--font-mono)",
                    color: fix.played ? "#fff" : "#00E5FF",
                  }}
                >
                  {fix.played ? `${fix.homeScore} - ${fix.awayScore}` : "VS"}
                </div>

                {/* Away Team */}
                <div style={{ flex: 1, textAlign: "left", fontWeight: "700", color: fix.awayTeam.toLowerCase().includes(userClubName.toLowerCase()) ? "#00E5FF" : "#fff", fontSize: "0.9rem" }}>
                  {fix.awayTeam}
                </div>
              </div>

              {/* Bottom Play Action if scheduled and involves user */}
              {!fix.played && isUserMatch && (
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "6px 14px", fontSize: "0.78rem", gap: "6px" }}
                    onClick={() => onPlayFixture(opponent, isUserHome, fix.gameweek)}
                  >
                    <Play size={13} />
                    <span>Play This Match</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
