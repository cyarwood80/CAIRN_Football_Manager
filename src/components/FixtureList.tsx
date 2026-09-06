// src/components/FixtureList.tsx
import React, { useState, useEffect } from "react";
import { Calendar, Play, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Full 38 Gameweeks for 20-club double round-robin
  const gameweeks = Array.from({ length: 38 }, (_, i) => i + 1);
  const gwFixtures = fixtures.filter((f) => f.gameweek === selectedGameweek);

  const handleTierChange = (tierKey: string) => {
    setSelectedTier(tierKey);
    if (onSelectTier) onSelectTier(tierKey);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
      {/* Header with Tier Tabs */}
      <div className="carbon-card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "4px",
              background: "var(--cds-green-light)",
              border: "1px solid var(--cds-green-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cds-green-primary)",
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)", margin: 0 }}>
              Championship League Fixture Schedule (38 Gameweeks)
            </h1>
            <span style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
              Full Double Round-Robin • Active Gameweek: <strong style={{ color: "var(--cds-green-primary)" }}>GW #{currentGameweek}</strong>
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
                borderRadius: "3px",
                border: selectedTier === t.key ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                background: selectedTier === t.key ? "var(--cds-layer-selected)" : "transparent",
                color: selectedTier === t.key ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
                fontSize: "12px",
                fontWeight: selectedTier === t.key ? "600" : "400",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gameweek Selector Bar (Scrollable 1 to 38) */}
      <div className="carbon-card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
            SELECT GAMEWEEK (1 — 38):
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedGameweek((prev) => Math.max(1, prev - 1))}
              disabled={selectedGameweek <= 1}
              style={{ height: "26px", padding: "0 8px", fontSize: "11px" }}
            >
              <ChevronLeft size={13} /> Prev GW
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedGameweek((prev) => Math.min(38, prev + 1))}
              disabled={selectedGameweek >= 38}
              style={{ height: "26px", padding: "0 8px", fontSize: "11px" }}
            >
              Next GW <ChevronRight size={13} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px" }}>
          {gameweeks.map((gw) => {
            const isSelected = selectedGameweek === gw;
            const isCurrent = gw === currentGameweek;
            return (
              <button
                key={gw}
                onClick={() => setSelectedGameweek(gw)}
                style={{
                  minWidth: "58px",
                  padding: "6px 8px",
                  borderRadius: "3px",
                  border: isSelected
                    ? "1px solid var(--cds-green-primary)"
                    : isCurrent
                    ? "1px solid var(--cds-amber)"
                    : "1px solid var(--cds-border)",
                  background: isSelected
                    ? "var(--cds-green-primary)"
                    : isCurrent
                    ? "var(--cds-amber-light)"
                    : "var(--cds-layer)",
                  color: isSelected
                    ? "#FFFFFF"
                    : isCurrent
                    ? "#B28600"
                    : "var(--cds-text-secondary)",
                  fontWeight: isSelected || isCurrent ? "700" : "500",
                  fontSize: "12px",
                  cursor: "pointer",
                  position: "relative",
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                GW {gw}
                {isCurrent && !isSelected && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-3px",
                      right: "-3px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--cds-amber)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixtures Grid for Selected Gameweek */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "14px" }}>
        {gwFixtures.map((fix) => {
          const isUserMatch =
            fix.homeTeam.toLowerCase().includes(userClubName.toLowerCase()) ||
            fix.awayTeam.toLowerCase().includes(userClubName.toLowerCase());
          const isUserHome = fix.homeTeam.toLowerCase().includes(userClubName.toLowerCase());
          const opponent = isUserHome ? fix.awayTeam : fix.homeTeam;

          return (
            <div
              key={fix.id}
              className="carbon-card"
              style={{
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderLeft: isUserMatch ? "3px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                background: isUserMatch ? "var(--cds-layer-selected)" : "var(--cds-surface)",
              }}
            >
              {/* Top metadata */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--cds-text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: "600", color: "var(--cds-text-secondary)" }}>Gameweek #{fix.gameweek}</span>
                  {isUserMatch && (
                    <span
                      className={isUserHome ? "badge badge-success" : "badge badge-info"}
                      style={{ fontSize: "10px", padding: "1px 6px" }}
                    >
                      {isUserHome ? "🏟️ HOME" : "✈️ AWAY"}
                    </span>
                  )}
                </div>
                {fix.played ? (
                  <span style={{ color: "var(--cds-green-primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={12} /> Full-Time
                  </span>
                ) : (
                  <span style={{ color: "var(--cds-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> Scheduled
                  </span>
                )}
              </div>

              {/* Match Scoreline / Teams */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                {/* Home Team */}
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontWeight: fix.homeTeam.toLowerCase().includes(userClubName.toLowerCase()) ? "700" : "500",
                    color: fix.homeTeam.toLowerCase().includes(userClubName.toLowerCase())
                      ? "var(--cds-green-primary)"
                      : "var(--cds-text-primary)",
                    fontSize: "14px",
                  }}
                >
                  {fix.homeTeam}
                </div>

                {/* Score or VS badge */}
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "3px",
                    background: fix.played ? "var(--cds-layer)" : "var(--cds-green-light)",
                    fontWeight: "700",
                    fontSize: "14px",
                    margin: "0 12px",
                    fontFamily: "var(--font-mono)",
                    color: fix.played ? "var(--cds-text-primary)" : "var(--cds-green-primary)",
                    border: "1px solid var(--cds-border)",
                  }}
                >
                  {fix.played ? `${fix.homeScore} - ${fix.awayScore}` : "VS"}
                </div>

                {/* Away Team */}
                <div
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontWeight: fix.awayTeam.toLowerCase().includes(userClubName.toLowerCase()) ? "700" : "500",
                    color: fix.awayTeam.toLowerCase().includes(userClubName.toLowerCase())
                      ? "var(--cds-green-primary)"
                      : "var(--cds-text-primary)",
                    fontSize: "14px",
                  }}
                >
                  {fix.awayTeam}
                </div>
              </div>

              {/* Bottom Play Action if scheduled and involves user */}
              {!fix.played && isUserMatch && (
                <div style={{ borderTop: "1px solid var(--cds-border-subtle)", paddingTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-primary"
                    style={{ height: "30px", padding: "0 14px", fontSize: "12px", gap: "6px" }}
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
